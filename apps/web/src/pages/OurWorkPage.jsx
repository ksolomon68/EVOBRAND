import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { AnimatePresence, MotionConfig, motion, useReducedMotion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, ArrowUpRight, ExternalLink, Play } from 'lucide-react';
import SEO from '@/components/SEO.jsx';
import { CtaBand, InnerHero } from '@/components/inner/InnerKit.jsx';
import { ButtonLink, SectionHeading } from '@/components/system/Section.jsx';
import AcademySpotlight from '@/components/work/AcademySpotlight.jsx';
import DemoExplorer from '@/components/work/DemoExplorer.jsx';
import LaunchGallery from '@/components/work/LaunchGallery.jsx';
import { DASHBOARD_DEMOS, FLAGSHIP, RECENT_LAUNCHES, TESTIMONIALS } from '@/data/work.js';

gsap.registerPlugin(ScrollTrigger);

const pad = (n) => String(n).padStart(2, '0');

/** Flagship platforms: pinned and sliding sideways on desktop, stacked on phones. */
function FlagshipReel() {
  const reelRef = useRef(null);
  const trackRef = useRef(null);
  const progressRef = useRef(null);

  useEffect(() => {
    const mm = gsap.matchMedia();
    mm.add('(min-width: 1024px) and (prefers-reduced-motion: no-preference)', () => {
      const track = trackRef.current;
      const section = reelRef.current;
      if (!track || !section) return undefined;
      const distance = () => Math.max(0, track.scrollWidth - track.parentElement.clientWidth);
      const tween = gsap.to(track, {
        x: () => -distance(),
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top 80px', // below the sticky header
          end: () => `+=${distance()}`,
          pin: true,
          scrub: 0.8,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            if (progressRef.current) progressRef.current.style.transform = `scaleX(${self.progress})`;
          },
        },
      });
      // Reveals further down were measured before this pin existed.
      ScrollTrigger.sort();
      ScrollTrigger.refresh();
      return () => {
        tween.scrollTrigger?.kill();
        tween.kill();
      };
    });
    return () => mm.revert();
  }, []);

  return (
    <section id="flagship" ref={reelRef} className="work-reel" aria-labelledby="flagship-heading">
      <div className="work-reel__stage">
        <div className="evo-container work-reel__head">
          <SectionHeading id="flagship-heading" label="02 · Flagship platforms" lead="Products we built" emphasis="and still run." />
          <div className="work-reel__progress" aria-hidden="true"><span ref={progressRef} /></div>
        </div>
        <div className="work-reel__viewport">
          <div ref={trackRef} className="work-reel__track">
            {FLAGSHIP.map((item, i) => (
              <a key={item.id} href={item.link} target="_blank" rel="noopener noreferrer" className="work-card work-card--wide">
                <div className="work-card__media">
                  <img src={item.image} alt={`${item.title} home page`} loading="lazy" decoding="async" />
                  <span className="work-card__index">{pad(i + 1)} / {pad(FLAGSHIP.length)}</span>
                </div>
                <div className="work-card__body">
                  <p className="work-card__meta">{item.category} · {item.industry}</p>
                  <h3 className="work-card__title">{item.title}</h3>
                  <p className="work-card__text">{item.description}</p>
                  <ul className="work-card__chips">
                    {item.highlights.map((h) => <li key={h}>{h}</li>)}
                  </ul>
                  <span className="work-card__cta">Visit the live site <ExternalLink size={15} aria-hidden="true" /><span className="sr-only"> (opens in new tab)</span></span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/** One quote at a time. Rotates on its own until someone interacts. */
function QuoteRotator() {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const reduce = useReducedMotion();
  const n = TESTIMONIALS.length;
  const t = TESTIMONIALS[i];

  useEffect(() => {
    if (reduce || paused) return undefined;
    const id = setTimeout(() => setI((x) => (x + 1) % n), 7000);
    return () => clearTimeout(id);
  }, [i, paused, reduce, n]);

  const go = (d) => {
    setPaused(true);
    setI((x) => (x + d + n) % n);
  };

  return (
    <div className="quote-rotator" onPointerEnter={() => setPaused(true)} onPointerLeave={() => setPaused(false)}>
      <AnimatePresence mode="wait" initial={false}>
        <motion.figure
          key={i}
          className="quote-rotator__figure"
          initial={reduce ? false : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, y: -12 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        >
          <blockquote>“{t.quote}”</blockquote>
          <figcaption>
            <span className="quote-card__mono" aria-hidden="true">{t.name.split(' ').map((w) => w[0]).join('').slice(0, 2)}</span>
            <span>
              <strong>{t.name}</strong>
              <span>{t.role}, {t.company}</span>
            </span>
          </figcaption>
        </motion.figure>
      </AnimatePresence>
      <div className="quote-rotator__controls">
        <button type="button" onClick={() => go(-1)} aria-label="Previous testimonial"><ArrowLeft size={18} /></button>
        <span aria-live="polite">{pad(i + 1)} / {pad(n)}</span>
        <button type="button" onClick={() => go(1)} aria-label="Next testimonial"><ArrowRight size={18} /></button>
      </div>
    </div>
  );
}

export default function OurWorkPage() {
  return (
    <>
      <SEO
        title="Our Work: Platforms, Websites, Academy and Case Studies"
        description="Selected EVOBRAND work for government agencies, nonprofits, and businesses: government contracting platforms, membership systems, live dashboard demos, websites, and EVOBRAND Academy's AI Executive Sandbox."
        keywords="EVOBRAND portfolio, AI Executive Sandbox, EVOBRAND Academy, web development portfolio, Ellis County web design, SaaS development, government contracting platform"
        canonical="https://evobrand.net/our-work"
      />

      <MotionConfig reducedMotion="user">
        <InnerHero
          crumbs={[{ label: 'Our work' }]}
          label="Web · SaaS · Government · Nonprofit · Education"
          lead="Built for real people."
          emphasis="Put to work every day."
          intro="Platforms for contracting, membership, workforce development and civic participation, an executive AI academy, and websites for businesses and nonprofits. Everything here is live; open any of it."
          actions={[
            { to: '/book-consultation', label: 'Start a project', cta: 'work-hero-start' },
            { to: '#dashboard-demos', label: 'Try a live demo', cta: 'work-hero-demo' },
          ]}
          facts={[
            { label: 'Flagship', value: `${FLAGSHIP.length} platforms we built and run` },
            { label: 'Live demos', value: `${DASHBOARD_DEMOS.length} portals you can click through` },
            { label: 'Launches', value: `${RECENT_LAUNCHES.length} recent websites` },
            { label: 'Academy', value: 'The AI Executive Sandbox' },
          ]}
          jumps={[
            { href: '#academy', label: 'EVOBRAND Academy' },
            { href: '#flagship', label: 'Flagship platforms' },
            { href: '#dashboard-demos', label: 'Live demos' },
            { href: '#recent-launches', label: 'Recent launches' },
            { href: '#videos', label: 'Video library' },
            { href: '#testimonials', label: 'Clients' },
          ]}
        />

        <AcademySpotlight />

        <FlagshipReel />

        <section id="dashboard-demos" className="evo-block evo-block--slate" aria-labelledby="demos-heading">
          <div className="evo-container">
            <div className="work-section-head">
              <SectionHeading
                id="demos-heading"
                label="03 · Dashboard demos"
                lead="Live portals"
                emphasis="you can click through."
                intro="Custom portals, workforce consoles, community hubs and operations dashboards. Pick one to preview it, then launch the working demo."
              />
              <ButtonLink to="/free-demo-portal" variant="secondary">Request your own demo</ButtonLink>
            </div>
            <DemoExplorer demos={DASHBOARD_DEMOS} />
          </div>
        </section>

        <section id="recent-launches" className="evo-block evo-block--ink" aria-labelledby="launches-heading">
          <div className="evo-container">
            <div className="work-section-head">
              <SectionHeading
                id="launches-heading"
                label="04 · Recent launches"
                lead="Websites for businesses,"
                emphasis="nonprofits and campaigns."
                intro="Filter by sector. Hover a project for the short story, or open the live site."
              />
              <ButtonLink to="/services/web-development" variant="secondary">Web development service</ButtonLink>
            </div>
            <LaunchGallery items={RECENT_LAUNCHES} />
          </div>
        </section>

        <section id="videos" className="evo-block evo-block--slate" aria-labelledby="videos-heading">
          <div className="evo-container video-teaser">
            <SectionHeading
              id="videos-heading"
              label="05 · Video library"
              lead="Watch the work,"
              emphasis="explained on screen."
              intro="Walkthroughs, AI tutorials and client stories from our animated series, with new videos every week."
            />
            <Link to="/our-work/videos" className="video-teaser__card">
              <span className="video-teaser__play" aria-hidden="true"><Play size={28} fill="currentColor" /></span>
              <span className="video-teaser__text">
                <span className="work-card__meta">Branding · Automation · AI · Growth</span>
                <span className="video-teaser__title">Open the video library</span>
              </span>
              <ArrowUpRight className="video-teaser__arrow" size={22} aria-hidden="true" />
            </Link>
          </div>
        </section>

        <section id="testimonials" className="evo-block evo-block--deep" aria-labelledby="testimonials-heading">
          <div className="evo-container quote-layout">
            <SectionHeading id="testimonials-heading" label="06 · What clients say" lead="In their" emphasis="own words." />
            <QuoteRotator />
          </div>
        </section>

        <CtaBand
          label="Start your project"
          lead="Your platform"
          emphasis="could be next."
          intro="Tell us what needs to work. We will map it with you and show you what it could look like, often with a live demo before you commit."
          secondary={{ to: '/free-demo-portal', label: 'Get a free demo portal', cta: 'work-band-demo' }}
        />
      </MotionConfig>
    </>
  );
}
