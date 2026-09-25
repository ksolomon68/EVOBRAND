import React, { useLayoutEffect, useRef } from 'react';
import { useMotion } from '@/lib/motion.js';

/**
 * Wraps a section so it opens from an inset, rounded frame to full bleed as
 * it scrolls in, like a panel sliding over the previous scene. clip-path does
 * not affect layout, so nothing shifts. Plain section when motion is off.
 */
export default function SectionWipe({ children }) {
  const motion = useMotion();
  const ref = useRef(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!motion || !el) return undefined;
    const { gsap } = motion;
    const tween = gsap.fromTo(
      el,
      { clipPath: 'inset(0% 5% 0% 5% round 40px)' },
      {
        clipPath: 'inset(0% 0% 0% 0% round 0px)',
        ease: 'none',
        scrollTrigger: { trigger: el, start: 'top bottom', end: 'top 25%', scrub: true },
      }
    );
    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
      gsap.set(el, { clearProps: 'clipPath' });
    };
  }, [motion]);

  return <div ref={ref} className="cine-wipe">{children}</div>;
}
