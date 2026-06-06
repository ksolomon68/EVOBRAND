const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const pool = require('../db/connection');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// Auto-create table on startup
pool.query(`
  CREATE TABLE IF NOT EXISTS pageviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    page_path VARCHAR(500) NOT NULL,
    page_title VARCHAR(500),
    referrer VARCHAR(500),
    ip_hash VARCHAR(64),
    session_id VARCHAR(64),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_created_at (created_at),
    INDEX idx_page_path (page_path(100))
  )
`).catch(err => console.error('pageviews table init error:', err.message));

function hashIp(ip) {
  return crypto.createHash('sha256').update('evobrand:' + (ip || '')).digest('hex').slice(0, 16);
}

// POST /api/analytics — public tracking endpoint
router.post('/', async (req, res) => {
  const { page_path, page_title, referrer, session_id } = req.body;
  if (!page_path || !page_path.startsWith('/')) return res.status(400).json({ error: 'Invalid path' });
  const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket?.remoteAddress || '';
  try {
    await pool.query(
      'INSERT INTO pageviews (page_path, page_title, referrer, ip_hash, session_id) VALUES (?, ?, ?, ?, ?)',
      [page_path.slice(0, 500), (page_title || '').slice(0, 500), (referrer || '').slice(0, 500), hashIp(ip), (session_id || '').slice(0, 64)]
    );
    res.json({ ok: true });
  } catch (err) {
    console.error('Analytics track error:', err.message);
    res.status(500).json({ error: 'Failed to record' });
  }
});

router.use(authenticateToken, requireAdmin);

// GET /api/analytics/overview
router.get('/overview', async (req, res) => {
  try {
    const [[totals]] = await pool.query(`
      SELECT
        COUNT(*) AS pageViews,
        COUNT(DISTINCT ip_hash) AS visitors,
        COUNT(DISTINCT session_id) AS sessions
      FROM pageviews
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
    `);
    const [[today]] = await pool.query(`
      SELECT COUNT(*) AS pageViewsToday
      FROM pageviews WHERE DATE(created_at) = CURDATE()
    `);
    res.json({ ...totals, pageViewsToday: today.pageViewsToday });
  } catch (err) {
    console.error('GA overview error:', err.message);
    res.status(500).json({ error: 'Failed to fetch overview' });
  }
});

// GET /api/analytics/daily
router.get('/daily', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        DATE(created_at) AS date,
        COUNT(*) AS pageViews,
        COUNT(DISTINCT ip_hash) AS visitors
      FROM pageviews
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 28 DAY)
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `);
    res.json(rows.map(r => ({ date: r.date.toISOString().slice(0, 10), pageViews: r.pageViews, visitors: r.visitors })));
  } catch (err) {
    console.error('GA daily error:', err.message);
    res.status(500).json({ error: 'Failed to fetch daily data' });
  }
});

// GET /api/analytics/pages
router.get('/pages', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT page_path, page_title, COUNT(*) AS views, COUNT(DISTINCT ip_hash) AS visitors
      FROM pageviews
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
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

module.exports = router;
