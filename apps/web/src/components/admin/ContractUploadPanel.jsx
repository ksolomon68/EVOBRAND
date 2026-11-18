import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { UploadCloud, FileText, Send, Loader2, CheckCircle2, X } from 'lucide-react';

const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:5000/api'
  : (window.location.origin + '/api');

const inputClass = 'w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] text-white p-3 rounded-lg text-[0.9rem] focus:outline-none focus:border-[#22c8e5]';
const labelClass = 'block text-[0.8rem] font-semibold text-[#8892a4] mb-2 uppercase';

export default function ContractUploadPanel() {
  const [title, setTitle] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [fee, setFee] = useState('');
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [savedStatus, setSavedStatus] = useState(''); // '', 'draft', 'sent'
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const reset = () => {
    setTitle('');
    setClientEmail('');
    setFee('');
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleUpload = async (status) => {
    setError('');
    if (!title.trim()) return setError('A contract title is required.');
    if (!clientEmail.trim()) return setError('Client email is required.');
    if (!file) return setError('Please choose a PDF, DOC, or DOCX file to upload.');

    setSaving(true);
    setSavedStatus('');
    try {
      const token = localStorage.getItem('evobrand_token');
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('clientEmail', clientEmail.trim());
      formData.append('fee', fee);
      formData.append('status', status);
      formData.append('file', file);

      const res = await fetch(`${API_BASE}/contracts/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');

      setSavedStatus(status);
      setTimeout(() => { setSavedStatus(''); reset(); }, 2500);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-1">Upload Contract</h1>
        <p className="text-white/40">Send an existing contract document straight to a client to review, approve, and pay.</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="max-w-xl bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-[20px] p-8"
      >
        <div className="space-y-5">
          <div>
            <label className={labelClass}>Contract Title</label>
            <input className={inputClass} placeholder="e.g. Acme Corp Master Services Agreement" value={title} onChange={e => setTitle(e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>Client Email *</label>
            <input type="email" className={inputClass} placeholder="jane@acme.com" value={clientEmail} onChange={e => setClientEmail(e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>Amount Due (optional)</label>
            <input type="number" min="0" step="0.01" className={inputClass} placeholder="5000" value={fee} onChange={e => setFee(e.target.value)} />
            <p className="text-[#8892a4] text-xs mt-1">If set, the client is prompted to pay this amount via card after approving the contract. Leave blank for an approval-only contract.</p>
          </div>
          <div>
            <label className={labelClass}>Contract File *</label>
            <label
              htmlFor="contract-upload-file"
              className="flex items-center gap-3 p-4 rounded-lg border border-dashed border-[rgba(255,255,255,0.15)] cursor-pointer hover:border-[#22c8e5]/50 transition-colors"
            >
              {file ? <FileText size={20} className="text-[#22c8e5] flex-shrink-0" /> : <UploadCloud size={20} className="text-[#8892a4] flex-shrink-0" />}
              <span className="text-sm text-white truncate">{file ? file.name : 'Choose a PDF, DOC, or DOCX file...'}</span>
              {file && (
                <button
                  type="button"
                  onClick={(e) => { e.preventDefault(); setFile(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                  className="ml-auto p-1 rounded text-[#8892a4] hover:text-white"
                >
                  <X size={14} />
                </button>
              )}
            </label>
            <input
              id="contract-upload-file"
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx"
              className="hidden"
              onChange={e => setFile(e.target.files?.[0] || null)}
            />
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <button
              onClick={() => handleUpload('draft')}
              disabled={saving || savedStatus}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl font-bold text-sm transition-all border border-white/10 hover:bg-white/5 disabled:opacity-60"
              style={{
                background: savedStatus === 'draft' ? '#34d399' : 'rgba(255,255,255,0.04)',
                color: savedStatus === 'draft' ? '#003258' : '#fff',
              }}
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : savedStatus === 'draft' ? <CheckCircle2 size={16} /> : null}
              {saving ? 'Saving…' : savedStatus === 'draft' ? 'Draft Saved!' : 'Save as Draft'}
            </button>
            <button
              onClick={() => handleUpload('sent')}
              disabled={saving || savedStatus}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl font-bold text-sm transition-all disabled:opacity-60"
              style={{ background: savedStatus === 'sent' ? '#34d399' : '#22c8e5', color: '#003258' }}
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : savedStatus === 'sent' ? <CheckCircle2 size={16} /> : <Send size={16} />}
              {saving ? 'Saving…' : savedStatus === 'sent' ? 'Contract Sent!' : 'Upload & Send'}
            </button>
          </div>
        </div>
      </motion.div>
    </>
  );
}
