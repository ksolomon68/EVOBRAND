import React, { useLayoutEffect, useRef } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { useMotionState } from '@/lib/motion.js';
import { Eyebrow } from '@/components/system/Section.jsx';

const HEADER_OFFSET = 80;
const canHover = () => window.matchMedia('(hover: hover) and (pointer: fine)').matches;

function ReelCard({ project, index, total }) {
  return (
    <article className="reel-card">
      <a
        className="reel-card__link"
        href={project.url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`${project.title}: visit the live site (opens in new tab)`}
      >
        <div className="reel-card__media">
          <img
            src={project.image}
            width={project.width}
            height={project.height}
            alt={project.alt}
            loading="lazy"
            decoding="async"
          />
          <span className="reel-card__visit" aria-hidden="true">
            Visit site <ArrowUpRight size={16} />
          </span>
        </div>
      </a>
      <div className="reel-card__meta">
        <span className="reel-card__index" aria-hidden="true">
          {String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
        </span>
        <p className="evo-eyebrow">{project.type}</p>
        <h3 className="reel-card__title">{project.title}</h3>
        <p className="reel-card__text">{project.description}</p>
      </div>
    </article>
  );
}

/**
 * Selected work. Desktop: the reel pins and slides sideways as you scroll,
 * with each screenshot drifting inside its frame. Phones: a vertical stack
 * where each card opens from a clipped frame. Static grid when motion is off.
 */
export default function WorkReel({ label, lead, emphasis, intro, projects, footer }) {
  const { engine, status } = useMotionState();
  const rootRef = useRef(null);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!engine || !root) return undefined;
    const { gsap, ScrollTrigger, lenis } = engine;
    const viewport = root.querySelector('.reel__viewport');
    const track = root.querySelector('.reel__track');
    const cards = gsap.utils.toArray(root.querySelectorAll('.reel-card'));
    const bar = root.querySelector('.reel__progress span');
    const cleanups = [];

    const mm = gsap.matchMedia();
    mm.add({ large: '(min-width: 768px)', small: '(max-width: 767px)' }, (ctx) => {
      if (ctx.conditions.large) {
        const distance = () => track.scrollWidth - viewport.clientWidth;
        const slide = gsap.to(track, {
          x: () => -distance(),
          ease: 'none', // required for containerAnimation to map 1:1
          scrollTrigger: {
            trigger: viewport,
            start: `top top+=${HEADER_OFFSET}`,
            end: () => `+=${distance()}`,
            pin: true,
            pinType: 'transform', // transforms do not count as layout shift
            scrub: 1,
            invalidateOnRefresh: true,
            anticipatePin: 1,
            onUpdate: (self) => gsap.set(bar, { scaleX: self.progress }),
          },
        });

        cards.forEach((card) => {
          const img = card.querySelector('img');
          gsap.fromTo(img, { xPercent: -6, scale: 1.18 }, {
            xPercent: 6,
            scale: 1.18,
            ease: 'none',
            scrollTrigger: { trigger: card, containerAnimation: slide, start: 'left right', end: 'right left', scrub: true },
          });
          gsap.from(card.querySelector('.reel-card__meta'), {
            autoAlpha: 0,
            y: 30,
            duration: 0.9,
            ease: 'power3.out',
            scrollTrigger: { trigger: card, containerAnimation: slide, start: 'left 75%', toggleActions: 'play none none reverse' },
          });
        });

        // Keyboard users: tabbing to a card that is off to the side scrolls it into view.
        const onFocus = (e) => {
          const card = e.target.closest('.reel-card');
          const st = slide.scrollTrigger;
          if (!card || !st) return;
          const ratio = Math.min(1, Math.max(0, (card.offsetLeft - viewport.clientWidth * 0.1) / distance()));
          lenis.scrollTo(st.start + (st.end - st.start) * ratio, { immediate: true });
        };
        track.addEventListener('focusin', onFocus);
        return () => track.removeEventListener('focusin', onFocus);
      }

      // Phones: open each card from a clipped frame as it enters.
      cards.forEach((card) => {
        const media = card.querySelector('.reel-card__media');
        const img = card.querySelector('img');
        gsap.timeline({
          scrollTrigger: { trigger: card, start: 'top 88%', end: 'top 40%', scrub: 1 },
        })
          .fromTo(media, { clipPath: 'inset(12% 8% 12% 8% round 16px)' }, { clipPath: 'inset(0% 0% 0% 0% round 12px)', ease: 'none' }, 0)
          .fromTo(img, { scale: 1.25 }, { scale: 1, ease: 'none' }, 0);
      });
      return undefined;
    }, root);

    // Hover: the screenshot tilts toward the cursor.
    if (canHover()) {
      cards.forEach((card) => {
        const media = card.querySelector('.reel-card__media');
        gsap.set(media, { transformPerspective: 900 });
        const rx = gsap.quickTo(media, 'rotationX', { duration: 0.6, ease: 'power3.out' });
        const ry = gsap.quickTo(media, 'rotationY', { duration: 0.6, ease: 'power3.out' });
        const move = (e) => {
          const r = media.getBoundingClientRect();
          ry(((e.clientX - r.left) / r.width - 0.5) * 8);
          rx(-((e.clientY - r.top) / r.height - 0.5) * 6);
        };
        const leave = () => {
          rx(0);
          ry(0);
        };
        media.addEventListener('pointermove', move);
        media.addEventListener('pointerleave', leave);
        cleanups.push(() => {
          media.removeEventListener('pointermove', move);
          media.removeEventListener('pointerleave', leave);
          gsap.set(media, { clearProps: 'transform' });
        });
      });
    }

    ScrollTrigger.refresh();
    return () => {
      mm.revert();
      cleanups.forEach((fn) => fn());
    };
  }, [engine]);

  return (
    <section
      ref={rootRef}
      className={`reel ${status === 'off' ? 'reel--static' : ''}`}
      aria-labelledby="reel-heading"
    >
      <div className="reel__viewport">
        <div className="reel__track">
          <header className="reel__intro">
            <Eyebrow>{label}</Eyebrow>
            <h2 id="reel-heading" className="evo-heading">
              <span className="block">{lead}</span> <em>{emphasis}</em>
            </h2>
            <p className="evo-intro">{intro}</p>
            <div className="reel__progress" aria-hidden="true"><span /></div>
          </header>
          {projects.map((p, i) => (
            <ReelCard key={p.title} project={p} index={i} total={projects.length} />
          ))}
          {footer && <div className="reel__outro">{footer}</div>}
        </div>
      </div>
    </section>
  );
}
