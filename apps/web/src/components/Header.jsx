import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { to: '/about', label: 'About' },
    { to: '/services', label: 'Services' },
    { to: '/our-work', label: 'Our Work' },
    { to: '/how-it-works', label: 'How It Works' },
    { to: '/auditors', label: 'Free tools', matchPrefixes: ['/auditor', '/accessibility-checker'] },
    { to: '/resources', label: 'Resources' },
  ];

  const isLinkActive = (link) =>
    location.pathname === link.to || (link.matchPrefixes || []).some((p) => location.pathname.startsWith(p));

  // Render the overlay + drawer via a portal so they escape the sticky header's stacking context
  const mobileDrawer = (
    <AnimatePresence>
      {mobileMenuOpen && (
        <>
          {/* Full-Screen Dark Glass Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setMobileMenuOpen(false)}
            style={{ position: 'fixed', inset: 0, zIndex: 9998 }}
            className="bg-black/80 backdrop-blur-md xl:hidden"
            aria-hidden="true"
          />

          {/* Mobile Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            style={{ position: 'fixed', top: 0, right: 0, bottom: 0, zIndex: 9999 }}
            className="w-80 max-w-[85vw] bg-[#101b2b] border-l border-white/10 xl:hidden flex flex-col shadow-2xl shadow-black/80"
            id="mobile-nav"
          >
            {/* Drawer Top Header Row */}
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <div className="flex items-center">
                <img src="/logo.png" alt="EVOBRAND" className="h-[28px] w-auto object-contain" />
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="bg-[#1a2332] text-[#22c8e5] hover:text-white border border-white/10 hover:border-[#22c8e5]/40 p-2 rounded-xl transition-all"
                aria-label="Close menu"
              >
                <X size={22} />
              </button>
            </div>

            {/* Drawer Nav Links */}
            <nav className="flex flex-col p-6 space-y-2 overflow-y-auto flex-1" aria-label="Mobile navigation">
              {navLinks.map((link) => {
                const active = isLinkActive(link);
                return (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`text-base font-semibold px-4 py-3 rounded-2xl transition-all ${
                      active
                        ? 'text-[#22c8e5] bg-[#22c8e5]/15 border border-[#22c8e5]/30'
                        : 'text-gray-200 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {link.label}
                  </NavLink>
                );
              })}

              <div className="pt-6 border-t border-white/10 space-y-3 mt-4">
                <NavLink
                  to="/book-consultation"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-base font-bold bg-[#22c8e5] text-[#003258] hover:bg-[#1ba3c0] active:scale-[0.98] transition-all px-6 py-3.5 rounded-2xl text-center shadow-lg shadow-[#22c8e5]/20"
                >
                  Book a strategy call
                </NavLink>
                <NavLink
                  to="/client-portal"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-base font-bold text-[#22c8e5] bg-[#1a2332]/80 hover:bg-[#22c8e5] hover:text-[#003258] border border-[#22c8e5]/40 hover:border-[#22c8e5] active:scale-[0.98] transition-all px-6 py-3.5 rounded-2xl text-center shadow-sm"
                >
                  Client Portal
                </NavLink>
              </div>
            </nav>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  return (
    <>
      <header className="sticky top-0 bg-[#101b2b]/95 border-b border-white/10 backdrop-blur-md" style={{ zIndex: 100 }}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <NavLink to="/" className="flex items-center" aria-label="EVOBRAND — go to home page">
              <motion.img
                src="/logo.png"
                alt="EVOBRAND"
                className="h-[32px] md:h-[36px] w-auto object-contain"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
              />
            </NavLink>

            {/* Desktop Navigation */}
            <nav className="hidden xl:flex items-center space-x-2">
              {navLinks.map((link) => {
                const active = isLinkActive(link);
                return (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    className={`text-sm font-medium px-3.5 py-2 rounded-xl transition-all duration-200 ${
                      active
                        ? 'text-[#22c8e5] bg-[#22c8e5]/10 border border-[#22c8e5]/20 shadow-sm'
                        : 'text-gray-200 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {link.label}
                  </NavLink>
                );
              })}
              <div className="h-6 w-px bg-white/10 mx-2" aria-hidden="true" />
              <NavLink
                to="/book-consultation"
                className="text-sm font-bold bg-[#22c8e5] text-[#003258] hover:bg-[#1ba3c0] hover:shadow-lg hover:shadow-[#22c8e5]/25 hover:scale-[1.02] active:scale-[0.98] transition-all px-5 py-2.5 rounded-2xl whitespace-nowrap shadow-md shadow-[#22c8e5]/15"
              >
                Book a strategy call
              </NavLink>
              <NavLink
                to="/client-portal"
                className="text-sm font-bold text-[#22c8e5] bg-[#1a2332]/80 hover:bg-[#22c8e5] hover:text-[#003258] border border-[#22c8e5]/40 hover:border-[#22c8e5] hover:scale-[1.02] active:scale-[0.98] transition-all px-5 py-2.5 rounded-2xl shadow-sm whitespace-nowrap"
              >
                Client Portal
              </NavLink>
            </nav>

            {/* Mobile Menu Button */}
            <motion.button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="xl:hidden bg-[#1a2332] text-white hover:text-[#22c8e5] border border-white/10 hover:border-[#22c8e5]/40 transition-all p-2.5 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl shadow-md shadow-black/20"
              aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-nav"
            >
              {mobileMenuOpen ? <X size={24} className="text-[#22c8e5]" /> : <Menu size={24} />}
            </motion.button>
          </div>
        </div>
      </header>

      {/* Portal: renders drawer outside header to avoid stacking context trap */}
      {typeof document !== 'undefined' && createPortal(mobileDrawer, document.body)}
    </>
  );
};

export default Header;
