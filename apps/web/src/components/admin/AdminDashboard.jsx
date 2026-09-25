import { useState, useEffect } from 'react';

import {
  AlertCircle, Ticket, Mail, Calendar, Users, Eye, FileText,
  ArrowRight, Clock, CheckCircle2, Circle, Loader2
} from 'lucide-react';

const GOLD = '#22c8e5';

const API = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:5000/api'
  : window.location.origin + '/api';

function authHeaders() {
  return { Authorization: `Bearer ${localStorage.getItem('evobrand_token')}` };
}

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function fmtDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function fmtMeetingDate(dateStr, timeStr) {
  const day = String(dateStr || '').slice(0, 10);
  const date = new Date(day + 'T12:00:00');
  const label = Number.isNaN(date.getTime()) ? 'Date to be confirmed'
    : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  return timeStr ? `${label} · ${timeStr} CT` : label;
}

const STATUS_STYLES = {
  open:        { bg: 'rgba(34,200,229,0.12)', color: GOLD,       label: 'Open' },
  in_progress: { bg: 'rgba(167,139,250,0.12)', color: '#a78bfa', label: 'In Progress' },
  pending:     { bg: 'rgba(250,204,21,0.12)',  color: '#facc15', label: 'Pending' },
  resolved:    { bg: 'rgba(52,211,153,0.12)',  color: '#34d399', label: 'Resolved' },
  closed:      { bg: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.3)', label: 'Closed' },
};

function StatusBadge({ status }) {
  const s = STATUS_STYLES[status] || STATUS_STYLES.open;
  return (
    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider whitespace-nowrap"
      style={{ background: s.bg, color: s.color }}>
      {s.label}
    </span>
  );
}

function SectionCard({ children, className = '' }) {
  return (
    <div className={`rounded-2xl overflow-hidden ${className}`}
      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
      {children}
    </div>
  );
}

function SectionHeader({ icon: Icon, title, count, onNavigate, navLabel }) {
  return (
    <div className="flex items-center justify-between px-5 py-4"
      style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
      <div className="flex items-center gap-2">
        <Icon size={15} style={{ color: GOLD }} />
        <span className="text-sm font-bold text-white">{title}</span>
        {count != null && (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full ml-1"
            style={{ background: 'rgba(34,200,229,0.12)', color: GOLD }}>{count}</span>
        )}
      </div>
      {onNavigate && (
        <button onClick={onNavigate}
          className="flex items-center gap-1 text-xs font-medium transition-colors hover:text-white"
          style={{ color: 'var(--evo-muted)' }}>
          {navLabel || 'View all'} <ArrowRight size={12} />
        </button>
      )}
    </div>
  );
}

function EmptyRow({ text }) {
  return (
    <div className="px-5 py-6 text-sm text-center" style={{ color: 'var(--evo-muted)' }}>{text}</div>
  );
}

export default function AdminDashboard({ tickets = [], onViewTicket, setView }) {
  const [contacts, setContacts]   = useState([]);
  const [meetings, setMeetings]   = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [crmCount, setCrmCount]   = useState(null);
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    const h = authHeaders();
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 10000);
    const read = url => fetch(url, { headers: h, signal: controller.signal }).then(r => {
      if (!r.ok) throw new Error('Unable to load overview');
      return r.json();
    });
    Promise.allSettled([
      read(`${API}/contacts`),
      read(`${API}/scheduler/appointments`),
      read(`${API}/analytics/overview`),
      read(`${API}/crm/contacts`),
      read(`${API}/contracts`),
    ]).then(([c, m, a, crm, co]) => {
      clearTimeout(timer);
      setLoadError([c, m, a, crm, co].some(r => r.status === 'rejected'));
      if (c.status === 'fulfilled') setContacts(Array.isArray(c.value) ? c.value : []);
      if (m.status === 'fulfilled') setMeetings(Array.isArray(m.value) ? m.value : []);
      if (a.status === 'fulfilled' && a.value) setAnalytics(a.value);
      if (crm.status === 'fulfilled' && crm.value) {
        const arr = Array.isArray(crm.value) ? crm.value : crm.value?.contacts || [];
        setCrmCount(arr.length);
      }
      if (co.status === 'fulfilled') setContracts(Array.isArray(co.value) ? co.value : co.value?.contracts || []);
      setLoading(false);
    });
    return () => { clearTimeout(timer); controller.abort(); };
  }, []);

  // Derived counts
  const openTickets    = tickets.filter(t => t.status === 'open' || t.status === 'in_progress');
  const pendingTickets = tickets.filter(t => t.status === 'pending');
  const newContacts    = contacts.filter(c => c.status === 'new');
  const today = new Date().toLocaleDateString('en-CA');
  const todayMeetings  = meetings.filter(m => m.date?.slice(0, 10) === today);
  const upcomingMtgs = meetings.filter(m => m.date?.slice(0, 10) >= today && ['scheduled', 'confirmed'].includes(m.status))
    .sort((a, b) => a.date.localeCompare(b.date) || String(a.time).localeCompare(String(b.time))).slice(0, 4);
  const unsignedContracts = contracts.filter(c => c.status === 'sent');

  // Needs-attention alerts
  const alerts = [
    pendingTickets.length && { label: `${pendingTickets.length} pending response${pendingTickets.length > 1 ? 's' : ''}`, icon: Clock, action: () => setView('admin'),  color: '#facc15' },
    unsignedContracts.length && { label: `${unsignedContracts.length} unsigned contract${unsignedContracts.length > 1 ? 's' : ''}`, icon: FileText, action: () => setView('contract-builder'), color: '#a78bfa' },
  ].filter(Boolean);

  const now = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <div className="space-y-7">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Studio overview</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--evo-muted)' }}>{now} · Your work, in one place.</p>
        </div>
        {loading && <Loader2 size={18} className="animate-spin mt-1" style={{ color: 'rgba(255,255,255,0.3)' }} />}
      </div>

      {loadError && <p role="alert" className="portal-notice">Some information could not be loaded. Refresh to try again; the counts below may be incomplete.</p>}
      {/* Follow-ups */}
      {alerts.length > 0 && (
        <div className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <p className="text-xs font-bold uppercase tracking-widest mb-3 flex items-center gap-2" style={{ color: 'var(--evo-muted)' }}>
            <AlertCircle size={13} /> Needs Attention
          </p>
          <div className="flex flex-wrap gap-2">
            {alerts.map((a, i) => (
              <button key={i} onClick={a.action}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all hover:brightness-125"
                style={{ background: `${a.color}15`, border: `1px solid ${a.color}30`, color: a.color }}>
                <a.icon size={12} />
                {a.label}
                <ArrowRight size={10} style={{ opacity: 0.6 }} />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Context metrics; actionable counts belong with their lists. */}
      <div className="grid grid-cols-2 gap-4">
        {[
          { icon: Eye,      label: 'Page Views Today', value: analytics ? analytics.pageViewsToday?.toLocaleString() : '-', color: GOLD },
          { icon: Users,    label: 'CRM Contacts',     value: crmCount != null ? crmCount.toLocaleString() : '-',          color: '#a78bfa' },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="rounded-2xl p-5"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <div className="flex items-center gap-2 mb-3">
              <Icon size={14} style={{ color }} />
              <span className="text-xs uppercase tracking-widest font-bold" style={{ color: 'var(--evo-muted)' }}>{label}</span>
            </div>
            <p className="text-3xl font-bold" style={{ color }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Recent Tickets */}
        <SectionCard>
          <SectionHeader icon={Ticket} title="Recent Tickets"
            
            onNavigate={() => setView('admin')} />
          {tickets.length === 0
            ? <EmptyRow text="No tickets yet" />
            : tickets.slice(0, 6).map(t => (
              <button key={t.id} onClick={() => onViewTicket(t)}
                className="w-full flex items-start gap-3 px-5 py-3.5 text-left transition-colors hover:bg-white/5"
                style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <div className="mt-0.5">
                  {t.status === 'resolved' || t.status === 'closed'
                    ? <CheckCircle2 size={14} style={{ color: '#34d399' }} />
                    : <Circle size={14} style={{ color: GOLD }} />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{t.subject || t.title || 'Untitled'}</p>
                  <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--evo-muted)' }}>
                    {t.user_name || t.name || 'Client'} · {timeAgo(t.lastUpdated || t.updated_at || t.created_at)}
                  </p>
                </div>
                <StatusBadge status={t.status} />
              </button>
            ))
          }
        </SectionCard>

        {/* Contact Form Submissions */}
        <SectionCard>
          <SectionHeader icon={Mail} title="New inquiries"
            count={newContacts.length || undefined}
            onNavigate={() => setView('contact-forms')} />
          {loading
            ? <EmptyRow text="Loading…" />
            : newContacts.length === 0
            ? <EmptyRow text="No new inquiries. New website requests will appear here." />
            : newContacts.slice(0, 6).map(c => (
              <div key={c.id}
                className="flex items-start gap-3 px-5 py-3.5"
                style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <div className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 text-xs font-bold"
                  style={{ background: c.status === 'new' ? 'rgba(244,114,182,0.15)' : 'rgba(255,255,255,0.06)',
                           color: c.status === 'new' ? '#f472b6' : 'var(--evo-muted)' }}>
                  {(c.name || 'A').charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{c.name || 'Unknown'}</p>
                  <p className="text-xs truncate mt-0.5" style={{ color: 'var(--evo-muted)' }}>
                    {c.email} · {timeAgo(c.created_at)}
                  </p>
                  {c.message && (
                    <p className="text-xs mt-1 truncate" style={{ color: 'var(--evo-muted)' }}>{c.message}</p>
                  )}
                </div>
                {c.status === 'new' && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0"
                    style={{ background: 'rgba(244,114,182,0.15)', color: '#f472b6' }}>NEW</span>
                )}
              </div>
            ))
          }
        </SectionCard>
      </div>

      {/* Upcoming Meetings */}
      <SectionCard>
        <SectionHeader icon={Calendar} title="Upcoming Meetings"
          count={upcomingMtgs.length || undefined}
          onNavigate={() => setView('meetings')} />
        {loading
          ? <EmptyRow text="Loading…" />
          : upcomingMtgs.length === 0
          ? <EmptyRow text="No upcoming meetings" />
          : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-0 divide-x divide-white/5">
              {upcomingMtgs.map(m => (
                <div key={m.id} className="px-5 py-4">
                  <p className="text-xs font-bold uppercase tracking-wider mb-2"
                    style={{ color: m.date?.slice(0, 10) === today ? '#34d399' : GOLD }}>
                    {m.date?.slice(0, 10) === today ? 'TODAY' : fmtMeetingDate(m.date, m.time)}
                  </p>
                  <p className="text-sm font-semibold text-white truncate">{m.client_name || 'Client'}</p>
                  <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--evo-muted)' }}>
                    {m.type || 'Meeting'} · {m.duration || 30} min
                  </p>
                  {m.date?.slice(0, 10) === today && (
                    <p className="text-xs mt-1" style={{ color: 'var(--evo-muted)' }}>{m.time}</p>
                  )}
                </div>
              ))}
            </div>
          )
        }
      </SectionCard>
    </div>
  );
}
