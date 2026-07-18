const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const https = require('https');
const http = require('http');
const pool = require('../db/connection');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// ─── Schema migration: add enriched columns ───────────────────────────────────
const MIGRATIONS = [
  `CREATE TABLE IF NOT EXISTS pageviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    page_path VARCHAR(500) NOT NULL,
    page_title VARCHAR(500),
    referrer VARCHAR(500),
    ip_hash VARCHAR(64),
    session_id VARCHAR(64),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_created_at (created_at),
    INDEX idx_page_path (page_path(100))
  )`,
  `ALTER TABLE pageviews ADD COLUMN IF NOT EXISTS country VARCHAR(100) DEFAULT NULL`,
  `ALTER TABLE pageviews ADD COLUMN IF NOT EXISTS region VARCHAR(100) DEFAULT NULL`,
  `ALTER TABLE pageviews ADD COLUMN IF NOT EXISTS city VARCHAR(100) DEFAULT NULL`,
  `ALTER TABLE pageviews ADD COLUMN IF NOT EXISTS device_type ENUM('desktop','mobile','tablet') DEFAULT 'desktop'`,
  `ALTER TABLE pageviews ADD COLUMN IF NOT EXISTS browser VARCHAR(50) DEFAULT NULL`,
  `ALTER TABLE pageviews ADD COLUMN IF NOT EXISTS os VARCHAR(50) DEFAULT NULL`,
  `ALTER TABLE pageviews ADD COLUMN IF NOT EXISTS utm_source VARCHAR(255) DEFAULT NULL`,
  `ALTER TABLE pageviews ADD COLUMN IF NOT EXISTS utm_medium VARCHAR(100) DEFAULT NULL`,
  `ALTER TABLE pageviews ADD COLUMN IF NOT EXISTS utm_campaign VARCHAR(255) DEFAULT NULL`,
  `ALTER TABLE pageviews ADD COLUMN IF NOT EXISTS channel VARCHAR(50) DEFAULT 'direct'`,
  `ALTER TABLE pageviews ADD COLUMN IF NOT EXISTS screen_width SMALLINT DEFAULT NULL`,
];

(async () => {
  for (const sql of MIGRATIONS) {
    try { await pool.query(sql); } catch (e) { /* column already exists — ignore */ }
  }
})();

// ─── Helpers ─────────────────────────────────────────────────────────────────

function hashIp(ip) {
  return crypto.createHash('sha256').update('evobrand:' + (ip || '')).digest('hex').slice(0, 16);
}

/** Parse User-Agent string into { device_type, browser, os } */
function parseUA(ua = '') {
  const s = ua.toLowerCase();

  // Device type
  let device_type = 'desktop';
  if (/tablet|ipad|playbook|silk/.test(s)) device_type = 'tablet';
  else if (/mobile|iphone|ipod|android(?!.*tablet)|blackberry|iemobile|opera m(ob|in)i|windows phone/.test(s)) device_type = 'mobile';

  // Browser
  let browser = 'Other';
  if (s.includes('edg/') || s.includes('edge/')) browser = 'Edge';
  else if (s.includes('opr/') || s.includes('opera')) browser = 'Opera';
  else if (s.includes('samsungbrowser')) browser = 'Samsung';
  else if (s.includes('chrome') && !s.includes('chromium')) browser = 'Chrome';
  else if (s.includes('chromium')) browser = 'Chromium';
  else if (s.includes('firefox') || s.includes('fxios')) browser = 'Firefox';
  else if (s.includes('safari') && !s.includes('chrome')) browser = 'Safari';
  else if (s.includes('msie') || s.includes('trident')) browser = 'IE';

  // OS
  let os = 'Other';
  if (s.includes('windows nt')) os = 'Windows';
  else if (s.includes('mac os x') && !s.includes('iphone') && !s.includes('ipad') && !s.includes('ipod')) os = 'macOS';
  else if (s.includes('iphone') || s.includes('ipod')) os = 'iOS';
  else if (s.includes('ipad')) os = 'iPadOS';
  else if (s.includes('android')) os = 'Android';
  else if (s.includes('linux')) os = 'Linux';
  else if (s.includes('cros')) os = 'ChromeOS';

  return { device_type, browser, os };
}

const SOCIAL_DOMAINS = new Set([
  'facebook.com', 'fb.com', 'instagram.com', 'twitter.com', 'x.com',
  'linkedin.com', 'pinterest.com', 'tiktok.com', 'youtube.com', 'reddit.com',
  'snapchat.com', 'threads.net', 'whatsapp.com', 'telegram.org',
]);
const SEARCH_DOMAINS = new Set([
  'google.com', 'google.co.uk', 'bing.com', 'yahoo.com', 'duckduckgo.com',
  'baidu.com', 'yandex.com', 'ecosia.org', 'ask.com', 'aol.com',
]);

/** Derive marketing channel from referrer + UTM params */
function deriveChannel({ referrer = '', utm_source = '', utm_medium = '' }) {
  const medium = utm_medium.toLowerCase();
  const source = utm_source.toLowerCase();

  if (medium === 'email' || source === 'email' || source === 'newsletter') return 'email';
  if (['cpc', 'ppc', 'paid', 'paidsearch', 'paid_search', 'paid-search'].includes(medium)) return 'paid_search';
  if (['display', 'banner', 'cpm', 'paid_social', 'paidsocial'].includes(medium)) return 'paid_social';
  if (utm_source || utm_medium || utm_medium === 'referral') {
    // has UTM but not paid — treat as campaign/referral
    if (SOCIAL_DOMAINS.has(source.replace('www.', ''))) return 'social';
    return 'campaign';
  }

  if (!referrer || referrer === '') return 'direct';

  try {
    const refHost = new URL(referrer).hostname.replace('www.', '');
    if (SEARCH_DOMAINS.has(refHost)) return 'organic_search';
    if (SOCIAL_DOMAINS.has(refHost)) return 'social';
    return 'referral';
  } catch {
    return 'direct';
  }
}

/** Async IP geolocation — fire-and-forget, updates DB after response is sent */
function resolveGeo(ip, rowId) {
  if (!ip || ip === '127.0.0.1' || ip === '::1' || ip.startsWith('192.168') || ip.startsWith('10.')) return;
  const url = `http://ip-api.com/json/${encodeURIComponent(ip)}?fields=status,country,regionName,city`;
  const lib = url.startsWith('https') ? https : http;
  lib.get(url, (res) => {
    let raw = '';
    res.on('data', d => { raw += d; });
    res.on('end', async () => {
      try {
        const geo = JSON.parse(raw);
        if (geo.status === 'success') {
          await pool.query(
            'UPDATE pageviews SET country=?, region=?, city=? WHERE id=?',
            [geo.country || null, geo.regionName || null, geo.city || null, rowId]
          );
        }
      } catch { /* ignore */ }
    });
  }).on('error', () => { /* ignore */ });
}

// ─── POST /api/analytics — public tracking endpoint ──────────────────────────
router.post('/', async (req, res) => {
  const { page_path, page_title, referrer, session_id, utm_source, utm_medium, utm_campaign, screen_width } = req.body;
  if (!page_path || !page_path.startsWith('/')) return res.status(400).json({ error: 'Invalid path' });

  const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket?.remoteAddress || '';
  const ua = req.headers['user-agent'] || '';
  const { device_type, browser, os } = parseUA(ua);
  const channel = deriveChannel({ referrer, utm_source, utm_medium });

  try {
    const [result] = await pool.query(
      `INSERT INTO pageviews
        (page_path, page_title, referrer, ip_hash, session_id,
         device_type, browser, os, channel,
         utm_source, utm_medium, utm_campaign, screen_width)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        page_path.slice(0, 500),
        (page_title || '').slice(0, 500),
        (referrer || '').slice(0, 500),
        hashIp(ip),
        (session_id || '').slice(0, 64),
        device_type, browser, os, channel,
        (utm_source || null),
        (utm_medium || null),
        (utm_campaign || null),
        screen_width ? parseInt(screen_width, 10) : null,
      ]
    );
    res.json({ ok: true });
    // Geo lookup is async — does not affect response time
    resolveGeo(ip, result.insertId);
  } catch (err) {
    console.error('Analytics track error:', err.message);
    res.status(500).json({ error: 'Failed to record' });
  }
});

// ─── All routes below require admin auth ─────────────────────────────────────
router.use(authenticateToken, requireAdmin);

// Diagnostic test hits (sent from the admin dashboard's "Send Test Hit"
// button) use /dev/ paths — exclude them from user-facing aggregates.
const NOT_TEST = "AND page_path NOT LIKE '/dev/%'";

// GET /api/analytics/health — pipeline diagnostics ────────────────────────────
router.get('/health', async (req, res) => {
  try {
    const [[stats]] = await pool.query(`
      SELECT
        COUNT(*) AS totalRows,
        MIN(created_at) AS firstEvent,
        MAX(created_at) AS lastEvent,
        SUM(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR) THEN 1 ELSE 0 END) AS last24h
      FROM pageviews
    `);
    const [[tests]] = await pool.query(`
      SELECT COUNT(*) AS testRows, MAX(created_at) AS lastTest
      FROM pageviews WHERE page_path LIKE '/dev/%'
    `);
    res.json({
      totalRows: parseInt(stats.totalRows, 10),
      firstEvent: stats.firstEvent,
      lastEvent: stats.lastEvent,
      last24h: parseInt(stats.last24h || 0, 10),
      testRows: parseInt(tests.testRows, 10),
      lastTest: tests.lastTest,
      serverTime: new Date().toISOString(),
    });
  } catch (err) {
    console.error('GA health error:', err.message);
    res.status(500).json({ error: 'Failed to fetch health' });
  }
});

// GET /api/analytics/overview ─────────────────────────────────────────────────
router.get('/overview', async (req, res) => {
  try {
    const [[totals]] = await pool.query(`
      SELECT
        COUNT(*) AS pageViews,
        COUNT(DISTINCT ip_hash) AS visitors,
        COUNT(DISTINCT session_id) AS sessions
      FROM pageviews
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) ${NOT_TEST}
    `);
    const [[today]] = await pool.query(`
      SELECT COUNT(*) AS pageViewsToday
      FROM pageviews WHERE DATE(created_at) = CURDATE() ${NOT_TEST}
    `);
    // New vs returning: visitors seen before the last 30 days
    const [[returning]] = await pool.query(`
      SELECT COUNT(DISTINCT p.ip_hash) AS returningVisitors
      FROM pageviews p
      WHERE p.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) ${NOT_TEST.replace('page_path', 'p.page_path')}
        AND EXISTS (
          SELECT 1 FROM pageviews old
          WHERE old.ip_hash = p.ip_hash
            AND old.created_at < DATE_SUB(NOW(), INTERVAL 30 DAY)
        )
    `);
    const [[realtime]] = await pool.query(`
      SELECT COUNT(*) AS activeNow
      FROM pageviews
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 5 MINUTE)
    `);
    const visitors30 = parseInt(totals.visitors, 10);
    const returnV = parseInt(returning.returningVisitors, 10);
    const newV = Math.max(0, visitors30 - returnV);
    res.json({
      ...totals,
      pageViewsToday: today.pageViewsToday,
      activeNow: realtime.activeNow,
      newVisitors: newV,
      returningVisitors: returnV,
    });
  } catch (err) {
    console.error('GA overview error:', err.message);
    res.status(500).json({ error: 'Failed to fetch overview' });
  }
});

// GET /api/analytics/daily?days=7|28|90 ───────────────────────────────────────
router.get('/daily', async (req, res) => {
  const days = [7, 28, 90].includes(parseInt(req.query.days, 10))
    ? parseInt(req.query.days, 10)
    : 28;
  try {
    const [rows] = await pool.query(`
      SELECT
        DATE(created_at) AS date,
        COUNT(*) AS pageViews,
        COUNT(DISTINCT ip_hash) AS visitors,
        COUNT(DISTINCT session_id) AS sessions
      FROM pageviews
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY) ${NOT_TEST}
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `, [days]);
    // Zero-fill missing days so sparse data still renders a full axis
    // (pool uses dateStrings: true, so DATE(created_at) comes back as 'YYYY-MM-DD' already)
    const byDate = new Map(rows.map(r => [r.date, r]));
    const out = [];
    const cursor = new Date();
    cursor.setDate(cursor.getDate() - (days - 1));
    for (let i = 0; i < days; i++) {
      const key = cursor.toISOString().slice(0, 10);
      const r = byDate.get(key);
      out.push({
        date: key,
        pageViews: r ? r.pageViews : 0,
        visitors: r ? r.visitors : 0,
        sessions: r ? r.sessions : 0,
      });
      cursor.setDate(cursor.getDate() + 1);
    }
    res.json(out);
  } catch (err) {
    console.error('GA daily error:', err.message);
    res.status(500).json({ error: 'Failed to fetch daily data' });
  }
});

// GET /api/analytics/pages ─────────────────────────────────────────────────────
router.get('/pages', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT page_path, page_title, COUNT(*) AS views, COUNT(DISTINCT ip_hash) AS visitors
      FROM pageviews
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) ${NOT_TEST}
      GROUP BY page_path, page_title
      ORDER BY views DESC
      LIMIT 10
    `);
    res.json(rows);
  } catch (err) {
    console.error('GA pages error:', err.message);
    res.status(500).json({ error: 'Failed to fetch pages' });
  }
});

// GET /api/analytics/sources ──────────────────────────────────────────────────
router.get('/sources', async (req, res) => {
  try {
    // Channel distribution
    const [channels] = await pool.query(`
      SELECT
        COALESCE(channel, 'direct') AS channel,
        COUNT(*) AS sessions,
        COUNT(DISTINCT ip_hash) AS visitors
      FROM pageviews
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      GROUP BY channel
      ORDER BY sessions DESC
    `);
    // Top referrer domains
    const [referrers] = await pool.query(`
      SELECT
        referrer,
        COUNT(*) AS sessions,
        COUNT(DISTINCT ip_hash) AS visitors
      FROM pageviews
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
        AND referrer IS NOT NULL
        AND referrer != ''
        AND channel = 'referral'
      GROUP BY referrer
      ORDER BY sessions DESC
      LIMIT 15
    `);
    // Extract hostname from referrer
    const refs = referrers.map(r => {
      let domain = r.referrer;
      try { domain = new URL(r.referrer).hostname.replace('www.', ''); } catch {}
      return { domain, sessions: r.sessions, visitors: r.visitors };
    });
    // UTM campaigns
    const [campaigns] = await pool.query(`
      SELECT
        COALESCE(utm_source, 'unknown') AS source,
        COALESCE(utm_medium, 'unknown') AS medium,
        COALESCE(utm_campaign, 'unknown') AS campaign,
        COUNT(*) AS sessions,
        COUNT(DISTINCT ip_hash) AS visitors
      FROM pageviews
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
        AND utm_source IS NOT NULL
      GROUP BY utm_source, utm_medium, utm_campaign
      ORDER BY sessions DESC
      LIMIT 10
    `);
    res.json({ channels, referrers: refs, campaigns });
  } catch (err) {
    console.error('GA sources error:', err.message);
    res.status(500).json({ error: 'Failed to fetch sources' });
  }
});

// GET /api/analytics/geo ──────────────────────────────────────────────────────
router.get('/geo', async (req, res) => {
  try {
    const [countries] = await pool.query(`
      SELECT
        COALESCE(country, 'Unknown') AS country,
        COUNT(*) AS sessions,
        COUNT(DISTINCT ip_hash) AS visitors
      FROM pageviews
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      GROUP BY country
      ORDER BY sessions DESC
      LIMIT 20
    `);
    const [regions] = await pool.query(`
      SELECT
        COALESCE(country, 'Unknown') AS country,
        COALESCE(region, 'Unknown') AS region,
        COUNT(*) AS sessions,
        COUNT(DISTINCT ip_hash) AS visitors
      FROM pageviews
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
        AND region IS NOT NULL
      GROUP BY country, region
      ORDER BY sessions DESC
      LIMIT 20
    `);
    const [cities] = await pool.query(`
      SELECT
        COALESCE(city, 'Unknown') AS city,
        COALESCE(country, 'Unknown') AS country,
        COUNT(*) AS sessions,
        COUNT(DISTINCT ip_hash) AS visitors
      FROM pageviews
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
        AND city IS NOT NULL
      GROUP BY city, country
      ORDER BY sessions DESC
      LIMIT 20
    `);
    res.json({ countries, regions, cities });
  } catch (err) {
    console.error('GA geo error:', err.message);
    res.status(500).json({ error: 'Failed to fetch geo data' });
  }
});

// GET /api/analytics/devices ──────────────────────────────────────────────────
router.get('/devices', async (req, res) => {
  try {
    const [devices] = await pool.query(`
      SELECT
        COALESCE(device_type, 'desktop') AS device_type,
        COUNT(*) AS sessions,
        COUNT(DISTINCT ip_hash) AS visitors
      FROM pageviews
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      GROUP BY device_type
      ORDER BY sessions DESC
    `);
    const [browsers] = await pool.query(`
      SELECT
        COALESCE(browser, 'Other') AS browser,
        COUNT(*) AS sessions,
        COUNT(DISTINCT ip_hash) AS visitors
      FROM pageviews
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      GROUP BY browser
      ORDER BY sessions DESC
      LIMIT 10
    `);
    const [oses] = await pool.query(`
      SELECT
        COALESCE(os, 'Other') AS os,
        COUNT(*) AS sessions,
        COUNT(DISTINCT ip_hash) AS visitors
      FROM pageviews
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      GROUP BY os
      ORDER BY sessions DESC
      LIMIT 10
    `);
    res.json({ devices, browsers, oses });
  } catch (err) {
    console.error('GA devices error:', err.message);
    res.status(500).json({ error: 'Failed to fetch device data' });
  }
});

// GET /api/analytics/realtime ─────────────────────────────────────────────────
router.get('/realtime', async (req, res) => {
  try {
    const [[{ activeNow }]] = await pool.query(`
      SELECT COUNT(DISTINCT session_id) AS activeNow
      FROM pageviews
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 5 MINUTE)
    `);
    const [recentPages] = await pool.query(`
      SELECT page_path, page_title, COUNT(*) AS hits
      FROM pageviews
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 5 MINUTE)
      GROUP BY page_path, page_title
      ORDER BY hits DESC
      LIMIT 5
    `);
    const [hourly] = await pool.query(`
      SELECT
        DATE_FORMAT(created_at, '%H:00') AS hour,
        COUNT(*) AS pageViews,
        COUNT(DISTINCT session_id) AS sessions
      FROM pageviews
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
      GROUP BY DATE_FORMAT(created_at, '%H:00')
      ORDER BY hour ASC
    `);
    res.json({ activeNow, recentPages, hourly });
  } catch (err) {
    console.error('GA realtime error:', err.message);
    res.status(500).json({ error: 'Failed to fetch realtime data' });
  }
});

// GET /api/analytics/engagement ───────────────────────────────────────────────
router.get('/engagement', async (req, res) => {
  try {
    // Pages per session
    const [[pps]] = await pool.query(`
      SELECT AVG(page_count) AS avgPagesPerSession
      FROM (
        SELECT session_id, COUNT(*) AS page_count
        FROM pageviews
        WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
          AND session_id IS NOT NULL AND session_id != ''
        GROUP BY session_id
      ) s
    `);
    // Single-page sessions (bounce proxy)
    const [[bounce]] = await pool.query(`
      SELECT
        COUNT(CASE WHEN page_count = 1 THEN 1 END) AS single,
        COUNT(*) AS total
      FROM (
        SELECT session_id, COUNT(*) AS page_count
        FROM pageviews
        WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
          AND session_id IS NOT NULL AND session_id != ''
        GROUP BY session_id
      ) s
    `);
    // Day of week distribution
    const [byDow] = await pool.query(`
      SELECT
        DAYOFWEEK(created_at) AS dow,
        DAYNAME(created_at) AS day_name,
        COUNT(*) AS pageViews
      FROM pageviews
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      GROUP BY DAYOFWEEK(created_at), DAYNAME(created_at)
      ORDER BY dow ASC
    `);
    // Hour of day distribution
    const [byHour] = await pool.query(`
      SELECT
        HOUR(created_at) AS hour,
        COUNT(*) AS pageViews
      FROM pageviews
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      GROUP BY HOUR(created_at)
      ORDER BY hour ASC
    `);
    const bounceRate = bounce.total > 0 ? ((bounce.single / bounce.total) * 100).toFixed(1) : 0;
    res.json({
      avgPagesPerSession: parseFloat(pps.avgPagesPerSession || 0).toFixed(1),
      bounceRate: parseFloat(bounceRate),
      byDow,
      byHour,
    });
  } catch (err) {
    console.error('GA engagement error:', err.message);
    res.status(500).json({ error: 'Failed to fetch engagement data' });
  }
});

module.exports = router;
