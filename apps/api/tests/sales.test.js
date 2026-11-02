const test = require('node:test');
const assert = require('node:assert/strict');
const { validateLead, normalizeEmail } = require('../src/utils/salesFields');

test('sales input normalizes contact identity and rejects mail header injection', () => {
  assert.equal(normalizeEmail(' Person@Example.com '), 'person@example.com');
  for (const email of ['a@example.com\r\nBcc: victim@example.com', 'missing-domain', '<a@example.com>', null]) {
    assert.throws(() => normalizeEmail(email), error => error.status === 400);
  }
});

test('sales updates accept real calendar dates and bounded decimal USD values', () => {
  assert.deepEqual(validateLead({ follow_up_date: '2028-02-29', value: '1234.56' }), { follow_up_date: '2028-02-29', value: '1234.56' });
  assert.equal(validateLead({ follow_up_date: null }).follow_up_date, null);
  for (const follow_up_date of ['2026-02-29', '2026-99-99', '', 123, '2026-11-02T12:00:00Z']) {
    assert.throws(() => validateLead({ follow_up_date }), error => error.status === 400);
  }
  for (const value of ['-1', '1.001', '1e5', 'Infinity', '10000000000', null, true]) {
    assert.throws(() => validateLead({ value }), error => error.status === 400);
  }
});

test('sales edits cannot change email identity, timestamps, SQL field names, or unknown stages', () => {
  for (const input of [{ email: 'new@example.com' }, { created_by: 1 }, { 'stage = ? --': 'won' }, { stage: 'client' }, { name: ['wrong type'] }]) {
    assert.throws(() => validateLead(input), error => error.status === 400);
  }
  assert.deepEqual(validateLead({ name: ' Ada ', stage: 'won', next_action: '' }), { name: 'Ada', next_action: '', stage: 'won' });
});
