const test = require('node:test');
const assert = require('node:assert/strict');
const { google } = require('googleapis');
const { getBusyIntervals, getAvailabilityCalendars, isSlotBusy } = require('../src/utils/googleCalendar');

test('availability covers paginated calendars, batches requests and rejects partial failures', async () => {
  const originalCalendar = google.calendar;
  const originalEnv = { ...process.env };
  process.env.GOOGLE_CLIENT_ID = 'test';
  process.env.GOOGLE_CLIENT_SECRET = 'test';
  process.env.GOOGLE_REFRESH_TOKEN = 'test';
  delete process.env.GOOGLE_CALENDAR_ID;
  const calls = [];
  let fail = false;
  google.calendar = () => ({
    calendarList: { list: async ({ pageToken }) => ({ data: pageToken ? { items: [{ id: 'work', summary: 'Work' }, { id: 'en.usa#holiday@group.v.calendar.google.com', summary: 'Holidays in United States' }] } : {
      items: Array.from({ length: 50 }, (_, i) => ({ id: `cal${i}`, primary: i === 0 })), nextPageToken: 'next'
    } }) },
    freebusy: { query: async ({ requestBody }) => {
      calls.push(requestBody);
      return { data: { calendars: Object.fromEntries(requestBody.items.map(({ id }) => [id,
        fail && id === 'work' ? { errors: [{ reason: 'notFound' }] } : {
          busy: id === 'work' ? [{ start: '2026-10-08T17:00:00Z', end: '2026-10-08T18:00:00Z' }] : []
        }
      ])) } };
    } }
  });
  try {
    assert.equal((await getAvailabilityCalendars()).length, 51);
    assert.equal((await getAvailabilityCalendars()).some((c) => c.name === 'Holidays in United States'), false);
    const busy = await getBusyIntervals('2026-10-08', '2026-10-08');
    assert.deepEqual(calls.map((c) => c.items.length), [50, 1]);
    assert.equal(calls[0].timeMin, '2026-10-08T05:00:00.000Z');
    assert.equal(calls[0].timeMax, '2026-10-09T05:00:00.000Z');
    assert.equal(isSlotBusy('2026-10-08', '12:00 PM', 30, busy), true);
    assert.equal(isSlotBusy('2026-10-08', '1:00 PM', 30, busy), false);
    process.env.GOOGLE_CALENDAR_ID = 'booking';
    assert.equal((await getAvailabilityCalendars()).length, 52);
    fail = true;
    await assert.rejects(getBusyIntervals('2026-10-08', '2026-10-08'), /Work/);
    delete process.env.GOOGLE_REFRESH_TOKEN;
    await assert.rejects(getBusyIntervals('2026-10-08', '2026-10-08'), /not configured/);
  } finally {
    google.calendar = originalCalendar;
    for (const key of Object.keys(process.env)) if (!(key in originalEnv)) delete process.env[key];
    Object.assign(process.env, originalEnv);
  }
});

test('Google agenda expands recurring events, skips cancellations and reports inaccessible calendars', async () => {
  const originalCalendar = google.calendar;
  const originalEnv = { ...process.env };
  Object.assign(process.env, { GOOGLE_CLIENT_ID: 'test', GOOGLE_CLIENT_SECRET: 'test', GOOGLE_REFRESH_TOKEN: 'test', GOOGLE_CALENDAR_ID: 'personal' });
  const calls = [];
  google.calendar = () => ({
    calendarList: { list: async () => ({ data: { items: [{ id: 'personal', summary: 'Personal', primary: true }, { id: 'shared', summary: 'Shared' }] } }) },
    events: { list: async (params) => {
      calls.push(params);
      if (params.calendarId === 'shared') throw new Error('Forbidden');
      return { data: params.pageToken ? { items: [{ id: 'all-day', start: { date: '2026-10-09' }, end: { date: '2026-10-10' }, transparency: 'transparent' }] } : {
        items: [
          { id: 'recurrence', summary: 'Work meeting', start: { dateTime: '2026-10-08T12:00:00-05:00' }, end: { dateTime: '2026-10-08T13:00:00-05:00' }, htmlLink: 'https://calendar.google.com/calendar/event?eid=test' },
          { id: 'cancelled', status: 'cancelled', start: { date: '2026-10-08' }, end: { date: '2026-10-09' } }
        ], nextPageToken: 'next'
      } };
    } }
  });
  try {
    const { getUpcomingCalendarEvents } = require('../src/utils/googleCalendar');
    const agenda = await getUpcomingCalendarEvents(new Date('2026-10-07T12:00:00Z'));
    assert.deepEqual(agenda.events.map((event) => event.id), ['recurrence', 'all-day']);
    assert.equal(agenda.events[0].title, 'Work meeting');
    assert.equal(agenda.events[0].busy, true);
    assert.equal(agenda.events[1].allDay, true);
    assert.equal(agenda.events[1].busy, false);
    assert.equal(agenda.warnings.length, 1);
    assert.match(agenda.warnings[0], /Shared/);
    assert.equal(calls[0].singleEvents, true);
    assert.equal(calls[1].pageToken, 'next');
    assert.equal(agenda.timeMax, '2026-11-06T12:00:00.000Z');
  } finally {
    google.calendar = originalCalendar;
    for (const key of Object.keys(process.env)) if (!(key in originalEnv)) delete process.env[key];
    Object.assign(process.env, originalEnv);
  }
});
