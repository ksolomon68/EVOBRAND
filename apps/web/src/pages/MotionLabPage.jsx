import React from 'react';
import SEO from '@/components/SEO.jsx';
import Preloader from '@/components/cinematic/Preloader.jsx';
import CinematicHero from '@/components/cinematic/CinematicHero.jsx';
import WorkReel from '@/components/cinematic/WorkReel.jsx';
import SectionWipe from '@/components/cinematic/SectionWipe.jsx';
import { Section, SectionHeading, ProofLedger, ButtonLink } from '@/components/system/Section.jsx';

// Prototype of the cinematic homepage. Not linked from the site and not indexed.
// Every project fact below comes from copy already on the site.

const IMG = '/projects/optimized';

const PROJECTS = [
  {
    title: 'PrimeReach',
    type: 'Government contracting',
    description: 'A white-label platform that connects prime contractors with qualified small businesses, built for transportation and infrastructure agencies.',
    url: 'https://primereachgov.com/',
    image: `${IMG}/primereach-1024.webp`,
    width: 1024,
    height: 506,
    alt: 'PrimeReach platform home page',
  },
  {
    title: 'ChamberCore',
    type: 'Membership and operations',
    description: 'One place for membership, dues, events, governance, and the day-to-day work of a chamber.',
    url: 'https://chambercore.net',
    image: `${IMG}/chambercore-1024.webp`,
    width: 1024,
    height: 495,
    alt: 'ChamberCore platform home page',
  },
  {
    title: 'RBCA Workforce Portal',
    type: 'Workforce development',
    description: 'Operations hub for a 5-week workforce program: participant records, cohorts, contractor network, stipends, and placement tracking.',
    url: 'https://evobrandconcepts.com/rbca1/rbca-portal.html',
    image: `${IMG}/rbca-portal-1024.webp`,
    width: 1024,
    height: 544,
    alt: 'RBCA Workforce Portal dashboard',
  },
  {
    title: 'Pivotal Voice',
    type: 'Civic engagement',
    description: 'A public platform connecting Ellis County residents with civic information.',
    url: 'https://pivotalvoice.org/',
    image: `${IMG}/pivotal-voice-960.webp`,
    width: 960,
    height: 457,
    alt: 'Pivotal Voice civic platform home page',
  },
];

export default function MotionLabPage() {
  return (
    <>
      <SEO title="Motion lab" noindex canonical="https://evobrand.net/motion-lab" />
      <Preloader />

      <CinematicHero
        eyebrow="EVOBRAND Concepts · Italy, Texas"
        lead="Digital systems"
        emphasis="for public work."
        intro="A senior-led, full-stack agency for government agencies, corporations, and nonprofits. SBE, WBE, and MBE certified. In operation since 1999."
        primary={{ to: '/contact', label: 'Start a project', cta: 'hero-start' }}
        secondary={{ to: '/our-work', label: 'See the work', cta: 'hero-work' }}
        media={{
          src: `${IMG}/caltrans-1900.webp`,
          srcSet: `${IMG}/caltrans-960.webp 960w, ${IMG}/caltrans-1900.webp 1900w`,
          width: 1898,
          height: 909,
          alt: 'Caltrans BizConnect home page: Build. Compete. Win.',
          label: 'Inside the work',
          title: 'Caltrans BizConnect',
          caption: 'Statewide supportive services that help small businesses get ready for transportation contracting.',
        }}
      />

      <WorkReel
        label="Selected work"
        lead="Platforms that"
        emphasis="carry real programs."
        intro="Government contracting, membership operations, workforce development, and civic information."
        projects={PROJECTS}
        footer={
          <>
            <p className="evo-intro">More platforms, websites, and live demos on the work page.</p>
            <ButtonLink to="/our-work" variant="secondary">See all work</ButtonLink>
          </>
        }
      />

      <SectionWipe>
        <Section
          tone="navy"
          label="The record"
          lead="Proof before"
          emphasis="promises."
          intro="Certified, established, and led by the person who started it."
        >
          <ProofLedger
            items={[
              { value: '1999', label: 'Established' },
              { value: 25, suffix: '+ years', label: 'In operation', count: true },
              { value: 'SBE · WBE · MBE', label: 'Certified' },
              { value: 'Public · Private · Nonprofit', label: 'Client sectors' },
            ]}
          />
        </Section>
      </SectionWipe>

      <Section tone="ink">
        <SectionHeading
          display
          label="Start a project"
          lead="Tell us what"
          emphasis="needs to work."
          intro="We will set up a call, map the problem, and give you a clear scope and timeline."
        >
          <div className="mt-space-s flex flex-wrap gap-space-s">
            <ButtonLink to="/contact" data-cta="closing-start">Start a project</ButtonLink>
            <ButtonLink to="/our-work" variant="secondary" data-cta="closing-work">See the work</ButtonLink>
          </div>
        </SectionHeading>
      </Section>
    </>
  );
}
