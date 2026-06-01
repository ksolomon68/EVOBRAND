const jwt = require('jsonwebtoken');
const pool = require('../db/connection');

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Access denied' });
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
};

// Always checks the DB — works even with stale tokens
const requireAdmin = async (req, res, next) => {
  if (!req.user?.id) return res.status(403).json({ error: 'Admin access required' });
  try {
    const [rows] = await pool.query('SELECT is_admin FROM users WHERE id = ?', [req.user.id]);
    const isAdmin = rows[0]?.is_admin == 1 || rows[0]?.is_admin === true;
    if (!isAdmin) return res.status(403).json({ error: 'Admin access required' });
    next();
  } catch (err) {
    console.error('requireAdmin DB error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { authenticateToken, requireAdmin };

