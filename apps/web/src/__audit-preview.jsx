import React from 'react';
import { createRoot } from 'react-dom/client';
import { AuthProvider } from './hooks/useAuth';
import App from './App';
import './index.css';
// Temporary isolated presentation fixtures. Every fetch is intercepted; no API writes.
const params = new URLSearchParams(location.search);
const admin = params.get('role') === 'admin';
const empty = params.has('empty');
const failed = params.has('failed');
const user = { id: 99999, name: 'Jordan Example', email: 'jordan@example.invalid', is_admin: admin ? 1 : 0 };
const previousToken = localStorage.getItem('evobrand_token');
localStorage.setItem('evobrand_token', 'fixture.' + btoa(JSON.stringify({ ...user, exp: 9999999999 })) + '.fixture');
window.addEventListener('pagehide', () => previousToken === null ? localStorage.removeItem('evobrand_token') : localStorage.setItem('evobrand_token', previousToken), { once: true });
const today = new Date().toLocaleDateString('en-CA');
const tickets = empty ? [] : [{ id: 501, subject: 'Review the new service page', status: 'open', priority: 'normal', user_name: 'Jordan Example', updated_at: new Date().toISOString() }];
const projects = empty ? [] : [{ id: 201, name: 'Northline client portal', status: 'active', description: 'A shared workspace for our clients.', milestones: [{ name: 'Discovery & scope', status: 'done' }, { name: 'Review the design', status: 'in_progress', due_date: today }, { name: 'Launch', status: 'pending' }] }];
const meetings = empty ? [] : [{ id: 301, type: 'Design review', status: 'confirmed', date: today, time: '2:30 PM', duration: 30, client_name: 'Jordan Example' }];
const contracts = empty ? [] : [{ id: 401, title: 'Website & portal agreement', status: 'sent' }, { id: 402, title: 'Completed brand agreement', status: 'signed' }];
const fixtures = {
  '/api/auth/me': { user },
  '/api/support/tickets': { tickets },
  '/api/projects': { projects },
  '/api/scheduler/meetings/99999': meetings,
  '/api/scheduler/appointments': meetings,
  '/api/contracts': { contracts },
  '/api/contacts': empty ? [] : [{ id: 601, name: 'Alex Example', email: 'alex@example.invalid', message: 'We need a simpler way to manage intake.', status: 'new', created_at: new Date().toISOString() }],
  '/api/analytics/overview': { pageViewsToday: 126 },
  '/api/crm/contacts': empty ? [] : [{ id: 701 }],
  '/api/notifications': [],
  '/api/support/tickets/501': { ticket: tickets[0], replies: [] },
};
window.fetch = async (input) => {
  const path = new URL(typeof input === 'string' ? input : input.url, location.origin).pathname;
  if (failed && ['/api/projects', '/api/contracts', '/api/scheduler/meetings/99999'].includes(path)) return new Response('{}', { status: 503 });
  return new Response(JSON.stringify(fixtures[path] ?? {}), { status: 200, headers: { 'Content-Type': 'application/json' } });
};
history.replaceState(null, '', '/client-portal');
createRoot(document.getElementById('root')).render(<AuthProvider><App /></AuthProvider>);
