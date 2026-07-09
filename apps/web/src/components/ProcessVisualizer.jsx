
import React, { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { usePrefersReducedMotion } from '@/components/motion/PageMotion.jsx';

gsap.registerPlugin(ScrollTrigger);

/**
 * ProcessVisualizer — "The Operational Loop", literally.
 *
 * Mirrors the page's actual 4-phase process (01 Discover / 02 Develop /
 * 03 Launch / 04 Optimize) as nodes on a circular orbit around a central
 * AI core. On scroll, the core boots, the loop draws itself, and each
 * phase lights up in order. Then a pulse travels the loop continuously
 * and data packets stream from every phase back into the core — the
 * "each phase feeds data back" behavior described in the copy beside it.
 *
 * Decorative (aria-hidden); the real process content is in the step
 * cards above. All continuous animation is disabled under
 * prefers-reduced-motion — the diagram renders complete and static.
 */

const CX = 200;
const CY = 200;
const ORBIT_R = 118;
const RING_LEN = Math.ceil(2 * Math.PI * ORBIT_R); // ~742

const PHASES = [
  { num: '01', label: 'DISCOVER', x: CX, y: CY - ORBIT_R, labelX: CX, labelY: CY - ORBIT_R - 34 },
  { num: '02', label: 'DEVELOP', x: CX + ORBIT_R, y: CY, labelX: CX + ORBIT_R + 2, labelY: CY + 44 },
  { num: '03', label: 'LAUNCH', x: CX, y: CY + ORBIT_R, labelX: CX, labelY: CY + ORBIT_R + 42 },
  { num: '04', label: 'OPTIMIZE', x: CX - ORBIT_R, y: CY, labelX: CX - ORBIT_R - 2, labelY: CY + 44 },
];

const ProcessVisualizer = () => {
  const containerRef = useRef(null);
  const reduced = usePrefersReducedMotion();

  useGSAP(
    () => {
      const nodes = gsap.utils.toArray('.pv-node');
      const labels = gsap.utils.toArray('.pv-label');
      const spokes = gsap.utils.toArray('.pv-spoke');

      if (reduced) {
        // Final, static state — fully drawn diagram, no motion.
        gsap.set(['.pv-core', ...nodes], { scale: 1, opacity: 1 });
        gsap.set(labels, { opacity: 1 });
        gsap.set('.pv-ring', { strokeDashoffset: 0 });
        gsap.set(spokes, { opacity: 0.3 });
        gsap.set(['.pv-traveler', '.pv-pulse'], { opacity: 0 });
        return;
      }

      // ── Build sequence, scrubbed to scroll ──────────────────────────
      gsap.set('.pv-core', { scale: 0, opacity: 0, transformOrigin: 'center' });
      gsap.set(nodes, { scale: 0, opacity: 0, transformOrigin: 'center' });
      gsap.set(labels, { opacity: 0 });
      gsap.set('.pv-ring', { strokeDasharray: RING_LEN, strokeDashoffset: RING_LEN });
      gsap.set(spokes, { opacity: 0 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top 80%',
          end: 'bottom 35%',
          scrub: 1.2,
        },
      });

      // 1. Core boots
      tl.to('.pv-core', { scale: 1, opacity: 1, duration: 0.8, ease: 'back.out(1.6)' });
      // 2. The loop draws itself (clockwise from 12 o'clock)
      tl.to('.pv-ring', { strokeDashoffset: 0, duration: 2.4, ease: 'power1.inOut' });
      // 3. Phases light up in order, each with its label + feedback spoke
      nodes.forEach((node, i) => {
        tl.to(node, { scale: 1, opacity: 1, duration: 0.45, ease: 'back.out(1.6)' }, `p${i}`)
          .to(labels[i], { opacity: 1, duration: 0.4 }, `p${i}+=0.15`)
          .to(spokes[i], { opacity: 0.3, duration: 0.4 }, `p${i}+=0.2`);
      });

      // ── Continuous behavior (time-based, not scrubbed) ──────────────
      // Pulse traveling the loop — the process cycling.
      gsap.set('.pv-traveler', { opacity: 0 });
      gsap.to('.pv-traveler', {
        opacity: 1,
        duration: 0.5,
        scrollTrigger: { trigger: containerRef.current, start: 'top 60%' },
      });
      gsap.to('.pv-traveler', {
        rotation: 360,
        svgOrigin: `${CX} ${CY}`,
        duration: 14,
        repeat: -1,
        ease: 'none',
      });

      // Data packets streaming from each phase back into the core.
      gsap.utils.toArray('.pv-pulse').forEach((p, i) => {
        const { x, y } = PHASES[i];
        gsap
          .timeline({ repeat: -1, repeatDelay: 2.2, delay: 1 + i })
          .fromTo(
            p,
            { attr: { cx: x, cy: y } },
            { attr: { cx: CX, cy: CY }, duration: 1.8, ease: 'power1.in' }
          )
          .fromTo(p, { opacity: 0 }, { opacity: 0.9, duration: 0.4 }, 0)
          .to(p, { opacity: 0, duration: 0.35, ease: 'power2.in' }, 1.45);
      });

      // Core idle: slow inner rotation + breathing glow
      gsap.to('.pv-core-inner', {
        rotate: 360,
        duration: 24,
        repeat: -1,
        ease: 'none',
        transformOrigin: 'center',
      });
      gsap.to('.pv-core-glow', {
        scale: 1.5,
        opacity: 0.35,
        duration: 3,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        transformOrigin: 'center',
      });
    },
    { scope: containerRef, dependencies: [reduced] }
  );

  return (
    <div
      ref={containerRef}
      className="relative w-full aspect-square flex items-center justify-center bg-[#0f1419]/30 rounded-3xl border border-[#22c8e5]/10 overflow-hidden shadow-2xl shadow-[#22c8e5]/5"
      aria-hidden="true"
    >
      <svg viewBox="0 0 400 400" className="w-full h-full max-w-[460px] relative z-10 p-6">
        <defs>
          <filter id="pv-glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Orbit ring — the loop itself (rotated so the draw starts at 12 o'clock) */}
        <circle
          cx={CX}
          cy={CY}
          r={ORBIT_R}
          className="pv-ring stroke-[#22c8e5] stroke-[1.5] fill-none opacity-50"
          transform={`rotate(-90 ${CX} ${CY})`}
        />

        {/* Feedback spokes: phase → core */}
        {PHASES.map((p) => (
          <line
            key={p.num}
            x1={p.x}
            y1={p.y}
            x2={CX}
            y2={CY}
            className="pv-spoke stroke-[#22c8e5] stroke-[1]"
            strokeDasharray="3 5"
          />
        ))}

        {/* Data packets streaming into the core */}
        {PHASES.map((p) => (
          <circle key={p.num} cx={p.x} cy={p.y} r="3" className="pv-pulse fill-[#22c8e5]" opacity="0" />
        ))}

        {/* Pulse traveling the loop */}
        <g className="pv-traveler">
          <circle cx={CX} cy={CY - ORBIT_R} r="5" className="fill-[#22c8e5]" filter="url(#pv-glow)" />
        </g>

        {/* Central AI core */}
        <circle cx={CX} cy={CY} r="52" className="pv-core-glow fill-[#22c8e5]/10" />
        <g className="pv-core">
          <circle cx={CX} cy={CY} r="34" className="fill-[#1a2332] stroke-[#22c8e5] stroke-[2]" filter="url(#pv-glow)" />
          <g className="pv-core-inner">
            <circle cx={CX} cy={CY} r="22" className="fill-none stroke-[#22c8e5]/40 stroke-[1]" strokeDasharray="4 6" />
          </g>
          <text
            x={CX}
            y={CY + 4}
            textAnchor="middle"
            className="fill-[#22c8e5] text-[11px] font-bold tracking-[0.2em]"
          >
            AI CORE
          </text>
        </g>

        {/* Phase nodes on the loop */}
        {PHASES.map((p) => (
          <g key={p.num} className="pv-node cursor-pointer">
            <circle
              cx={p.x}
              cy={p.y}
              r="22"
              className="fill-[#0f1419] stroke-[#22c8e5] stroke-[2] hover:fill-[#22c8e5]/15 transition-[fill] duration-300"
            />
            <text
              x={p.x}
              y={p.y + 4}
              textAnchor="middle"
              className="fill-[#22c8e5] text-[12px] font-bold pointer-events-none"
            >
              {p.num}
            </text>
          </g>
        ))}

        {/* Phase labels */}
        {PHASES.map((p) => (
          <text
            key={p.num}
            x={p.labelX}
            y={p.labelY}
            textAnchor="middle"
            className="pv-label fill-white/70 text-[10px] font-bold tracking-[0.25em]"
          >
            {p.label}
          </text>
        ))}

        {/* Loop direction hint */}
        <text
          x={CX}
          y={392}
          textAnchor="middle"
          className="pv-label fill-white/25 text-[8px] tracking-[0.3em] font-semibold"
        >
          CONTINUOUS OPTIMIZATION LOOP
        </text>
      </svg>

      {/* Decorative scanline */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(34,200,229,0)_50%,rgba(34,200,229,0.05)_50%)] bg-[length:100%_4px] pointer-events-none"></div>
    </div>
  );
};

export default ProcessVisualizer;
