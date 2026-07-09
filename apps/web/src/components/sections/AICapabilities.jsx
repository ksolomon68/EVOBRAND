import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const StatCounter = ({ target, label, suffix = '' }) => {
  const [count, setCount] = useState(0);
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.5 });
  const prefersReducedMotion = typeof window !== 'undefined'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  useEffect(() => {
    if (inView) {
      if (prefersReducedMotion) {
        setCount(target);
        return;
      }
      let start = 0;
      const duration = 2000;
      const increment = target / (duration / 16);

      const timer = setInterval(() => {
        start += increment;
        if (start >= target) {
          setCount(target);
          clearInterval(timer);
        } else {
          setCount(Math.ceil(start));
        }
      }, 16);

      return () => clearInterval(timer);
    }
  }, [inView, target, prefersReducedMotion]);

  return (
    <div ref={ref} className="stat-box bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-xl p-6 text-center">
      <div className="stat-number text-4xl font-extrabold text-[#22c8e5]">
        {count}{suffix}
      </div>
      <div className="stat-label text-[#8892a4] text-sm mt-1">{label}</div>
    </div>
  );
};

const FEATURES = [
  {
    num: '01',
    icon: '🔒',
    title: 'FedRAMP-Ready AI Deployments',
    desc: 'On-premise, air-gapped, and govCloud AI solutions meeting the strictest federal security mandates.',
  },
  {
    num: '02',
    icon: '⚙️',
    title: 'Agentic Workflow Automation',
    desc: 'Multi-agent orchestration systems that autonomously handle complex, multi-step enterprise workflows.',
  },
  {
    num: '03',
    icon: '📡',
    title: 'Real-Time Intelligence Pipelines',
    desc: 'Streaming data architectures with embedded ML inference for sub-second decision support.',
  },
  {
    num: '04',
    icon: '🧬',
    title: 'Custom Model Fine-Tuning',
    desc: 'Domain-specific LLM fine-tuning and RAG implementations trained on your proprietary data and context.',
  },
  {
    num: '05',
    icon: '📋',
    title: 'AI Governance & Compliance',
    desc: 'Explainable AI frameworks, audit trails, and responsible AI guardrails aligned with NIST AI RMF.',
  },
];

/**
 * AICapabilities — pinned horizontal-scroll module. On desktop (with motion
 * allowed) the section pins and the capability deck translates sideways as
 * the user scrolls vertically — a different rhythm from the vertical hero
 * scrub. On mobile or under prefers-reduced-motion the cards stack
 * vertically with no pinning.
 */
const AICapabilities = () => {
  const sectionRef = useRef(null);
  const trackRef = useRef(null);
  const progressRef = useRef(null);

  useEffect(() => {
    const mm = gsap.matchMedia();

    mm.add(
      '(min-width: 1024px) and (prefers-reduced-motion: no-preference)',
      () => {
        const track = trackRef.current;
        const section = sectionRef.current;
        if (!track || !section) return;

        const getDistance = () =>
          Math.max(0, track.scrollWidth - track.parentElement.clientWidth);

        gsap.set(progressRef.current, { scaleX: 0, transformOrigin: 'left' });

        const tween = gsap.to(track, {
          x: () => -getDistance(),
          ease: 'none',
          scrollTrigger: {
            trigger: section,
            start: 'top top',
            end: () => `+=${getDistance()}`,
            pin: true,
            scrub: 0.8,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              if (progressRef.current) {
                progressRef.current.style.transform = `scaleX(${self.progress})`;
              }
            },
          },
        });

        return () => {
          if (tween.scrollTrigger) tween.scrollTrigger.kill();
          tween.kill();
        };
      }
    );

    return () => mm.revert();
  }, []);

  return (
    <section ref={sectionRef} id="ai" className="bg-[#0a0a0f] relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[radial-gradient(circle,rgba(34,200,229,0.06)_0%,transparent_70%)] pointer-events-none"></div>

      <div className="relative py-20 lg:py-0 lg:min-h-screen lg:flex lg:flex-col lg:justify-center">
        {/* Header */}
        <div className="container mx-auto px-4 lg:max-w-[1200px]">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block text-[#22c8e5] text-xs font-bold tracking-[0.15em] uppercase mb-4">
              AI Capabilities
            </span>
            <h2 className="text-3xl md:text-5xl font-bold mb-4 text-white leading-tight">
              Intelligence at the Core of Everything We Build
            </h2>
            <p className="text-[#8892a4] text-lg max-w-[600px] leading-relaxed">
              We don't bolt AI on after the fact. Every system we architect is designed from the ground up to harness machine intelligence — securely, responsibly, and at scale.
            </p>
          </motion.div>
        </div>

        {/* Horizontal capability deck (vertical stack on mobile / reduced motion) */}
        <div className="mt-10 lg:mt-12 overflow-hidden">
          <div
            ref={trackRef}
            className="flex flex-col lg:flex-row gap-5 lg:gap-6 container mx-auto px-4 lg:max-w-none lg:w-max lg:mx-0 lg:pl-[max(1rem,calc((100vw-1168px)/2))] lg:pr-[max(1rem,calc((100vw-1168px)/2))]"
          >
            {FEATURES.map((f) => (
              <div
                key={f.num}
                className="ai-feature lg:w-[400px] lg:shrink-0 bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-2xl p-6 lg:p-8 transition-colors hover:border-[rgba(34,200,229,0.4)]"
              >
                <div className="flex items-center justify-between mb-5">
                  <div className="w-11 h-11 rounded-lg bg-[rgba(34,200,229,0.15)] flex items-center justify-center text-xl" aria-hidden="true">
                    {f.icon}
                  </div>
                  <span className="text-[11px] font-bold tracking-[0.25em] text-[#22c8e5]/70">
                    {f.num} — 05
                  </span>
                </div>
                <h4 className="text-white text-lg font-semibold mb-2">{f.title}</h4>
                <p className="text-[#8892a4] text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>

          {/* Deck progress (desktop pin only) */}
          <div className="hidden lg:block container mx-auto px-4 lg:max-w-[1200px] mt-8">
            <div className="h-0.5 w-full rounded-full bg-white/10">
              <div
                ref={progressRef}
                className="h-full rounded-full bg-[#22c8e5]"
                style={{ transform: 'scaleX(0)', transformOrigin: 'left', boxShadow: '0 0 8px rgba(34,200,229,0.5)' }}
              />
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="container mx-auto px-4 lg:max-w-[1200px] mt-12">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            <StatCounter target={680} label="Clients Served" suffix="+" />
            <StatCounter target={975} label="Projects Delivered" suffix="+" />
            <StatCounter target={98} label="Client Retention" suffix="%" />
            <StatCounter target={26} label="Years of Innovation" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default AICapabilities;
