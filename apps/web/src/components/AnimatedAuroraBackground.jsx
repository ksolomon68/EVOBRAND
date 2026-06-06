import React, { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

/**
 * AnimatedAuroraBackground
 * GSAP-driven decorative backdrop: slowly drifting/morphing gradient blobs, a
 * gently panning perspective grid, and a sweeping light beam. Purely decorative
 * (aria-hidden) and fully static for prefers-reduced-motion users.
 */
const BLOBS = [
  { size: 460, top: '-10%', left: '-5%', color: 'rgba(34,200,229,0.20)' },
  { size: 380, top: '40%', left: '70%', color: 'rgba(0,50,88,0.55)' },
  { size: 300, top: '60%', left: '15%', color: 'rgba(34,200,229,0.14)' },
];

const AnimatedAuroraBackground = ({ className = '' }) => {
  const ref = useRef(null);

  useGSAP(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    gsap.utils.toArray('.aurora-blob').forEach((blob, i) => {
      gsap.to(blob, {
        x: gsap.utils.random(-90, 90),
        y: gsap.utils.random(-70, 70),
        scale: gsap.utils.random(0.8, 1.3),
        duration: 8 + i * 2,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });
    });

    // Slow grid drift for subtle depth.
    gsap.to('.aurora-grid', {
      backgroundPosition: '40px 40px',
      duration: 12,
      repeat: -1,
      ease: 'none',
    });

    // Sweeping light beam across the section.
    gsap.fromTo(
      '.aurora-beam',
      { xPercent: -120, opacity: 0 },
      {
        xPercent: 120,
        opacity: 1,
        duration: 5,
        repeat: -1,
        repeatDelay: 3,
        ease: 'power1.inOut',
        keyframes: { opacity: [0, 0.6, 0] },
      }
    );
  }, { scope: ref });

  return (
    <div
      ref={ref}
      className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}
      aria-hidden="true"
    >
      {/* Panning grid */}
      <div
        className="aurora-grid absolute inset-0 opacity-[0.12]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(34,200,229,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(34,200,229,0.4) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
          maskImage: 'radial-gradient(ellipse at center, #000 0%, transparent 75%)',
          WebkitMaskImage: 'radial-gradient(ellipse at center, #000 0%, transparent 75%)',
        }}
      />

      {/* Drifting gradient blobs */}
      {BLOBS.map((b, i) => (
        <div
          key={i}
          className="aurora-blob absolute rounded-full blur-3xl will-change-transform"
          style={{
            width: b.size,
            height: b.size,
            top: b.top,
            left: b.left,
            background: `radial-gradient(circle, ${b.color} 0%, transparent 70%)`,
          }}
        />
      ))}

      {/* Sweeping light beam */}
      <div
        className="aurora-beam absolute top-0 -bottom-0 left-1/2 w-1/3 will-change-transform"
        style={{
          background:
            'linear-gradient(105deg, transparent 0%, rgba(34,200,229,0.10) 50%, transparent 100%)',
          filter: 'blur(8px)',
        }}
      />
    </div>
  );
};

export default AnimatedAuroraBackground;
