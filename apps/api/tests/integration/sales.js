// Run against a dedicated empty database, never production:
// DB_NAME=evobrand_sales_test_<suffix> node --test tests/integration/sales.js
const test = require('node:test');
const assert = require('node:assert/strict');
assert.match(process.env.DB_NAME || '', /^evobrand_sales_test_[a-zA-Z0-9_]+$/, 'Use an isolated sales test database');
const express = require('express');
const jwt = require('jsonwebtoken');
const db = require('../../src/db/connection');
const { initializeDatabase } = require('../../src/db/init');
const { createSalesService } = require('../../src/utils/sales');
const service = createSalesService(db);
let server, base, admin, regular, actor;

test.before(async () => {
  await initializeDatabase();
  const [result] = await db.query("INSERT INTO users (email, name, is_admin) VALUES ('admin@example.test', 'Sales test admin', TRUE)");
  actor = result.insertId;
  const [user] = await db.query("INSERT INTO users (email, name, is_admin) VALUES ('user@example.test', 'Sales test user', FALSE)");
  admin = jwt.sign({ id: actor }, process.env.JWT_SECRET || 'fallback_secret');
  regular = jwt.sign({ id: user.insertId }, process.env.JWT_SECRET || 'fallback_secret');
  const app = express();
  app.use(express.json());
  app.use('/sales', require('../../src/routes/sales').createSalesRouter(db));
  // Exercise real booking/signing routes while replacing outbound delivery only.
  const mailer = require('../../src/utils/mailer');
  const calendar = require('../../src/utils/googleCalendar');
  const original = { sendEmail: mailer.sendEmail, getBusyIntervals: calendar.getBusyIntervals, createCalendarEvent: calendar.createCalendarEvent };
  mailer.sendEmail = async () => ({ success: true });
  calendar.getBusyIntervals = async () => [];
  calendar.createCalendarEvent = async () => null;
  app.use('/scheduler', require('../../src/routes/scheduler'));
  app.use('/contracts', require('../../src/routes/contracts'));
  mailer.sendEmail = original.sendEmail;
  calendar.getBusyIntervals = original.getBusyIntervals;
  calendar.createCalendarEvent = original.createCalendarEvent;
  server = await new Promise(resolve => { const listener = app.listen(0, '127.0.0.1', () => resolve(listener)); });
  base = `http://127.0.0.1:${server.address().port}/sales`;
});
test.after(async () => {
  if (server) await new Promise(resolve => server.close(resolve));
  await db.end();
});

async function api(path = '', { token = admin, method = 'GET', body } = {}) {
  const response = await fetch(base + path, { method, headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: body ? JSON.stringify(body) : undefined });
  return { status: response.status, data: await response.json() };
}

test('sales routes require a current database-backed admin for reads and writes', async () => {
  assert.equal((await api('', { token: '' })).status, 401);
  for (const [path, method] of [['', 'GET'], ['', 'POST'], ['/1', 'GET'], ['/1', 'PATCH'], ['/1/activities', 'POST']]) {
    assert.equal((await api(path, { method, token: regular, body: method === 'GET' ? undefined : {} })).status, 403);
  }
  await db.query('UPDATE users SET is_admin = FALSE WHERE id = ?', [actor]);
  assert.equal((await api()).status, 403);
  await db.query('UPDATE users SET is_admin = TRUE WHERE id = ?', [actor]);
});

test('audits capture one contact without resetting sales progress, reminders, or marketing consent', async () => {
  const id = await service.captureLead({ email: ' Prospect@Example.test ', name: 'Pat', company: 'Test studio' }, 'brand_audit');
  assert.equal((await service.getLead(id)).stage, 'new');
  await service.update(id, { stage: 'proposal', follow_up_date: '2028-02-29', value: '1250.25' }, actor);
  const repeated = await service.captureLead({ email: 'prospect@example.test', name: 'Replacement' }, 'accessibility_audit');
  assert.equal(repeated, id);
  const saved = await service.getLead(id);
  assert.equal(saved.stage, 'proposal');
  assert.equal(saved.name, 'Pat');
  assert.equal(saved.follow_up_date, '2028-02-29');
  const [[{ count }]] = await db.query('SELECT COUNT(*) count FROM crm_contacts WHERE email = ?', [saved.email]);
  assert.equal(count, 0);
});

test('historical audit import is repeatable and preserves existing contacts', async () => {
  await db.query("INSERT INTO brand_audits (business_name, email, first_name) VALUES ('Existing', 'historic@example.test', 'Alex'), ('Repeat', 'HISTORIC@example.test', 'Alex')");
  await service.importAudits();
  const [[lead]] = await db.query("SELECT * FROM sales_leads WHERE email = 'historic@example.test'");
  await service.update(lead.id, { stage: 'won' }, actor);
  await service.importAudits();
  const [rows] = await db.query("SELECT * FROM sales_leads WHERE email = 'historic@example.test'");
  assert.equal(rows.length, 1);
  assert.equal(rows[0].stage, 'won');
  assert.equal(rows[0].follow_up_date, null);
});

test('HTTP create/update validates identity and money, rejects duplicates, and logs history', async () => {
  const created = await api('', { method: 'POST', body: { email: ' Manual@Example.test ', name: 'Morgan', company: 'Acme', value: '1500.50', follow_up_date: '2028-03-01' } });
  assert.equal(created.status, 201);
  const { id } = created.data;
  assert.equal(created.data.email, 'manual@example.test');
  assert.equal(Number(created.data.value), 1500.5);
  const unscheduled = await service.create({ email: 'unscheduled@example.test', follow_up_date: null }, actor);
  assert.equal(unscheduled.follow_up_date, null);
  assert.equal((await api('', { method: 'POST', body: { email: 'MANUAL@example.test' } })).status, 409);
  for (const body of [{ stage: 'fake' }, { value: '-1' }, { follow_up_date: '2026-99-99' }, { follow_up_date: '2026-02-29' }, { source: 'fake' }, { email: 'change@example.test' }]) {
    assert.equal((await api(`/${id}`, { method: 'PATCH', body })).status, 400);
  }
  assert.equal((await api('/0')).status, 400);
  assert.equal((await api('/99999999')).status, 404);
  assert.equal((await api(`/${id}`, { method: 'PATCH', body: { stage: 'consultation' } })).status, 200);
  const note = await api(`/${id}/activities`, { method: 'POST', body: { kind: 'note', description: 'Discussed scope and budget.' } });
  assert.equal(note.status, 201);
  const history = await api(`/${id}`);
  assert.ok(history.data.activities.some(item => item.description === 'Discussed scope and budget.'));
  assert.ok(history.data.activities.some(item => item.description.includes('Consultation booked')));
  assert.equal((await api(`/${id}/activities`, { method: 'POST', body: { kind: 'follow_up', description: ' ' } })).status, 400);
  const completed = await api(`/${id}/activities`, { method: 'POST', body: { kind: 'follow_up', description: 'Spoke with Morgan by phone.' } });
  assert.equal(completed.data.follow_up_date, null);
  assert.equal(completed.data.next_action, '');
});

test('closing clears reminders and reopening allows a new follow-up without duplicating contacts', async () => {
  const lead = await service.create({ email: 'closed@example.test', follow_up_date: '2028-01-01', next_action: 'Call' }, actor);
  for (const stage of ['won', 'lost']) {
    const closed = await service.update(lead.id, { stage }, actor);
    assert.equal(closed.follow_up_date, null);
    assert.equal(closed.next_action, '');
    await service.update(lead.id, { stage: 'new', follow_up_date: '2028-01-02', next_action: 'Call again' }, actor);
  }
});

test('contact history joins sources by email without mixing contacts or implying email delivery', async () => {
  const id = await service.captureLead({ email: 'historic@example.test' }, 'brand_audit');
  const [meeting] = await db.query("INSERT INTO users (email, name) VALUES ('historic@example.test', 'Alex')");
  await db.query("INSERT INTO meetings (user_id, date, time) VALUES (?, '2028-01-01', '10:00')", [meeting.insertId]);
  await db.query("INSERT INTO contracts (title, client_email, contract_data) VALUES ('Scope', 'HISTORIC@example.test', '{}')");
  const result = await service.history(id);
  assert.equal(result.activities.filter(item => item.kind === 'audit').length, 2);
  assert.equal(result.activities.filter(item => item.kind === 'meeting').length, 1);
  assert.equal(result.activities.filter(item => item.kind === 'contract').length, 1);
  assert.ok(result.activities.every(item => !item.description.includes('Morgan')));
  assert.ok(!result.activities.some(item => item.kind === 'email'));
  const response = await api();
  assert.equal(response.data.templates.length, 3);
  assert.equal(response.data.stages.length, 6);
});

async function sourceApi(path, body, token = admin, method = 'POST') {
  const response = await fetch(base.replace(/\/sales$/, '') + path, { method,
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  return { status: response.status, data: await response.json() };
}

async function booking(email, type = 'discovery', status = 'scheduled') {
  await db.query("INSERT INTO users (email, name) VALUES (?, 'Source contact') ON DUPLICATE KEY UPDATE id = LAST_INSERT_ID(id)", [email]);
  const [[user]] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
  const [record] = await db.query("INSERT INTO meetings (user_id, date, time, type, status) VALUES (?, '2028-05-01', '12:00 PM', ?, ?)", [user.id, type, status]);
  return record.insertId;
}

async function contract(email, status = 'signed', data = {}) {
  const [record] = await db.query('INSERT INTO contracts (title, client_email, contract_data, status) VALUES (?, ?, ?, ?)', ['Source agreement', email, JSON.stringify(data), status]);
  return record.insertId;
}

test('actual booking and client signature endpoints advance an audit contact and record both changes', async () => {
  await db.query("INSERT INTO brand_audits (business_name, email, first_name) VALUES ('Journey studio', 'journey@example.test', 'Jamie')");
  const id = await service.captureLead({ email: 'journey@example.test', name: 'Jamie' }, 'brand_audit');
  const booked = await sourceApi('/scheduler/book', { clientName: 'Jamie', clientEmail: 'journey@example.test', date: '2028-04-10', time: '12:00 PM', type: 'discovery' });
  assert.equal(booked.status, 200, JSON.stringify(booked.data));
  assert.equal((await service.getLead(id)).stage, 'consultation');
  const saved = await sourceApi('/contracts', { title: 'Journey services', clientEmail: 'journey@example.test', contractData: { project: { fee: 2000 } }, status: 'sent' });
  assert.equal(saved.status, 201, JSON.stringify(saved.data));
  const [[user]] = await db.query("SELECT id FROM users WHERE email = 'journey@example.test'");
  const token = jwt.sign({ id: user.id, email: 'journey@example.test', name: 'Jamie' }, process.env.JWT_SECRET || 'fallback_secret');
  const signed = await sourceApi(`/contracts/${saved.data.id}/sign`, { signature: 'Jamie' }, token);
  assert.equal(signed.status, 200, JSON.stringify(signed.data));
  assert.equal((await service.getLead(id)).stage, 'signed');
  const timeline = await service.history(id);
  assert.equal(timeline.activities.filter(item => item.kind === 'automation').length, 2);
  assert.ok(timeline.activities.some(item => item.kind === 'audit'));
  assert.ok(timeline.activities.some(item => item.description.includes('Consultation booked → Contract signed')));
});

test('automations never regress advanced stages, reopen Won/Lost, or overwrite reminders and values', async () => {
  for (const stage of ['proposal', 'signed', 'won', 'lost']) {
    const email = `preserve-${stage}@example.test`;
    const lead = await service.create({ email, stage, value: '900.25', ...(['won', 'lost'].includes(stage) ? {} : { next_action: 'Custom task', follow_up_date: '2028-06-01' }) }, actor);
    await service.syncBooking(await booking(email));
    let saved = await service.getLead(lead.id);
    assert.equal(saved.stage, stage);
    assert.equal(Number(saved.value), 900.25);
    assert.equal(saved.follow_up_date, lead.follow_up_date);
    assert.equal(saved.next_action, lead.next_action);
    await service.syncContract(await contract(email));
    saved = await service.getLead(lead.id);
    assert.equal(saved.stage, ['won', 'lost'].includes(stage) ? stage : 'signed');
    assert.equal(saved.follow_up_date, lead.follow_up_date);
  }
});

test('concurrent duplicate source events produce one automatic activity and one contact', async () => {
  const email = 'concurrent@example.test';
  const id = await booking(email);
  await Promise.all(Array.from({ length: 5 }, () => service.syncBooking(id)));
  const [leads] = await db.query('SELECT * FROM sales_leads WHERE email = ?', [email]);
  assert.equal(leads.length, 1);
  assert.equal(leads[0].stage, 'consultation');
  assert.equal((await service.history(leads[0].id)).activities.filter(item => item.kind === 'automation').length, 1);
  assert.equal(leads[0].source, 'booking');
});

test('support bookings, canceled consultations, unsigned agreements, and signed NDAs do not advance sales', async () => {
  const email = 'not-a-sale@example.test';
  assert.equal(await service.syncBooking(await booking(email, 'support')), null);
  assert.equal(await service.syncBooking(await booking(email, 'discovery', 'canceled')), null);
  assert.equal(await service.syncContract(await contract(email, 'sent')), null);
  assert.equal(await service.syncContract(await contract(email, 'signed', { agreementType: 'mutual-nda' })), null);
  const [leads] = await db.query('SELECT id FROM sales_leads WHERE email = ?', [email]);
  assert.equal(leads.length, 0);
});

test('startup recovers unprocessed bookings and signatures, and retries preserve later manual changes', async () => {
  const email = 'recover@example.test';
  const meetingId = await booking(email, 'strategy');
  const signedId = await contract(email);
  await service.reconcile();
  const [[lead]] = await db.query('SELECT * FROM sales_leads WHERE email = ?', [email]);
  assert.equal(lead.stage, 'signed');
  await service.update(lead.id, { stage: 'new', next_action: 'Manual reset' }, actor);
  await service.reconcile();
  await service.syncBooking(meetingId);
  await service.syncContract(signedId);
  assert.equal((await service.getLead(lead.id)).stage, 'new');
  assert.equal((await service.history(lead.id)).activities.filter(item => item.kind === 'automation').length, 2);
});

test('admin status updates synchronize signed contracts using the saved client identity', async () => {
  const id = await contract('admin-signed@example.test', 'sent');
  const response = await sourceApi(`/contracts/${id}/status`, { status: 'signed' }, admin, 'PUT');
  assert.equal(response.status, 200);
  const [[lead]] = await db.query("SELECT * FROM sales_leads WHERE email = 'admin-signed@example.test'");
  assert.equal(lead.stage, 'signed');
  assert.equal(lead.source, 'contract');
});

test('a failed automatic history write rolls back the stage and event so a retry can recover', async () => {
  const email = 'rollback@example.test';
  const lead = await service.create({ email }, actor);
  const id = await booking(email);
  const faulty = createSalesService({
    query: (...args) => db.query(...args),
    getConnection: async () => {
      const connection = await db.getConnection();
      return new Proxy(connection, { get(target, key) {
        if (key === 'query') return (sql, ...args) => {
          if (sql.includes('INSERT INTO sales_activities')) throw new Error('Simulated history write failure');
          return target.query(sql, ...args);
        };
        const value = target[key];
        return typeof value === 'function' ? value.bind(target) : value;
      } });
    },
  });
  await assert.rejects(() => faulty.syncBooking(id), /Simulated history write failure/);
  assert.equal((await service.getLead(lead.id)).stage, 'new');
  const [events] = await db.query('SELECT * FROM sales_sync_events WHERE event_key = ?', [`booking:${id}`]);
  assert.equal(events.length, 0);
  await service.syncBooking(id);
  assert.equal((await service.getLead(lead.id)).stage, 'consultation');
  assert.equal((await service.history(lead.id)).activities.filter(item => item.kind === 'automation').length, 1);
});
