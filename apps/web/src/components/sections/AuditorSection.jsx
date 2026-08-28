import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Zap, BarChart3, FileText } from 'lucide-react';

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

const inputClass = `
  w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 
  text-white placeholder-white/40 focus:outline-none focus:border-[#22C8E5]
  transition-all duration-200 text-sm
`;

const PROOF_POINTS = [
  { icon: <Zap size={16} aria-hidden="true" />, text: 'Instant AI-generated score' },
  { icon: <BarChart3 size={16} aria-hidden="true" />, text: '5-category breakdown' },
  { icon: <FileText size={16} aria-hidden="true" />, text: 'Personalized action plan' },
];

const AuditorSection = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    businessName: '',
    industry: '',
    years: '',
    challenges: [],
  });
  const [error, setError] = useState('');

  const set = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setError('');
  };

  const toggleChallenge = (c) => {
    setForm((prev) => ({
      ...prev,
      challenges: prev.challenges.includes(c)
        ? prev.challenges.filter((x) => x !== c)
        : [...prev.challenges, c],
    }));
  };

  const handleContinue = () => {
    if (step === 1) {
      if (!form.businessName.trim() || !form.industry || !form.years) {
        setError('Please fill in all fields to continue.');
        return;
      }
      setStep(2);
    } else {
      // Save to sessionStorage and navigate to full form
      try {
        sessionStorage.setItem('evo_audit_prefill', JSON.stringify(form));
      } catch (_) { /* ignore */ }
      navigate('/auditor');
    }
  };

  return (
    <section id="auditor" className="relative py-20 overflow-hidden" style={{ background: 'rgba(4,8,15,0.8)' }}>
      {/* Video background placeholder */}
      <div className="absolute inset-0 z-0">
        <video
          className="absolute inset-0 w-full h-full object-cover opacity-20"
          autoPlay
          loop
          muted
          playsInline
          src="/auditor.webm"
          onError={(e) => { e.target.style.display = 'none'; }}
        />
        <div className="absolute inset-0 bg-[#04080f]/65" />
        {/* Animated grid lines */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: 'linear-gradient(rgba(34,200,229,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(34,200,229,0.3) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      <div className="relative z-10 container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center max-w-6xl mx-auto">
          {/* Left — Pitch */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <span className="inline-block px-3 py-1 rounded-full bg-[#22C8E5]/10 border border-[#22C8E5]/20 text-[#22C8E5] text-xs tracking-widest uppercase mb-6">
              Free · AI-Powered · Instant
            </span>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
              HOW STRONG IS YOUR BRAND?
            </h2>
            <p className="text-white/60 text-lg mb-8 leading-relaxed">
              Get an AI-powered audit in 4 minutes.{' '}
              <span className="text-white">Free. No fluff. No sales pitch.</span>
            </p>

            <ul className="space-y-3 mb-10">
              {PROOF_POINTS.map((p, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 + i * 0.1 }}
                  className="flex items-center gap-3 text-white/80 "
                >
                  <span className="w-7 h-7 rounded-full bg-[#22C8E5]/15 flex items-center justify-center text-[#22C8E5] flex-shrink-0">
                    {p.icon}
                  </span>
                  {p.text}
                </motion.li>
              ))}
            </ul>

            {/* Score preview decoration */}
            <div className="hidden lg:flex items-center gap-6">
              <div className="text-center">
                <p className="font-bold text-5xl text-[#22C8E5] leading-none">87</p>
                <p className="text-gray-300 text-xs mt-1">Sample Score</p>
              </div>
              <div className="flex-1 space-y-2">
                {['Visual Identity', 'Digital Presence', 'Brand Clarity'].map((label, i) => (
                  <div key={label} className="flex items-center gap-3">
                    <span className="text-gray-300 text-xs w-28">{label}</span>
                    <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-[#22C8E5] rounded-full"
                        initial={{ width: 0 }}
                        whileInView={{ width: `${[78, 65, 90][i]}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, delay: 0.4 + i * 0.15 }}
                      />
                    </div>
                    <span className="text-[#22C8E5] text-xs w-6 text-right">
                      {[78, 65, 90][i]}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Right — Inline Form (Steps 1–2) */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-8">
              {/* Mini progress */}
              <div className="flex items-center justify-between mb-6">
                <p className="text-[#22C8E5] text-xs font-semibold tracking-widest uppercase">
                  Quick Audit Preview
                </p>
                <p className="text-gray-300 text-xs font-medium">Step {step} of 2</p>
              </div>
              <div className="w-full h-0.5 bg-white/10 rounded-full mb-8 overflow-hidden">
                <motion.div
                  className="h-full bg-[#22C8E5] rounded-full"
                  animate={{ width: step === 1 ? '50%' : '100%' }}
                  transition={{ duration: 0.4 }}
                />
              </div>

              {step === 1 && (
                <motion.div
                  key="section-step-1"
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  transition={{ duration: 0.3 }}
                >
                  <h3 className="font-bold text-white text-xl mb-6">
                    Tell us about your business.
                  </h3>
                  <div className="space-y-4">
                    <label htmlFor="section-business-name" className="sr-only">Business name</label>
                    <input
                      type="text"
                      placeholder="Business name"
                      value={form.businessName}
                      onChange={(e) => set('businessName', e.target.value)}
                      className={inputClass}
                      id="section-business-name"
                    />
                    <label htmlFor="section-industry" className="sr-only">Industry</label>
                    <select
                      value={form.industry}
                      onChange={(e) => set('industry', e.target.value)}
                      className={inputClass + ' cursor-pointer'}
                      id="section-industry"
                    >
                      <option value="" className="bg-[#04080f]">Select your industry</option>
                      {INDUSTRIES.map((i) => (
                        <option key={i} value={i} className="bg-[#04080f]">{i}</option>
                      ))}
                    </select>
                    <label htmlFor="section-years" className="sr-only">Years in business</label>
                    <select
                      value={form.years}
                      onChange={(e) => set('years', e.target.value)}
                      className={inputClass + ' cursor-pointer'}
                      id="section-years"
                    >
                      <option value="" className="bg-[#04080f]">Years in business</option>
                      {YEARS.map((y) => (
                        <option key={y} value={y} className="bg-[#04080f]">{y}</option>
                      ))}
                    </select>
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="section-step-2"
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <h3 className="font-bold text-white text-xl mb-4">
                    Biggest brand challenges?
                  </h3>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {CHALLENGES.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => toggleChallenge(c)}
                        className={`
                          px-3 py-1.5 rounded-full border text-xs 
                          transition-all duration-200 cursor-pointer
                          ${form.challenges.includes(c)
                            ? 'bg-[#22C8E5] border-[#22C8E5] text-[#003258] font-semibold'
                            : 'border-white/20 text-white/80 hover:border-[#22C8E5]'
                          }
                        `}
                        id={`section-challenge-${c.replace(/\s+/g, '-').toLowerCase()}`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {error && (
                <p className="text-red-400 text-xs mt-3 ">{error}</p>
              )}

              <motion.button
                type="button"
                onClick={handleContinue}
                whileTap={{ scale: 0.97 }}
                animate={step === 2 ? {
                  boxShadow: [
                    '0 0 0 0 rgba(34,200,229,0.4)',
                    '0 0 0 12px rgba(34,200,229,0)',
                    '0 0 0 0 rgba(34,200,229,0)',
                  ],
                } : {}}
                transition={{ duration: 1.8, repeat: Infinity }}
                className="w-full mt-8 py-4 bg-[#22C8E5] text-[#003258] rounded-2xl font-bold uppercase tracking-wider text-base hover:bg-[#1db5d0] transition-colors cursor-pointer"
                id="section-auditor-cta"
              >
                {step === 1 ? <>Continue <span aria-hidden="true">→</span></> : <>Get My Free Brand Score <span aria-hidden="true">→</span></>}
              </motion.button>

              <p className="text-gray-400 text-xs text-center mt-4 font-medium">
                Free · Takes 4 minutes · No credit card
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AuditorSection;
