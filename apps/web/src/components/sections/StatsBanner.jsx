import React, { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger, useGSAP);

const STATS = [
  { value: 10, suffix: 'x', label: 'Faster Production' },
  { value: 80, suffix: '%', label: 'Cost Reduction' },
  { value: 5, suffix: 'x', label: 'ROI Increase' },
  { value: 95, suffix: '%', label: 'Client Satisfaction' },
];

const StatsBanner = () => {
  const containerRef = useRef(null);

  useGSAP(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const items = gsap.utils.toArray('.stat-item');
    const numbers = gsap.utils.toArray('.stat-number');

    if (reduce) {
      // Just show the final values, no motion.
      numbers.forEach((n) => { n.textContent = `${n.dataset.value}${n.dataset.suffix}`; });
      return;
    }

    // Staggered card reveal driven by scroll position.
    gsap.from(items, {
      scrollTrigger: { trigger: containerRef.current, start: 'top 85%' },
      y: 40,
      opacity: 0,
      scale: 0.85,
      duration: 0.7,
      ease: 'back.out(1.6)',
      stagger: 0.12,
    });

    // Count-up + glow pulse for each number once it enters view.
    numbers.forEach((node) => {
      const target = Number(node.dataset.value);
      const suffix = node.dataset.suffix || '';
      const counter = { val: 0 };

      ScrollTrigger.create({
        trigger: node,
        start: 'top 90%',
        once: true,
        onEnter: () => {
          gsap.to(counter, {
            val: target,
            duration: 1.8,
            ease: 'power2.out',
            onUpdate: () => { node.textContent = `${Math.round(counter.val)}${suffix}`; },
          });
          gsap.fromTo(
            node,
            { textShadow: '0 0 0px rgba(34,200,229,0)' },
            {
              textShadow: '0 0 22px rgba(34,200,229,0.7)',
              duration: 0.9,
              yoyo: true,
              repeat: 1,
              ease: 'sine.inOut',
            }
          );
        },
      });
    });
  }, { scope: containerRef });

  return (
    <section ref={containerRef} className="bg-[#1a2332] py-10 border-y border-white/5">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {STATS.map((s) => (
            <div key={s.label} className="stat-item">
              <p
                className="stat-number text-4xl md:text-5xl font-extrabold text-[#22c8e5] tabular-nums"
                data-value={s.value}
                data-suffix={s.suffix}
              >
                0{s.suffix}
              </p>
              <p className="text-gray-400 text-sm mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsBanner;
