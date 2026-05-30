'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Calendar, Clock, Users, ArrowRight } from 'lucide-react';
import AnimatedSection from '@/components/ui/AnimatedSection';
import Button from '@/components/ui/Button';

const perks = [
  { icon: Clock, text: '30-minute no-obligation call' },
  { icon: Users, text: 'Speak directly with a senior strategist' },
  { icon: Calendar, text: 'Flexible scheduling, any time zone' },
];

export default function BookDiscoveryCall() {
  return (
    <section id="book" className="py-24 relative overflow-hidden bg-[#0a0a0f]">
      {/* Animated gradient blob */}
      <motion.div
        className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full pointer-events-none"
        animate={{
          opacity: [0.06, 0.12, 0.06],
          scale: [1, 1.05, 1],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          background: 'radial-gradient(ellipse at center, #0066ff 0%, transparent 70%)',
          filter: 'blur(60px)',
        }}
        aria-hidden="true"
      />

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <AnimatedSection>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium mb-6">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            Free Discovery Call — No Commitment Required
          </div>

          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            Let&apos;s Talk About{' '}
            <span className="bg-gradient-to-r from-[#0066ff] to-[#00d4ff] bg-clip-text text-transparent">
              Your Vision
            </span>
          </h2>

          <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-10">
            Whether you&apos;re modernizing a government system, integrating AI into enterprise
            workflows, or building a product from scratch — a 30-minute call is where every great
            engagement starts.
          </p>

          {/* Perks row */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-10">
            {perks.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-2 text-gray-400 text-sm">
                <Icon size={15} className="text-[#00d4ff]" />
                {text}
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/booking">
              <Button size="lg" className="group">
                <Calendar size={18} />
                Book My Discovery Call
                <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link href="/quote">
              <Button variant="secondary" size="lg">
                Request a Quote Instead
              </Button>
            </Link>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}
