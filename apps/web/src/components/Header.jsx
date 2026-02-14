
import React from 'react';
import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/services', label: 'Services' },
    { to: '/how-it-works', label: 'How It Works' },
    { to: '/our-work', label: 'Our Work' },
    { to: '/resources', label: 'Resources' },
    { to: '/about', label: 'About' },
    { to: '/contact', label: 'Contact' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#1a2332] shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <NavLink to="/" className="flex items-center">
            <motion.img
              src="https://horizons-cdn.hostinger.com/f8ddb934-4ef0-4d1d-923b-d5395cd33cb2/b98337c63b696e237f54f7a827b0e0d4.png"
              alt="EVOBRAND - AI Transformation Partner"
              className="h-[30px] md:h-[36px] lg:h-[48px] w-auto object-contain drop-shadow-md"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
              loading="lazy"
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
              className="text-sm font-medium text-white hover:text-[#22c8e5] transition-colors px-4 py-2 border border-[#22c8e5] rounded-md"
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
                className="text-lg font-medium text-white hover:text-[#22c8e5] transition-colors px-4 py-2 border border-[#22c8e5] rounded-md text-center"
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
