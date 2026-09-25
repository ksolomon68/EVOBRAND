import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowUpRight, Menu, X } from 'lucide-react';
import { getLoadedMotion } from '@/lib/motion.js';

const NAV_LINKS = [
  { to: '/about', label: 'About' },
  { to: '/services', label: 'Services' },
  { to: '/our-work', label: 'Our work' },
  { to: '/how-it-works', label: 'Process' },
  { to: '/auditors', label: 'Free tools', matchPrefixes: ['/auditor', '/accessibility-checker'] },
  { to: '/resources', label: 'Resources' },
];

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const menuButtonRef = useRef(null);
  const closeButtonRef = useRef(null);
  const reduceMotion = useReducedMotion();
  const location = useLocation();

  const isLinkActive = (link) =>
    location.pathname === link.to || (link.matchPrefixes || []).some((prefix) => location.pathname.startsWith(prefix));

  useEffect(() => setMobileMenuOpen(false), [location.pathname]);

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
    return () => {
      cancelAnimationFrame(focusFrame);
      document.body.style.overflow = previous;
      lenis?.start();
      document.removeEventListener('keydown', onKeyDown);
      menuButtonRef.current?.focus();
    };
  }, [mobileMenuOpen]);

  const mobileNav = (
    <AnimatePresence>
      {mobileMenuOpen && (
        <motion.div
          className="site-menu"
          initial={reduceMotion ? false : { clipPath: 'inset(0 0 100% 0)' }}
          animate={{ clipPath: 'inset(0 0 0% 0)' }}
          exit={{ clipPath: 'inset(0 0 100% 0)' }}
          transition={{ duration: reduceMotion ? 0 : 0.65, ease: [0.76, 0, 0.24, 1] }}
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
            <nav aria-label="Mobile navigation">
              {NAV_LINKS.map((link, index) => (
                <NavLink key={link.to} to={link.to} className={isLinkActive(link) ? 'is-active' : ''}>
                  <span aria-hidden="true">0{index + 1}</span>{link.label}
                </NavLink>
              ))}
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

  return (
    <>
      <header className="site-header">
        <div className="site-header__inner evo-container">
          <Link to="/" className="site-brand" aria-label="EVOBRAND home">
            <img src="/logo.png" alt="EVOBRAND" />
            <span>Senior-led<br />since 1999</span>
          </Link>

          <nav className="site-header__nav" aria-label="Primary navigation">
            {NAV_LINKS.map((link) => (
              <NavLink key={link.to} to={link.to} className={isLinkActive(link) ? 'is-active' : ''}>
                {link.label}
              </NavLink>
            ))}
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
    </>
  );
}
