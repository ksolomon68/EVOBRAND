const express = require('express');
const router = express.Router();
const pool = require('../db/connection');
const { Resend } = require('resend');
const { getEmailTemplate } = require('../utils/emailTemplate');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { notifyAdmins } = require('../utils/notifications');

const getResend = () => new Resend(process.env.RESEND_API_KEY || 're_placeholder');

const ensureTable = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS contact_submissions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      service VARCHAR(255),
      message TEXT NOT NULL,
      status ENUM('new', 'read', 'archived') DEFAULT 'new',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
};

// @route POST /api/contacts/submit
// @desc  Submit a public contact form
router.post('/submit', async (req, res) => {
  const { name, email, subject, message, subscribeNewsletter } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Name, email, and message are required' });
  }

  try {
    await ensureTable();

    // 1. Insert into contact_submissions
    const [result] = await pool.query(
      'INSERT INTO contact_submissions (name, email, service, message) VALUES (?, ?, ?, ?)',
      [name, email, subject || 'General Inquiry', message]
    );

    // 2. Handle Newsletter Opt-in
    if (subscribeNewsletter) {
      try {
        const nameParts = (name || '').split(' ');
        const first_name = nameParts[0] || '';
        const last_name = nameParts.slice(1).join(' ') || '';
        await pool.query(
          'INSERT INTO crm_contacts (email, first_name, last_name, list_id, status) VALUES (?, ?, ?, ?, "subscribed") ON DUPLICATE KEY UPDATE status = "subscribed"',
          [email, first_name, last_name, 1]
        );
      } catch (crmErr) {
        console.error('Failed to add to CRM:', crmErr);
      }
    }

    // 3. Send Email Notifications
    try {
      // To Admin
      await getResend().emails.send({
        from: `"EVOBRAND Website" <${process.env.RESEND_FROM_EMAIL || 'info@evobrand.net'}>`,
        to: ['info@evobrand.net', 'ksolomon68@gmail.com'],
        subject: `New Contact Form: ${subject || 'General Inquiry'}`,
        html: getEmailTemplate(`New Contact Form: ${subject || 'General Inquiry'}`, `
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Message:</strong><br/>${message.replace(/\\n/g, '<br/>')}</p>
        `)
      });
      // To User
      await getResend().emails.send({
        from: `"EVOBRAND" <${process.env.RESEND_FROM_EMAIL || 'info@evobrand.net'}>`,
        to: email,
        subject: `We received your message`,
        html: getEmailTemplate(`We received your message`, `
          <p>Hi ${name},</p>
          <p>Thank you for reaching out to EVOBRAND. We have successfully received your message regarding <strong>${subject || 'General Inquiry'}</strong>.</p>
          <p>Our team will review your inquiry and get back to you within 1 business day.</p>
        `)
      });
    } catch (emailErr) {
      console.error('Email notification failed:', emailErr);
    }

    // 4. In-App Notification to Admins
    await notifyAdmins(
      'New Contact Form',
      `${name} submitted a new inquiry.`,
      '/admin',
      'user'
    ).catch(() => {});

    res.status(201).json({ success: true, message: 'Contact form submitted successfully' });
  } catch (error) {
    console.error('Contact submission error:', error);
    res.status(500).json({ error: 'Server error while submitting form' });
  }
});

// @route GET /api/contacts
// @desc  Get all contact form submissions (Admins only)
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    await ensureTable();
    const [rows] = await pool.query('SELECT * FROM contact_submissions ORDER BY created_at DESC');
    res.json(rows);
  } catch (error) {
    console.error('Fetch contacts error:', error);
    res.status(500).json({ error: 'Failed to fetch contact submissions' });
  }
});

// @route PUT /api/contacts/:id/status
// @desc  Update status of a contact submission
router.put('/:id/status', authenticateToken, requireAdmin, async (req, res) => {
  const { status } = req.body;
  if (!['new', 'read', 'archived'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }
  
  try {
    await pool.query('UPDATE contact_submissions SET status = ? WHERE id = ?', [status, req.params.id]);
    res.json({ success: true });
  } catch (error) {
    console.error('Update contact status error:', error);
    res.status(500).json({ error: 'Failed to update status' });
  }
});

module.exports = router;
