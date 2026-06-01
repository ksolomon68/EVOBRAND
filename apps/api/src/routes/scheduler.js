const express = require('express');
const router = express.Router();
const pool = require('../db/connection');
const nodemailer = require('nodemailer');
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

function buildGoogleCalendarLink({ title, date, time, duration, description }) {
  const start = new Date(`${date}T${time}`);
  const end = new Date(start.getTime() + (duration || 30) * 60000);
  const fmt = d => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: title,
    dates: `${fmt(start)}/${fmt(end)}`,
    details: description || '',
    location: 'Google Meet'
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

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

// Get user meetings
router.get('/meetings/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const [rows] = await pool.query('SELECT * FROM meetings WHERE user_id = ? ORDER BY date DESC, time DESC', [userId]);
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

    const meetingId = result.insertId;

    // Build calendar links
    const eventTitle = `EVOBRAND Consultation - ${clientName || 'Client'}`;
    const eventDesc = `Meeting type: ${bookingType}\nNotes: ${notes || 'None'}\nJoin: ${meet_link}`;
    const calLink = buildGoogleCalendarLink({ title: eventTitle, date, time, duration: duration || 30, description: eventDesc });

    const formattedDate = new Date(`${date}T${time}`).toLocaleString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit', timeZoneName: 'short'
    });

    // Notify admin
    try {
      await notifyAdmins(
        'New Booking',
        `${clientName || clientEmail || 'A client'} booked a ${bookingType} meeting on ${date} at ${time}`,
        '/admin',
        'booking'
      );

      await transporter.sendMail({
        from: `"EVOBRAND Bookings" <${process.env.SMTP_USER || 'no-reply@evobrandconcepts.com'}>`,
        to: process.env.ADMIN_EMAIL || 'ks@evobrand.net',
        subject: `New Booking: ${clientName || clientEmail} — ${date} at ${time}`,
        html: `<p><strong>New booking confirmed!</strong></p>
               <p><strong>Client:</strong> ${clientName || ''} &lt;${clientEmail || 'N/A'}&gt;</p>
               <p><strong>Date/Time:</strong> ${formattedDate}</p>
               <p><strong>Type:</strong> ${bookingType}</p>
               <p><strong>Duration:</strong> ${duration || 30} minutes</p>
               ${notes ? `<p><strong>Notes:</strong> ${notes}</p>` : ''}
               <p><strong>Meet Link:</strong> <a href="${meet_link}">${meet_link}</a></p>
               <p><a href="${calLink}" style="background:#0078d4;color:#fff;padding:10px 20px;border-radius:5px;text-decoration:none;">Add to Google Calendar</a></p>`
      });
    } catch (notifyErr) {
      console.error('Admin booking notification failed:', notifyErr);
    }

    // Notify client
    if (clientEmail) {
      try {
        await transporter.sendMail({
          from: `"EVOBRAND" <${process.env.SMTP_USER || 'no-reply@evobrandconcepts.com'}>`,
          to: clientEmail,
          subject: `Booking Confirmed: ${date} at ${time}`,
          html: `<p>Hi ${clientName || ''},</p>
                 <p>Your consultation with EVOBRAND has been confirmed!</p>
                 <p><strong>Date/Time:</strong> ${formattedDate}</p>
                 <p><strong>Duration:</strong> ${duration || 30} minutes</p>
                 <p><strong>Google Meet:</strong> <a href="${meet_link}">${meet_link}</a></p>
                 ${notes ? `<p><strong>Your Notes:</strong> ${notes}</p>` : ''}
                 <p><a href="${calLink}" style="background:#0078d4;color:#fff;padding:10px 20px;border-radius:5px;text-decoration:none;">Add to Google Calendar</a></p>
                 <p>We look forward to speaking with you!</p>
                 <p>— The EVOBRAND Team</p>`
        });

        // In-app notification if registered user
        if (resolvedUserId) {
          await createNotification(
            resolvedUserId,
            'Booking Confirmed',
            `Your meeting on ${date} at ${time} is confirmed.`,
            '/client-portal',
            'booking'
          );
        }
      } catch (clientNotifyErr) {
        console.error('Client booking notification failed:', clientNotifyErr);
      }
    }

    res.json({ success: true, meeting_id: meetingId, meet_link });
  } catch (error) {
    console.error('Error booking appointment:', error);
    res.status(500).json({ error: 'Failed to book appointment' });
  }
});

// Cancel a meeting
router.post('/meetings/:id/cancel', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('UPDATE meetings SET status = ? WHERE id = ?', ['canceled', id]);
    res.json({ success: true });
  } catch (error) {
    console.error('Error canceling meeting:', error);
    res.status(500).json({ error: 'Failed to cancel meeting' });
  }
});

module.exports = router;
