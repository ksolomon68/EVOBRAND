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

// ── Sequence config ──────────────────────────────────────────────────────────
// Test sequence: 177 frames total, split across hero (1–88) and body (89–177).
const HERO_CONFIG = {
  BASE_URL: '/test-sequence/',
  PREFIX: 'ezgif-frame-',
  PAD: 3,
  EXT: '.jpg',
  TOTAL: 88,          // frames 001–088
  FRAME_OFFSET: 0,    // no offset — starts at frame 001
  COMPLETE_AT: 0.88,
};

const BODY_CONFIG = {
  BASE_URL: '/test-sequence/',
  PREFIX: 'ezgif-frame-',
  PAD: 3,
  EXT: '.jpg',
  TOTAL: 89,          // frames 089–177
  FRAME_OFFSET: 88,   // offset so index 1 → file 089
};

function heroFrameUrl(n) {
  // n is 1-based within hero range (1..88) → files 001..088
  return `${HERO_CONFIG.BASE_URL}${HERO_CONFIG.PREFIX}${String(n).padStart(HERO_CONFIG.PAD, '0')}${HERO_CONFIG.EXT}`;
}

function bodyFrameUrl(n) {
  // n is 1-based within body range (1..89) → files 089..177
  const actualFrameNumber = n + BODY_CONFIG.FRAME_OFFSET;
  return `${BODY_CONFIG.BASE_URL}${BODY_CONFIG.PREFIX}${String(actualFrameNumber).padStart(BODY_CONFIG.PAD, '0')}${BODY_CONFIG.EXT}`;
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

    const heroStep = reduced ? HERO_CONFIG.TOTAL : small ? 3 : 1;
    const bodyStep = reduced ? BODY_CONFIG.TOTAL : small ? 3 : 1;

    const heroFrames = new Array(HERO_CONFIG.TOTAL).fill(null);
    const bodyFrames = new Array(BODY_CONFIG.TOTAL).fill(null);

    let raf = null;
    let currentDrawnKey = '';
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
    function nearestLoaded(target, framesArray, total) {
      if (framesArray[target]?.complete && framesArray[target].naturalWidth > 0) return target;
      for (let d = 1; d < total; d++) {
        const lo = target - d;
        const hi = target + d;
        if (lo >= 0 && framesArray[lo]?.complete && framesArray[lo].naturalWidth > 0) return lo;
        if (hi < total && framesArray[hi]?.complete && framesArray[hi].naturalWidth > 0) return hi;
      }
      return -1;
    }

    function render() {
      raf = null;
      const storyEl = document.getElementById('story');

      const pageHeight = document.documentElement.scrollHeight;
      const viewportHeight = window.innerHeight;
      const currentScroll = window.scrollY;

      // Hero sequence boundaries
      let heroStart = 0;
      let heroEnd = viewportHeight * 4; // default fallback if element not found
      if (storyEl) {
        heroStart = storyEl.offsetTop;
        heroEnd = storyEl.offsetTop + storyEl.offsetHeight - viewportHeight;
      }
      heroEnd = Math.max(heroStart + 1, heroEnd);

      // Body sequence boundaries
      const bodyStart = heroEnd;
      const bodyEnd = Math.max(bodyStart + 1, pageHeight - viewportHeight);

      let activeSeq = 'hero';
      let progress = 0;

      if (currentScroll <= heroEnd) {
        activeSeq = 'hero';
        progress = Math.min(Math.max((currentScroll - heroStart) / (heroEnd - heroStart), 0), 1);
      } else {
        activeSeq = 'body';
        progress = Math.min(Math.max((currentScroll - bodyStart) / (bodyEnd - bodyStart), 0), 1);
      }

      const totalFrames = activeSeq === 'hero' ? HERO_CONFIG.TOTAL : BODY_CONFIG.TOTAL;
      const framesArray = activeSeq === 'hero' ? heroFrames : bodyFrames;
      
      let target;
      if (reduced) {
        target = 0;
      } else if (activeSeq === 'hero') {
        target = Math.round(progress * (totalFrames - 1));
      } else {
        // Reverse the second sequence (body background) as requested
        target = Math.round((1 - progress) * (totalFrames - 1));
      }

      const idx = nearestLoaded(target, framesArray, totalFrames);
      const redrawKey = `${activeSeq}-${idx}`;

      if (idx === -1 || redrawKey === currentDrawnKey) return;
      currentDrawnKey = redrawKey;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawCover(framesArray[idx]);
    }

    function requestRender() {
      if (raf === null) raf = requestAnimationFrame(render);
    }

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      currentDrawnKey = '';
      requestRender();
    }

    // Preload in priority waves
    const heroOrder = reduced ? [0] : waveOrder(HERO_CONFIG.TOTAL, heroStep);
    const bodyOrder = reduced ? [0] : waveOrder(BODY_CONFIG.TOTAL, bodyStep);

    // Combine waves: all hero waves first, then all body waves
    const loadQueue = [];
    heroOrder.forEach(idx => {
      loadQueue.push({ type: 'hero', index: idx });
    });
    bodyOrder.forEach(idx => {
      loadQueue.push({ type: 'body', index: idx });
    });

    let cursor = 0;
    const CONCURRENCY = 6;
    function pump() {
      if (disposed) return;
      while (cursor < loadQueue.length) {
        const item = loadQueue[cursor++];
        const img = new Image();
        if (item.type === 'hero') {
          img.src = heroFrameUrl(item.index + 1);
          img.onload = () => {
            heroFrames[item.index] = img;
            currentDrawnKey = ''; // trigger redraw
            requestRender();
            pump();
          };
          img.onerror = () => pump();
          heroFrames[item.index] = img;
        } else {
          img.src = bodyFrameUrl(item.index + 1);
          img.onload = () => {
            bodyFrames[item.index] = img;
            currentDrawnKey = ''; // trigger redraw
            requestRender();
            pump();
          };
          img.onerror = () => pump();
          bodyFrames[item.index] = img;
        }
        if (cursor % CONCURRENCY === 0) break; // keep concurrency flow
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
