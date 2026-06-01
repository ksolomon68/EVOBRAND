const express = require('express');
const router = express.Router();
const pool = require('../db/connection');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { authenticateToken } = require('../middleware/auth');

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

// @route POST /api/auth/register
// @desc  Register new user
router.post('/register', async (req, res) => {
  const { email, password, name } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    // 1. Check if user already exists
    const [existingUsers] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    
    if (existingUsers.length > 0) {
      return res.status(400).json({ error: 'Email is already in use' });
    }

    // 2. Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // 3. Insert user
    const [insertResult] = await pool.query(
      'INSERT INTO users (email, password_hash, name) VALUES (?, ?, ?)',
      [email, passwordHash, name || '']
    );

    const user = { id: insertResult.insertId, email, name };

    // 4. Generate JWT
    const token = jwt.sign(user, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({ 
      message: 'User registered successfully',
      token,
      user
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Server error during registration' });
  }
});

// @route POST /api/auth/login
// @desc  Authenticate user & get token
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    // 1. Find user
    const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    
    if (users.length === 0) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const userRecord = users[0];

    // 2. Validate password
    if (!userRecord.password_hash) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, userRecord.password_hash);

    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // 3. Generate JWT — auto-promote admin email if needed
    const adminEmail = process.env.ADMIN_EMAIL || 'ksolomon68@gmail.com';
    if (userRecord.email === adminEmail && !userRecord.is_admin) {
      await pool.query('UPDATE users SET is_admin = 1 WHERE id = ?', [userRecord.id]);
      userRecord.is_admin = 1;
    }

    const userPayload = { id: userRecord.id, email: userRecord.email, name: userRecord.name, is_admin: userRecord.is_admin };
    const token = jwt.sign(userPayload, JWT_SECRET, { expiresIn: '7d' });

    res.status(200).json({ 
      message: 'Logged in successfully',
      token,
      user: userPayload
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error during login' });
  }
});

// @route GET /api/auth/me
// @desc  Get current logged in user
router.get('/me', authenticateToken, async (req, res) => {
  try {
    // req.user has id and email from the token payload
    const [users] = await pool.query('SELECT id, email, name, is_admin, created_at FROM users WHERE id = ?', [req.user.id]);

    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({ user: users[0] });
  } catch (error) {
    console.error('Auth check error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// One-time admin promotion — POST with { email, secret } where secret = JWT_SECRET
router.post('/promote-admin', async (req, res) => {
  const { email, secret } = req.body;
  if (secret !== (process.env.JWT_SECRET || 'fallback_secret')) {
    return res.status(403).json({ error: 'Invalid secret' });
  }
  try {
    const [result] = await pool.query('UPDATE users SET is_admin = 1 WHERE email = ?', [email]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'User not found' });
    res.json({ message: `${email} promoted to admin. Log out and log back in.` });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
