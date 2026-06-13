/**
 * ScrubSection — Scroll-synced image sequence + chapter text panels.
 * Adapted from evobrand-scrub-loader.js for React/GSAP ScrollTrigger.
 *
 * Frames: /header/ezgif-frame-001.jpg … ezgif-frame-076.jpg (local public/)
 * Frame 1-19 → Chapter 1, 20-38 → Ch2, 39-57 → Ch3, 58-76 → Ch4
 */

import React, { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const TOTAL_FRAMES = 76;

function buildUrl(n) {
  return `/header/ezgif-frame-${String(n).padStart(3, '0')}.jpg`;
}

function chapterForFrame(frameNumber) {
  if (frameNumber <= 19) return 0;
  if (frameNumber <= 38) return 1;
  if (frameNumber <= 57) return 2;
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
  const sectionRef = useRef(null);
  const canvasRef = useRef(null);
  const panelRefs = useRef([]);
  const internalRef = useRef({
    frames: new Array(TOTAL_FRAMES).fill(null),
    loadedCount: 0,
    currentChapter: -1,
    activePanelIndex: -1,
    ctx: null,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const internal = internalRef.current;
    internal.ctx = canvas.getContext('2d');
    const ctx = internal.ctx;

    // ── Canvas resize ──────────────────────────────────────────────
    function resizeCanvas() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      redraw();
    }

    function drawCover(img) {
      if (!img || !img.complete || img.naturalWidth === 0) return;
      const cw = canvas.width;
      const ch = canvas.height;
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
      const frames = internal.frames;
      // find the most recent loaded frame to show during initial load
      for (let i = 0; i < frames.length; i++) {
        if (frames[i]?.complete && frames[i].naturalWidth > 0) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          drawCover(frames[i]);
          break;
        }
      }
    }

    // ── Chapter panels ─────────────────────────────────────────────
    function showPanel(index) {
      const panels = panelRefs.current;
      const prev = internal.activePanelIndex;
      if (index === prev) return;

      if (prev >= 0 && panels[prev]) {
        gsap.to(panels[prev], { opacity: 0, y: -22, duration: 0.3, ease: 'power2.in' });
      }

      internal.activePanelIndex = index;

      if (panels[index]) {
        gsap.fromTo(
          panels[index],
          { opacity: 0, y: 26 },
          { opacity: 1, y: 0, duration: 0.45, ease: 'power2.out' }
        );
      }
    }

    function hidePanels() {
      panelRefs.current.forEach(p => {
        if (p) gsap.to(p, { opacity: 0, duration: 0.2 });
      });
      internal.activePanelIndex = -1;
      internal.currentChapter = -1;
    }

    // ── Frame renderer ─────────────────────────────────────────────
    function renderFrame(progress) {
      const frames = internal.frames;
      const total = TOTAL_FRAMES;
      const rawIndex = progress * (total - 1);
      const index = Math.min(Math.floor(rawIndex), total - 1);
      const frac = rawIndex - index;

      const curr = frames[index];
      const next = frames[Math.min(index + 1, total - 1)];

      if (!curr?.complete) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawCover(curr);

      if (next?.complete && next.naturalWidth > 0 && frac > 0.02) {
        ctx.globalAlpha = frac;
        drawCover(next);
        ctx.globalAlpha = 1;
      }

      const newChapter = chapterForFrame(index + 1);
      if (newChapter !== internal.currentChapter) {
        internal.currentChapter = newChapter;
        showPanel(newChapter);
      }
    }

    // ── Preload frames ─────────────────────────────────────────────
    console.log('[EVOBRAND Scrubber] Initializing. First frame URL:', buildUrl(1));

    for (let i = 0; i < TOTAL_FRAMES; i++) {
      const img = new Image();
      const frameNumber = i + 1;
      img.src = buildUrl(frameNumber);
      img.onload = () => {
        internal.loadedCount++;
        // Draw first loaded frame immediately
        if (internal.loadedCount === 1) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          drawCover(img);
        }
        if (internal.loadedCount === TOTAL_FRAMES) {
          console.log('[EVOBRAND Scrubber] All 76 frames loaded.');
        }
      };
      img.onerror = () => {
        internal.loadedCount++;
        console.warn('[EVOBRAND Scrubber] Failed to load:', buildUrl(frameNumber));
      };
      internal.frames[i] = img;
    }

    // ── ScrollTrigger ──────────────────────────────────────────────
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    const trigger = ScrollTrigger.create({
      trigger: sectionRef.current,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0.8,
      onUpdate: self => renderFrame(self.progress),
      onEnter: () => {
        renderFrame(0);
        showPanel(0);
      },
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
      aria-label="EVOBRAND story scroll"
    >
      {/* Sticky viewport */}
      <div style={{ position: 'sticky', top: 0, height: '100vh', overflow: 'hidden' }}>

        {/* Canvas — full-bleed image sequence */}
        <canvas
          ref={canvasRef}
          aria-hidden="true"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block' }}
        />

        {/* Readability gradient overlay */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute', inset: 0, zIndex: 1,
            background: 'linear-gradient(to bottom, rgba(15,20,25,0.45) 0%, rgba(15,20,25,0.1) 50%, rgba(15,20,25,0.65) 100%)',
            pointerEvents: 'none',
          }}
        />

        {/* Chapter text panels */}
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
                fontSize: '11px',
                fontWeight: 600,
                letterSpacing: '0.25em',
                textTransform: 'uppercase',
                color: '#22c8e5',
                marginBottom: '16px',
                fontFamily: 'inherit',
              }}>
                {ch.number}
              </p>

              <h2 style={{
                fontSize: 'clamp(26px, 4.5vw, 54px)',
                fontWeight: 700,
                lineHeight: 1.1,
                letterSpacing: '-0.025em',
                color: '#ffffff',
                marginBottom: '18px',
                whiteSpace: 'pre-line',
              }}>
                {ch.title}
              </h2>

              <p style={{
                fontSize: 'clamp(14px, 1.6vw, 17px)',
                color: 'rgba(255,255,255,0.6)',
                lineHeight: 1.75,
                maxWidth: '520px',
                margin: '0 auto',
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
