import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, useLocation } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowUpRight, ChevronDown, Menu, Users, X } from 'lucide-react';
import { getLoadedMotion } from '@/lib/motion.js';
import { NAV_GROUPS, PORTAL_LINK } from '@/data/navigation.js';

const EASE = [0.22, 1, 0.36, 1];
const OPEN_DELAY = 90;
const CLOSE_DELAY = 220;

const isGroupActive = (group, pathname) => group.match.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));

/** Left column of a panel: a framed card with an image, a serif line and one CTA. */
function FeatureCard({ feature, onNavigate }) {
  return (
    <div className={`mega-feature ${feature.image ? '' : 'mega-feature--plain'}`}>
      {feature.image && <img src={feature.image} alt="" loading="lazy" decoding="async" />}
      <div className="mega-feature__body">
        <p className="mega-feature__eyebrow">{feature.eyebrow}</p>
        <p className="mega-feature__line">
          {feature.lead} <em>{feature.emphasis}</em>
        </p>
        <Link to={feature.cta.to} className="mega-feature__cta" onClick={onNavigate}>
          {feature.cta.label} <ArrowUpRight size={18} aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}

const listVariants = { open: { transition: { staggerChildren: 0.035, delayChildren: 0.08 } } };
const itemVariants = {
  closed: { opacity: 0, y: 10 },
  open: { opacity: 1, y: 0, transition: { duration: 0.45, ease: EASE } },
};

function MegaPanel({ group, reduce, onNavigate }) {
  return (
    <motion.div
      id={`mega-${group.id}`}
      className="mega-panel"
      initial={reduce ? false : { opacity: 0, y: -10, clipPath: 'inset(0% 0% 12% 0% round 28px)' }}
      animate={{ opacity: 1, y: 0, clipPath: 'inset(0% 0% 0% 0% round 28px)' }}
      exit={reduce ? { opacity: 0 } : { opacity: 0, y: -6, transition: { duration: 0.16 } }}
      transition={{ duration: 0.5, ease: EASE }}
    >
      <FeatureCard feature={group.feature} onNavigate={onNavigate} />
      <div className="mega-panel__main">
        <div className="mega-panel__head">
          <p className="mega-panel__title">{group.title}</p>
          <Link to={group.to} className="mega-panel__overview" onClick={onNavigate}>
            View overview <ArrowUpRight size={16} aria-hidden="true" />
          </Link>
        </div>
        <motion.ul className="mega-grid" variants={listVariants} initial={reduce ? false : 'closed'} animate="open">
          {group.items.map((item) => {
            const Icon = item.icon;
            return (
              <motion.li key={item.to + item.title} variants={itemVariants}>
                <Link to={item.to} className="mega-link" onClick={onNavigate}>
                  <span className="mega-link__icon" aria-hidden="true"><Icon size={20} strokeWidth={1.6} /></span>
                  <span className="mega-link__text">
                    <span className="mega-link__title">{item.title}</span>
                    <span className="mega-link__body">{item.body}</span>
                  </span>
                  <ArrowUpRight className="mega-link__arrow" size={16} aria-hidden="true" />
                </Link>
              </motion.li>
            );
          })}
        </motion.ul>
        <Link to={PORTAL_LINK.to} className="mega-portal" onClick={onNavigate}>
          <Users size={22} strokeWidth={1.6} aria-hidden="true" />
          <span>
            <span className="mega-portal__note">{PORTAL_LINK.note}</span>
            <span className="mega-portal__label">{PORTAL_LINK.label}</span>
          </span>
          <ArrowUpRight size={20} aria-hidden="true" />
        </Link>
      </div>
    </motion.div>
  );
}

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openId, setOpenId] = useState(null);
  const [mobileGroup, setMobileGroup] = useState(null);
  const menuButtonRef = useRef(null);
  const closeButtonRef = useRef(null);
  const headerRef = useRef(null);
  const timer = useRef(null);
  const reduce = useReducedMotion();
  const { pathname, hash } = useLocation();

  const clearTimer = () => clearTimeout(timer.current);
  const openLater = (id) => {
    clearTimer();
    timer.current = setTimeout(() => setOpenId(id), openId ? 0 : OPEN_DELAY);
  };
  const closeLater = () => {
    clearTimer();
    timer.current = setTimeout(() => setOpenId(null), CLOSE_DELAY);
  };
  const closeNow = useCallback(() => {
    clearTimer();
    setOpenId(null);
  }, []);

  useEffect(() => {
    closeNow();
    setMobileMenuOpen(false);
  }, [pathname, hash, closeNow]);

  useEffect(() => () => clearTimer(), []);

  // Escape closes the open panel and returns focus to its trigger.
  useEffect(() => {
    if (!openId) return undefined;
    const onKey = (e) => {
      if (e.key !== 'Escape') return;
      const trigger = headerRef.current?.querySelector(`[aria-controls="mega-${openId}"]`);
      closeNow();
      trigger?.focus();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [openId, closeNow]);

  // Keyboard focus leaving the header closes the panel.
  const onHeaderBlur = (e) => {
    if (openId && !headerRef.current?.contains(e.relatedTarget)) closeNow();
  };

  useEffect(() => {
    if (!mobileMenuOpen) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    // Smooth scrolling drives the page from wheel and touch events, so it has
    // to be paused too or the page keeps moving behind the open menu.
    const lenis = getLoadedMotion()?.lenis;
    lenis?.stop();
    const focusFrame = requestAnimationFrame(() => closeButtonRef.current?.focus());
    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        setMobileMenuOpen(false);
        return;
      }
      if (event.key !== 'Tab') return;
      const focusable = [...document.querySelectorAll('#mobile-nav a[href], #mobile-nav button:not([disabled])')];
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    const button = menuButtonRef.current;
    return () => {
      cancelAnimationFrame(focusFrame);
      document.body.style.overflow = previous;
      lenis?.start();
      document.removeEventListener('keydown', onKeyDown);
      button?.focus();
    };
  }, [mobileMenuOpen]);

  const mobileNav = (
    <AnimatePresence>
      {mobileMenuOpen && (
        <motion.div
          className="site-menu"
          initial={reduce ? false : { clipPath: 'inset(0 0 100% 0)' }}
          animate={{ clipPath: 'inset(0 0 0% 0)' }}
          exit={{ clipPath: 'inset(0 0 100% 0)' }}
          transition={{ duration: reduce ? 0 : 0.65, ease: [0.76, 0, 0.24, 1] }}
          id="mobile-nav"
          data-lenis-prevent
          role="dialog"
          aria-modal="true"
          aria-label="Site navigation"
        >
          <div className="site-menu__top evo-container">
            <Link to="/" className="site-brand" aria-label="EVOBRAND home">
              <img src="/logo.png" alt="EVOBRAND" />
            </Link>
            <button ref={closeButtonRef} type="button" className="site-menu__close tap-target" onClick={() => setMobileMenuOpen(false)} aria-label="Close navigation menu">
              <X size={24} aria-hidden="true" />
            </button>
          </div>
          <div className="site-menu__body evo-container">
            <p className="evo-eyebrow">Navigate</p>
            <nav aria-label="Mobile navigation" className="site-menu__groups">
              {NAV_GROUPS.map((group, index) => {
                const expanded = mobileGroup === group.id;
                return (
                  <div key={group.id} className={`site-menu__group ${isGroupActive(group, pathname) ? 'is-active' : ''}`}>
                    <button
                      type="button"
                      className="site-menu__trigger"
                      aria-expanded={expanded}
                      aria-controls={`mobile-${group.id}`}
                      onClick={() => setMobileGroup(expanded ? null : group.id)}
                    >
                      <span aria-hidden="true">0{index + 1}</span>
                      {group.label}
                      <ChevronDown className="site-menu__chevron" size={22} aria-hidden="true" />
                    </button>
                    <AnimatePresence initial={false}>
                      {expanded && (
                        <motion.div
                          id={`mobile-${group.id}`}
                          className="site-menu__panel"
                          initial={reduce ? false : { height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
                          transition={{ duration: 0.4, ease: EASE }}
                        >
                          <ul>
                            <li>
                              <Link to={group.to} className="site-menu__overview">
                                {group.title} overview <ArrowUpRight size={16} aria-hidden="true" />
                              </Link>
                            </li>
                            {group.items.map((item) => {
                              const Icon = item.icon;
                              return (
                                <li key={item.to + item.title}>
                                  <Link to={item.to} className="mega-link">
                                    <span className="mega-link__icon" aria-hidden="true"><Icon size={18} strokeWidth={1.6} /></span>
                                    <span className="mega-link__text">
                                      <span className="mega-link__title">{item.title}</span>
                                      <span className="mega-link__body">{item.body}</span>
                                    </span>
                                  </Link>
                                </li>
                              );
                            })}
                          </ul>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </nav>
            <div className="site-menu__foot">
              <Link to="/book-consultation" className="evo-btn evo-btn--primary">Book a strategy call <ArrowUpRight size={16} /></Link>
              <Link to="/client-portal" className="site-menu__portal">Client portal <ArrowUpRight size={15} /></Link>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  const scrim = (
    <AnimatePresence>
      {openId && (
        <motion.div
          className="mega-scrim"
          aria-hidden="true"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={closeNow}
        />
      )}
    </AnimatePresence>
  );

  return (
    <>
      <header
        ref={headerRef}
        className={`site-header ${openId ? 'is-open' : ''}`}
        onPointerLeave={(e) => e.pointerType === 'mouse' && closeLater()}
        onPointerEnter={clearTimer}
        onBlur={onHeaderBlur}
      >
        <div className="site-header__inner evo-container">
          <Link to="/" className="site-brand" aria-label="EVOBRAND home">
            <img src="/logo.png" alt="EVOBRAND" />
            <span>Senior-led<br />since 1999</span>
          </Link>

          <nav className="site-header__nav" aria-label="Primary navigation">
            {NAV_GROUPS.map((group) => {
              const open = openId === group.id;
              return (
                <div className="mega-item" key={group.id}>
                  <button
                    type="button"
                    className={`mega-trigger ${isGroupActive(group, pathname) ? 'is-active' : ''} ${open ? 'is-open' : ''}`}
                    aria-expanded={open}
                    aria-controls={`mega-${group.id}`}
                    onClick={() => (open ? closeNow() : (clearTimer(), setOpenId(group.id)))}
                    onPointerEnter={(e) => e.pointerType === 'mouse' && openLater(group.id)}
                  >
                    {group.label}
                    <ChevronDown size={15} aria-hidden="true" />
                  </button>
                  <AnimatePresence>
                    {open && <MegaPanel group={group} reduce={reduce} onNavigate={closeNow} />}
                  </AnimatePresence>
                </div>
              );
            })}
          </nav>

          <div className="site-header__actions">
            <Link to="/client-portal" className="site-header__portal">Client portal</Link>
            <Link to="/book-consultation" className="site-header__cta">Let’s talk <ArrowUpRight size={15} aria-hidden="true" /></Link>
          </div>

          <button
            ref={menuButtonRef}
            type="button"
            className="site-header__menu tap-target"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open navigation menu"
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-nav"
          >
            <Menu size={22} aria-hidden="true" />
          </button>
        </div>
      </header>
      {typeof document !== 'undefined' && createPortal(mobileNav, document.body)}
      {typeof document !== 'undefined' && createPortal(scrim, document.body)}
    </>
  );
}
