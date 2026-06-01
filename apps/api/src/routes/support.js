const express = require('express');
const router = express.Router();
const pool = require('../db/connection');
const nodemailer = require('nodemailer');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { createNotification, notifyAdmins } = require('../utils/notifications');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'mail.evobrandconcepts.com',
  port: process.env.SMTP_PORT || 465,
  secure: true,
  auth: {
    user: process.env.SMTP_USER || 'no-reply@evobrandconcepts.com',
    pass: process.env.SMTP_PASS || '_rW+*ze&E%qw.AJ]'
  }
});

// Helper: check if requester is admin from DB (not token, which may be stale)
async function isAdminUser(userId) {
  const [rows] = await pool.query('SELECT is_admin FROM users WHERE id = ?', [userId]);
  return rows[0]?.is_admin == 1 || rows[0]?.is_admin === true;
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
      SELECT t.*, u.name as user_name, u.email as user_email
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
// @desc  Create a new support ticket (Public or authenticated)
router.post('/ticket', async (req, res) => {
  const { email, name, subject, message, priority } = req.body;

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

      const [ticketResult] = await connection.query(
        'INSERT INTO support_tickets (user_id, subject, message, priority) VALUES (?, ?, ?, ?)',
        [userId, subject, message, priority || 'normal']
      );

      await connection.commit();
      const ticketId = ticketResult.insertId;

      // Send Email Notifications
      try {
        await transporter.sendMail({
          from: `"EVOBRAND Support" <${process.env.SMTP_USER || 'no-reply@evobrandconcepts.com'}>`,
          to: 'info@evobrandconcepts.com',
          subject: `New Ticket: ${subject}`,
          html: `<p><strong>New Support Ticket from ${name || email}</strong></p>
                 <p><strong>Priority:</strong> ${priority || 'normal'}</p>
                 <p><strong>Message:</strong><br/>${message}</p>`
        });
        await transporter.sendMail({
          from: `"EVOBRAND Support" <${process.env.SMTP_USER || 'no-reply@evobrandconcepts.com'}>`,
          to: email,
          subject: `Ticket Received: ${subject}`,
          html: `<p>Hi ${name || ''},</p>
                 <p>We have successfully received your support ticket. Our team will review it and get back to you shortly.</p>
                 <p><strong>Your Message:</strong><br/>${message}</p>`
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
    const [tickets] = await pool.query('SELECT user_id FROM support_tickets WHERE id = ?', [ticketId]);
    if (tickets.length === 0) return res.status(404).json({ error: 'Ticket not found' });
    
    const admin = await isAdminUser(req.user.id);
    if (!admin && tickets[0].user_id !== req.user.id) {
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
    } else {
      await pool.query('UPDATE support_tickets SET status = "in_progress", updated_at = NOW() WHERE id = ?', [ticketId]);
      await createNotification(tickets[0].user_id, 'New Reply', `You received a reply on your ticket`, '/client-portal', 'ticket');
    }

    res.status(201).json({ message: 'Reply added successfully' });
  } catch (error) {
    console.error('Reply error:', error);
    res.status(500).json({ error: 'Server error adding reply' });
  }
});

// @route PUT /api/support/tickets/:id
// @desc  Admin update ticket status, priority, price
router.put('/tickets/:id', authenticateToken, requireAdmin, async (req, res) => {
  const { status, priority, quoted_price, is_paid } = req.body;
  const ticketId = req.params.id;

  try {
    const [result] = await pool.query(
      'UPDATE support_tickets SET status = COALESCE(?, status), priority = COALESCE(?, priority), quoted_price = COALESCE(?, quoted_price), is_paid = COALESCE(?, is_paid) WHERE id = ?',
      [status, priority, quoted_price, is_paid, ticketId]
    );

    if (result.affectedRows === 0) return res.status(404).json({ error: 'Ticket not found' });
    
    // If a quoted_price or is_paid was updated, notify the client
    if (quoted_price !== undefined || is_paid !== undefined) {
      const [tickets] = await pool.query('SELECT user_id FROM support_tickets WHERE id = ?', [ticketId]);
      if (tickets.length > 0 && tickets[0].user_id) {
        await createNotification(
          tickets[0].user_id, 
          'Ticket Invoice Updated', 
          `The pricing or invoice status for your ticket #${ticketId} has been updated.`, 
          '/client-portal', 
          'invoice'
        );
      }
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
    const [tickets] = await pool.query('SELECT user_id FROM support_tickets WHERE id = ?', [ticketId]);
    if (tickets.length === 0) return res.status(404).json({ error: 'Ticket not found' });
    
    const admin = await isAdminUser(req.user.id);
    if (!admin && tickets[0].user_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await pool.query('UPDATE support_tickets SET status = "closed", updated_at = NOW() WHERE id = ?', [ticketId]);

    res.status(200).json({ message: 'Ticket closed successfully' });
  } catch (error) {
    console.error('Close ticket error:', error);
    res.status(500).json({ error: 'Server error closing ticket' });
  }
});

module.exports = router;
