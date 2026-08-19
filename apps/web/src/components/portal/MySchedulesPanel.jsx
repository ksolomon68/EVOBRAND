import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FolderOpen, Download, Loader2, File, FileText, FileImage, FileSpreadsheet,
} from 'lucide-react';

const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:5000/api'
  : (window.location.origin + '/api');

const GOLD = '#22c8e5';

function authHeaders() {
  return { Authorization: `Bearer ${localStorage.getItem('evobrand_token')}` };
}

function fmtSize(bytes) {
  if (!bytes) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function fmtDate(str) {
  if (!str) return '—';
  return new Date(str).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function FileIcon({ name }) {
  const ext = (name || '').split('.').pop().toLowerCase();
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext))
    return <FileImage size={20} style={{ color: '#a78bfa' }} />;
  if (['xls', 'xlsx', 'csv'].includes(ext))
    return <FileSpreadsheet size={20} style={{ color: '#34d399' }} />;
  if (['pdf'].includes(ext))
    return <FileText size={20} style={{ color: '#f87171' }} />;
  return <File size={20} style={{ color: GOLD }} />;
}

export default function MySchedulesPanel() {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/schedules`, { headers: authHeaders() });
        const data = await res.json();
        if (res.ok) setSchedules(data.schedules || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleDownload = (id, name) => {
    fetch(`${API_BASE}/schedules/${id}/download`, { headers: authHeaders() })
      .then(r => r.blob())
      .then(blob => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      })
      .catch(() => alert('Download failed. Please try again.'));
  };

  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-1">My Schedules</h1>
        <p className="text-white/40">Project schedule files shared with you by EVOBRAND.</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={28} className="animate-spin" style={{ color: GOLD }} />
        </div>
      ) : schedules.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
            style={{ background: 'rgba(34,200,229,0.08)', border: '1px solid rgba(34,200,229,0.15)' }}
          >
            <FolderOpen size={28} style={{ color: GOLD }} />
          </div>
          <h3 className="text-white font-bold text-lg mb-2">No schedules yet</h3>
          <p className="text-white/40 text-sm">
            Schedule files shared by EVOBRAND will appear here for download.
          </p>
        </div>
      ) : (
        <div className="space-y-4 max-w-3xl">
          {schedules.map(s => (
            <motion.div
              key={s.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-5 p-6 rounded-2xl border transition-all"
              style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.07)' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = `${GOLD}30`}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(34,200,229,0.08)' }}
              >
                <FileIcon name={s.original_name} />
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-white font-bold truncate">{s.title}</p>
                <p className="text-white/40 text-xs mt-0.5">
                  {s.original_name} · {fmtSize(s.file_size)} · {fmtDate(s.created_at)}
                </p>
                {s.description && (
                  <p className="text-white/30 text-xs mt-1 truncate">{s.description}</p>
                )}
              </div>

              <button
                onClick={() => handleDownload(s.id, s.original_name)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl font-bold text-sm transition-all flex-shrink-0"
                style={{ background: GOLD, color: '#003258' }}
                onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
              >
                <Download size={14} /> Download
              </button>
            </motion.div>
          ))}
        </div>
      )}
    </>
  );
}
