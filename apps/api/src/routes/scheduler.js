const express = require('express');
const router = express.Router();
const pool = require('../db/connection');
const nodemailer = require('nodemailer');
const { createNotification, notifyAdmins } = require('../utils/notifications');
const { authenticateToken } = require('../middleware/auth');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'mail.evobrandconcepts.com',
  port: process.env.SMTP_PORT || 465,
  secure: true,
  auth: {
    user: process.env.SMTP_USER || 'no-reply@evobrandconcepts.com',
    pass: process.env.SMTP_PASS || '_rW+*ze&E%qw.AJ]'
  }
});

// Get all blackout dates
router.get('/blackout-dates', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM blackout_dates');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching blackout dates:', error);
    res.status(500).json({ error: 'Failed to fetch blackout dates' });
  }
});

// Add blackout date
router.post('/blackout-dates', async (req, res) => {
  const { date, time, reason } = req.body;
  if (!date) return res.status(400).json({ error: 'Date is required' });

  try {
    const [result] = await pool.query(
      'INSERT INTO blackout_dates (date, time, reason) VALUES (?, ?, ?)',
      [date, time || null, reason]
    );
    res.json({ id: result.insertId, date, time, reason });
  } catch (error) {
    console.error('Error adding blackout date:', error);
    res.status(500).json({ error: 'Failed to add blackout date' });
  }
});

// Delete blackout date
router.delete('/blackout-dates/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM blackout_dates WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting blackout date:', error);
    res.status(500).json({ error: 'Failed to delete blackout date' });
  }
});

// Get user meetings (admins see all)
router.get('/meetings/:userId', authenticateToken, async (req, res) => {
  const { userId } = req.params;
  try {
    const [userRows] = await pool.query('SELECT is_admin, email FROM users WHERE id = ?', [req.user.id]);
    const isAdmin = userRows[0] && (userRows[0].is_admin == 1 || userRows[0].is_admin === true || userRows[0].email === 'ks@evobrand.net');

    let rows;
    if (isAdmin) {
      [rows] = await pool.query(`
        SELECT m.*, u.name as client_name, u.email as client_email 
        FROM meetings m 
        LEFT JOIN users u ON m.user_id = u.id 
        ORDER BY m.date DESC, m.time DESC
      `);
    } else {
      if (parseInt(userId) !== req.user.id) {
        return res.status(403).json({ error: 'Unauthorized' });
      }
      [rows] = await pool.query('SELECT * FROM meetings WHERE user_id = ? ORDER BY date DESC, time DESC', [userId]);
    }
    res.json(rows);
  } catch (error) {
    console.error('Error fetching meetings:', error);
    res.status(500).json({ error: 'Failed to fetch meetings' });
  }
});

// Get booked time slots for a specific date
router.get('/booked-slots', async (req, res) => {
  const { date } = req.query;
  if (!date) return res.status(400).json({ error: 'Date is required' });

  try {
    const [rows] = await pool.query('SELECT time FROM meetings WHERE date = ? AND status != ?', [date, 'canceled']);
    res.json(rows.map(row => row.time));
  } catch (error) {
    console.error('Error fetching booked slots:', error);
    res.status(500).json({ error: 'Failed to fetch booked slots' });
  }
});

// Book a new appointment (supports guest bookings with clientName/clientEmail)
router.post('/book', async (req, res) => {
  const { clientName, clientEmail, service, date, time, type, duration, notes, user_id } = req.body;

  if (!date || !time) {
    return res.status(400).json({ error: 'Date and time are required' });
  }
  if (!user_id && (!clientName || !clientEmail)) {
    return res.status(400).json({ error: 'Name and email are required for guest bookings' });
  }

  try {
    let resolvedUserId = user_id || null;

    // For guest bookings, find or create a user record
    if (!resolvedUserId && clientEmail) {
      const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [clientEmail]);
      if (existing.length > 0) {
        resolvedUserId = existing[0].id;
      } else {
        const [inserted] = await pool.query(
          'INSERT INTO users (email, name) VALUES (?, ?)',
          [clientEmail, clientName || '']
        );
        resolvedUserId = inserted.insertId;
      }
    }

    const meet_link = `https://meet.google.com/evobrand-${Math.random().toString(36).substring(7)}`;
    const bookingType = type || (service ? 'discovery' : 'other');

    const [result] = await pool.query(
      'INSERT INTO meetings (user_id, date, time, type, duration, notes, meet_link, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [resolvedUserId, date, time, bookingType, duration || 30, notes || '', meet_link, 'scheduled']
    );

    // Fetch user details for email if not provided
    let finalEmail = clientEmail;
    let finalName = clientName;
    if (!finalEmail && resolvedUserId) {
      const [uRows] = await pool.query('SELECT email, name FROM users WHERE id = ?', [resolvedUserId]);
      if (uRows.length > 0) {
        finalEmail = uRows[0].email;
        finalName = uRows[0].name;
      }
    }

    try {
      if (finalEmail) {
        await transporter.sendMail({
          from: `"EVOBRAND Scheduling" <${process.env.SMTP_USER || 'no-reply@evobrandconcepts.com'}>`,
          to: finalEmail,
          subject: 'Appointment Confirmed',
          html: `
            <p>Hi ${finalName || 'there'},</p>
            <p>Your ${bookingType} session is scheduled for <strong>${date}</strong> at <strong>${time}</strong>.</p>
            <p><strong>Meeting Link:</strong> <a href="${meet_link}">${meet_link}</a></p>
            <p>Thank you for choosing EVOBRAND.</p>
          `
        });
      }

      await transporter.sendMail({
        from: `"EVOBRAND Scheduling" <${process.env.SMTP_USER || 'no-reply@evobrandconcepts.com'}>`,
        to: 'info@evobrand.net',
        subject: `New Booking: ${finalName || finalEmail}`,
        html: `
          <p><strong>New Booking Details:</strong></p>
          <ul>
            <li>Name: ${finalName || 'N/A'}</li>
            <li>Email: ${finalEmail || 'N/A'}</li>
            <li>Date: ${date}</li>
            <li>Time: ${time}</li>
            <li>Type: ${bookingType}</li>
            <li>Notes: ${notes || 'None'}</li>
          </ul>
        `
      });
    } catch (emailErr) {
      console.error('Failed to send booking emails:', emailErr);
    }

    if (resolvedUserId) {
      await createNotification(
        resolvedUserId,
        'Booking Confirmed',
        `Your appointment on ${date} at ${time} is confirmed.`,
        '/client-portal',
        'event'
      ).catch(() => {});
    }
    await notifyAdmins(
      'New Booking',
      `${finalName || finalEmail} booked a session for ${date} at ${time}.`,
      '/admin',
      'event'
    ).catch(() => {});

    res.json({ success: true, meeting_id: result.insertId, meet_link });
  } catch (error) {
    console.error('Error booking appointment:', error);
    res.status(500).json({ error: 'Failed to book appointment' });
  }
});

// Cancel a meeting
router.post('/meetings/:id/cancel', async (req, res) => {
  const { id } = req.params;
  try {
    // Get meeting details before cancelling
    const [meetings] = await pool.query(`
      SELECT m.*, u.email as user_email, u.name as user_name 
      FROM meetings m 
      LEFT JOIN users u ON m.user_id = u.id 
      WHERE m.id = ?
    `, [id]);
    
    await pool.query('UPDATE meetings SET status = ? WHERE id = ?', ['canceled', id]);
    
    if (meetings.length > 0) {
      const meeting = meetings[0];
      try {
        if (meeting.user_email) {
          await transporter.sendMail({
            from: `"EVOBRAND Scheduling" <${process.env.SMTP_USER || 'no-reply@evobrandconcepts.com'}>`,
            to: meeting.user_email,
            subject: 'Appointment Cancelled',
            html: `
              <p>Hi ${meeting.user_name || 'there'},</p>
              <p>Your appointment on <strong>${meeting.date}</strong> at <strong>${meeting.time}</strong> has been cancelled.</p>
            `
          });
        }
        await transporter.sendMail({
          from: `"EVOBRAND Scheduling" <${process.env.SMTP_USER || 'no-reply@evobrandconcepts.com'}>`,
          to: 'info@evobrand.net',
          subject: `Booking Cancelled: ${meeting.date} at ${meeting.time}`,
          html: `<p>The appointment for ${meeting.user_name || meeting.user_email || 'a client'} on ${meeting.date} at ${meeting.time} has been cancelled.</p>`
        });
      } catch (err) {
        console.error('Failed to send cancellation emails:', err);
      }
      
      if (meeting.user_id) {
        await createNotification(
          meeting.user_id,
          'Appointment Cancelled',
          `Your appointment on ${meeting.date} at ${meeting.time} was cancelled.`,
          '/client-portal',
          'event'
        ).catch(() => {});
      }
      await notifyAdmins(
        'Booking Cancelled',
        `The appointment on ${meeting.date} at ${meeting.time} was cancelled.`,
        '/admin',
        'event'
      ).catch(() => {});
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error canceling meeting:', error);
    res.status(500).json({ error: 'Failed to cancel meeting' });
  }
});

module.exports = router;
