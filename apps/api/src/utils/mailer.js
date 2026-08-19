const nodemailer = require('nodemailer');
const { Resend } = require('resend');

// ─── SMTP Transporter ─────────────────────────────────────────────────────────
// Port 465  → implicit TLS   (SMTP_SECURE=true)
// Port 587  → STARTTLS       (SMTP_SECURE=false, nodemailer upgrades automatically)
// Port 25   → plain/legacy   (rarely works on shared hosting)
//
// cPanel shared hosts commonly block outbound 465 from app processes; 587 is
// the recommended port for authenticated submission and almost always open.
// If SMTP_SECURE is not explicitly set we auto-detect based on port.

let transporter = null;

function buildTransporter() {
  const host    = process.env.SMTP_HOST;
  const port    = parseInt(process.env.SMTP_PORT || '587', 10);
  // Auto-detect: port 465 → implicit TLS, everything else → STARTTLS
  const secure  = process.env.SMTP_SECURE !== undefined
    ? process.env.SMTP_SECURE === 'true'
    : port === 465;

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    // Tolerate self-signed / hostname-mismatch certs common on shared hosts.
    // Remove if your host has a valid cert and you want strict validation.
    tls: { rejectUnauthorized: false },
    // Give the remote server 15 s to respond before timing out.
    connectionTimeout: 15000,
    greetingTimeout:   10000,
    socketTimeout:     15000,
  });
}

if (process.env.SMTP_HOST) {
  transporter = buildTransporter();

  // Verify the connection at startup so any misconfiguration surfaces in the
  // server log immediately rather than silently swallowing the first email.
  transporter.verify((err) => {
    if (err) {
      console.error(
        `[mailer] ❌ SMTP connection FAILED — host=${process.env.SMTP_HOST} ` +
        `port=${process.env.SMTP_PORT} secure=${process.env.SMTP_SECURE}\n`,
        err.message
      );
    } else {
      console.log(
        `[mailer] ✅ SMTP ready — host=${process.env.SMTP_HOST} ` +
        `port=${process.env.SMTP_PORT}`
      );
    }
  });
}

// ─── Resend fallback ──────────────────────────────────────────────────────────
const resend = new Resend(process.env.RESEND_API_KEY || 're_placeholder');

/**
 * sendEmail
 * Sends an email using SMTP (Nodemailer) when SMTP_HOST is configured,
 * otherwise falls back to Resend.
 *
 * @param {Object}          options
 * @param {string}          options.from    Sender address
 * @param {string|string[]} options.to      Recipient email(s)
 * @param {string}          options.subject Email subject
 * @param {string}          options.html    HTML body
 * @returns {Promise<Object>}
 */
async function sendEmail({ from, to, subject, html }) {
  const recipients  = Array.isArray(to) ? to : [to];
  const fromAddress = from || process.env.RESEND_FROM_EMAIL || 'info@evobrand.net';

  if (process.env.SMTP_HOST) {
    // Lazily build transporter if env wasn't set at module-load time.
    if (!transporter) transporter = buildTransporter();

    try {
      const info = await transporter.sendMail({
        from:    fromAddress,
        to:      recipients.join(', '),
        subject,
        html,
      });
      console.log(`[mailer] ✅ SMTP email sent — id=${info.messageId} to=${recipients.join(', ')}`);
      return { success: true, messageId: info.messageId };
    } catch (smtpErr) {
      console.error(`[mailer] ❌ SMTP send failed:`, smtpErr.message);
      throw smtpErr;
    }
  }

  // ── Resend path ────────────────────────────────────────────────────────────
  const res = await resend.emails.send({
    from:    fromAddress,
    to:      recipients,
    subject,
    html,
  });
  if (res.error) throw new Error(res.error.message || JSON.stringify(res.error));
  console.log(`[mailer] ✅ Resend email sent — id=${res.data?.id} to=${recipients.join(', ')}`);
  return { success: true, id: res.data?.id };
}

module.exports = { sendEmail };
