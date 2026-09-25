import React, { useLayoutEffect, useRef } from 'react';
import { ArrowRight } from 'lucide-react';
import { useMotionState, getLoadedMotion, headlinesHeld, releaseHeldHeadlines } from '@/lib/motion.js';
import { isIntroDone, INTRO_DONE_EVENT } from '@/components/cinematic/Preloader.jsx';
import { ButtonLink, Eyebrow } from '@/components/system/Section.jsx';

const HEADER_OFFSET = 80;

function waitForIntro() {
  if (isIntroDone()) return Promise.resolve();
  return new Promise((resolve) => window.addEventListener(INTRO_DONE_EVENT, resolve, { once: true }));
}

/**
 * Cinematic hero. On load the headline rises word by word. On scroll the
 * stage pins, the copy lifts away, and a window onto real work opens until it
 * fills the screen. Static layout when motion is off or the engine fails.
 */
export default function CinematicHero({ eyebrow, lead, emphasis, intro, primary, secondary, media }) {
  const { engine, status } = useMotionState();
  const loadedAtFirstRender = useRef(getLoadedMotion() !== null).current;
  const rootRef = useRef(null);

  // Headline reveal.
  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!engine || !root) return undefined;
    const { gsap, SplitText } = engine;
    const hidden = !isIntroDone() || headlinesHeld() || loadedAtFirstRender;
    if (!hidden) return undefined;

    const heading = root.querySelector('[data-reveal-heading]');
    const extras = root.querySelectorAll('[data-reveal-extra]');
    gsap.set(heading, { autoAlpha: 0 });
    gsap.set(extras, { autoAlpha: 0, y: 18 });
    releaseHeldHeadlines();

    let split;
    let tl;
    let cancelled = false;
    Promise.all([waitForIntro(), document.fonts?.ready]).then(() => {
      if (cancelled) return;
      split = SplitText.create(heading, { type: 'lines,words', mask: 'lines', linesClass: 'evo-reveal-line' });
      const emWords = split.words.filter((w) => w.closest('em'));
      const leadWords = split.words.filter((w) => !w.closest('em'));
      tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
      tl.set(heading, { autoAlpha: 1 });
      tl.from(leadWords, { yPercent: 120, rotate: 5, duration: 1.2, stagger: 0.06, transformOrigin: '0% 100%' });
      tl.from(emWords, { yPercent: 120, rotate: 5, duration: 1.3, stagger: 0.07, transformOrigin: '0% 100%' }, '-=0.85');
      tl.to(extras, { autoAlpha: 1, y: 0, duration: 0.9, stagger: 0.08, ease: 'power3.out' }, '-=0.9');
      tl.eventCallback('onComplete', () => split.revert());
    });

    return () => {
      cancelled = true;
      tl?.kill();
      split?.revert();
      gsap.set([heading, ...extras], { clearProps: 'opacity,visibility,transform' });
    };
  }, [engine, loadedAtFirstRender]);

  // Scroll scene: pin the stage and open the window.
  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!engine || !root) return undefined;
    const { gsap } = engine;
    const stage = root.querySelector('.cine-hero__stage');
    const copy = root.querySelector('.cine-hero__copy');
    const win = root.querySelector('.cine-hero__window');
    const img = win.querySelector('img');
    const caption = root.querySelector('.cine-hero__caption');
    const scrim = root.querySelector('.cine-hero__scrim');

    const mm = gsap.matchMedia();
    mm.add({ small: '(max-width: 767px)', large: '(min-width: 768px)' }, (ctx) => {
      const { small } = ctx.conditions;
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: stage,
          start: `top top+=${HEADER_OFFSET}`,
          end: small ? '+=90%' : '+=140%',
          pin: true,
          pinType: 'transform', // transforms do not count as layout shift
          scrub: 1,
          anticipatePin: 1,
        },
      });
      tl.to(copy, { yPercent: -14, scale: 0.94, autoAlpha: 0, ease: 'power2.in', duration: 0.5 }, 0);
      tl.to(win, { clipPath: 'inset(0% 0% 0% 0% round 0px)', ease: 'power2.inOut', duration: 1 }, 0);
      tl.fromTo(img, { scale: 1.3 }, { scale: 1, ease: 'none', duration: 1 }, 0);
      tl.fromTo(scrim, { opacity: 0 }, { opacity: 1, duration: 0.3 }, 0.7);
      tl.fromTo(caption, { autoAlpha: 0, y: 28 }, { autoAlpha: 1, y: 0, ease: 'power3.out', duration: 0.3 }, 0.78);
    }, root);

    return () => mm.revert();
  }, [engine]);

  return (
    <section ref={rootRef} className={`cine-hero ${status === 'off' ? 'cine-hero--static' : ''}`} aria-labelledby="cine-hero-heading">
      <div className="cine-hero__stage">
        <div className="cine-hero__copy evo-container">
          <Eyebrow data-reveal-extra>{eyebrow}</Eyebrow>
          <h1 id="cine-hero-heading" data-reveal-heading className="cine-hero__title">
            <span className="block">{lead}</span> <em>{emphasis}</em>
          </h1>
          <p className="cine-hero__intro" data-reveal-extra>{intro}</p>
          <div className="cine-hero__actions" data-reveal-extra>
            <ButtonLink to={primary.to} data-cta={primary.cta}>
              {primary.label} <ArrowRight size={16} aria-hidden="true" />
            </ButtonLink>
            <ButtonLink to={secondary.to} variant="secondary" data-cta={secondary.cta}>
              {secondary.label}
            </ButtonLink>
          </div>
        </div>

        <figure className="cine-hero__window">
          <img
            src={media.src}
            srcSet={media.srcSet}
            sizes="100vw"
            width={media.width}
            height={media.height}
            alt={media.alt}
          />
          <div className="cine-hero__scrim" aria-hidden="true" />
          <figcaption className="cine-hero__caption evo-container">
            <span className="evo-eyebrow">{media.label}</span>
            <span className="cine-hero__caption-title">{media.title}</span>
            <span className="cine-hero__caption-text">{media.caption}</span>
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
