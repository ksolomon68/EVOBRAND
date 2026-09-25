import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Download, Loader2, Send, ShieldCheck } from 'lucide-react';
import MutualNdaDocument from '../contracts/MutualNdaDocument';

const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:5000/api' : `${window.location.origin}/api`;
const todayISO = () => new Date().toISOString().slice(0, 10);
const inputClass = 'w-full bg-white/[0.04] border border-white/[0.09] text-white p-3 rounded-xl text-sm focus:outline-none focus:border-[#22c8e5]';
const labelClass = 'block text-[0.72rem] font-bold text-[#8892a4] mb-2 uppercase tracking-wider';

export default function MutualNdaPanel() {
  const [partnerInfo, setPartnerInfo] = useState({ companyName: '', repName: '', title: '', email: '', address: '' });
  const [nda, setNda] = useState({ effectiveDate: todayISO(), purpose: '', termYears: '3', confidentialityYears: '5', state: 'Texas', county: 'Ellis County' });
  const [saving, setSaving] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const setPartner = (key, value) => setPartnerInfo((current) => ({ ...current, [key]: value }));
  const setTerm = (key, value) => setNda((current) => ({ ...current, [key]: value }));

  const sendNda = async () => {
    if (!partnerInfo.email || !partnerInfo.repName) {
      setError('Partner representative and email are required.');
      return;
    }
    setSaving(true); setError('');
    try {
      const token = localStorage.getItem('evobrand_token');
      const partnerLabel = partnerInfo.companyName || partnerInfo.repName;
      const response = await fetch(`${API_BASE}/contracts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          title: `Mutual NDA: ${partnerLabel}`,
          clientEmail: partnerInfo.email,
          contractData: { agreementType: 'mutual-nda', partnerInfo, nda },
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Unable to send the NDA.');
      setSent(true);
      setTimeout(() => setSent(false), 4000);
    } catch (err) { setError(err.message); } finally { setSaving(false); }
  };

  return (
    <>
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2"><ShieldCheck className="text-[#22c8e5]" size={28} /><h1 className="text-3xl font-bold text-white">Mutual NDA</h1></div>
        <p className="text-white/45 max-w-2xl">Prepare a balanced confidentiality agreement for developers, collaborators, and strategic partners. Both parties receive the same protections.</p>
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-[0.82fr_1.18fr] gap-8 items-start">
        <motion.section initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} className="no-print rounded-[20px] border border-white/[0.08] bg-white/[0.035] p-6 sm:p-8 xl:sticky xl:top-6">
          <div className="flex items-center justify-between mb-7">
            <div><p className="text-white font-bold">Agreement details</p><p className="text-white/40 text-xs mt-1">Review the live document before sending.</p></div>
            <button onClick={() => window.print()} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.06] text-white text-xs font-bold hover:bg-white/10"><Download size={14} /> PDF</button>
          </div>
          <Fieldset title="Partner">
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Company / legal name"><input className={inputClass} value={partnerInfo.companyName} onChange={(e) => setPartner('companyName', e.target.value)} placeholder="Partner company or individual" /></Field>
              <Field label="Representative *"><input className={inputClass} value={partnerInfo.repName} onChange={(e) => setPartner('repName', e.target.value)} placeholder="Full legal name" /></Field>
              <Field label="Title / role"><input className={inputClass} value={partnerInfo.title} onChange={(e) => setPartner('title', e.target.value)} placeholder="Developer, Founder, etc." /></Field>
              <Field label="Email *"><input type="email" className={inputClass} value={partnerInfo.email} onChange={(e) => setPartner('email', e.target.value)} placeholder="partner@example.com" /></Field>
              <div className="sm:col-span-2"><Field label="Address"><input className={inputClass} value={partnerInfo.address} onChange={(e) => setPartner('address', e.target.value)} placeholder="Business or mailing address" /></Field></div>
            </div>
          </Fieldset>
          <Fieldset title="Terms">
            <Field label="Purpose of disclosure"><textarea rows={3} className={`${inputClass} resize-none`} value={nda.purpose} onChange={(e) => setTerm('purpose', e.target.value)} placeholder="Evaluating and pursuing a potential development or strategic partnership" /></Field>
            <div className="grid sm:grid-cols-2 gap-4 mt-4">
              <Field label="Effective date"><input type="date" className={inputClass} value={nda.effectiveDate} onChange={(e) => setTerm('effectiveDate', e.target.value)} /></Field>
              <Field label="Agreement term"><select className={inputClass} value={nda.termYears} onChange={(e) => setTerm('termYears', e.target.value)}>{['1','2','3','5'].map(v => <option className="bg-[#07111d]" key={v} value={v}>{v} years</option>)}</select></Field>
              <Field label="Confidentiality period"><select className={inputClass} value={nda.confidentialityYears} onChange={(e) => setTerm('confidentialityYears', e.target.value)}>{['2','3','5','7'].map(v => <option className="bg-[#07111d]" key={v} value={v}>{v} years</option>)}</select></Field>
              <Field label="Governing state"><input className={inputClass} value={nda.state} onChange={(e) => setTerm('state', e.target.value)} /></Field>
              <div className="sm:col-span-2"><Field label="Venue county"><input className={inputClass} value={nda.county} onChange={(e) => setTerm('county', e.target.value)} /></Field></div>
            </div>
          </Fieldset>
          <div className="rounded-xl border border-amber-300/20 bg-amber-300/[0.06] p-4 text-xs leading-5 text-amber-100/75 mb-5">Legal template: have qualified counsel review it for your business, jurisdiction, and specific relationship before relying on it.</div>
          {error && <p className="text-red-400 text-sm mb-3" role="alert">{error}</p>}
          <button onClick={sendNda} disabled={saving || sent} className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-sm disabled:opacity-60" style={{ background: sent ? '#34d399' : '#22c8e5', color: '#003258' }}>
            {saving ? <Loader2 className="animate-spin" size={17} /> : sent ? <CheckCircle2 size={17} /> : <Send size={17} />}{saving ? 'Sending…' : sent ? 'NDA sent' : 'Save & send for signature'}
          </button>
        </motion.section>
        <motion.div initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }}><MutualNdaDocument data={{ agreementType: 'mutual-nda', partnerInfo, nda }} /></motion.div>
      </div>
    </>
  );
}

function Fieldset({ title, children }) { return <fieldset className="mb-7"><legend className="w-full text-[#22c8e5] text-[0.72rem] font-bold uppercase tracking-[0.14em] border-b border-white/[0.08] pb-2 mb-4">{title}</legend>{children}</fieldset>; }
function Field({ label, children }) { return <label><span className={labelClass}>{label}</span>{children}</label>; }
