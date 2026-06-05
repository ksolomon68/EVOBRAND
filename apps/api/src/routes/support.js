const express = require('express');
const router = express.Router();
const pool = require('../db/connection');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { getEmailTemplate } = require('../utils/emailTemplate');
const { Resend } = require('resend');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { createNotification, notifyAdmins } = require('../utils/notifications');

// ── File upload setup ─────────────────────────────────────────────────────────
const UPLOADS_DIR = path.join(__dirname, '../../uploads');
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) => {
    const safe = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    cb(null, `${Date.now()}-${safe}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|pdf|doc|docx|txt|zip|mp4|mov|webm/;
    const ext = path.extname(file.originalname).toLowerCase().replace('.', '');
    allowed.test(ext) ? cb(null, true) : cb(new Error('File type not allowed'));
  },
});

// Auto-migrate: add missing columns on startup
pool.query("ALTER TABLE support_tickets ADD COLUMN attachment_url VARCHAR(500)").catch(() => {});
// Stored as a promise so handlers can await it before querying support_plan
const ensureSupportPlan = pool.query(
  "ALTER TABLE users ADD COLUMN support_plan ENUM('basic','pro','elite') DEFAULT NULL"
).catch(() => {});

const getResend = () => new Resend(process.env.RESEND_API_KEY || 're_placeholder');

// Helper: check if requester is admin from DB (not token, which may be stale)
async function isAdminUser(userId) {
  const adminEmail = process.env.ADMIN_EMAIL || 'ks@evobrand.net';
  const [rows] = await pool.query('SELECT is_admin, email FROM users WHERE id = ?', [userId]);
  if (!rows[0]) return false;
  // Accept if DB flag is set OR if it's the designated admin email
  if (rows[0].email === adminEmail) {
    // Ensure DB is kept in sync
    await pool.query('UPDATE users SET is_admin = 1 WHERE id = ?', [userId]).catch(() => {});
    return true;
  }
  return rows[0].is_admin == 1 || rows[0].is_admin === true;
}

// @route GET /api/support/tickets
// @desc  Get all tickets (Admins see all, users see their own)
router.get('/tickets', authenticateToken, async (req, res) => {
  try {
    const admin = await isAdminUser(req.user.id);
    let query = `
      SELECT t.*, u.name as user_name, u.email as user_email
      FROM support_tickets t
      LEFT JOIN users u ON t.user_id = u.id
    `;
    const params = [];

    if (!admin) {
      query += ' WHERE t.user_id = ?';
      params.push(req.user.id);
    }
    
    query += ' ORDER BY t.updated_at DESC';

    const [tickets] = await pool.query(query, params);
    res.status(200).json({ tickets });
  } catch (error) {
    console.error('Fetch tickets error:', error);
    res.status(500).json({ error: 'Server error fetching tickets' });
  }
});

// @route GET /api/support/tickets/:id
// @desc  Get a single ticket with replies
router.get('/tickets/:id', authenticateToken, async (req, res) => {
  try {
    const ticketId = req.params.id;

    // Fetch ticket
    let query = `
      SELECT t.*, u.name as user_name, u.email as user_email, u.id as user_id, u.support_plan as user_support_plan
      FROM support_tickets t
      LEFT JOIN users u ON t.user_id = u.id
      WHERE t.id = ?
    `;
    const [tickets] = await pool.query(query, [ticketId]);

    if (tickets.length === 0) return res.status(404).json({ error: 'Ticket not found' });
    const ticket = tickets[0];

    // Check permission
    const admin = await isAdminUser(req.user.id);
    if (!admin && ticket.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Fetch replies
    const [replies] = await pool.query(`
      SELECT r.*, u.name as sender_name, u.is_admin as sender_is_admin
      FROM ticket_replies r
      LEFT JOIN users u ON r.sender_id = u.id
      WHERE r.ticket_id = ?
      ORDER BY r.created_at ASC
    `, [ticketId]);

    res.status(200).json({ ticket, replies });
  } catch (error) {
    console.error('Fetch ticket error:', error);
    res.status(500).json({ error: 'Server error fetching ticket' });
  }
});

// @route POST /api/support/ticket
// @desc  Create a new support ticket — accepts multipart/form-data for file uploads
router.post('/ticket', upload.single('file'), async (req, res) => {
  const { email, name, subject, message, priority, service, ticket_type, has_plan } = req.body;

  if (!email || !subject || !message) {
    return res.status(400).json({ error: 'Email, subject, and message are required' });
  }

  try {
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      let [users] = await connection.query('SELECT id FROM users WHERE email = ?', [email]);
      let userId;

      if (users.length === 0) {
        const [insertResult] = await connection.query(
          'INSERT INTO users (email, name) VALUES (?, ?)',
          [email, name || '']
        );
        userId = insertResult.insertId;
      } else {
        userId = users[0].id;
      }

      // Build attachment URL if a file was uploaded
      let attachmentUrl = null;
      if (req.file) {
        attachmentUrl = `/uploads/${req.file.filename}`;
      }

      const [ticketResult] = await connection.query(
        'INSERT INTO support_tickets (user_id, subject, message, priority, service, attachment_url, ticket_type, plan_covered) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [userId, subject, message, priority || 'normal', service || 'General', attachmentUrl, ticket_type || 'standard', has_plan === '1' ? 1 : 0]
      );

      await connection.commit();
      const ticketId = ticketResult.insertId;

      // Send Email Notifications
      try {
        const attachmentNote = attachmentUrl
          ? `<p><strong>Attachment:</strong> <a href="https://evobrandconcepts.com${attachmentUrl}">${req.file.originalname}</a></p>`
          : '';
        await getResend().emails.send({
          from: `"EVOBRAND" <${process.env.RESEND_FROM_EMAIL || 'info@evobrand.net'}>`,
          to: 'info@evobrand.net',
          subject: `New Ticket: ${subject}`,
            html: getEmailTemplate(`New Ticket: ${subject}`, `<p><strong>New Support Ticket from ${name || email}</strong></p>
                 <p><strong>Priority:</strong> ${priority || 'normal'}</p>
                 <p><strong>Service:</strong> ${service || 'General'}</p>
                 <p><strong>Message:</strong><br/>${message}</p>${attachmentNote}`)
        });
        await getResend().emails.send({
          from: `"EVOBRAND" <${process.env.RESEND_FROM_EMAIL || 'info@evobrand.net'}>`,
          to: email,
          subject: `Ticket Received: ${subject}`,
            html: getEmailTemplate(`Ticket Received: ${subject}`, `<p>Hi ${name || ''},</p>
                 <p>We have successfully received your support ticket. Our team will review it and get back to you shortly.</p>
                 <p><strong>Your Message:</strong><br/>${message}</p>`)
        });
      } catch (emailErr) {
        console.error('Email notification failed:', emailErr);
      }
      
      // Notify admins via in-app notifications
      await notifyAdmins(
        'New Support Ticket', 
        `${name || email} has opened a new ticket: ${subject}`, 
        '/client-portal', 
        'ticket'
      );

      res.status(201).json({ message: 'Support ticket created successfully', ticketId });
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Support ticket error:', error);
    res.status(500).json({ error: 'Server error while creating ticket' });
  }
});

// @route POST /api/support/tickets/:id/reply
// @desc  Add a reply to a ticket
router.post('/tickets/:id/reply', authenticateToken, async (req, res) => {
  const { message } = req.body;
  const ticketId = req.params.id;

  if (!message) return res.status(400).json({ error: 'Message is required' });

  try {
    // Verify access
    const [tickets] = await pool.query('SELECT t.*, u.email as user_email, u.name as user_name FROM support_tickets t LEFT JOIN users u ON t.user_id = u.id WHERE t.id = ?', [ticketId]);
    if (tickets.length === 0) return res.status(404).json({ error: 'Ticket not found' });
    
    const currentTicket = tickets[0];
    const admin = await isAdminUser(req.user.id);
    if (!admin && currentTicket.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Insert reply
    await pool.query(
      'INSERT INTO ticket_replies (ticket_id, sender_id, message) VALUES (?, ?, ?)',
      [ticketId, req.user.id, message]
    );

    // Update ticket updated_at and status if replied by user
    if (!admin) {
      await pool.query('UPDATE support_tickets SET status = "open", updated_at = NOW() WHERE id = ?', [ticketId]);
      await notifyAdmins('New Ticket Reply', `Client replied to ticket #${ticketId}`, '/client-portal', 'ticket');
      
      // Email Admin
      await getResend().emails.send({
        from: `"EVOBRAND" <${process.env.RESEND_FROM_EMAIL || 'info@evobrand.net'}>`,
        to: 'info@evobrand.net',
        subject: `New Reply: Ticket #${ticketId}`,
            html: getEmailTemplate(`New Reply: Ticket #${ticketId}`, `<p>The client has replied to ticket #${ticketId} ("${currentTicket.subject}"). The status is now <strong>OPEN</strong>.</p>
               <p><strong>Message:</strong><br/>${message}</p>`)
      }).catch(err => console.error('Admin email fail:', err));

    } else {
      await pool.query('UPDATE support_tickets SET status = "in_progress", updated_at = NOW() WHERE id = ?', [ticketId]);
      await createNotification(currentTicket.user_id, 'New Reply', `You received a reply on your ticket`, '/client-portal', 'ticket');
      
      // Email User
      if (currentTicket.user_email) {
        await getResend().emails.send({
          from: `"EVOBRAND" <${process.env.RESEND_FROM_EMAIL || 'info@evobrand.net'}>`,
          to: currentTicket.user_email,
          subject: `New Reply on Ticket: ${currentTicket.subject}`,
            html: getEmailTemplate(`New Reply on Ticket: ${currentTicket.subject}`, `<p>Hi ${currentTicket.user_name || ''},</p>
                 <p>An admin has replied to your ticket "<strong>${currentTicket.subject}</strong>". The status is now <strong>IN PROGRESS</strong>.</p>
                 <p><strong>Reply:</strong><br/>${message}</p>`)
        }).catch(err => console.error('Status email fail:', err));
      }
    }

    res.status(201).json({ message: 'Reply added successfully' });
  } catch (error) {
    console.error('Reply error:', error);
    res.status(500).json({ error: 'Server error adding reply' });
  }
});

// @route PUT /api/support/tickets/:id
// @desc  Admin update ticket status, priority, price
router.put('/tickets/:id', authenticateToken, async (req, res) => {
  const { status, priority, quoted_price, is_paid } = req.body;
  const ticketId = req.params.id;

  try {
    const admin = await isAdminUser(req.user.id);
    if (!admin) return res.status(403).json({ error: 'Admin access required' });

    const [currentTickets] = await pool.query('SELECT t.*, u.email as user_email, u.name as user_name FROM support_tickets t LEFT JOIN users u ON t.user_id = u.id WHERE t.id = ?', [ticketId]);
    if (currentTickets.length === 0) return res.status(404).json({ error: 'Ticket not found' });
    const currentTicket = currentTickets[0];

    await pool.query(
      'UPDATE support_tickets SET status = COALESCE(?, status), priority = COALESCE(?, priority), quoted_price = COALESCE(?, quoted_price), is_paid = COALESCE(?, is_paid) WHERE id = ?',
      [status, priority, quoted_price, is_paid, ticketId]
    );

    // Notifications
    if (quoted_price !== undefined || is_paid !== undefined) {
      if (currentTicket.user_id) {
        await createNotification(
          currentTicket.user_id, 
          'Ticket Invoice Updated', 
          `The pricing or invoice status for your ticket #${ticketId} has been updated.`, 
          '/client-portal', 
          'invoice'
        );
      }
    }

    // Status email updates
    if (status && status !== currentTicket.status) {
      const formattedStatus = status.replace('_', ' ').toUpperCase();
      
      // Email User
      if (currentTicket.user_email) {
        await getResend().emails.send({
          from: `"EVOBRAND" <${process.env.RESEND_FROM_EMAIL || 'info@evobrand.net'}>`,
          to: currentTicket.user_email,
          subject: `Ticket Status Updated: ${currentTicket.subject}`,
            html: getEmailTemplate(`Ticket Status Updated: ${currentTicket.subject}`, `<p>Hi ${currentTicket.user_name || ''},</p>
                 <p>The status of your ticket "<strong>${currentTicket.subject}</strong>" has been updated to <strong>${formattedStatus}</strong>.</p>
                 <p>Log in to your Client Portal for more details.</p>`)
        }).catch(err => console.error('Status email fail:', err));
      }
      
      // Email Admin
      await getResend().emails.send({
        from: `"EVOBRAND" <${process.env.RESEND_FROM_EMAIL || 'info@evobrand.net'}>`,
        to: 'info@evobrand.net',
        subject: `Ticket Status Changed: #${ticketId}`,
            html: getEmailTemplate(`Ticket Status Changed: #${ticketId}`, `<p>Ticket #${ticketId} ("${currentTicket.subject}") status changed to <strong>${formattedStatus}</strong> by an admin.</p>`)
      }).catch(err => console.error('Admin email fail:', err));
    }

    res.status(200).json({ message: 'Ticket updated successfully' });
  } catch (error) {
    console.error('Update ticket error:', error);
    res.status(500).json({ error: 'Server error updating ticket' });
  }
});

// @route POST /api/support/tickets/:id/close
// @desc  Client close ticket
router.post('/tickets/:id/close', authenticateToken, async (req, res) => {
  const ticketId = req.params.id;

  try {
    // Verify access
    const [tickets] = await pool.query('SELECT t.*, u.email as user_email, u.name as user_name FROM support_tickets t LEFT JOIN users u ON t.user_id = u.id WHERE t.id = ?', [ticketId]);
    if (tickets.length === 0) return res.status(404).json({ error: 'Ticket not found' });
    
    const currentTicket = tickets[0];
    const admin = await isAdminUser(req.user.id);
    if (!admin && currentTicket.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await pool.query('UPDATE support_tickets SET status = "closed", updated_at = NOW() WHERE id = ?', [ticketId]);

    if (currentTicket.status !== 'closed') {
      // Email User
      if (currentTicket.user_email) {
        await getResend().emails.send({
          from: `"EVOBRAND" <${process.env.RESEND_FROM_EMAIL || 'info@evobrand.net'}>`,
          to: currentTicket.user_email,
          subject: `Ticket Closed: ${currentTicket.subject}`,
            html: getEmailTemplate(`Ticket Closed: ${currentTicket.subject}`, `<p>Hi ${currentTicket.user_name || ''},</p>
                 <p>Your ticket "<strong>${currentTicket.subject}</strong>" has been closed.</p>`)
        }).catch(err => console.error('Status email fail:', err));
      }
      
      // Email Admin
      await getResend().emails.send({
        from: `"EVOBRAND" <${process.env.RESEND_FROM_EMAIL || 'info@evobrand.net'}>`,
        to: 'info@evobrand.net',
        subject: `Ticket Closed by Client: #${ticketId}`,
            html: getEmailTemplate(`Ticket Closed by Client: #${ticketId}`, `<p>Ticket #${ticketId} ("${currentTicket.subject}") was closed by the client.</p>`)
      }).catch(err => console.error('Admin email fail:', err));
    }

    res.status(200).json({ message: 'Ticket closed successfully' });
  } catch (error) {
    console.error('Close ticket error:', error);
    res.status(500).json({ error: 'Server error closing ticket' });
  }
});

// @route GET /api/support/users
// @desc  Admin: list all users with their support plan
router.get('/users', authenticateToken, async (req, res) => {
  try {
    const admin = await isAdminUser(req.user.id);
    if (!admin) return res.status(403).json({ error: 'Admin access required' });

    let users;
    try {
      // Primary query — requires support_plan column to exist
      [users] = await pool.query(
        'SELECT id, name, email, support_plan, created_at FROM users WHERE is_admin = 0 OR is_admin IS NULL ORDER BY created_at DESC'
      );
    } catch {
      // Column missing: try to add it, then retry. If ALTER is blocked (e.g. no DDL
      // permission on shared hosting), fall back to NULL so the list still loads.
      await pool.query(
        "ALTER TABLE users ADD COLUMN support_plan ENUM('basic','pro','elite') DEFAULT NULL"
      ).catch(() => {});
      try {
        [users] = await pool.query(
          'SELECT id, name, email, support_plan, created_at FROM users WHERE is_admin = 0 OR is_admin IS NULL ORDER BY created_at DESC'
        );
      } catch {
        [users] = await pool.query(
          'SELECT id, name, email, NULL as support_plan, created_at FROM users WHERE is_admin = 0 OR is_admin IS NULL ORDER BY created_at DESC'
        );
      }
    }

    res.status(200).json({ users });
  } catch (error) {
    console.error('Fetch users error:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

// @route PUT /api/support/users/:id/plan
// @desc  Admin: set or remove a user's support plan
router.put('/users/:id/plan', authenticateToken, async (req, res) => {
  try {
    const admin = await isAdminUser(req.user.id);
    if (!admin) return res.status(403).json({ error: 'Admin access required' });

    const { plan } = req.body; // 'basic' | 'pro' | 'elite' | null
    const allowedPlans = ['basic', 'pro', 'elite', null, ''];
    if (!allowedPlans.includes(plan)) {
      return res.status(400).json({ error: 'Invalid plan. Use basic, pro, elite, or null.' });
    }

    await ensureSupportPlan;
    await pool.query('UPDATE users SET support_plan = ? WHERE id = ?', [plan || null, req.params.id]);
    res.status(200).json({ message: 'Support plan updated' });
  } catch (error) {
    console.error('Update plan error:', error);
    res.status(500).json({ error: error.message || 'Server error updating plan' });
  }
});

// @route POST /api/support/users
// @desc  Admin: create a new user/client and assign a support plan
router.post('/users', authenticateToken, async (req, res) => {
  try {
    const admin = await isAdminUser(req.user.id);
    if (!admin) return res.status(403).json({ error: 'Admin access required' });

    const { name, email, plan } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    const allowedPlans = ['basic', 'pro', 'elite', null, ''];
    if (plan && !allowedPlans.includes(plan)) {
      return res.status(400).json({ error: 'Invalid plan.' });
    }

    // Check if user exists
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ error: 'User with this email already exists.' });
    }

    // Generate random secure password
    const crypto = require('crypto');
    const bcrypt = require('bcryptjs');
    const randomPassword = crypto.randomBytes(8).toString('hex'); // 16 char string
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(randomPassword, salt);

    // Insert user
    await ensureSupportPlan;
    await pool.query(
      'INSERT INTO users (email, name, password_hash, support_plan, is_admin) VALUES (?, ?, ?, ?, FALSE)',
      [email, name || '', passwordHash, plan || null]
    );

    // Send Welcome Email
    try {
      await getResend().emails.send({
        from: `"EVOBRAND" <${process.env.RESEND_FROM_EMAIL || 'info@evobrand.net'}>`,
        to: email,
        subject: `Welcome to EVOBRAND Client Portal`,
        html: getEmailTemplate(`Welcome to EVOBRAND Client Portal`, 
             `<p>Hi ${name || ''},</p>
             <p>An account has been created for you in the EVOBRAND Client Portal.</p>
             <p>We have also provisioned your assigned service plan.</p>
             <p>To access your account and submit tickets, please visit the portal and use the <strong>Forgot Password</strong> link to set your secure password.</p>
             <p><a href="https://evobrandconcepts.com/login" style="color: #22c8e5;">Go to Client Portal</a></p>`)
      });
    } catch (emailErr) {
      console.error('Welcome email failed:', emailErr);
    }

    res.status(201).json({ message: 'Client created successfully' });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ error: error.message || 'Server error creating client' });
  }
});

module.exports = router;
