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

// Always checks the DB so admin status works even on old tokens
const requireAdmin = async (req, res, next) => {
  if (!req.user) return res.status(403).json({ error: 'Admin access required' });
  try {
    const [rows] = await pool.query('SELECT is_admin FROM users WHERE id = ?', [req.user.id]);
    if (!rows[0]?.is_admin && !req.user.is_admin) return res.status(403).json({ error: 'Admin access required' });
    next();
  } catch (err) {
    console.error('requireAdmin DB error:', err);
    if (req.user.is_admin) return next(); // Fallback to token
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { authenticateToken, requireAdmin };

