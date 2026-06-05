/**
 * wrapLinks — replaces href="URL" with a click-tracking redirect URL.
 * Only applied when a campaignId is provided (real sends, not previews).
 */
function wrapLinks(html, campaignId, siteUrl) {
  if (!campaignId) return html;
  return html.replace(/href="(https?:[^"]+)"/gi, (match, url) => {
    // Don't double-wrap tracking URLs or mailto/tel links
    if (url.includes('/api/crm/track/')) return match;
    const encoded = encodeURIComponent(url);
    return `href="${siteUrl}/api/crm/track/click?cid=${campaignId}&url=${encoded}"`;
  });
}

/**
 * getEmailTemplate
 * Wraps any campaign content in the EVOBRAND branded email shell.
 * Matches the dark, cyan-accented newsletter design style.
 *
 * @param {string} subject      - The campaign subject / headline shown in the email body
 * @param {string} content      - Raw HTML content written by the admin in the CRM editor
 * @param {number|null} campaignId - When provided, injects open pixel + wraps links for tracking
 * @param {string} siteUrl      - Base URL for tracking endpoints (e.g. https://evobrandconcepts.com)
 * @returns {string}            - Full HTML email string
 */
const getEmailTemplate = (subject, content, campaignId = null, siteUrl = 'https://evobrandconcepts.com') => {
  const year = new Date().getFullYear();

  // Wrap links for click tracking (only for real sends)
  const trackedContent = wrapLinks(content, campaignId, siteUrl);

  // 1×1 transparent tracking pixel — only on real sends
  const trackingPixel = campaignId
    ? `<img src="${siteUrl}/api/crm/track/open?cid=${campaignId}" width="1" height="1" alt="" style="display:block;border:0;" />`
    : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${subject}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600&display=swap');

    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      background: #0b0f1a;
      font-family: 'DM Sans', Helvetica, Arial, sans-serif;
      color: #e8eaf0;
      -webkit-font-smoothing: antialiased;
    }

    .email-wrapper {
      max-width: 640px;
      margin: 0 auto;
      background: #0b0f1a;
    }

    /* ─── HEADER ─────────────────────────────────── */
    .header {
      background: linear-gradient(135deg, #0b0f1a 0%, #0d1829 50%, #091520 100%);
      padding: 40px 40px 32px;
      border-bottom: 1px solid rgba(0, 188, 212, 0.15);
      position: relative;
      overflow: hidden;
      text-align: left;
    }

    .header::before {
      content: '';
      position: absolute;
      top: -60px; right: -60px;
      width: 260px; height: 260px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(0,188,212,0.08) 0%, transparent 70%);
      pointer-events: none;
    }

    .header-logo-img {
      max-width: 160px;
      height: auto;
      display: block;
      margin-bottom: 10px;
    }

    .logo-wordmark {
      font-family: 'Bebas Neue', Impact, sans-serif;
      font-size: 34px;
      letter-spacing: 4px;
      color: #ffffff;
      line-height: 1;
      margin-bottom: 6px;
    }

    .logo-wordmark span {
      color: #00bcd4;
    }

    .logo-sub {
      font-size: 10px;
      letter-spacing: 2.5px;
      text-transform: uppercase;
      color: rgba(232,234,240,0.4);
      font-weight: 400;
    }

    /* ─── SUBJECT / HERO AREA ─────────────────────── */
    .hero {
      background: linear-gradient(180deg, #0d1829 0%, #091217 100%);
      padding: 48px 40px 40px;
      border-bottom: 1px solid rgba(0, 188, 212, 0.1);
    }

    .hero-label {
      display: inline-block;
      font-size: 10px;
      letter-spacing: 3px;
      text-transform: uppercase;
      color: #00bcd4;
      background: rgba(0,188,212,0.08);
      border: 1px solid rgba(0,188,212,0.2);
      padding: 5px 14px;
      border-radius: 2px;
      margin-bottom: 22px;
      font-weight: 500;
    }

    .hero-headline {
      font-family: 'Bebas Neue', Impact, sans-serif;
      font-size: 46px;
      line-height: 1.05;
      letter-spacing: 2px;
      color: #ffffff;
      margin-bottom: 0;
    }

    .hero-headline .accent {
      color: #00bcd4;
    }

    /* ─── DIVIDER ─────────────────────────────────── */
    .divider {
      height: 1px;
      background: linear-gradient(90deg, transparent, rgba(0,188,212,0.3), transparent);
      margin: 0 40px;
    }

    /* ─── MAIN CONTENT AREA ───────────────────────── */
    .content-section {
      padding: 44px 40px;
      border-bottom: 1px solid rgba(255,255,255,0.05);
    }

    .content-section h1,
    .content-section h2 {
      font-family: 'Bebas Neue', Impact, sans-serif;
      font-size: 28px;
      letter-spacing: 1.5px;
      color: #ffffff;
      margin-bottom: 16px;
      line-height: 1.1;
    }

    .content-section h3 {
      font-family: 'Bebas Neue', Impact, sans-serif;
      font-size: 22px;
      letter-spacing: 1px;
      color: #00bcd4;
      margin-bottom: 12px;
      line-height: 1.1;
    }

    .content-section p {
      font-size: 15px;
      line-height: 1.85;
      color: rgba(232,234,240,0.8);
      font-weight: 300;
      margin-bottom: 16px;
    }

    .content-section p:last-child {
      margin-bottom: 0;
    }

    .content-section strong {
      color: #ffffff;
      font-weight: 600;
    }

    .content-section em {
      color: rgba(232,234,240,0.9);
    }

    .content-section a {
      color: #00bcd4;
      text-decoration: none;
    }

    .content-section ul,
    .content-section ol {
      margin: 0 0 16px 0;
      padding-left: 0;
      list-style: none;
    }

    .content-section li {
      font-size: 14px;
      color: rgba(232,234,240,0.8);
      padding: 7px 0;
      border-bottom: 1px solid rgba(255,255,255,0.05);
      padding-left: 18px;
      position: relative;
      font-weight: 400;
      line-height: 1.6;
    }

    .content-section li::before {
      content: '→';
      color: #00bcd4;
      font-size: 12px;
      position: absolute;
      left: 0;
      top: 8px;
    }

    /* ─── CTA BUTTON ──────────────────────────────── */
    .btn-primary {
      display: inline-block;
      background: #00bcd4;
      color: #0b0f1a !important;
      font-family: 'DM Sans', Helvetica, Arial, sans-serif;
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 2.5px;
      text-transform: uppercase;
      text-decoration: none !important;
      padding: 14px 32px;
      border-radius: 2px;
      margin-top: 24px;
      margin-bottom: 8px;
    }

    .btn-secondary {
      display: inline-block;
      background: transparent;
      color: #c9a84c !important;
      font-family: 'DM Sans', Helvetica, Arial, sans-serif;
      font-size: 12px;
      font-weight: 600;
      letter-spacing: 2px;
      text-transform: uppercase;
      text-decoration: none !important;
      padding: 13px 28px;
      border: 1px solid rgba(201,168,76,0.4);
      border-radius: 2px;
      margin-top: 12px;
    }

    /* ─── HIGHLIGHT BOX ───────────────────────────── */
    .highlight-box {
      background: linear-gradient(135deg, #071219 0%, #0d1e2a 100%);
      border: 1px solid rgba(0,188,212,0.25);
      border-radius: 4px;
      padding: 28px 28px;
      margin: 28px 0;
      position: relative;
      overflow: hidden;
    }

    .highlight-box::before {
      content: '';
      position: absolute;
      top: 0; left: 0; right: 0;
      height: 2px;
      background: linear-gradient(90deg, transparent, #00bcd4, #c9a84c, transparent);
    }

    /* ─── GOLD NOTICE BAR ─────────────────────────── */
    .notice-bar {
      padding: 32px 40px;
      background: rgba(201,168,76,0.04);
      border-top: 1px solid rgba(201,168,76,0.18);
      border-bottom: 1px solid rgba(201,168,76,0.18);
    }

    .notice-bar .notice-label {
      font-size: 10px;
      letter-spacing: 3px;
      text-transform: uppercase;
      color: rgba(201,168,76,0.8);
      margin-bottom: 10px;
      font-weight: 600;
    }

    .notice-bar h3 {
      font-family: 'Bebas Neue', Impact, sans-serif;
      font-size: 22px;
      letter-spacing: 1px;
      color: #ffffff;
      margin-bottom: 10px;
    }

    .notice-bar p {
      font-size: 14px;
      line-height: 1.8;
      color: rgba(232,234,240,0.75);
      font-weight: 300;
    }

    .notice-bar a {
      color: #00bcd4;
      text-decoration: none;
    }

    /* ─── SIGNATURE ───────────────────────────────── */
    .signature-section {
      padding: 40px 40px;
      border-bottom: 1px solid rgba(255,255,255,0.05);
    }

    .signature-section blockquote {
      border-left: 3px solid #00bcd4;
      padding-left: 20px;
      margin-bottom: 24px;
    }

    .signature-section blockquote p {
      font-size: 16px;
      line-height: 1.8;
      color: rgba(232,234,240,0.9);
      font-style: italic;
      font-weight: 300;
    }

    .signature-name {
      font-size: 15px;
      font-weight: 600;
      color: #ffffff;
      margin-bottom: 2px;
    }

    .signature-title {
      font-size: 13px;
      color: rgba(232,234,240,0.5);
      font-weight: 400;
      line-height: 1.7;
    }

    .signature-title a {
      color: rgba(0,188,212,0.7);
      text-decoration: none;
    }

    /* ─── FOOTER ──────────────────────────────────── */
    .footer {
      background: #07090f;
      padding: 32px 40px;
      border-top: 1px solid rgba(255,255,255,0.06);
    }

    .footer-wordmark {
      font-family: 'Bebas Neue', Impact, sans-serif;
      font-size: 20px;
      letter-spacing: 3px;
      color: rgba(255,255,255,0.45);
      margin-bottom: 10px;
    }

    .footer p {
      font-size: 11.5px;
      line-height: 1.7;
      color: rgba(232,234,240,0.3);
      margin-bottom: 3px;
    }

    .footer a {
      color: rgba(0,188,212,0.55);
      text-decoration: none;
    }

    .footer-divider {
      margin-top: 18px;
      padding-top: 16px;
      border-top: 1px solid rgba(255,255,255,0.05);
      font-size: 10.5px;
      color: rgba(232,234,240,0.22);
      line-height: 1.7;
    }

    /* ─── MOBILE ──────────────────────────────────── */
    @media (max-width: 600px) {
      .header, .hero, .content-section, .signature-section, .footer, .notice-bar {
        padding-left: 20px;
        padding-right: 20px;
      }
      .divider { margin: 0 20px; }
      .logo-wordmark { font-size: 24px; letter-spacing: 2px; }
      .hero-headline { font-size: 32px; }
      .content-section h1, .content-section h2 { font-size: 22px; }
      .btn-primary, .btn-secondary { display: block; text-align: center; margin-left: 0; }
    }
  </style>
</head>
<body>

<div class="email-wrapper">

  <!-- HEADER: Logo always stays here -->
  <div class="header">
    <img
      src="https://raw.githubusercontent.com/ksolomon68/EVOBRAND/main/apps/web/public/logo.png"
      alt="EVOBRAND"
      width="160"
      class="header-logo-img"
      onerror="this.style.display='none'; this.nextElementSibling.style.display='block';"
    />
    <!-- Text fallback if logo image doesn't load -->
    <div class="logo-wordmark" style="display:none;">EVO<span>BRAND</span> <span style="color:rgba(255,255,255,0.4);font-size:26px;">CONCEPTS</span></div>
    <div class="logo-sub">Digital Strategy &bull; AI-Powered Platforms &bull; Accessibility Compliance</div>
  </div>

  <!-- HERO: Campaign subject as headline -->
  <div class="hero">
    <div class="hero-label">&#9679; EVOBRAND Concepts &bull; ${year}</div>
    <div class="hero-headline">${subject}</div>
  </div>

  <div class="divider"></div>

  <!-- MAIN CONTENT: Admin-authored HTML from CRM editor -->
  <div class="content-section">
    ${trackedContent}
  </div>

  <!-- TRACKING PIXEL: Records email opens (invisible) -->
  ${trackingPixel}

  <!-- SIGNATURE -->
  <div class="signature-section">
    <div class="signature-name">Keisha Solomon</div>
    <div class="signature-title">
      Founder &amp; Digital Strategist, EVOBRAND Concepts<br>
      <a href="tel:2145314427">214-531-4427</a> &bull;
      <a href="mailto:ks@evobrand.net">ks@evobrand.net</a> &bull;
      <a href="https://evobrand.net">evobrand.net</a>
    </div>
  </div>

  <!-- FOOTER -->
  <div class="footer">
    <div class="footer-wordmark">EVOBRAND CONCEPTS</div>
    <p>SBE &bull; WBE &bull; MBE Certified</p>
    <div class="footer-divider">
      &copy; ${year} EVOBRAND Concepts. All rights reserved. &bull;
      You're receiving this because you're part of the EVOBRAND network. &bull;
      <a href="#">Unsubscribe</a>
    </div>
  </div>

</div>

</body>
</html>`;
};

module.exports = { getEmailTemplate };
