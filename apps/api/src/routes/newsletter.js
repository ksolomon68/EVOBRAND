const express = require('express');
const router = express.Router();
const pool = require('../db/connection');
// lazy load resend
// const resend = new Resend(process.env.EMAIL_API_KEY);
const { getEmailTemplate } = require('../utils/emailTemplate');

// @route POST /api/newsletter/subscribe
// @desc  Subscribe to newsletter
router.post('/subscribe', async (req, res) => {
  const { name, email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  const trimmedName = (name || '').trim();
  const firstName = trimmedName ? trimmedName.split(/\s+/)[0] : null;
  const lastName = trimmedName && trimmedName.includes(' ')
    ? trimmedName.split(/\s+/).slice(1).join(' ')
    : null;

  try {
    // Insert into database
    await pool.query(
      'INSERT INTO newsletter_subscribers (email, name) VALUES (?, ?) ON DUPLICATE KEY UPDATE is_active = TRUE, name = COALESCE(VALUES(name), name)',
      [email, trimmedName || null]
    );

    // Sync with CRM
    try {
      // Find the newsletter list (case-insensitive) or default to first list
      const [lists] = await pool.query('SELECT id FROM crm_lists WHERE LOWER(name) LIKE "%newsletter%" LIMIT 1');
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
        'INSERT INTO crm_contacts (email, first_name, last_name, status, list_id) VALUES (?, ?, ?, "subscribed", ?) ON DUPLICATE KEY UPDATE status = "subscribed", first_name = COALESCE(VALUES(first_name), first_name), last_name = COALESCE(VALUES(last_name), last_name)',
        [email, firstName, lastName, listId]
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
          <p>Hi ${firstName || 'there'},</p>
          <p>Thank you for subscribing to our newsletter! You'll be the first to know about our latest insights on Enterprise AI, Accessibility, and elite Web Development.</p>
          <p>Stay tuned for our upcoming updates.</p>
          <br/>
          <p>Best regards,</p>
          <p><strong>Keisha Solomon & The EVOBRAND Team</strong></p>
      `, null, null, email)
    });

    res.status(200).json({ message: 'Successfully subscribed to the newsletter' });
  } catch (error) {
    console.error('Newsletter subscribe error:', error);
    res.status(500).json({ error: 'Server error while subscribing' });
  }
});

// @route GET /api/newsletter/unsubscribe
// @desc  One-click unsubscribe from newsletter (linked from every email footer)
router.get('/unsubscribe', async (req, res) => {
  const { email } = req.query;

  if (!email) {
    return res.status(400).send(`<!DOCTYPE html><html><head><title>Unsubscribe</title></head><body style="font-family:sans-serif;text-align:center;padding:60px;background:#0f1419;color:#fff"><p style="color:#f87171">Invalid unsubscribe link.</p></body></html>`);
  }

  try {
    // Mark inactive in newsletter_subscribers
    await pool.query('UPDATE newsletter_subscribers SET is_active = FALSE WHERE email = ?', [email]);

    // Remove from CRM newsletter list entirely (case-insensitive match)
    await pool.query(`
      DELETE cc FROM crm_contacts cc
      JOIN crm_lists l ON cc.list_id = l.id AND LOWER(l.name) LIKE '%newsletter%'
      WHERE cc.email = ?
    `, [email]);

    res.send(`<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Unsubscribed — EVOBRAND</title>
  <style>
    body { margin:0; background:#0f1419; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; display:flex; align-items:center; justify-content:center; min-height:100vh; }
    .card { max-width:420px; width:90%; text-align:center; padding:48px 32px; background:#1a2332; border-radius:20px; border:1px solid rgba(34,200,229,0.15); }
    .icon { width:56px; height:56px; border-radius:50%; background:rgba(34,200,229,0.1); border:2px solid #22c8e5; display:flex; align-items:center; justify-content:center; margin:0 auto 24px; font-size:24px; }
    h1 { color:#fff; font-size:1.5rem; margin:0 0 12px; }
    p { color:rgba(255,255,255,0.55); font-size:0.95rem; line-height:1.6; margin:0 0 24px; }
    a { display:inline-block; padding:12px 28px; background:#22c8e5; color:#003258; border-radius:12px; font-weight:700; text-decoration:none; font-size:0.9rem; }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">✓</div>
    <h1>You've been unsubscribed</h1>
    <p>We've removed <strong style="color:#22c8e5">${email}</strong> from our mailing list. You won't receive any more emails from us.</p>
    <a href="https://evobrand.net">Return to EVOBRAND</a>
  </div>
</body>
</html>`);
  } catch (err) {
    console.error('Unsubscribe error:', err);
    res.status(500).send(`<!DOCTYPE html><html><head><title>Error</title></head><body style="font-family:sans-serif;text-align:center;padding:60px;background:#0f1419;color:#fff"><p style="color:#f87171">Something went wrong. Please try again or contact info@evobrand.net.</p></body></html>`);
  }
});

module.exports = router;
