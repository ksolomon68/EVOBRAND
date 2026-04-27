
import React from 'react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Facebook, Linkedin, Instagram, Youtube, Mail, Phone, MapPin } from 'lucide-react';

import { subscribeToNewsletter } from '../services/mailchimp';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle, loading, success, error
  const [message, setMessage] = useState('');

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    if (email) {
      setStatus('loading');
      const result = await subscribeToNewsletter(email);

      if (result.success) {
        setStatus('success');
        setMessage('Subscribed!');
        setEmail('');
        setTimeout(() => {
          setStatus('idle');
          setMessage('');
        }, 3000);
      } else {
        setStatus('error');
        setMessage(result.message);
        setTimeout(() => {
          setStatus('idle');
          setMessage('');
        }, 5000);
      }
    }
  };

  return (
    <footer className="bg-[#0f1419] text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Brand Section */}
          <div>
            <Link to="/" className="inline-block mb-4">
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
            <div className="flex space-x-4">
              <a href="http://facebook.com/evobrandconcepts" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#22c8e5] transition-colors">
                <Facebook size={20} />
              </a>
              <a href="https://www.linkedin.com/company/evobrand-concepts/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#22c8e5] transition-colors">
                <Linkedin size={20} />
              </a>
              <a href="https://www.instagram.com/evobrandconcepts" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#22c8e5] transition-colors">
                <Instagram size={20} />
              </a>
              <a href="https://www.youtube.com/channel/UC8z66n8_seQVY5PjBEDMM7w" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#22c8e5] transition-colors">
                <Youtube size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-[#22c8e5]">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link to="/services" className="text-gray-400 hover:text-[#22c8e5] transition-colors text-sm">Services</Link></li>
              <li><Link to="/about" className="text-gray-400 hover:text-[#22c8e5] transition-colors text-sm">About</Link></li>
              <li><Link to="/contact" className="text-gray-400 hover:text-[#22c8e5] transition-colors text-sm">Contact</Link></li>
              <li><Link to="/resources" className="text-gray-400 hover:text-[#22c8e5] transition-colors text-sm">Resources</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-[#22c8e5]">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-center space-x-2 text-gray-400 text-sm">
                <Phone size={16} className="text-[#22c8e5]" />
                <a href="tel:+12145314427" className="hover:text-[#22c8e5] transition-colors">+1 214-531-4427</a>
              </li>
              <li className="flex items-center space-x-2 text-gray-400 text-sm">
                <Mail size={16} className="text-[#22c8e5]" />
                <a href="mailto:info@evobrand.net" className="hover:text-[#22c8e5] transition-colors">info@evobrand.net</a>
              </li>
              <li className="flex items-start space-x-2 text-gray-400 text-sm">
                <MapPin size={16} className="text-[#22c8e5] mt-1" />
                <span>Dallas, Texas</span>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-[#22c8e5]">Newsletter</h3>
            <p className="text-gray-400 text-sm mb-4">Stay updated with AI trends and insights.</p>
            <form onSubmit={handleNewsletterSubmit} className="space-y-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email"
                className="w-full px-4 py-2 bg-[#1a2332] text-white border border-gray-700 rounded-md focus:outline-none focus:border-[#22c8e5] text-sm"
                required
              />
              <button
                type="submit"
                disabled={status === 'loading'}
                className={`w-full px-4 py-2 text-white rounded-md transition-colors text-sm font-medium ${status === 'success' ? 'bg-green-500 hover:bg-green-600' :
                    status === 'error' ? 'bg-red-500 hover:bg-red-600' :
                      'bg-[#22c8e5] hover:bg-[#1ba3c0]'
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
