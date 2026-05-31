import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ChevronLeft, ChevronRight, Calendar, Clock, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';

const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
  ? 'http://localhost:5000/api' 
  : 'https://evobrandconcepts.com/api';

// ─── Constants ──────────────────────────────────────────────────────────────

const TIME_SLOTS = [
  '10:00 AM', '11:00 AM', '12:00 PM',
  '1:00 PM',  '2:00 PM',  '3:00 PM', '4:00 PM', '5:00 PM',
];

const SERVICES = [
  'Custom AI Applications',
  'AI Visual Content Creation',
  'Intelligent Document Generation',
  'AI Video Production',
  'WordPress & Web Development',
  'General Consultation',
];

const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];

const GOLD = '#22c8e5';
const NAVY = '#003258';
const BEIGE = '#ffffff';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function toISO(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function today() {
  return toISO(new Date());
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StepIndicator({ step }) {
  const steps = [
    { n: 1, label: 'Date' },
    { n: 2, label: 'Time' },
    { n: 3, label: 'Confirm' },
  ];
  return (
    <div className="flex items-center justify-center gap-0 mb-8" role="list" aria-label="Booking steps">
      {steps.map(({ n, label }, i) => {
        const done = step > n;
        const active = step === n;
        return (
          <React.Fragment key={n}>
            <div className="flex flex-col items-center gap-1" role="listitem">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-400"
                style={{
                  background: done || active ? GOLD : 'rgba(255,255,255,0.08)',
                  color: done || active ? NAVY : 'rgba(255,255,255,0.4)',
                  boxShadow: active ? `0 0 16px rgba(34,200,229,0.5)` : 'none',
                }}
                aria-current={active ? 'step' : undefined}
              >
                {done ? <CheckCircle2 size={14} /> : n}
              </div>
              <span className="text-[10px] font-semibold tracking-widest uppercase" style={{ color: active ? GOLD : 'rgba(255,255,255,0.35)' }}>
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className="w-12 h-px mx-1 mb-5 transition-all duration-400" style={{ background: done ? GOLD : 'rgba(255,255,255,0.08)' }} aria-hidden="true" />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ─── Step 1: Calendar ────────────────────────────────────────────────────────

function CalendarPicker({ selectedDate, onSelect, blackoutDates }) {
  const todayStr = today();
  const ref = useRef(null);

  const [viewDate, setViewDate] = useState(() => {
    const d = new Date();
    return { year: d.getFullYear(), month: d.getMonth() };
  });

  useGSAP(() => {
    gsap.fromTo(ref.current, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' });
  }, { dependencies: [viewDate] });

  const daysInMonth = new Date(viewDate.year, viewDate.month + 1, 0).getDate();
  const firstDow = new Date(viewDate.year, viewDate.month, 1).getDay();

  const prevMonth = () => {
    setViewDate((v) => {
      if (v.month === 0) return { year: v.year - 1, month: 11 };
      return { ...v, month: v.month - 1 };
    });
  };

  const nextMonth = () => {
    setViewDate((v) => {
      if (v.month === 11) return { year: v.year + 1, month: 0 };
      return { ...v, month: v.month + 1 };
    });
  };

  const isBlackedOut = useCallback((dateStr) => {
    return blackoutDates.some((b) => b.blackout_date === dateStr && b.time_slot === null);
  }, [blackoutDates]);

  const isDisabled = useCallback((dateStr) => {
    return dateStr < todayStr || isBlackedOut(dateStr);
  }, [todayStr, isBlackedOut]);

  const cells = [];
  for (let i = 0; i < firstDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div>
      {/* Month navigation */}
      <div className="flex items-center justify-between mb-5">
        <button
          onClick={prevMonth}
          aria-label="Previous month"
          className="w-8 h-8 rounded-full flex items-center justify-center text-[#ffffff]/50 hover:text-[#22c8e5] hover:bg-white/5 transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#22c8e5]"
        >
          <ChevronLeft size={16} />
        </button>
        <span className="text-sm font-bold tracking-wider" style={{ color: BEIGE }}>
          {MONTHS[viewDate.month]} {viewDate.year}
        </span>
        <button
          onClick={nextMonth}
          aria-label="Next month"
          className="w-8 h-8 rounded-full flex items-center justify-center text-[#ffffff]/50 hover:text-[#22c8e5] hover:bg-white/5 transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#22c8e5]"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 mb-2">
        {DAYS.map((d) => (
          <div key={d} className="text-center text-[10px] font-bold tracking-widest uppercase" style={{ color: 'rgba(255,255,255,0.35)' }} aria-hidden="true">
            {d}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div ref={ref} className="grid grid-cols-7 gap-y-1">
        {cells.map((day, idx) => {
          if (!day) return <div key={`e${idx}`} aria-hidden="true" />;
          const dateStr = `${viewDate.year}-${String(viewDate.month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const disabled = isDisabled(dateStr);
          const selected = selectedDate === dateStr;
          const isToday = dateStr === todayStr;

          return (
            <button
              key={dateStr}
              onClick={() => !disabled && onSelect(dateStr)}
              disabled={disabled}
              aria-label={`${MONTHS[viewDate.month]} ${day}, ${viewDate.year}${disabled ? ' (unavailable)' : ''}`}
              aria-pressed={selected}
              className="w-full aspect-square flex items-center justify-center rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#22c8e5] focus-visible:outline-offset-1"
              style={{
                background: selected ? GOLD : isToday ? 'rgba(34,200,229,0.12)' : 'transparent',
                color: disabled ? 'rgba(255,255,255,0.18)' : selected ? NAVY : isToday ? GOLD : BEIGE,
                cursor: disabled ? 'not-allowed' : 'pointer',
                textDecoration: isBlackedOut(dateStr) && !disabled ? 'line-through' : 'none',
                fontWeight: selected ? 700 : 500,
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

// ─── Step 2: Time Slots ───────────────────────────────────────────────────────

function TimeSlotPicker({ selectedDate, selectedSlot, onSelect, blackoutDates, bookedSlots }) {
  const listRef = useRef(null);

  useGSAP(() => {
    const btns = listRef.current?.querySelectorAll('button:not(:disabled)');
    if (btns) {
      gsap.fromTo(btns, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.3, stagger: 0.05, ease: 'power2.out' });
    }
  }, { dependencies: [selectedDate] });

  const isSlotBlocked = useCallback((slot) => {
    return (
      blackoutDates.some((b) => b.date === selectedDate && (b.time === null || b.time === undefined || b.time === slot)) ||
      bookedSlots.includes(slot)
    );
  }, [blackoutDates, bookedSlots, selectedDate]);

  const formattedDate = selectedDate
    ? new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
    : '';

  return (
    <div>
      <p className="text-sm mb-5" style={{ color: 'rgba(255,255,255,0.6)' }}>
        Available times for <span style={{ color: GOLD, fontWeight: 600 }}>{formattedDate}</span>
      </p>
      <div
        ref={listRef}
        className="grid grid-cols-2 gap-2"
        role="group"
        aria-label="Available time slots"
      >
        {TIME_SLOTS.map((slot) => {
          const blocked = isSlotBlocked(slot);
          const active = selectedSlot === slot;
          return (
            <button
              key={slot}
              onClick={() => !blocked && onSelect(slot)}
              disabled={blocked}
              aria-pressed={active}
              aria-label={`${slot}${blocked ? ' — unavailable' : ''}`}
              className="py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-200 border focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#22c8e5] focus-visible:outline-offset-2"
              style={{
                background: active ? GOLD : blocked ? 'rgba(255,255,255,0.03)' : 'rgba(34,200,229,0.06)',
                color: active ? NAVY : blocked ? 'rgba(255,255,255,0.2)' : BEIGE,
                borderColor: active ? GOLD : blocked ? 'rgba(255,255,255,0.06)' : 'rgba(34,200,229,0.2)',
                cursor: blocked ? 'not-allowed' : 'pointer',
                textDecoration: blocked ? 'line-through' : 'none',
              }}
            >
              {slot}
            </button>
          );
        })}
      </div>
      <p className="text-xs mt-4" style={{ color: 'rgba(255,255,255,0.35)' }}>
        All times shown in Central Standard Time (CST).
      </p>
    </div>
  );
}

// ─── Step 3: Confirmation Form ────────────────────────────────────────────────

function ConfirmForm({ selectedDate, selectedSlot, onBack, onSuccess }) {
  const [form, setForm] = useState({ name: '', email: '', service: '', notes: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const formRef = useRef(null);

  useGSAP(() => {
    gsap.fromTo(formRef.current, { opacity: 0, x: 20 }, { opacity: 1, x: 0, duration: 0.4, ease: 'power2.out' });
  }, []);

  const formattedDate = selectedDate
    ? new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
    : '';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.service) {
      setError('Please fill in all required fields.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${API_BASE}/scheduler/book`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientName: form.name.trim(),
          clientEmail: form.email.trim(),
          service: form.service,
          date: selectedDate,
          time: selectedSlot,
          type: 'discovery',
          notes: form.notes.trim() || '',
        }),
      });

      const data = await res.json();
      
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Booking failed');
      }

      onSuccess({ ...form, date: selectedDate, slot: selectedSlot });
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = 'w-full px-4 py-3 rounded-xl text-sm outline-none transition-all duration-200 border focus-visible:ring-2 focus-visible:ring-[#22c8e5] focus-visible:ring-offset-1 focus-visible:ring-offset-transparent placeholder:text-[rgba(255,255,255,0.25)]';
  const inputStyle = { background: 'rgba(10,22,40,0.8)', color: BEIGE, borderColor: 'rgba(34,200,229,0.2)' };

  return (
    <form ref={formRef} onSubmit={handleSubmit} noValidate>
      {/* Summary card */}
      <div className="rounded-xl p-4 mb-6 border" style={{ background: 'rgba(34,200,229,0.07)', borderColor: 'rgba(34,200,229,0.25)' }}>
        <div className="flex items-start gap-3">
          <Calendar size={16} style={{ color: GOLD, marginTop: 2, flexShrink: 0 }} aria-hidden="true" />
          <div>
            <p className="text-xs font-bold tracking-widest uppercase mb-1" style={{ color: GOLD }}>Your Appointment</p>
            <p className="text-sm font-semibold" style={{ color: BEIGE }}>{formattedDate}</p>
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>{selectedSlot} CST · 30 minutes</p>
          </div>
        </div>
      </div>

      {/* Fields */}
      <div className="space-y-4">
        <div>
          <label htmlFor="sch-name" className="block text-xs font-bold tracking-widest uppercase mb-1.5" style={{ color: GOLD }}>
            Full Name <span aria-hidden="true">*</span>
          </label>
          <input
            id="sch-name"
            name="name"
            type="text"
            value={form.name}
            onChange={handleChange}
            required
            autoComplete="name"
            className={inputClass}
            style={inputStyle}
            placeholder="Your full name"
          />
        </div>

        <div>
          <label htmlFor="sch-email" className="block text-xs font-bold tracking-widest uppercase mb-1.5" style={{ color: GOLD }}>
            Email Address <span aria-hidden="true">*</span>
          </label>
          <input
            id="sch-email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            required
            autoComplete="email"
            className={inputClass}
            style={inputStyle}
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label htmlFor="sch-service" className="block text-xs font-bold tracking-widest uppercase mb-1.5" style={{ color: GOLD }}>
            Service of Interest <span aria-hidden="true">*</span>
          </label>
          <select
            id="sch-service"
            name="service"
            value={form.service}
            onChange={handleChange}
            required
            className={inputClass}
            style={{ ...inputStyle, appearance: 'none' }}
          >
            <option value="">Select a service</option>
            {SERVICES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <div>
          <label htmlFor="sch-notes" className="block text-xs font-bold tracking-widest uppercase mb-1.5" style={{ color: 'rgba(34,200,229,0.7)' }}>
            Notes <span style={{ color: 'rgba(255,255,255,0.3)', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional)</span>
          </label>
          <textarea
            id="sch-notes"
            name="notes"
            value={form.notes}
            onChange={handleChange}
            rows={3}
            className={inputClass}
            style={inputStyle}
            placeholder="Anything you'd like us to know before the call..."
          />
        </div>
      </div>

      {error && (
        <div className="mt-4 flex items-start gap-2 p-3 rounded-xl" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }} role="alert">
          <AlertCircle size={15} className="text-red-400 mt-0.5 flex-shrink-0" aria-hidden="true" />
          <p className="text-red-300 text-sm">{error}</p>
        </div>
      )}

      <div className="flex gap-3 mt-6">
        <button
          type="button"
          onClick={onBack}
          disabled={loading}
          className="flex-1 py-3 rounded-xl text-sm font-bold uppercase tracking-widest border transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#22c8e5]"
          style={{ borderColor: 'rgba(34,200,229,0.3)', color: 'rgba(255,255,255,0.6)', background: 'transparent' }}
        >
          Back
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-[2] py-3 rounded-xl text-sm font-bold uppercase tracking-widest transition-all duration-200 flex items-center justify-center gap-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#22c8e5]"
          style={{ background: loading ? 'rgba(34,200,229,0.5)' : GOLD, color: NAVY }}
        >
          {loading ? (
            <>
              <Loader2 size={15} className="animate-spin" aria-hidden="true" />
              <span>Booking...</span>
            </>
          ) : (
            'Confirm Booking'
          )}
        </button>
      </div>
    </form>
  );
}

// ─── Success State ────────────────────────────────────────────────────────────

function SuccessView({ booking, onReset }) {
  const ref = useRef(null);

  useGSAP(() => {
    gsap.fromTo(ref.current, { opacity: 0, scale: 0.95 }, { opacity: 1, scale: 1, duration: 0.5, ease: 'back.out(1.2)' });
  }, []);

  const formattedDate = booking.date
    ? new Date(booking.date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
    : '';

  return (
    <div ref={ref} className="text-center py-4">
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5"
        style={{ background: 'rgba(34,200,229,0.12)', border: `2px solid ${GOLD}` }}
        aria-hidden="true"
      >
        <CheckCircle2 size={28} style={{ color: GOLD }} />
      </div>
      <h3 className="text-xl font-bold mb-2" style={{ color: BEIGE }}>Consultation Confirmed!</h3>
      <p className="text-sm mb-6" style={{ color: 'rgba(255,255,255,0.6)' }}>
        A confirmation has been sent to <strong style={{ color: GOLD }}>{booking.email}</strong>
      </p>
      <div className="rounded-xl p-5 mb-6 text-left border" style={{ background: 'rgba(34,200,229,0.07)', borderColor: 'rgba(34,200,229,0.2)' }}>
        <div className="flex items-center gap-2 mb-3">
          <Calendar size={14} style={{ color: GOLD }} aria-hidden="true" />
          <span className="text-xs font-bold tracking-widest uppercase" style={{ color: GOLD }}>Details</span>
        </div>
        <p className="text-sm font-semibold mb-1" style={{ color: BEIGE }}>{formattedDate}</p>
        <p className="text-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>{booking.slot} CST · {booking.service}</p>
      </div>
      <button
        onClick={onReset}
        className="text-xs font-bold uppercase tracking-widest transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#22c8e5] rounded"
        style={{ color: 'rgba(34,200,229,0.6)' }}
      >
        Book another session
      </button>
    </div>
  );
}

// ─── Main Widget ──────────────────────────────────────────────────────────────

export default function SchedulerWidget() {
  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [blackoutDates, setBlackoutDates] = useState([]);
  const [bookedSlots, setBookedSlots] = useState([]);
  const [booking, setBooking] = useState(null);
  const panelRef = useRef(null);

  // Fetch blackout dates
  useEffect(() => {
    fetch(`${API_BASE}/scheduler/blackout-dates`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setBlackoutDates(data);
      })
      .catch((err) => console.error('Failed to load blackout dates', err));
  }, []);

  // Fetch booked slots whenever selected date changes
  useEffect(() => {
    if (!selectedDate) return;
    fetch(`${API_BASE}/scheduler/booked-slots?date=${selectedDate}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setBookedSlots(data);
      })
      .catch((err) => console.error('Failed to load booked slots', err));
  }, [selectedDate]);

  // Animate panel transition between steps
  const animateStep = useCallback((dir = 1) => {
    gsap.fromTo(
      panelRef.current,
      { opacity: 0, x: dir * 20 },
      { opacity: 1, x: 0, duration: 0.35, ease: 'power2.out' }
    );
  }, []);

  const goToStep2 = () => { setSelectedSlot(''); setStep(2); animateStep(1); };
  const goToStep3 = () => { setStep(3); animateStep(1); };
  const goBack = () => { setStep((s) => s - 1); animateStep(-1); };

  const handleSuccess = (completedBooking) => {
    setBooking(completedBooking);
    setStep(4);
    animateStep(1);
  };

  const handleReset = () => {
    setStep(1);
    setSelectedDate('');
    setSelectedSlot('');
    setBooking(null);
    animateStep(-1);
  };

  return (
    <div
      className="rounded-2xl p-7 border"
      style={{ background: 'rgba(10,22,40,0.9)', borderColor: 'rgba(34,200,229,0.15)', backdropFilter: 'blur(12px)' }}
      aria-label="Appointment scheduler"
    >
      <div className="flex items-center gap-3 mb-7">
        <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'rgba(34,200,229,0.12)' }}>
          <Calendar size={15} style={{ color: GOLD }} aria-hidden="true" />
        </div>
        <h2 className="text-base font-bold tracking-wide" style={{ color: BEIGE }}>
          Book a Free Consultation
        </h2>
      </div>

      {step < 4 && <StepIndicator step={step} />}

      <div ref={panelRef}>
        {step === 1 && (
          <div>
            <CalendarPicker
              selectedDate={selectedDate}
              onSelect={(d) => { setSelectedDate(d); }}
              blackoutDates={blackoutDates}
            />
            <button
              onClick={goToStep2}
              disabled={!selectedDate}
              className="mt-6 w-full py-3.5 rounded-xl text-sm font-bold uppercase tracking-widest transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#22c8e5]"
              style={{
                background: selectedDate ? GOLD : 'rgba(34,200,229,0.12)',
                color: selectedDate ? NAVY : 'rgba(34,200,229,0.35)',
                cursor: selectedDate ? 'pointer' : 'not-allowed',
              }}
            >
              {selectedDate ? 'Choose a Time →' : 'Select a Date'}
            </button>
          </div>
        )}

        {step === 2 && (
          <div>
            <TimeSlotPicker
              selectedDate={selectedDate}
              selectedSlot={selectedSlot}
              onSelect={setSelectedSlot}
              blackoutDates={blackoutDates}
              bookedSlots={bookedSlots}
            />
            <div className="flex gap-3 mt-6">
              <button
                onClick={goBack}
                className="flex-1 py-3 rounded-xl text-sm font-bold uppercase tracking-widest border transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#22c8e5]"
                style={{ borderColor: 'rgba(34,200,229,0.25)', color: 'rgba(255,255,255,0.5)', background: 'transparent' }}
              >
                Back
              </button>
              <button
                onClick={goToStep3}
                disabled={!selectedSlot}
                className="flex-[2] py-3 rounded-xl text-sm font-bold uppercase tracking-widest transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#22c8e5]"
                style={{
                  background: selectedSlot ? GOLD : 'rgba(34,200,229,0.12)',
                  color: selectedSlot ? NAVY : 'rgba(34,200,229,0.35)',
                  cursor: selectedSlot ? 'pointer' : 'not-allowed',
                }}
              >
                {selectedSlot ? 'Enter Details →' : 'Select a Time'}
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <ConfirmForm
            selectedDate={selectedDate}
            selectedSlot={selectedSlot}
            onBack={goBack}
            onSuccess={handleSuccess}
          />
        )}

        {step === 4 && booking && (
          <SuccessView booking={booking} onReset={handleReset} />
        )}
      </div>

      {/* Office hours note */}
      {step < 4 && (
        <div className="mt-6 pt-5 border-t flex items-center gap-2" style={{ borderColor: 'rgba(34,200,229,0.1)' }}>
          <Clock size={12} style={{ color: 'rgba(255,255,255,0.3)', flexShrink: 0 }} aria-hidden="true" />
          <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.3)' }}>
            Mon–Fri · 10 AM–6 PM CST · 30-min sessions
          </p>
        </div>
      )}
    </div>
  );
}
