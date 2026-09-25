import React, { useLayoutEffect, useRef, useState } from 'react';
import { ArrowUpRight, RotateCw } from 'lucide-react';
import { useMotionState } from '@/lib/motion.js';
import { Eyebrow } from '@/components/system/Section.jsx';

const HEADER_OFFSET = 80;
const pad = (n) => String(n).padStart(2, '0');
const canHover = () => window.matchMedia('(hover: hover) and (pointer: fine)').matches;

/**
 * One project as a card that turns over. Front: the work. Back: case notes.
 * Mouse users flip it by hovering; everyone else uses the button. The hidden
 * face is inert, so keyboard and screen reader users only meet the face they see.
 */
function FlipCard({ project, index, total }) {
  const [flipped, setFlipped] = useState(false);
  const host = new URL(project.url).hostname.replace(/^www\./, '');

  return (
    <article
      className={`flip-card ${flipped ? 'is-flipped' : ''}`}
      aria-label={project.title}
      onPointerEnter={(e) => e.pointerType === 'mouse' && canHover() && setFlipped(true)}
      onPointerLeave={(e) => e.pointerType === 'mouse' && canHover() && setFlipped(false)}
    >
      <div className="flip-card__inner">
        <div className="flip-card__face flip-card__front" inert={flipped ? '' : undefined}>
          <div className="flip-card__top">
            <span className="flip-card__label">{project.type}</span>
            <span className="flip-card__index" aria-hidden="true">{pad(index + 1)} / {pad(total)}</span>
          </div>
          <div className="flip-card__media">
            <img
              src={project.image}
              width={project.width}
              height={project.height}
              alt={project.alt}
              loading="lazy"
              decoding="async"
            />
          </div>
          <div className="flip-card__bottom">
            <p className="flip-card__series">{project.series}</p>
            <h3 className="flip-card__title">{project.title}</h3>
            <button type="button" className="flip-card__toggle" onClick={() => setFlipped(true)}>
              <RotateCw size={14} aria-hidden="true" /> Case notes
            </button>
          </div>
        </div>

        <div className="flip-card__face flip-card__back" inert={flipped ? undefined : ''}>
          <div className="flip-card__top">
            <span className="flip-card__label">Case notes</span>
            <span className="flip-card__index" aria-hidden="true">{pad(index + 1)} / {pad(total)}</span>
          </div>
          <div className="flip-card__notes">
            <h3 className="flip-card__title">{project.title}</h3>
            <p>{project.description}</p>
            <dl className="flip-card__specs">
              <div><dt>Sector</dt><dd>{project.type}</dd></div>
              <div><dt>Live at</dt><dd>{host}</dd></div>
            </dl>
          </div>
          <div className="flip-card__actions">
            <a className="evo-btn evo-btn--primary" href={project.url} target="_blank" rel="noopener noreferrer">
              Visit site <ArrowUpRight size={16} aria-hidden="true" />
              <span className="sr-only"> (opens in new tab)</span>
            </a>
            <button type="button" className="flip-card__toggle" onClick={() => setFlipped(false)}>
              <RotateCw size={14} aria-hidden="true" /> Back to preview
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

/**
 * Velora-style menu reel in EVOBRAND colors. Desktop: the row pins and slides
 * sideways, with a 01 / 04 counter and a progress rule. Phones: a vertical
 * stack. Static grid when motion is off.
 */
export default function FlipReel({ label, lead, emphasis, intro, projects }) {
  const { engine, status } = useMotionState();
  const rootRef = useRef(null);
  const [active, setActive] = useState(0);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!engine || !root) return undefined;
    const { gsap, ScrollTrigger, lenis } = engine;
    const viewport = root.querySelector('.flip-reel__viewport');
    const track = root.querySelector('.flip-reel__track');
    const bar = root.querySelector('.flip-reel__bar span');
    const cards = gsap.utils.toArray(root.querySelectorAll('.flip-card'));

    const mm = gsap.matchMedia();
    mm.add({ large: '(min-width: 768px)', small: '(max-width: 767px)' }, (ctx) => {
      if (ctx.conditions.large) {
        const distance = () => Math.max(0, track.scrollWidth - viewport.clientWidth);
        const slide = gsap.to(track, {
          x: () => -distance(),
          ease: 'none',
          scrollTrigger: {
            trigger: root,
            start: `top top+=${HEADER_OFFSET}`,
            end: () => `+=${distance()}`,
            pin: true,
            pinType: 'transform',
            scrub: 1,
            invalidateOnRefresh: true,
            anticipatePin: 1,
            onUpdate: (self) => {
              gsap.set(bar, { scaleX: self.progress });
              setActive(Math.min(cards.length - 1, Math.floor(self.progress * cards.length)));
            },
          },
        });

        // Cards rise and settle as they reach the middle of the stage.
        cards.forEach((card) => {
          gsap.fromTo(card, { y: 60, rotate: 2 }, {
            y: 0,
            rotate: 0,
            ease: 'none',
            scrollTrigger: { trigger: card, containerAnimation: slide, start: 'left right', end: 'left 80%', scrub: true },
          });
        });

        const onFocus = (e) => {
          const card = e.target.closest('.flip-card');
          const st = slide.scrollTrigger;
          if (!card || !st) return;
          const ratio = Math.min(1, Math.max(0, (card.offsetLeft - viewport.clientWidth * 0.3) / distance()));
          lenis.scrollTo(st.start + (st.end - st.start) * ratio, { immediate: true });
        };
        track.addEventListener('focusin', onFocus);
        return () => track.removeEventListener('focusin', onFocus);
      }

      cards.forEach((card) => {
        gsap.from(card, {
          y: 50,
          autoAlpha: 0,
          duration: 0.9,
          ease: 'power3.out',
          scrollTrigger: { trigger: card, start: 'top 88%', toggleActions: 'play none none reverse' },
        });
      });
      return undefined;
    }, root);

    ScrollTrigger.refresh();
    return () => mm.revert();
  }, [engine]);

  return (
    <section
      ref={rootRef}
      className={`flip-reel ${status === 'off' ? 'flip-reel--static' : ''}`}
      aria-labelledby="flip-reel-heading"
      data-bp-tone="deep"
      data-bp-name="Work"
    >
      <div className="flip-reel__head">
        <div className="grid gap-space-s">
          <Eyebrow>{label}</Eyebrow>
          <h2 id="flip-reel-heading" className="evo-heading">
            <span className="block">{lead}</span> <em>{emphasis}</em>
          </h2>
        </div>
        <div className="flip-reel__meta">
          <p className="evo-intro">{intro}</p>
          <div className="flip-reel__status" aria-hidden="true">
            <span className="flip-reel__hint">Scroll to slide · Hover a card to flip</span>
            <span className="flip-reel__bar"><span /></span>
            <span className="flip-reel__count">{pad(active + 1)} / {pad(projects.length)}</span>
          </div>
        </div>
      </div>
      <div className="flip-reel__viewport">
        <div className="flip-reel__track">
          {projects.map((p, i) => (
            <FlipCard key={p.title} project={p} index={i} total={projects.length} />
          ))}
        </div>
      </div>
    </section>
  );
}
