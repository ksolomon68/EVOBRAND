import React from 'react';
import { motion } from 'framer-motion';
import SEO from '@/components/SEO.jsx';
import SchedulerWidget from '@/components/scheduler/SchedulerWidget.jsx';

const NAVY = '#003258';
const GOLD = '#22c8e5';

export default function BookConsultationPage() {
  return (
    <>
      <SEO
        title="Book a Free AI Strategy Consultation | EVOBRAND"
        description="Schedule a free 30-minute consultation with EVOBRAND to discuss your business automation, custom AI integrations, and digital transformation goals."
        keywords="book consultation, free strategy session, AI consulting, EVOBRAND scheduler, book strategy call"
        canonical="https://evobrand.net/book-consultation"
      />

      <div className="min-h-screen text-white pt-24 pb-20" style={{ background: NAVY }}>
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-12">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <p className="text-xs font-bold uppercase tracking-[0.3em] mb-3" style={{ color: GOLD }}>
                Let's Build Together
              </p>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Book a Strategy Call
              </h1>
              <div className="w-12 h-0.5 mx-auto mb-6" style={{ background: GOLD }} aria-hidden="true" />
              <p className="text-lg max-w-xl mx-auto text-white/60">
                Select a convenient date and time from the calendar below to secure your free 30-minute AI strategy consultation.
              </p>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="rounded-3xl shadow-2xl p-4 sm:p-8"
            style={{ background: 'rgba(10,22,40,0.6)', border: '1px solid rgba(34,200,229,0.08)' }}
          >
            <SchedulerWidget />
          </motion.div>
        </div>
      </div>
    </>
  );
}
