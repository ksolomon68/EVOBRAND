const { google } = require('googleapis');

const CALENDAR_TZ = 'America/Chicago';

function getClient() {
  const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN } = process.env;
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !GOOGLE_REFRESH_TOKEN) return null;

  const auth = new google.auth.OAuth2(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET);
  auth.setCredentials({ refresh_token: GOOGLE_REFRESH_TOKEN });
  return google.calendar({ version: 'v3', auth });
}

function parseTime(timeStr) {
  const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!match) return null;
  let h = parseInt(match[1], 10);
  const m = parseInt(match[2], 10);
  const pm = match[3].toUpperCase() === 'PM';
  if (pm && h < 12) h += 12;
  if (!pm && h === 12) h = 0;
  return { h, m };
}

async function createCalendarEvent({ date, time, duration, bookingType, clientName, clientEmail, notes, meetLink }) {
  const calendar = getClient();
  if (!calendar) return null;

  const parsed = parseTime(time);
  if (!parsed) return null;

  const pad = (n) => String(n).padStart(2, '0');
  const startDT = `${date}T${pad(parsed.h)}:${pad(parsed.m)}:00`;

  const endTotalMins = parsed.h * 60 + parsed.m + (duration || 30);
  const endDT = `${date}T${pad(Math.floor(endTotalMins / 60) % 24)}:${pad(endTotalMins % 60)}:00`;

  const calendarId = process.env.GOOGLE_CALENDAR_ID || 'primary';

  const event = {
    summary: `EVOBRAND ${bookingType || 'discovery'} – ${clientName || clientEmail || 'Client'}`,
    description: [
      `Client: ${clientName || 'N/A'}`,
      `Email: ${clientEmail || 'N/A'}`,
      `Notes: ${notes || 'None'}`,
      `Meeting Link: ${meetLink}`,
    ].join('\n'),
    location: meetLink,
    start: { dateTime: startDT, timeZone: CALENDAR_TZ },
    end: { dateTime: endDT, timeZone: CALENDAR_TZ },
    attendees: clientEmail ? [{ email: clientEmail, displayName: clientName || undefined }] : [],
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'email', minutes: 60 },
        { method: 'popup', minutes: 15 },
      ],
    },
  };

  const res = await calendar.events.insert({
    calendarId,
    requestBody: event,
    sendUpdates: clientEmail ? 'externalOnly' : 'none',
  });

  return res.data.id || null;
}

async function deleteCalendarEvent(googleEventId) {
  const calendar = getClient();
  if (!calendar || !googleEventId) return;

  const calendarId = process.env.GOOGLE_CALENDAR_ID || 'primary';
  await calendar.events.delete({
    calendarId,
    eventId: googleEventId,
    sendUpdates: 'all',
  });
}

module.exports = { createCalendarEvent, deleteCalendarEvent };
