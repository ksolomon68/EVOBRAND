// routes/auth.js — Login / Logout
import express from 'express';
import bcrypt from 'bcryptjs';

const router = express.Router();

// Default credentials (override via .env)
const ADMIN_USER = process.env.CMS_ADMIN_USER || 'admin';
const ADMIN_PASS = process.env.CMS_ADMIN_PASS || 'evobrand2024';

router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  const userMatch = username === ADMIN_USER;
  const passMatch = password === ADMIN_PASS;

  if (userMatch && passMatch) {
    req.session.authenticated = true;
    req.session.username = username;
    return res.json({ success: true });
  }

  return res.status(401).json({ error: 'Invalid credentials' });
});

router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.json({ success: true });
  });
});

router.get('/status', (req, res) => {
  res.json({
    authenticated: !!req.session?.authenticated,
    username: req.session?.username || null,
  });
});

export default router;
