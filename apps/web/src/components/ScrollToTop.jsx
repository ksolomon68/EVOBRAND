import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { getLoadedMotion } from '@/lib/motion.js';

const HEADER_OFFSET = 96;

/**
 * New page: start at the top. Link with a hash (from the menu, e.g.
 * /our-work#dashboard-demos): scroll to that section once it has rendered.
 * Lazy routes may take a moment, so it retries for about a second.
 */
const ScrollToTop = () => {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (!hash) {
      window.scrollTo(0, 0);
      return undefined;
    }
    let tries = 0;
    let frame;
    const seek = () => {
      const el = document.getElementById(decodeURIComponent(hash.slice(1)));
      if (!el) {
        if (tries++ < 60) frame = requestAnimationFrame(seek);
        return;
      }
      const lenis = getLoadedMotion()?.lenis;
      if (lenis) lenis.scrollTo(el, { offset: -HEADER_OFFSET, duration: 1.1 });
      else window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET);
    };
    frame = requestAnimationFrame(seek);
    return () => cancelAnimationFrame(frame);
  }, [pathname, hash]);

  return null;
};

export default ScrollToTop;
