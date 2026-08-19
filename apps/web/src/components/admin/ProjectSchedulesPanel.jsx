import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FolderOpen, Upload, Trash2, Download, X, Loader2,
  CheckCircle2, AlertCircle, File, FileText, FileImage, FileSpreadsheet,
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
    return <FileImage size={18} style={{ color: '#a78bfa' }} />;
  if (['xls', 'xlsx', 'csv'].includes(ext))
    return <FileSpreadsheet size={18} style={{ color: '#34d399' }} />;
  if (['pdf'].includes(ext))
    return <FileText size={18} style={{ color: '#f87171' }} />;
  return <File size={18} style={{ color: GOLD }} />;
}

export default function ProjectSchedulesPanel() {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [toast, setToast] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', clientEmail: '', file: null });
  const fileRef = useRef(null);

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 4000);
  };

  const load = async () => {
    try {
      const res = await fetch(`${API_BASE}/schedules`, { headers: authHeaders() });
      const data = await res.json();
      if (res.ok) setSchedules(data.schedules || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!form.file || !form.title) return;
    setUploading(true);
    try {
      const body = new FormData();
      body.append('title', form.title);
      body.append('description', form.description);
      body.append('clientEmail', form.clientEmail);
      body.append('file', form.file);
      const res = await fetch(`${API_BASE}/schedules/upload`, {
        method: 'POST',
        headers: authHeaders(),
        body,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');
      showToast('success', 'Schedule uploaded successfully!');
      setForm({ title: '', description: '', clientEmail: '', file: null });
      setShowForm(false);
      await load();
    } catch (err) {
      showToast('error', err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this schedule file?')) return;
    setDeleting(id);
    try {
      const res = await fetch(`${API_BASE}/schedules/${id}`, {
        method: 'DELETE',
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error('Delete failed');
      setSchedules(prev => prev.filter(s => s.id !== id));
      showToast('success', 'Schedule deleted.');
    } catch (err) {
      showToast('error', err.message);
    } finally {
      setDeleting(null);
    }
  };

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
      .catch(() => showToast('error', 'Download failed'));
  };

  return (
    <div>
      <AnimatePresence>
        {toast && (
          <motion.div
            key="toast"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl shadow-2xl"
            style={{
              background: toast.type === 'success' ? 'rgba(52,211,153,0.15)' : 'rgba(248,113,113,0.15)',
              border: `1px solid ${toast.type === 'success' ? 'rgba(52,211,153,0.3)' : 'rgba(248,113,113,0.3)'}`,
              backdropFilter: 'blur(16px)',
            }}
          >
            {toast.type === 'success'
              ? <CheckCircle2 size={16} className="text-green-400" />
              : <AlertCircle size={16} className="text-red-400" />}
            <span className="text-white text-sm font-semibold">{toast.msg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1 flex items-center gap-3">
            <FolderOpen size={28} style={{ color: GOLD }} />
            Project Schedules
          </h1>
          <p className="text-white/40">Upload and share project schedule files with clients.</p>
        </div>
        <button
          onClick={() => setShowForm(v => !v)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-sm transition-all"
          style={{ background: showForm ? 'rgba(255,255,255,0.08)' : GOLD, color: showForm ? 'white' : '#003258' }}
        >
          {showForm ? <X size={15} /> : <Upload size={15} />}
          {showForm ? 'Cancel' : 'Upload Schedule'}
        </button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.form
            key="form"
            initial={{ opacity: 0, height: 0, marginBottom: 0 }}
            animate={{ opacity: 1, height: 'auto', marginBottom: 32 }}
            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
            onSubmit={handleUpload}
            className="overflow-hidden"
          >
            <div
              className="rounded-[20px] p-8"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <h3 className="text-white font-bold text-lg mb-6">Upload New Schedule</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-white/40 mb-2">Title *</label>
                  <input
                    className="w-full bg-white/5 border border-white/10 text-white px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-[#22c8e5]"
                    placeholder="Q3 Website Redesign Schedule"
                    value={form.title}
                    onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-white/40 mb-2">Client Email (optional)</label>
                  <input
                    type="email"
                    className="w-full bg-white/5 border border-white/10 text-white px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-[#22c8e5]"
                    placeholder="client@company.com"
                    value={form.clientEmail}
                    onChange={e => setForm(f => ({ ...f, clientEmail: e.target.value }))}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-widest text-white/40 mb-2">Description (optional)</label>
                  <textarea
                    rows={2}
                    className="w-full bg-white/5 border border-white/10 text-white px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-[#22c8e5] resize-none"
                    placeholder="Brief description of this schedule file..."
                    value={form.description}
                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  />
                </div>
              </div>

              <div
                onClick={() => fileRef.current?.click()}
                className="border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors mb-6"
                style={{
                  borderColor: form.file ? 'rgba(34,200,229,0.5)' : 'rgba(255,255,255,0.12)',
                  background: form.file ? 'rgba(34,200,229,0.05)' : 'transparent',
                }}
                onDragOver={e => e.preventDefault()}
                onDrop={e => {
                  e.preventDefault();
                  const f = e.dataTransfer.files[0];
                  if (f) setForm(prev => ({ ...prev, file: f }));
                }}
              >
                <input
                  ref={fileRef}
                  type="file"
                  className="hidden"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.csv,.txt"
                  onChange={e => setForm(f => ({ ...f, file: e.target.files[0] }))}
                />
                {form.file ? (
                  <div className="flex items-center justify-center gap-3">
                    <FileIcon name={form.file.name} />
                    <div className="text-left">
                      <p className="text-white font-semibold text-sm">{form.file.name}</p>
                      <p className="text-white/40 text-xs">{fmtSize(form.file.size)}</p>
                    </div>
                    <button
                      type="button"
                      onClick={e => { e.stopPropagation(); setForm(f => ({ ...f, file: null })); }}
                      className="ml-2 p-1 rounded-lg text-white/40 hover:text-white hover:bg-white/10"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <>
                    <Upload size={24} className="mx-auto mb-3 text-white/20" />
                    <p className="text-white/50 text-sm font-medium">Click or drag to upload</p>
                    <p className="text-white/25 text-xs mt-1">PDF, Word, Excel, images — up to 20 MB</p>
                  </>
                )}
              </div>

              <button
                type="submit"
                disabled={uploading || !form.file || !form.title}
                className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all disabled:opacity-50"
                style={{ background: GOLD, color: '#003258' }}
              >
                {uploading ? <Loader2 size={15} className="animate-spin" /> : <Upload size={15} />}
                {uploading ? 'Uploading…' : 'Upload Schedule'}
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

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
          <p className="text-white/40 text-sm">Upload a project schedule file to share with clients.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {schedules.map(s => (
            <motion.div
              key={s.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-5 p-5 rounded-2xl transition-all"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(34,200,229,0.08)' }}
              >
                <FileIcon name={s.original_name} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold truncate">{s.title}</p>
                <p className="text-white/40 text-xs mt-0.5 truncate">
                  {s.original_name} · {fmtSize(s.file_size)}
                  {s.client_email && ` · ${s.client_email}`}
                  {' · '}{fmtDate(s.created_at)}
                </p>
                {s.description && (
                  <p className="text-white/30 text-xs mt-1 truncate">{s.description}</p>
                )}
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => handleDownload(s.id, s.original_name)}
                  className="p-2 rounded-lg transition-colors hover:bg-white/10"
                  title="Download"
                  style={{ color: GOLD }}
                >
                  <Download size={16} />
                </button>
                <button
                  onClick={() => handleDelete(s.id)}
                  disabled={deleting === s.id}
                  className="p-2 rounded-lg transition-colors hover:bg-red-500/10"
                  title="Delete"
                  style={{ color: 'rgba(248,113,113,0.7)' }}
                >
                  {deleting === s.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
