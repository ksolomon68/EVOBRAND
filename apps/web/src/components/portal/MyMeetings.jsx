import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { Calendar, Clock, Video, CheckCircle2, XCircle, AlertCircle, Loader2, ExternalLink } from 'lucide-react';

const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
  ? 'http://localhost:5000/api' 
  : (window.location.origin + '/api');

const GOLD = '#22c8e5';
const NAVY = '#003258';
const BEIGE = '#ffffff';

const STATUS_CONFIG = {
  confirmed: {
    label: 'Confirmed',
    icon: CheckCircle2,
    color: GOLD,
    bg: 'rgba(34,200,229,0.1)',
    border: 'rgba(34,200,229,0.3)',
  },
  completed: {
    label: 'Completed',
    icon: CheckCircle2,
    color: '#34d399',
    bg: 'rgba(52,211,153,0.08)',
    border: 'rgba(52,211,153,0.25)',
  },
  cancelled: {
    label: 'Cancelled',
    icon: XCircle,
    color: '#f87171',
    bg: 'rgba(248,113,113,0.08)',
    border: 'rgba(248,113,113,0.25)',
  },
  no_show: {
    label: 'No Show',
    icon: AlertCircle,
    color: '#94a3b8',
    bg: 'rgba(148,163,184,0.08)',
    border: 'rgba(148,163,184,0.2)',
  },
};

function formatBookingDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr + 'T12:00:00').toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

function isUpcoming(booking) {
  if (booking.status !== 'scheduled' && booking.status !== 'confirmed') return false;
  const bookingDate = new Date(`${booking.date}T23:59:59`);
  return bookingDate >= new Date();
}

function MeetingCard({ booking, index }) {
  const ref = useRef(null);
  const cfg = STATUS_CONFIG[booking.status] ?? STATUS_CONFIG.confirmed;
  const StatusIcon = cfg.icon;
  const upcoming = isUpcoming(booking);

  useGSAP(() => {
    gsap.fromTo(
      ref.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.45, delay: index * 0.07, ease: 'power2.out' }
    );
  }, []);

  const handleHover = useCallback((entering) => {
    gsap.to(ref.current, {
      y: entering ? -4 : 0,
      duration: 0.3,
      ease: 'power2.out',
    });
  }, []);

  return (
    <article
      ref={ref}
      className="rounded-2xl border p-6 transition-all duration-300"
      style={{
        background: upcoming ? 'rgba(34,200,229,0.04)' : 'rgba(10,22,40,0.5)',
        borderColor: upcoming ? 'rgba(34,200,229,0.2)' : 'rgba(255,255,255,0.06)',
      }}
      onMouseEnter={() => handleHover(true)}
      onMouseLeave={() => handleHover(false)}
      aria-label={`${booking.type || 'Consultation'} session on ${formatBookingDate(booking.date)}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
        <div>
          <h3 className="font-bold text-base mb-1" style={{ color: BEIGE }}>
            {booking.type || 'Consultation'}
            {(booking.client_name || booking.client_email) && (
              <span className="opacity-70 font-normal text-sm block md:inline md:ml-2">
                with {booking.client_name || booking.client_email}
              </span>
            )}
          </h3>
          {upcoming && (
            <span
              className="inline-block text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full"
              style={{ background: 'rgba(34,200,229,0.15)', color: GOLD }}
            >
              Upcoming
            </span>
          )}
        </div>

        {/* Status badge */}
        <div
          className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border"
          style={{ background: cfg.bg, borderColor: cfg.border, color: cfg.color }}
          aria-label={`Status: ${cfg.label}`}
        >
          <StatusIcon size={12} aria-hidden="true" />
          {cfg.label}
        </div>
      </div>

      <div className="flex flex-wrap gap-x-6 gap-y-2 mb-4">
        <div className="flex items-center gap-2">
          <Calendar size={13} style={{ color: GOLD }} aria-hidden="true" />
          <span className="text-sm" style={{ color: 'rgba(255,255,255,0.75)' }}>
            {formatBookingDate(booking.date)}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Clock size={13} style={{ color: GOLD }} aria-hidden="true" />
          <span className="text-sm" style={{ color: 'rgba(255,255,255,0.75)' }}>
            {booking.time} CST · {booking.duration || 30} min
          </span>
        </div>
      </div>

      {booking.notes && (
        <p className="text-xs rounded-lg px-3 py-2 mb-4 italic" style={{ background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.5)' }}>
          "{booking.notes}"
        </p>
      )}

      {/* Meeting link if scheduled and has link */}
      {upcoming && booking.meet_link && (
        <a
          href={booking.meet_link}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-xl transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#22c8e5]"
          style={{ background: 'rgba(34,200,229,0.1)', color: GOLD, border: `1px solid rgba(34,200,229,0.25)` }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(34,200,229,0.18)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(34,200,229,0.1)')}
        >
          <Video size={13} aria-hidden="true" />
          <span>View in Calendar</span>
          <ExternalLink size={11} aria-hidden="true" />
        </a>
      )}
    </article>
  );
}

function EmptyState() {
  const ref = useRef(null);
  useGSAP(() => {
    gsap.fromTo(ref.current, { opacity: 0, scale: 0.97 }, { opacity: 1, scale: 1, duration: 0.5, ease: 'power2.out' });
  }, []);

  return (
    <div ref={ref} className="flex flex-col items-center justify-center py-20 text-center rounded-2xl border" style={{ borderColor: 'rgba(34,200,229,0.1)', background: 'rgba(10,22,40,0.4)' }}>
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center mb-5"
        style={{ background: 'rgba(34,200,229,0.08)', border: `1px solid rgba(34,200,229,0.2)` }}
        aria-hidden="true"
      >
        <Calendar size={24} style={{ color: GOLD }} />
      </div>
      <h3 className="text-lg font-bold mb-2" style={{ color: BEIGE }}>No Sessions Yet</h3>
      <p className="text-sm max-w-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>
        Book a free 30-minute consultation from the Contact page to get started.
      </p>
      <a
        href="/contact"
        className="mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold uppercase tracking-widest transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#22c8e5]"
        style={{ background: GOLD, color: NAVY }}
        onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.85')}
        onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
      >
        Book a Consultation
      </a>
    </div>
  );
}

// ─── Tab filter ───────────────────────────────────────────────────────────────

const TABS = [
  { key: 'upcoming', label: 'Upcoming' },
  { key: 'past', label: 'Past' },
  { key: 'all', label: 'All' },
];

export default function MyMeetings({ userId }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('upcoming');
  const headerRef = useRef(null);

  useGSAP(() => {
    gsap.fromTo(
      headerRef.current,
      { opacity: 0, y: 16 },
      { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }
    );
  }, []);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    const token = localStorage.getItem('evobrand_token');
    fetch(`${API_BASE}/scheduler/meetings/${userId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setBookings(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load meetings', err);
        setLoading(false);
      });
  }, [userId]);

  const filtered = bookings.filter((b) => {
    if (tab === 'all') return true;
    if (tab === 'upcoming') return isUpcoming(b);
    return !isUpcoming(b);
  });

  const upcomingCount = bookings.filter(isUpcoming).length;

  return (
    <div>
      <div ref={headerRef} className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-1">My Meetings</h1>
        <p style={{ color: 'rgba(255,255,255,0.45)' }}>
          {upcomingCount > 0
            ? `You have ${upcomingCount} upcoming session${upcomingCount > 1 ? 's' : ''}.`
            : 'Your scheduled consultation sessions.'}
        </p>
      </div>

      {/* Tab strip */}
      <div
        className="flex gap-1 p-1 rounded-xl mb-8 w-fit"
        style={{ background: 'rgba(10,22,40,0.6)' }}
        role="tablist"
        aria-label="Filter meetings"
      >
        {TABS.map(({ key, label }) => {
          const active = tab === key;
          return (
            <button
              key={key}
              role="tab"
              aria-selected={active}
              onClick={() => setTab(key)}
              className="px-5 py-2 rounded-lg text-sm font-bold transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#22c8e5]"
              style={{
                background: active ? GOLD : 'transparent',
                color: active ? NAVY : 'rgba(255,255,255,0.45)',
              }}
            >
              {label}
              {key === 'upcoming' && upcomingCount > 0 && (
                <span
                  className="ml-2 px-1.5 py-0.5 rounded-full text-[10px] font-bold"
                  style={{ background: active ? 'rgba(10,22,40,0.2)' : 'rgba(34,200,229,0.15)', color: active ? NAVY : GOLD }}
                  aria-label={`${upcomingCount} upcoming`}
                >
                  {upcomingCount}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="flex flex-col items-center py-20">
          <Loader2 size={32} className="animate-spin mb-3" style={{ color: GOLD }} aria-hidden="true" />
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>Loading sessions...</p>
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-4" role="list" aria-label={`${tab} meetings`}>
          {filtered.map((booking, i) => (
            <div key={booking.id} role="listitem">
              <MeetingCard booking={booking} index={i} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
