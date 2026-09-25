import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { useMotion } from '@/lib/motion.js';
import { ProofLedger } from '@/components/system/Section.jsx';
import { ACADEMY } from '@/data/work.js';

const pad = (n) => String(n).padStart(2, '0');
const TOTAL = ACADEMY.runOfShow.reduce((sum, s) => sum + s.minutes, 0);
const AUTO_MS = 4200;

/**
 * EVOBRAND Academy spotlight, set in the Academy's own navy and gold so it
 * reads as a sister brand. The eight-session roadmap plays on its own until
 * someone points at it; the run-of-show bar fills as it scrolls into view.
 */
export default function AcademySpotlight() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [inView, setInView] = useState(false);
  const reduce = useReducedMotion();
  const motionEngine = useMotion();
  const rootRef = useRef(null);
  const session = ACADEMY.sessions[active];

  // Only auto-advance while the roadmap is on screen.
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return undefined;
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.35 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (reduce || paused || !inView) return undefined;
    const t = setTimeout(() => setActive((i) => (i + 1) % ACADEMY.sessions.length), AUTO_MS);
    return () => clearTimeout(t);
  }, [active, paused, inView, reduce]);

  // Run-of-show segments grow to their share of the 90 minutes.
  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!motionEngine || !root) return undefined;
    const { gsap } = motionEngine;
    const segs = root.querySelectorAll('.academy-show__seg');
    const tween = gsap.from(segs, {
      scaleX: 0,
      transformOrigin: 'left center',
      duration: 0.9,
      ease: 'expo.out',
      stagger: 0.12,
      scrollTrigger: { trigger: root.querySelector('.academy-show'), start: 'top 85%', once: true },
    });
    return () => {
      tween.scrollTrigger?.kill();
      tween.revert();
    };
  }, [motionEngine]);

  const onKey = (e) => {
    const n = ACADEMY.sessions.length;
    if (!['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(e.key)) return;
    e.preventDefault();
    const next = e.key === 'Home' ? 0 : e.key === 'End' ? n - 1 : (active + (e.key === 'ArrowRight' ? 1 : -1) + n) % n;
    setActive(next);
    setPaused(true);
    rootRef.current?.querySelector(`#academy-tab-${next}`)?.focus();
  };

  return (
    <section id="academy" ref={rootRef} className="academy" aria-labelledby="academy-heading">
      <div className="academy__grid-bg" aria-hidden="true" />
      <div className="evo-container academy__layout">
        <div className="academy__copy">
          <p className="academy__eyebrow">
            <img src="/brand/evo-sphere-256.webp" alt="" width="28" height="28" />
            EVOBRAND Academy · Featured
          </p>
          <h2 id="academy-heading" className="academy__title">
            Applied AI for leadership. <em>Built, not watched.</em>
          </h2>
          <p className="academy__intro">
            {ACADEMY.name} is an eight-month cohort where leaders don’t watch demos. They build.
            Every 90-minute, in-person session ends with a working asset you can deploy the next
            morning, with remote 1:1 coaching between sessions. Led by Keisha Solomon.
          </p>
          <ProofLedger className="academy__stats" items={ACADEMY.stats} />
          <div className="academy__actions">
            <a className="academy__btn academy__btn--primary" href={ACADEMY.url} target="_blank" rel="noopener noreferrer">
              Visit EVOBRAND Academy <ArrowUpRight size={16} aria-hidden="true" />
              <span className="sr-only"> (opens in new tab)</span>
            </a>
            <a className="academy__btn" href={`${ACADEMY.url}/#syllabus`} target="_blank" rel="noopener noreferrer">
              See the full syllabus<span className="sr-only"> (opens in new tab)</span>
            </a>
          </div>
        </div>

        <div
          className="academy__board"
          onPointerEnter={() => setPaused(true)}
          onPointerLeave={() => setPaused(false)}
          onFocus={() => setPaused(true)}
        >
          <p className="academy__label">Eight sessions · seven working assets</p>
          <div className="academy__tabs" role="tablist" aria-label="Academy sessions" onKeyDown={onKey}>
            {ACADEMY.sessions.map((s, i) => (
              <button
                key={s.title}
                id={`academy-tab-${i}`}
                type="button"
                role="tab"
                aria-selected={i === active}
                aria-controls="academy-panel"
                tabIndex={i === active ? 0 : -1}
                className={`academy__tab academy__tab--${s.focus.split(' ')[0].toLowerCase()}`}
                onClick={() => { setActive(i); setPaused(true); }}
              >
                <span>{i + 1}</span>
                {i === active && !reduce && !paused && inView && (
                  <span className="academy__tab-timer" style={{ animationDuration: `${AUTO_MS}ms` }} aria-hidden="true" />
                )}
              </button>
            ))}
          </div>

          <div id="academy-panel" role="tabpanel" aria-labelledby={`academy-tab-${active}`} className="academy__panel" aria-live="polite">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={active}
                initial={reduce ? false : { opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduce ? { opacity: 0 } : { opacity: 0, y: -10 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              >
                <p className="academy__meta">Session {active + 1} · Month {active + 1} · {session.focus}</p>
                <h3 className="academy__session">{session.title}</h3>
                <p className="academy__deliverable">
                  <span>{active === ACADEMY.sessions.length - 1 ? 'Outcome' : 'Deliverable'}</span>
                  {session.deliverable}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="academy-show">
            <p className="academy__label">Every session · the 90-minute run of show</p>
            <div className="academy-show__bar">
              {ACADEMY.runOfShow.map((seg) => (
                <span
                  key={seg.title}
                  className={`academy-show__seg academy-show__seg--${seg.tone}`}
                  style={{ flexGrow: seg.minutes }}
                  title={`${seg.title} · ${seg.minutes} min`}
                >
                  {pad(seg.minutes)}M
                </span>
              ))}
            </div>
            <ul className="academy-show__legend">
              {ACADEMY.runOfShow.map((seg) => (
                <li key={seg.title}>
                  <span className={`academy-show__key academy-show__seg--${seg.tone}`} aria-hidden="true" />
                  {seg.title} <em>{seg.minutes} min</em>
                </li>
              ))}
            </ul>
            <p className="sr-only">Total {TOTAL} minutes.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
