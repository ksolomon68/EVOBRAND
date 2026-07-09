import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';

/**
 * PageMotion — shared motion language for interior pages.
 *
 * Extends the homepage hero's kinetic identity (clip-path word reveals,
 * chapter numbering, cyan accents) across the site with a consistent,
 * restrained vocabulary.
 *
 * Accessibility: every effect here is gated on prefers-reduced-motion at
 * the JS level. The global CSS kill-switch in index.css only stops CSS
 * animations/transitions — GSAP and Framer Motion write inline styles via
 * rAF, so they must check the media query themselves. Reduced motion means:
 * content renders in its final, fully-visible state.
 */

export function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = (e) => setReduced(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  return reduced;
}

/**
 * KineticHeadline — the homepage hero's clip-path word reveal, reusable.
 * `lines`: array of lines; each line is an array of { t: 'word', accent?: bool }.
 * `replayKey`: change to re-run the reveal (e.g. service tab switches).
 */
export function KineticHeadline({
  lines,
  className = '',
  as: Tag = 'h1',
  delay = 0.25,
  replayKey,
}) {
  const ref = useRef(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const words = el.querySelectorAll('.kin-word');
    if (!words.length) return;
    if (reduced) {
      gsap.set(words, { clipPath: 'inset(0 0% 0 0)' });
      return;
    }
    gsap.set(words, { clipPath: 'inset(0 100% 0 0)' });
    const tween = gsap.to(words, {
      clipPath: 'inset(0 0% 0 0)',
      duration: 0.65,
      ease: 'power3.out',
      stagger: 0.09,
      delay,
    });
    return () => tween.kill();
  }, [reduced, delay, replayKey]);

  return (
    <Tag ref={ref} className={className}>
      {lines.map((line, li) => (
        <span key={li} className="block">
          {line.map((w, wi) => (
            <span
              key={wi}
              className="mr-[0.24em] inline-block overflow-hidden align-baseline"
            >
              <span
                className={`kin-word inline-block ${w.accent ? 'text-[#22c8e5]' : ''}`}
                style={{ clipPath: 'inset(0 100% 0 0)' }}
              >
                {w.t}
              </span>
            </span>
          ))}
        </span>
      ))}
    </Tag>
  );
}

/**
 * PageHero — cinematic interior-page hero: radial glow + faint grid backdrop,
 * chapter-style eyebrow, kinetic headline, fading subtitle.
 */
export function PageHero({ eyebrow, lines, sub, children, replayKey }) {
  return (
    <section className="relative overflow-hidden bg-[#0f1419] pt-16 pb-16 md:pt-24 md:pb-24">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div
          className="absolute -top-32 left-1/2 h-[520px] w-[900px] max-w-none -translate-x-1/2"
          style={{
            background:
              'radial-gradient(ellipse, rgba(34,200,229,0.10) 0%, transparent 65%)',
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)',
            backgroundSize: '56px 56px',
            maskImage:
              'radial-gradient(ellipse 80% 65% at 50% 35%, black, transparent)',
            WebkitMaskImage:
              'radial-gradient(ellipse 80% 65% at 50% 35%, black, transparent)',
          }}
        />
      </div>
      <div className="container relative mx-auto px-4 text-center">
        {eyebrow && (
          <Reveal>
            <p className="mb-6 inline-block rounded-full border border-[#22c8e5]/25 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.25em] text-[#22c8e5]">
              {eyebrow}
            </p>
          </Reveal>
        )}
        <KineticHeadline
          lines={lines}
          replayKey={replayKey}
          className="mb-6 text-4xl font-bold leading-tight text-white md:text-6xl"
        />
        {sub && (
          <Reveal delay={0.45}>
            <p className="mx-auto max-w-3xl text-lg text-[#8892a4] md:text-xl">
              {sub}
            </p>
          </Reveal>
        )}
        {children}
      </div>
    </section>
  );
}

/**
 * Reveal — standardized in-view entrance. Under reduced motion, content is
 * simply visible (no offset, no fade choreography).
 */
export function Reveal({
  children,
  delay = 0,
  y = 24,
  className,
  once = true,
  style,
}) {
  const reduced = usePrefersReducedMotion();
  if (reduced) {
    return (
      <div className={className} style={style}>
        {children}
      </div>
    );
  }
  return (
    <motion.div
      className={className}
      style={style}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, margin: '-60px' }}
      transition={{ duration: 0.6, delay, ease: [0.22, 0.61, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

/**
 * TiltCard — restrained 3D tilt following the cursor. Mouse-only (skips
 * touch/pen), disabled under reduced motion. Max tilt kept low on purpose:
 * enterprise audience, precision over bounce.
 */
export function TiltCard({ children, className = '', max = 4, style }) {
  const ref = useRef(null);
  const reduced = usePrefersReducedMotion();

  function onMove(e) {
    if (reduced || e.pointerType !== 'mouse') return;
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = `perspective(900px) rotateX(${(-py * max).toFixed(
      2
    )}deg) rotateY(${(px * max).toFixed(2)}deg) translateY(-4px)`;
  }

  function onLeave() {
    const el = ref.current;
    if (el) el.style.transform = '';
  }

  return (
    <div
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      className={className}
      style={{ transition: 'transform 0.2s ease-out', willChange: 'transform', ...style }}
    >
      {children}
    </div>
  );
}

/**
 * ScrollDrawnLine — a vertical spine that draws itself as the user scrolls
 * through its container (echoes the homepage progress rail). Position the
 * parent `relative`; this renders an absolutely-positioned track + fill.
 * Under reduced motion the line renders fully drawn.
 */
export function ScrollDrawnLine({ className = '' }) {
  const trackRef = useRef(null);
  const fillRef = useRef(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const track = trackRef.current;
    const fill = fillRef.current;
    if (!track || !fill) return;
    if (reduced) {
      fill.style.height = '100%';
      return;
    }

    let raf = null;
    function update() {
      raf = null;
      const r = track.getBoundingClientRect();
      const vh = window.innerHeight;
      // Draw from when the track's top passes 75% of viewport until its
      // bottom passes 45% — the line stays just ahead of the reader.
      const start = vh * 0.75;
      const end = vh * 0.45;
      const total = r.height + (start - end);
      const progressed = Math.min(Math.max(start - r.top, 0), total);
      fill.style.height = `${(progressed / total) * 100}%`;
    }
    function onScroll() {
      if (raf === null) raf = requestAnimationFrame(update);
    }
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (raf !== null) cancelAnimationFrame(raf);
    };
  }, [reduced]);

  return (
    <div
      ref={trackRef}
      aria-hidden="true"
      className={`absolute w-0.5 rounded-full bg-white/10 ${className}`}
    >
      <div
        ref={fillRef}
        className="w-full rounded-full bg-[#22c8e5]"
        style={{ height: '0%', boxShadow: '0 0 8px rgba(34,200,229,0.5)' }}
      />
    </div>
  );
}
