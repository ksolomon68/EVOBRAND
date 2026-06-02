import React, { useState, useEffect } from 'react';
import { Mail, CheckCircle2, Archive, Loader2, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:5000/api'
  : (window.location.origin + '/api');

const GOLD = '#22c8e5';

export default function AdminContactFormsPanel({ user }) {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('evobrand_token');
      const res = await fetch(`${API_BASE}/contacts`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setSubmissions(data);
      } else {
        console.error('Failed to fetch contacts, status:', res.status);
      }
    } catch (err) {
      console.error('Failed to fetch contact forms:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const updateStatus = async (id, status) => {
    try {
      const token = localStorage.getItem('evobrand_token');
      const res = await fetch(`${API_BASE}/contacts/${id}/status`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        setSubmissions(submissions.map(s => s.id === id ? { ...s, status } : s));
        if (selected && selected.id === id) {
          setSelected({ ...selected, status });
        }
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[#22c8e5]/10">
            <Mail size={20} className="text-[#22c8e5]" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-wide">Contact Forms</h2>
            <p className="text-sm text-white/50">View all inquiries from the public website</p>
          </div>
        </div>
        <button
          onClick={fetchSubmissions}
          className="p-2 rounded-lg text-[#22c8e5] hover:bg-[#22c8e5]/10 transition-colors"
          title="Refresh"
        >
          <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Sidebar List */}
        <div className="lg:col-span-1 bg-[rgba(13,30,53,0.7)] backdrop-blur-md border border-[rgba(34,200,229,0.12)] rounded-2xl overflow-hidden shadow-2xl h-[600px] flex flex-col">
          <div className="p-4 border-b border-[rgba(34,200,229,0.12)]">
            <h3 className="font-bold text-white text-sm uppercase tracking-wider">Submissions</h3>
          </div>
          
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {loading && submissions.length === 0 ? (
              <div className="flex justify-center p-8"><Loader2 className="animate-spin text-[#22c8e5]" /></div>
            ) : submissions.length === 0 ? (
              <div className="text-center p-8 text-white/40 text-sm">No submissions found.</div>
            ) : (
              submissions.map(sub => (
                <button
                  key={sub.id}
                  onClick={() => {
                    setSelected(sub);
                    if (sub.status === 'new') updateStatus(sub.id, 'read');
                  }}
                  className={`w-full text-left p-4 rounded-xl border transition-all ${selected?.id === sub.id ? 'bg-[#22c8e5]/10 border-[#22c8e5]/30' : 'bg-white/[0.02] border-transparent hover:bg-white/[0.05]'}`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className={`font-bold truncate ${sub.status === 'new' ? 'text-white' : 'text-white/70'}`}>
                      {sub.name}
                    </span>
                    {sub.status === 'new' && <span className="w-2 h-2 rounded-full bg-[#22c8e5] flex-shrink-0 mt-1.5" />}
                  </div>
                  <div className="text-xs text-[#22c8e5] truncate mb-2">{sub.service}</div>
                  <div className="text-xs text-white/40 truncate">{formatDate(sub.created_at)}</div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Detail View */}
        <div className="lg:col-span-2 bg-[rgba(13,30,53,0.7)] backdrop-blur-md border border-[rgba(34,200,229,0.12)] rounded-2xl overflow-hidden shadow-2xl h-[600px] flex flex-col">
          {selected ? (
            <AnimatePresence mode="wait">
              <motion.div
                key={selected.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex flex-col h-full"
              >
                <div className="p-6 border-b border-[rgba(34,200,229,0.12)] flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-bold text-white mb-2">{selected.service}</h2>
                    <div className="text-sm text-white/60">
                      From: <strong className="text-white">{selected.name}</strong> ({selected.email})
                    </div>
                    <div className="text-xs text-white/40 mt-1">{formatDate(selected.created_at)}</div>
                  </div>
                  <div className="flex gap-2">
                    {selected.status !== 'archived' ? (
                      <button
                        onClick={() => updateStatus(selected.id, 'archived')}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold text-white/60 bg-white/5 hover:bg-white/10 hover:text-white transition-colors"
                      >
                        <Archive size={14} /> Archive
                      </button>
                    ) : (
                      <button
                        onClick={() => updateStatus(selected.id, 'read')}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold text-[#22c8e5] bg-[#22c8e5]/10 hover:bg-[#22c8e5]/20 transition-colors"
                      >
                        <CheckCircle2 size={14} /> Restore
                      </button>
                    )}
                  </div>
                </div>

                <div className="p-6 flex-1 overflow-y-auto">
                  <div className="bg-white/5 border border-white/10 rounded-xl p-5 text-white/90 whitespace-pre-wrap leading-relaxed text-sm">
                    {selected.message}
                  </div>
                  
                  <div className="mt-8 pt-6 border-t border-white/10">
                    <p className="text-xs text-white/40 mb-3 uppercase tracking-wider font-bold">Quick Actions</p>
                    <a
                      href={`mailto:${selected.email}?subject=RE: ${selected.service}`}
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold uppercase tracking-widest text-[#003258] transition-opacity hover:opacity-90"
                      style={{ background: GOLD }}
                    >
                      <Mail size={16} /> Reply via Email
                    </a>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-white/30">
              <Mail size={48} className="mb-4 opacity-50" />
              <p>Select a submission to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
