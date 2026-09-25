import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, Workflow, PanelsTopLeft, Palette } from 'lucide-react';
import SEO from '@/components/SEO.jsx';

const work = [
  {
    title: 'Chamber Core',
    type: 'Membership & operations',
    image: '/projects/chamberos.png',
    url: 'https://chambercore.net',
    caption: 'From scattered tasks to one workspace.',
    description: 'One place for membership, dues, events, and the day-to-day work of a chamber.',
  },
  {
    title: 'PrimeReach',
    type: 'Government contracting',
    image: '/projects/primereach.png',
    url: 'https://primereachgov.com/',
    caption: 'Connecting prime contractors with qualified small businesses.',
    description: 'A platform that connects prime contractors with qualified small businesses.',
  },
  {
    title: 'The AI Executive Sandbox',
    type: 'Executive AI & leadership',
    image: '/projects/keishasolomon.png',
    url: 'https://keishasolomon.com/',
    caption: 'Build deployable AI assets in every session.',
    description: 'Applied AI cohort where business leaders build deployable AI assets, workflows, and pipelines.',
  },
  {
    title: 'Pivotal Voice',
    type: 'Community & civic engagement',
    image: '/projects/pivotal-voice.jpg',
    url: 'https://pivotalvoice.org/',
    caption: 'Connecting residents with the civic information that matters.',
    description: 'A public platform connecting Ellis County residents with civic information.',
  },
];

// Dashboard demos shown in the homepage "Selected work" section: sourced from OurWorkPage
const demos = [
  {
    title: 'EVOCORE',
    subtitle: 'Dual-Screen Simulator',
    type: 'Custom business dashboard',
    image: '/projects/evocore.jpeg',
    url: 'https://evobrandconcepts.com/evocore/',
    description: 'Interactive simulator showing how the Mobile Crew App and Admin Portal sync in real-time: dispatch, job costing, payroll, and live revenue.',
  },
  {
    title: 'RBCA Workforce Portal',
    subtitle: 'Second Chance & Community Hub',
    type: 'Workforce & education platform',
    image: '/projects/rbca-portal.png',
    url: 'https://evobrandconcepts.com/rbca1/rbca-portal.html',
    description: 'All-in-one workforce operations hub: 5-week cohort lifecycle, participant database, contractor network, stipend disbursements, and placement analytics.',
  },
  {
    title: 'NOVA Transformation Portal',
    subtitle: 'Employer & Digital Growth Hub',
    type: 'Client portal & AI audit',
    image: '/projects/nova.png',
    url: 'https://evobrand.net/nova/',
    description: 'Small business portal with automated digital audits, step-by-step transformation roadmaps, virtual 1-on-1 coaching, and priority growth resources.',
  },
];


const services = [
  {
    icon: Workflow,
    title: 'Make everyday work easier.',
    label: 'AI & automation',
    body: 'Connect your tools, reduce repetitive tasks, and build AI assistants around the way your team works.',
    detail: 'Custom applications · Connected workflows · Document tools',
  },
  {
    icon: PanelsTopLeft,
    title: 'Give people a better experience.',
    label: 'Websites & client portals',
    body: 'Create a website or portal that makes it easy for people to find information, take action, and work with you.',
    detail: 'Web development · Client portals · Accessibility reviews',
  },
  {
    icon: Palette,
    title: 'Make your brand unmistakable.',
    label: 'Brand & creative',
    body: 'Bring your identity, content, and visuals together so every interaction feels like the same business.',
    detail: 'Brand identity · Visual content · Video & motion',
  },
];

export default function HomePage() {
  // Randomly pick a featured project on each page load; stable across re-renders
  const featured = useMemo(() => work[Math.floor(Math.random() * work.length)], []);

  return (
    <>
      <SEO
        title="Websites, AI & Automation for Your Business"
        description="EVOBRAND builds websites, custom applications, and practical AI workflows for businesses and organizations. Based in Italy, Texas. Serving clients nationwide."
        canonical="https://evobrand.net/"
      />
      <div className="evo-home">

        {/* ── Hero ── */}
        <section className="evo-hero evo-wrap">
          <div className="evo-hero-copy">
            <p className="portal-eyebrow">EVOBRAND Concepts · Strategy, design & technology</p>
            <h1>Better systems.<br /><span>A stronger brand.</span></h1>
            <p className="evo-lead">
              Websites, custom applications, and AI workflows that make your business easier to run and easier to choose.
            </p>
            <div className="evo-actions">
              <Link className="evo-button" to="/book-consultation">Book a strategy call <ArrowRight size={17} /></Link>
              <Link className="evo-link" to="/our-work">View our work <ArrowUpRight size={17} /></Link>
            </div>
            <p className="evo-hero-note">Based in Italy, Texas. Serving clients nationwide.</p>
          </div>

          {/* Hero feature card: randomly rotates through flagship projects on each page load */}
          <a
            href={featured.url}
            target="_blank"
            rel="noopener noreferrer"
            className="evo-feature"
            aria-label={`Visit ${featured.title}, an EVOBRAND project`}
          >
            <div className="evo-feature-top"><span>Inside the work</span><ArrowUpRight size={18} /></div>
            <img src={featured.image} alt={`${featured.title} website preview`} />
            <div className="evo-feature-caption">
              <strong>{featured.caption}</strong>
              <span>{featured.title} · {featured.type}</span>
            </div>
          </a>
        </section>

        {/* ── Selected Work: Dashboard Demos ── */}
        <section className="evo-section evo-work" aria-labelledby="work-title">
          <div className="evo-wrap">
            <div className="evo-section-heading">
              <div>
                <p className="portal-eyebrow">Selected work</p>
                <h2 id="work-title">Built for real people.<br />Put to work every day.</h2>
              </div>
              <Link className="evo-link" to="/our-work#dashboard-demos">See all demos <ArrowUpRight size={17} /></Link>
            </div>
            <div className="evo-work-grid">
              {demos.map((item) => (
                <a
                  className="evo-work-item"
                  href={item.url}
                  key={item.title}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <div className="evo-work-image">
                    <img src={item.image} alt={`${item.title} dashboard demo`} loading="lazy" />
                  </div>
                  <p className="portal-eyebrow">{item.type}</p>
                  <h3>{item.title}<ArrowUpRight size={20} /></h3>
                  <p className="evo-work-subtitle">{item.subtitle}</p>
                  <p>{item.description}</p>
                  <span className="sr-only">Launch live demo (opens in a new tab)</span>
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* ── Services ── */}
        <section className="evo-section evo-wrap" aria-labelledby="services-title">
          <div className="evo-section-heading">
            <div>
              <p className="portal-eyebrow">How we can help</p>
              <h2 id="services-title">Start with the problem.<br />Build the right solution.</h2>
            </div>
            <Link className="evo-link" to="/services">Explore all services <ArrowRight size={17} /></Link>
          </div>
          <div className="evo-service-grid">
            {services.map(({ icon: Icon, ...service }) => (
              <article key={service.label}>
                <Icon size={25} aria-hidden="true" />
                <p className="portal-eyebrow">{service.label}</p>
                <h3>{service.title}</h3>
                <p>{service.body}</p>
                <p className="evo-service-detail">{service.detail}</p>
              </article>
            ))}
          </div>
        </section>

        {/* ── Process ── */}
        <section className="evo-section evo-process" aria-labelledby="process-title">
          <div className="evo-wrap evo-process-grid">
            <div>
              <p className="portal-eyebrow">Working together</p>
              <h2 id="process-title">Clear steps.<br />Shared visibility.</h2>
              <p>Know what we are building, what comes next, and where your feedback fits.</p>
              <Link className="evo-link" to="/how-it-works">How we work <ArrowRight size={17} /></Link>
            </div>
            <ol>
              {[
                ['Understand your work', 'We talk through your goals, current tools, and the problems slowing your team down.'],
                ['Agree on the plan', 'We define the scope, deliverables, and milestones so you know what to expect.'],
                ['Build, review, and launch', 'You review the work as it develops. Your client workspace keeps projects, meetings, and agreements together.'],
              ].map(([title, body], index) => (
                <li key={title}>
                  <span>0{index + 1}</span>
                  <div><h3>{title}</h3><p>{body}</p></div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="evo-section evo-wrap" aria-labelledby="start-title">
          <div className="evo-closing">
            <div>
              <p className="portal-eyebrow">Let's make it work better</p>
              <h2 id="start-title">What is getting in<br />your team's way?</h2>
              <p>Bring your idea, your bottleneck, or your next big project. We'll help you find a practical place to start.</p>
            </div>
            <Link className="evo-button" to="/book-consultation">Book a strategy call <ArrowRight size={17} /></Link>
          </div>
          <div className="evo-resources">
            <span>Still exploring?</span>
            <Link to="/auditors">Check your brand or website</Link>
            <Link to="/videos">Watch our video library</Link>
            <Link to="/free-demo-portal">Request a custom demo</Link>
          </div>
        </section>

      </div>
    </>
  );
}
