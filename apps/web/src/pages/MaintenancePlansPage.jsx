import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Zap, Shield, Star, ArrowRight, Clock, Wrench, Code, FileText, AlertCircle } from 'lucide-react';
import SEO from '@/components/SEO.jsx';
import { useNavigate } from 'react-router-dom';
import PublicCheckoutModal from '@/components/PublicCheckoutModal.jsx';

const PLANS = [
  {
    name: 'Basic Support Plan',
    slug: 'basic',
    price: '$129',
    period: '/mo',
    tagline: 'Essential care for growing sites',
    color: '#22c8e5',
    icon: <Shield size={28} />,
    features: [
      'WordPress core, theme & plugin updates',
      'Monthly security scans',
      'Uptime monitoring (24/7)',
      '2 support tickets per month included',
      '48-hour response time',
      'Monthly performance report',
      'Basic malware removal',
      'Additional tickets billed at $85/hr',
    ],
    notIncluded: [
      'Custom development work',
      'Priority response',
      'Emergency fixes',
    ],
    cta: 'Get Basic Plan',
    highlighted: false,
  },
  {
    name: 'Pro Support Plan',
    slug: 'pro',
    price: '$299',
    period: '/mo',
    tagline: 'Full coverage for serious businesses',
    color: '#22c8e5',
    icon: <Zap size={28} />,
    features: [
      'Everything in Basic, plus:',
      'Unlimited support tickets',
      '24-hour priority response',
      'Speed & performance optimization',
      'Advanced security hardening',
      'Database optimization',
      'Staging environment setup',
      'Google Analytics / Tag Manager support',
      '2 hours of minor edits/month included',
    ],
    notIncluded: [
      'Major custom development',
      'Emergency same-day fixes',
    ],
    cta: 'Get Pro Plan',
    highlighted: true,
  },
  {
    name: 'Elite Support Plan',
    slug: 'elite',
    price: '$749',
    period: '/mo',
    tagline: 'White-glove care & dedicated support',
    color: '#E8DDD0',
    icon: <Star size={28} />,
    features: [
      'Everything in Pro, plus:',
      'Priority support tickets (fair-use)',
      'Same-day emergency response (business hours)',
      '4 hours of custom dev work/month',
      'Dedicated account manager',
      'Monthly strategy call (30 min)',
      'WooCommerce / eCommerce support',
      'Content updates & copyedits',
      'Quarterly SEO health check',
      'Priority queue — always first',
    ],
    notIncluded: [],
    cta: 'Get Elite Plan',
    highlighted: false,
  },
];

const ONE_TIME = [
  {
    name: 'Simple Update',
    desc: 'Image, document, or text swap — no coding required.',
    price: '$50–$150',
    icon: <FileText size={20} />,
    turnaround: '1–2 business days',
  },
  {
    name: 'Single Support Ticket',
    desc: 'One targeted fix or technical issue resolved.',
    price: '$149',
    icon: <Wrench size={20} />,
    turnaround: '48-hour turnaround',
  },
  {
    name: 'Urgent Fix',
    desc: 'Critical issue? We jump on it fast.',
    price: '$299',
    icon: <AlertCircle size={20} />,
    turnaround: '24-hour response',
  },
  {
    name: 'Custom Development',
    desc: 'New features, integrations, or bespoke builds.',
    price: '$99/hr',
    icon: <Code size={20} />,
    turnaround: 'Timeline quoted per project',
  },
];

const WHY = [
  {
    title: 'Outdated plugins = hacked sites',
    body: 'Over 90% of WordPress hacks exploit outdated plugins. We keep everything patched before vulnerabilities are exploited.',
  },
  {
    title: 'Downtime costs real money',
    body: 'Every minute your site is down, you\'re losing leads. Our uptime monitoring catches issues before your customers do.',
  },
  {
    title: 'Speed directly affects revenue',
    body: 'A 1-second delay in load time can drop conversions by 7%. We optimize continuously so you stay fast.',
  },
  {
    title: 'You should focus on your business',
    body: 'Website maintenance is technical, time-consuming, and never-ending. Let us handle it so you don\'t have to.',
  },
];

const fadeUp = { hidden: { opacity: 0, y: 30 }, visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } }) };

export default function MaintenancePlansPage() {
  const [annual, setAnnual] = useState(false);
  const [checkoutPlan, setCheckoutPlan] = useState(null);
  const navigate = useNavigate();

  const discountedPrice = (price) => {
    if (price.includes('–') || price.includes('/hr') || price === 'Custom') return price;
    const num = parseInt(price.replace(/\D/g, ''));
    return `$${Math.round(num * 10)}`;
  };

  return (
    <>
      <SEO
        title="WordPress Maintenance & Support Plans — EVOBRAND"
        description="Keep your WordPress site secure, fast, and up to date with EVOBRAND's maintenance plans. Basic, Pro, and Elite tiers — or pay-as-you-go support tickets."
      />

      {/* ── Hero ──────────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden" style={{ background: '#0A1628', paddingTop: '120px', paddingBottom: '80px' }}>
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] rounded-full opacity-10" style={{ background: 'radial-gradient(ellipse, #22c8e5, transparent 70%)' }} />
        </div>
        <div className="max-w-5xl mx-auto px-6 text-center relative">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl border text-xs font-bold uppercase tracking-widest mb-6" style={{ borderColor: 'rgba(34,200,229,0.3)', color: '#22c8e5', background: 'rgba(34,200,229,0.06)' }}>
              <Shield size={12} /> WordPress Maintenance & Support
            </span>
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.6 }}
            className="text-5xl md:text-6xl font-bold mb-6" style={{ color: '#E8DDD0', lineHeight: 1.1 }}>
            Your Site, <span style={{ color: '#22c8e5' }}>Always On.</span><br />Always Protected.
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25, duration: 0.6 }}
            className="text-lg max-w-2xl mx-auto mb-10" style={{ color: 'rgba(232,221,208,0.65)' }}>
            We handle the updates, security, backups, and fixes — so you can focus on running your business.
            Clients on a WordPress maintenance plan never pay per ticket.
          </motion.p>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }} className="flex items-center justify-center gap-4">
            <span className="text-sm font-bold" style={{ color: annual ? 'rgba(232,221,208,0.4)' : '#E8DDD0' }}>Monthly</span>
            <button
              onClick={() => setAnnual(!annual)}
              className="relative w-14 h-7 rounded-full transition-colors"
              style={{ background: annual ? '#22c8e5' : 'rgba(255,255,255,0.1)' }}
            >
              <span className="absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-all" style={{ left: annual ? '30px' : '4px' }} />
            </button>
            <span className="text-sm font-bold" style={{ color: annual ? '#E8DDD0' : 'rgba(232,221,208,0.4)' }}>
              Annual <span className="px-2 py-0.5 rounded-2xl text-xs" style={{ background: 'rgba(34,200,229,0.15)', color: '#22c8e5' }}>Save 2 months</span>
            </span>
          </motion.div>
        </div>
      </section>

      {/* ── Plans ─────────────────────────────────────────────────────────────── */}
      <section style={{ background: '#0A1628', paddingBottom: '100px' }}>
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8">
            {PLANS.map((plan, i) => (
              <motion.div
                key={plan.slug}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                className="relative rounded-3xl overflow-hidden flex flex-col"
                style={{
                  background: plan.highlighted ? 'linear-gradient(135deg, rgba(34,200,229,0.12), rgba(34,200,229,0.04))' : 'rgba(255,255,255,0.03)',
                  border: plan.highlighted ? '2px solid #22c8e5' : '1px solid rgba(255,255,255,0.08)',
                  boxShadow: plan.highlighted ? '0 0 60px -10px rgba(34,200,229,0.2)' : 'none',
                }}
              >
                {plan.highlighted && (
                  <div className="text-center py-2 text-xs font-bold uppercase tracking-widest" style={{ background: '#22c8e5', color: '#0A1628' }}>
                    Most Popular
                  </div>
                )}
                <div className="p-8 flex-1 flex flex-col">
                  <div className="flex items-center gap-3 mb-4" style={{ color: '#22c8e5' }}>
                    {plan.icon}
                    <span className="font-bold text-sm uppercase tracking-widest" style={{ color: 'rgba(232,221,208,0.5)' }}>{plan.name}</span>
                  </div>
                  <div className="mb-2">
                    <span className="text-5xl font-bold" style={{ color: '#E8DDD0' }}>
                      {annual ? discountedPrice(plan.price) : plan.price}
                    </span>
                    <span className="text-sm ml-1" style={{ color: 'rgba(232,221,208,0.4)' }}>{annual ? '/yr' : plan.period}</span>
                  </div>
                  <p className="text-sm mb-8" style={{ color: 'rgba(232,221,208,0.5)' }}>{plan.tagline}</p>

                  <ul className="space-y-3 mb-8 flex-1">
                    {plan.features.map((f, fi) => (
                      <li key={fi} className="flex items-start gap-3 text-sm" style={{ color: 'rgba(232,221,208,0.8)' }}>
                        <Check size={16} className="mt-0.5 flex-shrink-0" style={{ color: '#22c8e5' }} />
                        {f}
                      </li>
                    ))}
                    {plan.notIncluded.map((f, fi) => (
                      <li key={fi} className="flex items-start gap-3 text-sm line-through" style={{ color: 'rgba(232,221,208,0.25)' }}>
                        <span className="w-4 h-4 mt-0.5 flex-shrink-0 flex items-center justify-center rounded-full text-xs" style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(232,221,208,0.2)' }}>×</span>
                        {f}
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => setCheckoutPlan({
                      planId: `maintenance-${plan.slug}`,
                      planName: plan.name,
                      price: annual ? discountedPrice(plan.price) : plan.price,
                      type: 'recurring',
                      interval: annual ? 'year' : 'month',
                    })}
                    className="w-full text-center py-4 rounded-2xl font-bold text-sm uppercase tracking-widest transition-all"
                    style={plan.highlighted
                      ? { background: '#22c8e5', color: '#0A1628' }
                      : { background: 'rgba(34,200,229,0.1)', color: '#22c8e5', border: '1px solid rgba(34,200,229,0.3)' }
                    }
                  >
                    {plan.cta}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          <p className="text-center text-sm mt-8" style={{ color: 'rgba(232,221,208,0.35)' }}>
            Save 10% with annual billing
          </p>

          <p className="text-center text-sm mt-2" style={{ color: 'rgba(232,221,208,0.35)' }}>
            Already a maintenance client? Log in to your portal — tickets are covered by your plan at no extra charge.
          </p>

          <p className="text-center text-xs mt-6 max-w-2xl mx-auto" style={{ color: 'rgba(232,221,208,0.25)' }}>
            "Fair-use" support tickets means unlimited requests within reasonable monthly volume, with overages billed at standard hourly rates.
          </p>
        </div>
      </section>

      {/* ── Why maintenance matters ───────────────────────────────────────────── */}
      <section style={{ background: '#060e1a', padding: '100px 0' }}>
        <div className="max-w-5xl mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4" style={{ color: '#E8DDD0' }}>Why Maintenance <span style={{ color: '#22c8e5' }}>Isn't Optional</span></h2>
            <p className="text-lg" style={{ color: 'rgba(232,221,208,0.5)' }}>Neglecting your site is a liability. Here's what's at stake.</p>
          </motion.div>
          <div className="grid md:grid-cols-2 gap-8">
            {WHY.map((w, i) => (
              <motion.div key={i} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
                className="p-8 rounded-2xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <h3 className="font-bold text-lg mb-3" style={{ color: '#22c8e5' }}>{w.title}</h3>
                <p style={{ color: 'rgba(232,221,208,0.6)', lineHeight: 1.7 }}>{w.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── One-time pricing ──────────────────────────────────────────────────── */}
      <section style={{ background: '#0A1628', padding: '100px 0' }}>
        <div className="max-w-5xl mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4" style={{ color: '#E8DDD0' }}>Not Ready for a Plan?</h2>
            <p className="text-lg" style={{ color: 'rgba(232,221,208,0.5)' }}>Pay only for what you need, when you need it.</p>
          </motion.div>
          <div className="grid md:grid-cols-2 gap-6">
            {ONE_TIME.map((item, i) => (
              <motion.div key={i} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
                className="flex items-start gap-5 p-7 rounded-2xl"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(34,200,229,0.1)', color: '#22c8e5' }}>
                  {item.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold" style={{ color: '#E8DDD0' }}>{item.name}</h3>
                    <span className="font-bold text-lg" style={{ color: '#22c8e5' }}>{item.price}</span>
                  </div>
                  <p className="text-sm mb-2" style={{ color: 'rgba(232,221,208,0.55)' }}>{item.desc}</p>
                  <div className="flex items-center gap-1.5 text-xs" style={{ color: 'rgba(232,221,208,0.35)' }}>
                    <Clock size={11} />
                    {item.turnaround}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          <div className="text-center mt-10">
            <a href="/client-portal"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-bold text-sm uppercase tracking-widest transition-all"
              style={{ background: 'rgba(34,200,229,0.1)', color: '#22c8e5', border: '1px solid rgba(34,200,229,0.3)' }}>
              Raise a Ticket <ArrowRight size={16} />
            </a>
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────────────── */}
      <section style={{ background: '#060e1a', padding: '100px 0' }}>
        <div className="max-w-3xl mx-auto px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-4xl font-bold mb-6" style={{ color: '#E8DDD0' }}>
              Ready to Stop Worrying<br />About Your Website?
            </h2>
            <p className="text-lg mb-10" style={{ color: 'rgba(232,221,208,0.55)' }}>
              Get in touch and we'll recommend the right plan for your business — or set you up with a one-time fix today.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <a href="/contact"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-bold text-sm uppercase tracking-widest transition-all"
                style={{ background: '#22c8e5', color: '#0A1628' }}>
                Get a Maintenance Plan <ArrowRight size={16} />
              </a>
              <a href="/client-portal"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-bold text-sm uppercase tracking-widest transition-all"
                style={{ background: 'rgba(255,255,255,0.05)', color: '#E8DDD0', border: '1px solid rgba(255,255,255,0.1)' }}>
                Log In to Portal
              </a>
            </div>
          </motion.div>
        </div>
      </section>
      {/* Public Checkout Modal */}
      {checkoutPlan && (
        <PublicCheckoutModal
          planId={checkoutPlan.planId}
          planName={checkoutPlan.planName}
          price={checkoutPlan.price}
          type={checkoutPlan.type}
          interval={checkoutPlan.interval}
          onClose={() => setCheckoutPlan(null)}
        />
      )}
    </>
  );
}
