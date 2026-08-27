import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, Accessibility, ArrowRight, Zap, ShieldCheck } from 'lucide-react';
import SEO from '@/components/SEO.jsx';
import { KineticHeadline, Reveal } from '@/components/motion/PageMotion.jsx';

const TOOLS = [
  {
    to: '/auditor',
    icon: Sparkles,
    eyebrow: 'Free · AI-Powered',
    title: 'Brand Auditor',
    description:
      "Get an honest AI-generated brand score in under 4 minutes. A 5-category breakdown, real competitor comparison, and a personalized 90-day action plan.",
    bullets: ['Live website & Google presence scan', 'Competitive comparison table', '90-day roadmap + ROI-sized recommendations'],
    cta: 'Start Brand Audit',
  },
  {
    to: '/accessibility-checker',
    icon: Accessibility,
    eyebrow: 'Free · Real WCAG Scan',
    title: 'Accessibility Checker',
    description:
      'Scan your website against WCAG 2.1 in under a minute. Real Lighthouse audit data, severity-ranked issues, and a 90-day remediation plan.',
    bullets: ['Real, machine-detected WCAG findings', 'Perceivable / Operable / Understandable / Robust breakdown', 'Quick wins + 90-day remediation plan'],
    cta: 'Check Accessibility',
  },
];

const AuditorsPage = () => {
  return (
    <>
      <SEO
        title="Free AI Auditors | Brand & Accessibility Scans | EVOBRAND"
        description="Two free, AI-powered audit tools from EVOBRAND: a brand auditor that scores your digital presence, and an accessibility checker that scans your site against WCAG 2.1. Instant results, no sign-up."
        keywords="free brand audit, accessibility checker, WCAG checker, AI audit tools, EVOBRAND auditors"
        canonical="https://evobrand.net/auditors"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          "name": "EVOBRAND Auditors",
          "url": "https://evobrand.net/auditors",
          "description": "Free AI-powered brand and accessibility audit tools from EVOBRAND.",
        }}
      />

      <div className="min-h-screen bg-[#04080f]">
        {/* Hero */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#003258]/80 to-transparent" />
          <div
            aria-hidden="true"
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage:
                'linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)',
              backgroundSize: '56px 56px',
              maskImage: 'radial-gradient(ellipse 80% 70% at 50% 30%, black, transparent)',
              WebkitMaskImage: 'radial-gradient(ellipse 80% 70% at 50% 30%, black, transparent)',
            }}
          />
          <div className="relative container mx-auto px-4 pt-20 pb-16 text-center">
            <Reveal>
              <span className="inline-block px-4 py-1.5 rounded-full bg-[#22C8E5]/10 border border-[#22C8E5]/20 text-[#22C8E5] text-[11px] font-bold tracking-[0.25em] uppercase mb-6">
                Free · Instant · No Sign-Up
              </span>
            </Reveal>
            <KineticHeadline
              lines={[
                [{ t: 'Know' }, { t: 'Where' }, { t: 'You' }],
                [{ t: 'Actually', accent: true }, { t: 'Stand', accent: true }],
              ]}
              className="text-4xl md:text-6xl font-bold text-white mb-4"
            />
            <Reveal delay={0.45}>
              <p className="text-white/60 text-lg max-w-xl mx-auto">
                Two free AI-powered scans — pick one, or run both for the full picture of your brand and your site.
              </p>
            </Reveal>
          </div>
        </div>

        {/* Tool cards */}
        <div className="container mx-auto px-4 max-w-5xl pb-24">
          <div className="grid md:grid-cols-2 gap-6">
            {TOOLS.map((tool, i) => (
              <motion.div
                key={tool.to}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.15 + i * 0.1, ease: 'easeOut' }}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8 flex flex-col hover:border-[#22C8E5]/30 transition-colors"
              >
                <div className="w-12 h-12 rounded-xl bg-[#22C8E5]/10 flex items-center justify-center mb-6" aria-hidden="true">
                  <tool.icon size={24} className="text-[#22C8E5]" />
                </div>
                <span className="text-[#22C8E5] text-[11px] font-bold tracking-[0.2em] uppercase mb-3">
                  {tool.eyebrow}
                </span>
                <h2 className="text-2xl font-bold text-white mb-3">{tool.title}</h2>
                <p className="text-white/60 text-sm leading-relaxed mb-6">{tool.description}</p>
                <ul className="space-y-2.5 mb-8 flex-1">
                  {tool.bullets.map((b) => (
                    <li key={b} className="flex items-start gap-2.5 text-white/50 text-sm leading-relaxed">
                      <span className="w-1.5 h-1.5 bg-[#22C8E5] rounded-full mt-1.5 flex-shrink-0" />
                      {b}
                    </li>
                  ))}
                </ul>
                <Link
                  to={tool.to}
                  className="inline-flex items-center justify-center gap-2 w-full px-6 py-3.5 bg-[#22C8E5] text-[#003258] rounded-2xl font-bold uppercase tracking-wider text-sm hover:bg-[#1db5d0] transition-colors"
                >
                  {tool.cta}
                  <ArrowRight size={16} />
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Trust signals */}
          <div className="flex flex-wrap justify-center gap-6 mt-10 text-white/30 text-xs">
            <span className="flex items-center gap-1.5"><Zap size={13} /> Results in seconds</span>
            <span className="flex items-center gap-1.5"><ShieldCheck size={13} /> Your data is private</span>
            <span>📧 Reports emailed to you</span>
            <span>📞 No spam, ever</span>
          </div>
        </div>
      </div>
    </>
  );
};

export default AuditorsPage;
