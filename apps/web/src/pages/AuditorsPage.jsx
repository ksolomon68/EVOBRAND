import React, { useRef } from 'react';
import { Sparkles, Accessibility, ArrowRight } from 'lucide-react';
import SEO from '@/components/SEO.jsx';
import { CtaBand, InnerHero, LinkCards, SplitSection, useStaggerReveal } from '@/components/inner/InnerKit.jsx';
import { ButtonLink } from '@/components/system/Section.jsx';

const TOOLS = [
  {
    to: '/auditor',
    icon: Sparkles,
    eyebrow: 'Free · AI-Powered',
    title: 'Brand Auditor',
    description:
      "Get an honest AI-generated brand score in under 4 minutes. A 5-category breakdown, real competitor comparison, and a personalized 90-day action plan.",
    bullets: ['Live website & Google presence scan', 'Competitive comparison table', '90-day roadmap + ROI-sized recommendations'],
    cta: 'Start Brand Audit',
  },
  {
    to: '/accessibility-checker',
    icon: Accessibility,
    eyebrow: 'Free · Real WCAG Scan',
    title: 'Accessibility Checker',
    description:
      'Scan your website against WCAG 2.1 in under a minute. Real Lighthouse audit data, severity-ranked issues, and a 90-day remediation plan.',
    bullets: ['Real, machine-detected WCAG findings', 'Perceivable / Operable / Understandable / Robust breakdown', 'Quick wins + 90-day remediation plan'],
    cta: 'Check Accessibility',
  },
];

function ToolCards() {
  const ref = useRef(null);
  useStaggerReveal(ref);
  return (
    <div ref={ref} className="tool-grid">
      {TOOLS.map((tool, i) => {
        const Icon = tool.icon;
        return (
          <article key={tool.to} className="tool-card" data-reveal-item>
            <div className="tool-card__top">
              <span className="phase__icon" aria-hidden="true"><Icon size={26} strokeWidth={1.6} /></span>
              <span className="tool-card__num" aria-hidden="true">0{i + 1}</span>
            </div>
            <p className="phase__meta">{tool.eyebrow}</p>
            <h2 className="tool-card__title">{tool.title}</h2>
            <p className="tool-card__text">{tool.description}</p>
            <ul className="inner-ticks">
              {tool.bullets.map((b) => <li key={b}>{b}</li>)}
            </ul>
            <ButtonLink to={tool.to} data-cta={`tools-${tool.to.slice(1)}`}>
              {tool.cta} <ArrowRight size={16} aria-hidden="true" />
            </ButtonLink>
          </article>
        );
      })}
    </div>
  );
}

const AuditorsPage = () => (
  <>
    <SEO
      title="Free Audit Tools | Brand & Accessibility Scans | EVOBRAND"
      description="Two free audit tools from EVOBRAND: a brand auditor that scores your digital presence, and an accessibility checker that scans your site against WCAG 2.1. Instant results, no sign-up."
      keywords="free brand audit, accessibility checker, WCAG checker, AI audit tools, EVOBRAND auditors"
      canonical="https://evobrand.net/auditors"
      structuredData={{
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: 'EVOBRAND Auditors',
        url: 'https://evobrand.net/auditors',
        description: 'Free AI-powered brand and accessibility audit tools from EVOBRAND.',
      }}
    />

    <InnerHero
      crumbs={[{ label: 'Free tools' }]}
      label="Free · Instant · No sign-up"
      lead="Know where"
      emphasis="you actually stand."
      intro="Two free diagnostic scanners. Get actionable scores, competitor benchmarks and a 90-day plan in a few minutes."
      actions={[
        { to: '/auditor', label: 'Start the brand audit', cta: 'tools-hero-brand' },
        { to: '/accessibility-checker', label: 'Check accessibility', cta: 'tools-hero-a11y' },
      ]}
      facts={[
        { label: 'Time', value: 'Results in minutes' },
        { label: 'Cost', value: 'Free, no sign-up' },
        { label: 'Privacy', value: 'Your data stays private' },
        { label: 'Delivery', value: 'Reports emailed to you' },
      ]}
    />

    <section className="evo-block evo-block--ink" aria-label="Tools">
      <div className="evo-container">
        <ToolCards />
      </div>
    </section>

    <SplitSection
      id="next"
      tone="slate"
      label="After the scan"
      lead="Found something?"
      emphasis="We can fix it."
      intro="Every report comes with a plan. If you would rather hand it off, these are the services that pick it up."
    >
      <LinkCards
        columns={2}
        items={[
          { to: '/services/wcag-accessibility', icon: Accessibility, meta: 'From $2,500', title: 'WCAG accessibility', body: 'Audit, remediation, screen reader testing and ongoing compliance.', cta: 'Explore the service' },
          { to: '/services/web-development', icon: Sparkles, meta: 'From $3,000', title: 'Website rebuild', body: 'Websites and portals shaped around the decisions people need to make.', cta: 'Explore the service' },
        ]}
      />
    </SplitSection>

    <CtaBand
      label="Talk it through"
      lead="Turn the report"
      emphasis="into a plan."
      intro="Bring your results to a thirty-minute strategy call. We will walk through what matters most and what it would take."
    />
  </>
);

export default AuditorsPage;
