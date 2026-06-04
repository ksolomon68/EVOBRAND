import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ChevronLeft, ChevronRight, Plus, Trash2, Loader2, AlertCircle, ShieldAlert } from 'lucide-react';

const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
  ? 'http://localhost:5000/api' 
  : (window.location.origin + '/api');

const GOLD = '#22c8e5';
const NAVY = '#003258';
const BEIGE = '#ffffff';

const TIME_SLOTS = [
  '10:00 AM', '11:00 AM', '12:00 PM',
  '1:00 PM',  '2:00 PM',  '3:00 PM', '4:00 PM', '5:00 PM',
];
const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];
const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

function toISO(y, m, d) {
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

// ─── Mini calendar for selecting blackout date ────────────────────────────────

function DatePicker({ value, onChange }) {
  const [view, setView] = useState(() => {
    const n = new Date();
    return { year: n.getFullYear(), month: n.getMonth() };
  });

  const daysInMonth = new Date(view.year, view.month + 1, 0).getDate();
  const firstDow = new Date(view.year, view.month, 1).getDay();
  const todayStr = toISO(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());

  const cells = [];
  for (let i = 0; i < firstDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const prevMonth = () =>
    setView((v) => v.month === 0 ? { year: v.year - 1, month: 11 } : { ...v, month: v.month - 1 });
  const nextMonth = () =>
    setView((v) => v.month === 11 ? { year: v.year + 1, month: 0 } : { ...v, month: v.month + 1 });

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <button
          type="button"
          onClick={prevMonth}
          aria-label="Previous month"
          className="w-7 h-7 rounded-full flex items-center justify-center transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#22c8e5]"
          style={{ color: 'rgba(255,255,255,0.4)' }}
          onMouseEnter={(e) => (e.currentTarget.style.color = GOLD)}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.4)')}
        >
          <ChevronLeft size={14} />
        </button>
        <span className="text-xs font-bold tracking-widest uppercase" style={{ color: BEIGE }}>
          {MONTHS[view.month]} {view.year}
        </span>
        <button
          type="button"
          onClick={nextMonth}
          aria-label="Next month"
          className="w-7 h-7 rounded-full flex items-center justify-center transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#22c8e5]"
          style={{ color: 'rgba(255,255,255,0.4)' }}
          onMouseEnter={(e) => (e.currentTarget.style.color = GOLD)}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.4)')}
        >
          <ChevronRight size={14} />
        </button>
      </div>
      <div className="grid grid-cols-7 mb-1">
        {DAYS.map((d) => (
          <div key={d} className="text-center text-[9px] font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.3)' }} aria-hidden="true">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-y-0.5">
        {cells.map((day, idx) => {
          if (!day) return <div key={`e${idx}`} aria-hidden="true" />;
          const dateStr = toISO(view.year, view.month, day);
          const selected = value === dateStr;
          const isPast = dateStr < todayStr;
          return (
            <button
              key={dateStr}
              type="button"
              onClick={() => onChange(dateStr)}
              disabled={isPast}
              aria-label={`${MONTHS[view.month]} ${day}${isPast ? ' (past)' : ''}`}
              aria-pressed={selected}
              className="w-full aspect-square flex items-center justify-center rounded-md text-xs font-medium transition-all duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#22c8e5]"
              style={{
                background: selected ? GOLD : 'transparent',
                color: isPast ? 'rgba(255,255,255,0.15)' : selected ? NAVY : BEIGE,
                cursor: isPast ? 'not-allowed' : 'pointer',
              }}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Add Blackout Form ────────────────────────────────────────────────────────

function AddBlackoutForm({ onAdded }) {
  const [date, setDate] = useState('');
  const [mode, setMode] = useState('day'); // 'day' | 'slot'
  const [slot, setSlot] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!date) { setError('Please select a date.'); return; }
    if (mode === 'slot' && !slot) { setError('Please select a time slot.'); return; }

    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${API_BASE}/scheduler/blackout-dates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: date,
          time: mode === 'slot' ? slot : null,
          reason: reason.trim() || null,
        }),
      });

      if (!res.ok) throw new Error('Failed to add blackout date');
      
      onAdded();
      setDate('');
      setSlot('');
      setReason('');
    } catch (dbErr) {
      setError(dbErr.message);
    }
    setLoading(false);
  };

  const inputStyle = {
    background: 'rgba(10,22,40,0.7)',
    color: BEIGE,
    borderColor: 'rgba(34,200,229,0.2)',
  };
  const inputClass = 'w-full px-3 py-2 rounded-lg text-sm border outline-none transition-all focus-visible:ring-2 focus-visible:ring-[#22c8e5]';

  return (
    <form onSubmit={handleSubmit} noValidate>
      <h3 className="text-sm font-bold uppercase tracking-widest mb-4" style={{ color: GOLD }}>
        Block a Date or Time
      </h3>

      {/* Date picker */}
      <div className="mb-4 p-4 rounded-xl border" style={{ background: 'rgba(10,22,40,0.5)', borderColor: 'rgba(34,200,229,0.12)' }}>
        <DatePicker value={date} onChange={setDate} />
      </div>

      {date && (
        <p className="text-xs mb-4 font-semibold" style={{ color: GOLD }}>
          Selected: {new Date(date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
      )}

      {/* Scope: whole day vs slot */}
      <div className="flex gap-2 mb-4" role="group" aria-label="Blackout scope">
        {[
          { key: 'day', label: 'Entire Day' },
          { key: 'slot', label: 'Specific Slot' },
        ].map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => setMode(key)}
            aria-pressed={mode === key}
            className="flex-1 py-2 rounded-2xl text-xs font-bold uppercase tracking-widest transition-all duration-200 border focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#22c8e5]"
            style={{
              background: mode === key ? GOLD : 'transparent',
              color: mode === key ? NAVY : 'rgba(255,255,255,0.5)',
              borderColor: mode === key ? GOLD : 'rgba(34,200,229,0.2)',
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Slot picker */}
      {mode === 'slot' && (
        <div className="mb-4">
          <label htmlFor="ab-slot" className="block text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color: 'rgba(34,200,229,0.7)' }}>
            Time Slot
          </label>
          <select id="ab-slot" value={slot} onChange={(e) => setSlot(e.target.value)} className={inputClass} style={{ ...inputStyle, appearance: 'none' }}>
            <option value="">Select slot</option>
            {TIME_SLOTS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      )}

      {/* Reason */}
      <div className="mb-5">
        <label htmlFor="ab-reason" className="block text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color: 'rgba(34,200,229,0.7)' }}>
          Reason <span style={{ color: 'rgba(255,255,255,0.3)', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional)</span>
        </label>
        <input
          id="ab-reason"
          type="text"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="e.g. Holiday, Travel, Team event"
          className={inputClass}
          style={inputStyle}
        />
      </div>

      {error && (
        <div className="flex items-start gap-2 p-3 rounded-lg mb-4" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)' }} role="alert">
          <AlertCircle size={13} className="text-red-400 mt-0.5 flex-shrink-0" aria-hidden="true" />
          <p className="text-red-300 text-xs">{error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={loading || !date}
        className="w-full py-3 rounded-2xl text-sm font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#22c8e5]"
        style={{
          background: loading || !date ? 'rgba(34,200,229,0.2)' : GOLD,
          color: loading || !date ? 'rgba(34,200,229,0.4)' : NAVY,
          cursor: loading || !date ? 'not-allowed' : 'pointer',
        }}
      >
        {loading ? <Loader2 size={14} className="animate-spin" aria-hidden="true" /> : <Plus size={14} aria-hidden="true" />}
        <span>{loading ? 'Adding...' : 'Add Blackout'}</span>
      </button>
    </form>
  );
}

// ─── Blackout List ────────────────────────────────────────────────────────────

function BlackoutList({ blackouts, onDelete }) {
  if (blackouts.length === 0) {
    return (
      <div className="flex flex-col items-center py-12 text-center rounded-2xl border" style={{ borderColor: 'rgba(34,200,229,0.08)', background: 'rgba(10,22,40,0.3)' }}>
        <p className="text-sm" style={{ color: 'rgba(255,255,255,0.35)' }}>No blackout dates configured.</p>
      </div>
    );
  }

  const sorted = [...blackouts].sort((a, b) => a.date.localeCompare(b.date));

  return (
    <ul className="space-y-2" aria-label="Blackout dates list">
      {sorted.map((b) => {
        const dateStr = b.date.includes('T') ? b.date.split('T')[0] : b.date;
        const formattedDate = new Date(dateStr + 'T12:00:00').toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        });
        return (
          <li
            key={b.id}
            className="flex items-start justify-between gap-3 p-4 rounded-xl border"
            style={{ background: 'rgba(10,22,40,0.6)', borderColor: 'rgba(34,200,229,0.1)' }}
          >
            <div className="min-w-0">
              <p className="text-sm font-semibold" style={{ color: BEIGE }}>
                {formattedDate}
                {b.time ? (
                  <span className="ml-2 text-xs font-normal" style={{ color: 'rgba(255,255,255,0.5)' }}>
                    · {b.time}
                  </span>
                ) : (
                  <span className="ml-2 text-xs font-bold uppercase tracking-widest px-1.5 py-0.5 rounded" style={{ background: 'rgba(34,200,229,0.12)', color: GOLD }}>
                    All Day
                  </span>
                )}
              </p>
              {b.reason && (
                <p className="text-xs mt-0.5 truncate" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  {b.reason}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={() => onDelete(b.id)}
              aria-label={`Remove blackout on ${formattedDate}${b.time ? ` at ${b.time}` : ''}`}
              className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-red-400"
              style={{ color: 'rgba(248,113,113,0.5)' }}
              onMouseEnter={(e) => { e.currentTarget.style.color = '#f87171'; e.currentTarget.style.background = 'rgba(248,113,113,0.1)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(248,113,113,0.5)'; e.currentTarget.style.background = 'transparent'; }}
            >
              <Trash2 size={13} aria-hidden="true" />
            </button>
          </li>
        );
      })}
    </ul>
  );
}

// ─── Main Panel ───────────────────────────────────────────────────────────────

export default function AdminBlackoutPanel({ user }) {
  const [blackouts, setBlackouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const panelRef = useRef(null);
  const isAdmin = user?.is_admin === 1 || user?.is_admin === true || user?.user_metadata?.role === 'admin';

  useGSAP(() => {
    gsap.fromTo(panelRef.current, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.45, ease: 'power2.out' });
  }, []);

  const fetchBlackouts = useCallback(() => {
    fetch(`${API_BASE}/scheduler/blackout-dates`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setBlackouts(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load blackout dates', err);
        setLoading(false);
      });
  }, []);

  useEffect(() => { fetchBlackouts(); }, [fetchBlackouts]);

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/scheduler/blackout-dates/${id}`, { method: 'DELETE' });
      if (res.ok) setBlackouts((prev) => prev.filter((b) => b.id !== id));
    } catch (err) {
      console.error('Failed to delete blackout date', err);
    }
  };

  if (!isAdmin) {
    return (
      <div
        ref={panelRef}
        className="flex flex-col items-center justify-center py-20 text-center rounded-2xl border"
        style={{ borderColor: 'rgba(34,200,229,0.12)', background: 'rgba(10,22,40,0.5)' }}
      >
        <ShieldAlert size={36} style={{ color: 'rgba(34,200,229,0.4)' }} className="mb-4" aria-hidden="true" />
        <h3 className="text-lg font-bold mb-2" style={{ color: BEIGE }}>Admin Access Only</h3>
        <p className="text-sm max-w-xs" style={{ color: 'rgba(255,255,255,0.45)' }}>
          This panel is restricted to administrator accounts.
        </p>
      </div>
    );
  }

  return (
    <div ref={panelRef}>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-1">Availability Controls</h1>
        <p style={{ color: 'rgba(255,255,255,0.45)' }}>
          Block specific dates or time slots from appearing in the scheduler.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Add form */}
        <div
          className="rounded-2xl p-6 border"
          style={{ background: 'rgba(13,30,53,0.7)', borderColor: 'rgba(34,200,229,0.15)' }}
        >
          <AddBlackoutForm onAdded={fetchBlackouts} />
        </div>

        {/* Current blackouts */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold uppercase tracking-widest" style={{ color: GOLD }}>
              Active Blackouts
            </h3>
            <span
              className="text-xs font-bold px-2 py-0.5 rounded-2xl"
              style={{ background: 'rgba(34,200,229,0.12)', color: GOLD }}
              aria-live="polite"
            >
              {blackouts.length}
            </span>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 size={24} className="animate-spin" style={{ color: GOLD }} aria-hidden="true" />
            </div>
          ) : (
            <BlackoutList blackouts={blackouts} onDelete={handleDelete} />
          )}
        </div>
      </div>
    </div>
  );
}
