import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * PageMotion: shared motion language for interior pages.
 *
 * Extends the homepage hero's kinetic identity (clip-path word reveals,
 * chapter numbering, cyan accents) across the site with a consistent,
 * restrained vocabulary.
 *
 * Accessibility: every effect here is gated on prefers-reduced-motion at
 * the JS level. The global CSS kill-switch in index.css only stops CSS
 * animations/transitions: GSAP and Framer Motion write inline styles via
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
 * KineticHeadline: the homepage hero's clip-path word reveal, reusable.
 * `lines`: array of lines; each line is an array of { t: 'word', accent?: bool }.
 * `replayKey`: change to re-run the reveal (e.g. service tab switches).
 * `direction`: 'ltr' (default) or 'rtl': rtl reveals right-to-left and
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
  // Vertical insets are negative so descenders (g/y/p/q/j) that extend
  // below the word's border box under tight line-heights never get clipped
  // so the reveal is horizontal only.
  const hiddenClip =
    direction === 'rtl'
      ? 'inset(-20% 0% -20% 100%)'
      : 'inset(-20% 100% -20% 0%)';
  const visibleClip = 'inset(-20% 0% -20% 0%)';

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const words = el.querySelectorAll('.kin-word');
    if (!words.length) return;
    if (reduced) {
      gsap.set(words, { clipPath: visibleClip });
      return;
    }
    gsap.set(words, { clipPath: hiddenClip });
    const play = () =>
      gsap.to(words, {
        clipPath: visibleClip,
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
            <span key={wi} className="mr-[0.24em] inline-block align-baseline">
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
 * PageHero: cinematic interior-page hero: radial glow + faint grid backdrop,
 * chapter-style eyebrow, kinetic headline, fading subtitle.
 */
/**
 * PageHero: cinematic interior-page hero: radial glow + faint grid backdrop,
 * chapter-style eyebrow, kinetic headline, fading subtitle.
 * Supports distinct mode-driven procedural hero backdrops (`variant`).
 */
export function PageHero({ eyebrow, lines, sub, children, replayKey, variant = 'default' }) {
  const glows = {
    default: 'radial-gradient(ellipse 80% 60% at 50% 35%, rgba(34,200,229,0.12) 0%, transparent 70%)',
    about: 'radial-gradient(ellipse 75% 55% at 50% 30%, rgba(34,200,229,0.14) 0%, transparent 65%)',
    services: 'radial-gradient(ellipse 90% 70% at 30% 20%, rgba(34,200,229,0.15) 0%, transparent 65%)',
    work: 'radial-gradient(ellipse 85% 60% at 70% 40%, rgba(34,200,229,0.14) 0%, transparent 70%)',
    process: 'radial-gradient(ellipse 80% 50% at 50% 50%, rgba(34,200,229,0.13) 0%, transparent 65%)',
    resources: 'radial-gradient(ellipse 70% 65% at 50% 25%, rgba(34,200,229,0.15) 0%, transparent 70%)',
    audit: 'radial-gradient(ellipse 65% 65% at 50% 40%, rgba(34,200,229,0.16) 0%, transparent 60%)',
    contact: 'radial-gradient(circle at 50% 45%, rgba(34,200,229,0.18) 0%, transparent 65%)',
  };

  const selectedGlow = glows[variant] || glows.default;

  return (
    <section className="relative overflow-hidden bg-[#0f1419] pt-16 pb-16 md:pt-24 md:pb-24">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div
          className="absolute -top-32 left-1/2 h-[560px] w-[960px] max-w-none -translate-x-1/2 transition-all duration-700"
          style={{ background: selectedGlow }}
        />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)',
            backgroundSize: variant === 'services' ? '44px 44px' : '56px 56px',
            maskImage: 'radial-gradient(ellipse 85% 65% at 50% 35%, black, transparent)',
            WebkitMaskImage: 'radial-gradient(ellipse 85% 65% at 50% 35%, black, transparent)',
          }}
        />
        <TechBackdrop mode={variant} density={variant === 'work' ? 48 : 34} />
      </div>
      <div className="container relative mx-auto px-4 text-center">
        {eyebrow && (
          <Reveal>
            <p className="mb-6 inline-block rounded-full border border-[#22c8e5]/25 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.25em] text-[#22c8e5] shadow-sm shadow-[#22c8e5]/10">
              {eyebrow}
            </p>
          </Reveal>
        )}
        <KineticHeadline
          lines={lines}
          replayKey={replayKey}
          direction={variant === 'work' ? 'rtl' : 'ltr'}
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
 * Reveal: standardized in-view entrance. Under reduced motion, content is
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
 * TiltCard: restrained 3D tilt following the cursor. Mouse-only (skips
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
 * SectionMorphDivider: a gentle SVG curve between sections whose shape
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
 * ScrollDrawnLine: a vertical spine that draws itself as the user scrolls
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

/**
 * TechBackdrop: procedural canvas hero animation with mode-specific visuals:
 * - 'about': Orbital drifting data nodes with connection links.
 * - 'services': Hexagonal module grid with sweeping pulse beams.
 * - 'work': Horizontal stream flow particles representing high velocity.
 * - 'process': Circuit trace pathways with step-pulse highlights.
 * - 'resources': Floating knowledge particle cloud drifting upwards.
 * - 'audit': Laser radar scanner line with target pings.
 * - 'contact': Concentric beacon rings pulsating outwards.
 */
export function TechBackdrop({ density = 38, mode = 'default', className = '' }) {
  const ref = useRef(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const parent = canvas.parentElement;
    let raf = null;
    let disposed = false;
    let visible = true;
    let frameCount = 0;

    function size() {
      canvas.width = parent.offsetWidth;
      canvas.height = parent.offsetHeight;
    }
    size();

    const N = window.innerWidth < 768 ? Math.floor(density / 2) : density;

    // Mode-specific particle state initialization
    const particles = Array.from({ length: N }, () => {
      if (mode === 'work') {
        return {
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: Math.random() * 1.5 + 0.5,
          vy: (Math.random() - 0.5) * 0.1,
          r: Math.random() * 2 + 1,
          alpha: Math.random() * 0.4 + 0.1,
        };
      } else if (mode === 'resources') {
        return {
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.3,
          vy: -(Math.random() * 0.4 + 0.1),
          r: Math.random() * 2.2 + 0.8,
          alpha: Math.random() * 0.35 + 0.15,
        };
      } else {
        return {
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.3,
          vy: (Math.random() - 0.5) * 0.3,
          r: Math.random() * 1.8 + 0.8,
        };
      }
    });

    function draw(move) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      frameCount++;

      if (mode === 'work') {
        // Stream Flow Animation
        particles.forEach((p) => {
          if (move) {
            p.x += p.vx;
            p.y += p.vy;
            if (p.x > canvas.width) p.x = 0;
            if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
          }
          ctx.fillStyle = `rgba(34,200,229,${p.alpha})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fill();

          // Tail stream
          ctx.strokeStyle = `rgba(34,200,229,${p.alpha * 0.4})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x - 18 * p.vx, p.y);
          ctx.stroke();
        });
      } else if (mode === 'resources') {
        // Rising Knowledge Cloud
        particles.forEach((p) => {
          if (move) {
            p.x += p.vx;
            p.y += p.vy;
            if (p.y < 0) {
              p.y = canvas.height;
              p.x = Math.random() * canvas.width;
            }
          }
          ctx.fillStyle = `rgba(34,200,229,${p.alpha})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fill();
        });
      } else if (mode === 'audit') {
        // Laser Scanner Line Sweep
        const scanY = (frameCount * 1.2) % canvas.height;
        ctx.strokeStyle = 'rgba(34,200,229,0.25)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(0, scanY);
        ctx.lineTo(canvas.width, scanY);
        ctx.stroke();

        // Scan Beam Glow
        const grad = ctx.createLinearGradient(0, scanY - 30, 0, scanY);
        grad.addColorStop(0, 'rgba(34,200,229,0)');
        grad.addColorStop(1, 'rgba(34,200,229,0.12)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, scanY - 30, canvas.width, 30);

        particles.forEach((p) => {
          if (move) {
            p.x += p.vx; p.y += p.vy;
            if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
            if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
          }
          const nearScan = Math.abs(p.y - scanY) < 25;
          ctx.fillStyle = nearScan ? 'rgba(34,200,229,0.9)' : 'rgba(34,200,229,0.3)';
          ctx.beginPath();
          ctx.arc(p.x, p.y, nearScan ? p.r * 1.8 : p.r, 0, Math.PI * 2);
          ctx.fill();
        });
      } else if (mode === 'contact') {
        // Radiating Beacon Pulse Rings
        const cx = canvas.width / 2;
        const cy = canvas.height / 2;
        const pulseR = (frameCount * 0.8) % 240;

        [0, 80, 160].forEach((offset) => {
          const r = (pulseR + offset) % 240;
          const alpha = (1 - r / 240) * 0.22;
          ctx.strokeStyle = `rgba(34,200,229,${alpha})`;
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.arc(cx, cy, r, 0, Math.PI * 2);
          ctx.stroke();
        });

        particles.forEach((p) => {
          if (move) {
            p.x += p.vx; p.y += p.vy;
            if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
            if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
          }
          ctx.fillStyle = 'rgba(34,200,229,0.35)';
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fill();
        });
      } else if (mode === 'services' || mode === 'process') {
        // Hexagonal Grid & Circuit Traces
        const stepY = (frameCount * 0.9) % canvas.height;
        ctx.strokeStyle = 'rgba(34,200,229,0.08)';
        ctx.lineWidth = 0.8;

        for (let x = 30; x < canvas.width; x += 60) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, canvas.height);
          ctx.stroke();
        }

        particles.forEach((p) => {
          if (move) {
            p.x += p.vx; p.y += p.vy;
            if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
            if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
          }
          const isHighlighted = Math.abs(p.y - stepY) < 35;
          ctx.fillStyle = isHighlighted ? 'rgba(34,200,229,0.85)' : 'rgba(34,200,229,0.3)';
          ctx.beginPath();
          ctx.arc(p.x, p.y, isHighlighted ? p.r * 1.6 : p.r, 0, Math.PI * 2);
          ctx.fill();
        });
      } else {
        // Default / About Constellation Node Network
        for (let i = 0; i < particles.length; i++) {
          const a = particles[i];
          if (move) {
            a.x += a.vx; a.y += a.vy;
            if (a.x < 0 || a.x > canvas.width) a.vx *= -1;
            if (a.y < 0 || a.y > canvas.height) a.vy *= -1;
          }
          for (let j = i + 1; j < particles.length; j++) {
            const b = particles[j];
            const d = Math.hypot(a.x - b.x, a.y - b.y);
            if (d < 130) {
              ctx.strokeStyle = `rgba(34,200,229,${(0.1 * (1 - d / 130)).toFixed(3)})`;
              ctx.lineWidth = 0.7;
              ctx.beginPath();
              ctx.moveTo(a.x, a.y);
              ctx.lineTo(b.x, b.y);
              ctx.stroke();
            }
          }
          ctx.fillStyle = 'rgba(34,200,229,0.35)';
          ctx.beginPath();
          ctx.arc(a.x, a.y, a.r, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    if (reduced) {
      draw(false);
      return;
    }

    function loop() {
      if (disposed) return;
      if (visible) draw(true);
      raf = requestAnimationFrame(loop);
    }
    raf = requestAnimationFrame(loop);

    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; });
    io.observe(canvas);
    const onResize = () => size();
    window.addEventListener('resize', onResize);
    return () => {
      disposed = true;
      if (raf) cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener('resize', onResize);
    };
  }, [reduced, density, mode]);

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 ${className}`}
    />
  );
}

/**
 * EraWatermark: giant ghost labels (e.g. 1999 / 2010 / TODAY) that
 * crossfade as the visitor scrolls through the parent container. Place as
 * the FIRST child of a position:relative container so content paints above.
 * Static first label under prefers-reduced-motion.
 */
export function EraWatermark({ labels = [] }) {
  const wrapRef = useRef(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    if (reduced) return;
    const wrap = wrapRef.current;
    if (!wrap) return;
    const els = wrap.querySelectorAll('.era-label');
    if (!els.length) return;
    const st = ScrollTrigger.create({
      trigger: wrap.parentElement,
      start: 'top 65%',
      end: 'bottom 40%',
      scrub: 0.5,
      onUpdate(self) {
        const seg = 1 / (els.length - 1);
        els.forEach((el, i) => {
          const o = Math.max(0, 1 - Math.abs(self.progress - i * seg) / seg);
          el.style.opacity = o.toFixed(3);
        });
      },
    });
    return () => st.kill();
  }, [reduced, labels]);

  return (
    <div ref={wrapRef} aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      {labels.map((label, i) => (
        <span
          key={label}
          data-label={label}
          className="era-label absolute right-0 top-1/2 -translate-y-1/2 select-none font-bold leading-none"
          style={{
            fontFamily: "'Glacial Indifference', sans-serif",
            fontSize: 'clamp(110px, 20vw, 280px)',
            color: 'rgba(34,200,229,0.07)',
            opacity: i === 0 ? 1 : 0,
          }}
        />
      ))}
    </div>
  );
}
