const express = require('express');
const router = express.Router();
const pool = require('../db/connection');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { authenticateToken } = require('../middleware/auth');
const { sendEmail } = require('../utils/mailer');
const { getEmailTemplate } = require('../utils/emailTemplate');

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

// Auto-migrate: add password reset columns if missing
pool.query("ALTER TABLE users ADD COLUMN reset_token VARCHAR(255) DEFAULT NULL").catch(() => {});
pool.query("ALTER TABLE users ADD COLUMN reset_token_expires_at TIMESTAMP NULL DEFAULT NULL").catch(() => {});

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

    // 5. Backfill: link any contracts/meetings created for this email before registration
    pool.query(
      'UPDATE contracts SET client_user_id = ? WHERE client_email = ? AND client_user_id IS NULL',
      [insertResult.insertId, email]
    ).catch(() => {});
    pool.query(
      'UPDATE meetings m JOIN users u ON u.email = ? SET m.user_id = ? WHERE m.user_id = u.id AND u.id != ?',
      [email, insertResult.insertId, insertResult.insertId]
    ).catch(() => {});

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
    const adminEmail = process.env.ADMIN_EMAIL || 'ks@evobrand.net';
    if (userRecord.email === adminEmail) {
      await pool.query('UPDATE users SET is_admin = 1 WHERE id = ?', [userRecord.id]);
      userRecord.is_admin = 1;
    }

    const userPayload = { id: userRecord.id, email: userRecord.email, name: userRecord.name, is_admin: userRecord.is_admin };
    const token = jwt.sign(userPayload, JWT_SECRET, { expiresIn: '7d' });

    // Backfill: link any contracts/meetings created for this email before user registered
    pool.query(
      'UPDATE contracts SET client_user_id = ? WHERE client_email = ? AND client_user_id IS NULL',
      [userRecord.id, userRecord.email]
    ).catch(() => {});
    pool.query(
      'UPDATE meetings SET user_id = ? WHERE user_id IN (SELECT id FROM users WHERE email = ? AND id != ?) OR user_id IS NULL',
      [userRecord.id, userRecord.email, userRecord.id]
    ).catch(() => {});

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
    const [users] = await pool.query('SELECT id, email, name, is_admin, support_plan, created_at FROM users WHERE id = ?', [req.user.id]);

    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({ user: users[0] });
  } catch (error) {
    console.error('Auth check error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route POST /api/auth/forgot-password
// @desc  Request a password reset email
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required' });

  try {
    const [users] = await pool.query('SELECT id, name FROM users WHERE email = ?', [email]);

    // Always respond with success to prevent user enumeration
    if (users.length === 0) {
      return res.status(200).json({ message: 'If that email exists, a reset link has been sent.' });
    }

    const user = users[0];
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await pool.query(
      'UPDATE users SET reset_token = ?, reset_token_expires_at = ? WHERE id = ?',
      [token, expiresAt, user.id]
    );

    const appUrl = process.env.APP_URL || 'https://evobrandconcepts.com';
    const resetLink = `${appUrl}/reset-password?token=${token}`;

    try {
      await sendEmail({
        from: `"EVOBRAND" <${process.env.RESEND_FROM_EMAIL || 'info@evobrand.net'}>`,
        to: email,
        subject: 'Reset Your EVOBRAND Password',
        html: getEmailTemplate('Reset Your Password',
          `<p>Hi ${user.name || 'there'},</p>
          <p>We received a request to reset the password for your EVOBRAND Client Portal account.</p>
          <p>Click the button below to set a new password. This link expires in <strong>1 hour</strong>.</p>
          <p style="text-align:center;"><a href="${resetLink}" class="btn">Reset Password</a></p>
          <p>If you didn't request this, you can safely ignore this email — your password won't change.</p>`)
      });
    } catch (emailErr) {
      console.error('Password reset email failed:', emailErr);
    }

    res.status(200).json({ message: 'If that email exists, a reset link has been sent.' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route POST /api/auth/reset-password
// @desc  Reset password using a valid token
router.post('/reset-password', async (req, res) => {
  const { token, password } = req.body;

  if (!token || !password) {
    return res.status(400).json({ error: 'Token and new password are required' });
  }
  if (password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters' });
  }

  try {
    const [users] = await pool.query(
      'SELECT id FROM users WHERE reset_token = ? AND reset_token_expires_at > NOW()',
      [token]
    );

    if (users.length === 0) {
      return res.status(400).json({ error: 'Reset link is invalid or has expired' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    await pool.query(
      'UPDATE users SET password_hash = ?, reset_token = NULL, reset_token_expires_at = NULL WHERE id = ?',
      [passwordHash, users[0].id]
    );

    res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
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
