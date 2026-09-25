import React from 'react';
import { Code, Rocket, Search, TrendingUp } from 'lucide-react';
import SEO from '@/components/SEO.jsx';
import { SERVICES } from '@/data/services.js';
import { CtaBand, Faq, InnerHero, LinkCards, SplitSection } from '@/components/inner/InnerKit.jsx';
import { SectionHeading } from '@/components/system/Section.jsx';

const PHASES = [
  {
    week: 'Week 1',
    phase: 'Discovery & Strategy',
    icon: Search,
    description: 'We dive deep into understanding your business, challenges, and goals.',
    activities: [
      'Initial consultation and needs assessment',
      'Business process analysis',
      'Goal setting and KPI definition',
      'Technology stack evaluation',
      'Project roadmap creation',
    ],
  },
  {
    week: 'Weeks 2-6',
    phase: 'Development & Creation',
    icon: Code,
    description: 'We build your solution with regular check-ins and updates.',
    activities: [
      'Custom feature implementation',
      'AI model development where it fits',
      'Integration with existing systems',
      'Quality assurance testing',
      'Regular progress updates',
    ],
  },
  {
    week: 'Weeks 6-7',
    phase: 'Testing & Launch',
    icon: Rocket,
    description: 'Rigorous testing makes sure everything works before going live.',
    activities: [
      'Comprehensive system testing',
      'User acceptance testing',
      'Performance optimization',
      'Deployment to production',
      'Team training and handoff',
    ],
  },
  {
    week: 'Ongoing',
    phase: 'Support & Optimization',
    icon: TrendingUp,
    description: 'Continuous monitoring and improvements after launch.',
    activities: [
      'Performance monitoring',
      'Regular updates and improvements',
      'Technical support',
      'Feature enhancements',
      'Quarterly strategy reviews',
    ],
  },
];

const FAQS = [
  {
    q: 'How long does a typical project take?',
    a: 'Timelines depend on scope. Visual content can be ready in 2-4 weeks, while a custom AI application may take 6-12 weeks. You get a detailed timeline during discovery.',
  },
  {
    q: 'What happens during the discovery phase?',
    a: 'We talk through your goals, analyze your current processes, define clear goals and measures of success, review your technology, and write a project roadmap, so we build exactly what you need.',
  },
  {
    q: 'Can I make changes during development?',
    a: 'Yes. Regular check-ins mean small adjustments can happen throughout. Larger scope changes may affect timeline and budget, and we discuss those openly before anything moves.',
  },
  {
    q: 'What kind of support do you provide after launch?',
    a: 'Performance monitoring, regular updates, technical help, feature enhancements and quarterly strategy reviews. Support is shaped around what you need; websites can also move onto a monthly maintenance plan.',
  },
  {
    q: 'Do you provide training for our team?',
    a: 'Yes. Handoff includes documentation, recorded walkthroughs and live training, so your team is confident running the new system.',
  },
  {
    q: 'How do you keep a project on track?',
    a: 'Clear milestones, regular communication, quality assurance testing and agreed measures of success, all led by the same senior person from the first call to launch.',
  },
];

function PhaseStack() {
  return (
    <div className="phase-stack">
      {PHASES.map((p, i) => {
        const Icon = p.icon;
        return (
          <article key={p.phase} className="phase" style={{ top: `calc(104px + ${i * 22}px)`, zIndex: i + 1 }}>
            <div className="phase__head">
              <span className="phase__icon" aria-hidden="true"><Icon size={26} strokeWidth={1.6} /></span>
              <div>
                <p className="phase__meta">{String(i + 1).padStart(2, '0')} / {String(PHASES.length).padStart(2, '0')} · {p.week}</p>
                <h3>{p.phase}</h3>
              </div>
            </div>
            <p>{p.description}</p>
            <ul className="inner-ticks">
              {p.activities.map((a) => <li key={a}>{a}</li>)}
            </ul>
          </article>
        );
      })}
    </div>
  );
}

export default function HowItWorksPage() {
  return (
    <>
      <SEO
        title="How We Work | Discovery to Launch | EVOBRAND"
        description="EVOBRAND's four-phase delivery process: Discovery & Strategy, Development, Testing & Launch, and ongoing Optimization. Typical timelines from 2 to 12 weeks."
        keywords="AI implementation process, project timeline, web development process, AI development agency, EVOBRAND process"
        canonical="https://evobrand.net/how-it-works"
        structuredData={{
          '@context': 'https://schema.org',
          '@type': 'HowTo',
          name: 'How EVOBRAND delivers a project',
          description: "EVOBRAND's four-phase delivery process.",
          step: PHASES.map((p) => ({ '@type': 'HowToStep', name: p.phase, text: p.description })),
        }}
      />

      <InnerHero
        crumbs={[{ label: 'About', to: '/about' }, { label: 'How we work' }]}
        label="Discovery · Launch · Beyond"
        lead="Clear steps."
        emphasis="Shared visibility."
        intro="You always know what we are making, what comes next, and where your feedback fits. The same senior lead runs every phase."
        actions={[
          { to: '/book-consultation', label: 'Start with discovery', cta: 'process-hero-call' },
          { to: '#faq', label: 'Common questions', cta: 'process-hero-faq' },
        ]}
        facts={[
          { label: 'Phases', value: 'Four, from discovery to ongoing support' },
          { label: 'Timelines', value: '2 to 12 weeks, by service' },
          { label: 'Check-ins', value: 'Regular, with working previews' },
          { label: 'Handoff', value: 'Documentation and live training' },
        ]}
        jumps={[
          { href: '#phases', label: 'The four phases' },
          { href: '#timelines', label: 'Timelines by service' },
          { href: '#faq', label: 'FAQ' },
        ]}
      />

      <section id="phases" className="evo-block evo-block--ink" aria-labelledby="phases-heading">
        <div className="evo-container inner-split__grid">
          <div className="inner-split__head">
            <SectionHeading
              id="phases-heading"
              label="The four phases"
              lead="Each phase builds"
              emphasis="on the last."
              intro="Scroll through the phases. Every one ends with something you can see and respond to."
            />
          </div>
          <PhaseStack />
        </div>
      </section>

      <SplitSection
        id="timelines"
        tone="slate"
        label="Timelines by service"
        lead="How long it takes"
        emphasis="depends on what we build."
        intro="Typical ranges. Your exact timeline comes out of discovery."
      >
        <LinkCards
          columns={2}
          items={SERVICES.map((s) => ({
            to: `/services/${s.slug}`,
            icon: s.icon,
            meta: s.timeline,
            title: s.title,
            body: s.menuBlurb,
            cta: 'Explore the service',
          }))}
        />
      </SplitSection>

      <SplitSection
        id="faq"
        tone="ink"
        label="Questions"
        lead="What people ask"
        emphasis="before we start."
      >
        <Faq items={FAQS} />
      </SplitSection>

      <CtaBand
        label="Start with discovery"
        lead="One conversation"
        emphasis="to map the work."
        intro="Book a thirty-minute strategy call. You will leave with a clearer picture of scope, timeline and where to begin."
      />
    </>
  );
}
