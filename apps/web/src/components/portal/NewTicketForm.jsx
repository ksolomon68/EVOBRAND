import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { X, Upload, Send, ShieldCheck, Zap, Star, Shield, Check } from 'lucide-react';

const DRAFT_KEY = 'evobrand_ticket_draft';

const TICKET_TYPES = [
  {
    id: 'simple_update',
    label: 'Simple Update',
    sublabel: 'Image, doc, or text only',
    price: '$50–$150',
    turnaround: '1–2 business days',
  },
  {
    id: 'standard',
    label: 'Single Support Ticket',
    sublabel: 'One fix or technical issue',
    price: '$149',
    turnaround: '48-hour turnaround',
  },
  {
    id: 'urgent',
    label: 'Urgent Fix',
    sublabel: 'Critical issue — jump the queue',
    price: '$299',
    turnaround: '24-hour response',
  },
  {
    id: 'custom_dev',
    label: 'Custom Development',
    sublabel: 'New features or bespoke builds',
    price: '$99/hr',
    turnaround: 'Timeline quoted per project',
  },
];

const PLAN_META = {
  basic:  { label: 'Basic Support Plan',  icon: <Shield size={14} />,  color: '#22c8e5' },
  pro:    { label: 'Pro Support Plan',    icon: <Zap size={14} />,     color: '#22c8e5' },
  elite:  { label: 'Elite Support Plan',  icon: <Star size={14} />,    color: '#E8DDD0' },
};

const NewTicketForm = ({ onClose, onSubmit, user, usage }) => {
  const supportPlan = user?.support_plan || null;
  const hasPlan = !!supportPlan;

  const [formData, setFormData] = useState(() => {
    try {
      const saved = localStorage.getItem(DRAFT_KEY);
      if (saved) return { file: null, ticketType: hasPlan ? 'plan_covered' : 'standard', ...JSON.parse(saved) };
    } catch {}
    return {
      subject: '',
      priority: 'normal',
      service: 'Web Design',
      description: '',
      file: null,
      ticketType: hasPlan ? 'plan_covered' : 'standard',
    };
  });

  useEffect(() => {
    const { file, ...saveable } = formData;
    localStorage.setItem(DRAFT_KEY, JSON.stringify(saveable));
  }, [formData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ ...formData, hasPlan, supportPlan });
    localStorage.removeItem(DRAFT_KEY);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    if (e.target.files[0]) setFormData({ ...formData, file: e.target.files[0] });
  };

  const planMeta = supportPlan ? PLAN_META[supportPlan] : null;

  return (
    <div className="fixed inset-0 bg-[#04080f]/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-[#04080f] border border-white/10 rounded-[2.5rem] w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] shadow-[0_0_100px_-20px_rgba(34,200,229,0.2)]"
      >
        {/* Header */}
        <div className="p-8 border-b border-white/5 flex justify-between items-center bg-gradient-to-r from-white/5 to-transparent">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Zap size={16} className="text-[#22c8e5]" />
              <h2 className="text-2xl font-bold text-white">Initialize New Transmission</h2>
            </div>
            <p className="text-white/40 text-xs font-bold uppercase tracking-widest">Support Node Alpha // Secure Entry</p>
          </div>
          <button
            onClick={onClose}
            className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-white/40 hover:text-white transition-all"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-8 overflow-y-auto custom-scrollbar">
          <form onSubmit={handleSubmit} className="space-y-8">

            {/* ── Plan badge or ticket type selector ──────────────────────── */}
            {hasPlan ? (() => {
              const limitReached = usage && !usage.unlimited && usage.remaining <= 0;
              return (
                <div className="flex items-center gap-3 px-5 py-4 rounded-2xl" style={{
                  background: limitReached ? 'rgba(251,191,36,0.08)' : 'rgba(34,200,229,0.07)',
                  border: `1px solid ${limitReached ? 'rgba(251,191,36,0.3)' : 'rgba(34,200,229,0.25)'}`,
                }}>
                  <span style={{ color: planMeta?.color }}>{planMeta?.icon}</span>
                  <div className="flex-1">
                    <p className="text-xs font-bold uppercase tracking-widest" style={{ color: 'rgba(232,221,208,0.45)' }}>Active Maintenance Plan</p>
                    <p className="font-bold text-sm" style={{ color: '#22c8e5' }}>{planMeta?.label}</p>
                    {usage && !usage.unlimited && (
                      <p className="text-xs mt-1" style={{ color: limitReached ? '#fbbf24' : 'rgba(232,221,208,0.4)' }}>
                        {usage.used} of {usage.quota} included tickets used this month
                      </p>
                    )}
                  </div>
                  {limitReached ? (
                    <div className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full text-center" style={{ background: 'rgba(251,191,36,0.15)', color: '#fbbf24' }}>
                      Limit reached — billed at $85/hr
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full" style={{ background: 'rgba(34,200,229,0.12)', color: '#22c8e5' }}>
                      <Check size={11} /> Covered — no charge
                    </div>
                  )}
                </div>
              );
            })() : (
              <div className="space-y-3">
                <label className="text-white/40 text-xs font-bold uppercase tracking-widest ml-1">Ticket Type & Pricing</label>
                <div className="grid grid-cols-1 gap-3">
                  {TICKET_TYPES.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, ticketType: t.id })}
                      className="flex items-center justify-between px-5 py-4 rounded-2xl text-left transition-all"
                      style={{
                        background: formData.ticketType === t.id ? 'rgba(34,200,229,0.1)' : 'rgba(255,255,255,0.03)',
                        border: formData.ticketType === t.id ? '1.5px solid #22c8e5' : '1px solid rgba(255,255,255,0.08)',
                      }}
                    >
                      <div>
                        <p className="font-bold text-sm text-white">{t.label}</p>
                        <p className="text-xs mt-0.5" style={{ color: 'rgba(232,221,208,0.4)' }}>{t.sublabel} · {t.turnaround}</p>
                      </div>
                      <div className="text-right flex-shrink-0 ml-4">
                        <span className="font-bold" style={{ color: formData.ticketType === t.id ? '#22c8e5' : 'rgba(232,221,208,0.6)' }}>{t.price}</span>
                      </div>
                    </button>
                  ))}
                </div>
                <p className="text-xs ml-1" style={{ color: 'rgba(232,221,208,0.3)' }}>
                  Want unlimited tickets? <Link to="/maintenance-plans" className="underline" style={{ color: '#22c8e5' }}>View maintenance plans</Link>
                </p>
              </div>
            )}

            {/* ── Service & Priority ──────────────────────────────────────── */}
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-white/40 text-xs font-bold uppercase tracking-widest ml-1">Target Cluster</label>
                <select
                  name="service"
                  value={formData.service}
                  onChange={handleChange}
                  className="w-full px-5 py-4 bg-white/5 text-white border border-white/10 rounded-2xl focus:outline-none focus:border-[#22c8e5] transition-all font-medium appearance-none"
                >
                  <option value="Web Design" className="bg-[#04080f]">Web Design & Dev</option>
                  <option value="AI Automation" className="bg-[#04080f]">AI Automation</option>
                  <option value="Maintenance" className="bg-[#04080f]">Maintenance</option>
                  <option value="SEO & Marketing" className="bg-[#04080f]">SEO & Marketing</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-white/40 text-xs font-bold uppercase tracking-widest ml-1">Urgency Level</label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  className="w-full px-5 py-4 bg-white/5 text-white border border-white/10 rounded-2xl focus:outline-none focus:border-[#22c8e5] transition-all font-medium appearance-none"
                >
                  <option value="low" className="bg-[#04080f]">Low (General Inquiry)</option>
                  <option value="normal" className="bg-[#04080f]">Normal (Standard Request)</option>
                  <option value="high" className="bg-[#04080f]">High (Important Issue)</option>
                  <option value="urgent" className="bg-[#04080f]">Urgent (Critical Failure)</option>
                </select>
              </div>
            </div>

            {/* ── Subject ─────────────────────────────────────────────────── */}
            <div className="space-y-2">
              <label className="text-white/40 text-xs font-bold uppercase tracking-widest ml-1">Transmission Subject</label>
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                placeholder="Brief summary of the operation..."
                className="w-full px-5 py-4 bg-white/5 text-white border border-white/10 rounded-2xl focus:outline-none focus:border-[#22c8e5] transition-all"
                required
              />
            </div>

            {/* ── Description ─────────────────────────────────────────────── */}
            <div className="space-y-2">
              <label className="text-white/40 text-xs font-bold uppercase tracking-widest ml-1">Detailed Intelligence</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="6"
                placeholder="Describe the requirements or issue in detail..."
                className="w-full px-5 py-4 bg-white/5 text-white border border-white/10 rounded-2xl focus:outline-none focus:border-[#22c8e5] transition-all resize-none"
                required
              />
            </div>

            {/* ── File Upload ─────────────────────────────────────────────── */}
            <div className="space-y-2">
              <label className="text-white/40 text-xs font-bold uppercase tracking-widest ml-1">Supplementary Evidence</label>
              <div className="border-2 border-dashed border-white/10 rounded-3xl p-8 text-center hover:border-[#22c8e5]/50 hover:bg-[#22c8e5]/5 transition-all bg-white/2">
                <input type="file" id="file-upload" className="hidden" onChange={handleFileChange} />
                <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center justify-center">
                  <Upload className="text-[#22c8e5] mb-3" size={28} />
                  <span className="text-white font-bold text-sm mb-1">{formData.file ? formData.file.name : 'Upload Assets'}</span>
                  <span className="text-white/20 text-xs uppercase tracking-widest">PNG, JPG, PDF up to 10MB</span>
                </label>
              </div>
            </div>

            {/* ── Footer ──────────────────────────────────────────────────── */}
            <div className="flex items-center justify-between pt-4">
              <div className="flex items-center gap-2 text-white/20">
                <ShieldCheck size={16} />
                <span className="text-[10px] font-bold uppercase tracking-widest">Secure Transmission Active</span>
              </div>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-8 py-4 bg-white/5 border border-white/10 text-white/60 rounded-2xl hover:bg-white/10 hover:text-white transition-all font-bold text-xs uppercase tracking-widest"
                >
                  Abort
                </button>
                <button
                  type="submit"
                  className="px-8 py-4 bg-[#22c8e5] text-[#003258] rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-[#1ba3c0] transition-all shadow-xl shadow-[#22c8e5]/20 flex items-center gap-2"
                >
                  <Send size={16} />
                  Submit Transmission
                </button>
              </div>
            </div>

          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default NewTicketForm;
