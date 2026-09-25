import { useLayoutEffect, useRef } from 'react';
import { useMotion, getLoadedMotion, headlinesHeld, releaseHeldHeadlines } from '@/lib/motion.js';

// Content already in view may only be hidden for a reveal if it has not been
// seen yet: the engine was loaded before this component first rendered, or
// the inline hold from index.html is still in effect.
function canHideInView(loadedAtFirstRender) {
  return loadedAtFirstRender || headlinesHeld();
}

const EASE = 'expo.out';

function inViewport(el) {
  const r = el.getBoundingClientRect();
  return r.top < window.innerHeight && r.bottom > 0;
}

function fontsReady(timeoutMs = 1200) {
  if (!document.fonts?.ready) return Promise.resolve();
  return Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, timeoutMs))]);
}

/**
 * Headline reveal: lines rise out of a mask, the lead first and the
 * emphasized half last. Above the fold it plays on load; below the fold it
 * plays when scrolled into view. If the engine arrives after the headline has
 * already painted in view, nothing animates, so text never flashes or jumps.
 */
export function useHeadlineReveal(rootRef, enabled = true) {
  const motion = useMotion();
  const loadedAtFirstRender = useRef(getLoadedMotion() !== null).current;

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!enabled || !motion || !root) return undefined;
    const { gsap, SplitText } = motion;

    const visibleNow = inViewport(root);
    if (visibleNow && !canHideInView(loadedAtFirstRender)) return undefined;

    const heading = root.querySelector('[data-reveal-heading]');
    const lead = root.querySelector('[data-reveal-lead]');
    const emphasis = root.querySelector('[data-reveal-emphasis]');
    const extras = root.querySelectorAll('[data-reveal-extra]');
    if (!heading || !lead) return undefined;

    // Hide before paint while webfonts settle, so lines are split at their final breaks.
    gsap.set(heading, { autoAlpha: 0 });
    gsap.set(extras, { autoAlpha: 0, y: 16 });
    if (visibleNow) releaseHeldHeadlines();

    const splits = [];
    let tl;
    let cancelled = false;

    fontsReady().then(() => {
      if (cancelled) return;
      const parts = [lead, emphasis].filter(Boolean).map((el) =>
        SplitText.create(el, { type: 'lines', mask: 'lines', linesClass: 'evo-reveal-line' })
      );
      splits.push(...parts);

      tl = gsap.timeline({
        paused: !visibleNow,
        defaults: { ease: EASE },
        scrollTrigger: visibleNow
          ? undefined
          : { trigger: root, start: 'top 82%', once: true },
      });
      tl.set(heading, { autoAlpha: 1 });
      tl.from(parts[0].lines, { yPercent: 110, duration: 1.1, stagger: 0.12 });
      if (parts[1]) {
        tl.from(parts[1].lines, { yPercent: 110, duration: 1.2, stagger: 0.12 }, '-=0.7');
      }
      tl.to(extras, { autoAlpha: 1, y: 0, duration: 0.8, stagger: 0.08, ease: 'power2.out' }, '-=0.8');
      // Restore plain text once finished so resizing reflows naturally.
      tl.eventCallback('onComplete', () => splits.forEach((s) => s.revert()));
      if (visibleNow) tl.play();
    });

    return () => {
      cancelled = true;
      tl?.scrollTrigger?.kill();
      tl?.kill();
      splits.forEach((s) => s.revert());
      gsap.set([heading, ...extras], { clearProps: 'opacity,visibility,transform' });
    };
  }, [motion, enabled, rootRef]);
}

/**
 * Credential ledger: rules draw left to right, values rise into place, and
 * items marked `count` tick up to their number. Widths are reserved up front,
 * so nothing shifts while counting.
 */
export function useLedgerReveal(rootRef, enabled = true) {
  const motion = useMotion();
  const loadedAtFirstRender = useRef(getLoadedMotion() !== null).current;

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!enabled || !motion || !root) return undefined;
    const { gsap } = motion;
    // The inline hold only covers headlines, so an in-view ledger animates
    // only when the engine was ready before it first rendered.
    if (inViewport(root) && !loadedAtFirstRender) return undefined;

    const rules = root.querySelectorAll('.evo-ledger-rule');
    const values = root.querySelectorAll('.evo-mask-inner');
    const labels = root.querySelectorAll('dt');
    const counters = root.querySelectorAll('[data-count-to]');

    const tl = gsap.timeline({
      defaults: { ease: EASE },
      scrollTrigger: { trigger: root, start: 'top 85%', once: true },
    });
    tl.from(rules, { scaleX: 0, transformOrigin: 'left center', duration: 1.2, stagger: 0.12 });
    tl.from(values, { yPercent: 105, duration: 1, stagger: 0.12 }, 0.15);
    tl.from(labels, { autoAlpha: 0, y: 8, duration: 0.6, stagger: 0.12, ease: 'power2.out' }, 0.45);
    counters.forEach((el) => {
      const target = Number(el.dataset.countTo);
      const state = { n: 0 };
      el.textContent = '0';
      tl.to(state, {
        n: target,
        duration: 1.6,
        ease: 'power3.out',
        onUpdate: () => {
          el.textContent = String(Math.round(state.n));
        },
      }, 0.3);
    });

    return () => {
      tl.scrollTrigger?.kill();
      tl.kill();
      counters.forEach((el) => {
        el.textContent = el.dataset.countTo;
      });
      gsap.set([...rules, ...values, ...labels], { clearProps: 'all' });
    };
  }, [motion, enabled, rootRef]);
}
