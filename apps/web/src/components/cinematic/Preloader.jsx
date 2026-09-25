import React, { useEffect, useRef, useState } from 'react';
import { prefersReducedMotion } from '@/lib/motion.js';

const SEEN_KEY = 'evo-intro-seen';
const FROM = 1999;
const TO = 2026;
const COUNT_MS = 1300;

export const INTRO_DONE_EVENT = 'evo:intro-done';

let introDone = false;

/** True once the intro has finished, or when it was never going to play. */
export function isIntroDone() {
  return introDone;
}

function markDone() {
  if (introDone) return;
  introDone = true;
  window.dispatchEvent(new Event(INTRO_DONE_EVENT));
}

function shouldShow() {
  if (typeof window === 'undefined' || prefersReducedMotion()) return false;
  try {
    return sessionStorage.getItem(SEEN_KEY) !== '1';
  } catch {
    return false;
  }
}

const easeOutExpo = (t) => (t === 1 ? 1 : 1 - 2 ** (-10 * t));

/**
 * First-visit intro: the years count from 1999 to 2026 while a rule fills,
 * then the panel lifts to reveal the page. Runs on plain requestAnimationFrame
 * and CSS so it covers the hero from the first paint, without waiting for the
 * lazy motion engine. Once per session, skippable, never under reduced motion.
 */
export default function Preloader() {
  const [visible, setVisible] = useState(shouldShow);
  const [leaving, setLeaving] = useState(false);
  const yearRef = useRef(null);
  const barRef = useRef(null);
  const panelRef = useRef(null);

  useEffect(() => {
    if (!visible) {
      markDone();
      return undefined;
    }
    try {
      sessionStorage.setItem(SEEN_KEY, '1');
    } catch {
      /* storage unavailable: the intro may simply replay */
    }

    let raf;
    const start = performance.now();
    const step = (now) => {
      const t = Math.min(1, (now - start) / COUNT_MS);
      const e = easeOutExpo(t);
      if (yearRef.current) yearRef.current.textContent = String(Math.round(FROM + (TO - FROM) * e));
      if (barRef.current) barRef.current.style.transform = `scaleX(${e})`;
      if (t < 1) raf = requestAnimationFrame(step);
      else setTimeout(() => setLeaving(true), 250);
    };
    raf = requestAnimationFrame(step);

    const onKey = (ev) => ev.key === 'Escape' && setLeaving(true);
    window.addEventListener('keydown', onKey);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('keydown', onKey);
    };
  }, [visible]);

  useEffect(() => {
    if (!leaving) return undefined;
    // Hand over to the hero as the panel starts to lift, so the two overlap.
    const handoff = setTimeout(markDone, 200);
    const panel = panelRef.current;
    const finish = () => setVisible(false);
    panel?.addEventListener('transitionend', finish, { once: true });
    const fallback = setTimeout(finish, 1200);
    return () => {
      clearTimeout(handoff);
      clearTimeout(fallback);
      panel?.removeEventListener('transitionend', finish);
    };
  }, [leaving]);

  if (!visible) return null;

  return (
    <div ref={panelRef} className={`evo-intro-panel ${leaving ? 'is-leaving' : ''}`}>
      <div className="evo-intro-inner" aria-hidden="true">
        <p className="evo-eyebrow">EVOBRAND Concepts</p>
        <p ref={yearRef} className="evo-intro-year">{FROM}</p>
        <div className="evo-intro-rule">
          <span ref={barRef} />
        </div>
        <p className="evo-intro-caption">Senior-led since 1999</p>
      </div>
      <button type="button" className="evo-intro-skip" onClick={() => setLeaving(true)}>
        Skip intro
      </button>
    </div>
  );
}
