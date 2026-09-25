import React, { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { prefersReducedMotion } from '@/lib/motion.js';

/**
 * Page change: an ink panel lifts off the new page with a cyan edge, like a
 * sheet being pulled from a drafting table. Skipped on first load (the
 * homepage has its own intro), on hash-only changes, and under reduced motion.
 * Purely decorative and never blocks clicks.
 */
export default function RouteCurtain() {
  const { pathname } = useLocation();
  const first = useRef(true);
  const [run, setRun] = useState(null);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (prefersReducedMotion()) return;
    setRun(pathname);
  }, [pathname]);

  if (!run) return null;
  return (
    <div key={run} className="route-curtain" aria-hidden="true" onAnimationEnd={(e) => e.target === e.currentTarget && setRun(null)}>
      <span className="route-curtain__mark">EVOBRAND</span>
      <span className="route-curtain__edge" />
    </div>
  );
}
