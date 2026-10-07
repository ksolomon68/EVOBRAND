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
    calendarList: { list: async ({ pageToken }) => ({ data: pageToken ? { items: [{ id: 'work', summary: 'Work' }] } : {
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
