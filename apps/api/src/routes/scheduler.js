const express = require('express');
const router = express.Router();
const pool = require('../db/connection');
const { getEmailTemplate } = require('../utils/emailTemplate');
const { sendEmail } = require('../utils/mailer');
const { createNotification, notifyAdmins } = require('../utils/notifications');
const { authenticateToken } = require('../middleware/auth');
const { createCalendarEvent, deleteCalendarEvent, getBusyIntervals, isSlotBusy } = require('../utils/googleCalendar');

// Office-hours slots offered by the scheduler — kept in sync with SchedulerWidget.jsx's TIME_SLOTS.
const TIME_SLOTS = ['12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM'];
const SLOT_DURATION_MIN = 30;

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
    'METHOD:REQUEST',
    'BEGIN:VEVENT',
    `UID:${Date.now()}@evobrand.net`,
    `DTSTAMP:${formatDT(new Date())}`,
    `ORGANIZER;CN="EVOBRAND Scheduling":mailto:info@evobrand.net`,
    `ATTENDEE;CUTYPE=INDIVIDUAL;ROLE=REQ-PARTICIPANT;PARTSTAT=NEEDS-ACTION;RSVP=TRUE:mailto:ksolomon68@gmail.com`,
    `DTSTART;TZID=America/Chicago:${formatDT(startDt)}`,
    `DTEND;TZID=America/Chicago:${formatDT(endDt)}`,
    `SUMMARY:EVOBRAND ${bookingType} Session with ${clientName || 'Client'}`,
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

// Get all appointments (admin sees all, user sees own) — used by AdminDashboard and AdminBlackoutPanel
router.get('/appointments', authenticateToken, async (req, res) => {
  try {
    const [userRows] = await pool.query('SELECT is_admin, email FROM users WHERE id = ?', [req.user.id]);
    const isAdmin = userRows[0] && (userRows[0].is_admin == 1 || userRows[0].is_admin === true || userRows[0].email === 'ks@evobrand.net');

    let rows;
    if (isAdmin) {
      [rows] = await pool.query(`
        SELECT m.*, u.name as client_name, u.email as client_email
        FROM meetings m
        LEFT JOIN users u ON m.user_id = u.id
        WHERE m.status != 'canceled'
        ORDER BY m.date ASC, m.time ASC
      `);
    } else {
      [rows] = await pool.query('SELECT * FROM meetings WHERE user_id = ? AND status != ? ORDER BY date ASC, time ASC', [req.user.id, 'canceled']);
    }
    res.json(rows);
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({ error: 'Failed to fetch appointments' });
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

// Get fully-booked dates for a given month (all 6 slots taken OR full-day blackout)
// Returns an array of date strings e.g. ["2026-06-15", "2026-06-18"]
router.get('/booked-dates', async (req, res) => {
  const { year, month } = req.query;
  if (!year || !month) return res.status(400).json({ error: 'year and month are required' });

  const totalSlots = TIME_SLOTS.length;

  try {
    const pad = (n) => String(n).padStart(2, '0');
    const daysInMonth = new Date(Number(year), Number(month), 0).getDate();
    const startDate = `${year}-${pad(month)}-01`;
    const endDate = `${year}-${pad(month)}-${pad(daysInMonth)}`;

    const normalize = (d) =>
      d instanceof Date ? d.toISOString().slice(0, 10) : String(d).slice(0, 10);

    // Booked times per date (need the actual times, not just counts, to merge with Google busy slots)
    const [meetingRows] = await pool.query(
      `SELECT date, time FROM meetings WHERE date >= ? AND date <= ? AND status != 'canceled'`,
      [startDate, endDate]
    );
    const bookedTimesByDate = new Map();
    for (const row of meetingRows) {
      const d = normalize(row.date);
      if (!bookedTimesByDate.has(d)) bookedTimesByDate.set(d, new Set());
      bookedTimesByDate.get(d).add(row.time);
    }

    // Full-day blackout dates (time IS NULL)
    const [blackoutRows] = await pool.query(
      `SELECT date FROM blackout_dates WHERE date >= ? AND date <= ? AND (time IS NULL OR time = '')`,
      [startDate, endDate]
    );

    const dateSet = new Set(blackoutRows.map((r) => normalize(r.date)));
    for (const [date, times] of bookedTimesByDate) {
      if (times.size >= totalSlots) dateSet.add(date);
    }

    // Fold in Google Calendar busy time — a date becomes fully booked once DB bookings + Google
    // busy blocks together cover every office-hours slot.
    let busyIntervals = [];
    try {
      busyIntervals = await getBusyIntervals(startDate, endDate);
    } catch (calErr) {
      console.error('Google Calendar freebusy lookup failed (non-fatal):', calErr.message);
    }

    if (busyIntervals.length) {
      for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${year}-${pad(month)}-${pad(day)}`;
        if (dateSet.has(dateStr)) continue;

        const bookedTimes = bookedTimesByDate.get(dateStr) || new Set();
        const blockedCount = TIME_SLOTS.reduce((count, slot) => {
          const blocked = bookedTimes.has(slot) || isSlotBusy(dateStr, slot, SLOT_DURATION_MIN, busyIntervals);
          return count + (blocked ? 1 : 0);
        }, 0);

        if (blockedCount >= totalSlots) dateSet.add(dateStr);
      }
    }

    res.json([...dateSet]);
  } catch (error) {
    console.error('Error fetching booked dates:', error);
    res.status(500).json({ error: 'Failed to fetch booked dates' });
  }
});


// Get booked time slots for a specific date
router.get('/booked-slots', async (req, res) => {
  const { date } = req.query;
  if (!date) return res.status(400).json({ error: 'Date is required' });

  try {
    const [rows] = await pool.query('SELECT time FROM meetings WHERE date = ? AND status != ?', [date, 'canceled']);
    const bookedSlots = new Set(rows.map((row) => row.time));

    // Block any office-hours slot that Google Calendar shows as busy (e.g. a personal event).
    try {
      const busyIntervals = await getBusyIntervals(date, date);
      for (const slot of TIME_SLOTS) {
        if (isSlotBusy(date, slot, SLOT_DURATION_MIN, busyIntervals)) bookedSlots.add(slot);
      }
    } catch (calErr) {
      console.error('Google Calendar freebusy lookup failed (non-fatal):', calErr.message);
    }

    res.json([...bookedSlots]);
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

    const meet_link = `https://meet.google.com/pdh-sjeq-bja`;
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
        await sendEmail({
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

      await sendEmail({
        from: `"EVOBRAND Scheduling" <${process.env.RESEND_FROM_EMAIL || 'info@evobrand.net'}>`,
        to: ['info@evobrand.net', 'ksolomon68@gmail.com'],
        subject: `New Booking: ${finalName || finalEmail}`,
        html: getEmailTemplate(`New Booking: ${finalName || finalEmail}`, `
          <p><strong>New Booking Details:</strong></p>
          <ul>
            <li>Name: ${finalName || 'N/A'}</li>
            <li>Email: ${finalEmail || 'N/A'}</li>
            <li>Date: ${date}</li>
            <li>Time: ${time}</li>
            <li>Type: ${bookingType}</li>
            <li>Notes: ${notes || 'None'}</li>
          </ul>
        `),
        attachments
      });
    } catch (emailErr) {
      console.error('Failed to send booking emails:', emailErr);
    }

    // Create Google Calendar event (non-blocking — failure doesn't stop booking)
    try {
      const googleEventId = await createCalendarEvent({
        date,
        time,
        duration: duration || 30,
        bookingType,
        clientName: finalName,
        clientEmail: finalEmail,
        notes,
        meetLink: meet_link,
      });
      if (googleEventId) {
        await pool.query('UPDATE meetings SET google_event_id = ? WHERE id = ?', [googleEventId, result.insertId]);
      }
    } catch (calErr) {
      console.error('Google Calendar event creation failed (non-fatal):', calErr.message);
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

    if (meetings.length > 0 && meetings[0].google_event_id) {
      deleteCalendarEvent(meetings[0].google_event_id).catch((e) =>
        console.error('Google Calendar event deletion failed (non-fatal):', e.message)
      );
    }

    if (meetings.length > 0) {
      const meeting = meetings[0];
      try {
        if (meeting.user_email) {
          await sendEmail({
            from: `"EVOBRAND Scheduling" <${process.env.RESEND_FROM_EMAIL || 'info@evobrand.net'}>`,
            to: meeting.user_email,
            subject: 'Appointment Cancelled',
            html: getEmailTemplate('Appointment Cancelled', `
              <p>Hi ${meeting.user_name || 'there'},</p>
              <p>Your appointment on <strong>${meeting.date}</strong> at <strong>${meeting.time}</strong> has been cancelled.</p>
            `)
          });
        }
        await sendEmail({
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

// Back-fill Google Calendar events for existing meetings that don't have one (admin only)
router.post('/sync-calendar', authenticateToken, async (req, res) => {
  try {
    const [userRows] = await pool.query('SELECT is_admin, email FROM users WHERE id = ?', [req.user.id]);
    const isAdmin = userRows[0] && (userRows[0].is_admin == 1 || userRows[0].is_admin === true || userRows[0].email === 'ks@evobrand.net');
    if (!isAdmin) return res.status(403).json({ error: 'Admin only' });

    // Check credentials are present before attempting sync
    const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN } = process.env;
    if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !GOOGLE_REFRESH_TOKEN) {
      return res.status(400).json({
        error: 'Google Calendar credentials are not configured. Add GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and GOOGLE_REFRESH_TOKEN to your .env file and restart the server.',
        synced: 0, failed: 0, total: 0,
      });
    }

    const [meetings] = await pool.query(`
      SELECT m.*, u.name as client_name, u.email as client_email
      FROM meetings m
      LEFT JOIN users u ON m.user_id = u.id
      WHERE m.google_event_id IS NULL AND m.status != 'canceled'
      ORDER BY m.date ASC
    `);

    const meet_link = 'https://meet.google.com/pdh-sjeq-bja';
    let synced = 0;
    let failed = 0;
    const errors = [];

    for (const meeting of meetings) {
      try {
        const dateStr = meeting.date instanceof Date
          ? meeting.date.toISOString().slice(0, 10)
          : String(meeting.date).slice(0, 10);

        const googleEventId = await createCalendarEvent({
          date: dateStr,
          time: meeting.time,
          duration: meeting.duration || 30,
          bookingType: meeting.type || 'discovery',
          clientName: meeting.client_name,
          clientEmail: meeting.client_email,
          notes: meeting.notes,
          meetLink: meeting.meet_link || meet_link,
        });

        if (googleEventId) {
          await pool.query('UPDATE meetings SET google_event_id = ? WHERE id = ?', [googleEventId, meeting.id]);
          synced++;
        } else {
          failed++;
          errors.push(`Meeting ${meeting.id} (${dateStr}): Calendar client returned null — check credentials`);
        }
      } catch (err) {
        failed++;
        errors.push(`Meeting ${meeting.id}: ${err.message}`);
      }
    }

    res.json({ total: meetings.length, synced, failed, errors });
  } catch (error) {
    console.error('Error syncing calendar:', error);
    res.status(500).json({ error: 'Failed to sync calendar' });
  }
});


// Diagnose why a date's Google Calendar busy times aren't showing up (admin only)
router.get('/debug-calendar', authenticateToken, async (req, res) => {
  const { date } = req.query;
  if (!date) return res.status(400).json({ error: 'date is required, e.g. ?date=2026-07-30' });

  try {
    const [userRows] = await pool.query('SELECT is_admin, email FROM users WHERE id = ?', [req.user.id]);
    const isAdmin = userRows[0] && (userRows[0].is_admin == 1 || userRows[0].is_admin === true || userRows[0].email === 'ks@evobrand.net');
    if (!isAdmin) return res.status(403).json({ error: 'Admin only' });

    const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN, GOOGLE_CALENDAR_ID } = process.env;
    const hasCredentials = !!(GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET && GOOGLE_REFRESH_TOKEN);

    // Fingerprint a secret without exposing it: length + last 4 chars is enough to tell
    // two different tokens apart, and to spot stray whitespace/truncation.
    const fingerprint = (val) => {
      if (!val) return null;
      return { length: val.length, endsWith: val.slice(-4), hasSurroundingWhitespace: val !== val.trim() };
    };

    // dotenv does NOT overwrite vars already present in the environment (e.g. ones injected by
    // cPanel's Node.js app manager). If the .env file and the live process disagree, the .env
    // edit is being silently ignored — which is the usual cause of "I updated the token but
    // nothing changed".
    let envFileComparison = null;
    try {
      const fs = require('fs');
      const path = require('path');
      const envPath = path.resolve(__dirname, '../../.env');
      if (fs.existsSync(envPath)) {
        const parsed = require('dotenv').parse(fs.readFileSync(envPath));
        envFileComparison = {
          envFileFound: true,
          refreshTokenInFile: fingerprint(parsed.GOOGLE_REFRESH_TOKEN),
          refreshTokenInProcess: fingerprint(GOOGLE_REFRESH_TOKEN),
          valuesMatch: (parsed.GOOGLE_REFRESH_TOKEN || null) === (GOOGLE_REFRESH_TOKEN || null),
          clientIdInFileMatchesProcess: (parsed.GOOGLE_CLIENT_ID || null) === (GOOGLE_CLIENT_ID || null),
          clientSecretInFileMatchesProcess: (parsed.GOOGLE_CLIENT_SECRET || null) === (GOOGLE_CLIENT_SECRET || null),
        };
      } else {
        envFileComparison = { envFileFound: false, refreshTokenInProcess: fingerprint(GOOGLE_REFRESH_TOKEN) };
      }
    } catch (envErr) {
      envFileComparison = { error: envErr.message };
    }

    const result = {
      date,
      calendarId: GOOGLE_CALENDAR_ID || 'primary',
      hasCredentials,
      clientIdPrefix: GOOGLE_CLIENT_ID ? GOOGLE_CLIENT_ID.slice(0, 12) : null,
      refreshTokenPrefix: GOOGLE_REFRESH_TOKEN ? GOOGLE_REFRESH_TOKEN.slice(0, 3) : null,
      credentialSource: envFileComparison,
      busyIntervals: null,
      slotsBlockedByGoogle: [],
      error: null,
    };

    if (hasCredentials) {
      try {
        const busyIntervals = await getBusyIntervals(date, date);
        result.busyIntervals = busyIntervals.map((b) => ({ start: b.start.toISOString(), end: b.end.toISOString() }));
        result.slotsBlockedByGoogle = TIME_SLOTS.filter((slot) => isSlotBusy(date, slot, SLOT_DURATION_MIN, busyIntervals));
      } catch (calErr) {
        // Google's useful detail lives in the OAuth error_description, not err.message.
        result.error = {
          message: calErr.message,
          code: calErr.code || null,
          description: calErr.response?.data?.error_description || null,
        };
      }
    }

    res.json(result);
  } catch (error) {
    console.error('Error in debug-calendar:', error);
    res.status(500).json({ error: 'Failed to run calendar diagnostic' });
  }
});

module.exports = router;

