const express = require('express');
const router = express.Router();
const pool = require('../db/connection');
const { Resend } = require('resend');
const getResend = () => new Resend(process.env.RESEND_API_KEY || process.env.EMAIL_API_KEY || 're_placeholder');
const { getEmailTemplate } = require('../utils/emailTemplate');

const SITE_URL = process.env.SITE_URL || 'https://evobrandconcepts.com';

// Run list migrations on startup
(async () => {
  try {
    // Ensure "Customers" list exists (create only if missing)
    await pool.query(`
      INSERT INTO crm_lists (name)
      SELECT 'Customers' FROM DUAL
      WHERE NOT EXISTS (SELECT 1 FROM crm_lists WHERE name = 'Customers')
    `);

    // Deduplicate newsletter lists: keep the one with the most contacts (the original),
    // merge all others into it, then delete the duplicates.
    // Uses LOWER() to catch any case variation (EVOBRAND Newsletter, Evobrand newsletter, Newsletter Admin, etc.)
    const [allNlLists] = await pool.query(
      `SELECT l.id, l.name, COUNT(c.id) AS cnt
       FROM crm_lists l
       LEFT JOIN crm_contacts c ON c.list_id = l.id
       WHERE LOWER(l.name) LIKE '%newsletter%'
       GROUP BY l.id, l.name
       ORDER BY cnt DESC, l.id ASC`
    );
    if (allNlLists.length > 1) {
      const keepId = allNlLists[0].id; // the one with the most contacts
      for (const dup of allNlLists.slice(1)) {
        // Move contacts from the duplicate into the keeper (skip duplicates)
        await pool.query(`
          DELETE c1 FROM crm_contacts c1
          INNER JOIN crm_contacts c2 ON c1.email = c2.email AND c2.list_id = ?
          WHERE c1.list_id = ?
        `, [keepId, dup.id]);
        await pool.query(`UPDATE crm_contacts SET list_id = ? WHERE list_id = ?`, [keepId, dup.id]);
        await pool.query(`DELETE FROM crm_lists WHERE id = ?`, [dup.id]);
      }
    } else if (allNlLists.length === 0) {
      // No newsletter list at all — create one
      await pool.query(`INSERT INTO crm_lists (name) VALUES ('EVOBRAND Newsletter')`);
    }

    // Rename any leftover "Newsletter Admin" placeholder to the canonical name
    await pool.query(`UPDATE crm_lists SET name = 'EVOBRAND Newsletter' WHERE name = 'Newsletter Admin'`);

    // Ensure "Leads" list exists
    await pool.query(`
      INSERT INTO crm_lists (name)
      SELECT 'Leads' FROM DUAL
      WHERE NOT EXISTS (SELECT 1 FROM crm_lists WHERE name = 'Leads')
    `);

    // Merge any "Customer" or "Custom" list into "Customers" then delete it
    const [[{ customersId }]] = await pool.query(
      `SELECT id AS customersId FROM crm_lists WHERE name = 'Customers' LIMIT 1`
    );
    for (const badName of ['Customer', 'Custom']) {
      const [rows] = await pool.query(
        `SELECT id FROM crm_lists WHERE name = ? LIMIT 1`, [badName]
      );
      if (!rows.length) continue;
      const badId = rows[0].id;
      await pool.query(`
        DELETE c1 FROM crm_contacts c1
        INNER JOIN crm_contacts c2 ON c1.email = c2.email AND c2.list_id = ?
        WHERE c1.list_id = ?
      `, [customersId, badId]);
      await pool.query(
        `UPDATE crm_contacts SET list_id = ? WHERE list_id = ?`, [customersId, badId]
      );
      await pool.query(`DELETE FROM crm_lists WHERE id = ?`, [badId]);
    }

    // Move newsletter-only subscribers OUT of Customers → EVOBRAND Newsletter.
    const [nlRows] = await pool.query(`SELECT id FROM crm_lists WHERE LOWER(name) LIKE '%newsletter%' LIMIT 1`);
    if (nlRows.length > 0) {
      const nlId = nlRows[0].id;
      await pool.query(`
        INSERT INTO crm_contacts (email, list_id, status)
        SELECT ns.email, ?, 'subscribed'
        FROM newsletter_subscribers ns
        JOIN crm_contacts cc ON ns.email = cc.email
        JOIN crm_lists l ON cc.list_id = l.id AND l.name = 'Customers'
        ON DUPLICATE KEY UPDATE status = 'subscribed'
      `, [nlId]);
      await pool.query(`
        DELETE cc FROM crm_contacts cc
        JOIN newsletter_subscribers ns ON cc.email = ns.email
        JOIN crm_lists l ON cc.list_id = l.id AND l.name = 'Customers'
      `);
    }

    // Remove from every other CRM list anyone who is a confirmed Customer
    // (real customers added via contract, ticket, or plan — not newsletter migration)
    await pool.query(`
      DELETE c1 FROM crm_contacts c1
      JOIN crm_contacts c2 ON c1.email = c2.email
      JOIN crm_lists l ON c2.list_id = l.id AND l.name = 'Customers'
      WHERE c1.list_id != c2.list_id
    `);
  } catch (err) {
    console.error('Could not run list migrations:', err.message);
  }
})();

// Add target_list_ids column if missing (supports multi-list campaigns)
(async () => {
  try {
    await pool.query(`ALTER TABLE crm_campaigns ADD COLUMN IF NOT EXISTS target_list_ids TEXT DEFAULT NULL`);
  } catch (err) {
    console.error('Could not add target_list_ids column:', err.message);
  }
})();

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

// --- ADMIN CLEANUP ---
router.post('/admin/cleanup-lists', async (req, res) => {
  try {
    // Step 1: Move newsletter subscribers out of Customers → EVOBRAND Newsletter
    const [nlRows] = await pool.query(`SELECT id, name FROM crm_lists WHERE LOWER(name) LIKE '%newsletter%' LIMIT 1`);
    let moved = 0;
    if (nlRows.length > 0) {
      const nlId = nlRows[0].id;
      await pool.query(`
        INSERT INTO crm_contacts (email, list_id, status)
        SELECT ns.email, ?, 'subscribed'
        FROM newsletter_subscribers ns
        JOIN crm_contacts cc ON ns.email = cc.email
        JOIN crm_lists l ON cc.list_id = l.id AND l.name = 'Customers'
        ON DUPLICATE KEY UPDATE status = 'subscribed'
      `, [nlId]);
      const [del] = await pool.query(`
        DELETE cc FROM crm_contacts cc
        JOIN newsletter_subscribers ns ON cc.email = ns.email
        JOIN crm_lists l ON cc.list_id = l.id AND l.name = 'Customers'
      `);
      moved = del.affectedRows;
    }

    // Step 2: Remove from other lists anyone confirmed in Customers
    const [dedup] = await pool.query(`
      DELETE c1 FROM crm_contacts c1
      JOIN crm_contacts c2 ON c1.email = c2.email
      JOIN crm_lists l ON c2.list_id = l.id AND l.name = 'Customers'
      WHERE c1.list_id != c2.list_id
    `);

    const nlName = nlRows.length > 0 ? nlRows[0].name : 'newsletter list';
    res.json({ success: true, message: `Moved ${moved} newsletter subscriber(s) to ${nlName}. Removed ${dedup.affectedRows} duplicate(s) from other lists.` });
  } catch (err) {
    console.error('Cleanup error:', err);
    res.status(500).json({ error: err.message });
  }
});

// --- LISTS ---
// Get all lists
router.get('/lists', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT l.*, COUNT(c.id) AS contact_count
      FROM crm_lists l
      LEFT JOIN crm_contacts c ON c.list_id = l.id AND c.status = 'subscribed'
      GROUP BY l.id
      ORDER BY l.id ASC
    `);
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

// Update a contact (list, name)
router.put('/contacts/:id', async (req, res) => {
  const { id } = req.params;
  const { first_name, last_name, list_id } = req.body;
  if (!list_id) {
    return res.status(400).json({ error: 'List ID is required' });
  }
  try {
    await pool.query(
      'UPDATE crm_contacts SET first_name = ?, last_name = ?, list_id = ? WHERE id = ?',
      [first_name || null, last_name || null, list_id, id]
    );
    res.json({ success: true, message: 'Contact updated successfully' });
  } catch (error) {
    console.error('Error updating CRM contact:', error);
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
  const { subject, html_content, target_list_ids } = req.body;
  const listIds = Array.isArray(target_list_ids) ? target_list_ids : [];
  if (!subject || !html_content || !listIds.length) {
    return res.status(400).json({ error: 'Subject, content, and at least one list are required' });
  }
  try {
    const [result] = await pool.query(
      'INSERT INTO crm_campaigns (subject, html_content, list_id, target_list_ids, status) VALUES (?, ?, ?, ?, "draft")',
      [subject, html_content, listIds[0], JSON.stringify(listIds)]
    );
    res.json({ success: true, id: result.insertId, message: 'Campaign saved as draft' });
  } catch (error) {
    console.error('Error creating CRM campaign:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update a draft campaign
router.put('/campaigns/:id', async (req, res) => {
  const { id } = req.params;
  const { subject, html_content, target_list_ids } = req.body;
  const listIds = Array.isArray(target_list_ids) ? target_list_ids : [];
  if (!subject || !html_content || !listIds.length) {
    return res.status(400).json({ error: 'Subject, content, and at least one list are required' });
  }
  try {
    const [rows] = await pool.query('SELECT status FROM crm_campaigns WHERE id = ?', [id]);
    if (!rows.length) return res.status(404).json({ error: 'Campaign not found' });
    if (rows[0].status !== 'draft') return res.status(400).json({ error: 'Only draft campaigns can be edited' });
    await pool.query(
      'UPDATE crm_campaigns SET subject = ?, html_content = ?, list_id = ?, target_list_ids = ? WHERE id = ?',
      [subject, html_content, listIds[0], JSON.stringify(listIds), id]
    );
    res.json({ success: true, message: 'Campaign updated' });
  } catch (error) {
    console.error('Error updating campaign:', error);
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

// Send a campaign — one individual email per subscriber for deliverability and accurate tracking
router.post('/campaigns/:id/send', async (req, res) => {
  const { id } = req.params;

  try {
    const [campaignRows] = await pool.query('SELECT * FROM crm_campaigns WHERE id = ? AND status = "draft"', [id]);
    if (campaignRows.length === 0) {
      return res.status(404).json({ error: 'Campaign not found or already sent' });
    }
    const campaign = campaignRows[0];

    const listIds = campaign.target_list_ids
      ? JSON.parse(campaign.target_list_ids)
      : [campaign.list_id];
    const placeholders = listIds.map(() => '?').join(',');
    const [contacts] = await pool.query(
      `SELECT DISTINCT email FROM crm_contacts WHERE list_id IN (${placeholders}) AND status = 'subscribed'`,
      listIds
    );
    if (contacts.length === 0) {
      return res.status(400).json({ error: 'No active subscribers found in the selected lists' });
    }

    const emails = contacts.map(c => c.email);

    // Send via Resend Batch API — up to 100 per request, individual sends per subscriber
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

    await pool.query('UPDATE crm_campaigns SET status = "sent", sent_at = CURRENT_TIMESTAMP WHERE id = ?', [id]);

    res.json({ success: true, message: `Campaign sent successfully to ${emails.length} subscriber${emails.length !== 1 ? 's' : ''}` });
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
