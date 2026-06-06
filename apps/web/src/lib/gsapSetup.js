import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register once for the whole app.
gsap.registerPlugin(ScrollTrigger);

/**
 * ScrollTrigger caches element positions when triggers are created (on mount).
 * This page loads a lot of async content after that — the 200vh hero frame
 * sequence, web fonts, and YouTube thumbnails — all of which change document
 * height and shift every trigger's start/end. Without a refresh, scroll reveals
 * fire at stale scroll positions (usually too early, off-screen) and appear not
 * to animate at all. Recalculate once everything has settled.
 */
if (typeof window !== 'undefined') {
  const refresh = () => ScrollTrigger.refresh();

  // After the full load (images/iframes), and a couple of staggered fallbacks
  // to catch late layout shifts (lazy thumbnails, etc.).
  if (document.readyState === 'complete') {
    refresh();
  } else {
    window.addEventListener('load', refresh, { once: true });
  }

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(refresh).catch(() => {});
  }

  // Late content (YouTube thumbnails, hero frames) can land after `load`.
  [400, 1200, 2500].forEach((ms) => setTimeout(refresh, ms));
}

export { gsap, ScrollTrigger };
