'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ExternalLink, Mail, Phone, MapPin, ArrowRight } from 'lucide-react';
import Button from '@/components/ui/Button';

const footerLinks = {
  Services: [
    { label: 'Custom App Development', href: '/#services' },
    { label: 'AI Integration', href: '/#services' },
    { label: 'AI Content Creation', href: '/#services' },
    { label: 'Brand Identity', href: '/#services' },
    { label: 'Government Solutions', href: '/portfolio?filter=Government' },
  ],
  Company: [
    { label: 'Portfolio', href: '/portfolio' },
    { label: 'About Us', href: '/#about' },
    { label: 'Process', href: '/#process' },
    { label: 'Careers', href: '/careers' },
    { label: 'Press', href: '/press' },
  ],
  Resources: [
    { label: 'Book a Call', href: '/booking' },
    { label: 'Request Quote', href: '/quote' },
    { label: 'Support Plans', href: '/support' },
    { label: 'Contract Builder', href: '/contracts' },
    { label: 'Case Studies', href: '/portfolio' },
  ],
  Legal: [
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Security', href: '/security' },
    { label: 'Compliance', href: '/compliance' },
  ],
};

const socialLinks = [
  { icon: ExternalLink, label: 'Twitter', href: 'https://twitter.com/evobrand' },
  { icon: ExternalLink, label: 'LinkedIn', href: 'https://linkedin.com/company/evobrand' },
  { icon: ExternalLink, label: 'GitHub', href: 'https://github.com/evobrand' },
];

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail('');
    }
  };

  return (
    <footer className="bg-[#07070d] border-t border-white/10" aria-labelledby="footer-heading">
      <h2 id="footer-heading" className="sr-only">
        Footer
      </h2>

      {/* Main footer content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-6 gap-12">
          {/* Brand column */}
          <div className="lg:col-span-2 space-y-6">
            <Link href="/" className="flex items-center gap-2 w-fit">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#0066ff] to-[#00d4ff] flex items-center justify-center">
                <span className="text-white font-bold">E</span>
              </div>
              <span className="text-white font-bold text-xl tracking-tight">
                Evo<span className="text-[#0066ff]">Brand</span>
              </span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
              Premium custom app development, AI integration, and brand solutions for government contractors and Fortune 500 companies.
            </p>

            <div className="space-y-3">
              <a
                href="mailto:hello@evobrand.net"
                className="flex items-center gap-2 text-gray-400 hover:text-white text-sm transition-colors group"
              >
                <Mail size={14} className="text-[#0066ff]" />
                hello@evobrand.net
              </a>
              <a
                href="tel:+18005551234"
                className="flex items-center gap-2 text-gray-400 hover:text-white text-sm transition-colors"
              >
                <Phone size={14} className="text-[#0066ff]" />
                +1 (800) 555-1234
              </a>
              <div className="flex items-center gap-2 text-gray-400 text-sm">
                <MapPin size={14} className="text-[#0066ff]" />
                Washington, DC · San Francisco, CA
              </div>
            </div>

            {/* Social links */}
            <div className="flex items-center gap-3">
              {socialLinks.map(({ icon: Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`EvoBrand on ${label}`}
                  className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all focus-visible:ring-2 focus-visible:ring-blue-500"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([section, links]) => (
            <div key={section}>
              <h3 className="text-white font-semibold text-sm mb-4">{section}</h3>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-gray-400 hover:text-white text-sm transition-colors focus-visible:ring-2 focus-visible:ring-blue-500 rounded"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Newsletter */}
        <div className="mt-16 pt-12 border-t border-white/10">
          <div className="max-w-xl">
            <h3 className="text-white font-semibold mb-1">Stay ahead of the curve</h3>
            <p className="text-gray-400 text-sm mb-4">
              Monthly insights on AI, enterprise software, and government technology.
            </p>
            {subscribed ? (
              <p className="text-green-400 text-sm">
                ✓ You&apos;re subscribed! Watch for our next issue.
              </p>
            ) : (
              <form onSubmit={handleNewsletterSubmit} className="flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your work email"
                  required
                  aria-label="Email address for newsletter"
                  className="flex-1 px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Button type="submit" size="sm">
                  Subscribe <ArrowRight size={14} />
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-xs">
            © {new Date().getFullYear()} EvoBrand LLC. All rights reserved.
          </p>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-gray-500 text-xs">All systems operational</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
