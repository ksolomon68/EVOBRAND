import React, { useState, useEffect, useRef } from 'react';
import {
  Loader2, ShieldAlert, ArrowLeft, Send, DollarSign,
  CheckCircle2, Clock, AlertCircle, Users, Tag, Paperclip, Shield, Zap, Star
} from 'lucide-react';

const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:5000/api/support'
  : (window.location.origin + '/api/support');

const PLAN_OPTS = [
  { value: '', label: 'No Plan' },
  { value: 'basic', label: 'Basic Plan', icon: Shield },
  { value: 'pro', label: 'Pro Plan', icon: Zap },
  { value: 'elite', label: 'Elite Plan', icon: Star },
];

const GOLD = '#22c8e5';
const NAVY = '#003258';

const STATUS_OPTS = ['open', 'in_progress', 'resolved', 'closed'];
const PRIORITY_OPTS = ['low', 'normal', 'high', 'urgent'];

// America/Chicago auto-handles CST/CDT (UTC-6 / UTC-5) across DST — this is
// what visitors mean by "CST" in everyday use.
function formatCST(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleString('en-US', {
    timeZone: 'America/Chicago',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short',
  });
}

const statusColor = (s) => ({
  open: 'text-green-400 bg-green-400/10 border-green-400/30',
  in_progress: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30',
  resolved: 'text-white/30 bg-white/5 border-white/10',
  closed: 'text-white/20 bg-white/5 border-white/5',
}[s] || 'text-white/40 bg-white/5 border-white/10');

const priorityColor = (p) => ({
  urgent: 'text-red-400',
  high: 'text-orange-400',
  normal: 'text-yellow-400',
  low: 'text-white/40',
}[p] || 'text-white/40');

function TicketRow({ t, onOpen }) {
  return (
    <tr
      className="border-b border-white/5 hover:bg-white/[0.03] cursor-pointer transition-colors"
      onClick={() => onOpen(t)}
    >
      <td className="px-5 py-4">
        <p className="text-white font-semibold text-sm truncate max-w-[220px]">{t.subject}</p>
        <p className="text-white/30 text-xs mt-0.5">#{t.id}</p>
      </td>
      <td className="px-5 py-4 text-white/50 text-sm">{t.user_name || t.user_email}</td>
      <td className="px-5 py-4">
        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${statusColor(t.status)}`}>
          {t.status?.replace('_', ' ')}
        </span>
      </td>
      <td className={`px-5 py-4 text-sm font-bold ${priorityColor(t.priority)}`}>
        {t.priority}
      </td>
      <td className="px-5 py-4 text-sm font-bold" style={{ color: GOLD }}>
        {t.quoted_price > 0 ? `$${Number(t.quoted_price).toFixed(2)}` : '—'}
      </td>
      <td className="px-5 py-4 text-white/30 text-xs whitespace-nowrap">
        {formatCST(t.created_at)}
      </td>
      <td className="px-5 py-4 text-white/30 text-xs whitespace-nowrap">
        {formatCST(t.updated_at)}
      </td>
    </tr>
  );
}

function TicketDetail({ ticket, onBack, onRefresh }) {
  const [history, setHistory] = useState(ticket.history || []);
  const [replyText, setReplyText] = useState('');
  const [priceInput, setPriceInput] = useState(String(ticket.quoted_price || ''));
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  const [sending, setSending] = useState(false);
  const [planValue, setPlanValue] = useState(ticket.user_support_plan || '');
  const [planSaving, setPlanSaving] = useState(false);
  const [planMsg, setPlanMsg] = useState('');
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [history]);

  const authHeader = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('evobrand_token')}`,
  });

  const update = async (updates) => {
    setSaving(true);
    setSaveMsg('');
    try {
      const res = await fetch(`${API_URL}/tickets/${ticket.id}`, {
        method: 'PUT',
        headers: authHeader(),
        body: JSON.stringify(updates),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setSaveMsg('Saved');
        setTimeout(() => setSaveMsg(''), 2000);
        onRefresh();
      } else {
        setSaveMsg(data.error || 'Save failed');
      }
    } catch {
      setSaveMsg('Network error');
    } finally {
      setSaving(false);
    }
  };

  const savePlan = async (plan) => {
    if (!ticket.user_id) return;
    setPlanSaving(true);
    setPlanMsg('');
    try {
      const res = await fetch(`${API_URL}/users/${ticket.user_id}/plan`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('evobrand_token')}`,
        },
        body: JSON.stringify({ plan: plan || null }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setPlanMsg('Saved');
        setTimeout(() => setPlanMsg(''), 2000);
      } else {
        setPlanMsg(data.error || 'Failed');
      }
    } catch {
      setPlanMsg('Network error');
    } finally {
      setPlanSaving(false);
    }
  };

  const sendReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    setSending(true);
    try {
      const res = await fetch(`${API_URL}/tickets/${ticket.id}/reply`, {
        method: 'POST',
        headers: authHeader(),
        body: JSON.stringify({ message: replyText }),
      });
      if (res.ok) {
        setReplyText('');
        // reload replies
        const r2 = await fetch(`${API_URL}/tickets/${ticket.id}`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('evobrand_token')}` },
        });
        if (r2.ok) {
          const d = await r2.json();
          setHistory(d.replies || []);
        }
        onRefresh();
      }
    } catch { /* ignore */ }
    setSending(false);
  };

  return (
    <div>
      <button onClick={onBack} className="flex items-center gap-2 text-sm font-bold mb-6 hover:opacity-70 transition-opacity" style={{ color: GOLD }}>
        <ArrowLeft size={14} /> Back to Inbox
      </button>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Thread */}
        <div className="flex-1 flex flex-col bg-white/5 border border-white/10 rounded-2xl overflow-hidden" style={{ minHeight: 480 }}>
          <div className="p-5 border-b border-white/10">
            <h2 className="text-white font-bold text-lg">{ticket.subject}</h2>
            <p className="text-white/40 text-xs mt-1">From: {ticket.user_name} · {ticket.user_email}</p>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {/* Original message */}
            <div className="flex justify-start">
              <div className="max-w-[80%] bg-white/5 border border-white/10 rounded-2xl rounded-tl-none p-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-2">Client · Original</p>
                <p className="text-white/80 text-sm leading-relaxed">{ticket.message}</p>

                {/* Attachment */}
                {ticket.attachment_url && (() => {
                  const url = ticket.attachment_url.startsWith('http')
                    ? ticket.attachment_url
                    : `${window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? 'http://localhost:5000' : ''}${ticket.attachment_url}`;
                  const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(ticket.attachment_url);
                  return (
                    <div className="mt-3 pt-3 border-t border-white/10">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-2 flex items-center gap-1">
                        <Paperclip size={10} /> Attachment
                      </p>
                      {isImage ? (
                        <a href={url} target="_blank" rel="noreferrer">
                          <img
                            src={url}
                            alt="Ticket attachment"
                            className="max-w-full max-h-64 rounded-xl object-cover border border-white/10 hover:opacity-80 transition-opacity cursor-pointer"
                          />
                        </a>
                      ) : (
                        <a
                          href={url}
                          target="_blank"
                          rel="noreferrer"
                          download
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-sm font-bold transition-colors"
                          style={{ background: 'rgba(34,200,229,0.1)', color: '#22c8e5', border: '1px solid rgba(34,200,229,0.2)' }}
                          onMouseEnter={e => e.currentTarget.style.background = 'rgba(34,200,229,0.2)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'rgba(34,200,229,0.1)'}
                        >
                          <Paperclip size={14} />
                          {ticket.attachment_url.split('/').pop()}
                        </a>
                      )}
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Replies */}
            {history.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender_is_admin ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed ${
                  msg.sender_is_admin
                    ? 'rounded-tr-none text-white border border-[rgba(34,200,229,0.25)]'
                    : 'rounded-tl-none bg-white/5 border border-white/10 text-white/80'
                }`} style={msg.sender_is_admin ? { background: 'rgba(34,200,229,0.1)' } : {}}>
                  <p className="text-[10px] font-bold uppercase tracking-widest mb-2 opacity-50">
                    {msg.sender_is_admin ? 'You (Admin)' : ticket.user_name || 'Client'}
                  </p>
                  {msg.message}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          <form onSubmit={sendReply} className="p-4 border-t border-white/10 flex gap-3">
            <input
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Reply to client..."
              className="flex-1 bg-white/5 border border-white/10 text-white rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-[#22c8e5] transition-colors"
            />
            <button
              type="submit"
              disabled={sending || !replyText.trim()}
              className="px-5 py-3 rounded-2xl font-bold text-sm flex items-center gap-2 disabled:opacity-40 transition-colors"
              style={{ background: GOLD, color: NAVY }}
            >
              {sending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
              Send
            </button>
          </form>
        </div>

        {/* Controls */}
        <div className="w-full lg:w-72 space-y-5 lg:flex-shrink-0">

          {/* Status & Priority */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-white/40">Ticket Settings</h3>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-white/30 block mb-1.5">Status</label>
              <select
                defaultValue={ticket.status}
                onChange={(e) => update({ status: e.target.value })}
                className="w-full bg-[#04080f] border border-white/10 text-white text-sm p-2.5 rounded-lg focus:outline-none focus:border-[#22c8e5]"
              >
                {STATUS_OPTS.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-white/30 block mb-1.5">Priority</label>
              <select
                defaultValue={ticket.priority}
                onChange={(e) => update({ priority: e.target.value })}
                className="w-full bg-[#04080f] border border-white/10 text-white text-sm p-2.5 rounded-lg focus:outline-none focus:border-[#22c8e5]"
              >
                {PRIORITY_OPTS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>

          {/* Quoted Price */}
          <div className="bg-white/5 border border-[rgba(34,200,229,0.2)] rounded-2xl p-5">
            <h3 className="text-xs font-bold uppercase tracking-widest mb-3 flex items-center gap-2" style={{ color: GOLD }}>
              <DollarSign size={12} /> Quoted Price
            </h3>
            <div className="flex gap-2 mb-3">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 font-bold text-sm">$</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={priceInput}
                  onChange={(e) => setPriceInput(e.target.value)}
                  className="w-full bg-[#04080f] border border-[rgba(34,200,229,0.3)] text-white font-bold pl-7 pr-3 py-2.5 rounded-2xl text-sm focus:outline-none focus:border-[#22c8e5]"
                  placeholder="0.00"
                />
              </div>
              <button
                onClick={() => update({ quoted_price: parseFloat(priceInput) || 0 })}
                disabled={saving}
                className="px-4 py-2.5 rounded-2xl text-sm font-bold disabled:opacity-50 transition-colors"
                style={{ background: 'rgba(34,200,229,0.15)', color: GOLD }}
              >
                {saving ? <Loader2 size={13} className="animate-spin" /> : 'Save'}
              </button>
            </div>
            {saveMsg && (
              <p className={`text-xs font-bold ${saveMsg === 'Saved' ? 'text-green-400' : 'text-red-400'}`}>
                {saveMsg}
              </p>
            )}

            <label className="flex items-center gap-3 cursor-pointer mt-3 pt-3 border-t border-white/10">
              <input
                type="checkbox"
                defaultChecked={ticket.is_paid === 1 || ticket.is_paid === true}
                onChange={(e) => update({ is_paid: e.target.checked ? 1 : 0 })}
                className="w-4 h-4 rounded accent-[#22c8e5]"
              />
              <span className="text-sm font-bold text-white/70">Mark as Paid</span>
              {(ticket.is_paid === 1 || ticket.is_paid === true) && (
                <CheckCircle2 size={14} className="text-green-400 ml-auto" />
              )}
            </label>
          </div>

          {/* Client Info */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-widest text-white/40">Client</h3>
            <div>
              <p className="text-white font-semibold text-sm">{ticket.user_name || '—'}</p>
              <p className="text-white/40 text-xs">{ticket.user_email}</p>
            </div>
            <div className="text-xs text-white/30">
              <p>Opened: {formatCST(ticket.created_at)}</p>
              <p>Updated: {formatCST(ticket.updated_at)}</p>
            </div>

            {/* Maintenance Plan */}
            <div className="pt-3 border-t border-white/10">
              <label className="text-[10px] font-bold uppercase tracking-widest text-white/30 block mb-2">Maintenance Plan</label>
              <div className="flex gap-2">
                <select
                  value={planValue}
                  onChange={(e) => setPlanValue(e.target.value)}
                  className="flex-1 bg-[#04080f] border border-white/10 text-white text-sm p-2.5 rounded-lg focus:outline-none focus:border-[#22c8e5]"
                >
                  {PLAN_OPTS.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
                <button
                  onClick={() => savePlan(planValue)}
                  disabled={planSaving}
                  className="px-3 py-2 rounded-2xl text-sm font-bold disabled:opacity-50 transition-colors"
                  style={{ background: 'rgba(34,200,229,0.15)', color: GOLD }}
                >
                  {planSaving ? <Loader2 size={13} className="animate-spin" /> : 'Save'}
                </button>
              </div>
              {planMsg && (
                <p className={`text-xs font-bold mt-1.5 ${planMsg === 'Saved' ? 'text-green-400' : 'text-red-400'}`}>
                  {planMsg}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminTicketPanel({ user }) {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState('all');

  const isAdmin = user?.is_admin === 1 || user?.is_admin === true;

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('evobrand_token');
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 10000);
      let res;
      try {
        res = await fetch(`${API_URL}/tickets`, {
          headers: { 'Authorization': `Bearer ${token}` },
          signal: controller.signal,
        });
      } finally {
        clearTimeout(timer);
      }
      const data = await res.json();
      if (res.ok) {
        setTickets((data.tickets || []).map(t => ({
          ...t,
          status: t.status?.toLowerCase() || 'open'
        })));
      }
    } catch (err) {
      console.error('Admin fetch tickets error:', err);
    } finally {
      setLoading(false);
    }
  };

  const openTicket = async (t) => {
    try {
      const token = localStorage.getItem('evobrand_token');
      const res = await fetch(`${API_URL}/tickets/${t.id}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setSelected({ ...data.ticket, history: data.replies });
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { if (isAdmin) fetchTickets(); }, [isAdmin]);

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center rounded-2xl border" style={{ borderColor: 'rgba(34,200,229,0.12)', background: 'rgba(10,22,40,0.5)' }}>
        <ShieldAlert size={36} style={{ color: 'rgba(34,200,229,0.4)' }} className="mb-4" />
        <h3 className="text-lg font-bold text-white mb-2">Admin Access Only</h3>
        <p className="text-sm text-white/40">This panel is restricted to administrator accounts.</p>
      </div>
    );
  }

  if (selected) {
    return (
      <TicketDetail
        ticket={selected}
        onBack={() => { setSelected(null); fetchTickets(); }}
        onRefresh={fetchTickets}
      />
    );
  }

  const FILTERS = ['all', 'open', 'in_progress', 'resolved'];
  const filtered = filter === 'all' ? tickets : tickets.filter(t => t.status === filter);

  const counts = {
    open: tickets.filter(t => t.status === 'open').length,
    in_progress: tickets.filter(t => t.status === 'in_progress').length,
    resolved: tickets.filter(t => t.status === 'resolved').length,
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-1">Support Inbox</h1>
        <p className="text-white/40 text-sm">Manage tickets, reply to clients, and set quoted prices.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Open', value: counts.open, icon: AlertCircle, color: '#4ade80' },
          { label: 'In Progress', value: counts.in_progress, icon: Clock, color: '#facc15' },
          { label: 'Resolved', value: counts.resolved, icon: CheckCircle2, color: GOLD },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="p-5 rounded-2xl border flex items-center gap-4" style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.07)' }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${color}15` }}>
              <Icon size={18} style={{ color }} />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{value}</p>
              <p className="text-xs text-white/40 font-bold uppercase tracking-widest">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-5">
        {FILTERS.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className="px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all"
            style={filter === f
              ? { background: GOLD, color: NAVY }
              : { background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.4)' }}
          >
            {f.replace('_', ' ')}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="animate-spin" style={{ color: GOLD }} /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-white/30">No tickets in this category.</div>
      ) : (
        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-x-auto">
          <table className="w-full text-left">
            <thead className="border-b border-white/10 text-[10px] font-bold uppercase tracking-widest text-white/30">
              <tr>
                <th className="px-5 py-3">Subject</th>
                <th className="px-5 py-3">Client</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Priority</th>
                <th className="px-5 py-3">Quote</th>
                <th className="px-5 py-3">Created (CST)</th>
                <th className="px-5 py-3">Updated (CST)</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(t => (
                <TicketRow key={t.id} t={t} onOpen={openTicket} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
