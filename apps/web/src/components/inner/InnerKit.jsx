import React, { useId, useLayoutEffect, useRef, useState } from 'react';
import { AnimatePresence, motion as fm, useReducedMotion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, ChevronRight, Plus } from 'lucide-react';
import { useMotion } from '@/lib/motion.js';
import { ButtonLink, Eyebrow, SectionHeading } from '@/components/system/Section.jsx';
import SectionWipe from '@/components/cinematic/SectionWipe.jsx';

/*
 * Building blocks for the inner pages, so every page opens, reads and closes
 * the same way as the homepage: a drafting-grid hero with a serif headline,
 * editorial sections, link cards in the mega-menu style, and one closing CTA.
 * Everything is visible without JavaScript; motion only adds to it.
 */

/**
 * Children matching `selector` rise into place as they scroll into view,
 * a few at a time. No-op under reduced motion or before the engine loads.
 */
export function useStaggerReveal(ref, selector = '[data-reveal-item]') {
  const motion = useMotion();
  useLayoutEffect(() => {
    const root = ref.current;
    if (!motion || !root) return undefined;
    const { gsap, ScrollTrigger } = motion;
    const items = root.querySelectorAll(selector);
    if (!items.length) return undefined;
    const below = [...items].filter((el) => el.getBoundingClientRect().top > window.innerHeight * 0.92);
    if (!below.length) return undefined;
    gsap.set(below, { autoAlpha: 0, y: 36 });
    const triggers = ScrollTrigger.batch(below, {
      start: 'top 90%',
      once: true,
      onEnter: (batch) => gsap.to(batch, { autoAlpha: 1, y: 0, duration: 0.9, ease: 'expo.out', stagger: 0.08, overwrite: true }),
    });
    return () => {
      triggers.forEach((t) => t.kill());
      gsap.set(below, { clearProps: 'opacity,visibility,transform' });
    };
  }, [motion, ref, selector]);
}

function Crumbs({ items }) {
  if (!items?.length) return null;
  return (
    <nav className="inner-crumbs" aria-label="Breadcrumb">
      <ol>
        <li><Link to="/">Home</Link></li>
        {items.map((c, i) => (
          <li key={c.label}>
            <ChevronRight size={13} aria-hidden="true" />
            {c.to && i < items.length - 1 ? <Link to={c.to}>{c.label}</Link> : <span aria-current="page">{c.label}</span>}
          </li>
        ))}
      </ol>
    </nav>
  );
}

/**
 * Inner-page hero. Left: breadcrumb, label, a two-part serif headline, intro
 * and CTAs. Right: a framed window onto real work (media) or a short proof
 * list (facts). The window opens on load and settles as you scroll.
 */
export function InnerHero({ crumbs, label, lead, emphasis, intro, actions = [], media, facts, jumps }) {
  const motion = useMotion();
  const rootRef = useRef(null);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!motion || !root) return undefined;
    const { gsap } = motion;
    const frame = root.querySelector('.inner-hero__window');
    const img = frame?.querySelector('img');
    const tweens = [];
    if (frame) {
      tweens.push(gsap.fromTo(frame, { clipPath: 'inset(10% 10% 10% 10% round 28px)', autoAlpha: 0 }, {
        clipPath: 'inset(0% 0% 0% 0% round 20px)', autoAlpha: 1, duration: 1.4, ease: 'expo.out', delay: 0.25,
      }));
      tweens.push(gsap.fromTo(img, { scale: 1.18 }, {
        scale: 1, yPercent: -4, ease: 'none',
        scrollTrigger: { trigger: root, start: 'top top', end: 'bottom top', scrub: true },
      }));
    }
    const facts = root.querySelectorAll('.inner-hero__fact');
    if (facts.length) {
      tweens.push(gsap.from(facts, { autoAlpha: 0, x: 24, duration: 0.9, ease: 'expo.out', stagger: 0.1, delay: 0.5 }));
    }
    tweens.push(gsap.from(root.querySelector('.inner-hero__rule'), { scaleX: 0, transformOrigin: 'left center', duration: 1.6, ease: 'expo.inOut', delay: 0.2 }));
    return () => tweens.forEach((t) => {
      t.scrollTrigger?.kill();
      t.revert();
    });
  }, [motion]);

  return (
    <section ref={rootRef} className="inner-hero">
      <div className="inner-hero__grid" aria-hidden="true" />
      <div className="evo-container inner-hero__layout">
        <div className="inner-hero__copy">
          <Crumbs items={crumbs} />
          <SectionHeading as="h1" display label={label} lead={lead} emphasis={emphasis} intro={intro}>
            {actions.length > 0 && (
              <div className="inner-hero__actions">
                {actions.map((a, i) => (
                  <ButtonLink key={a.to} to={a.to} variant={i === 0 ? 'primary' : 'secondary'} data-cta={a.cta}>
                    {a.label} {i === 0 && <ArrowRight size={16} aria-hidden="true" />}
                  </ButtonLink>
                ))}
              </div>
            )}
          </SectionHeading>
        </div>
        {media && (
          <figure className="inner-hero__media">
            <div className="inner-hero__window">
              <span className="inner-hero__chrome" aria-hidden="true"><i /><i /><i /></span>
              <img src={media.src} srcSet={media.srcSet} sizes="(min-width: 1024px) 40vw, 90vw" width={media.width} height={media.height} alt={media.alt} decoding="async" />
            </div>
            {media.caption && <figcaption>{media.caption}</figcaption>}
          </figure>
        )}
        {!media && facts && (
          <dl className="inner-hero__facts">
            {facts.map((f) => (
              <div key={f.label} className="inner-hero__fact">
                <dt>{f.label}</dt>
                <dd>{f.value}</dd>
              </div>
            ))}
          </dl>
        )}
      </div>
      <div className="evo-container">
        <div className="inner-hero__rule" aria-hidden="true" />
        {jumps?.length > 0 && (
          <nav className="inner-jumps" aria-label="On this page">
            {jumps.map((j) => (
              <Link key={j.href} to={j.href}>{j.label}</Link>
            ))}
          </nav>
        )}
      </div>
    </section>
  );
}

/** A grid of cards in the mega-menu style: icon tile, title, one line, arrow. */
export function LinkCards({ items, columns = 3 }) {
  const ref = useRef(null);
  useStaggerReveal(ref);
  return (
    <ul ref={ref} className={`link-cards link-cards--${columns}`}>
      {items.map((item) => {
        const Icon = item.icon;
        const external = /^https?:/.test(item.to);
        const inner = (
          <>
            <span className="link-card__top">
              {Icon && <span className="mega-link__icon" aria-hidden="true"><Icon size={20} strokeWidth={1.6} /></span>}
              {item.meta && <span className="link-card__meta">{item.meta}</span>}
            </span>
            <span className="link-card__title">{item.title}</span>
            {item.body && <span className="link-card__body">{item.body}</span>}
            <span className="link-card__cta">
              {item.cta || 'Learn more'} <ArrowUpRight size={16} aria-hidden="true" />
            </span>
          </>
        );
        return (
          <li key={item.to + item.title} data-reveal-item>
            {external ? (
              <a className="link-card" href={item.to} target="_blank" rel="noopener noreferrer">{inner}</a>
            ) : (
              <Link className="link-card" to={item.to}>{inner}</Link>
            )}
          </li>
        );
      })}
    </ul>
  );
}

/** Numbered steps, set like the homepage process list. */
export function StepList({ steps }) {
  const ref = useRef(null);
  useStaggerReveal(ref, 'li');
  return (
    <ol ref={ref} className="studio-process__list">
      {steps.map((s, i) => (
        <li key={s.title}>
          <span aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
          <div>
            {s.meta && <p className="inner-step__meta">{s.meta}</p>}
            <h3>{s.title}</h3>
            <p>{s.body}</p>
            {s.list && (
              <ul className="inner-ticks">
                {s.list.map((li) => <li key={li}>{li}</li>)}
              </ul>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}

/** Editorial section: heading on the left, content on the right. */
export function SplitSection({ id, tone = 'ink', label, lead, emphasis, intro, aside, children }) {
  return (
    <section id={id} className={`evo-block evo-block--${tone} inner-split`} aria-labelledby={id ? `${id}-heading` : undefined}>
      <div className="evo-container inner-split__grid">
        <div className="inner-split__head">
          <SectionHeading id={id ? `${id}-heading` : undefined} label={label} lead={lead} emphasis={emphasis} intro={intro}>
            {aside}
          </SectionHeading>
        </div>
        <div className="inner-split__body">{children}</div>
      </div>
    </section>
  );
}

/**
 * The closing call to action every inner page ends on. One primary action,
 * one secondary, and a direct line for people who would rather call.
 */
export function CtaBand({
  label = 'Start a conversation',
  lead = 'Tell us what',
  emphasis = 'needs to work.',
  intro = 'Bring the idea, the bottleneck, or the next big project. We will map it with you and give you a clear scope and timeline.',
  primary = { to: '/book-consultation', label: 'Book a strategy call', cta: 'band-strategy' },
  secondary = { to: '/contact', label: 'Send a message', cta: 'band-contact' },
}) {
  return (
    <SectionWipe>
      <section className="evo-block evo-block--navy cta-band">
        <div className="cta-band__grid" aria-hidden="true" />
        <div className="evo-container studio-closing__grid">
          <SectionHeading display label={label} lead={lead} emphasis={emphasis} intro={intro} />
          <div className="studio-closing__action">
            <ButtonLink to={primary.to} data-cta={primary.cta}>
              {primary.label} <ArrowRight size={16} aria-hidden="true" />
            </ButtonLink>
            {secondary && (
              <ButtonLink to={secondary.to} variant="secondary" data-cta={secondary.cta}>
                {secondary.label}
              </ButtonLink>
            )}
            <p>
              <a href="tel:+12145314427">+1 214-531-4427</a><br />
              <a href="mailto:info@evobrand.net">info@evobrand.net</a>
            </p>
          </div>
        </div>
      </section>
    </SectionWipe>
  );
}

/** Question list. One answer open at a time; buttons carry aria-expanded. */
export function Faq({ items }) {
  const [open, setOpen] = useState(0);
  const reduce = useReducedMotion();
  const base = useId();
  const ref = useRef(null);
  useStaggerReveal(ref);
  return (
    <div ref={ref} className="faq">
      {items.map((item, i) => {
        const expanded = open === i;
        return (
          <div key={item.q} className={`faq__item ${expanded ? 'is-open' : ''}`} data-reveal-item>
            <h3>
              <button
                type="button"
                aria-expanded={expanded}
                aria-controls={`${base}-${i}`}
                onClick={() => setOpen(expanded ? null : i)}
              >
                <span>{item.q}</span>
                <Plus className="faq__icon" size={20} aria-hidden="true" />
              </button>
            </h3>
            <AnimatePresence initial={false}>
              {expanded && (
                <fm.div
                  id={`${base}-${i}`}
                  className="faq__answer"
                  initial={reduce ? false : { height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
                  transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                >
                  <p>{item.a}</p>
                </fm.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}

export { Eyebrow };
