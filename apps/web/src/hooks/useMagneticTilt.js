import { useRef, useEffect } from 'react';
import gsap from 'gsap';

/**
 * useMagneticTilt
 * Returns a ref to attach to an element. On pointer move the element performs a
 * smooth 3D tilt that follows the cursor, plus an optional glare highlight that
 * tracks the pointer position via the `--glare-x` / `--glare-y` CSS vars.
 *
 * Honors prefers-reduced-motion (no-ops when the user opts out) and cleanly
 * tears down listeners + GSAP tweens on unmount.
 */
export default function useMagneticTilt({
  max = 12,        // max rotation in degrees
  scale = 1.03,    // hover scale
  perspective = 800,
  glare = true,
} = {}) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    // Skip on touch / coarse pointers where tilt feels wrong.
    if (window.matchMedia('(pointer: coarse)').matches) return;

    gsap.set(el, { transformPerspective: perspective, transformStyle: 'preserve-3d' });

    const xTo = gsap.quickTo(el, 'rotationY', { duration: 0.5, ease: 'power3.out' });
    const yTo = gsap.quickTo(el, 'rotationX', { duration: 0.5, ease: 'power3.out' });
    const sTo = gsap.quickTo(el, 'scale', { duration: 0.5, ease: 'power3.out' });

    const handleMove = (e) => {
      const rect = el.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width;   // 0..1
      const py = (e.clientY - rect.top) / rect.height;   // 0..1
      xTo((px - 0.5) * max * 2);
      yTo((0.5 - py) * max * 2);
      if (glare) {
        el.style.setProperty('--glare-x', `${px * 100}%`);
        el.style.setProperty('--glare-y', `${py * 100}%`);
        el.style.setProperty('--glare-opacity', '1');
      }
    };

    const handleEnter = () => sTo(scale);

    const handleLeave = () => {
      xTo(0);
      yTo(0);
      sTo(1);
      if (glare) el.style.setProperty('--glare-opacity', '0');
    };

    el.addEventListener('pointermove', handleMove);
    el.addEventListener('pointerenter', handleEnter);
    el.addEventListener('pointerleave', handleLeave);

    return () => {
      el.removeEventListener('pointermove', handleMove);
      el.removeEventListener('pointerenter', handleEnter);
      el.removeEventListener('pointerleave', handleLeave);
      gsap.killTweensOf(el);
    };
  }, [max, scale, perspective, glare]);

  return ref;
}
