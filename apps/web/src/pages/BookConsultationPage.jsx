import React from 'react';
import SEO from '@/components/SEO.jsx';
import SchedulerWidget from '@/components/scheduler/SchedulerWidget.jsx';
import { InnerHero, SplitSection, StepList } from '@/components/inner/InnerKit.jsx';

const AGENDA = [
  { title: 'Where you are now', body: 'The goal, the people involved, and what is getting in the way.' },
  { title: 'What good looks like', body: 'The outcome you need and how we would measure it.' },
  { title: 'A practical first step', body: 'Where to start, roughly what it takes, and what we would need from you.' },
];

export default function BookConsultationPage() {
  return (
    <>
      <SEO
        title="Book a Free Strategy Consultation | EVOBRAND"
        description="Schedule a free 30-minute consultation with EVOBRAND to discuss websites, automation, custom AI applications and your digital goals."
        keywords="book consultation, free strategy session, AI consulting, EVOBRAND scheduler, book strategy call"
        canonical="https://evobrand.net/book-consultation"
      />

      <InnerHero
        crumbs={[{ label: 'Book a strategy call' }]}
        label="Free · 30 minutes · No obligation"
        lead="Book a"
        emphasis="strategy call."
        intro="Pick a time below. You will talk directly with the person who would lead your project."
        actions={[
          { to: '#schedule', label: 'Choose a time', cta: 'book-hero-schedule' },
          { to: '/contact', label: 'Prefer to write?', cta: 'book-hero-contact' },
        ]}
        facts={[
          { label: 'Length', value: '30 minutes' },
          { label: 'Cost', value: 'Free' },
          { label: 'With', value: 'Your project lead' },
          { label: 'Or call', value: <a className="contact-fact-link" href="tel:+12145314427">+1 214-531-4427</a> },
        ]}
      />

      <SplitSection
        id="schedule"
        label="Schedule"
        lead="Choose a time"
        emphasis="that works."
        intro="Confirmation and a calendar invite arrive by email."
        aside={
          <div className="mt-space-l">
            <p className="phase__meta">What we will cover</p>
            <div className="mt-space-s"><StepList steps={AGENDA} /></div>
          </div>
        }
      >
        <div className="contact-panel">
          <SchedulerWidget />
        </div>
      </SplitSection>
    </>
  );
}
