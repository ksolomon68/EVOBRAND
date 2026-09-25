import React, { useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ExternalLink } from 'lucide-react';

const pad = (n) => String(n).padStart(2, '0');

/**
 * Dashboard demos as one stage instead of a wall of thumbnails: a list of
 * demos (tabs) beside a single preview window. Hover or arrow keys switch
 * the preview; the button opens the live demo.
 */
export default function DemoExplorer({ demos }) {
  const [active, setActive] = useState(0);
  const reduce = useReducedMotion();
  const listRef = useRef(null);
  const demo = demos[active];

  const onKey = (e) => {
    const n = demos.length;
    const keys = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 };
    let next;
    if (e.key in keys) next = (active + keys[e.key] + n) % n;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = n - 1;
    else return;
    e.preventDefault();
    setActive(next);
    listRef.current?.querySelector(`#demo-tab-${next}`)?.focus();
  };

  return (
    <div className="demo-x">
      <div ref={listRef} className="demo-x__list" role="tablist" aria-label="Dashboard demos" aria-orientation="vertical" onKeyDown={onKey}>
        {demos.map((d, i) => (
          <button
            key={d.id}
            id={`demo-tab-${i}`}
            type="button"
            role="tab"
            aria-selected={i === active}
            aria-controls="demo-panel"
            tabIndex={i === active ? 0 : -1}
            className="demo-x__tab"
            onClick={() => setActive(i)}
            onPointerEnter={(e) => e.pointerType === 'mouse' && setActive(i)}
          >
            <span className="demo-x__num" aria-hidden="true">{pad(i + 1)}</span>
            <span className="demo-x__tab-text">
              <span className="demo-x__tab-title">{d.title}</span>
              <span className="demo-x__tab-sub">{d.subtitle}</span>
            </span>
            {i === active && <motion.span layoutId={reduce ? undefined : 'demo-x-marker'} className="demo-x__marker" aria-hidden="true" />}
          </button>
        ))}
      </div>

      <div id="demo-panel" role="tabpanel" aria-labelledby={`demo-tab-${active}`} className="demo-x__stage">
        <div className="demo-x__window">
          <div className="demo-x__chrome" aria-hidden="true">
            <i /><i /><i />
            <span>{demo.link.replace(/^https?:\/\//, '').replace(/\/$/, '')}</span>
            <em className="work-card__live"><span />Live</em>
          </div>
          <div className="demo-x__screen">
            <AnimatePresence initial={false}>
              <motion.img
                key={demo.id}
                src={demo.image}
                alt={`${demo.title} dashboard`}
                loading="lazy"
                decoding="async"
                initial={reduce ? false : { opacity: 0, scale: 1.04 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              />
            </AnimatePresence>
          </div>
        </div>

        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={demo.id}
            className="demo-x__info"
            initial={reduce ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: -6 }}
            transition={{ duration: 0.3 }}
          >
            <div>
              <p className="work-card__meta">{demo.industry}</p>
              <h3 className="demo-x__title">{demo.title}</h3>
              <p className="work-card__text">{demo.description}</p>
              <ul className="work-card__chips">
                {demo.highlights.map((h) => <li key={h}>{h}</li>)}
              </ul>
            </div>
            <a className="evo-btn evo-btn--primary" href={demo.link} target="_blank" rel="noopener noreferrer">
              Launch the demo <ExternalLink size={15} aria-hidden="true" />
              <span className="sr-only"> (opens in new tab)</span>
            </a>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
