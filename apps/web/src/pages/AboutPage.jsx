import React from 'react';
import { Award, Lightbulb, Route, Target, Users } from 'lucide-react';
import SEO from '@/components/SEO.jsx';
import { CtaBand, InnerHero, LinkCards, SplitSection, StepList, useStaggerReveal } from '@/components/inner/InnerKit.jsx';
import { ProofLedger, SectionHeading } from '@/components/system/Section.jsx';

const CORE_VALUES = [
  { icon: Target, title: 'Plain answers', body: 'Clear scope, honest timelines, and written decisions. You always know where the project stands.' },
  { icon: Users, title: 'Senior-led', body: 'The person who scopes the work stays on it through launch and after.' },
  { icon: Lightbulb, title: 'Built to be run', body: 'We design systems your staff can operate after we hand them over, not just launch.' },
  { icon: Award, title: 'Accountable', body: 'Every project starts with agreed outcomes, and we report against them.' },
];

// TODO(content): add the certifying agency, certificate number and expiration
// for each certification. Leave `agency` empty to hide that line on the page.
const CERTIFICATIONS = [
  { code: 'SBE', title: 'Small Business Enterprise', agency: '' },
  { code: 'WBE', title: "Women's Business Enterprise", agency: '' },
  { code: 'MBE', title: 'Minority Business Enterprise', agency: '' },
];

const HISTORY = [
  // TODO(content): the original business name, if you want it mentioned.
  { meta: '1999', title: 'The foundation', body: 'The business started in 1999 as a creative agency doing brand and digital work.' },
  { meta: '2010', title: 'EVOBRAND Concepts', body: 'In 2010 the business moved to Italy, Texas, in the DFW area, and became EVOBRAND Concepts LLC.' },
  { meta: 'Today', title: 'Full-stack delivery', body: 'A full-stack digital agency for government agencies, corporations, and nonprofits. Strategy, design, development, and the platforms that keep programs running, including ChamberCore and PrimeReach.' },
];

function Values() {
  const ref = React.useRef(null);
  useStaggerReveal(ref);
  return (
    <ul ref={ref} className="value-grid">
      {CORE_VALUES.map(({ icon: Icon, title, body }) => (
        <li key={title} data-reveal-item>
          <span className="mega-link__icon" aria-hidden="true"><Icon size={20} strokeWidth={1.6} /></span>
          <h3>{title}</h3>
          <p>{body}</p>
        </li>
      ))}
    </ul>
  );
}

export default function AboutPage() {
  return (
    <>
      <SEO
        title="About EVOBRAND Concepts"
        description="EVOBRAND Concepts is a full-stack digital agency led by Keisha Solomon, with 25+ years of work for government agencies, corporations, and nonprofits. SBE, WBE, and MBE certified. Based in Italy, Texas."
        keywords="about EVOBRAND Concepts, Keisha Solomon, digital agency Texas, SBE WBE MBE certified agency, government web development"
        canonical="https://evobrand.net/about"
        structuredData={{
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: 'EVOBRAND Concepts LLC',
          url: 'https://evobrand.net',
          logo: 'https://evobrand.net/logo.png',
          foundingDate: '1999',
          description: 'Full-stack digital agency serving government agencies, corporations, and nonprofits.',
          email: 'info@evobrand.net',
          telephone: '+1-214-531-4427',
          address: { '@type': 'PostalAddress', addressLocality: 'Italy', addressRegion: 'TX', addressCountry: 'US' },
          founder: { '@type': 'Person', name: 'Keisha Solomon' },
          sameAs: ['https://www.linkedin.com/company/evobrand-concepts/'],
        }}
      />

      <InnerHero
        crumbs={[{ label: 'About' }]}
        label="Since 1999 · Italy, Texas"
        lead="Full-stack digital agency."
        emphasis="Senior-led for 25+ years."
        intro="EVOBRAND Concepts plans, designs, and builds websites, platforms, and brand systems for government agencies, corporations, and nonprofits."
        actions={[
          { to: '/book-consultation', label: 'Book a strategy call', cta: 'about-hero-call' },
          { to: '/our-work', label: 'See the work', cta: 'about-hero-work' },
        ]}
        facts={[
          { label: 'Established', value: '1999' },
          { label: 'Based in', value: 'Italy, Texas · DFW' },
          { label: 'Certified', value: 'SBE · WBE · MBE' },
          { label: 'Clients', value: 'Public, private and nonprofit' },
        ]}
        jumps={[
          { href: '#story', label: 'Our story' },
          { href: '#values', label: 'How we work' },
          { href: '#leadership', label: 'Leadership' },
          { href: '#certifications', label: 'Certifications' },
        ]}
      />

      <SplitSection
        id="story"
        label="Our story"
        lead="Twenty-five years in,"
        emphasis="still led by the founder."
        intro="The work has changed shape many times. Who leads it has not."
      >
        <StepList steps={HISTORY} />
      </SplitSection>

      <section id="values" className="evo-block evo-block--slate" aria-labelledby="values-heading">
        <div className="evo-container">
          <SectionHeading
            id="values-heading"
            label="How we work"
            lead="Four promises"
            emphasis="we keep on every project."
          />
          <div className="mt-space-xl"><Values /></div>
        </div>
      </section>

      <SplitSection
        id="leadership"
        tone="deep"
        label="Leadership"
        lead="Keisha Solomon,"
        emphasis="Founder."
      >
        {/* TODO(content): headshot and a short bio for Keisha Solomon. */}
        <div className="inner-prose">
          <p className="inner-quote">Keisha has led the business since 1999 and leads every EVOBRAND engagement directly.</p>
          <p>
            That means the person you meet in the first conversation is the person who scopes the work,
            makes the design decisions, and stays accountable after launch.
          </p>
        </div>
      </SplitSection>

      <section id="certifications" className="evo-block evo-block--navy" aria-labelledby="cert-heading">
        <div className="evo-container">
          <SectionHeading
            id="cert-heading"
            label="Certifications"
            lead="Certified to work"
            emphasis="where the work is."
            intro="EVOBRAND Concepts holds small, women-owned, and minority-owned business certifications."
          />
          <div className="mt-space-xl">
            <ProofLedger
              items={CERTIFICATIONS.map((c) => ({ value: c.code, label: c.agency ? `${c.title} · ${c.agency}` : c.title }))}
            />
          </div>
        </div>
      </section>

      <SplitSection
        id="next"
        label="Keep exploring"
        lead="See how we work,"
        emphasis="then see the results."
      >
        <LinkCards
          columns={2}
          items={[
            { to: '/how-it-works', icon: Route, meta: 'Process', title: 'How we work', body: 'Discovery to launch and beyond, with clear milestones and shared visibility.', cta: 'See the process' },
            { to: '/our-work', icon: Award, meta: 'Portfolio', title: 'Our work', body: 'Platforms for contracting, membership, workforce development and civic participation.', cta: 'See the work' },
          ]}
        />
      </SplitSection>

      <CtaBand
        label="Start a project"
        lead="Tell us what you are"
        emphasis="working on."
        intro="We will set up a call, map the problem with you, and give you a clear scope and timeline."
      />
    </>
  );
}
