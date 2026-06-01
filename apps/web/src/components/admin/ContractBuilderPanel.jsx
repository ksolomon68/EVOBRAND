import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Download, FileText, Send, Loader2, CheckCircle2 } from 'lucide-react';

const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:5000/api'
  : 'https://evobrandconcepts.com/api';

const availableServices = [
  { id: 'ai-app', label: 'Custom AI App', icon: '⚡' },
  { id: 'visual', label: 'AI Visual Content', icon: '🎨' },
  { id: 'docs', label: 'Intelligent Docs', icon: '📄' },
  { id: 'video', label: 'AI Video Production', icon: '🎥' },
  { id: 'web', label: 'Web Development', icon: '💻' },
  { id: 'wcag', label: 'WCAG Accessibility', icon: '🛡️' },
];

const clauseMapping = {
  nda: ['ai-app', 'visual', 'docs', 'video', 'web', 'wcag'],
  ip: ['ai-app', 'visual', 'video', 'web'],
  sla: ['ai-app', 'web'],
  wcag_clause: ['wcag'],
  ai_ethics: ['ai-app', 'visual', 'video', 'docs'],
  liability: ['ai-app', 'visual', 'docs', 'video', 'web', 'wcag'],
  indemnification: ['ai-app', 'visual', 'docs', 'video', 'web', 'wcag'],
  termination: ['ai-app', 'visual', 'docs', 'video', 'web', 'wcag'],
  force_majeure: ['ai-app', 'visual', 'docs', 'video', 'web', 'wcag'],
  late_payment: ['ai-app', 'visual', 'docs', 'video', 'web', 'wcag'],
};

const formatCurrency = (value) => {
  const num = Number(value);
  if (!value || Number.isNaN(num)) return '$0.00';
  return num.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 });
};

const formatDate = (dateStr) => {
  if (!dateStr) return '[DATE]';
  const d = new Date(`${dateStr}T00:00:00`);
  if (Number.isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
};

const todayISO = () => new Date().toISOString().slice(0, 10);

const inputClass = 'w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] text-white p-3 rounded-lg text-[0.9rem] focus:outline-none focus:border-[#22c8e5]';
const labelClass = 'block text-[0.8rem] font-semibold text-[#8892a4] mb-2 uppercase';
const sectionHeadClass = 'text-[#22c8e5] text-[0.75rem] font-bold uppercase tracking-[0.1em] mb-4 pb-2 border-b border-[rgba(255,255,255,0.08)]';

export default function ContractBuilderPanel() {
  const agency = { name: 'EVOBRAND Concepts LLC', address: 'Dallas, Texas 75001', email: 'info@evobrandconcepts.com' };

  const [clientInfo, setClientInfo] = useState({ companyName: '', repName: '', title: '', email: '', address: '', phone: '' });
  const [project, setProject] = useState({
    description: '', startDate: todayISO(), completion: '8 weeks from start',
    fee: 5000, payment: '50% upfront, 50% on delivery', revisions: '3',
    state: 'Texas', dispute: 'Binding Arbitration (AAA)',
  });
  const [selectedServices, setSelectedServices] = useState(['ai-app']);
  const [signature, setSignature] = useState('');
  const [clientDate, setClientDate] = useState(todayISO());
  const [clauses, setClauses] = useState({
    nda: true, ip: false, sla: true, wcag_clause: true, ai_ethics: true,
    liability: true, indemnification: true, termination: true, force_majeure: true, late_payment: true,
  });

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState('');

  const toggleClause = (key) => setClauses(prev => ({ ...prev, [key]: !prev[key] }));
  const toggleService = (id) => setSelectedServices(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
  const isRelevant = (key) => selectedServices.length > 0 && selectedServices.some(s => clauseMapping[key].includes(s));

  const handlePrint = () => window.print();

  const handleSave = async () => {
    if (!clientInfo.email) { setSaveError('Client email is required to send the contract.'); return; }
    setSaving(true);
    setSaveError('');
    try {
      const token = localStorage.getItem('evobrand_token');
      const title = `MSA — ${clientInfo.companyName || clientInfo.email} — ${formatDate(project.startDate)}`;
      const res = await fetch(`${API_BASE}/contracts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          title,
          clientEmail: clientInfo.email,
          contractData: { clientInfo, project, selectedServices, clauses },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Save failed');
      setSaved(true);
      setTimeout(() => setSaved(false), 4000);
    } catch (err) {
      setSaveError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const sidebarClauses = [
    { key: 'nda', title: 'Mutual NDA (Strict)', desc: 'Bi-directional non-disclosure with strict data handling and destruction policies.' },
    { key: 'ip', title: 'Full IP Transfer', desc: 'Client retains 100% ownership of custom source code, models, and assets upon final payment.' },
    { key: 'sla', title: '99.9% Uptime SLA', desc: 'Guaranteed enterprise uptime with 24/7 dedicated support and priority incident response.' },
    { key: 'wcag_clause', title: 'WCAG Guarantee', desc: 'Legal guarantee that deliverables meet or exceed WCAG 2.1 AA accessibility standards.' },
    { key: 'ai_ethics', title: 'Responsible AI', desc: 'Generative models and agents adhere to ethical guidelines and bias mitigation.' },
    { key: 'liability', title: 'Limitation of Liability', desc: clauses.liability ? 'Damages capped at fees paid in the prior 3 months; consequential damages excluded.' : 'Standard (uncapped) liability language applies.' },
    { key: 'indemnification', title: 'Indemnification', desc: 'Mutual indemnification covering third-party intellectual property claims.' },
    { key: 'termination', title: 'Termination Rights', desc: 'For cause with 14-day cure period; for convenience with 30-day notice.' },
    { key: 'force_majeure', title: 'Force Majeure', desc: 'Excuses performance during enumerated events beyond reasonable control.' },
    { key: 'late_payment', title: 'Late Payment & Suspension', desc: 'Permits 1.5%/month late fees and suspension of services for non-payment.' },
  ];

  const clientName = clientInfo.companyName || '[CLIENT COMPANY NAME]';
  const repName = clientInfo.repName || '[REPRESENTATIVE NAME]';

  return (
    <>
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .print-contract-preview, .print-contract-preview * { visibility: visible; color: black !important; background: white !important; }
          .print-contract-preview { position: absolute; left: 0; top: 0; width: 100%; border: none !important; box-shadow: none !important; padding: 40px !important; max-height: none !important; overflow: visible !important; }
          .no-print { display: none !important; }
        }
      `}</style>

      <div className="no-print mb-8">
        <h1 className="text-3xl font-bold text-white mb-1">Contract Builder</h1>
        <p className="text-white/40">Build an MSA and send it to a client account.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-8 items-start no-print">
        {/* ── Sidebar ── */}
        <motion.div
          initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
          className="bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-[20px] p-8 h-fit max-h-[78vh] overflow-y-auto"
        >
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-white flex items-center gap-3">
              <FileText size={20} className="text-[#22c8e5]" /> Configure Agreement
            </h3>
            <button onClick={handlePrint} className="flex items-center gap-2 bg-[rgba(255,255,255,0.08)] text-white px-4 py-2 rounded-full font-bold hover:bg-[rgba(255,255,255,0.12)] transition-colors text-sm">
              <Download size={15} /> Print PDF
            </button>
          </div>

          {/* Agency read-only */}
          <div className="mb-8">
            <div className={sectionHeadClass}>Agency</div>
            <div className="bg-[rgba(0,50,88,0.35)] border border-[rgba(34,200,229,0.25)] rounded-lg p-4">
              <p className="text-white text-sm font-bold">{agency.name}</p>
              <p className="text-[#8892a4] text-sm">{agency.address}</p>
              <p className="text-[#8892a4] text-sm">{agency.email}</p>
            </div>
          </div>

          {/* Client Details */}
          <div className="mb-8">
            <div className={sectionHeadClass}>Client Details</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className={labelClass}>Company Name</label><input className={inputClass} placeholder="Acme Corp" value={clientInfo.companyName} onChange={e => setClientInfo({ ...clientInfo, companyName: e.target.value })} /></div>
              <div><label className={labelClass}>Representative</label><input className={inputClass} placeholder="Jane Doe" value={clientInfo.repName} onChange={e => setClientInfo({ ...clientInfo, repName: e.target.value })} /></div>
              <div><label className={labelClass}>Title / Role</label><input className={inputClass} placeholder="Chief Marketing Officer" value={clientInfo.title} onChange={e => setClientInfo({ ...clientInfo, title: e.target.value })} /></div>
              <div><label className={labelClass}>Email Address *</label><input type="email" className={inputClass} placeholder="jane@acme.com" value={clientInfo.email} onChange={e => setClientInfo({ ...clientInfo, email: e.target.value })} /></div>
              <div className="md:col-span-2"><label className={labelClass}>Address</label><input className={inputClass} placeholder="123 Main St, Austin, TX 78701" value={clientInfo.address} onChange={e => setClientInfo({ ...clientInfo, address: e.target.value })} /></div>
              <div className="md:col-span-2"><label className={labelClass}>Phone (optional)</label><input type="tel" className={inputClass} placeholder="(555) 123-4567" value={clientInfo.phone} onChange={e => setClientInfo({ ...clientInfo, phone: e.target.value })} /></div>
            </div>
          </div>

          {/* Project Details */}
          <div className="mb-8">
            <div className={sectionHeadClass}>Project Details</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2"><label className={labelClass}>Project Description</label><textarea rows={2} className={inputClass + ' resize-none'} placeholder="Brief description of the engagement and objectives..." value={project.description} onChange={e => setProject({ ...project, description: e.target.value })} /></div>
              <div><label className={labelClass}>Start Date</label><input type="date" className={inputClass} value={project.startDate} onChange={e => setProject({ ...project, startDate: e.target.value })} /></div>
              <div><label className={labelClass}>Estimated Completion</label><input className={inputClass} placeholder="8 weeks from start" value={project.completion} onChange={e => setProject({ ...project, completion: e.target.value })} /></div>
              <div><label className={labelClass}>Total Project Fee</label><input type="number" className={inputClass} placeholder="5000" value={project.fee} onChange={e => setProject({ ...project, fee: e.target.value })} /></div>
              <div><label className={labelClass}>Revisions Included</label>
                <select className={inputClass} value={project.revisions} onChange={e => setProject({ ...project, revisions: e.target.value })}>
                  {['2', '3', '5', 'Unlimited'].map(v => <option key={v}>{v}</option>)}
                </select>
              </div>
              <div className="md:col-span-2"><label className={labelClass}>Payment Structure</label>
                <select className={inputClass} value={project.payment} onChange={e => setProject({ ...project, payment: e.target.value })}>
                  {['50% upfront, 50% on delivery', '33% upfront, 33% at midpoint, 33% on delivery', 'Monthly retainer', 'Net 30 upon delivery'].map(v => <option key={v}>{v}</option>)}
                </select>
              </div>
              <div><label className={labelClass}>Governing State</label>
                <select className={inputClass} value={project.state} onChange={e => setProject({ ...project, state: e.target.value })}>
                  {['Texas', 'California', 'New York', 'Florida', 'Delaware', 'Other'].map(v => <option key={v}>{v}</option>)}
                </select>
              </div>
              <div><label className={labelClass}>Dispute Resolution</label>
                <select className={inputClass} value={project.dispute} onChange={e => setProject({ ...project, dispute: e.target.value })}>
                  {['Binding Arbitration (AAA)', 'Mediation then Litigation', 'Litigation only'].map(v => <option key={v}>{v}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Services */}
          <div className="mb-8">
            <div className={sectionHeadClass}>Scope of Services</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {availableServices.map(s => (
                <div key={s.id} onClick={() => toggleService(s.id)}
                  className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer border transition-colors ${selectedServices.includes(s.id) ? 'bg-[rgba(34,200,229,0.1)] border-[#22c8e5]' : 'border-[rgba(255,255,255,0.08)] hover:border-[rgba(34,200,229,0.4)]'}`}
                >
                  <div className={`w-5 h-5 rounded border flex items-center justify-center flex-shrink-0 ${selectedServices.includes(s.id) ? 'bg-[#22c8e5] border-[#22c8e5]' : 'border-gray-500'}`}>
                    {selectedServices.includes(s.id) && <Check size={14} className="text-[#003258]" />}
                  </div>
                  <span className="text-white text-sm font-medium">{s.icon} {s.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Legal Clauses */}
          <div className="mb-8">
            <div className={sectionHeadClass}>Legal Clauses</div>
            {sidebarClauses.map(c => isRelevant(c.key) && (
              <div key={c.key} onClick={() => toggleClause(c.key)}
                className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer border mb-3 transition-colors ${clauses[c.key] ? 'bg-[rgba(34,200,229,0.1)] border-[#22c8e5]' : 'border-[rgba(255,255,255,0.08)] hover:border-[rgba(34,200,229,0.4)]'}`}
              >
                <div className={`w-5 h-5 rounded border mt-0.5 flex items-center justify-center flex-shrink-0 ${clauses[c.key] ? 'bg-[#22c8e5] border-[#22c8e5]' : 'border-gray-500'}`}>
                  {clauses[c.key] && <Check size={14} className="text-[#003258]" />}
                </div>
                <div>
                  <h4 className="text-white text-[0.9rem] font-semibold mb-1">{c.title}</h4>
                  <p className="text-[#8892a4] text-[0.8rem]">{c.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Save & Send */}
          <div className="border-t border-[rgba(255,255,255,0.08)] pt-6">
            <div className={sectionHeadClass}>Send to Client</div>
            <p className="text-[#8892a4] text-sm mb-4">This saves the contract and makes it visible in the client's portal under "My Contracts". The client email above must match their registered account.</p>
            {saveError && <p className="text-red-400 text-sm mb-3">{saveError}</p>}
            <button onClick={handleSave} disabled={saving || saved}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all disabled:opacity-60"
              style={{ background: saved ? '#34d399' : '#22c8e5', color: '#003258' }}
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : saved ? <CheckCircle2 size={16} /> : <Send size={16} />}
              {saving ? 'Saving…' : saved ? 'Contract Sent!' : 'Save & Send to Client'}
            </button>
          </div>
        </motion.div>

        {/* ── Contract Preview ── */}
        <motion.div
          initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-[2px] p-10 shadow-2xl h-fit sticky top-6 max-h-[85vh] overflow-y-auto print-contract-preview"
          style={{ fontFamily: 'Times New Roman, serif' }}
        >
          <div className="text-black text-[0.9rem] leading-[1.8]">
            <h4 className="text-xl font-bold mb-2 text-center uppercase tracking-widest border-b-2 border-black pb-4">Master Services Agreement</h4>
            <p className="mt-6 mb-6">This Master Services Agreement (the &ldquo;Agreement&rdquo;) is entered into as of <strong>{formatDate(project.startDate)}</strong> (the &ldquo;Effective Date&rdquo;), by and between:</p>

            <div className="mb-6">
              <p className="mb-2"><strong>{agency.name}</strong> (the &ldquo;Agency&rdquo;), located at {agency.address}, email {agency.email}; and</p>
              <p><strong>{clientName}</strong> (the &ldquo;Client&rdquo;), located at {clientInfo.address || '[CLIENT ADDRESS]'}, represented by {repName}{clientInfo.title ? `, ${clientInfo.title}` : ''}, email {clientInfo.email || '[CLIENT EMAIL]'}{clientInfo.phone ? `, phone ${clientInfo.phone}` : ''}.</p>
              <p className="mt-2">The Agency and the Client are each a &ldquo;Party&rdquo; and collectively the &ldquo;Parties.&rdquo;</p>
            </div>

            <h5 className="font-bold mt-6 mb-2 uppercase">1. Definitions</h5>
            <p className="mb-4">For purposes of this Agreement: &ldquo;Services&rdquo; means the work described in Section 2; &ldquo;Deliverables&rdquo; means the tangible and intangible work product furnished to the Client; &ldquo;Confidential Information&rdquo; means non-public information disclosed by either Party; and &ldquo;Fees&rdquo; means the amounts payable under Section 3.</p>

            <h5 className="font-bold mt-6 mb-2 uppercase">2. Scope of Services</h5>
            <p className="mb-2">The Agency shall provide the following Services:</p>
            <ul className="list-disc pl-8 mb-3">
              {selectedServices.length === 0 && <li><em>No services selected.</em></li>}
              {selectedServices.map(id => { const s = availableServices.find(x => x.id === id); return <li key={id}><strong>{s.label}</strong></li>; })}
            </ul>
            <p className="mb-4"><strong>Project Description:</strong> {project.description || '[Project description to be provided by the Client.]'}</p>

            <h5 className="font-bold mt-6 mb-2 uppercase">3. Fees &amp; Payment Terms</h5>
            <p className="mb-4">The total fee for the Services is <strong>{formatCurrency(project.fee)}</strong>, payable on the following basis: <strong>{project.payment}</strong>. All invoices are due upon receipt. Any amount not paid when due shall accrue interest at 1.5% per month, and the Agency reserves the right to suspend Services upon written notice until all past-due amounts are paid in full.</p>

            <h5 className="font-bold mt-6 mb-2 uppercase">4. Project Timeline &amp; Deliverables</h5>
            <p className="mb-4">The engagement shall commence on <strong>{formatDate(project.startDate)}</strong>, with an estimated completion of <strong>{project.completion}</strong>. Timeline estimates are contingent upon the Client's timely provision of materials, approvals, and feedback.</p>

            <h5 className="font-bold mt-6 mb-2 uppercase">5. Revisions &amp; Change Orders</h5>
            <p className="mb-4">This Agreement includes <strong>{project.revisions === 'Unlimited' ? 'unlimited' : project.revisions}</strong> round{project.revisions === '1' ? '' : 's'} of revisions per Deliverable. Revisions beyond the included allotment require a written change order signed by both Parties and may incur additional fees.</p>

            {isRelevant('ip') && (<><h5 className="font-bold mt-6 mb-2 uppercase">6. Intellectual Property</h5><p className="mb-4">{clauses.ip ? "Upon the Agency's receipt of all Fees due, the Agency assigns to the Client all right, title, and interest in the final Deliverables, including source code, custom models, and assets. The Agency retains ownership of pre-existing tools and frameworks and grants the Client a perpetual, royalty-free license to use them solely as incorporated in the Deliverables." : "The Agency retains all right, title, and interest in the Deliverables and underlying frameworks. Upon receipt of all Fees due, the Agency grants the Client a perpetual, non-exclusive, royalty-free license to use the Deliverables for internal business purposes."}</p></>)}

            {isRelevant('nda') && (<><h5 className="font-bold mt-6 mb-2 uppercase">7. Confidentiality &amp; NDA</h5><p className="mb-4">{clauses.nda ? "Each Party shall hold the other Party's Confidential Information in strict confidence, use it solely to perform this Agreement, and protect it with SOC 2-aligned safeguards. Upon termination or written request, the receiving Party shall promptly return or securely destroy all Confidential Information. These obligations survive termination for five (5) years." : "Each Party shall maintain the confidentiality of the other Party's trade secrets and non-public business information and shall not disclose such information to third parties except as required to perform the Services."}</p></>)}

            <h5 className="font-bold mt-6 mb-2 uppercase">8. Warranties &amp; Disclaimers</h5>
            <p className="mb-4">The Agency warrants that the Services will be performed in a professional and workmanlike manner consistent with generally accepted industry standards. EXCEPT FOR THE EXPRESS WARRANTY ABOVE, THE SERVICES AND DELIVERABLES ARE PROVIDED "AS IS," AND THE AGENCY DISCLAIMS ALL OTHER WARRANTIES, WHETHER EXPRESS, IMPLIED, OR STATUTORY.</p>

            {isRelevant('sla') && (<><h5 className="font-bold mt-6 mb-2 uppercase">9. Service Level Agreement</h5><p className="mb-4">{clauses.sla ? "The Agency shall use commercially reasonable efforts to maintain 99.9% uptime for deployed infrastructure, measured monthly and excluding scheduled maintenance. The Agency shall provide 24/7 priority support with a one-hour target response time for critical incidents." : "The Agency shall provide standard support during normal business hours with a 24-hour response target. No specific uptime guarantee applies."}</p></>)}

            {isRelevant('wcag_clause') && (<><h5 className="font-bold mt-6 mb-2 uppercase">10. WCAG Accessibility Compliance</h5><p className="mb-4">{clauses.wcag_clause ? "The Agency guarantees that all delivered digital properties will conform to WCAG 2.1 Level AA at the time of delivery. The Agency shall remediate, at no additional cost, any nonconformity identified within thirty (30) days of delivery, provided the Client has not modified the Deliverables." : "The Agency will apply accessibility best practices on a commercially reasonable, best-effort basis without a strict liability guarantee of WCAG conformance."}</p></>)}

            {isRelevant('ai_ethics') && (<><h5 className="font-bold mt-6 mb-2 uppercase">11. Responsible AI &amp; Ethics</h5><p className="mb-4">{clauses.ai_ethics ? "The Agency shall develop and deploy all AI systems in accordance with responsible AI principles, including bias mitigation, data privacy, transparency, and explainability. The Agency shall not use the Client's Confidential Information to train models for third parties without written consent." : "The Agency may use standard, commercially available AI tooling without bespoke bias-mitigation constraints. The Client is responsible for reviewing AI-generated outputs prior to use."}</p></>)}

            {isRelevant('liability') && (<><h5 className="font-bold mt-6 mb-2 uppercase">12. Limitation of Liability</h5><p className="mb-4">{clauses.liability ? "TO THE MAXIMUM EXTENT PERMITTED BY LAW, THE AGENCY'S TOTAL CUMULATIVE LIABILITY SHALL NOT EXCEED THE TOTAL FEES ACTUALLY PAID BY THE CLIENT DURING THE THREE (3) MONTHS IMMEDIATELY PRECEDING THE EVENT GIVING RISE TO THE CLAIM. IN NO EVENT SHALL EITHER PARTY BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR FOR LOST PROFITS OR DATA." : "Each Party shall be liable for direct damages arising from its own negligence or willful misconduct, subject to applicable law."}</p></>)}

            {isRelevant('indemnification') && (<><h5 className="font-bold mt-6 mb-2 uppercase">13. Indemnification</h5><p className="mb-4">Each Party (the &ldquo;Indemnifying Party&rdquo;) shall defend, indemnify, and hold harmless the other Party from third-party claims arising out of the Indemnifying Party's breach of this Agreement, negligence, or willful misconduct. The Agency shall additionally indemnify the Client against third-party claims alleging that the Deliverables infringe such third party's intellectual property rights, excluding claims arising from Client-supplied materials.</p></>)}

            {isRelevant('termination') && (<><h5 className="font-bold mt-6 mb-2 uppercase">14. Termination</h5><p className="mb-4">Either Party may terminate for cause if the other Party materially breaches this Agreement and fails to cure such breach within fourteen (14) days after written notice. Either Party may terminate for convenience upon thirty (30) days' prior written notice. Upon termination, the Client shall pay for all Services performed through the effective date of termination.</p></>)}

            {isRelevant('force_majeure') && (<><h5 className="font-bold mt-6 mb-2 uppercase">15. Force Majeure</h5><p className="mb-4">Neither Party shall be liable for delays caused by events beyond its reasonable control, including acts of God, natural disasters, war, terrorism, governmental action, labor disputes, epidemics, or failures of third-party service providers. If a force majeure event continues for more than sixty (60) days, either Party may terminate upon written notice.</p></>)}

            <h5 className="font-bold mt-6 mb-2 uppercase">16. Dispute Resolution</h5>
            <p className="mb-4">{project.dispute === 'Binding Arbitration (AAA)' ? `Any dispute shall be resolved by final and binding arbitration administered by the AAA under its Commercial Arbitration Rules in ${project.state}. Each Party waives any right to a jury trial and to participate in a class action.` : project.dispute === 'Mediation then Litigation' ? `The Parties shall first attempt to resolve disputes through non-binding mediation. If unresolved within thirty (30) days, either Party may pursue litigation in the courts of ${project.state}.` : `Disputes shall be resolved exclusively through litigation in the courts of ${project.state}, and each Party consents to the personal jurisdiction of such courts.`}</p>

            <h5 className="font-bold mt-6 mb-2 uppercase">17. Governing Law</h5>
            <p className="mb-4">This Agreement shall be governed by and construed in accordance with the laws of the State of <strong>{project.state}</strong>, without regard to its conflict-of-laws principles.</p>

            <h5 className="font-bold mt-6 mb-2 uppercase">18. General Provisions</h5>
            <p className="mb-4"><strong>Entire Agreement.</strong> This Agreement constitutes the entire agreement between the Parties. <strong>Amendments</strong> must be in writing signed by both Parties. <strong>Severability:</strong> if any provision is unenforceable, the remainder stays in effect. <strong>No Waiver.</strong> Failure to enforce any provision is not a waiver. <strong>Electronic Signatures</strong> have the same legal effect as original signatures.</p>

            <p className="mb-12 mt-6">IN WITNESS WHEREOF, the Parties have executed this Agreement as of the Effective Date.</p>

            <div className="grid grid-cols-2 gap-12 mt-8">
              <div>
                <div className="border-b border-black mb-2 pb-1 text-xl" style={{ fontFamily: "'Brush Script MT', cursive" }}>Keisha Solomon</div>
                <p className="text-sm font-bold uppercase">Agency</p>
                <p className="text-sm">Name: Keisha Solomon</p>
                <p className="text-sm">Title: CEO, {agency.name}</p>
                <p className="text-sm">Date: {formatDate(project.startDate)}</p>
              </div>
              <div>
                <div className="border-b border-black mb-2">
                  <input type="text" value={signature} onChange={e => setSignature(e.target.value)} placeholder="Type full name to sign..." className="w-full text-xl outline-none bg-transparent" style={{ fontFamily: signature ? "'Brush Script MT', cursive" : 'inherit' }} />
                </div>
                <p className="text-sm font-bold uppercase">Client</p>
                <p className="text-sm">Name: {repName}</p>
                <p className="text-sm">Title: {clientInfo.title || '[TITLE]'}</p>
                <p className="text-sm">Company: {clientName}</p>
                <p className="text-sm flex items-center gap-1">Date:&nbsp;
                  <input type="date" value={clientDate} onChange={e => setClientDate(e.target.value)} className="text-sm outline-none bg-transparent border-b border-gray-400" />
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
}
