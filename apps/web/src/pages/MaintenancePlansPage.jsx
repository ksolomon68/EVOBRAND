import React, { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Zap, Shield, Star, ArrowRight, Clock, Wrench, Code, FileText, AlertCircle } from 'lucide-react';
import SEO from '@/components/SEO.jsx';
import PublicCheckoutModal from '@/components/PublicCheckoutModal.jsx';
import { CtaBand, InnerHero, SplitSection, useStaggerReveal } from '@/components/inner/InnerKit.jsx';
import { ButtonLink, SectionHeading } from '@/components/system/Section.jsx';

const PLANS = [
  {
    name: 'Basic Support Plan',
    slug: 'basic',
    price: '$129',
    period: '/mo',
    tagline: 'Essential care for growing sites',
    color: '#22c8e5',
    icon: <Shield size={28} />,
    features: [
      'WordPress core, theme & plugin updates',
      'Monthly security scans',
      'Uptime monitoring (24/7)',
      '2 support tickets per month included',
      '48-hour response time',
      'Monthly performance report',
      'Basic malware removal',
      'Additional tickets billed at $85/hr',
    ],
    notIncluded: [
      'Custom development work',
      'Priority response',
      'Emergency fixes',
    ],
    cta: 'Get Basic Plan',
    highlighted: false,
  },
  {
    name: 'Pro Support Plan',
    slug: 'pro',
    price: '$299',
    period: '/mo',
    tagline: 'Full coverage for serious businesses',
    color: '#22c8e5',
    icon: <Zap size={28} />,
    features: [
      'Everything in Basic, plus:',
      'Unlimited support tickets',
      '24-hour priority response',
      'Speed & performance optimization',
      'Advanced security hardening',
      'Database optimization',
      'Staging environment setup',
      'Google Analytics / Tag Manager support',
      '2 hours of minor edits/month included',
    ],
    notIncluded: [
      'Major custom development',
      'Emergency same-day fixes',
    ],
    cta: 'Get Pro Plan',
    highlighted: true,
  },
  {
    name: 'Elite Support Plan',
    slug: 'elite',
    price: '$749',
    period: '/mo',
    tagline: 'White-glove care & dedicated support',
    color: '#E8DDD0',
    icon: <Star size={28} />,
    features: [
      'Everything in Pro, plus:',
      'Priority support tickets (fair-use)',
      'Same-day emergency response (business hours)',
      '4 hours of custom dev work/month',
      'Dedicated account manager',
      'Monthly strategy call (30 min)',
      'WooCommerce / eCommerce support',
      'Content updates & copyedits',
      'Quarterly SEO health check',
      'Priority queue: always first',
    ],
    notIncluded: [],
    cta: 'Get Elite Plan',
    highlighted: false,
  },
];

const ONE_TIME = [
  {
    name: 'Simple Update',
    desc: 'Image, document, or text swap. No coding required.',
    price: '$50–$150',
    icon: <FileText size={20} />,
    turnaround: '1–2 business days',
  },
  {
    name: 'Single Support Ticket',
    desc: 'One targeted fix or technical issue resolved.',
    price: '$149',
    icon: <Wrench size={20} />,
    turnaround: '48-hour turnaround',
  },
  {
    name: 'Urgent Fix',
    desc: 'Critical issue? We jump on it fast.',
    price: '$299',
    icon: <AlertCircle size={20} />,
    turnaround: '24-hour response',
  },
  {
    name: 'Custom Development',
    desc: 'New features, integrations, or bespoke builds.',
    price: '$99/hr',
    icon: <Code size={20} />,
    turnaround: 'Timeline quoted per project',
  },
];

const WHY = [
  {
    title: 'Outdated plugins = hacked sites',
    body: 'Over 90% of WordPress hacks exploit outdated plugins. We keep everything patched before vulnerabilities are exploited.',
  },
  {
    title: 'Downtime costs real money',
    body: 'Every minute your site is down, you\'re losing leads. Our uptime monitoring catches issues before your customers do.',
  },
  {
    title: 'Speed directly affects revenue',
    body: 'A 1-second delay in load time can drop conversions by 7%. We optimize continuously so you stay fast.',
  },
  {
    title: 'You should focus on your business',
    body: 'Website maintenance is technical, time-consuming, and never-ending. Let us handle it so you don\'t have to.',
  },
];

function Reveal({ children, className }) {
  const ref = useRef(null);
  useStaggerReveal(ref);
  return <div ref={ref} className={className}>{children}</div>;
}

export default function MaintenancePlansPage() {
  const [annual, setAnnual] = useState(false);
  const [checkoutPlan, setCheckoutPlan] = useState(null);

  const discountedPrice = (price) => {
    if (price.includes('–') || price.includes('/hr') || price === 'Custom') return price;
    const num = parseInt(price.replace(/\D/g, ''), 10);
    return `$${Math.round(num * 10)}`;
  };

  return (
    <>
      <SEO
        title="WordPress Maintenance & Support Plans | EVOBRAND"
        description="Keep your WordPress site secure, fast, and up to date with EVOBRAND's maintenance plans. Basic, Pro, and Elite tiers, plus pay-as-you-go support tickets."
        canonical="https://evobrand.net/maintenance-plans"
      />

      <InnerHero
        crumbs={[{ label: 'Services', to: '/services' }, { label: 'Maintenance plans' }]}
        label="WordPress maintenance & support"
        lead="Your site, always on."
        emphasis="Always protected."
        intro="We handle the updates, security, backups and fixes, so you can focus on running your organization. Clients on a maintenance plan never pay per ticket."
        actions={[
          { to: '#plans', label: 'Compare plans', cta: 'maint-hero-plans' },
          { to: '/contact', label: 'Ask which plan fits', cta: 'maint-hero-contact' },
        ]}
        facts={[
          { label: 'Plans from', value: '$129 a month' },
          { label: 'Annual billing', value: 'Two months free' },
          { label: 'Monitoring', value: 'Uptime watched around the clock' },
          { label: 'No plan?', value: 'Single fixes from $149' },
        ]}
        jumps={[
          { href: '#plans', label: 'Plans' },
          { href: '#why', label: 'Why it matters' },
          { href: '#one-time', label: 'One-time help' },
        ]}
      />

      <section id="plans" className="evo-block evo-block--ink" aria-labelledby="plans-heading">
        <div className="evo-container">
          <div className="work-section-head">
            <SectionHeading
              id="plans-heading"
              label="Plans"
              lead="Pick the level"
              emphasis="of care you need."
              intro="Every plan covers updates, security and monitoring. Higher tiers add faster response and development hours."
            />
            <div className="billing-switch">
              <span aria-hidden="true" className={annual ? '' : 'is-on'}>Monthly</span>
              <button
                type="button"
                role="switch"
                aria-checked={annual}
                aria-label="Annual billing, save two months"
                onClick={() => setAnnual(!annual)}
              >
                <span />
              </button>
              <span aria-hidden="true" className={annual ? 'is-on' : ''}>Annual <em>2 months free</em></span>
            </div>
          </div>

          <Reveal className="tier-grid">
            {PLANS.map((plan) => (
              <article key={plan.slug} className={`tier ${plan.highlighted ? 'tier--featured' : ''}`} data-reveal-item>
                {plan.highlighted && <span className="tier__flag">Most popular</span>}
                <h3 className="tier__name">{plan.name}</h3>
                <p className="tier__price">
                  <strong>{annual ? discountedPrice(plan.price) : plan.price}</strong>
                  <span>{annual ? 'per year' : 'per month'} · {plan.tagline}</span>
                </p>
                <ul className="inner-ticks">
                  {plan.features.map((f) => <li key={f}>{f}</li>)}
                  {plan.notIncluded.map((f) => <li key={f} className="is-excluded">Not included: {f}</li>)}
                </ul>
                <button
                  type="button"
                  className={`evo-btn ${plan.highlighted ? 'evo-btn--primary' : 'evo-btn--secondary'}`}
                  onClick={() => setCheckoutPlan({
                    planId: `maintenance-${plan.slug}`,
                    planName: plan.name,
                    price: annual ? discountedPrice(plan.price) : plan.price,
                    type: 'recurring',
                    interval: annual ? 'year' : 'month',
                  })}
                >
                  {plan.cta} <ArrowRight size={16} aria-hidden="true" />
                </button>
              </article>
            ))}
          </Reveal>

          <div className="plan-notes">
            <p>Already a maintenance client? <Link to="/client-portal">Log in to your portal</Link>. Tickets are covered by your plan at no extra charge.</p>
            <p>&ldquo;Fair-use&rdquo; support tickets means unlimited requests within reasonable monthly volume, with overages billed at standard hourly rates.</p>
          </div>
        </div>
      </section>

      <SplitSection
        id="why"
        tone="slate"
        label="Why it matters"
        lead="Maintenance"
        emphasis="is not optional."
        intro="Neglecting a site is a liability. Here is what is at stake."
      >
        <Reveal className="value-grid value-grid--2">
          {WHY.map((w) => (
            <div key={w.title} data-reveal-item>
              <h3>{w.title}</h3>
              <p>{w.body}</p>
            </div>
          ))}
        </Reveal>
      </SplitSection>

      <SplitSection
        id="one-time"
        tone="ink"
        label="One-time help"
        lead="Not ready for a plan?"
        emphasis="Pay as you go."
        intro="Pay only for what you need, when you need it."
        aside={<ButtonLink to="/client-portal" variant="secondary">Raise a ticket</ButtonLink>}
      >
        <Reveal className="price-rows">
          {ONE_TIME.map((item) => (
            <div key={item.name} className="price-row" data-reveal-item>
              <span className="mega-link__icon" aria-hidden="true">{item.icon}</span>
              <div>
                <h3>{item.name}</h3>
                <p>{item.desc}</p>
                <p className="price-row__time"><Clock size={12} aria-hidden="true" /> {item.turnaround}</p>
              </div>
              <strong>{item.price}</strong>
            </div>
          ))}
        </Reveal>
      </SplitSection>

      <CtaBand
        label="Maintenance"
        lead="Stop worrying"
        emphasis="about your website."
        intro="Get in touch and we will recommend the right plan, or set you up with a one-time fix today."
        primary={{ to: '/contact', label: 'Get a maintenance plan', cta: 'maint-band-plan' }}
        secondary={{ to: '/client-portal', label: 'Log in to the portal', cta: 'maint-band-portal' }}
      />

      {checkoutPlan && (
        <PublicCheckoutModal
          planId={checkoutPlan.planId}
          planName={checkoutPlan.planName}
          price={checkoutPlan.price}
          type={checkoutPlan.type}
          interval={checkoutPlan.interval}
          onClose={() => setCheckoutPlan(null)}
        />
      )}
    </>
  );
}
