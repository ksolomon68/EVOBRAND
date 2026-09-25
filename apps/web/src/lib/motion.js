// Motion engine: GSAP, ScrollTrigger, SplitText and Lenis, loaded as a lazy chunk.
//
// Progressive enhancement: content is fully visible by default. The engine only
// loads when the visitor has not asked for reduced motion, and it adds the
// `js-motion` class to <html> once it is ready. Components animate only when
// they receive a loaded engine, so a slow or failed load leaves a static page.

import { useEffect, useState } from 'react';

const REDUCED = '(prefers-reduced-motion: reduce)';

let enginePromise = null;
let engine = null;

export function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia(REDUCED).matches;
}

export function loadMotion() {
  if (typeof window === 'undefined' || prefersReducedMotion()) return Promise.resolve(null);
  if (enginePromise) return enginePromise;

  enginePromise = Promise.all([
    import('gsap'),
    import('gsap/ScrollTrigger'),
    import('gsap/SplitText'),
    import('lenis'),
  ])
    .then(([gsapMod, stMod, splitMod, lenisMod]) => {
      const gsap = gsapMod.gsap || gsapMod.default;
      const { ScrollTrigger } = stMod;
      const { SplitText } = splitMod;
      const Lenis = lenisMod.default;
      gsap.registerPlugin(ScrollTrigger, SplitText);

      // Smooth scrolling, driven by GSAP's ticker so ScrollTrigger stays in sync.
      const lenis = new Lenis({ duration: 1.05, smoothWheel: true });
      lenis.on('scroll', ScrollTrigger.update);
      const raf = (time) => lenis.raf(time * 1000);
      gsap.ticker.add(raf);
      gsap.ticker.lagSmoothing(0);

      // If the visitor turns on reduced motion mid-visit, stop smoothing and
      // jump every running animation to its end state.
      window.matchMedia(REDUCED).addEventListener('change', (e) => {
        if (!e.matches) return;
        lenis.destroy();
        gsap.ticker.remove(raf);
        gsap.globalTimeline.progress(1);
        document.documentElement.classList.remove('js-motion');
      });

      // Line breaks change once webfonts arrive; re-measure triggers then.
      document.fonts?.ready.then(() => ScrollTrigger.refresh());

      document.documentElement.classList.add('js-motion');
      engine = { gsap, ScrollTrigger, SplitText, lenis };
      return engine;
    })
    .catch(() => {
      releaseHeldHeadlines();
      return null;
    });

  return enginePromise;
}

/** Returns the loaded engine, or null while loading, on failure, or under reduced motion. */
export function useMotion() {
  const [value, setValue] = useState(engine);
  useEffect(() => {
    if (engine) return undefined;
    let alive = true;
    loadMotion().then((e) => alive && setValue(e));
    return () => {
      alive = false;
    };
  }, []);
  return value;
}

/** The engine if it has already loaded, else null. */
export function getLoadedMotion() {
  return engine;
}

/** True while the inline script in index.html is still holding headlines hidden. */
export function headlinesHeld() {
  return document.documentElement.classList.contains('motion-pending');
}

/** Ends the hold early. Call after the animation has set its own hidden state. */
export function releaseHeldHeadlines() {
  if (typeof window !== 'undefined') window.__releaseMotion?.();
}
