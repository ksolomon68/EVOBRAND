'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { FileSignature, CheckSquare, CreditCard, ArrowRight } from 'lucide-react';
import AnimatedSection from '@/components/ui/AnimatedSection';
import Button from '@/components/ui/Button';

const steps = [
  {
    icon: CheckSquare,
    title: 'Choose Your Clauses',
    description: 'Select from pre-vetted legal clauses — NDA, IP assignment, payment terms, SLAs, and more.',
  },
  {
    icon: FileSignature,
    title: 'Sign Instantly',
    description: 'Review your custom agreement and execute with a digital signature in seconds.',
  },
  {
    icon: CreditCard,
    title: 'Pay & Lock It In',
    description: 'Submit your deposit via Stripe and your engagement is confirmed — no back-and-forth.',
  },
];

export default function ContractTeaser() {
  return (
    <section id="contracts" className="py-24 bg-[#0d0d18] relative overflow-hidden">
      {/* Subtle background glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          background:
            'radial-gradient(ellipse 60% 50% at 80% 50%, rgba(99,102,241,0.08) 0%, transparent 70%)',
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left: Copy */}
          <AnimatedSection direction="left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-medium mb-6">
              <FileSignature size={12} />
              Contract Customizer
            </div>

            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-5 leading-tight">
              Agreements Executed in{' '}
              <span className="bg-gradient-to-r from-[#6366f1] to-[#00d4ff] bg-clip-text text-transparent">
                Minutes, Not Weeks
              </span>
            </h2>

            <p className="text-lg text-gray-400 mb-8 leading-relaxed">
              Build, review, and execute custom service agreements in minutes — no legal back-and-forth
              required. Our contract customizer lets you tailor every clause, sign digitally, and
              process your deposit in a single seamless flow.
            </p>

            <div className="space-y-4 mb-10">
              {steps.map((step, idx) => {
                const Icon = step.icon;
                return (
                  <motion.div
                    key={step.title}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: idx * 0.1 }}
                    className="flex items-start gap-4"
                  >
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/15 border border-indigo-500/25 flex items-center justify-center shrink-0 mt-0.5">
                      <Icon size={18} className="text-indigo-400" />
                    </div>
                    <div>
                      <p className="text-white font-semibold text-sm mb-0.5">{step.title}</p>
                      <p className="text-gray-500 text-sm leading-relaxed">{step.description}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            <Link href="/contracts">
              <Button size="lg" className="group">
                Build Your Agreement
                <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </AnimatedSection>

          {/* Right: Contract preview card */}
          <AnimatedSection direction="right">
            <div className="rounded-2xl bg-white/5 border border-white/10 overflow-hidden shadow-2xl">
              {/* Card header */}
              <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileSignature size={16} className="text-indigo-400" />
                  <span className="text-white text-sm font-semibold">Service Agreement</span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 text-xs">
                  Draft
                </span>
              </div>

              {/* Clause list preview */}
              <div className="p-6 space-y-3">
                {[
                  { label: 'Scope of Work', checked: true },
                  { label: 'IP Assignment', checked: true },
                  { label: 'Non-Disclosure Agreement', checked: true },
                  { label: 'Payment Terms & Schedule', checked: true },
                  { label: 'Revision Policy', checked: false },
                  { label: 'Service Level Agreement', checked: false },
                ].map((clause) => (
                  <div
                    key={clause.label}
                    className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/5"
                  >
                    <div
                      className={`w-4 h-4 rounded flex items-center justify-center shrink-0 ${
                        clause.checked
                          ? 'bg-indigo-500 border border-indigo-400'
                          : 'bg-transparent border border-white/20'
                      }`}
                    >
                      {clause.checked && (
                        <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                          <path
                            d="M1 4L3.5 6.5L9 1"
                            stroke="white"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                    </div>
                    <span className={`text-sm ${clause.checked ? 'text-white' : 'text-gray-500'}`}>
                      {clause.label}
                    </span>
                  </div>
                ))}
              </div>

              {/* Signature / payment bar */}
              <div className="px-6 py-4 border-t border-white/10 bg-white/3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">Project Value</p>
                    <p className="text-white font-bold text-lg">$125,000</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500 mb-0.5">Deposit Due</p>
                    <p className="text-indigo-400 font-bold text-lg">$31,250</p>
                  </div>
                </div>
                <div className="mt-4 h-10 rounded-lg bg-gradient-to-r from-[#6366f1] to-[#00d4ff] flex items-center justify-center">
                  <span className="text-white text-sm font-semibold">Sign &amp; Submit Deposit</span>
                </div>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
}
