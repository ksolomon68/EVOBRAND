import React, { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { prefersReducedMotion } from '@/lib/motion.js';

const SPHERE = '/brand/evo-sphere-256.webp';

/**
 * Page change: the EVOBRAND sphere turns into view on an ink panel, then the
 * panel lifts off the new page with a cyan edge. Skipped on first load (the
 * homepage has its own intro), on hash-only changes, and under reduced motion.
 * Purely decorative and never blocks clicks.
 */
export default function RouteCurtain() {
  const { pathname } = useLocation();
  const first = useRef(true);
  const [run, setRun] = useState(null);

  // Warm the cache so the sphere is ready the first time the curtain runs.
  useEffect(() => {
    const img = new Image();
    img.src = SPHERE;
  }, []);

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
      <span className="route-curtain__mark">
        <span className="route-curtain__ring" />
        <img src={SPHERE} srcSet={`${SPHERE} 256w, /brand/evo-sphere-512.webp 512w`} sizes="112px" width="256" height="256" alt="" />
      </span>
      <span className="route-curtain__edge" />
    </div>
  );
}
