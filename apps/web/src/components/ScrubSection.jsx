/**
 * ScrubSection — Hero + scroll-synced image sequence + chapter panels.
 * This is the primary hero. The existing headline and CTAs live here.
 * Frames: /header/ezgif-frame-001.jpg … ezgif-frame-076.jpg (local public/)
 */

import React, { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const TOTAL_FRAMES = 77;

function buildUrl(n) {
  return `/header/ezgif-frame-${String(n).padStart(3, '0')}.jpg`;
}

function chapterForFrame(frameNumber) {
  if (frameNumber <= 19) return 0;
  if (frameNumber <= 39) return 1;
  if (frameNumber <= 58) return 2;
  return 3;
}

const CHAPTERS = [
  {
    number: '01 — Vision',
    title: 'Before EVOBRAND,\nyou had a website.',
    body: 'Most agencies deliver templates and call it transformation. We start with your mission and build every pixel around it.',
  },
  {
    number: '02 — Strategy',
    title: 'AI-powered.\nSection 508 ready.',
    body: 'We build enterprise digital platforms that comply, convert, and scale — with accessibility baked in from day one, not bolted on.',
  },
  {
    number: '03 — Execution',
    title: 'Government-grade.\nAward-worthy.',
    body: 'SBE, WBE, and MBE certified. Delivered for Caltrans, chambers of commerce, political campaigns, and Fortune-adjacent enterprises.',
  },
  {
    number: '04 — Outcome',
    title: 'Your brand.\nFully evolved.',
    body: 'From ChamberCore to Vibe Hyr to PrimeReach — we build proprietary platforms that create IP, not just deliverables.',
  },
];

const ScrubSection = () => {
  const sectionRef  = useRef(null);
  const canvasRef   = useRef(null);
  const panelRefs   = useRef([]);
  const headlineRef = useRef(null);
  const heroOverlayRef = useRef(null);

  const internal = useRef({
    frames: new Array(TOTAL_FRAMES).fill(null),
    loadedCount: 0,
    currentChapter: -1,
    activePanelIndex: -1,
    ctx: null,
  });

  // ── Kinetic word reveal on mount ─────────────────────────────────
  useEffect(() => {
    const el = headlineRef.current;
    if (!el) return;
    const words = el.querySelectorAll('.hero-word-inner');
    if (!words.length) return;
    // Negative vertical insets: never clip descenders (g/y) under the
    // headline's tight line-height — the reveal is horizontal only.
    gsap.set(words, { clipPath: 'inset(-20% 100% -20% 0%)' });
    gsap.to(words, {
      clipPath: 'inset(-20% 0% -20% 0%)',
      duration: 0.65,
      ease: 'power3.out',
      stagger: 0.1,
      delay: 0.35,
    });
  }, []);

  // ── Canvas + ScrollTrigger ────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const state = internal.current;
    state.ctx = canvas.getContext('2d');
    const ctx = state.ctx;

    function resizeCanvas() {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
      redraw();
    }

    function drawCover(img) {
      if (!img?.complete || img.naturalWidth === 0) return;
      const cw = canvas.width, ch = canvas.height;
      const ir = img.naturalWidth / img.naturalHeight;
      const cr = cw / ch;
      let dw, dh, dx, dy;
      if (ir > cr) {
        dh = ch; dw = ch * ir; dx = (cw - dw) / 2; dy = 0;
      } else {
        dw = cw; dh = cw / ir; dx = 0; dy = (ch - dh) / 2;
      }
      ctx.drawImage(img, dx, dy, dw, dh);
    }

    function redraw() {
      for (const img of state.frames) {
        if (img?.complete && img.naturalWidth > 0) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          drawCover(img);
          break;
        }
      }
    }

    function showPanel(index) {
      const panels = panelRefs.current;
      if (index === state.activePanelIndex) return;

      // Kill all running panel tweens first — prevents stacking in GSAP 3
      panels.forEach(p => { if (p) gsap.killTweensOf(p); });
      // Instantly hide all panels, then fade in only the target
      panels.forEach(p => { if (p) gsap.set(p, { opacity: 0, y: 0 }); });

      state.activePanelIndex = index;

      if (panels[index]) {
        gsap.fromTo(panels[index],
          { opacity: 0, y: 26 },
          { opacity: 1, y: 0, duration: 0.45, ease: 'power2.out' }
        );
      }
    }

    function hidePanels() {
      const panels = panelRefs.current;
      // Kill tweens and instantly hide — no animation, avoids overlap on scroll-back
      panels.forEach(p => {
        if (p) { gsap.killTweensOf(p); gsap.set(p, { opacity: 0 }); }
      });
      state.activePanelIndex = -1;
      state.currentChapter   = -1;
    }

    function renderFrame(progress) {
      const { frames } = state;
      const rawIndex = progress * (TOTAL_FRAMES - 1);
      const index    = Math.min(Math.floor(rawIndex), TOTAL_FRAMES - 1);
      const frac     = rawIndex - index;
      const curr     = frames[index];
      const next     = frames[Math.min(index + 1, TOTAL_FRAMES - 1)];

      if (!curr?.complete) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawCover(curr);
      if (next?.complete && next.naturalWidth > 0 && frac > 0.02) {
        ctx.globalAlpha = frac;
        drawCover(next);
        ctx.globalAlpha = 1;
      }

      // Hero fades out over first 8% of scroll progress (fades back in when returning)
      if (heroOverlayRef.current) {
        const alpha = 1 - Math.max(0, Math.min(1, progress / 0.08));
        heroOverlayRef.current.style.opacity = alpha;
      }

      if (progress < 0.10) {
        // Scrolled back into hero zone — kill all panels immediately
        if (state.currentChapter !== -1 || state.activePanelIndex !== -1) {
          hidePanels();
        }
      } else {
        // Story zone — show chapter matching current frame
        const newChapter = chapterForFrame(index + 1);
        if (newChapter !== state.currentChapter) {
          state.currentChapter = newChapter;
          showPanel(newChapter);
        }
      }
    }

    // Preload
    console.log('[EVOBRAND Scrubber] Initializing. First frame URL:', buildUrl(1));
    for (let i = 0; i < TOTAL_FRAMES; i++) {
      const img = new Image();
      img.src = buildUrl(i + 1);
      img.onload = () => {
        state.loadedCount++;
        if (state.loadedCount === 1) { ctx.clearRect(0, 0, canvas.width, canvas.height); drawCover(img); }
        if (state.loadedCount === TOTAL_FRAMES) console.log(`[EVOBRAND Scrubber] All ${TOTAL_FRAMES} frames loaded.`);
      };
      img.onerror = () => { state.loadedCount++; };
      state.frames[i] = img;
    }

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    const trigger = ScrollTrigger.create({
      trigger: sectionRef.current,
      start:  'top top',
      end:    'bottom bottom',
      scrub:  0.8,
      onUpdate: self => renderFrame(self.progress),
      onEnter:    () => renderFrame(0),
      onLeaveBack: () => hidePanels(),
    });

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      trigger.kill();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      style={{ position: 'relative', height: '500vh', background: '#0f1419' }}
      aria-label="EVOBRAND hero and story scroll"
    >
      {/* Sticky viewport */}
      <div style={{ position: 'sticky', top: 0, height: '100vh', overflow: 'hidden' }}>

        {/* Canvas — full-bleed image sequence */}
        <canvas
          ref={canvasRef}
          aria-hidden="true"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block' }}
        />

        {/* Gradient overlays for readability */}
        <div aria-hidden="true" style={{
          position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none',
          background: 'rgba(15,20,25,0.52)',
        }} />
        <div aria-hidden="true" style={{
          position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none',
          background: 'linear-gradient(to bottom, rgba(15,20,25,0.25) 0%, transparent 40%, rgba(15,20,25,0.6) 100%)',
        }} />

        {/* ── Hero title + CTAs (fades out as story begins) ── */}
        <div
          ref={heroOverlayRef}
          style={{
            position: 'absolute', inset: 0, zIndex: 3,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            textAlign: 'center',
            padding: '0 24px',
            paddingTop: '72px', /* clear fixed nav */
          }}
        >
          <h1
            ref={headlineRef}
            style={{
              fontFamily: "'Space Grotesk', 'Montserrat', sans-serif",
              fontSize: 'clamp(26px, 5.5vw, 80px)',
              fontWeight: 700,
              lineHeight: 1.1,
              color: '#ffffff',
              marginBottom: '28px',
              maxWidth: '800px',
            }}
          >
            <span style={{ display: 'block' }}>
              {['Your', 'Partner', 'in'].map((word, i) => (
                <span key={i} style={{ display: 'inline-block', marginRight: '0.22em', verticalAlign: 'baseline' }}>
                  <span className="hero-word-inner" style={{ display: 'inline-block' }}>{word}</span>
                </span>
              ))}
            </span>
            <span style={{ display: 'block', color: '#22c8e5' }}>
              {['AI', 'Transformation'].map((word, i) => (
                <span key={i} style={{ display: 'inline-block', marginRight: '0.22em', verticalAlign: 'baseline' }}>
                  <span className="hero-word-inner" style={{ display: 'inline-block' }}>{word}</span>
                </span>
              ))}
            </span>
          </h1>

          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <Link
              to="/our-work"
              style={{
                display: 'inline-block',
                padding: '14px 36px',
                background: '#22c8e5',
                color: '#003258',
                borderRadius: '16px',
                fontWeight: 700,
                fontSize: '15px',
                textDecoration: 'none',
                transition: 'opacity 0.2s, transform 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.opacity = '0.88'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              See Our Work
            </Link>
            <Link
              to="/audit"
              style={{
                display: 'inline-block',
                padding: '13px 34px',
                border: '2px solid #22c8e5',
                color: '#22c8e5',
                borderRadius: '16px',
                fontWeight: 700,
                fontSize: '15px',
                textDecoration: 'none',
                transition: 'background 0.2s, color 0.2s, transform 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#22c8e5'; e.currentTarget.style.color = '#003258'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#22c8e5'; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              Free Brand Audit
            </Link>
          </div>
        </div>

        {/* ── Chapter story panels (centered, appear as user scrolls) ── */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 2,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {CHAPTERS.map((ch, i) => (
            <div
              key={i}
              ref={el => { panelRefs.current[i] = el; }}
              style={{
                position: 'absolute',
                textAlign: 'center',
                padding: '0 24px',
                maxWidth: '720px',
                width: '100%',
                opacity: 0,
                pointerEvents: 'none',
              }}
            >
              <p style={{
                fontSize: '11px', fontWeight: 600, letterSpacing: '0.25em',
                textTransform: 'uppercase', color: '#22c8e5', marginBottom: '16px',
              }}>
                {ch.number}
              </p>
              <h2 style={{
                fontFamily: "'Space Grotesk', 'Montserrat', sans-serif",
                fontSize: 'clamp(26px, 4.5vw, 54px)',
                fontWeight: 700, lineHeight: 1.1, letterSpacing: '-0.025em',
                color: '#ffffff', marginBottom: '18px', whiteSpace: 'pre-line',
              }}>
                {ch.title}
              </h2>
              <p style={{
                fontSize: 'clamp(14px, 1.6vw, 17px)',
                color: 'rgba(255,255,255,0.6)', lineHeight: 1.75,
                maxWidth: '520px', margin: '0 auto',
              }}>
                {ch.body}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default ScrubSection;
