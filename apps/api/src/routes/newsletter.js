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

    // Send Welcome Email via Resend
    await require('resend').Resend(process.env.RESEND_API_KEY || process.env.EMAIL_API_KEY).emails.send({
      from: `"EVOBRAND Insider" <${process.env.EMAIL_FROM || 'support@evobrand.net'}>`,
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
