import React, { useLayoutEffect, useRef, useState } from 'react';
import SEO from '@/components/SEO.jsx';
import BlueprintBackdrop from '@/components/blueprint/BlueprintBackdrop.jsx';
import FlipReel from '@/components/blueprint/FlipReel.jsx';
import { useMotionState } from '@/lib/motion.js';
import { ButtonLink, Eyebrow, ProofLedger, SectionHeading } from '@/components/system/Section.jsx';

// Prototype: "Blueprint to build". Not linked from the site and not indexed.
// Every project fact below comes from copy already on the site.

const IMG = '/projects/optimized';

const PROJECTS = [
  {
    title: 'PrimeReach',
    series: 'Platform series',
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
    series: 'Operations series',
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
    series: 'Portal series',
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
    series: 'Civic series',
    type: 'Civic engagement',
    description: 'A public platform connecting Ellis County residents with the local information that matters.',
    url: 'https://pivotalvoice.org/',
    image: `${IMG}/pivotal-voice-960.webp`,
    width: 960,
    height: 457,
    alt: 'Pivotal Voice civic platform home page',
  },
];

const STEPS = [
  ['01', 'Map the work', 'The goal, the people, and the friction in their way.'],
  ['02', 'Draw the system', 'Screens, records, and workflows, laid out before a line of code.'],
  ['03', 'Build it in the open', 'You watch it take shape and launch with shared confidence.'],
];

// Background tints per section. Mixed toward the brand primitives.
const TONES = {
  ink: '#0f1419',
  deep: '#04080f',
  navy: '#003258',
  slate: '#1a2332',
};

export default function MotionBlueprintPage() {
  const { engine, status } = useMotionState();
  const rootRef = useRef(null);
  const [step, setStep] = useState(status === 'off' ? 2 : 0);
  const [chapter, setChapter] = useState('Blueprint');

  useLayoutEffect(() => {
    const root = rootRef.current;
    const backdrop = document.querySelector('.bp-backdrop');
    if (!engine || !root || !backdrop) return undefined;
    const { gsap, ScrollTrigger } = engine;
    const cleanups = [];

    const ctx = gsap.context(() => {
      const art = backdrop.querySelector('.bp-backdrop__art');
      const strokes = (sel) => backdrop.querySelectorAll(`${sel} .bp-draw`);
      gsap.set(backdrop.querySelectorAll('.bp-draw'), { strokeDasharray: 1, strokeDashoffset: 1 });
      gsap.set(backdrop.querySelectorAll('.bp-fill, .bp-label'), { autoAlpha: 0 });

      // 1. The hero pins while the blueprint draws itself, then fills in.
      const hero = root.querySelector('.bp-hero');
      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: hero,
          start: 'top top+=80', // below the sticky header
          end: '+=220%',
          pin: true,
          scrub: 1,
          onUpdate: (self) => setStep(self.progress < 0.34 ? 0 : self.progress < 0.68 ? 1 : 2),
        },
      });
      tl.to(strokes('.bp-phase--1'), { strokeDashoffset: 0, duration: 1, stagger: 0.04 }, 0)
        .to(strokes('.bp-phase--marks'), { strokeDashoffset: 0, duration: 0.8 }, 0.4)
        .to(backdrop.querySelectorAll('.bp-label'), { autoAlpha: 1, duration: 0.4, stagger: 0.05 }, 0.8)
        .to(strokes('.bp-phase--2'), { strokeDashoffset: 0, duration: 1, stagger: 0.03 }, 1.1)
        .to(backdrop.querySelectorAll('.bp-fill'), { autoAlpha: 1, duration: 0.8, stagger: 0.06 }, 2.2)
        .to(art, { scale: 1.04, duration: 3.2 }, 0)
        .to({}, { duration: 0.4 }); // hold on the finished build before releasing the pin

      // 2. Once the work arrives the drawing steps back to a watermark.
      gsap.to(art, {
        autoAlpha: 0.16,
        ease: 'none',
        scrollTrigger: { trigger: root.querySelector('.flip-reel'), start: 'top 90%', end: 'top 30%', scrub: true },
      });

      // 3. The field changes tint as each section takes over.
      root.querySelectorAll('[data-bp-tone]').forEach((section) => {
        const color = TONES[section.dataset.bpTone] || TONES.ink;
        const name = section.dataset.bpName;
        ScrollTrigger.create({
          trigger: section,
          start: 'top 55%',
          end: 'bottom 55%',
          onToggle: (self) => {
            if (!self.isActive) return;
            gsap.to(backdrop, { backgroundColor: color, duration: 0.9, ease: 'power2.out', overwrite: 'auto' });
            if (name) setChapter(name);
          },
        });
      });

      // 4. The thread fills with the whole page's progress.
      gsap.fromTo(root.querySelector('.bp-thread__fill'), { scaleY: 0 }, {
        scaleY: 1,
        ease: 'none',
        scrollTrigger: { start: 0, end: 'max', scrub: 0.3 },
      });
    }, root);

    // 5. A soft cyan glow follows the pointer on devices with a mouse.
    if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      const glow = backdrop.querySelector('.bp-backdrop__glow');
      gsap.set(glow, { autoAlpha: 1, xPercent: -50, yPercent: -50 });
      const gx = gsap.quickTo(glow, 'x', { duration: 0.8, ease: 'power3.out' });
      const gy = gsap.quickTo(glow, 'y', { duration: 0.8, ease: 'power3.out' });
      const move = (e) => {
        gx(e.clientX);
        gy(e.clientY);
      };
      window.addEventListener('pointermove', move);
      cleanups.push(() => window.removeEventListener('pointermove', move));
    }

    // The reel's triggers were created first (child effects run before the
    // parent's), so put every trigger back in page order before measuring.
    ScrollTrigger.sort();
    ScrollTrigger.refresh();
    return () => {
      ctx.revert();
      cleanups.forEach((fn) => fn());
    };
  }, [engine]);

  return (
    <div ref={rootRef} className={`bp-page ${status === 'off' ? 'bp-page--static' : ''}`}>
      <SEO title="Motion lab: blueprint" noindex canonical="https://evobrand.net/motion-lab/blueprint" />
      <BlueprintBackdrop drawn={status === 'off'} />

      <div className="bp-thread" aria-hidden="true">
        <span className="bp-thread__rail"><span className="bp-thread__fill" /></span>
        <span className="bp-thread__label">{chapter}</span>
      </div>

      <section className="bp-hero" data-bp-tone="ink" data-bp-name="Blueprint" aria-labelledby="bp-hero-heading">
        <div className="bp-hero__copy">
          <Eyebrow>EVOBRAND Concepts · Strategy, design & technology</Eyebrow>
          <h1 id="bp-hero-heading" className="evo-heading evo-heading--display">
            <span className="block">Better systems.</span> <em>A stronger brand.</em>
          </h1>
          <p className="evo-intro">
            Websites, custom applications, and AI workflows that make your organization easier to run and easier to choose.
          </p>
          <ol className="bp-hero__steps">
            {STEPS.map(([n, title, body], i) => (
              <li key={n} className={`bp-hero__step ${i === step ? 'is-active' : ''} ${i < step ? 'is-done' : ''}`}>
                <span className="bp-hero__num">{n}</span>
                <span>
                  <strong>{title}</strong>
                  <span className="bp-hero__body">{body}</span>
                </span>
              </li>
            ))}
          </ol>
          <div className="flex flex-wrap gap-space-s">
            <ButtonLink to="/book-consultation">Book a strategy call</ButtonLink>
            <ButtonLink to="/our-work" variant="secondary">See the work</ButtonLink>
          </div>
        </div>
        {status !== 'off' && <p className="bp-hero__cue" aria-hidden="true">Scroll to draw</p>}
      </section>

      <FlipReel
        label="Selected work"
        lead="Built for real people."
        emphasis="Put to work every day."
        intro="Digital platforms for contracting, membership, workforce development, and civic participation."
        projects={PROJECTS}
      />

      <section className="bp-block" data-bp-tone="navy" data-bp-name="Record">
        <div className="bp-block__inner">
          <SectionHeading
            label="The record"
            lead="Experience you can verify."
            emphasis="Work you can open."
            intro="Senior-led from the first conversation through launch, with a track record spanning public, private, and nonprofit work."
          />
          <ProofLedger
            items={[
              { value: '1999', label: 'Established' },
              { value: 25, suffix: '+ years', label: 'In operation', count: true },
              { value: 'SBE · WBE · MBE', label: 'Certified' },
              { value: 'Public · Private · Nonprofit', label: 'Client sectors' },
            ]}
          />
        </div>
      </section>

      <section className="bp-block" data-bp-tone="ink" data-bp-name="Start">
        <div className="bp-block__inner">
          <SectionHeading
            display
            label="Start a project"
            lead="Tell us what"
            emphasis="needs to work."
            intro="We will set up a call, map the problem, and give you a clear scope and timeline."
          >
            <div className="mt-space-s flex flex-wrap gap-space-s">
              <ButtonLink to="/book-consultation">Book a strategy call</ButtonLink>
              <ButtonLink to="/our-work" variant="secondary">See the work</ButtonLink>
            </div>
          </SectionHeading>
        </div>
      </section>
    </div>
  );
}
