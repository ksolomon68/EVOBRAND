import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:5000/api'
  : (window.location.origin + '/api');

const availableServices = [
  { id: 'ai-app', label: 'Custom AI App', icon: '⚡' },
  { id: 'visual', label: 'AI Visual Content', icon: '🎨' },
  { id: 'docs', label: 'Intelligent Docs', icon: '📄' },
  { id: 'video', label: 'AI Video Production', icon: '🎥' },
  { id: 'web', label: 'Web Development', icon: '💻' },
  { id: 'wcag', label: 'WCAG Accessibility', icon: '🛡️' },
];

const timeSlots = [
  '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM',
  '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM',
];

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function toISO(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

const BookingSection = () => {
  const today = new Date();
  const [viewMonth, setViewMonth] = useState({ year: today.getFullYear(), month: today.getMonth() });
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedService, setSelectedService] = useState('ai-app');

  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', notes: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const todayStr = toISO(today.getFullYear(), today.getMonth(), today.getDate());

  const daysInMonth = new Date(viewMonth.year, viewMonth.month + 1, 0).getDate();
  const firstDow = new Date(viewMonth.year, viewMonth.month, 1).getDay();

  const prevMonth = () => setViewMonth(v =>
    v.month === 0 ? { year: v.year - 1, month: 11 } : { ...v, month: v.month - 1 }
  );
  const nextMonth = () => setViewMonth(v =>
    v.month === 11 ? { year: v.year + 1, month: 0 } : { ...v, month: v.month + 1 }
  );

  const selectedDateStr = selectedDay
    ? toISO(viewMonth.year, viewMonth.month, selectedDay)
    : null;

  const handleChange = (e) => {
    setForm(p => ({ ...p, [e.target.name]: e.target.value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedDateStr) { setError('Please select a date.'); return; }
    if (!selectedTime) { setError('Please select a time slot.'); return; }
    if (!form.firstName.trim() || !form.email.trim()) {
      setError('First name and email are required.');
      return;
    }

    setLoading(true);
    setError('');

    // Check if user is already logged in
    const token = localStorage.getItem('evobrand_token');
    let userId = null;
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        userId = payload.id || null;
      } catch (_) {}
    }

    try {
      const res = await fetch(`${API_BASE}/scheduler/book`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientName: `${form.firstName.trim()} ${form.lastName.trim()}`.trim(),
          clientEmail: form.email.trim(),
          service: availableServices.find(s => s.id === selectedService)?.label || selectedService,
          date: selectedDateStr,
          time: selectedTime,
          type: 'strategy',
          notes: form.notes.trim() || '',
          ...(userId ? { user_id: userId } : {}),
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || 'Booking failed');

      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSuccess(false);
    setSelectedDay(null);
    setSelectedTime('');
    setForm({ firstName: '', lastName: '', email: '', notes: '' });
    setError('');
  };

  if (success) {
    return (
      <section id="booking" className="py-20 bg-[#0d0d18]">
        <div className="container mx-auto px-4 lg:max-w-[1200px]">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-xl mx-auto text-center py-20"
          >
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
              style={{ background: 'rgba(34,200,229,0.12)', border: '2px solid #22c8e5' }}
            >
              <CheckCircle2 size={36} style={{ color: '#22c8e5' }} aria-hidden="true" />
            </div>
            <h3 className="text-3xl font-bold text-white mb-3">Strategy Call Booked!</h3>
            <p className="text-[#8892a4] mb-2">
              A confirmation has been sent to <strong className="text-[#22c8e5]">{form.email}</strong>.
            </p>
            <p className="text-[#8892a4] mb-8 text-sm">
              <strong className="text-white">{selectedDateStr}</strong> at <strong className="text-white">{selectedTime}</strong>
            </p>
            <button
              onClick={handleReset}
              className="text-sm font-bold text-[#22c8e5] hover:opacity-75 transition-opacity"
            >
              Book another session <span aria-hidden="true">→</span>
            </button>
          </motion.div>
        </div>
      </section>
    );
  }

  return (
    <section id="booking" className="py-20 bg-[#0d0d18]">
      <div className="container mx-auto px-4 lg:max-w-[1200px]">
        <div className="text-center mb-16">
          <motion.span
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-block text-[#22c8e5] text-xs font-bold tracking-[0.15em] uppercase mb-4"
          >
            Schedule a Meeting
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-5xl font-bold mb-4 text-white"
          >
            Book a Strategy Call
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-[#8892a4] text-lg max-w-[600px] mx-auto leading-relaxed"
          >
            Select a service, choose a date and time, and let's start building your competitive advantage.
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 lg:grid-cols-[1fr_1.5fr] gap-8 bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-[20px] overflow-hidden"
        >
          {/* Calendar */}
          <div className="p-8 lg:border-r border-[rgba(255,255,255,0.08)] border-b lg:border-b-0">
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={prevMonth}
                aria-label="Previous month"
                className="w-8 h-8 rounded-md border border-[rgba(255,255,255,0.08)] text-white flex items-center justify-center hover:bg-[#22c8e5] hover:border-[#22c8e5] hover:text-[#003258] transition-all"
              >
                <span aria-hidden="true">&#8249;</span>
              </button>
              <h3 className="text-white font-bold text-base">
                {MONTHS[viewMonth.month]} {viewMonth.year}
              </h3>
              <button
                onClick={nextMonth}
                aria-label="Next month"
                className="w-8 h-8 rounded-md border border-[rgba(255,255,255,0.08)] text-white flex items-center justify-center hover:bg-[#22c8e5] hover:border-[#22c8e5] hover:text-[#003258] transition-all"
              >
                <span aria-hidden="true">&#8250;</span>
              </button>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-4">
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                <div key={d} className="text-center text-[0.7rem] text-[#8892a4] font-semibold p-1 uppercase" aria-hidden="true">{d}</div>
              ))}
              {Array.from({ length: firstDow }).map((_, i) => (
                <div key={`e${i}`} />
              ))}
              {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
                const dateStr = toISO(viewMonth.year, viewMonth.month, day);
                const disabled = dateStr < todayStr;
                const selected = selectedDay === day;
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => setSelectedDay(day)}
                    disabled={disabled}
                    aria-label={`${MONTHS[viewMonth.month]} ${day}, ${viewMonth.year}${disabled ? ' (unavailable)' : ''}`}
                    aria-pressed={selected}
                    className={`text-center p-2 text-[0.85rem] rounded-md border border-transparent transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#22c8e5] focus-visible:outline-offset-1 ${
                      disabled
                        ? 'text-white/20 cursor-not-allowed'
                        : selected
                          ? 'bg-[#22c8e5] border-[#22c8e5] text-[#003258] font-bold cursor-pointer'
                          : 'hover:bg-[rgba(34,200,229,0.15)] hover:border-[rgba(34,200,229,0.3)] text-white cursor-pointer'
                    }`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>

            <div className="mb-4">
              <p className="text-[0.75rem] font-bold text-[#8892a4] uppercase tracking-[0.06em] mb-3">
                Available Times (CST)
              </p>
              <div className="grid grid-cols-2 gap-2">
                {timeSlots.map(time => (
                  <button
                    key={time}
                    onClick={() => setSelectedTime(time)}
                    className={`p-2 rounded-md text-[0.8rem] text-center transition-all border ${
                      selectedTime === time
                        ? 'bg-[#22c8e5] border-[#22c8e5] text-[#003258] font-bold'
                        : 'bg-[rgba(255,255,255,0.04)] border-[rgba(255,255,255,0.08)] text-[#8892a4] hover:bg-[#22c8e5] hover:border-[#22c8e5] hover:text-[#003258]'
                    }`}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Booking Form */}
          <div className="p-8">
            <div className="flex gap-2 mb-8">
              <div className="flex-1 h-[3px] rounded-sm bg-[#22c8e5]" />
              <div className="flex-1 h-[3px] rounded-sm bg-[rgba(34,200,229,0.5)]" />
              <div className="flex-1 h-[3px] rounded-sm bg-[rgba(255,255,255,0.08)]" />
            </div>

            <form onSubmit={handleSubmit} noValidate>
              {/* Service selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6" role="group" aria-label="Select a service">
                {availableServices.map((service) => (
                  <button
                    key={service.id}
                    type="button"
                    onClick={() => setSelectedService(service.id)}
                    aria-pressed={selectedService === service.id}
                    className={`border rounded-lg p-3 cursor-pointer transition-all flex items-center gap-2 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#22c8e5] focus-visible:outline-offset-1 ${
                      selectedService === service.id
                        ? 'bg-[rgba(34,200,229,0.15)] border-[#22c8e5]'
                        : 'bg-[rgba(255,255,255,0.04)] border-[rgba(255,255,255,0.08)] hover:border-[rgba(34,200,229,0.4)]'
                    }`}
                  >
                    <span className="text-xl" aria-hidden="true">{service.icon}</span>
                    <span className="text-[0.85rem] text-white font-medium">{service.label}</span>
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-[0.8rem] font-semibold text-[#8892a4] mb-2 uppercase tracking-[0.06em]">
                    First Name <span className="text-[#22c8e5]">*</span>
                  </label>
                  <input
                    name="firstName"
                    type="text"
                    value={form.firstName}
                    onChange={handleChange}
                    required
                    className="w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] text-white p-3 rounded-lg text-[0.9rem] focus:outline-none focus:border-[#22c8e5] transition-colors"
                    placeholder="Jane"
                  />
                </div>
                <div>
                  <label className="block text-[0.8rem] font-semibold text-[#8892a4] mb-2 uppercase tracking-[0.06em]">
                    Last Name
                  </label>
                  <input
                    name="lastName"
                    type="text"
                    value={form.lastName}
                    onChange={handleChange}
                    className="w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] text-white p-3 rounded-lg text-[0.9rem] focus:outline-none focus:border-[#22c8e5] transition-colors"
                    placeholder="Doe"
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-[0.8rem] font-semibold text-[#8892a4] mb-2 uppercase tracking-[0.06em]">
                  Work Email <span className="text-[#22c8e5]">*</span>
                </label>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  className="w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] text-white p-3 rounded-lg text-[0.9rem] focus:outline-none focus:border-[#22c8e5] transition-colors"
                  placeholder="jane@company.com"
                />
              </div>

              <div className="mb-5">
                <label className="block text-[0.8rem] font-semibold text-[#8892a4] mb-2 uppercase tracking-[0.06em]">
                  Project Details
                </label>
                <textarea
                  name="notes"
                  value={form.notes}
                  onChange={handleChange}
                  className="w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] text-white p-3 rounded-lg text-[0.9rem] focus:outline-none focus:border-[#22c8e5] transition-colors min-h-[80px]"
                  placeholder="Briefly describe your objectives..."
                />
              </div>

              {error && (
                <div className="mb-4 flex items-center gap-2 p-3 rounded-lg bg-red-900/20 border border-red-500/30">
                  <AlertCircle size={14} className="text-red-400 flex-shrink-0" aria-hidden="true" />
                  <p className="text-red-300 text-sm">{error}</p>
                </div>
              )}

              {(!selectedDateStr || !selectedTime) && (
                <p className="text-[#8892a4] text-xs mb-4">
                  ← Select a date and time on the left to continue.
                </p>
              )}

              <button
                type="submit"
                disabled={loading || !selectedDateStr || !selectedTime}
                className="w-full bg-[#22c8e5] text-[#003258] p-4 rounded-full font-bold hover:shadow-lg hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" aria-hidden="true" />
                    Booking...
                  </>
                ) : (
                  'Confirm Booking'
                )}
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default BookingSection;
