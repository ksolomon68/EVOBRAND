const nodemailer = require('nodemailer');
const { Resend } = require('resend');

let transporter = null;
if (process.env.SMTP_HOST) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '465'),
    secure: process.env.SMTP_SECURE === 'true' || process.env.SMTP_PORT === '465',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

const resend = new Resend(process.env.RESEND_API_KEY || 're_placeholder');

/**
 * sendEmail
 * Sends an email using either SMTP (Nodemailer) or Resend, depending on configuration.
 *
 * @param {Object} options
 * @param {string} options.from - Sender address (e.g. '"EVOBRAND" <info@evobrand.net>')
 * @param {string|string[]} options.to - Recipient email(s)
 * @param {string} options.subject - Email subject
 * @param {string} options.html - HTML content
 * @returns {Promise<Object>} - Result metadata
 */
async function sendEmail({ from, to, subject, html }) {
  const recipients = Array.isArray(to) ? to : [to];

  if (process.env.SMTP_HOST) {
    if (!transporter) {
      transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '465'),
        secure: process.env.SMTP_SECURE === 'true' || process.env.SMTP_PORT === '465',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
    }

    const info = await transporter.sendMail({
      from: from || process.env.RESEND_FROM_EMAIL || 'info@evobrand.net',
      to: recipients.join(', '),
      subject,
      html,
    });
    return { success: true, messageId: info.messageId };
  } else {
    const res = await resend.emails.send({
      from: from || process.env.RESEND_FROM_EMAIL || 'info@evobrand.net',
      to: recipients,
      subject,
      html,
    });
    if (res.error) throw new Error(res.error.message || JSON.stringify(res.error));
    return { success: true, id: res.data?.id };
  }
}

module.exports = { sendEmail };
