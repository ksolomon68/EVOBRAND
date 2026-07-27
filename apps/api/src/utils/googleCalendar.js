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

// Resolve the real UTC offset (in minutes) for a given instant in a given IANA timeZone.
// Handles DST automatically without pulling in a date library.
function getTimeZoneOffsetMinutes(utcDate, timeZone) {
  const dtf = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hourCycle: 'h23',
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });
  const parts = {};
  for (const p of dtf.formatToParts(utcDate)) parts[p.type] = p.value;
  const asUTC = Date.UTC(
    parseInt(parts.year, 10), parseInt(parts.month, 10) - 1, parseInt(parts.day, 10),
    parseInt(parts.hour, 10), parseInt(parts.minute, 10), parseInt(parts.second, 10)
  );
  return (asUTC - utcDate.getTime()) / 60000;
}

// Convert a "wall clock" date/time in `timeZone` (e.g. America/Chicago) into a real UTC Date.
function zonedDateTimeToUtc(dateStr, h, m, timeZone) {
  const [y, mo, d] = dateStr.split('-').map(Number);
  const guess = new Date(Date.UTC(y, mo - 1, d, h, m, 0));
  const offsetMin = getTimeZoneOffsetMinutes(guess, timeZone);
  return new Date(guess.getTime() - offsetMin * 60000);
}

// Fetch busy intervals from Google Calendar for [startDateStr, endDateStr] (inclusive, YYYY-MM-DD,
// interpreted in CALENDAR_TZ). Returns [] if credentials aren't configured or the lookup fails —
// callers treat that as "no Google-side blocks known" rather than an error.
async function getBusyIntervals(startDateStr, endDateStr) {
  const calendar = getClient();
  if (!calendar) return [];

  const calendarId = process.env.GOOGLE_CALENDAR_ID || 'primary';
  const timeMin = zonedDateTimeToUtc(startDateStr, 0, 0, CALENDAR_TZ).toISOString();
  const timeMax = zonedDateTimeToUtc(endDateStr, 23, 59, CALENDAR_TZ).toISOString();

  const res = await calendar.freebusy.query({
    requestBody: { timeMin, timeMax, items: [{ id: calendarId }] },
  });

  const busy = res.data.calendars?.[calendarId]?.busy || [];
  return busy.map((b) => ({ start: new Date(b.start), end: new Date(b.end) }));
}

// Does the given office-hours slot (e.g. "2:00 PM", 30 min) overlap any Google Calendar busy interval?
function isSlotBusy(dateStr, slotStr, durationMin, busyIntervals) {
  if (!busyIntervals.length) return false;
  const parsed = parseTime(slotStr);
  if (!parsed) return false;

  const slotStart = zonedDateTimeToUtc(dateStr, parsed.h, parsed.m, CALENDAR_TZ);
  const slotEnd = new Date(slotStart.getTime() + durationMin * 60000);

  return busyIntervals.some((b) => slotStart < b.end && slotEnd > b.start);
}

module.exports = {
  createCalendarEvent,
  deleteCalendarEvent,
  getBusyIntervals,
  isSlotBusy,
};
