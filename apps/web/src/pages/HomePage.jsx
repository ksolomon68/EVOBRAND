import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import SEO from '@/components/SEO.jsx';
import Preloader from '@/components/cinematic/Preloader.jsx';
import CinematicHero from '@/components/cinematic/CinematicHero.jsx';
import WorkReel from '@/components/cinematic/WorkReel.jsx';
import SectionWipe from '@/components/cinematic/SectionWipe.jsx';
import {
  ButtonLink,
  Eyebrow,
  ProofLedger,
  Section,
  SectionHeading,
} from '@/components/system/Section.jsx';

const IMG = '/projects/optimized';

const PROJECTS = [
  {
    title: 'PrimeReach',
    type: 'Government contracting',
    description: 'A platform connecting prime contractors with qualified small businesses for transportation and infrastructure work.',
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
    description: 'A program operations hub for participant records, cohorts, contractors, stipends, and placement tracking.',
    url: 'https://evobrandconcepts.com/rbca1/rbca-portal.html',
    image: `${IMG}/rbca-portal-1024.webp`,
    width: 1024,
    height: 544,
    alt: 'RBCA Workforce Portal dashboard',
  },
  {
    title: 'Pivotal Voice',
    type: 'Civic engagement',
    description: 'A public platform connecting Ellis County residents with the local information that matters.',
    url: 'https://pivotalvoice.org/',
    image: `${IMG}/pivotal-voice-960.webp`,
    width: 960,
    height: 457,
    alt: 'Pivotal Voice civic platform home page',
  },
];

const CAPABILITIES = [
  {
    index: '01',
    label: 'Websites & portals',
    title: 'Make the experience easier to choose—and easier to use.',
    body: 'Accessible websites and client portals shaped around the decisions people actually need to make.',
  },
  {
    index: '02',
    label: 'Applications & automation',
    title: 'Turn scattered work into one clear operating system.',
    body: 'Custom applications, connected workflows, and practical AI tools built around how your team works.',
  },
  {
    index: '03',
    label: 'Brand & creative',
    title: 'Build a presence people recognize before they read the name.',
    body: 'Identity, visual systems, content, video, and motion that make every touchpoint feel like the same organization.',
  },
];

const PROCESS = [
  ['Understand the work', 'We map the goal, the people involved, and the friction getting in their way.'],
  ['Set the direction', 'We turn the problem into a clear scope, visual direction, milestones, and measures of success.'],
  ['Build in the open', 'You see the work as it develops, respond at the right moments, and launch with shared confidence.'],
];

export default function HomePage() {
  return (
    <>
      <SEO
        title="Websites, AI & Automation for Your Business"
        description="EVOBRAND builds websites, custom applications, and practical AI workflows for businesses and organizations. Based in Italy, Texas. Serving clients nationwide."
        canonical="https://evobrand.net/"
      />
      <Preloader />

      <CinematicHero
        eyebrow="EVOBRAND Concepts · Strategy, design & technology"
        lead="Better systems."
        emphasis="A stronger brand."
        intro="Websites, custom applications, and AI workflows that make your organization easier to run—and easier to choose."
        primary={{ to: '/book-consultation', label: 'Book a strategy call', cta: 'hero-strategy' }}
        secondary={{ to: '/our-work', label: 'See the work', cta: 'hero-work' }}
        media={{
          src: `${IMG}/caltrans-1900.webp`,
          srcSet: `${IMG}/caltrans-960.webp 960w, ${IMG}/caltrans-1900.webp 1900w`,
          width: 1898,
          height: 909,
          alt: 'Caltrans BizConnect digital platform home page',
          label: 'Inside the work · Public sector',
          title: 'Caltrans BizConnect',
          caption: 'A statewide digital platform helping small businesses prepare for transportation contracting.',
        }}
      />

      <WorkReel
        label="Selected work"
        lead="Built for real people."
        emphasis="Put to work every day."
        intro="Digital platforms for contracting, membership, workforce development, and civic participation."
        projects={PROJECTS}
        footer={
          <>
            <Eyebrow>The wider portfolio</Eyebrow>
            <p className="evo-intro">Explore more websites, operational platforms, and working product demos.</p>
            <ButtonLink to="/our-work" variant="secondary">
              See all work <ArrowRight size={16} aria-hidden="true" />
            </ButtonLink>
          </>
        }
      />

      <SectionWipe>
        <Section
          tone="navy"
          label="The record"
          lead="Experience you can verify."
          emphasis="Work you can open."
          intro="Senior-led from the first conversation through launch, with a track record spanning public, private, and nonprofit work."
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

      <Section id="capabilities" tone="ink" className="studio-capabilities">
        <div className="studio-capabilities__heading">
          <SectionHeading
            label="What we build"
            lead="Start with the problem."
            emphasis="Build the right system."
            intro="Strategy, design, and technology stay connected, so the finished work is useful—not merely impressive."
          />
          <ButtonLink to="/services" variant="secondary">
            Explore services <ArrowRight size={16} aria-hidden="true" />
          </ButtonLink>
        </div>

        <div className="studio-capability-list">
          {CAPABILITIES.map((item) => (
            <Link className="studio-capability" to="/services" key={item.index}>
              <span className="studio-capability__index" aria-hidden="true">{item.index}</span>
              <div>
                <Eyebrow>{item.label}</Eyebrow>
                <h3>{item.title}</h3>
              </div>
              <p>{item.body}</p>
              <span className="studio-capability__arrow" aria-hidden="true"><ArrowUpRight size={22} /></span>
            </Link>
          ))}
        </div>
      </Section>

      <SectionWipe>
        <Section id="process" tone="slate" className="studio-process">
          <div className="studio-process__grid">
            <SectionHeading
              label="Working together"
              lead="Clear steps."
              emphasis="Shared visibility."
              intro="You always know what we are making, what comes next, and where your feedback fits."
            >
              <ButtonLink to="/how-it-works" variant="secondary">
                How we work <ArrowRight size={16} aria-hidden="true" />
              </ButtonLink>
            </SectionHeading>

            <ol className="studio-process__list">
              {PROCESS.map(([title, body], index) => (
                <li key={title}>
                  <span aria-hidden="true">0{index + 1}</span>
                  <div>
                    <h3>{title}</h3>
                    <p>{body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </Section>
      </SectionWipe>

      <Section tone="deep" className="studio-closing">
        <div className="studio-closing__grid">
          <SectionHeading
            display
            label="Start a conversation"
            lead="What is getting in"
            emphasis="your team’s way?"
            intro="Bring the idea, the bottleneck, or the next big project. We will help you find a practical place to start."
          />
          <div className="studio-closing__action">
            <ButtonLink to="/book-consultation" data-cta="closing-strategy">
              Book a strategy call <ArrowRight size={16} aria-hidden="true" />
            </ButtonLink>
            <p>Based in Italy, Texas.<br />Serving clients nationwide.</p>
          </div>
        </div>
      </Section>
    </>
  );
}
