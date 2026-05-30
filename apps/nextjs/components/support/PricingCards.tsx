'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Star } from 'lucide-react';
import Button from '@/components/ui/Button';
import { formatCurrency } from '@/lib/utils';

const plans = [
  {
    name: 'Starter',
    monthlyPrice: 2500,
    annualPrice: 2000,
    description: 'For organizations just beginning their digital transformation journey.',
    features: [
      'Up to 3 support tickets/month',
      'Email support',
      '48-hour response time',
      'Basic system monitoring',
      'Monthly status report',
      'Access to knowledge base',
    ],
    cta: 'Get Started',
    highlighted: false,
    stripePlanId: 'starter',
  },
  {
    name: 'Professional',
    monthlyPrice: 7500,
    annualPrice: 6000,
    description: 'The standard for serious enterprise and government operations.',
    features: [
      'Unlimited support tickets',
      'Dedicated Project Manager',
      '4-hour response time',
      'Priority development queue',
      'Monthly strategy call',
      'Advanced monitoring & alerts',
      'Quarterly business review',
      'SLA guarantee',
    ],
    cta: 'Get Started',
    highlighted: true,
    stripePlanId: 'professional',
  },
  {
    name: 'Enterprise',
    monthlyPrice: null,
    annualPrice: null,
    description: 'White-glove service for mission-critical, large-scale operations.',
    features: [
      'Everything in Professional',
      'Dedicated engineering team',
      '1-hour response time (24/7)',
      'On-site availability',
      'Government compliance support',
      'Custom SLA terms',
      'Executive sponsor access',
      'CMMC/FedRAMP advisory',
    ],
    cta: 'Contact Us',
    highlighted: false,
    stripePlanId: null,
  },
];

export default function PricingCards() {
  const [annual, setAnnual] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);

  const handleSubscribe = async (plan: typeof plans[0]) => {
    if (!plan.stripePlanId) return;
    setLoading(plan.name);
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId: plan.stripePlanId,
          billing: annual ? 'annual' : 'monthly',
        }),
      });
      const data = await res.json() as { url?: string };
      if (data.url) window.location.href = data.url;
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Billing toggle */}
      <div className="flex items-center justify-center gap-4">
        <span className={`text-sm font-medium ${!annual ? 'text-white' : 'text-gray-500'}`}>
          Monthly
        </span>
        <button
          role="switch"
          aria-checked={annual}
          onClick={() => setAnnual(!annual)}
          className={`relative w-12 h-6 rounded-full transition-colors focus-visible:ring-2 focus-visible:ring-blue-500 ${
            annual ? 'bg-[#0066ff]' : 'bg-white/20'
          }`}
        >
          <span className="sr-only">Toggle annual billing</span>
          <motion.span
            layout
            className="absolute top-1 w-4 h-4 rounded-full bg-white"
            animate={{ left: annual ? '1.5rem' : '0.25rem' }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          />
        </button>
        <span className={`text-sm font-medium ${annual ? 'text-white' : 'text-gray-500'}`}>
          Annual{' '}
          <span className="text-green-400 text-xs font-semibold ml-1">Save 20%</span>
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan, idx) => (
          <motion.div
            key={plan.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className={`relative rounded-2xl p-7 border flex flex-col ${
              plan.highlighted
                ? 'bg-gradient-to-b from-blue-500/10 to-purple-500/5 border-blue-500/40 shadow-xl shadow-blue-500/10'
                : 'bg-white/5 border-white/10'
            }`}
          >
            {plan.highlighted && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#0066ff] text-white text-xs font-bold">
                  <Star size={10} className="fill-current" />
                  Most Popular
                </span>
              </div>
            )}

            <div className="mb-6">
              <h3 className="text-lg font-bold text-white mb-1">{plan.name}</h3>
              <p className="text-gray-400 text-sm">{plan.description}</p>
            </div>

            <div className="mb-6">
              {plan.monthlyPrice !== null ? (
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-white">
                    {formatCurrency(annual ? plan.annualPrice! : plan.monthlyPrice)}
                  </span>
                  <span className="text-gray-400 text-sm">/month</span>
                </div>
              ) : (
                <div className="text-3xl font-bold text-white">Custom</div>
              )}
              {annual && plan.monthlyPrice !== null && (
                <p className="text-green-400 text-xs mt-1">
                  Save {formatCurrency((plan.monthlyPrice - plan.annualPrice!) * 12)}/year
                </p>
              )}
            </div>

            <ul className="space-y-3 mb-8 flex-1">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center shrink-0 mt-0.5">
                    <Check size={11} className="text-blue-400" />
                  </span>
                  <span className="text-gray-300 text-sm">{feature}</span>
                </li>
              ))}
            </ul>

            {plan.stripePlanId ? (
              <Button
                variant={plan.highlighted ? 'primary' : 'secondary'}
                className="w-full"
                onClick={() => handleSubscribe(plan)}
                loading={loading === plan.name}
              >
                {plan.cta}
              </Button>
            ) : (
              <a href="mailto:hello@evobrand.net?subject=Enterprise Support Inquiry">
                <Button variant="secondary" className="w-full">
                  {plan.cta}
                </Button>
              </a>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
