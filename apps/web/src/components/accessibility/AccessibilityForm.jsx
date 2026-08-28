import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';

const INDUSTRIES = [
  'Consulting', 'Retail', 'Real Estate', 'Healthcare', 'Tech',
  'Government', 'Legal', 'Finance', 'Food & Bev', 'Non-profit',
  'Creative Agency', 'Other',
];

const initialForm = {
  businessName: '',
  websiteUrl: '',
  industry: '',
  firstName: '',
  contactEmail: '',
  phone: '',
  wantsCall: false,
};

const AccessibilityForm = ({ onComplete }) => {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});

  const set = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validate = () => {
    const errs = {};
    if (!form.businessName.trim()) errs.businessName = 'Required';
    if (!form.websiteUrl.trim()) errs.websiteUrl = 'Required — we need a URL to scan';
    else if (!/^https?:\/\/.+\..+/.test(form.websiteUrl.trim())) {
      errs.websiteUrl = 'Enter a valid URL (e.g. https://yoursite.com)';
    }
    if (!form.firstName.trim()) errs.firstName = 'Required';
    if (!form.contactEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.contactEmail)) {
      errs.contactEmail = 'Valid email required';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const submit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onComplete(form);
  };

  const inputClass = `
    w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3
    text-white placeholder-white/30 focus:outline-none focus:border-[#22C8E5]
    transition-all duration-200`;
  const labelClass = 'block text-white/70 text-sm mb-2';

  return (
    <form onSubmit={submit} className="space-y-5">
      <div>
        <label className={labelClass} htmlFor="a11y-business-name">Business name *</label>
        <input
          id="a11y-business-name"
          type="text"
          placeholder="e.g. Apex Consulting Group"
          value={form.businessName}
          onChange={(e) => set('businessName', e.target.value)}
          className={inputClass}
        />
        {errors.businessName && <p className="text-red-400 text-xs mt-1">{errors.businessName}</p>}
      </div>

      <div>
        <label className={labelClass} htmlFor="a11y-website-url">
          Website URL *
          <span className="ml-2 inline-flex items-center gap-1 text-[10px] tracking-widest uppercase bg-[#22C8E5]/10 text-[#22C8E5] border border-[#22C8E5]/20 rounded-full px-2 py-0.5">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#22C8E5] animate-pulse" />
            Live scan
          </span>
        </label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 text-sm pointer-events-none">🌐</span>
          <input
            id="a11y-website-url"
            type="url"
            placeholder="https://yourwebsite.com"
            value={form.websiteUrl}
            onChange={(e) => set('websiteUrl', e.target.value)}
            className={inputClass + ' pl-10'}
          />
        </div>
        {errors.websiteUrl
          ? <p className="text-red-400 text-xs mt-1">{errors.websiteUrl}</p>
          : <p className="text-white/30 text-xs mt-1">We'll run a real Lighthouse + WCAG scan against this page</p>
        }
      </div>

      <div>
        <label className={labelClass} htmlFor="a11y-industry">Industry</label>
        <select
          id="a11y-industry"
          value={form.industry}
          onChange={(e) => set('industry', e.target.value)}
          className={inputClass + ' cursor-pointer'}
        >
          <option value="" className="bg-[#04080f]">Select your industry (optional)</option>
          {INDUSTRIES.map((i) => (
            <option key={i} value={i} className="bg-[#04080f]">{i}</option>
          ))}
        </select>
      </div>

      <div className="grid sm:grid-cols-2 gap-5">
        <div>
          <label className={labelClass} htmlFor="a11y-first-name">First name *</label>
          <input
            id="a11y-first-name"
            type="text"
            placeholder="First name"
            value={form.firstName}
            onChange={(e) => set('firstName', e.target.value)}
            className={inputClass}
          />
          {errors.firstName && <p className="text-red-400 text-xs mt-1">{errors.firstName}</p>}
        </div>
        <div>
          <label className={labelClass} htmlFor="a11y-email">Email address *</label>
          <input
            id="a11y-email"
            type="email"
            placeholder="you@company.com"
            value={form.contactEmail}
            onChange={(e) => set('contactEmail', e.target.value)}
            className={inputClass}
          />
          {errors.contactEmail && <p className="text-red-400 text-xs mt-1">{errors.contactEmail}</p>}
        </div>
      </div>

      <div>
        <label className={labelClass} htmlFor="a11y-phone">Phone (optional)</label>
        <input
          id="a11y-phone"
          type="tel"
          placeholder="(555) 000-0000"
          value={form.phone}
          onChange={(e) => set('phone', e.target.value)}
          className={inputClass}
        />
      </div>

      <label htmlFor="a11y-wants-call" className="flex items-start gap-3 cursor-pointer group">
        <input
          id="a11y-wants-call"
          type="checkbox"
          checked={form.wantsCall}
          onChange={(e) => set('wantsCall', e.target.checked)}
          className="sr-only"
        />
        <div
          className={`
            mt-0.5 w-5 h-5 rounded border-2 flex-shrink-0 flex items-center justify-center
            transition-all duration-200 cursor-pointer
            ${form.wantsCall ? 'bg-[#22C8E5] border-[#22C8E5]' : 'border-white/30 group-hover:border-[#22C8E5]'}
          `}
          aria-hidden="true"
        >
          {form.wantsCall && (
            <svg className="w-3 h-3 text-[#003258]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>
        <span className="text-white/80 text-sm leading-relaxed">
          I'd like a free 15-min strategy call with Keisha about accessibility remediation
          <span className="block text-[#22C8E5] text-xs mt-0.5 font-medium">(No pressure. Completely optional.)</span>
        </span>
      </label>

      <motion.button
        type="submit"
        whileTap={{ scale: 0.97 }}
        animate={{
          boxShadow: [
            '0 0 0 0 rgba(34,200,229,0.4)',
            '0 0 0 12px rgba(34,200,229,0)',
            '0 0 0 0 rgba(34,200,229,0)',
          ],
        }}
        transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
        className="flex items-center justify-center gap-3 px-8 py-4 bg-[#22C8E5] text-[#003258] rounded-2xl font-bold uppercase tracking-wider text-base sm:text-lg hover:bg-[#1db5d0] transition-colors cursor-pointer w-full mt-2"
      >
        <Zap size={20} />
        Scan My Website
      </motion.button>
    </form>
  );
};

export default AccessibilityForm;
