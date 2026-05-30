'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronRight } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { cn } from '@/lib/utils';

const PROJECT_TYPES = [
  'Web Application',
  'Mobile Application',
  'AI Integration',
  'Branding & Identity',
  'Government Solution',
  'Custom API / Backend',
  'Digital Transformation',
  'Other',
];

const BUDGET_RANGES = [
  { id: '50k-100k', label: '$50K – $100K' },
  { id: '100k-500k', label: '$100K – $500K' },
  { id: '500k-1m', label: '$500K – $1M' },
  { id: '1m+', label: '$1M+' },
];

const TIMELINES = [
  { id: 'asap', label: 'ASAP', desc: 'Start immediately' },
  { id: '3mo', label: '3 Months', desc: 'Near-term start' },
  { id: '6mo', label: '6 Months', desc: 'Mid-term planning' },
  { id: '12mo+', label: '12+ Months', desc: 'Long-range initiative' },
];

const HOW_HEARD = [
  'Web search',
  'LinkedIn',
  'Referral',
  'Conference / Event',
  'Government procurement listing',
  'Press coverage',
  'Other',
];

interface StepData {
  projectTypes: string[];
  budget: string;
  timeline: string;
  name: string;
  title: string;
  company: string;
  email: string;
  phone: string;
  howHeard: string;
  additional: string;
}

export default function QuoteForm() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [data, setData] = useState<StepData>({
    projectTypes: [],
    budget: '',
    timeline: '',
    name: '',
    title: '',
    company: '',
    email: '',
    phone: '',
    howHeard: '',
    additional: '',
  });

  const toggleProjectType = (type: string) => {
    setData((prev) => ({
      ...prev,
      projectTypes: prev.projectTypes.includes(type)
        ? prev.projectTypes.filter((t) => t !== type)
        : [...prev.projectTypes, type],
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await fetch('/api/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_types: data.projectTypes,
          budget_range: data.budget,
          timeline: data.timeline,
          name: data.name,
          title: data.title,
          company: data.company,
          email: data.email,
          phone: data.phone,
          how_heard: data.howHeard,
          additional_info: data.additional,
        }),
      });
      setSubmitted(true);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-12"
      >
        <div className="w-16 h-16 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center mx-auto mb-6">
          <Check size={28} className="text-green-400" />
        </div>
        <h3 className="text-2xl font-bold text-white mb-3">Quote Request Received</h3>
        <p className="text-gray-400 max-w-md mx-auto">
          Thank you, <strong className="text-white">{data.name}</strong>. We will review your requirements and reach out within{' '}
          <strong className="text-white">24 hours</strong> with a preliminary proposal.
        </p>
        <p className="text-gray-500 text-sm mt-4">
          A confirmation has been sent to {data.email}
        </p>
      </motion.div>
    );
  }

  const steps = [
    { number: 1, label: 'Project Type' },
    { number: 2, label: 'Budget & Timeline' },
    { number: 3, label: 'Contact Info' },
    { number: 4, label: 'Review' },
  ];

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      {/* Progress */}
      <div className="flex items-center justify-between">
        {steps.map((s, idx) => (
          <div key={s.number} className="flex items-center">
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border transition-all',
                  step > s.number
                    ? 'bg-blue-500/20 border-blue-500/50 text-blue-400'
                    : step === s.number
                    ? 'bg-[#0066ff] border-[#0066ff] text-white'
                    : 'bg-white/5 border-white/10 text-gray-600'
                )}
              >
                {step > s.number ? <Check size={14} /> : s.number}
              </span>
              <span
                className={cn(
                  'hidden sm:block text-sm font-medium transition-colors',
                  step === s.number ? 'text-white' : step > s.number ? 'text-gray-400' : 'text-gray-600'
                )}
              >
                {s.label}
              </span>
            </div>
            {idx < steps.length - 1 && (
              <ChevronRight size={14} className="mx-2 text-gray-700" aria-hidden="true" />
            )}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* Step 1 */}
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <div>
              <h3 className="text-lg font-semibold text-white mb-1">What type of project?</h3>
              <p className="text-gray-400 text-sm">Select all that apply.</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {PROJECT_TYPES.map((type) => (
                <button
                  key={type}
                  onClick={() => toggleProjectType(type)}
                  className={cn(
                    'flex items-center gap-2 p-3 rounded-lg border text-left text-sm transition-all',
                    data.projectTypes.includes(type)
                      ? 'border-blue-500 bg-blue-500/10 text-white'
                      : 'border-white/10 bg-white/5 text-gray-400 hover:border-white/20 hover:text-gray-300'
                  )}
                  aria-pressed={data.projectTypes.includes(type)}
                >
                  <span
                    className={cn(
                      'w-4 h-4 rounded border flex items-center justify-center shrink-0',
                      data.projectTypes.includes(type)
                        ? 'bg-[#0066ff] border-[#0066ff]'
                        : 'border-white/20'
                    )}
                  >
                    {data.projectTypes.includes(type) && <Check size={10} className="text-white" />}
                  </span>
                  {type}
                </button>
              ))}
            </div>
            <Button
              className="w-full mt-4"
              disabled={data.projectTypes.length === 0}
              onClick={() => setStep(2)}
            >
              Continue
            </Button>
          </motion.div>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Budget Range</h3>
              <div className="grid grid-cols-2 gap-3">
                {BUDGET_RANGES.map((range) => (
                  <button
                    key={range.id}
                    onClick={() => setData((d) => ({ ...d, budget: range.id }))}
                    className={cn(
                      'p-4 rounded-lg border text-sm font-medium transition-all',
                      data.budget === range.id
                        ? 'border-blue-500 bg-blue-500/10 text-white'
                        : 'border-white/10 bg-white/5 text-gray-400 hover:border-white/20'
                    )}
                  >
                    {range.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Timeline</h3>
              <div className="grid grid-cols-2 gap-3">
                {TIMELINES.map((tl) => (
                  <button
                    key={tl.id}
                    onClick={() => setData((d) => ({ ...d, timeline: tl.id }))}
                    className={cn(
                      'p-4 rounded-lg border text-left transition-all',
                      data.timeline === tl.id
                        ? 'border-blue-500 bg-blue-500/10'
                        : 'border-white/10 bg-white/5 hover:border-white/20'
                    )}
                  >
                    <p className={cn('font-medium text-sm', data.timeline === tl.id ? 'text-white' : 'text-gray-300')}>{tl.label}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{tl.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="secondary" onClick={() => setStep(1)}>Back</Button>
              <Button
                className="flex-1"
                disabled={!data.budget || !data.timeline}
                onClick={() => setStep(3)}
              >
                Continue
              </Button>
            </div>
          </motion.div>
        )}

        {/* Step 3 */}
        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <h3 className="text-lg font-semibold text-white">Contact Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Full Name" required placeholder="Jane Smith" value={data.name} onChange={(e) => setData(d => ({ ...d, name: e.target.value }))} />
              <Input label="Job Title" placeholder="CTO, VP of Engineering..." value={data.title} onChange={(e) => setData(d => ({ ...d, title: e.target.value }))} />
            </div>
            <Input label="Company" required placeholder="Acme Corporation" value={data.company} onChange={(e) => setData(d => ({ ...d, company: e.target.value }))} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Work Email" type="email" required placeholder="jane@acme.com" value={data.email} onChange={(e) => setData(d => ({ ...d, email: e.target.value }))} />
              <Input label="Phone" type="tel" placeholder="+1 (202) 555-0100" value={data.phone} onChange={(e) => setData(d => ({ ...d, phone: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-300">How did you hear about us?</label>
              <select
                value={data.howHeard}
                onChange={(e) => setData(d => ({ ...d, howHeard: e.target.value }))}
                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="" className="bg-[#0d0d14]">Select...</option>
                {HOW_HEARD.map((h) => (
                  <option key={h} value={h} className="bg-[#0d0d14]">{h}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-300">Additional Information</label>
              <textarea
                rows={3}
                placeholder="Any additional context, constraints, or questions..."
                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                value={data.additional}
                onChange={(e) => setData(d => ({ ...d, additional: e.target.value }))}
              />
            </div>
            <div className="flex gap-3">
              <Button variant="secondary" onClick={() => setStep(2)}>Back</Button>
              <Button
                className="flex-1"
                disabled={!data.name || !data.email || !data.company}
                onClick={() => setStep(4)}
              >
                Review Quote
              </Button>
            </div>
          </motion.div>
        )}

        {/* Step 4 */}
        {step === 4 && (
          <motion.div
            key="step4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <h3 className="text-lg font-semibold text-white">Review Your Request</h3>
            <div className="rounded-xl bg-white/5 border border-white/10 divide-y divide-white/10">
              {[
                { label: 'Project Types', value: data.projectTypes.join(', ') },
                { label: 'Budget Range', value: BUDGET_RANGES.find(b => b.id === data.budget)?.label },
                { label: 'Timeline', value: TIMELINES.find(t => t.id === data.timeline)?.label },
                { label: 'Name', value: data.name },
                { label: 'Company', value: data.company },
                { label: 'Email', value: data.email },
                { label: 'Phone', value: data.phone || 'Not provided' },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-start justify-between px-5 py-3">
                  <span className="text-gray-400 text-sm shrink-0 mr-4">{label}</span>
                  <span className="text-white text-sm text-right">{value}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <Button variant="secondary" onClick={() => setStep(3)}>Back</Button>
              <Button className="flex-1" onClick={handleSubmit} loading={loading}>
                Submit Quote Request
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
