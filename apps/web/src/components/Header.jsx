
import React from 'react';
import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/about', label: 'About' },
    { to: '/services', label: 'Services' },
    { to: '/our-work', label: 'Our Work' },
    { to: '/how-it-works', label: 'How It Works' },
    { to: '/auditor', label: 'Brand Auditor' },
    { to: '/contact', label: 'Contact' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#1a2332] shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <NavLink to="/" className="flex items-center">
            <motion.img
              src="/logo.png"
              alt="EVOBRAND"
              className="h-[40px] md:h-[50px] lg:h-[60px] w-auto object-contain"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
            />
          </NavLink>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `text-sm font-medium transition-colors hover:text-[#22c8e5] ${
                    isActive ? 'text-[#22c8e5]' : 'text-white'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
            <NavLink
              to="/client-portal"
              className="text-sm font-bold text-[#22c8e5] hover:bg-[#22c8e5] hover:text-[#003258] transition-colors px-6 py-2 border-2 border-[#22c8e5] rounded-2xl"
            >
              Client Portal
            </NavLink>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden text-white hover:text-[#22c8e5] transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed top-20 right-0 bottom-0 w-64 bg-[#1a2332] shadow-2xl lg:hidden"
          >
            <nav className="flex flex-col p-6 space-y-4">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `text-lg font-medium transition-colors hover:text-[#22c8e5] ${
                      isActive ? 'text-[#22c8e5]' : 'text-white'
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
              <NavLink
                to="/client-portal"
                onClick={() => setMobileMenuOpen(false)}
                className="text-lg font-bold text-[#22c8e5] hover:bg-[#22c8e5] hover:text-[#003258] transition-colors px-6 py-3 border-2 border-[#22c8e5] rounded-2xl text-center mt-4"
              >
                Client Portal
              </NavLink>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
