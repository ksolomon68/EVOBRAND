import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, X, Download, Clock, CheckCircle2, Send, CreditCard, Copy } from 'lucide-react';
import PaymentModal from './PaymentModal';

const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:5000/api'
  : (window.location.origin + '/api');

const GOLD = '#22c8e5';

const statusConfig = {
  sent: { label: 'Awaiting Signature', color: '#facc15', icon: Clock },
  signed: { label: 'Signed', color: '#34d399', icon: CheckCircle2 },
  draft: { label: 'Draft', color: '#8892a4', icon: Send },
};

const paymentStatusConfig = {
  paid:   { label: 'Paid', color: '#34d399' },
  unpaid: { label: 'Unpaid', color: '#facc15' },
};

const formatDate = (str) => {
  if (!str) return '—';
  return new Date(str).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
};

function ContractModal({ contract, onClose, onSign, isAdmin, onEditContract }) {
  const [signature, setSignature] = useState('');
  const [signing, setSigning] = useState(false);

  const handleSign = async () => {
    if (!signature.trim()) return;
    setSigning(true);
    await onSign(signature);
    setSigning(false);
  };

  if (!contract) return null;
  const data = typeof contract.contract_data === 'string'
    ? JSON.parse(contract.contract_data)
    : contract.contract_data;
  const { clientInfo = {}, project = {}, selectedServices = [], clauses = {} } = data;

  const agency = { name: 'EVOBRAND Concepts LLC', address: 'Ellis County, Texas 75165', email: 'info@evobrand.net' };
  const fmtDate = (d) => { if (!d) return '[DATE]'; const dt = new Date(`${d}T00:00:00`); return isNaN(dt) ? d : dt.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }); };
  const fmtCurrency = (v) => { const n = Number(v); return (!v || isNaN(n)) ? '$0.00' : n.toLocaleString('en-US', { style: 'currency', currency: 'USD' }); };

  const serviceLabels = {
    'ai-app': 'Custom AI App', visual: 'AI Visual Content', docs: 'Intelligent Docs',
    video: 'AI Video Production', web: 'Web Development', wcag: 'WCAG Accessibility',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-12 overflow-y-auto" style={{ background: 'rgba(0,0,0,0.85)' }}>
      <div className="relative w-full max-w-3xl">
        <div className="flex items-center justify-between mb-4 no-print">
          <h2 className="text-white font-bold text-lg">{contract.title}</h2>
          <div className="flex items-center gap-3">
            {isAdmin && (
              <button
                onClick={() => {
                  onEditContract(contract);
                  onClose();
                }}
                className="px-4 py-2 rounded-2xl font-bold text-sm transition-colors hover:bg-white/10"
                style={{ border: '1px solid rgba(255,255,255,0.2)', color: '#fff' }}
              >
                Edit &amp; Resend
              </button>
            )}
            <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2 rounded-2xl font-bold text-sm transition-colors" style={{ background: GOLD, color: '#003258' }}>
              <Download size={14} /> Print / Download
            </button>
            <button onClick={onClose} className="p-2 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Contract document — renders identically to ContractBuilderPanel preview */}
        <div className="bg-white rounded p-10 shadow-2xl print-contract-preview" style={{ fontFamily: 'Times New Roman, serif' }}>
          <div className="text-black text-[0.9rem] leading-[1.8]">
            <h4 className="text-xl font-bold mb-2 text-center uppercase tracking-widest border-b-2 border-black pb-4">Services Agreement</h4>
            <p className="mt-6 mb-6">This Services Agreement (the &ldquo;Agreement&rdquo;) is entered into as of <strong>{fmtDate(project.startDate)}</strong> (the &ldquo;Effective Date&rdquo;), by and between:</p>

            <div className="mb-6">
              <p className="mb-2"><strong>{agency.name}</strong> (the &ldquo;Agency&rdquo;), located at {agency.address}, email {agency.email}; and</p>
              <p><strong>{clientInfo.companyName || '[CLIENT COMPANY NAME]'}</strong> (the &ldquo;Client&rdquo;), located at {clientInfo.address || '[CLIENT ADDRESS]'}, represented by {clientInfo.repName || '[REPRESENTATIVE NAME]'}{clientInfo.title ? `, ${clientInfo.title}` : ''}, email {clientInfo.email || '[CLIENT EMAIL]'}{clientInfo.phone ? `, phone ${clientInfo.phone}` : ''}.</p>
              <p className="mt-2">The Agency and the Client are each a &ldquo;Party&rdquo; and collectively the &ldquo;Parties.&rdquo;</p>
            </div>

            <h5 className="font-bold mt-6 mb-2 uppercase">1. Definitions</h5>
            <p className="mb-4">For purposes of this Agreement: &ldquo;Services&rdquo; means the work described in Section 2; &ldquo;Deliverables&rdquo; means the tangible and intangible work product furnished to the Client; &ldquo;Confidential Information&rdquo; means non-public information disclosed by either Party; and &ldquo;Fees&rdquo; means the amounts payable under Section 3.</p>

            <h5 className="font-bold mt-6 mb-2 uppercase">2. Scope of Services</h5>
            <p className="mb-2">The Agency shall provide the following Services:</p>
            <ul className="list-disc pl-8 mb-3">
              {selectedServices.length === 0 && <li><em>No services selected.</em></li>}
              {selectedServices.map(id => { const s = serviceLabels[id] || id; return <li key={id}><strong>{s}</strong></li>; })}
            </ul>
            <p className="mb-4"><strong>Project Description:</strong> {project.description || '[Project description to be provided by the Client.]'}</p>

            <h5 className="font-bold mt-6 mb-2 uppercase">3. Fees &amp; Payment Terms</h5>
            <p className="mb-4">The total fee for the Services is <strong>{fmtCurrency(project.fee)}</strong>, payable on the following basis: <strong>{project.payment}</strong>. All invoices are due upon receipt. Any amount not paid when due shall accrue interest at 1.5% per month, and the Agency reserves the right to suspend Services upon written notice until all past-due amounts are paid in full.</p>

            <h5 className="font-bold mt-6 mb-2 uppercase">4. Project Timeline &amp; Deliverables</h5>
            <p className="mb-4">The engagement shall commence on <strong>{fmtDate(project.startDate)}</strong>, with an estimated completion of <strong>{project.completion}</strong>. Timeline estimates are contingent upon the Client's timely provision of materials, approvals, and feedback.</p>

            <h5 className="font-bold mt-6 mb-2 uppercase">5. Revisions &amp; Change Orders</h5>
            <p className="mb-4">This Agreement includes <strong>{project.revisions === 'Unlimited' ? 'unlimited' : project.revisions}</strong> round{project.revisions === '1' ? '' : 's'} of revisions per Deliverable. Revisions beyond the included allotment require a written change order signed by both Parties and may incur additional fees.</p>

            {clauses.ip && (<><h5 className="font-bold mt-6 mb-2 uppercase">6. Intellectual Property</h5><p className="mb-4">Upon the Agency&apos;s receipt of all Fees due, the Agency assigns to the Client all right, title, and interest in the final Deliverables, including source code, custom models, and assets. The Agency retains ownership of pre-existing tools and frameworks and grants the Client a perpetual, royalty-free license to use them solely as incorporated in the Deliverables.</p></>)}

            {clauses.nda && (<><h5 className="font-bold mt-6 mb-2 uppercase">7. Confidentiality &amp; NDA</h5><p className="mb-4">Each Party shall hold the other Party&apos;s Confidential Information in strict confidence, use it solely to perform this Agreement, and protect it with SOC 2-aligned safeguards. Upon termination or written request, the receiving Party shall promptly return or securely destroy all Confidential Information. These obligations survive termination for five (5) years.</p></>)}

            <h5 className="font-bold mt-6 mb-2 uppercase">8. Warranties &amp; Disclaimers</h5>
            <p className="mb-4">The Agency warrants that the Services will be performed in a professional and workmanlike manner consistent with generally accepted industry standards. EXCEPT FOR THE EXPRESS WARRANTY ABOVE, THE SERVICES AND DELIVERABLES ARE PROVIDED &quot;AS IS,&quot; AND THE AGENCY DISCLAIMS ALL OTHER WARRANTIES, WHETHER EXPRESS, IMPLIED, OR STATUTORY.</p>

            {clauses.sla && (<><h5 className="font-bold mt-6 mb-2 uppercase">9. Service Level Agreement</h5><p className="mb-4">The Agency shall use commercially reasonable efforts to maintain 99.9% uptime for deployed infrastructure, measured monthly and excluding scheduled maintenance. The Agency shall provide 24/7 priority support with a one-hour target response time for critical incidents.</p></>)}

            {clauses.wcag_clause && (<><h5 className="font-bold mt-6 mb-2 uppercase">10. WCAG Accessibility Compliance</h5><p className="mb-4">The Agency guarantees that all delivered digital properties will conform to WCAG 2.1 Level AA at the time of delivery. The Agency shall remediate, at no additional cost, any nonconformity identified within thirty (30) days of delivery, provided the Client has not modified the Deliverables.</p></>)}

            {clauses.ai_ethics && (<><h5 className="font-bold mt-6 mb-2 uppercase">11. Responsible AI &amp; Ethics</h5><p className="mb-4">The Agency shall develop and deploy all AI systems in accordance with responsible AI principles, including bias mitigation, data privacy, transparency, and explainability. The Agency shall not use the Client&apos;s Confidential Information to train models for third parties without written consent.</p></>)}

            {clauses.liability && (<><h5 className="font-bold mt-6 mb-2 uppercase">12. Limitation of Liability</h5><p className="mb-4">TO THE MAXIMUM EXTENT PERMITTED BY LAW, THE AGENCY&apos;S TOTAL CUMULATIVE LIABILITY SHALL NOT EXCEED THE TOTAL FEES ACTUALLY PAID BY THE CLIENT DURING THE THREE (3) MONTHS IMMEDIATELY PRECEDING THE EVENT GIVING RISE TO THE CLAIM. IN NO EVENT SHALL EITHER PARTY BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR FOR LOST PROFITS OR DATA.</p></>)}

            {clauses.indemnification && (<><h5 className="font-bold mt-6 mb-2 uppercase">13. Indemnification</h5><p className="mb-4">Each Party (the &ldquo;Indemnifying Party&rdquo;) shall defend, indemnify, and hold harmless the other Party from third-party claims arising out of the Indemnifying Party&apos;s breach of this Agreement, negligence, or willful misconduct. The Agency shall additionally indemnify the Client against third-party claims alleging that the Deliverables infringe such third party&apos;s intellectual property rights, excluding claims arising from Client-supplied materials.</p></>)}

            {clauses.termination && (<><h5 className="font-bold mt-6 mb-2 uppercase">14. Termination</h5><p className="mb-4">Either Party may terminate for cause if the other Party materially breaches this Agreement and fails to cure such breach within fourteen (14) days after written notice. Either Party may terminate for convenience upon thirty (30) days&apos; prior written notice. Upon termination, the Client shall pay for all Services performed through the effective date of termination.</p></>)}

            {clauses.force_majeure && (<><h5 className="font-bold mt-6 mb-2 uppercase">15. Force Majeure</h5><p className="mb-4">Neither Party shall be liable for delays caused by events beyond its reasonable control, including acts of God, natural disasters, war, terrorism, governmental action, labor disputes, epidemics, or failures of third-party service providers. If a force majeure event continues for more than sixty (60) days, either Party may terminate upon written notice.</p></>)}

            <h5 className="font-bold mt-6 mb-2 uppercase">16. Dispute Resolution</h5>
            <p className="mb-4">{project.dispute === 'Binding Arbitration (AAA)' ? `Any dispute shall be resolved by final and binding arbitration administered by the AAA under its Commercial Arbitration Rules in ${project.state}. Each Party waives any right to a jury trial and to participate in a class action.` : project.dispute === 'Mediation then Litigation' ? `The Parties shall first attempt to resolve disputes through non-binding mediation. If unresolved within thirty (30) days, either Party may pursue litigation in the courts of ${project.state}.` : `Disputes shall be resolved exclusively through litigation in the courts of ${project.state}, and each Party consents to the personal jurisdiction of such courts.`}</p>

            <h5 className="font-bold mt-6 mb-2 uppercase">17. Governing Law</h5>
            <p className="mb-4">This Agreement shall be governed by and construed in accordance with the laws of the State of <strong>{project.state}</strong>, without regard to its conflict-of-laws principles.</p>

            <h5 className="font-bold mt-6 mb-2 uppercase">18. General Provisions</h5>
            <p className="mb-4"><strong>Entire Agreement.</strong> This Agreement constitutes the entire agreement between the Parties. <strong>Amendments</strong> must be in writing signed by both Parties. <strong>Severability:</strong> if any provision is unenforceable, the remainder stays in effect. <strong>No Waiver.</strong> Failure to enforce any provision is not a waiver. <strong>Electronic Signatures</strong> have the same legal effect as original signatures.</p>

            <p className="mb-12 mt-6">IN WITNESS WHEREOF, the Parties have executed this Agreement as of the Effective Date.</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 sm:gap-12 mt-8">
              <div>
                <div className="border-b border-black mb-2 pb-1 text-xl" style={{ fontFamily: "'Brush Script MT', cursive" }}>Keisha Solomon</div>
                <p className="text-sm font-bold uppercase">Agency — {agency.name}</p>
                <p className="text-sm">Name: Keisha Solomon</p>
                <p className="text-sm">Title: CEO, {agency.name}</p>
                <p className="text-sm">Date: {fmtDate(project.startDate)}</p>
              </div>
              <div>
                <div className="border-b border-black mb-2 pb-1 text-xl" style={{ fontFamily: "'Brush Script MT', cursive", minHeight: '2rem' }}>
                  {contract.client_signature || ''}
                </div>
                <p className="text-sm font-bold uppercase">Client — {clientInfo.companyName || '[COMPANY]'}</p>
                <p className="text-sm">Name: {contract.client_signature || clientInfo.repName || '[REPRESENTATIVE]'}{clientInfo.title ? `, ${clientInfo.title}` : ''}</p>
                {contract.client_signed_at && (
                  <p className="text-sm">Date: {new Date(contract.client_signed_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* E-Signature Form */}
        {contract.status !== 'signed' && contract.status !== 'draft' && (
          <div className="mt-6 bg-[rgba(10,22,40,0.9)] rounded-xl p-6 border border-[rgba(34,200,229,0.2)] shadow-xl no-print">
            <h3 className="text-lg font-bold text-white mb-2">Electronic Signature</h3>
            <p className="text-sm text-white/60 mb-4">By typing your name below, you agree to the terms of this Services Agreement.</p>
            <div className="flex flex-col sm:flex-row gap-4">
              <input
                type="text"
                placeholder="Type your full legal name"
                value={signature}
                onChange={(e) => setSignature(e.target.value)}
                className="flex-1 px-4 py-3 rounded-2xl text-sm bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#22c8e5]/50"
              />
              <button
                onClick={handleSign}
                disabled={signing || !signature.trim()}
                className="px-8 py-3 rounded-2xl font-bold text-sm transition-all disabled:opacity-50 uppercase tracking-widest whitespace-nowrap"
                style={{ background: GOLD, color: '#003258' }}
              >
                {signing ? 'Signing...' : 'Sign Agreement'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function MyContractsPanel({ user, onEditContract, onDuplicateContract }) {
  const isAdmin = user?.is_admin === 1 || user?.is_admin === true;
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [paymentModal, setPaymentModal] = useState(null); // { type, id, amount, description }

  useEffect(() => {
    const fetchContracts = async () => {
      try {
        const token = localStorage.getItem('evobrand_token');
        const res = await fetch(`${API_BASE}/contracts`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) setContracts(data.contracts || []);
      } catch (err) {
        console.error('Failed to fetch contracts:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchContracts();
  }, []);

  const openContract = async (id) => {
    try {
      const token = localStorage.getItem('evobrand_token');
      const res = await fetch(`${API_BASE}/contracts/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setSelected(data.contract);
    } catch (err) {
      console.error('Failed to fetch contract:', err);
    }
  };

  const handleSignContract = async (signature) => {
    try {
      const token = localStorage.getItem('evobrand_token');
      const res = await fetch(`${API_BASE}/contracts/${selected.id}/sign`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ signature })
      });
      if (res.ok) {
        // Refresh the selected contract and the list
        await openContract(selected.id);
        const res2 = await fetch(`${API_BASE}/contracts`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        const data2 = await res2.json();
        if (res2.ok) setContracts(data2.contracts || []);

        // Auto-open payment modal if there is a fee
        try {
          const contractData = typeof selected.contract_data === 'string'
            ? JSON.parse(selected.contract_data)
            : selected.contract_data;
          const fee = Number(contractData?.project?.fee);
          if (!isNaN(fee) && fee > 0) {
            setPaymentModal({
              type: 'contract',
              id: selected.id,
              amount: fee,
              description: selected.title,
            });
          }
        } catch (e) { /* no fee, skip */ }
      }
    } catch (err) {
      console.error('Failed to sign contract:', err);
    }
  };

  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-1">My Contracts</h1>
        <p className="text-white/40">View and download agreements sent to you by EVOBRAND.</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-[#22c8e5]/20 border-t-[#22c8e5] rounded-full animate-spin" />
        </div>
      ) : contracts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5" style={{ background: 'rgba(34,200,229,0.08)', border: '1px solid rgba(34,200,229,0.15)' }}>
            <FileText size={28} style={{ color: GOLD }} />
          </div>
          <h3 className="text-white font-bold text-lg mb-2">No contracts yet</h3>
          <p className="text-white/40 text-sm">Contracts sent to you by EVOBRAND will appear here.</p>
        </div>
      ) : (
        <div className="space-y-4 max-w-3xl">
          {contracts.map(c => {
            const cfg = statusConfig[c.status] || statusConfig.sent;
            const StatusIcon = cfg.icon;
            const isSignedUnpaid = c.status === 'signed' && c.payment_status !== 'paid';
            return (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-5 p-6 rounded-2xl border transition-all"
                style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.07)' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = `${GOLD}30`}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 cursor-pointer"
                  style={{ background: 'rgba(34,200,229,0.08)' }}
                  onClick={() => openContract(c.id)}
                >
                  <FileText size={22} style={{ color: GOLD }} />
                </div>
                <div className="flex-1 min-w-0 cursor-pointer" onClick={() => openContract(c.id)}>
                  <p className="text-white font-bold truncate">{c.title}</p>
                  <p className="text-white/40 text-xs mt-0.5">{formatDate(c.created_at)}</p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  {isAdmin && (
                    <>
                      <button
                        onClick={async (e) => {
                          e.stopPropagation();
                          const full = await fetch(`${API_BASE}/contracts/${c.id}`, {
                            headers: { 'Authorization': `Bearer ${localStorage.getItem('evobrand_token')}` },
                          }).then(r => r.json()).catch(() => null);
                          if (full?.contract) {
                            onEditContract(full.contract);
                          }
                        }}
                        className="px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all hover:bg-white/10"
                        style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.8)', border: '1px solid rgba(255,255,255,0.12)' }}
                      >
                        Edit &amp; Resend
                      </button>
                      <button
                        title="Duplicate to new draft"
                        onClick={async (e) => {
                          e.stopPropagation();
                          const full = await fetch(`${API_BASE}/contracts/${c.id}`, {
                            headers: { 'Authorization': `Bearer ${localStorage.getItem('evobrand_token')}` },
                          }).then(r => r.json()).catch(() => null);
                          if (full?.contract && onDuplicateContract) {
                            onDuplicateContract(full.contract);
                          }
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all hover:bg-white/10"
                        style={{ background: 'rgba(34,200,229,0.08)', color: '#22c8e5', border: '1px solid rgba(34,200,229,0.2)' }}
                      >
                        <Copy size={11} /> Duplicate
                      </button>
                    </>
                  )}
                  {isSignedUnpaid && (
                    <button
                      onClick={async () => {
                        const full = await fetch(`${API_BASE}/contracts/${c.id}`, {
                          headers: { 'Authorization': `Bearer ${localStorage.getItem('evobrand_token')}` },
                        }).then(r => r.json()).catch(() => null);
                        const fee = Number(full?.contract?.contract_data
                          ? (typeof full.contract.contract_data === 'string'
                              ? JSON.parse(full.contract.contract_data)
                              : full.contract.contract_data)?.project?.fee
                          : 0);
                        setPaymentModal({
                          type: 'contract',
                          id: c.id,
                          amount: fee || 0,
                          description: c.title,
                        });
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all"
                      style={{ background: 'rgba(34,200,229,0.12)', color: GOLD, border: '1px solid rgba(34,200,229,0.25)' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(34,200,229,0.22)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'rgba(34,200,229,0.12)'}
                    >
                      <CreditCard size={13} /> Pay Now
                    </button>
                  )}
                  {c.status === 'signed' && c.payment_status === 'paid' && (
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider" style={{ background: 'rgba(52,211,153,0.12)', color: '#34d399' }}>Paid</span>
                  )}
                  <StatusIcon size={14} style={{ color: cfg.color }} />
                  <span className="text-xs font-bold" style={{ color: cfg.color }}>{cfg.label}</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      <AnimatePresence>
        {selected && (
          <motion.div key="modal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <ContractModal
              contract={selected}
              onClose={() => setSelected(null)}
              onSign={handleSignContract}
              isAdmin={isAdmin}
              onEditContract={onEditContract}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {paymentModal && (
        <PaymentModal
          type={paymentModal.type}
          id={paymentModal.id}
          amount={paymentModal.amount}
          description={paymentModal.description}
          onClose={() => setPaymentModal(null)}
        />
      )}
    </>
  );
}
