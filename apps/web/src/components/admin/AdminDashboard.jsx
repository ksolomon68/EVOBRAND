import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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
  const d = new Date(`${dateStr}T${timeStr || '00:00'}`);
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);
  const day = d < tomorrow ? (d < new Date(tomorrow) && d >= today ? 'Today' : 'Tomorrow') : fmtDate(dateStr);
  return `${day} at ${d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
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
          style={{ color: 'rgba(255,255,255,0.35)' }}>
          {navLabel || 'View all'} <ArrowRight size={12} />
        </button>
      )}
    </div>
  );
}

function EmptyRow({ text }) {
  return (
    <div className="px-5 py-6 text-sm text-center" style={{ color: 'rgba(255,255,255,0.25)' }}>{text}</div>
  );
}

export default function AdminDashboard({ tickets = [], onViewTicket, setView }) {
  const [contacts, setContacts]   = useState([]);
  const [meetings, setMeetings]   = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [crmCount, setCrmCount]   = useState(null);
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    const h = authHeaders();
    Promise.allSettled([
      fetch(`${API}/contacts`, { headers: h }).then(r => r.ok ? r.json() : []),
      fetch(`${API}/scheduler/appointments`, { headers: h }).then(r => r.ok ? r.json() : []),
      fetch(`${API}/analytics/overview`, { headers: h }).then(r => r.ok ? r.json() : null),
      fetch(`${API}/crm/contacts`, { headers: h }).then(r => r.ok ? r.json() : null),
      fetch(`${API}/contracts`, { headers: h }).then(r => r.ok ? r.json() : []),
    ]).then(([c, m, a, crm, co]) => {
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
  }, []);

  // Derived counts
  const openTickets    = tickets.filter(t => t.status === 'open' || t.status === 'in_progress');
  const pendingTickets = tickets.filter(t => t.status === 'pending');
  const newContacts    = contacts.filter(c => c.status === 'new');
  const today          = new Date().toISOString().slice(0, 10);
  const todayMeetings  = meetings.filter(m => m.date?.slice(0, 10) === today);
  const upcomingMtgs   = meetings.filter(m => m.date?.slice(0, 10) >= today).slice(0, 4);
  const unsignedContracts = contracts.filter(c => !c.signed_at && !c.client_signed_at);

  // Needs-attention alerts
  const alerts = [
    openTickets.length    && { label: `${openTickets.length} open ticket${openTickets.length > 1 ? 's' : ''}`,    icon: Ticket,   action: () => setView('admin'),         color: GOLD },
    pendingTickets.length && { label: `${pendingTickets.length} pending response${pendingTickets.length > 1 ? 's' : ''}`, icon: Clock, action: () => setView('admin'),  color: '#facc15' },
    newContacts.length    && { label: `${newContacts.length} new contact form${newContacts.length > 1 ? 's' : ''}`, icon: Mail,    action: () => setView('contact-forms'), color: '#f472b6' },
    todayMeetings.length  && { label: `${todayMeetings.length} meeting${todayMeetings.length > 1 ? 's' : ''} today`, icon: Calendar, action: () => setView('scheduler-admin'), color: '#34d399' },
    unsignedContracts.length && { label: `${unsignedContracts.length} unsigned contract${unsignedContracts.length > 1 ? 's' : ''}`, icon: FileText, action: () => setView('contract-builder'), color: '#a78bfa' },
  ].filter(Boolean);

  const now = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <div className="space-y-7">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Command Center</h1>
          <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.35)' }}>{now}</p>
        </div>
        {loading && <Loader2 size={18} className="animate-spin mt-1" style={{ color: 'rgba(255,255,255,0.3)' }} />}
      </div>

      {/* Needs Attention */}
      {alerts.length > 0 && (
        <div className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <p className="text-xs font-bold uppercase tracking-widest mb-3 flex items-center gap-2" style={{ color: 'rgba(255,255,255,0.4)' }}>
            <AlertCircle size={13} /> Needs Attention
          </p>
          <div className="flex flex-wrap gap-2">
            {alerts.map((a, i) => (
              <button key={i} onClick={a.action}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all hover:scale-[1.02]"
                style={{ background: `${a.color}15`, border: `1px solid ${a.color}30`, color: a.color }}>
                <a.icon size={12} />
                {a.label}
                <ArrowRight size={10} style={{ opacity: 0.6 }} />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: Eye,      label: 'Page Views Today', value: analytics ? analytics.pageViewsToday?.toLocaleString() : '—', color: GOLD },
          { icon: Ticket,   label: 'Open Tickets',     value: openTickets.length,                                           color: '#facc15' },
          { icon: Mail,     label: 'New Forms',        value: loading ? '…' : newContacts.length,                          color: '#f472b6' },
          { icon: Users,    label: 'CRM Contacts',     value: crmCount != null ? crmCount.toLocaleString() : '—',          color: '#a78bfa' },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="rounded-2xl p-5"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <div className="flex items-center gap-2 mb-3">
              <Icon size={14} style={{ color }} />
              <span className="text-xs uppercase tracking-widest font-bold" style={{ color: 'rgba(255,255,255,0.4)' }}>{label}</span>
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
            count={openTickets.length || undefined}
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
                  <p className="text-xs mt-0.5 truncate" style={{ color: 'rgba(255,255,255,0.35)' }}>
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
          <SectionHeader icon={Mail} title="Contact Forms"
            count={newContacts.length || undefined}
            onNavigate={() => setView('contact-forms')} />
          {loading
            ? <EmptyRow text="Loading…" />
            : contacts.length === 0
            ? <EmptyRow text="No submissions yet" />
            : contacts.slice(0, 6).map(c => (
              <div key={c.id}
                className="flex items-start gap-3 px-5 py-3.5"
                style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <div className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 text-xs font-bold"
                  style={{ background: c.status === 'new' ? 'rgba(244,114,182,0.15)' : 'rgba(255,255,255,0.06)',
                           color: c.status === 'new' ? '#f472b6' : 'rgba(255,255,255,0.4)' }}>
                  {(c.name || 'A').charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{c.name || 'Unknown'}</p>
                  <p className="text-xs truncate mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>
                    {c.email} · {timeAgo(c.created_at)}
                  </p>
                  {c.message && (
                    <p className="text-xs mt-1 truncate" style={{ color: 'rgba(255,255,255,0.25)' }}>{c.message}</p>
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
          onNavigate={() => setView('scheduler-admin')} />
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
                  <p className="text-xs mt-0.5 truncate" style={{ color: 'rgba(255,255,255,0.4)' }}>
                    {m.type || 'Meeting'} · {m.duration || 30} min
                  </p>
                  {m.date?.slice(0, 10) === today && (
                    <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.35)' }}>{m.time}</p>
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
