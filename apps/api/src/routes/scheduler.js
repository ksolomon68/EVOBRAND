const express = require('express');
const router = express.Router();
const pool = require('../db/connection');
const { getEmailTemplate } = require('../utils/emailTemplate');
// const { Resend } = require('resend');
const { createNotification, notifyAdmins } = require('../utils/notifications');
const { authenticateToken } = require('../middleware/auth');

// const resend = new Resend(process.env.RESEND_API_KEY);

const generateICS = (dateStr, timeStr, duration, bookingType, clientName, meetLink, notes) => {
  const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!match) return null;
  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const isPM = match[3].toUpperCase() === 'PM';
  if (isPM && hours < 12) hours += 12;
  if (!isPM && hours === 12) hours = 0;
  
  const [year, month, day] = dateStr.split('-');
  const pad = (n) => n.toString().padStart(2, '0');
  const startDt = new Date(year, month - 1, day, hours, minutes);
  const endDt = new Date(startDt.getTime() + (duration * 60000));
  
  const formatDT = (d) => `${d.getFullYear()}${pad(d.getMonth()+1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}00`;
  
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//EVOBRAND//Scheduling//EN',
    'BEGIN:VEVENT',
    `UID:${Date.now()}@evobrand.net`,
    `DTSTAMP:${formatDT(new Date())}`,
    `DTSTART;TZID=America/Chicago:${formatDT(startDt)}`,
    `DTEND;TZID=America/Chicago:${formatDT(endDt)}`,
    `SUMMARY:EVOBRAND ${bookingType} Session`,
    `DESCRIPTION:Consultation with ${clientName || 'Client'}\\n\\nMeeting Link: ${meetLink}\\n\\nNotes: ${notes || 'None'}`,
    `LOCATION:${meetLink}`,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');
};

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
};

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

    const meet_link = `https://meet.google.com/jmv-cytq-fmw`;
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
      const icsString = generateICS(date, time, duration || 30, bookingType, finalName || finalEmail, meet_link, notes);
      const attachments = icsString ? [{ filename: 'invite.ics', content: Buffer.from(icsString).toString('base64'), contentType: 'text/calendar' }] : undefined;

      if (finalEmail) {
        await require('resend').Resend(process.env.RESEND_API_KEY).emails.send({
          from: `"EVOBRAND Scheduling" <${process.env.RESEND_FROM_EMAIL || 'info@evobrand.net'}>`,
          to: finalEmail,
          subject: 'Appointment Confirmed',
          html: getEmailTemplate('Appointment Confirmed', `
            <p>Hi ${finalName || 'there'},</p>
            <p>Your ${bookingType} session is scheduled for <strong>${date}</strong> at <strong>${time}</strong>.</p>
            <p><strong>Meeting Link:</strong> <a href="${meet_link}">${meet_link}</a></p>
            <p>Thank you for choosing EVOBRAND.</p>
          `),
          attachments
        });
      }

      await require('resend').Resend(process.env.RESEND_API_KEY).emails.send({
        from: `"EVOBRAND Scheduling" <${process.env.RESEND_FROM_EMAIL || 'info@evobrand.net'}>`,
        to: ['info@evobrand.net', 'ksolomon68@gmail.com'],
        subject: `New Booking: ${finalName || finalEmail}`,
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
          await require('resend').Resend(process.env.RESEND_API_KEY).emails.send({
            from: `"EVOBRAND Scheduling" <${process.env.RESEND_FROM_EMAIL || 'info@evobrand.net'}>`,
            to: meeting.user_email,
            subject: 'Appointment Cancelled',
            html: getEmailTemplate('Appointment Cancelled', `
              <p>Hi ${meeting.user_name || 'there'},</p>
              <p>Your appointment on <strong>${meeting.date}</strong> at <strong>${meeting.time}</strong> has been cancelled.</p>
            `)
          });
        }
        await require('resend').Resend(process.env.RESEND_API_KEY).emails.send({
          from: `"EVOBRAND Scheduling" <${process.env.RESEND_FROM_EMAIL || 'info@evobrand.net'}>`,
          to: 'info@evobrand.net',
          subject: `Booking Cancelled: ${meeting.date} at ${meeting.time}`,
            html: getEmailTemplate(`Booking Cancelled: ${meeting.date} at ${meeting.time}`, `<p>The appointment for ${meeting.user_name || meeting.user_email || 'a client'} on ${meeting.date} at ${meeting.time} has been cancelled.</p>`)
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
