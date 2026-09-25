import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Facebook, Instagram, Linkedin, Youtube } from 'lucide-react';

const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:5000'
  : window.location.origin;

const SOCIALS = [
  ['Facebook', 'http://facebook.com/evobrandconcepts', Facebook],
  ['LinkedIn', 'https://www.linkedin.com/company/evobrand-concepts/', Linkedin],
  ['Instagram', 'https://www.instagram.com/evobrandconcepts', Instagram],
  ['YouTube', 'https://www.youtube.com/channel/UC8z66n8_seQVY5PjBEDMM7w', Youtube],
];

export default function Footer() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');

  const resetStatus = (delay) => setTimeout(() => {
    setStatus('idle');
    setMessage('');
  }, delay);

  const handleNewsletterSubmit = async (event) => {
    event.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setStatus('error');
      setMessage('Enter a valid email address.');
      resetStatus(5000);
      return;
    }

    setStatus('loading');
    try {
      const response = await fetch(`${API_BASE}/api/newsletter/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email }),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Unable to subscribe.');
      }
      setStatus('success');
      setMessage('You’re on the list.');
      setName('');
      setEmail('');
      resetStatus(4000);
    } catch (error) {
      setStatus('error');
      setMessage(error.message || 'Network error. Try again later.');
      resetStatus(5000);
    }
  };

  return (
    <footer className="site-footer">
      <div className="evo-container">
        <div className="site-footer__statement">
          <p className="evo-eyebrow">EVOBRAND Concepts</p>
          <h2>Make the next thing<br /><em>work beautifully.</em></h2>
          <Link to="/book-consultation" className="evo-btn evo-btn--primary">
            Book a strategy call <ArrowUpRight size={16} aria-hidden="true" />
          </Link>
        </div>

        <div className="site-footer__grid">
          <div className="site-footer__brand">
            <Link to="/" aria-label="EVOBRAND home"><img src="/logo.png" alt="EVOBRAND" /></Link>
            <p>Websites, applications, and practical AI workflows—designed around how your organization really works.</p>
            <div className="site-footer__socials">
              {SOCIALS.map(([label, href, Icon]) => (
                <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={`${label} (opens in a new tab)`}>
                  <Icon size={17} aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>

          <nav className="site-footer__links" aria-label="Footer navigation">
            <p className="site-footer__label">Explore</p>
            <Link to="/services">Services</Link>
            <Link to="/our-work">Our work</Link>
            <Link to="/how-it-works">Process</Link>
            <Link to="/about">About</Link>
            <Link to="/resources">Resources</Link>
          </nav>

          <div className="site-footer__contact">
            <p className="site-footer__label">Start here</p>
            <a href="mailto:info@evobrand.net">info@evobrand.net</a>
            <a href="tel:+12145314427">+1 214-531-4427</a>
            <p>Italy, Texas · DFW area<br />Serving clients nationwide</p>
            <Link to="/client-portal">Client portal <ArrowUpRight size={14} aria-hidden="true" /></Link>
          </div>

          <div className="site-footer__newsletter">
            <p className="site-footer__label">Useful ideas, occasionally</p>
            <p>Notes on design, AI, and building better systems.</p>
            <form onSubmit={handleNewsletterSubmit}>
              <label htmlFor="footer-newsletter-name" className="sr-only">Name</label>
              <input id="footer-newsletter-name" type="text" value={name} onChange={(event) => setName(event.target.value)} placeholder="Your name" autoComplete="name" required />
              <label htmlFor="footer-newsletter-email" className="sr-only">Email address</label>
              <div className="site-footer__email-row">
                <input id="footer-newsletter-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Email address" autoComplete="email" required />
                <button type="submit" aria-label="Subscribe to newsletter" disabled={status === 'loading'}>
                  <ArrowUpRight size={18} aria-hidden="true" />
                </button>
              </div>
              <p className={`site-footer__status is-${status}`} aria-live="polite">{message}</p>
            </form>
          </div>
        </div>

        <div className="site-footer__bottom">
          <span>© {new Date().getFullYear()} EVOBRAND Concepts</span>
          <span>SBE · WBE · MBE certified</span>
          <Link to="/accessibility-statement">Accessibility</Link>
        </div>
      </div>
    </footer>
  );
}
