
import React, { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const ProcessVisualizer = () => {
  const containerRef = useRef(null);
  const particlesRef = useRef([]);

  useGSAP(() => {
    const nodes = gsap.utils.toArray('.process-node');
    const lines = gsap.utils.toArray('.process-line');
    
    // Initial state
    gsap.set(nodes, { scale: 0, opacity: 0, transformOrigin: 'center' });
    gsap.set(lines, { strokeDasharray: 1000, strokeDashoffset: 1000 });
    gsap.set('.central-core', { scale: 0, opacity: 0, transformOrigin: 'center' });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top 80%',
        end: 'bottom 20%',
        scrub: 1.5,
      }
    });

    // Animate central core
    tl.to('.central-core', { scale: 1, opacity: 1, duration: 1, ease: 'back.out(1.7)' });

    // Animate each node and its line in sequence
    nodes.forEach((node, i) => {
      tl.to(node, { 
        scale: 1, 
        opacity: 1, 
        duration: 0.5, 
        ease: 'back.out(1.7)' 
      }, `step-${i}`)
      .to(lines[i], { 
        strokeDashoffset: 0, 
        duration: 1,
        ease: 'power2.inOut'
      }, `step-${i}`);
    });

    // Ambient floating particles
    particlesRef.current.forEach((p, i) => {
      if (!p) return;
      gsap.to(p, {
        x: '+=30',
        y: '+=30',
        opacity: 0.4,
        duration: 2 + Math.random() * 2,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay: i * 0.1
      });
    });

    // Central core constant rotation and pulse
    gsap.to('.core-inner', {
      rotate: 360,
      duration: 20,
      repeat: -1,
      ease: 'none'
    });

    gsap.to('.central-core-glow', {
      scale: 1.8,
      opacity: 0.4,
      duration: 3,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut'
    });

  }, { scope: containerRef });

  return (
    <div ref={containerRef} className="relative w-full aspect-square flex items-center justify-center bg-[#0f1419]/30 rounded-3xl border border-[#22c8e5]/10 overflow-hidden group shadow-2xl shadow-[#22c8e5]/5" aria-hidden="true">
      {/* Background Particles */}
      <div className="absolute inset-0 pointer-events-none opacity-40">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            ref={el => particlesRef.current[i] = el}
            className="absolute w-1 h-1 bg-[#22c8e5] rounded-full"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
            }}
          />
        ))}
      </div>

      <svg viewBox="0 0 400 400" className="w-full h-full max-w-[450px] relative z-10 p-12">
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Connection Lines */}
        <path d="M200 200 L200 60" className="process-line stroke-[#22c8e5] stroke-[1.5] fill-none opacity-40" />
        <path d="M200 200 L330 160" className="process-line stroke-[#22c8e5] stroke-[1.5] fill-none opacity-40" />
        <path d="M200 200 L280 320" className="process-line stroke-[#22c8e5] stroke-[1.5] fill-none opacity-40" />
        <path d="M200 200 L120 320" className="process-line stroke-[#22c8e5] stroke-[1.5] fill-none opacity-40" />
        <path d="M200 200 L70 160" className="process-line stroke-[#22c8e5] stroke-[1.5] fill-none opacity-40" />

        {/* Central Core */}
        <circle cx="200" cy="200" r="50" className="central-core-glow fill-[#22c8e5]/10" />
        <g className="central-core">
          <circle cx="200" cy="200" r="30" className="fill-[#1a2332] stroke-[#22c8e5] stroke-[2]" filter="url(#glow)" />
          <g className="core-inner origin-center">
            <path d="M185 185 L215 215 M215 185 L185 215" className="stroke-[#22c8e5] stroke-[2] opacity-60" />
            <circle cx="200" cy="200" r="10" className="fill-none stroke-[#22c8e5] stroke-[1]" />
          </g>
        </g>

        {/* Process Nodes */}
        <g className="process-node group/node cursor-pointer">
          <circle cx="200" cy="60" r="20" className="fill-[#0f1419] stroke-[#22c8e5] stroke-[2] hover:fill-[#22c8e5]/20 transition-all duration-300" />
          <text x="200" y="65" textAnchor="middle" className="fill-[#22c8e5] text-[12px] font-bold pointer-events-none">1</text>
        </g>
        <g className="process-node group/node cursor-pointer">
          <circle cx="330" cy="160" r="20" className="fill-[#0f1419] stroke-[#22c8e5] stroke-[2] hover:fill-[#22c8e5]/20 transition-all duration-300" />
          <text x="330" y="165" textAnchor="middle" className="fill-[#22c8e5] text-[12px] font-bold pointer-events-none">2</text>
        </g>
        <g className="process-node group/node cursor-pointer">
          <circle cx="280" cy="320" r="20" className="fill-[#0f1419] stroke-[#22c8e5] stroke-[2] hover:fill-[#22c8e5]/20 transition-all duration-300" />
          <text x="280" y="325" textAnchor="middle" className="fill-[#22c8e5] text-[12px] font-bold pointer-events-none">3</text>
        </g>
        <g className="process-node group/node cursor-pointer">
          <circle cx="120" cy="320" r="20" className="fill-[#0f1419] stroke-[#22c8e5] stroke-[2] hover:fill-[#22c8e5]/20 transition-all duration-300" />
          <text x="120" y="325" textAnchor="middle" className="fill-[#22c8e5] text-[12px] font-bold pointer-events-none">4</text>
        </g>
        <g className="process-node group/node cursor-pointer">
          <circle cx="70" cy="160" r="20" className="fill-[#0f1419] stroke-[#22c8e5] stroke-[2] hover:fill-[#22c8e5]/20 transition-all duration-300" />
          <text x="70" y="165" textAnchor="middle" className="fill-[#22c8e5] text-[12px] font-bold pointer-events-none">5</text>
        </g>
      </svg>

      {/* Decorative Scanline */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(34,200,229,0)_50%,rgba(34,200,229,0.05)_50%)] bg-[length:100%_4px] pointer-events-none"></div>
    </div>
  );
};

export default ProcessVisualizer;
