const express = require('express');
const router = express.Router();
const pool = require('../db/connection');
const { Resend } = require('resend');
const getResend = () => new Resend(process.env.RESEND_API_KEY || 're_placeholder');
const { getEmailTemplate } = require('../utils/emailTemplate');

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

// --- CAMPAIGNS ---
// Get all campaigns
router.get('/campaigns', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT c.*, l.name as list_name 
      FROM crm_campaigns c 
      LEFT JOIN crm_lists l ON c.list_id = l.id
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
    
    // 3. Send emails
    await getResend().emails.send({
      from: `"EVOBRAND" <${process.env.RESEND_FROM_EMAIL || 'info@evobrand.net'}>`,
      to: ['info@evobrand.net'], // Resend requires at least one 'to' address
      bcc: emails, // Send as BCC so recipients don't see each other
      subject: campaign.subject, // Subject line
      html: getEmailTemplate(campaign.subject, campaign.html_content), // html body
    });
    
    // 4. Mark campaign as sent
    await pool.query('UPDATE crm_campaigns SET status = "sent", sent_at = CURRENT_TIMESTAMP WHERE id = ?', [id]);
    
    res.json({ success: true, message: `Campaign sent successfully to ${emails.length} subscribers` });
  } catch (error) {
    console.error('Error sending CRM campaign:', error);
    res.status(500).json({ error: 'Failed to send campaign', details: error.message });
  }
});

module.exports = router;
