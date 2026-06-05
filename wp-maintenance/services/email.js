// services/email.js — Nodemailer branded email delivery
import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';
import { clientLogger } from '../utils/logger.js';
import { formatDate } from '../utils/helpers.js';

// ─── Build transporter (lazy singleton) ──────────────────────────────────────
let _transporter = null;

function getTransporter() {
  if (_transporter) return _transporter;

  _transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    tls: { rejectUnauthorized: false },
  });

  return _transporter;
}

// ─── Branded HTML email body ──────────────────────────────────────────────────
function buildEmailHTML({ clientName, totalUpdated, totalPlugins, reportDate }) {
  const noUpdates = totalUpdated === 0;
  const updateLine = noUpdates
    ? `All <strong>${totalPlugins}</strong> plugins were already up to date — no changes were required.`
    : `We updated <strong>${totalUpdated} plugin${totalUpdated !== 1 ? 's' : ''}</strong> across your WordPress installation. Your full maintenance report is attached.`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<title>WordPress Maintenance Report — ${clientName}</title>
</head>
<body style="margin:0;padding:0;background:#f4f6f8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f8;padding:40px 0;">
  <tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:10px;overflow:hidden;box-shadow:0 4px 20px rgba(0,50,88,0.10);">

      <!-- Header -->
      <tr>
        <td style="background:#003258;padding:32px 40px;text-align:left;">
          <div style="display:inline-block;">
            <span style="font-size:22px;font-weight:700;color:#ffffff;letter-spacing:0.04em;">EVOBRAND</span>
            <div style="font-size:10px;color:rgba(255,255,255,0.45);letter-spacing:0.12em;text-transform:uppercase;margin-top:3px;">Digital Strategy &amp; Solutions</div>
          </div>
        </td>
      </tr>

      <!-- Cyan bar -->
      <tr>
        <td style="height:3px;background:linear-gradient(90deg,#22c8e5,#003258);"></td>
      </tr>

      <!-- Body -->
      <tr>
        <td style="padding:40px 40px 32px;">
          <p style="font-size:14px;color:#6b7280;margin:0 0 8px 0;text-transform:uppercase;letter-spacing:0.1em;font-weight:600;">Maintenance Report</p>
          <h1 style="font-size:24px;font-weight:700;color:#111827;margin:0 0 24px 0;line-height:1.3;">WordPress Site Update<br>Complete</h1>

          <p style="font-size:15px;color:#374151;margin:0 0 24px 0;line-height:1.7;">
            Hi ${clientName} team,<br><br>
            Your scheduled WordPress maintenance has been completed successfully on <strong>${reportDate}</strong>.
            ${updateLine}
          </p>

          <!-- Stats strip -->
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
            <tr>
              <td width="33%" style="text-align:center;background:#f8f9fb;border-radius:8px;padding:18px 12px;border:1px solid #eaecef;">
                <div style="font-size:28px;font-weight:700;color:#003258;">${totalUpdated}</div>
                <div style="font-size:11px;color:#6b7280;text-transform:uppercase;letter-spacing:0.08em;margin-top:4px;">Updated</div>
              </td>
              <td width="4%"></td>
              <td width="33%" style="text-align:center;background:#f8f9fb;border-radius:8px;padding:18px 12px;border:1px solid #eaecef;">
                <div style="font-size:28px;font-weight:700;color:#003258;">${totalPlugins}</div>
                <div style="font-size:11px;color:#6b7280;text-transform:uppercase;letter-spacing:0.08em;margin-top:4px;">Total Plugins</div>
              </td>
              <td width="4%"></td>
              <td width="33%" style="text-align:center;background:#f8f9fb;border-radius:8px;padding:18px 12px;border:1px solid #eaecef;">
                <div style="font-size:16px;font-weight:700;color:#059669;margin-top:4px;">✓ Healthy</div>
                <div style="font-size:11px;color:#6b7280;text-transform:uppercase;letter-spacing:0.08em;margin-top:4px;">Site Status</div>
              </td>
            </tr>
          </table>

          <p style="font-size:14px;color:#6b7280;margin:0 0 28px 0;line-height:1.7;">
            Your detailed maintenance report is attached as a PDF. It includes a complete breakdown of all plugin changes, site status, and our recommendations for the next maintenance cycle.
          </p>

          <p style="font-size:14px;color:#374151;margin:0;line-height:1.7;">
            Questions or concerns? Reply to this email and a member of the EVOBRAND team will be in touch within one business day.
          </p>
        </td>
      </tr>

      <!-- Divider -->
      <tr><td style="height:1px;background:#eaecef;margin:0 40px;"></td></tr>

      <!-- Footer -->
      <tr>
        <td style="padding:24px 40px;text-align:left;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td>
                <p style="font-size:12px;color:#9ca3af;margin:0;line-height:1.6;">
                  EVOBRAND Digital Strategy &amp; Solutions<br>
                  This message was automatically generated. Do not reply to automated messages.
                </p>
              </td>
              <td align="right" valign="middle">
                <span style="font-size:11px;font-weight:700;color:#22c8e5;letter-spacing:0.08em;text-transform:uppercase;">evobrand.com</span>
              </td>
            </tr>
          </table>
        </td>
      </tr>

    </table>
  </td></tr>
</table>
</body>
</html>`;
}

// ─── Plain text fallback ──────────────────────────────────────────────────────
function buildEmailText({ clientName, totalUpdated, totalPlugins, reportDate }) {
  return [
    `EVOBRAND — WordPress Maintenance Report`,
    `==========================================`,
    ``,
    `Hi ${clientName} team,`,
    ``,
    `Your scheduled WordPress maintenance completed successfully on ${reportDate}.`,
    ``,
    `  • Plugins Updated : ${totalUpdated}`,
    `  • Total Plugins   : ${totalPlugins}`,
    `  • Site Status     : Healthy`,
    ``,
    `Your full maintenance report is attached as a PDF.`,
    ``,
    `Questions? Reply to this email and our team will respond within one business day.`,
    ``,
    `— EVOBRAND Digital Strategy & Solutions`,
    `  evobrand.com`,
  ].join('\n');
}

// ─── Send email ───────────────────────────────────────────────────────────────
/**
 * Sends the maintenance report email with PDF attachment.
 *
 * @param {object} params
 * @param {string} params.clientName    — Display name of the client
 * @param {string} params.toEmail       — Recipient email address
 * @param {string} params.pdfPath       — Absolute path to the generated PDF
 * @param {number} params.totalUpdated  — Number of updated plugins
 * @param {number} params.totalPlugins  — Total plugin count
 * @returns {Promise<object>}            — Nodemailer info object
 */
export async function sendMaintenanceReport({
  clientName,
  toEmail,
  pdfPath,
  totalUpdated,
  totalPlugins,
}) {
  const log = clientLogger(clientName);
  const transporter = getTransporter();
  const reportDate = formatDate();
  const pdfFilename = path.basename(pdfPath);

  const fromAddress = `"${process.env.EMAIL_FROM_NAME || 'EVOBRAND'}" <${
    process.env.EMAIL_FROM_ADDRESS || process.env.SMTP_USER || 'info@evobrand.net'
  }>`;

  log.info(`Sending maintenance report to ${toEmail}...`);

  const info = await transporter.sendMail({
    from: fromAddress,
    to: toEmail,
    subject: `WordPress Maintenance Report — ${clientName} — ${reportDate}`,
    text: buildEmailText({ clientName, totalUpdated, totalPlugins, reportDate }),
    html: buildEmailHTML({ clientName, totalUpdated, totalPlugins, reportDate }),
    attachments: [
      {
        filename: pdfFilename,
        path: pdfPath,
        contentType: 'application/pdf',
      },
    ],
  });

  log.info(`✓ Email sent. Message ID: ${info.messageId}`);
  return info;
}

/**
 * Verify SMTP credentials and connectivity.
 */
export async function verifyEmailConfig() {
  const transporter = getTransporter();
  await transporter.verify();
}
