'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Search, LayoutTemplate, Hammer, Rocket } from 'lucide-react';
import AnimatedSection from '@/components/ui/AnimatedSection';

const steps = [
  {
    number: '01',
    icon: Search,
    title: 'Discovery',
    description:
      'Deep dive into your operations, goals, and constraints. We map stakeholders, define success metrics, and identify the highest-leverage opportunities.',
    color: 'text-blue-400',
    bg: 'bg-blue-500/10 border-blue-500/20',
  },
  {
    number: '02',
    icon: LayoutTemplate,
    title: 'Architecture',
    description:
      'We design the system architecture, technology stack, and delivery roadmap. Every decision is documented, reviewed, and aligned to your requirements.',
    color: 'text-purple-400',
    bg: 'bg-purple-500/10 border-purple-500/20',
  },
  {
    number: '03',
    icon: Hammer,
    title: 'Build',
    description:
      'Agile sprints with weekly demos, continuous integration, and real-time transparency. You are never in the dark about progress, blockers, or decisions.',
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/10 border-cyan-500/20',
  },
  {
    number: '04',
    icon: Rocket,
    title: 'Deploy',
    description:
      'Production deployment with full documentation, training, and ongoing support. We do not ship and disappear — we partner for the long term.',
    color: 'text-green-400',
    bg: 'bg-green-500/10 border-green-500/20',
  },
];

export default function Process() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section id="process" className="py-24 bg-[#0a0a0f]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedSection className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-medium mb-4">
            How We Work
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Our Proven Process
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Structured. Transparent. Repeatable. Our delivery process is refined over 50+ enterprise engagements.
          </p>
        </AnimatedSection>

        <div ref={ref} className="relative">
          {/* Connecting line */}
          <div className="hidden lg:block absolute top-16 left-0 right-0 h-px bg-white/10" aria-hidden="true">
            <motion.div
              className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-green-500"
              initial={{ scaleX: 0, originX: 0 }}
              animate={isInView ? { scaleX: 1 } : { scaleX: 0 }}
              transition={{ duration: 1.5, ease: 'easeInOut', delay: 0.5 }}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, idx) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, y: 30 }}
                  animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                  transition={{ duration: 0.6, delay: idx * 0.15 }}
                  className="relative flex flex-col items-center text-center"
                >
                  {/* Icon circle */}
                  <div className={`relative z-10 w-14 h-14 rounded-full ${step.bg} border flex items-center justify-center mb-6`}>
                    <Icon size={24} className={step.color} />
                  </div>

                  <span className="text-xs font-bold text-gray-600 tracking-widest mb-2">
                    STEP {step.number}
                  </span>
                  <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{step.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
