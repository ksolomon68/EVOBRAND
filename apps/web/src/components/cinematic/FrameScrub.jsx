import React, { useLayoutEffect, useRef } from 'react';
import { useMotion } from '@/lib/motion.js';

/*
 * A section whose background is an image sequence scrubbed by scroll. The
 * stage pins while the section scrolls past and the frames play through on a
 * canvas. Without the motion engine (reduced motion, slow load, no JS) it is a
 * normal-height section over the poster frame.
 *
 * `frames` is the number of files at `${src}/frame-001.webp` and up.
 * `focus` is the horizontal focal point (0–1) kept in view when cropping.
 */
const framePath = (src, i) => `${src}/frame-${String(i + 1).padStart(3, '0')}.webp`;

export default function FrameScrub({ id, src, frames, focus = 0.5, alt, className = '', labelledBy, children }) {
  const motion = useMotion();
  const sectionRef = useRef(null);
  const canvasRef = useRef(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const canvas = canvasRef.current;
    if (!motion || !section || !canvas) return undefined;
    const { ScrollTrigger } = motion;
    const ctx = canvas.getContext('2d');
    const images = [];
    let current = 0;
    let raf = 0;

    const draw = () => {
      raf = 0;
      // Fall back to the nearest earlier frame that has finished loading.
      let i = current;
      while (i > 0 && !images[i]?.complete) i -= 1;
      const img = images[i];
      if (!img?.complete || !img.naturalWidth) return;
      const { width: cw, height: ch } = canvas;
      const scale = Math.max(cw / img.naturalWidth, ch / img.naturalHeight);
      const w = img.naturalWidth * scale;
      const h = img.naturalHeight * scale;
      const x = Math.min(0, Math.max(cw - w, cw / 2 - w * focus));
      ctx.drawImage(img, x, (ch - h) / 2, w, h);    };
    const requestDraw = () => { if (!raf) raf = requestAnimationFrame(draw); };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(canvas.clientWidth * dpr);
      canvas.height = Math.round(canvas.clientHeight * dpr);
      requestDraw();
    };

    // Start fetching the sequence once the section is a screen away.
    const load = () => {
      for (let i = 0; i < frames; i += 1) {
        const img = new Image();
        img.decoding = 'async';
        // Any frame at or before the current one may be a better fallback.
        img.onload = () => { if (i <= current) requestDraw(); };
        img.src = framePath(src, i);
        images[i] = img;
      }
    };
    const io = new IntersectionObserver((entries) => {
      if (!entries[0].isIntersecting) return;
      io.disconnect();
      load();
    }, { rootMargin: '100% 0px' });
    io.observe(section);

    section.classList.add('frame-scrub--live');
    resize();
    window.addEventListener('resize', resize);

    // Pinned (desktop): play while the stage is held. Unpinned (phones, short
    // screens): play while the section crosses the viewport.
    const pinned = () => getComputedStyle(section.firstElementChild).position === 'sticky';
    const trigger = ScrollTrigger.create({
      trigger: section,
      start: () => (pinned() ? 'top top' : 'top 75%'),
      end: () => (pinned() ? 'bottom bottom' : 'bottom 25%'),
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        const next = Math.round(self.progress * (frames - 1));
        if (next === current) return;
        current = next;
        requestDraw();
      },
    });
    ScrollTrigger.refresh();

    return () => {
      trigger.kill();
      io.disconnect();
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(raf);
      section.classList.remove('frame-scrub--live');
    };
  }, [motion, src, frames, focus]);

  return (
    <section
      id={id}
      ref={sectionRef}
      className={`frame-scrub ${className}`}
      style={{ '--frame-focus': `${focus * 100}%` }}
      aria-labelledby={labelledBy}
    >
      <div className="frame-scrub__stage">
        <img className="frame-scrub__poster" src={framePath(src, 0)} alt={alt} width="1280" height="720" loading="lazy" decoding="async" />
        <canvas ref={canvasRef} className="frame-scrub__canvas" aria-hidden="true" />
        <div className="frame-scrub__shade" aria-hidden="true" />
        <div className="evo-container frame-scrub__content">{children}</div>
      </div>
    </section>
  );
}
