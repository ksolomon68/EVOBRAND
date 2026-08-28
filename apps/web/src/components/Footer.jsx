
import React from 'react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Facebook, Linkedin, Instagram, Youtube, Mail, Phone, MapPin } from 'lucide-react';

const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
  ? 'http://localhost:5000' 
  : window.location.origin;

const Footer = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle, loading, success, error
  const [message, setMessage] = useState('');

  const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;
    if (!isValidEmail(email)) {
      setStatus('error');
      setMessage('Enter a valid email address');
      setTimeout(() => {
        setStatus('idle');
        setMessage('');
      }, 5000);
      return;
    }
    setStatus('loading');
    try {
      const response = await fetch(`${API_BASE}/api/newsletter/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email }),
      });

      if (response.ok) {
        setStatus('success');
        setMessage('Subscribed!');
        setName('');
        setEmail('');
        setTimeout(() => {
          setStatus('idle');
          setMessage('');
        }, 3000);
      } else {
        const errorData = await response.json();
        setStatus('error');
        setMessage(errorData.error || 'Failed to subscribe');
        setTimeout(() => {
          setStatus('idle');
          setMessage('');
        }, 5000);
      }
    } catch (err) {
      setStatus('error');
      setMessage('Network error, try again later');
      setTimeout(() => {
        setStatus('idle');
        setMessage('');
      }, 5000);
    }
  };

  return (
    <footer className="bg-[#0f1419] text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Brand Section */}
          <div>
            <Link to="/" className="inline-block mb-4" aria-label="EVOBRAND — go to home page">
              <motion.img
                src="/logo.png"
                alt="EVOBRAND"
                className="h-[40px] md:h-[50px] lg:h-[60px] w-auto object-contain"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
              />
            </Link>
            <p className="text-gray-400 text-sm mb-4">
              AI Transformation Partner - Empowering businesses with cutting-edge AI solutions, custom applications, and intelligent automation.
            </p>
            <div className="flex gap-2">
              <a href="http://facebook.com/evobrandconcepts" target="_blank" rel="noopener noreferrer" className="min-w-[44px] min-h-[44px] inline-flex items-center justify-center text-gray-400 hover:text-[#22c8e5] transition-colors rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#22c8e5]" aria-label="EVOBRAND on Facebook (opens in new tab)">
                <Facebook size={20} aria-hidden="true" />
              </a>
              <a href="https://www.linkedin.com/company/evobrand-concepts/" target="_blank" rel="noopener noreferrer" className="min-w-[44px] min-h-[44px] inline-flex items-center justify-center text-gray-400 hover:text-[#22c8e5] transition-colors rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#22c8e5]" aria-label="EVOBRAND on LinkedIn (opens in new tab)">
                <Linkedin size={20} aria-hidden="true" />
              </a>
              <a href="https://www.instagram.com/evobrandconcepts" target="_blank" rel="noopener noreferrer" className="min-w-[44px] min-h-[44px] inline-flex items-center justify-center text-gray-400 hover:text-[#22c8e5] transition-colors rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#22c8e5]" aria-label="EVOBRAND on Instagram (opens in new tab)">
                <Instagram size={20} aria-hidden="true" />
              </a>
              <a href="https://www.youtube.com/channel/UC8z66n8_seQVY5PjBEDMM7w" target="_blank" rel="noopener noreferrer" className="min-w-[44px] min-h-[44px] inline-flex items-center justify-center text-gray-400 hover:text-[#22c8e5] transition-colors rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#22c8e5]" aria-label="EVOBRAND on YouTube (opens in new tab)">
                <Youtube size={20} aria-hidden="true" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-[#22c8e5]">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link to="/services" className="text-gray-400 hover:text-[#22c8e5] transition-colors text-sm">Services</Link></li>
              <li><Link to="/book-consultation" className="text-gray-400 hover:text-[#22c8e5] transition-colors text-sm">Book Consultation</Link></li>
              <li><Link to="/about" className="text-gray-400 hover:text-[#22c8e5] transition-colors text-sm">About</Link></li>
              <li><Link to="/contact" className="text-gray-400 hover:text-[#22c8e5] transition-colors text-sm">Contact</Link></li>
              <li><Link to="/auditors" className="text-gray-400 hover:text-[#22c8e5] transition-colors text-sm">Auditors</Link></li>
              <li><Link to="/accessibility-statement" className="text-gray-400 hover:text-[#22c8e5] transition-colors text-sm">Accessibility Statement</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-[#22c8e5]">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-center space-x-2 text-gray-400 text-sm">
                <Phone size={16} className="text-[#22c8e5]" aria-hidden="true" />
                <a href="tel:+12145314427" className="hover:text-[#22c8e5] transition-colors">+1 214-531-4427</a>
              </li>
              <li className="flex items-center space-x-2 text-gray-400 text-sm">
                <Mail size={16} className="text-[#22c8e5]" aria-hidden="true" />
                <a href="mailto:info@evobrand.net" className="hover:text-[#22c8e5] transition-colors">
                  info@evobrand.net <span className="sr-only">(opens email client)</span>
                </a>
              </li>
              <li className="flex items-start space-x-2 text-gray-400 text-sm">
                <MapPin size={16} className="text-[#22c8e5] mt-1" aria-hidden="true" />
                <span>Ellis County, Texas</span>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-[#22c8e5]">Newsletter</h3>
            <p className="text-gray-400 text-sm mb-4">Stay updated with AI trends and insights.</p>
            <form onSubmit={handleNewsletterSubmit} className="space-y-2">
              <label htmlFor="footer-newsletter-name" className="sr-only">Name</label>
              <input
                id="footer-newsletter-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="w-full px-4 py-2 bg-[#1a2332] text-white border border-gray-700 rounded-2xl focus:outline-none focus:border-[#22c8e5] text-sm"
                required
              />
              <label htmlFor="footer-newsletter-email" className="sr-only">Email address</label>
              <input
                id="footer-newsletter-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email"
                className="w-full px-4 py-2 bg-[#1a2332] text-white border border-gray-700 rounded-2xl focus:outline-none focus:border-[#22c8e5] text-sm"
                required
              />
              <button
                type="submit"
                disabled={status === 'loading'}
                className={`w-full px-4 py-2 rounded-2xl transition-colors text-sm font-medium ${status === 'success' ? 'bg-green-500 hover:bg-green-600 text-white' :
                    status === 'error' ? 'bg-red-500 hover:bg-red-600 text-white' :
                      'bg-[#22c8e5] hover:bg-[#1ba3c0] text-[#003258]'
                  } disabled:opacity-50`}
              >
                {status === 'loading' ? 'Subscribing...' :
                  status === 'success' ? 'Subscribed!' :
                    status === 'error' ? 'Failed' :
                      'Subscribe'}
              </button>
              {status === 'error' && (
                <p className="text-red-400 text-xs mt-2">{message}</p>
              )}
            </form>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="border-t border-gray-800 pt-8 mb-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="bg-[#1a2332] p-4 rounded-lg">
              <p className="text-xs font-semibold text-[#22c8e5]">SOC 2 Certified</p>
            </div>
            <div className="bg-[#1a2332] p-4 rounded-lg">
              <p className="text-xs font-semibold text-[#22c8e5]">GDPR Compliant</p>
            </div>
            <div className="bg-[#1a2332] p-4 rounded-lg">
              <p className="text-xs font-semibold text-[#22c8e5]">US Data Sovereignty</p>
            </div>
            <div className="bg-[#1a2332] p-4 rounded-lg">
              <p className="text-xs font-semibold text-[#22c8e5]">EU AI Act Ready</p>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-800 pt-6 text-center">
          <p className="text-gray-400 text-sm">
            © {new Date().getFullYear()} EVOBRAND. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
