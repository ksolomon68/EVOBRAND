import React, { useLayoutEffect, useRef, useState } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import SEO from '@/components/SEO.jsx';
import PublicCheckoutModal from '@/components/PublicCheckoutModal.jsx';
import { SERVICES, planIdFor, serviceBySlug } from '@/data/services.js';
import { CtaBand, InnerHero, LinkCards, SplitSection, useStaggerReveal } from '@/components/inner/InnerKit.jsx';
import { ButtonLink, SectionHeading } from '@/components/system/Section.jsx';
import { useMotion } from '@/lib/motion.js';

function Tier({ plan, onBuy, recurring }) {
  const custom = plan.price === 'Custom';
  return (
    <article className={`tier ${plan.highlighted ? 'tier--featured' : ''}`} data-reveal-item>
      {plan.highlighted && <span className="tier__flag">Most popular</span>}
      <h3 className="tier__name">{plan.tier}</h3>
      <p className="tier__price">
        <strong>{recurring ? plan.price.split('/')[0] : plan.price}</strong>
        <span>{custom ? 'Tailored quote' : recurring ? 'per month' : 'one-time project'}</span>
      </p>
      <ul className="inner-ticks">
        {plan.features.map((f) => <li key={f}>{f}</li>)}
      </ul>
      {custom ? (
        <ButtonLink to="/contact" variant="secondary">Talk to us</ButtonLink>
      ) : (
        <button type="button" className={`evo-btn ${plan.highlighted ? 'evo-btn--primary' : 'evo-btn--secondary'}`} onClick={onBuy}>
          Choose {plan.tier} <ArrowRight size={16} aria-hidden="true" />
        </button>
      )}
    </article>
  );
}

function TierGrid({ children }) {
  const ref = useRef(null);
  useStaggerReveal(ref);
  return <div ref={ref} className="tier-grid">{children}</div>;
}

function ServiceProcessExperience({ service }) {
  const motion = useMotion();
  const rootRef = useRef(null);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!motion || !root) return undefined;

    const { gsap } = motion;
    const steps = gsap.utils.toArray('[data-process-step]', root);
    const progress = root.querySelector('[data-process-progress]');
    const current = root.querySelector('[data-process-current]');
    const currentTitle = root.querySelector('[data-process-title]');
    let activeIndex = -1;

    const setActive = (index) => {
      if (index === activeIndex) return;
      activeIndex = index;
      steps.forEach((step, stepIndex) => step.classList.toggle('is-active', stepIndex === index));
      if (current) current.textContent = String(index + 1).padStart(2, '0');
      if (currentTitle) currentTitle.textContent = service.process[index]?.step || '';
    };

    setActive(0);

    const media = gsap.matchMedia();
    media.add('(prefers-reduced-motion: no-preference)', () => {
      const progressTween = gsap.fromTo(progress,
        { scaleX: 0, transformOrigin: 'left center' },
        {
          scaleX: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: root,
            start: 'top 62%',
            end: 'bottom 42%',
            scrub: 0.6,
          },
        });

      const stepTimelines = steps.map((step, index) => {
        const aura = step.querySelector('.service-process__aura');
        const number = step.querySelector('.service-process__number');
        const copy = step.querySelector('.service-process__copy');

        return gsap.timeline({
          scrollTrigger: {
            trigger: step,
            start: 'top 78%',
            end: 'bottom 32%',
            scrub: 0.65,
            onEnter: () => setActive(index),
            onEnterBack: () => setActive(index),
          },
        })
          .fromTo(step,
            { autoAlpha: 0.34, x: 48, scale: 0.96 },
            { autoAlpha: 1, x: 0, scale: 1, duration: 0.42, ease: 'none' })
          .fromTo(aura,
            { autoAlpha: 0, scale: 0.82 },
            { autoAlpha: 1, scale: 1, duration: 0.32, ease: 'none' }, 0)
          .fromTo(number,
            { y: 24, rotation: -5 },
            { y: 0, rotation: 0, duration: 0.42, ease: 'none' }, 0)
          .fromTo(copy,
            { y: 28 },
            { y: 0, duration: 0.42, ease: 'none' }, 0)
          .to(step, { autoAlpha: 0.5, x: -18, scale: 0.975, duration: 0.58, ease: 'none' })
          .to(aura, { autoAlpha: 0.12, scale: 1.08, duration: 0.58, ease: 'none' }, '<');
      });

      return () => {
        progressTween.scrollTrigger?.kill();
        progressTween.revert();
        stepTimelines.forEach((timeline) => {
          timeline.scrollTrigger?.kill();
          timeline.revert();
        });
      };
    }, root);

    return () => {
      media.revert();
      steps.forEach((step) => step.classList.remove('is-active'));
    };
  }, [motion, service]);

  const total = String(service.process.length).padStart(2, '0');

  return (
    <section ref={rootRef} id="process" className="evo-block evo-block--slate service-process" aria-labelledby="process-heading">
      <div className="service-process__grid" aria-hidden="true" />
      <div className="evo-container service-process__layout">
        <div className="service-process__story">
          <SectionHeading
            id="process-heading"
            label="How it runs"
            lead="Five steps,"
            emphasis="no surprises."
            intro={`Most ${service.title.toLowerCase()} projects take ${service.timeline}. You see the work at every step.`}
          >
            <ButtonLink to="/how-it-works" variant="secondary">Our full process</ButtonLink>
          </SectionHeading>

          <div className="service-process__status" aria-hidden="true">
            <div className="service-process__readout">
              <span className="service-process__current" data-process-current>01</span>
              <span className="service-process__total">/ {total}</span>
            </div>
            <p data-process-title>{service.process[0]?.step}</p>
            <div className="service-process__track">
              <span data-process-progress />
            </div>
          </div>
        </div>

        <ol className="service-process__steps">
          {service.process.map((step, index) => (
            <li key={step.step} className="service-process__step" data-process-step>
              <span className="service-process__aura" aria-hidden="true" />
              <span className="service-process__phase">Phase {String(index + 1).padStart(2, '0')}</span>
              <span className="service-process__number" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
              <div className="service-process__copy">
                <h3>{step.step}</h3>
                <p>{step.description}</p>
              </div>
              <span className="service-process__corner" aria-hidden="true" />
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export default function ServiceDetailPage() {
  const { slug } = useParams();
  const service = serviceBySlug(slug);
  const [checkout, setCheckout] = useState(null);

  if (!service) return <Navigate to="/services" replace />;

  const related = [
    ...SERVICES.filter((s) => s.group === service.group && s.slug !== service.slug),
    ...SERVICES.filter((s) => s.group !== service.group),
  ].slice(0, 3);

  return (
    <>
      <SEO
        title={`${service.title} | EVOBRAND Services`}
        description={`${service.description} Typical timeline ${service.timeline}. Plans from ${service.pricing[0].price}.`}
        canonical={`https://evobrand.net/services/${service.slug}`}
        structuredData={{
          '@context': 'https://schema.org',
          '@type': 'Service',
          name: service.title,
          description: service.description,
          provider: { '@type': 'Organization', name: 'EVOBRAND Concepts LLC', url: 'https://evobrand.net' },
          areaServed: 'United States',
          offers: service.pricing
            .filter((p) => p.price !== 'Custom')
            .map((p) => ({ '@type': 'Offer', name: p.tier, price: p.price.replace(/[$,]/g, ''), priceCurrency: 'USD' })),
        }}
      />

      <InnerHero
        crumbs={[{ label: 'Services', to: '/services' }, { label: service.title }]}
        label={service.group}
        lead={service.lead}
        emphasis={service.emphasis}
        intro={service.description}
        actions={[
          { to: '/book-consultation', label: 'Book a strategy call', cta: `svc-${service.slug}-call` },
          { to: '#pricing', label: 'See pricing', cta: `svc-${service.slug}-pricing` },
        ]}
        facts={[
          { label: 'Service', value: service.title },
          { label: 'Timeline', value: service.timeline },
          { label: 'Starting at', value: service.pricing[0].price },
          { label: 'Led by', value: 'A senior lead, start to finish' },
        ]}
        jumps={[
          { href: '#included', label: 'What is included' },
          { href: '#process', label: 'How it runs' },
          { href: '#pricing', label: 'Pricing' },
        ]}
      />

      <SplitSection
        id="included"
        label="What is included"
        lead="Everything it takes"
        emphasis="to launch and run it."
        intro="The core of every engagement, scoped to your goals in the first conversation."
      >
        <ol className="feature-list">
          {service.features.map((f, i) => (
            <li key={f}>
              <span aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
              {f}
            </li>
          ))}
        </ol>
      </SplitSection>

      <ServiceProcessExperience service={service} />

      <section id="pricing" className="evo-block evo-block--ink" aria-labelledby="pricing-heading">
        <div className="evo-container">
          <SectionHeading
            id="pricing-heading"
            label="Pricing"
            lead="Clear starting points."
            emphasis="Custom when you need it."
            intro="Pick a plan to check out securely, or talk to us about a tailored scope."
          />
          <div className="mt-space-xl">
            <TierGrid>
              {service.pricing.map((plan) => (
                <Tier
                  key={plan.tier}
                  plan={plan}
                  onBuy={() => setCheckout({
                    planId: planIdFor(service, plan.tier),
                    planName: `${plan.tier} Plan`,
                    price: plan.price,
                    type: 'one-time',
                  })}
                />
              ))}
            </TierGrid>
          </div>

          {service.maintenancePlans && (
            <div className="mt-space-2xl">
              <SectionHeading
                label="After launch"
                lead="Keep it fast, secure"
                emphasis="and up to date."
                intro="Monthly maintenance for WordPress sites. Cancel any time."
              />
              <div className="mt-space-xl">
                <TierGrid>
                  {service.maintenancePlans.map((plan) => (
                    <Tier
                      key={plan.tier}
                      plan={plan}
                      recurring
                      onBuy={() => setCheckout({
                        planId: `maintenance-${plan.tier.toLowerCase()}`,
                        planName: `WordPress Maintenance - ${plan.tier}`,
                        price: plan.price.split('/')[0],
                        type: 'recurring',
                      })}
                    />
                  ))}
                </TierGrid>
              </div>
            </div>
          )}
        </div>
      </section>

      <SplitSection
        id="related"
        tone="slate"
        label="Often paired with"
        lead="Most projects"
        emphasis="touch more than one."
      >
        <LinkCards
          columns={2}
          items={related.map((s) => ({
            to: `/services/${s.slug}`,
            icon: s.icon,
            meta: s.group,
            title: s.title,
            body: s.menuBlurb,
            cta: 'Explore',
          }))}
        />
      </SplitSection>

      <CtaBand
        label={service.title}
        lead="Ready when"
        emphasis="you are."
        intro={`Tell us what you need from ${service.title.toLowerCase()}. We will set up a call, map the scope, and give you a clear timeline.`}
      />

      {checkout && (
        <PublicCheckoutModal
          planId={checkout.planId}
          planName={checkout.planName}
          price={checkout.price}
          type={checkout.type}
          onClose={() => setCheckout(null)}
        />
      )}
    </>
  );
}
