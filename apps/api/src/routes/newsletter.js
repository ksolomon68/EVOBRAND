const express = require('express');
const router = express.Router();
const pool = require('../db/connection');
// lazy load resend
// const resend = new Resend(process.env.EMAIL_API_KEY);
const { getEmailTemplate } = require('../utils/emailTemplate');

// @route POST /api/newsletter/subscribe
// @desc  Subscribe to newsletter
router.post('/subscribe', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  try {
    // Insert into database
    await pool.query(
      'INSERT INTO newsletter_subscribers (email) VALUES (?) ON DUPLICATE KEY UPDATE is_active = TRUE',
      [email]
    );

    // Sync with CRM
    try {
      // Find a list named 'Newsletter' or default to first list
      const [lists] = await pool.query('SELECT id FROM crm_lists WHERE name LIKE "%Newsletter%" LIMIT 1');
      let listId = 1;
      if (lists.length > 0) {
        listId = lists[0].id;
      } else {
        const [anyList] = await pool.query('SELECT id FROM crm_lists ORDER BY id ASC LIMIT 1');
        if (anyList.length > 0) {
          listId = anyList[0].id;
        }
      }

      await pool.query(
        'INSERT INTO crm_contacts (email, status, list_id) VALUES (?, "subscribed", ?) ON DUPLICATE KEY UPDATE status = "subscribed"',
        [email, listId]
      );
    } catch (crmError) {
      console.error('Failed to sync newsletter with CRM:', crmError);
    }

    // Send Welcome Email via Resend
    await require('resend').Resend(process.env.RESEND_API_KEY || process.env.EMAIL_API_KEY).emails.send({
      from: `"EVOBRAND" <${process.env.RESEND_FROM_EMAIL || process.env.EMAIL_FROM || 'info@evobrand.net'}>`,
      to: email,
      subject: 'Welcome to EVOBRAND Insider!',
      html: getEmailTemplate('Welcome to EVOBRAND Insider!', `
          <p>Hi there,</p>
          <p>Thank you for subscribing to our newsletter! You'll be the first to know about our latest insights on Enterprise AI, Accessibility, and elite Web Development.</p>
          <p>Stay tuned for our upcoming updates.</p>
          <br/>
          <p>Best regards,</p>
          <p><strong>Keisha Solomon & The EVOBRAND Team</strong></p>
      `)
    });

    res.status(200).json({ message: 'Successfully subscribed to the newsletter' });
  } catch (error) {
    console.error('Newsletter subscribe error:', error);
    res.status(500).json({ error: 'Server error while subscribing' });
  }
});

module.exports = router;
