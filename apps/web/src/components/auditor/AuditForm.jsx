import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Zap } from 'lucide-react';
import AuditStep from './AuditStep';

const TOTAL_STEPS = 6;

const INDUSTRIES = [
  'Consulting', 'Retail', 'Real Estate', 'Healthcare', 'Tech',
  'Government', 'Legal', 'Finance', 'Food & Bev', 'Non-profit',
  'Creative Agency', 'Other',
];
const YEARS = ['Less than 1', '1–3', '3–5', '5–10', '10+'];
const CHALLENGES = [
  'Inconsistent visual identity',
  'Weak online presence',
  'Not enough leads',
  'Poor client retention',
  'No clear brand voice',
  'Hard to stand out from competitors',
  'Outdated website',
  'Unclear target audience',
];
const CLIENT_VALUES = ['Under $500', '$500–$2K', '$2K–$10K', '$10K–$50K', '$50K+'];
const CONSISTENCY_OPTIONS = [
  { emoji: '🔴', label: 'We have no real brand standards', value: 'none' },
  { emoji: '🟡', label: 'We have some guidelines but don\'t always follow them', value: 'some' },
  { emoji: '🟢', label: 'We\'re consistent but could be stronger', value: 'mostly' },
  { emoji: '✅', label: 'Our brand is dialed in and consistent', value: 'dialed' },
];

const DIGITAL_FIELDS = [
  { key: 'website', label: 'Website quality' },
  { key: 'social', label: 'Social media consistency' },
  { key: 'google', label: 'Google / search visibility' },
  { key: 'content', label: 'Content output' },
  { key: 'email', label: 'Email marketing' },
];

const initialForm = {
  businessName: '',
  websiteUrl: '',
  industry: '',
  years: '',
  challenges: [],
  digital: { website: 3, social: 3, google: 3, content: 3, email: 3 },
  audience: '',
  clientValue: '',
  competitor: '',
  consistency: '',
  firstName: '',
  contactEmail: '',
  phone: '',
  wantsCall: false,
};

const AuditForm = ({ onComplete, prefillData }) => {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ ...initialForm, ...prefillData });
  const [errors, setErrors] = useState({});

  const progress = ((step - 1) / (TOTAL_STEPS - 1)) * 100;

  const set = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const setDigital = (key, value) => {
    setForm((prev) => ({ ...prev, digital: { ...prev.digital, [key]: value } }));
  };

  const toggleChallenge = (c) => {
    setForm((prev) => ({
      ...prev,
      challenges: prev.challenges.includes(c)
        ? prev.challenges.filter((x) => x !== c)
        : [...prev.challenges, c],
    }));
  };

  const validate = () => {
    const errs = {};
    if (step === 1) {
      if (!form.businessName.trim()) errs.businessName = 'Required';
      if (!form.industry) errs.industry = 'Required';
      if (!form.years) errs.years = 'Required';
      if (form.websiteUrl.trim() && !/^https?:\/\/.+\..+/.test(form.websiteUrl.trim())) {
        errs.websiteUrl = 'Enter a valid URL (e.g. https://yoursite.com)';
      }
    }
    if (step === 2 && form.challenges.length === 0) {
      errs.challenges = 'Select at least one';
    }
    if (step === 5 && !form.consistency) {
      errs.consistency = 'Please select one';
    }
    if (step === 6) {
      if (!form.firstName.trim()) errs.firstName = 'Required';
      if (!form.contactEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.contactEmail)) {
        errs.contactEmail = 'Valid email required';
      }
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const next = () => {
    if (!validate()) return;
    if (step < TOTAL_STEPS) setStep((s) => s + 1);
  };

  const back = () => {
    if (step > 1) setStep((s) => s - 1);
  };

  const submit = () => {
    if (!validate()) return;
    onComplete(form);
  };

  const inputClass = `
    w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 
    text-white placeholder-white/30 focus:outline-none focus:border-[#22C8E5]
    transition-all duration-200   `;

  const labelClass = 'block text-white/70 text-sm mb-2 ';

  return (
    <div className="relative w-full">
      {/* Progress bar */}
      <div className="w-full h-0.5 bg-white/10 mb-8 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-[#22C8E5] rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
        />
      </div>

      {/* Step counter */}
      <div className="flex items-center justify-between mb-8">
        <p className="text-[#22C8E5] text-sm font-semibold tracking-widest uppercase">
          Brand Audit
        </p>
        <p className="text-white/40 text-sm ">
          Step {step} of {TOTAL_STEPS}
        </p>
      </div>

      {/* Step content */}
      <AuditStep stepKey={step}>
        <div className="min-h-[340px]">
          {/* STEP 1 — The Basics */}
          {step === 1 && (
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
                Tell us about your business.
              </h2>
              <p className="text-white/50 mb-8 ">Let's start with the basics.</p>
              <div className="space-y-5">
                <div>
                  <label className={labelClass}>Business name *</label>
                  <input
                    type="text"
                    placeholder="e.g. Apex Consulting Group"
                    value={form.businessName}
                    onChange={(e) => set('businessName', e.target.value)}
                    className={inputClass}
                    id="audit-business-name"
                  />
                  {errors.businessName && <p className="text-red-400 text-xs mt-1">{errors.businessName}</p>}
                </div>

                {/* Website URL — enables live internet scan */}
                <div className="relative">
                  <label className={labelClass}>
                    Website URL
                    <span className="ml-2 inline-flex items-center gap-1 text-[10px] tracking-widest uppercase bg-[#22C8E5]/10 text-[#22C8E5] border border-[#22C8E5]/20 rounded-full px-2 py-0.5">
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#22C8E5] animate-pulse" />
                      Enables live scan
                    </span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 text-sm pointer-events-none">🌐</span>
                    <input
                      type="url"
                      placeholder="https://yourwebsite.com"
                      value={form.websiteUrl}
                      onChange={(e) => set('websiteUrl', e.target.value)}
                      className={inputClass + ' pl-10'}
                      id="audit-website-url"
                    />
                  </div>
                  {errors.websiteUrl
                    ? <p className="text-red-400 text-xs mt-1">{errors.websiteUrl}</p>
                    : <p className="text-white/30 text-xs mt-1">Optional but highly recommended — we'll scan your site for real data</p>
                  }
                </div>

                <div>
                  <label className={labelClass}>Industry *</label>
                  <select
                    value={form.industry}
                    onChange={(e) => set('industry', e.target.value)}
                    className={inputClass + ' cursor-pointer'}
                    id="audit-industry"
                  >
                    <option value="" className="bg-[#04080f]">Select your industry</option>
                    {INDUSTRIES.map((i) => (
                      <option key={i} value={i} className="bg-[#04080f]">{i}</option>
                    ))}
                  </select>
                  {errors.industry && <p className="text-red-400 text-xs mt-1">{errors.industry}</p>}
                </div>
                <div>
                  <label className={labelClass}>Years in business *</label>
                  <select
                    value={form.years}
                    onChange={(e) => set('years', e.target.value)}
                    className={inputClass + ' cursor-pointer'}
                    id="audit-years"
                  >
                    <option value="" className="bg-[#04080f]">Select range</option>
                    {YEARS.map((y) => (
                      <option key={y} value={y} className="bg-[#04080f]">{y}</option>
                    ))}
                  </select>
                  {errors.years && <p className="text-red-400 text-xs mt-1">{errors.years}</p>}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2 — Challenges */}
          {step === 2 && (
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
                What's your biggest brand challenge right now?
              </h2>
              <p className="text-white/50 mb-8 ">Select all that apply.</p>
              <div className="flex flex-wrap gap-3">
                {CHALLENGES.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => toggleChallenge(c)}
                    className={`
                      px-4 py-2.5 rounded-full border text-sm 
                      transition-all duration-200 cursor-pointer
                      ${form.challenges.includes(c)
                        ? 'bg-[#22C8E5] border-[#22C8E5] text-[#003258] font-semibold shadow-lg shadow-[#22C8E5]/20'
                        : 'border-white/20 text-white/70 hover:border-[#22C8E5] hover:text-white'
                      }
                    `}
                    id={`challenge-${c.replace(/\s+/g, '-').toLowerCase()}`}
                  >
                    {c}
                  </button>
                ))}
              </div>
              {errors.challenges && <p className="text-red-400 text-xs mt-4">{errors.challenges}</p>}
            </div>
          )}

          {/* STEP 3 — Digital Presence */}
          {step === 3 && (
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
                Rate your current digital presence.
              </h2>
              <p className="text-white/50 mb-8 ">1 = poor, 5 = excellent</p>
              <div className="space-y-7">
                {DIGITAL_FIELDS.map(({ key, label }) => (
                  <div key={key}>
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-white/80 text-sm ">{label}</label>
                      <span className="text-[#22C8E5] font-bold text-xl w-8 text-right">
                        {form.digital[key]}
                      </span>
                    </div>
                    <div className="relative">
                      <input
                        type="range"
                        min={1}
                        max={5}
                        step={1}
                        value={form.digital[key]}
                        onChange={(e) => setDigital(key, Number(e.target.value))}
                        className="w-full audit-slider"
                        id={`slider-${key}`}
                        style={{
                          background: `linear-gradient(to right, #22C8E5 ${((form.digital[key] - 1) / 4) * 100}%, rgba(255,255,255,0.1) ${((form.digital[key] - 1) / 4) * 100}%)`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 4 — Audience */}
          {step === 4 && (
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
                Who are you trying to reach?
              </h2>
              <p className="text-white/50 mb-8 ">Help us understand your target market.</p>
              <div className="space-y-5">
                <div>
                  <label className={labelClass}>Primary audience *</label>
                  <input
                    type="text"
                    placeholder="e.g. Small business owners in Dallas"
                    value={form.audience}
                    onChange={(e) => set('audience', e.target.value)}
                    className={inputClass}
                    id="audit-audience"
                  />
                </div>
                <div>
                  <label className={labelClass}>Average client / customer value</label>
                  <select
                    value={form.clientValue}
                    onChange={(e) => set('clientValue', e.target.value)}
                    className={inputClass + ' cursor-pointer'}
                    id="audit-client-value"
                  >
                    <option value="" className="bg-[#04080f]">Select value range</option>
                    {CLIENT_VALUES.map((v) => (
                      <option key={v} value={v} className="bg-[#04080f]">{v}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Biggest competitor (optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. XYZ Agency"
                    value={form.competitor}
                    onChange={(e) => set('competitor', e.target.value)}
                    className={inputClass}
                    id="audit-competitor"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 5 — Brand Consistency */}
          {step === 5 && (
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
                How consistent is your brand across touchpoints?
              </h2>
              <p className="text-white/50 mb-8 ">Be honest — this helps us give better recommendations.</p>
              <div className="space-y-3">
                {CONSISTENCY_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => set('consistency', opt.value)}
                    className={`
                      w-full text-left p-4 rounded-xl border transition-all duration-200 cursor-pointer
                      ${form.consistency === opt.value
                        ? 'border-[#22C8E5] bg-[#22C8E5]/10 shadow-lg shadow-[#22C8E5]/10'
                        : 'border-white/10 bg-white/3 hover:border-white/30'
                      }
                    `}
                    id={`consistency-${opt.value}`}
                  >
                    <span className="text-white">
                      <span className="mr-3">{opt.emoji}</span>
                      {opt.label}
                    </span>
                  </button>
                ))}
              </div>
              {errors.consistency && <p className="text-red-400 text-xs mt-4">{errors.consistency}</p>}
            </div>
          )}

          {/* STEP 6 — Contact */}
          {step === 6 && (
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
                Where should we send your full report?
              </h2>
              <p className="text-white/50 mb-8 ">Your results will be emailed instantly.</p>
              <div className="space-y-5">
                <div>
                  <label className={labelClass}>First name *</label>
                  <input
                    type="text"
                    placeholder="First name"
                    value={form.firstName}
                    onChange={(e) => set('firstName', e.target.value)}
                    className={inputClass}
                    id="audit-first-name"
                  />
                  {errors.firstName && <p className="text-red-400 text-xs mt-1">{errors.firstName}</p>}
                </div>
                <div>
                  <label className={labelClass}>Email address *</label>
                  <input
                    type="email"
                    placeholder="you@company.com"
                    value={form.contactEmail}
                    onChange={(e) => set('contactEmail', e.target.value)}
                    className={inputClass}
                    id="audit-email"
                  />
                  {errors.contactEmail && <p className="text-red-400 text-xs mt-1">{errors.contactEmail}</p>}
                </div>
                <div>
                  <label className={labelClass}>Phone (optional)</label>
                  <input
                    type="tel"
                    placeholder="(555) 000-0000"
                    value={form.phone}
                    onChange={(e) => set('phone', e.target.value)}
                    className={inputClass}
                    id="audit-phone"
                  />
                </div>
                <label className="flex items-start gap-3 cursor-pointer group" id="audit-wants-call-label">
                  <div className={`
                    mt-0.5 w-5 h-5 rounded border-2 flex-shrink-0 flex items-center justify-center
                    transition-all duration-200 cursor-pointer
                    ${form.wantsCall ? 'bg-[#22C8E5] border-[#22C8E5]' : 'border-white/30 group-hover:border-[#22C8E5]'}
                  `}
                    onClick={() => set('wantsCall', !form.wantsCall)}
                    role="checkbox"
                    aria-checked={form.wantsCall}
                    id="audit-wants-call"
                  >
                    {form.wantsCall && (
                      <svg className="w-3 h-3 text-[#003258]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <span className="text-white/70 text-sm leading-relaxed">
                    I'd like a free 15-min strategy call with Keisha to review my results
                  </span>
                </label>
              </div>
            </div>
          )}
        </div>
      </AuditStep>

      {/* Navigation */}
      <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between mt-10 pt-6 border-t border-white/10 gap-3">
        <button
          type="button"
          onClick={back}
          disabled={step === 1}
          className={`
            flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-semibold
            transition-all duration-200
            ${step === 1 ? 'opacity-0 pointer-events-none' : 'text-white/60 hover:text-white'}
          `}
          id="audit-back-btn"
        >
          <ChevronLeft size={18} />
          Back
        </button>

        {step < TOTAL_STEPS ? (
          <motion.button
            type="button"
            onClick={next}
            whileTap={{ scale: 0.97 }}
            className="flex items-center justify-center gap-2 px-8 py-3.5 bg-[#22C8E5] text-[#003258] rounded-xl font-bold uppercase tracking-wider hover:bg-[#1db5d0] transition-colors cursor-pointer"
            id="audit-next-btn"
          >
            Continue
            <ChevronRight size={18} />
          </motion.button>
        ) : (
          <motion.button
            type="button"
            onClick={submit}
            whileTap={{ scale: 0.97 }}
            animate={{
              boxShadow: [
                '0 0 0 0 rgba(34,200,229,0.4)',
                '0 0 0 12px rgba(34,200,229,0)',
                '0 0 0 0 rgba(34,200,229,0)',
              ],
            }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
            className="flex items-center justify-center gap-3 px-8 py-4 bg-[#22C8E5] text-[#003258] rounded-xl font-bold uppercase tracking-wider text-base sm:text-lg hover:bg-[#1db5d0] transition-colors cursor-pointer w-full sm:w-auto"
            id="audit-submit-btn"
          >
            <Zap size={20} />
            Generate My Brand Audit
          </motion.button>
        )}
      </div>

      <style>{`
        .audit-slider {
          -webkit-appearance: none;
          appearance: none;
          height: 4px;
          border-radius: 9999px;
          outline: none;
          cursor: pointer;
          transition: background 0.2s;
        }
        .audit-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #22C8E5;
          cursor: pointer;
          box-shadow: 0 0 8px rgba(34,200,229,0.5);
          transition: transform 0.15s;
        }
        .audit-slider::-webkit-slider-thumb:hover {
          transform: scale(1.2);
        }
        .audit-slider::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #22C8E5;
          cursor: pointer;
          border: none;
        }
      `}</style>
    </div>
  );
};

export default AuditForm;
