const STAGES = ['new', 'consultation', 'proposal', 'signed', 'won', 'lost'];
const STAGE_LABELS = ['New lead', 'Consultation booked', 'Proposal sent', 'Contract signed', 'Won', 'Lost'];

function invalid(message) {
  const error = new Error(message);
  error.status = 400;
  throw error;
}

function text(value, label, max, required = false) {
  if (typeof value !== 'string') invalid(`${label} must be text`);
  value = value.trim();
  if ((required && !value) || value.length > max) invalid(`${label} must be ${required ? '1–' : 'at most '}${max} characters`);
  return value;
}

function normalizeEmail(value) {
  const email = text(value, 'Email', 255, true).toLowerCase();
  if (!/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(email)) invalid('Enter a valid email address');
  return email;
}

function validateLead(input, creating = false) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) invalid('Lead details are required');
  const allowed = ['name', 'company', 'phone', 'stage', 'value', 'next_action', 'follow_up_date'];
  if (creating) allowed.push('email');
  if (Object.keys(input).some(key => !allowed.includes(key))) invalid('Unsupported lead field');
  const result = {};
  for (const [key, max] of [['name', 255], ['company', 255], ['phone', 50], ['next_action', 500]]) {
    if (key in input) result[key] = text(input[key], key.replace('_', ' '), max);
  }
  if (creating) result.email = normalizeEmail(input.email);
  if ('stage' in input) {
    if (!STAGES.includes(input.stage)) invalid('Invalid pipeline stage');
    result.stage = input.stage;
  }
  if ('value' in input) {
    const value = String(input.value);
    if (!/^\d{1,10}(\.\d{1,2})?$/.test(value)) invalid('Deal value must be a positive USD amount or zero, with at most two decimal places');
    result.value = value;
  }
  if ('follow_up_date' in input) {
    const date = input.follow_up_date;
    const parsed = new Date(`${date}T12:00:00Z`);
    if (date !== null && (typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date) || date < '1000-01-01' || date > '9999-12-31' || Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== date)) invalid('Enter a valid follow-up date');
    result.follow_up_date = date;
  }
  return result;
}

function tomorrow() {
  const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Chicago', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
  const date = new Date(`${today}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() + 1);
  return date.toISOString().slice(0, 10);
}

const EMAIL_TEMPLATES = [
  { id: 'audit', name: 'Audit follow-up', subject: 'Your next steps with EVOBRAND', body: 'Hi {{name}},\n\nThank you for requesting an audit for {{company}}. I’d like to walk you through the findings and help prioritize your next steps.\n\nWould you like to book a consultation?\n{{booking_url}}\n\nKeisha\nEVOBRAND' },
  { id: 'consultation', name: 'After a consultation', subject: 'Following up on our conversation', body: 'Hi {{name}},\n\nThank you for meeting with EVOBRAND. I’m following up on our conversation about {{company}}.\n\n[Add the agreed priorities and next step here.]\n\nPlease reply with any questions before we prepare the proposal.\n\nKeisha\nEVOBRAND' },
  { id: 'proposal', name: 'Proposal check-in', subject: 'Any questions about your EVOBRAND proposal?', body: 'Hi {{name}},\n\nI wanted to check in on the proposal for {{company}}. Are there any questions or details we should work through together?\n\nReply here, or book a time to talk:\n{{booking_url}}\n\nKeisha\nEVOBRAND' },
];

module.exports = { STAGES, STAGE_LABELS, EMAIL_TEMPLATES, validateLead, normalizeEmail, tomorrow, invalid, text };
