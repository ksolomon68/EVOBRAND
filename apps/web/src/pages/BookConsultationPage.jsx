import React from 'react';
import SEO from '@/components/SEO.jsx';
import SchedulerWidget from '@/components/scheduler/SchedulerWidget.jsx';
import { PageHero, Reveal } from '@/components/motion/PageMotion.jsx';

export default function BookConsultationPage() {
  return (
    <>
      <SEO
        title="Book a Free AI Strategy Consultation | EVOBRAND"
        description="Schedule a free 30-minute consultation with EVOBRAND to discuss your business automation, custom AI integrations, and digital transformation goals."
        keywords="book consultation, free strategy session, AI consulting, EVOBRAND scheduler, book strategy call"
        canonical="https://evobrand.net/book-consultation"
      />

      <div className="min-h-screen bg-[#0f1419] text-white pb-20">
        <PageHero
          eyebrow="Let's Build Together"
          lines={[
            [
              { t: 'Book' },
              { t: 'a' },
              { t: 'Strategy', accent: true },
              { t: 'Call', accent: true },
            ],
          ]}
          sub="Select a convenient date and time from the calendar below to secure your free 30-minute AI strategy consultation."
        />

        <div className="container mx-auto px-4 max-w-4xl">
          <Reveal delay={0.15}>
            <div
              className="rounded-3xl shadow-2xl p-4 sm:p-8 border border-[#22c8e5]/10"
              style={{ background: '#1a2332' }}
            >
              <SchedulerWidget />
            </div>
          </Reveal>
        </div>
      </div>
    </>
  );
}
