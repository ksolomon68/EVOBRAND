'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Calendar } from 'lucide-react';
import Button from '@/components/ui/Button';
import AnimatedSection from '@/components/ui/AnimatedSection';

export default function CTABanner() {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Gradient background */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(135deg, #0a0a1a 0%, #0a1628 50%, #0a0a1a 100%)',
        }}
      />
      <motion.div
        className="absolute inset-0 opacity-30"
        animate={{
          background: [
            'radial-gradient(ellipse at 20% 50%, rgba(0,102,255,0.3) 0%, transparent 60%)',
            'radial-gradient(ellipse at 80% 50%, rgba(0,212,255,0.2) 0%, transparent 60%)',
            'radial-gradient(ellipse at 20% 50%, rgba(0,102,255,0.3) 0%, transparent 60%)',
          ],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <AnimatedSection>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium mb-6">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            Now Accepting New Engagements for Q3 2025
          </div>

          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            Ready to Transform{' '}
            <span className="bg-gradient-to-r from-[#0066ff] to-[#00d4ff] bg-clip-text text-transparent">
              Your Operations?
            </span>
          </h2>

          <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-10">
            Join the organizations that have already modernized with EvoBrand.
            Let&apos;s discuss your next mission-critical initiative.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/booking">
              <Button size="lg" className="group">
                <Calendar size={18} />
                Book a Strategy Call
                <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link href="/quote">
              <Button variant="secondary" size="lg">
                Request a Quote
              </Button>
            </Link>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}
