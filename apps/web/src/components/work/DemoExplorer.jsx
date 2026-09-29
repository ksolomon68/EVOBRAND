import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';

const pad = (n) => String(n).padStart(2, '0');

/**
 * Dashboard demos explorer:
 * - Desktop: compact scrollable sidebar tab list + sticky preview stage
 * - Mobile: compact horizontal pill strip + swipeable preview stage with prev/next navigation
 */
export default function DemoExplorer({ demos }) {
  const [active, setActive] = useState(0);
  const [direction, setDirection] = useState(1);
  const reduce = useReducedMotion();
  const listRef = useRef(null);
  const stageRef = useRef(null);
  const demo = demos[active];
  const n = demos.length;

  const selectTab = (i) => {
    setDirection(i >= active ? 1 : -1);
    setActive(i);
    const tabEl = listRef.current?.querySelector(`#demo-tab-${i}`);
    if (tabEl) {
      tabEl.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' });
    }
  };

  const nextDemo = () => selectTab((active + 1) % n);
  const prevDemo = () => selectTab((active - 1 + n) % n);

  const onKey = (e) => {
    const keys = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 };
    let next;
    if (e.key in keys) next = (active + keys[e.key] + n) % n;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = n - 1;
    else return;
    e.preventDefault();
    selectTab(next);
    listRef.current?.querySelector(`#demo-tab-${next}`)?.focus();
  };

  const handleDragEnd = (_, info) => {
    const swipeThreshold = 40;
    if (info.offset.x < -swipeThreshold) {
      nextDemo();
    } else if (info.offset.x > swipeThreshold) {
      prevDemo();
    }
  };

  return (
    <div className="demo-x" ref={stageRef}>
      {/* Tab list (Sidebar on desktop, horizontal pill strip on mobile) */}
      <div
        ref={listRef}
        className="demo-x__list"
        role="tablist"
        aria-label="Dashboard demos"
        aria-orientation="vertical"
        onKeyDown={onKey}
      >
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
            onClick={() => selectTab(i)}
            onPointerEnter={(e) => e.pointerType === 'mouse' && selectTab(i)}
          >
            <span className="demo-x__num" aria-hidden="true">{pad(i + 1)}</span>
            <span className="demo-x__tab-text">
              <span className="demo-x__tab-title">{d.title}</span>
              <span className="demo-x__tab-sub">{d.subtitle}</span>
            </span>
            {i === active && (
              <motion.span
                layoutId={reduce ? undefined : 'demo-x-marker'}
                className="demo-x__marker"
                aria-hidden="true"
              />
            )}
          </button>
        ))}
      </div>

      {/* Main Preview Stage */}
      <div id="demo-panel" role="tabpanel" aria-labelledby={`demo-tab-${active}`} className="demo-x__stage">
        <div className="demo-x__window">
          <div className="demo-x__chrome" aria-hidden="true">
            <div className="demo-x__dots">
              <i /><i /><i />
            </div>
            <span className="demo-x__url">{demo.link.replace(/^https?:\/\//, '').replace(/\/$/, '')}</span>
            <div className="demo-x__chrome-actions">
              <span className="demo-x__counter">{pad(active + 1)} / {pad(n)}</span>
              <em className="work-card__live"><span />Live</em>
            </div>
          </div>

          {/* Swipeable Screen Preview */}
          <motion.div
            className="demo-x__screen"
            drag={reduce ? false : "x"}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.15}
            onDragEnd={handleDragEnd}
          >
            <AnimatePresence initial={false} custom={direction} mode="wait">
              <motion.img
                key={demo.id}
                src={demo.image}
                alt={`${demo.title} dashboard`}
                loading="lazy"
                decoding="async"
                custom={direction}
                initial={reduce ? false : { opacity: 0, x: direction * 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={reduce ? { opacity: 0 } : { opacity: 0, x: direction * -20 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              />
            </AnimatePresence>

            {/* Mobile Quick Nav Overlays */}
            <div className="demo-x__nav-overlay">
              <button
                type="button"
                className="demo-x__nav-btn demo-x__nav-btn--prev"
                onClick={prevDemo}
                aria-label="Previous demo"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                type="button"
                className="demo-x__nav-btn demo-x__nav-btn--next"
                onClick={nextDemo}
                aria-label="Next demo"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </motion.div>
        </div>

        {/* Compact Info Card */}
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={demo.id}
            className="demo-x__info"
            initial={reduce ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: -6 }}
            transition={{ duration: 0.25 }}
          >
            <div className="demo-x__details">
              <div className="demo-x__meta-row">
                <span className="work-card__meta">{demo.industry}</span>
                <span className="demo-x__mobile-index">{pad(active + 1)} of {pad(n)}</span>
              </div>
              <h3 className="demo-x__title">{demo.title}</h3>
              <p className="work-card__text">{demo.description}</p>
              <ul className="work-card__chips">
                {demo.highlights.map((h) => (
                  <li key={h}>{h}</li>
                ))}
              </ul>
            </div>
            <div className="demo-x__actions">
              <a
                className="evo-btn evo-btn--primary"
                href={demo.link}
                target="_blank"
                rel="noopener noreferrer"
              >
                Launch demo <ExternalLink size={14} aria-hidden="true" />
                <span className="sr-only"> (opens in new tab)</span>
              </a>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
