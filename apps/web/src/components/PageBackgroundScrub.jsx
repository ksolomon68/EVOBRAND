import React, { useEffect, useRef } from 'react';

/**
 * PageBackgroundScrub — full-page scroll-driven image sequence.
 *
 * A fixed, full-viewport canvas behind the entire page (z-index -1,
 * pointer-events none). Total page scroll (0 → document end) maps linearly
 * onto the frame sequence, so the film plays as the visitor traverses the
 * whole story — not just the hero.
 *
 * Loading strategy (the sequence can be hundreds of frames / tens of MB):
 * frames load in priority waves — every 8th frame first, then every 4th,
 * 2nd, and finally all — and the renderer always draws the nearest loaded
 * frame, so the background is alive within the first few files and
 * sharpens as the rest arrive. On small screens only every 3rd frame is
 * fetched. Under prefers-reduced-motion only the first frame loads and the
 * background is a static image.
 */

// ── Sequence config — swap these when a new frame set is uploaded ─────────────
const CONFIG = {
  BASE_URL: '/pagebg/',
  PREFIX: 'ezgif-frame-',
  PAD: 3,
  EXT: '.jpg',
  TOTAL: 271,
};

function frameUrl(n) {
  return `${CONFIG.BASE_URL}${CONFIG.PREFIX}${String(n).padStart(CONFIG.PAD, '0')}${CONFIG.EXT}`;
}

/** Wave order: stride 8, then 4, 2, 1 — no duplicates, low-res-first feel. */
function waveOrder(total, step = 1) {
  const seen = new Set();
  const order = [];
  for (const stride of [8, 4, 2, 1]) {
    if (stride < step) break;
    for (let i = 0; i < total; i += stride) {
      if (i % step !== 0) continue; // honor mobile thinning
      if (!seen.has(i)) {
        seen.add(i);
        order.push(i);
      }
    }
  }
  return order;
}

export default function PageBackgroundScrub() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const small = window.innerWidth < 768;
    const step = reduced ? CONFIG.TOTAL : small ? 3 : 1; // frames to skip
    const frames = new Array(CONFIG.TOTAL).fill(null);
    let raf = null;
    let currentDrawn = -1;
    let disposed = false;

    function drawCover(img) {
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

    /** Nearest loaded frame at or near the target index. */
    function nearestLoaded(target) {
      if (frames[target]?.complete && frames[target].naturalWidth > 0) return target;
      for (let d = 1; d < CONFIG.TOTAL; d++) {
        const lo = target - d;
        const hi = target + d;
        if (lo >= 0 && frames[lo]?.complete && frames[lo].naturalWidth > 0) return lo;
        if (hi < CONFIG.TOTAL && frames[hi]?.complete && frames[hi].naturalWidth > 0) return hi;
      }
      return -1;
    }

    function render() {
      raf = null;
      const revealSection = document.getElementById('film-reveal');
      const maxScroll = revealSection 
        ? revealSection.offsetTop + revealSection.offsetHeight - window.innerHeight
        : document.documentElement.scrollHeight - window.innerHeight;
      const scrollable = Math.max(1, maxScroll);
      const progress = Math.min(Math.max(window.scrollY / scrollable, 0), 1);
      const target = reduced ? 0 : Math.round(progress * (CONFIG.TOTAL - 1));
      const idx = nearestLoaded(target);
      if (idx === -1 || idx === currentDrawn) return;
      currentDrawn = idx;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawCover(frames[idx]);
    }

    function requestRender() {
      if (raf === null) raf = requestAnimationFrame(render);
    }

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      currentDrawn = -1;
      requestRender();
    }

    // Preload in priority waves
    const order = reduced ? [0] : waveOrder(CONFIG.TOTAL, step);
    let cursor = 0;
    const CONCURRENCY = 6;
    function pump() {
      if (disposed) return;
      while (cursor < order.length) {
        const i = order[cursor++];
        const img = new Image();
        img.src = frameUrl(i + 1);
        img.onload = () => {
          frames[i] = img;
          currentDrawn = -1; // a better frame may now exist for current scroll
          requestRender();
          pump();
        };
        img.onerror = () => pump();
        frames[i] = img;
        if (cursor % CONCURRENCY === 0) break; // keep ~CONCURRENCY in flight
      }
    }
    pump();

    resize();
    window.addEventListener('scroll', requestRender, { passive: true });
    window.addEventListener('resize', resize);
    return () => {
      disposed = true;
      window.removeEventListener('scroll', requestRender);
      window.removeEventListener('resize', resize);
      if (raf !== null) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 h-full w-full"
      style={{ zIndex: -1 }}
    />
  );
}
