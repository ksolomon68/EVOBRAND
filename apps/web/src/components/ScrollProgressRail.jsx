import React, { useEffect, useRef, useState } from 'react';

/**
 * ScrollProgressRail — persistent right-edge chapter rail (desktop only).
 * Echoes the hero's 01/02/03/04 chapter numbering across the whole page.
 *
 * Dots are evenly spaced along the track; the fill is piecewise-mapped from
 * real scroll offsets to dot positions, so the fill reaches a dot exactly
 * when the visitor arrives at that section (the hero's 500vh doesn't crowd
 * the remaining stops into the bottom of the track). Stops are native
 * anchors: keyboard accessible, and in-page smooth scrolling defers to the
 * CSS `scroll-behavior` rules in index.css (which already respect
 * prefers-reduced-motion).
 */

const STOPS = [
  { id: 'story',        num: '01', label: 'Story' },
  { id: 'services',     num: '02', label: 'Services' },
  { id: 'capabilities', num: '03', label: 'Capabilities' },
  { id: 'work',         num: '04', label: 'Work' },
  { id: 'booking',      num: '05', label: 'Connect' },
];

const TRACK_HEIGHT = 220; // px

export default function ScrollProgressRail() {
  const [progress, setProgress] = useState(0);
  const [positions, setPositions] = useState(
    STOPS.map((_, i) => i / (STOPS.length - 1))
  );
  const ticking = useRef(false);

  useEffect(() => {
    function measure() {
      const scrollable =
        document.documentElement.scrollHeight - window.innerHeight;
      if (scrollable <= 0) return;
      const next = STOPS.map((stop) => {
        const el = document.getElementById(stop.id);
        if (!el) return null;
        // Subtract the fixed-header scroll offset (html { scroll-padding-top })
        // so a dot lights exactly where its anchor lands.
        const top = el.getBoundingClientRect().top + window.scrollY - 80;
        return Math.min(Math.max(top / scrollable, 0), 1);
      });
      if (next.every((v) => v !== null)) setPositions(next);
    }

    function onScroll() {
      if (ticking.current) return;
      ticking.current = true;
      requestAnimationFrame(() => {
        const scrollable =
          document.documentElement.scrollHeight - window.innerHeight;
        setProgress(
          scrollable > 0
            ? Math.min(Math.max(window.scrollY / scrollable, 0), 1)
            : 0
        );
        ticking.current = false;
      });
    }

    measure();
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', measure);
    // Section offsets shift as images/lazy content load — track doc height.
    const ro = new ResizeObserver(measure);
    ro.observe(document.body);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', measure);
      ro.disconnect();
    };
  }, []);

  // Even visual spacing for dots; piecewise-map real scroll progress onto it.
  const dotPos = STOPS.map((_, i) => i / (STOPS.length - 1)); // 0 .. 1
  let fill = 0;
  if (progress <= positions[0]) {
    fill = 0;
  } else if (progress >= positions[positions.length - 1]) {
    const p0 = positions[positions.length - 1];
    const span = 1 - p0;
    fill =
      dotPos[dotPos.length - 1] +
      (span > 0 ? ((progress - p0) / span) * (1 - dotPos[dotPos.length - 1]) : 0);
  } else {
    for (let i = 0; i < positions.length - 1; i++) {
      if (progress >= positions[i] && progress < positions[i + 1]) {
        const span = positions[i + 1] - positions[i];
        const t = span > 0 ? (progress - positions[i]) / span : 0;
        fill = dotPos[i] + t * (dotPos[i + 1] - dotPos[i]);
        break;
      }
    }
  }

  let activeIndex = 0;
  positions.forEach((p, i) => {
    if (p <= progress + 0.002) activeIndex = i;
  });

  return (
    <nav
      aria-label="Page chapters"
      className="hidden lg:block fixed right-7 top-1/2 -translate-y-1/2 z-40"
    >
      <div className="relative" style={{ height: TRACK_HEIGHT, width: 2 }}>
        {/* Track */}
        <div className="absolute inset-0 rounded-full bg-white/10" aria-hidden="true" />
        {/* Progress fill */}
        <div
          className="absolute left-0 top-0 w-full rounded-full bg-[#22c8e5]"
          style={{
            height: `${fill * 100}%`,
            boxShadow: '0 0 8px rgba(34,200,229,0.55)',
          }}
          aria-hidden="true"
        />

        {/* Chapter stops */}
        {STOPS.map((stop, i) => {
          const isActive = i === activeIndex;
          const isPassed = i < activeIndex;
          return (
            <a
              key={stop.id}
              href={`#${stop.id}`}
              aria-label={`${stop.num} — ${stop.label}`}
              aria-current={isActive ? 'true' : undefined}
              className="group absolute left-1/2 flex h-[22px] w-[22px] items-center justify-center rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#22c8e5]"
              style={{
                top: `${dotPos[i] * 100}%`,
                transform: 'translate(-50%, -50%)',
              }}
            >
              {/* Dot */}
              <span
                aria-hidden="true"
                className={`block rounded-full transition-all duration-200 ${
                  isActive
                    ? 'h-2.5 w-2.5 bg-[#22c8e5] shadow-[0_0_10px_rgba(34,200,229,0.7)]'
                    : isPassed
                    ? 'h-1.5 w-1.5 bg-white/40'
                    : 'h-1.5 w-1.5 border border-white/30 bg-transparent'
                }`}
              />
              {/* Persistent chapter number for the active stop */}
              {isActive && (
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute right-full mr-3 text-[10px] font-bold tracking-[0.25em] text-[#22c8e5] transition-opacity duration-200 group-hover:opacity-0 group-focus-visible:opacity-0"
                >
                  {stop.num}
                </span>
              )}
              {/* Full label on hover / keyboard focus */}
              <span className="pointer-events-none absolute right-full mr-3 whitespace-nowrap rounded-md border border-white/10 bg-[#1a2332] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/80 opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100">
                {stop.num} — {stop.label}
              </span>
            </a>
          );
        })}
      </div>
    </nav>
  );
}
