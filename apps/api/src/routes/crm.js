const express = require('express');
const router = express.Router();
const pool = require('../db/connection');
const { Resend } = require('resend');
const getResend = () => new Resend(process.env.RESEND_API_KEY || process.env.EMAIL_API_KEY || 're_placeholder');
const { getEmailTemplate } = require('../utils/emailTemplate');

const SITE_URL = process.env.SITE_URL || 'https://evobrandconcepts.com';

// Ensure the tracking events table exists on startup
(async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS crm_campaign_events (
        id INT AUTO_INCREMENT PRIMARY KEY,
        campaign_id INT NOT NULL,
        event_type ENUM('open', 'click') NOT NULL,
        url VARCHAR(2048) NULL,
        ip VARCHAR(64) NULL,
        user_agent TEXT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_campaign_id (campaign_id),
        INDEX idx_event_type (event_type)
      )
    `);
  } catch (err) {
    console.error('Could not create crm_campaign_events table:', err.message);
  }
})();

// --- LISTS ---
// Get all lists
router.get('/lists', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM crm_lists ORDER BY id ASC');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching CRM lists:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// --- CONTACTS ---
// Get contacts, optionally filter by list_id
router.get('/contacts', async (req, res) => {
  const { list_id } = req.query;
  try {
    let query = `
      SELECT c.*, l.name as list_name 
      FROM crm_contacts c 
      JOIN crm_lists l ON c.list_id = l.id
    `;
    const params = [];
    
    if (list_id) {
      query += ' WHERE c.list_id = ?';
      params.push(list_id);
    }
    
    query += ' ORDER BY c.created_at DESC';
    
    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching CRM contacts:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add a new contact
router.post('/contacts', async (req, res) => {
  const { email, first_name, last_name, list_id } = req.body;
  
  if (!email || !list_id) {
    return res.status(400).json({ error: 'Email and List ID are required' });
  }
  
  try {
    await pool.query(
      'INSERT INTO crm_contacts (email, first_name, last_name, list_id) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE first_name = VALUES(first_name), last_name = VALUES(last_name), status = "subscribed"',
      [email, first_name || null, last_name || null, list_id]
    );
    res.json({ success: true, message: 'Contact added successfully' });
  } catch (error) {
    console.error('Error adding CRM contact:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete a contact
router.delete('/contacts/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM crm_contacts WHERE id = ?', [id]);
    res.json({ success: true, message: 'Contact deleted successfully' });
  } catch (error) {
    console.error('Error deleting CRM contact:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// --- TRACKING ---

// 1x1 transparent GIF bytes
const PIXEL_GIF = Buffer.from(
  'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
  'base64'
);

// Track open: GET /api/crm/track/open?cid=123
router.get('/track/open', async (req, res) => {
  const { cid } = req.query;
  if (cid) {
    try {
      await pool.query(
        'INSERT INTO crm_campaign_events (campaign_id, event_type, ip, user_agent) VALUES (?, "open", ?, ?)',
        [cid, req.ip || null, (req.headers['user-agent'] || '').substring(0, 500)]
      );
    } catch (err) {
      // Silent fail — never block email rendering
    }
  }
  res.set({
    'Content-Type': 'image/gif',
    'Content-Length': PIXEL_GIF.length,
    'Cache-Control': 'no-store, no-cache, must-revalidate',
    Pragma: 'no-cache',
  });
  res.end(PIXEL_GIF);
});

// Track click: GET /api/crm/track/click?cid=123&url=https%3A%2F%2F...
router.get('/track/click', async (req, res) => {
  const { cid, url } = req.query;
  if (cid && url) {
    try {
      await pool.query(
        'INSERT INTO crm_campaign_events (campaign_id, event_type, url, ip, user_agent) VALUES (?, "click", ?, ?, ?)',
        [cid, url.substring(0, 2048), req.ip || null, (req.headers['user-agent'] || '').substring(0, 500)]
      );
    } catch (err) {
      // Silent fail
    }
  }
  const destination = url && url.startsWith('http') ? url : SITE_URL;
  res.redirect(302, destination);
});

// --- CAMPAIGNS ---

// Get all campaigns with open/click stats
router.get('/campaigns', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT c.*, l.name as list_name,
        COALESCE(SUM(CASE WHEN e.event_type = 'open'  THEN 1 ELSE 0 END), 0) AS open_count,
        COALESCE(SUM(CASE WHEN e.event_type = 'click' THEN 1 ELSE 0 END), 0) AS click_count
      FROM crm_campaigns c
      LEFT JOIN crm_lists l ON c.list_id = l.id
      LEFT JOIN crm_campaign_events e ON e.campaign_id = c.id
      GROUP BY c.id
      ORDER BY c.created_at DESC
    `);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching CRM campaigns:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create a new campaign (draft)
router.post('/campaigns', async (req, res) => {
  const { subject, html_content, list_id } = req.body;
  
  if (!subject || !html_content || !list_id) {
    return res.status(400).json({ error: 'Subject, Content, and List ID are required' });
  }
  
  try {
    const [result] = await pool.query(
      'INSERT INTO crm_campaigns (subject, html_content, list_id, status) VALUES (?, ?, ?, "draft")',
      [subject, html_content, list_id]
    );
    res.json({ success: true, id: result.insertId, message: 'Campaign saved as draft' });
  } catch (error) {
    console.error('Error creating CRM campaign:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete a campaign (any status)
router.delete('/campaigns/:id', async (req, res) => {
  const { id } = req.params;
  try {
    // Also remove tracking events for this campaign
    await pool.query('DELETE FROM crm_campaign_events WHERE campaign_id = ?', [id]);
    const [result] = await pool.query('DELETE FROM crm_campaigns WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Campaign not found' });
    }
    res.json({ success: true, message: 'Campaign deleted successfully' });
  } catch (error) {
    console.error('Error deleting CRM campaign:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Send a campaign
router.post('/campaigns/:id/send', async (req, res) => {
  const { id } = req.params;
  
  try {
    // 1. Get the campaign
    const [campaignRows] = await pool.query('SELECT * FROM crm_campaigns WHERE id = ? AND status = "draft"', [id]);
    if (campaignRows.length === 0) {
      return res.status(404).json({ error: 'Campaign not found or already sent' });
    }
    const campaign = campaignRows[0];
    
    // 2. Get the subscribers for that list
    const [contacts] = await pool.query('SELECT * FROM crm_contacts WHERE list_id = ? AND status = "subscribed"', [campaign.list_id]);
    
    if (contacts.length === 0) {
      return res.status(400).json({ error: 'No active subscribers found in this list' });
    }
    
    const emails = contacts.map(c => c.email);
    
    // 3. Send emails using Resend Batch API
    // Resend batch sending allows up to 100 emails per API request
    const batchSize = 100;
    for (let i = 0; i < emails.length; i += batchSize) {
      const emailChunk = emails.slice(i, i + batchSize);
      const batchPayload = emailChunk.map(email => ({
        from: `"EVOBRAND" <${process.env.RESEND_FROM_EMAIL || 'info@evobrand.net'}>`,
        to: [email],
        subject: campaign.subject,
        html: getEmailTemplate(campaign.subject, campaign.html_content, campaign.id, SITE_URL),
      }));
      await getResend().batch.send(batchPayload);
    }
    
    // 4. Mark campaign as sent
    await pool.query('UPDATE crm_campaigns SET status = "sent", sent_at = CURRENT_TIMESTAMP WHERE id = ?', [id]);
    
    res.json({ success: true, message: `Campaign sent successfully to ${emails.length} subscribers` });
  } catch (error) {
    console.error('Error sending CRM campaign:', error);
    res.status(500).json({ error: 'Failed to send campaign', details: error.message });
  }
});

// Preview a campaign (sends only to admin, no tracking injected)
router.post('/campaigns/:id/preview', async (req, res) => {
  const { id } = req.params;
  
  try {
    // 1. Get the campaign
    const [campaignRows] = await pool.query('SELECT * FROM crm_campaigns WHERE id = ?', [id]);
    if (campaignRows.length === 0) {
      return res.status(404).json({ error: 'Campaign not found' });
    }
    const campaign = campaignRows[0];
    
    const adminEmail = process.env.RESEND_FROM_EMAIL || process.env.ADMIN_EMAIL || 'info@evobrand.net';

    // 2. Send email only to the admin — no tracking pixel on preview
    await getResend().emails.send({
      from: `"EVOBRAND" <${process.env.RESEND_FROM_EMAIL || 'info@evobrand.net'}>`,
      to: [adminEmail],
      subject: `[PREVIEW] ${campaign.subject}`,
      html: getEmailTemplate(`[PREVIEW] ${campaign.subject}`, campaign.html_content),
    });
    
    // Status is NOT updated to 'sent'
    res.json({ success: true, message: `Preview sent successfully to ${adminEmail}` });
  } catch (error) {
    console.error('Error sending CRM campaign preview:', error);
    res.status(500).json({ error: 'Failed to send preview', details: error.message });
  }
});

module.exports = router;
