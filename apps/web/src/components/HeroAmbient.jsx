import React, { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

/**
 * HeroAmbient
 * Lightweight GSAP-driven decorative layer for the hero: softly drifting glow
 * orbs that add depth and motion behind the headline, plus a bouncing scroll
 * cue. Purely decorative (aria-hidden) and disabled for reduced-motion users.
 */
const ORBS = [
  { size: 320, top: '12%', left: '60%', color: 'rgba(34,200,229,0.18)', dur: 9 },
  { size: 220, top: '55%', left: '78%', color: 'rgba(0,50,88,0.5)', dur: 12 },
  { size: 180, top: '70%', left: '20%', color: 'rgba(34,200,229,0.12)', dur: 14 },
  { size: 120, top: '28%', left: '40%', color: 'rgba(34,200,229,0.10)', dur: 10 },
];

const HeroAmbient = () => {
  const ref = useRef(null);

  useGSAP(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const orbs = gsap.utils.toArray('.hero-orb');
    orbs.forEach((orb, i) => {
      gsap.to(orb, {
        x: gsap.utils.random(-60, 60),
        y: gsap.utils.random(-50, 50),
        scale: gsap.utils.random(0.85, 1.2),
        duration: 6 + i * 1.5,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });
    });

    // Scroll cue bounce.
    gsap.to('.hero-scroll-dot', {
      y: 14,
      opacity: 0.3,
      duration: 1.1,
      repeat: -1,
      yoyo: true,
      ease: 'power1.inOut',
    });
  }, { scope: ref });

  return (
    <div ref={ref} className="absolute inset-0 overflow-hidden pointer-events-none z-[5]" aria-hidden="true">
      {ORBS.map((o, i) => (
        <div
          key={i}
          className="hero-orb absolute rounded-full blur-3xl will-change-transform"
          style={{
            width: o.size,
            height: o.size,
            top: o.top,
            left: o.left,
            background: `radial-gradient(circle, ${o.color} 0%, transparent 70%)`,
          }}
        />
      ))}

      {/* Scroll cue */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
        <span className="text-[#22c8e5]/60 text-[10px] font-bold tracking-[0.3em] uppercase">Scroll</span>
        <div className="w-6 h-10 rounded-full border-2 border-[#22c8e5]/40 flex justify-center pt-2">
          <div className="hero-scroll-dot w-1.5 h-1.5 rounded-full bg-[#22c8e5]" />
        </div>
      </div>
    </div>
  );
};

export default HeroAmbient;
