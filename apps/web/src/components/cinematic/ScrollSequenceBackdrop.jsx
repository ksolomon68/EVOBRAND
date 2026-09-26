import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

const framePath = (src, i, format) => `${src}/frame-${String(i + 1).padStart(3, '0')}.${format}`;

/** A fixed, full-page image sequence that advances with document scroll. */
export default function ScrollSequenceBackdrop({ src, frames, format = 'jpg', focus = 0.5, alt }) {
  const rootRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    if (!root || !canvas) return undefined;

    const ctx = canvas.getContext('2d');
    const images = [];
    let current = 0;
    let drawRaf = 0;
    let scrollRaf = 0;
    let lastScroll = -1;

    const draw = () => {
      drawRaf = 0;
      let index = current;
      while (index > 0 && (!images[index]?.complete || !images[index]?.naturalWidth)) index -= 1;
      const img = images[index];
      if (!img?.complete || !img.naturalWidth) return;

      const { width: cw, height: ch } = canvas;
      const scale = Math.max(cw / img.naturalWidth, ch / img.naturalHeight);
      const width = img.naturalWidth * scale;
      const height = img.naturalHeight * scale;
      const x = Math.min(0, Math.max(cw - width, cw / 2 - width * focus));
      ctx.clearRect(0, 0, cw, ch);
      ctx.drawImage(img, x, (ch - height) / 2, width, height);
      root.dataset.frame = String(index + 1);
      root.classList.add('sequence-backdrop--live');
    };

    const requestDraw = () => { if (!drawRaf) drawRaf = requestAnimationFrame(draw); };
    const updateFrame = () => {
      const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      const progress = Math.min(1, Math.max(0, window.scrollY / maxScroll));
      const next = Math.round(progress * (frames - 1));
      if (next === current) return;
      current = next;
      requestDraw();
    };
    const watchScroll = () => {
      if (window.scrollY !== lastScroll) {
        lastScroll = window.scrollY;
        updateFrame();
      }
      scrollRaf = requestAnimationFrame(watchScroll);
    };
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(window.innerWidth * dpr);
      canvas.height = Math.round(window.innerHeight * dpr);
      requestDraw();
    };

    for (let i = 0; i < frames; i += 1) {
      const img = new Image();
      img.decoding = 'async';
      img.onload = () => { if (i <= current) requestDraw(); };
      img.src = framePath(src, i, format);
      images[i] = img;
    }

    resize();
    window.addEventListener('resize', resize);
    scrollRaf = requestAnimationFrame(watchScroll);

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(drawRaf);
      cancelAnimationFrame(scrollRaf);
    };
  }, [src, frames, format, focus]);

  return createPortal(
    <div ref={rootRef} className="sequence-backdrop" aria-hidden="true">
      <img
        className="sequence-backdrop__poster"
        src={framePath(src, 0, format)}
        alt={alt}
        width="1920"
        height="1080"
        decoding="async"
      />
      <canvas ref={canvasRef} className="sequence-backdrop__canvas" />
      <div className="sequence-backdrop__shade" />
    </div>,
    document.body
  );
}
