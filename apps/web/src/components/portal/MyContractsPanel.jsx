import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, X, Download, Clock, CheckCircle2, Send } from 'lucide-react';

const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:5000/api'
  : (window.location.origin + '/api');

const GOLD = '#22c8e5';

const statusConfig = {
  sent: { label: 'Awaiting Signature', color: '#facc15', icon: Clock },
  signed: { label: 'Signed', color: '#34d399', icon: CheckCircle2 },
  draft: { label: 'Draft', color: '#8892a4', icon: Send },
};

const formatDate = (str) => {
  if (!str) return '—';
  return new Date(str).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
};

function ContractModal({ contract, onClose, onSign }) {
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

  const agency = { name: 'EVOBRAND Concepts LLC', address: 'Dallas, Texas 75001', email: 'info@evobrand.net' };
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
            <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-colors" style={{ background: GOLD, color: '#003258' }}>
              <Download size={14} /> Print / Download
            </button>
            <button onClick={onClose} className="p-2 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Contract document */}
        <div className="bg-white rounded p-10 shadow-2xl print-contract-preview" style={{ fontFamily: 'Times New Roman, serif' }}>
          <div className="text-black text-[0.9rem] leading-[1.8]">
            <h4 className="text-xl font-bold mb-2 text-center uppercase tracking-widest border-b-2 border-black pb-4">Master Services Agreement</h4>
            <p className="mt-6 mb-6">This Master Services Agreement is entered into as of <strong>{fmtDate(project.startDate)}</strong>, by and between:</p>
            <div className="mb-6">
              <p className="mb-2"><strong>{agency.name}</strong> (the "Agency"), located at {agency.address}; and</p>
              <p><strong>{clientInfo.companyName || '[CLIENT]'}</strong> (the "Client"), represented by {clientInfo.repName || '[REP]'}{clientInfo.title ? `, ${clientInfo.title}` : ''}, email {clientInfo.email || '[EMAIL]'}.</p>
            </div>

            <h5 className="font-bold mt-6 mb-2 uppercase">1. Scope of Services</h5>
            <ul className="list-disc pl-8 mb-4">
              {selectedServices.map(id => <li key={id}><strong>{serviceLabels[id] || id}</strong></li>)}
            </ul>
            {project.description && <p className="mb-4"><strong>Project Description:</strong> {project.description}</p>}

            <h5 className="font-bold mt-6 mb-2 uppercase">2. Fees &amp; Payment</h5>
            <p className="mb-4">Total fee: <strong>{fmtCurrency(project.fee)}</strong>. Payment structure: <strong>{project.payment}</strong>. Late amounts accrue interest at 1.5%/month.</p>

            <h5 className="font-bold mt-6 mb-2 uppercase">3. Timeline</h5>
            <p className="mb-4">Start: <strong>{fmtDate(project.startDate)}</strong>. Estimated completion: <strong>{project.completion}</strong>. Includes <strong>{project.revisions}</strong> revision round{project.revisions === '1' ? '' : 's'}.</p>

            {clauses.ip && <><h5 className="font-bold mt-6 mb-2 uppercase">4. Intellectual Property</h5><p className="mb-4">Upon receipt of all Fees, the Agency assigns to the Client all right, title, and interest in the final Deliverables. The Agency retains ownership of pre-existing frameworks and grants a perpetual, royalty-free license for their use within the Deliverables.</p></>}

            {clauses.nda && <><h5 className="font-bold mt-6 mb-2 uppercase">5. Confidentiality</h5><p className="mb-4">Each Party shall hold the other's Confidential Information in strict confidence with SOC 2-aligned safeguards. These obligations survive termination for five (5) years.</p></>}

            <h5 className="font-bold mt-6 mb-2 uppercase">6. Warranties &amp; Disclaimers</h5>
            <p className="mb-4">Services are performed in a professional and workmanlike manner. ALL OTHER WARRANTIES ARE DISCLAIMED.</p>

            {clauses.liability && <><h5 className="font-bold mt-6 mb-2 uppercase">7. Limitation of Liability</h5><p className="mb-4">AGENCY'S TOTAL LIABILITY SHALL NOT EXCEED FEES PAID IN THE PRIOR THREE (3) MONTHS. NEITHER PARTY SHALL BE LIABLE FOR INDIRECT, CONSEQUENTIAL, OR PUNITIVE DAMAGES.</p></>}

            {clauses.indemnification && <><h5 className="font-bold mt-6 mb-2 uppercase">8. Indemnification</h5><p className="mb-4">Each Party shall indemnify the other against third-party claims arising from their own breach, negligence, or willful misconduct. The Agency indemnifies the Client against third-party IP infringement claims related to the Deliverables.</p></>}

            {clauses.termination && <><h5 className="font-bold mt-6 mb-2 uppercase">9. Termination</h5><p className="mb-4">Either Party may terminate for cause upon 14-day written cure notice, or for convenience upon 30-day written notice. The Client shall pay for all Services performed through the termination date.</p></>}

            <h5 className="font-bold mt-6 mb-2 uppercase">10. Governing Law &amp; Dispute Resolution</h5>
            <p className="mb-4">Governed by the laws of <strong>{project.state}</strong>. Disputes resolved by: <strong>{project.dispute}</strong>.</p>

            <h5 className="font-bold mt-6 mb-2 uppercase">11. General Provisions</h5>
            <p className="mb-8">This is the entire agreement between the Parties. Amendments must be in writing. Electronic signatures are valid.</p>

            <p className="mb-10">IN WITNESS WHEREOF, the Parties have executed this Agreement as of the Effective Date.</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 sm:gap-12">
              <div>
                <div className="border-b border-black mb-2 pb-1 text-xl" style={{ fontFamily: "'Brush Script MT', cursive" }}>Keisha Solomon</div>
                <p className="text-sm font-bold uppercase">Agency — EVOBRAND Concepts LLC</p>
                <p className="text-sm">Keisha Solomon, CEO</p>
              </div>
              <div>
                <div className="border-b border-black mb-2 pb-1 text-xl" style={{ fontFamily: "'Brush Script MT', cursive", minHeight: '2rem' }}>
                  {contract.client_signature || ''}
                </div>
                <p className="text-sm font-bold uppercase">Client — {clientInfo.companyName || '[COMPANY]'}</p>
                <p className="text-sm">{contract.client_signature || clientInfo.repName || '[REPRESENTATIVE]'}{clientInfo.title ? `, ${clientInfo.title}` : ''}</p>
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
            <p className="text-sm text-white/60 mb-4">By typing your name below, you agree to the terms of this Master Services Agreement.</p>
            <div className="flex flex-col sm:flex-row gap-4">
              <input
                type="text"
                placeholder="Type your full legal name"
                value={signature}
                onChange={(e) => setSignature(e.target.value)}
                className="flex-1 px-4 py-3 rounded-lg text-sm bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#22c8e5]/50"
              />
              <button
                onClick={handleSign}
                disabled={signing || !signature.trim()}
                className="px-8 py-3 rounded-lg font-bold text-sm transition-all disabled:opacity-50 uppercase tracking-widest whitespace-nowrap"
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

export default function MyContractsPanel({ user }) {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

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
            return (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-5 p-6 rounded-2xl border transition-all cursor-pointer"
                style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.07)' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = `${GOLD}30`}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'}
                onClick={() => openContract(c.id)}
              >
                <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(34,200,229,0.08)' }}>
                  <FileText size={22} style={{ color: GOLD }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-bold truncate">{c.title}</p>
                  <p className="text-white/40 text-xs mt-0.5">{formatDate(c.created_at)}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
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
            <ContractModal contract={selected} onClose={() => setSelected(null)} onSign={handleSignContract} />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
