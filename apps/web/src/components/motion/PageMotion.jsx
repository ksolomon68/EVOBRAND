import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

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
 * `direction`: 'ltr' (default) or 'rtl' — rtl reveals right-to-left and
 *   staggers from the last word, for bookend moments mirroring the hero.
 * `startOnView`: defer the reveal until the headline scrolls into view
 *   (use for below-the-fold headlines).
 */
export function KineticHeadline({
  lines,
  className = '',
  as: Tag = 'h1',
  delay = 0.25,
  replayKey,
  direction = 'ltr',
  startOnView = false,
}) {
  const ref = useRef(null);
  const reduced = usePrefersReducedMotion();
  const hiddenClip =
    direction === 'rtl' ? 'inset(0 0 0 100%)' : 'inset(0 100% 0 0)';

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const words = el.querySelectorAll('.kin-word');
    if (!words.length) return;
    if (reduced) {
      gsap.set(words, { clipPath: 'inset(0 0% 0 0%)' });
      return;
    }
    gsap.set(words, { clipPath: hiddenClip });
    const play = () =>
      gsap.to(words, {
        clipPath: 'inset(0 0% 0 0%)',
        duration: 0.65,
        ease: 'power3.out',
        stagger: { each: 0.09, from: direction === 'rtl' ? 'end' : 'start' },
        delay,
      });

    if (!startOnView) {
      const tween = play();
      return () => tween.kill();
    }
    let tween = null;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          tween = play();
          io.disconnect();
        }
      },
      { threshold: 0.35 }
    );
    io.observe(el);
    return () => {
      io.disconnect();
      if (tween) tween.kill();
    };
  }, [reduced, delay, replayKey, direction, startOnView, hiddenClip]);

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
                style={{ clipPath: hiddenClip }}
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
 * SectionMorphDivider — a gentle SVG curve between sections whose shape
 * shifts subtly as it crosses the viewport (scroll-scrubbed), replacing a
 * hard horizontal cut. `from` = background color of the section above,
 * `to` = background color of the section below. Static under reduced motion.
 */
const MORPH_D1 =
  'M0,32 C240,56 480,8 720,28 C960,48 1200,16 1440,36 L1440,64 L0,64 Z';
const MORPH_D2 =
  'M0,26 C240,6 480,50 720,34 C960,14 1200,46 1440,22 L1440,64 L0,64 Z';

export function SectionMorphDivider({ from, to }) {
  const ref = useRef(null);
  const pathRef = useRef(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    if (reduced || !pathRef.current) return;
    const tween = gsap.to(pathRef.current, {
      attr: { d: MORPH_D2 },
      ease: 'none',
      scrollTrigger: {
        trigger: ref.current,
        start: 'top bottom',
        end: 'bottom top',
        scrub: 1,
      },
    });
    return () => {
      if (tween.scrollTrigger) tween.scrollTrigger.kill();
      tween.kill();
    };
  }, [reduced]);

  return (
    <div ref={ref} aria-hidden="true" style={{ background: from, lineHeight: 0 }}>
      <svg
        viewBox="0 0 1440 64"
        preserveAspectRatio="none"
        className="block h-10 w-full md:h-14"
      >
        <path ref={pathRef} d={MORPH_D1} fill={to} />
      </svg>
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
