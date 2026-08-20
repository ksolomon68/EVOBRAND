import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Layers, Plus, Trash2, X, Loader2, CheckCircle2, Check,
  AlertCircle, ChevronDown, ChevronUp, Save, Paperclip, FileText, FileUp,
} from 'lucide-react';

const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:5000/api'
  : (window.location.origin + '/api');

const GOLD = '#22c8e5';

function authHeaders() {
  return { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('evobrand_token')}` };
}

function ProgressBar({ milestones }) {
  const total = milestones.length;
  const done = milestones.filter(m => m.status === 'done').length;
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);
  return (
    <div>
      <div className="flex items-center justify-between text-xs mb-1.5">
        <span className="text-white/40 font-semibold">{done}/{total} milestones complete</span>
        <span className="font-bold" style={{ color: GOLD }}>{pct}%</span>
      </div>
      <div className="h-2 rounded-full bg-white/5 overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ background: `linear-gradient(90deg, ${GOLD}, #1ba3c0)` }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}

function MilestoneRow({ m, onChange, onDelete }) {
  const [showDetails, setShowDetails] = useState(false);
  const isDone = m.status === 'done';
  const meta = [m.phase, m.assignee && `Assigned: ${m.assignee}`, m.notes].filter(Boolean);

  return (
    <div className="py-2.5 border-b last:border-b-0" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => onChange({ ...m, status: isDone ? 'pending' : 'done' })}
          className="flex-shrink-0 w-5 h-5 rounded border flex items-center justify-center transition-all focus:outline-none"
          style={{
            borderColor: isDone ? '#34d399' : 'rgba(255,255,255,0.2)',
            background: isDone ? 'rgba(52,211,153,0.1)' : 'transparent',
          }}
          title={isDone ? "Mark incomplete" : "Mark complete"}
        >
          {isDone && <Check size={12} className="text-[#34d399]" />}
        </button>

        <input
          className="flex-1 bg-transparent text-white text-sm outline-none placeholder-white/20"
          value={m.name || ''}
          placeholder="Milestone name…"
          onChange={e => onChange({ ...m, name: e.target.value })}
          style={{
            textDecoration: isDone ? 'line-through' : 'none',
            color: isDone ? 'rgba(255,255,255,0.4)' : 'white'
          }}
        />

        <select
          value={m.status || 'pending'}
          onChange={e => onChange({ ...m, status: e.target.value })}
          className="bg-[#0a1628] text-white/70 text-[10px] outline-none border border-white/10 rounded px-1.5 py-0.5"
          style={{
            borderColor: m.status === 'done' ? '#34d399' : m.status === 'in_progress' ? '#facc15' : 'rgba(255,255,255,0.1)'
          }}
        >
          <option value="pending" className="bg-[#0a1628]">Pending</option>
          <option value="in_progress" className="bg-[#0a1628]">In Progress</option>
          <option value="done" className="bg-[#0a1628]">Done</option>
        </select>

        <input
          type="date"
          className="bg-transparent text-white/40 text-xs outline-none border-0"
          value={m.due_date || ''}
          onChange={e => onChange({ ...m, due_date: e.target.value })}
        />

        <button
          type="button"
          onClick={() => setShowDetails(!showDetails)}
          className="text-[10px] font-bold uppercase tracking-wider text-[#22c8e5] hover:underline"
        >
          {showDetails ? 'Close' : 'Details'}
        </button>

        <button
          type="button"
          onClick={onDelete}
          className="flex-shrink-0 p-1 rounded-lg text-white/20 hover:text-red-400 transition-colors"
        >
          <X size={14} />
        </button>
      </div>

      {showDetails && (
        <div className="pl-8 pr-4 py-2 mt-2 rounded bg-white/5 space-y-2 text-xs">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-white/40 block text-[9px] uppercase font-bold mb-1">Phase</label>
              <input
                className="w-full bg-white/5 border border-white/10 text-white rounded p-1 outline-none focus:border-[#22c8e5]"
                value={m.phase || ''}
                onChange={e => onChange({ ...m, phase: e.target.value })}
                placeholder="e.g. Phase 1"
              />
            </div>
            <div>
              <label className="text-white/40 block text-[9px] uppercase font-bold mb-1">Assignee</label>
              <input
                className="w-full bg-white/5 border border-white/10 text-white rounded p-1 outline-none focus:border-[#22c8e5]"
                value={m.assignee || ''}
                onChange={e => onChange({ ...m, assignee: e.target.value })}
                placeholder="e.g. Developer"
              />
            </div>
          </div>
          <div>
            <label className="text-white/40 block text-[9px] uppercase font-bold mb-1">Notes</label>
            <textarea
              className="w-full bg-white/5 border border-white/10 text-white rounded p-1 outline-none focus:border-[#22c8e5]"
              value={m.notes || ''}
              onChange={e => onChange({ ...m, notes: e.target.value })}
              placeholder="Milestone details/requirements..."
              rows={2}
            />
          </div>
        </div>
      )}

      {!showDetails && meta.length > 0 && (
        <p className="text-white/25 text-[11px] pl-8 mt-0.5 truncate">{meta.join(' · ')}</p>
      )}
    </div>
  );
}

function ProjectCard({ project, contracts, onUpdated, onDeleted }) {
  const [expanded, setExpanded] = useState(false);
  const [milestones, setMilestones] = useState([]);
  const [name, setName] = useState(project.name);
  const [description, setDescription] = useState(project.description || '');
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [importing, setImporting] = useState(false);

  useEffect(() => {
    const raw = Array.isArray(project.milestones)
      ? project.milestones
      : typeof project.milestones === 'string'
      ? JSON.parse(project.milestones)
      : [];
    const sorted = [...raw].sort((a, b) => {
      if (!a.due_date) return 1;
      if (!b.due_date) return -1;
      return new Date(a.due_date) - new Date(b.due_date);
    });
    setMilestones(sorted);
    setName(project.name);
    setDescription(project.description || '');
  }, [project.milestones, project.name, project.description]);

  const addMilestone = () => {
    setMilestones(prev => [...prev, { id: Date.now(), name: '', status: 'pending', due_date: '' }]);
    setEditing(true);
  };

  const save = async () => {
    setSaving(true);
    const sorted = [...milestones].sort((a, b) => {
      if (!a.due_date) return 1;
      if (!b.due_date) return -1;
      return new Date(a.due_date) - new Date(b.due_date);
    });
    try {
      const res = await fetch(`${API_BASE}/projects/${project.id}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify({ name, description, milestones: sorted }),
      });
      if (!res.ok) throw new Error('Save failed');
      setEditing(false);
      setMilestones(sorted);
      onUpdated && onUpdated();
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Delete project "${project.name}"?`)) return;
    setDeleting(true);
    try {
      const res = await fetch(`${API_BASE}/projects/${project.id}`, {
        method: 'DELETE',
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error('Delete failed');
      onDeleted && onDeleted(project.id);
    } catch (err) {
      alert(err.message);
      setDeleting(false);
    }
  };

  const handleImportDocx = async (file) => {
    if (!file) return;
    setImporting(true);
    try {
      const body = new FormData();
      body.append('file', file);
      const res = await fetch(`${API_BASE}/projects/parse-schedule-docx`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('evobrand_token')}` },
        body,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Import failed');

      const existingKeys = new Set(milestones.map(m => `${m.name}|${m.due_date}`));
      const toAdd = data.milestones.filter(m => !existingKeys.has(`${m.name}|${m.due_date}`));
      if (toAdd.length === 0) {
        alert('Every milestone in that doc is already on this project.');
        return;
      }
      setMilestones(prev => [...prev, ...toAdd]);
      setEditing(true);
    } catch (err) {
      alert(err.message);
    } finally {
      setImporting(false);
    }
  };

  const handleAttach = async (file) => {
    if (!file) return;
    setUploading(true);
    try {
      const form = new FormData();
      form.append('file', file);
      form.append('title', file.name);
      form.append('projectId', project.id);
      if (project.client_email) form.append('clientEmail', project.client_email);
      const res = await fetch(`${API_BASE}/schedules/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('evobrand_token')}` },
        body: form,
      });
      if (!res.ok) throw new Error('Upload failed');
      onUpdated && onUpdated();
    } catch (err) {
      alert(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteAttachment = async (schedule) => {
    if (!window.confirm(`Delete attachment "${schedule.title}"?`)) return;
    try {
      const res = await fetch(`${API_BASE}/schedules/${schedule.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('evobrand_token')}` },
      });
      if (!res.ok) throw new Error('Delete failed');
      onUpdated && onUpdated();
    } catch (err) {
      alert(err.message);
    }
  };

  const done = milestones.filter(m => m.status === 'done').length;
  const pct = milestones.length === 0 ? 0 : Math.round((done / milestones.length) * 100);
  const contractLabel = project.contract_title
    || (contracts.find(c => c.id === project.contract_id)?.title);

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl overflow-hidden"
      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
    >
      {/* Header */}
      <div className="flex items-center gap-4 px-6 py-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <input
              className="flex-1 min-w-[160px] bg-transparent text-white font-bold text-base outline-none border-b border-transparent hover:border-white/10 focus:border-[#22c8e5] transition-colors"
              value={name}
              onChange={e => { setName(e.target.value); setEditing(true); }}
              placeholder="Project name…"
            />
            {contractLabel && (
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <span
                  className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                  style={{ background: 'rgba(34,200,229,0.1)', color: GOLD }}
                >
                  {contractLabel}
                </span>
                {project.contract_fee > 0 && (
                  <span
                    className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                    style={{
                      background: project.contract_payment_status === 'paid' ? 'rgba(52,211,153,0.1)' : 'rgba(250,204,21,0.08)',
                      color: project.contract_payment_status === 'paid' ? '#34d399' : '#facc15'
                    }}
                  >
                    ${Number(project.contract_fee).toLocaleString()} ({project.contract_payment_status === 'paid' ? 'Paid' : 'Unpaid'})
                  </span>
                )}
              </div>
            )}
          </div>
          <div className="flex items-center gap-1 mt-0.5">
            <span className="text-white/40 text-xs flex-shrink-0">{project.client_email || 'No client linked'} ·</span>
            <input
              className="flex-1 min-w-0 bg-transparent text-white/40 text-xs outline-none border-b border-transparent hover:border-white/10 focus:border-[#22c8e5] focus:text-white/70 transition-colors"
              value={description}
              onChange={e => { setDescription(e.target.value); setEditing(true); }}
              placeholder="Add a short description…"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <div
            className="text-xs font-bold px-2.5 py-1 rounded-full"
            style={{
              background: pct === 100 ? 'rgba(52,211,153,0.12)' : 'rgba(34,200,229,0.1)',
              color: pct === 100 ? '#34d399' : GOLD,
            }}
          >
            {pct === 100 ? '✓ Complete' : `${pct}%`}
          </div>

          {editing && (
            <button
              onClick={save}
              disabled={saving || !name.trim()}
              title="Save changes"
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all disabled:opacity-50"
              style={{ background: GOLD, color: '#003258' }}
            >
              {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
              Save
            </button>
          )}

          <button
            onClick={handleDelete}
            disabled={deleting}
            className="p-2 rounded-lg text-white/20 hover:text-red-400 transition-colors"
          >
            {deleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
          </button>

          <button
            onClick={() => setExpanded(v => !v)}
            className="p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors"
          >
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="px-6 pb-4">
        <ProgressBar milestones={milestones} />
      </div>

      {/* Expanded milestones */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-6 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
              <div className="pt-4">
                {milestones.length === 0 && (
                  <p className="text-white/25 text-sm text-center py-4">No milestones yet. Add one below.</p>
                )}
                {milestones.map((m, i) => (
                  <MilestoneRow
                    key={m.id || i}
                    m={m}
                    onChange={updated => {
                      setMilestones(prev => prev.map((x, xi) => xi === i ? updated : x));
                      setEditing(true);
                    }}
                    onDelete={() => {
                      setMilestones(prev => prev.filter((_, xi) => xi !== i));
                      setEditing(true);
                    }}
                  />
                ))}

                <div className="flex items-center gap-3 mt-4 flex-wrap">
                  <button
                    type="button"
                    onClick={addMilestone}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-colors hover:bg-white/10"
                    style={{ color: GOLD, border: `1px solid rgba(34,200,229,0.25)` }}
                  >
                    <Plus size={13} /> Add Milestone
                  </button>

                  <label
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-colors hover:bg-white/10 cursor-pointer"
                    style={{ color: GOLD, border: `1px solid rgba(34,200,229,0.25)` }}
                  >
                    {importing ? <Loader2 size={13} className="animate-spin" /> : <FileUp size={13} />}
                    {importing ? 'Importing…' : 'Import Schedule (Word/PDF)'}
                    <input
                      type="file"
                      accept=".docx,.doc,.pdf"
                      className="hidden"
                      onChange={e => { handleImportDocx(e.target.files?.[0]); e.target.value = ''; }}
                      disabled={importing}
                    />
                  </label>

                </div>

                {/* Attachments */}
                <div className="mt-6 pt-4 border-t border-[rgba(255,255,255,0.06)]">
                  <h4 className="text-white text-xs font-bold uppercase tracking-widest mb-3" style={{ color: GOLD }}>Attachments</h4>
                  <div className="space-y-2">
                    {(project.schedules || []).map(s => (
                      <div key={s.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10 text-xs">
                        <span className="text-white font-medium truncate flex items-center gap-2">
                          <FileText size={13} style={{ color: GOLD }} /> {s.title} ({s.original_name})
                        </span>
                        <span className="flex items-center gap-3 flex-shrink-0">
                          <a
                            href="#"
                            onClick={e => {
                              e.preventDefault();
                              fetch(`${API_BASE}/schedules/${s.id}/download`, {
                                headers: { Authorization: `Bearer ${localStorage.getItem('evobrand_token')}` }
                              })
                                .then(r => r.blob())
                                .then(blob => {
                                  const url = URL.createObjectURL(blob);
                                  const a = document.createElement('a');
                                  a.href = url;
                                  a.download = s.original_name;
                                  document.body.appendChild(a);
                                  a.click();
                                  document.body.removeChild(a);
                                });
                            }}
                            className="text-[#22c8e5] hover:underline"
                          >
                            Download
                          </a>
                          <button
                            type="button"
                            onClick={() => handleDeleteAttachment(s)}
                            className="text-white/20 hover:text-red-400 transition-colors"
                            title="Delete attachment"
                          >
                            <Trash2 size={13} />
                          </button>
                        </span>
                      </div>
                    ))}
                    <label
                      className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-colors hover:bg-white/10 cursor-pointer w-fit"
                      style={{ color: GOLD, border: `1px solid rgba(34,200,229,0.25)` }}
                    >
                      {uploading ? <Loader2 size={13} className="animate-spin" /> : <Paperclip size={13} />}
                      {uploading ? 'Uploading…' : 'Attach File'}
                      <input
                        type="file"
                        className="hidden"
                        onChange={e => handleAttach(e.target.files?.[0])}
                        disabled={uploading}
                      />
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function ProjectTrackerPanel() {
  const [projects, setProjects] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [toast, setToast] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', clientEmail: '', contractId: '', milestones: [] });
  const [importing, setImporting] = useState(false);

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 4000);
  };

  const load = async () => {
    try {
      const token = localStorage.getItem('evobrand_token');
      const [projRes, contractRes] = await Promise.all([
        fetch(`${API_BASE}/projects`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE}/contracts`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      if (projRes.ok) {
        const pData = await projRes.json();
        setProjects(pData.projects || []);
      }
      if (contractRes.ok) {
        const cData = await contractRes.json();
        setContracts(cData.contracts || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleContractSelect = (contractId) => {
    const contract = contracts.find(c => String(c.id) === String(contractId));
    setForm(f => ({
      ...f,
      contractId,
      clientEmail: contract ? contract.client_email : f.clientEmail,
      name: !f.name && contract ? contract.title : f.name,
    }));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.name) return;
    setCreating(true);
    try {
      const res = await fetch(`${API_BASE}/projects`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({
          name: form.name,
          description: form.description,
          clientEmail: form.clientEmail,
          contractId: form.contractId || null,
          milestones: form.milestones,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Create failed');
      showToast('success', 'Project schedule created!');
      setForm({ name: '', description: '', clientEmail: '', contractId: '', milestones: [] });
      setShowForm(false);
      await load();
    } catch (err) {
      showToast('error', err.message);
    } finally {
      setCreating(false);
    }
  };

  const handleImportDocx = async (file) => {
    if (!file) return;
    setImporting(true);
    try {
      const body = new FormData();
      body.append('file', file);
      const res = await fetch(`${API_BASE}/projects/parse-schedule-docx`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('evobrand_token')}` },
        body,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Import failed');
      setForm(f => ({
        ...f,
        name: f.name || data.name,
        milestones: [...f.milestones, ...data.milestones],
      }));
      showToast('success', `Imported ${data.milestones.length} milestones — review dates below before creating.`);
    } catch (err) {
      showToast('error', err.message);
    } finally {
      setImporting(false);
    }
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
            <Layers size={28} style={{ color: GOLD }} />
            Project Schedule
          </h1>
          <p className="text-white/40">Live milestone schedules for each client — auto-updates, no downloads required.</p>
        </div>
        <button
          onClick={() => setShowForm(v => !v)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-sm transition-all"
          style={{ background: showForm ? 'rgba(255,255,255,0.08)' : GOLD, color: showForm ? 'white' : '#003258' }}
        >
          {showForm ? <X size={15} /> : <Plus size={15} />}
          {showForm ? 'Cancel' : 'New Project'}
        </button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.form
            key="form"
            initial={{ opacity: 0, height: 0, marginBottom: 0 }}
            animate={{ opacity: 1, height: 'auto', marginBottom: 32 }}
            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
            onSubmit={handleCreate}
            className="overflow-hidden"
          >
            <div
              className="rounded-[20px] p-8"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <h3 className="text-white font-bold text-lg mb-6">Create New Project Schedule</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-widest text-white/40 mb-2">Link Contract (optional)</label>
                  <select
                    className="w-full bg-white/5 border border-white/10 text-white px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-[#22c8e5]"
                    value={form.contractId}
                    onChange={e => handleContractSelect(e.target.value)}
                  >
                    <option value="" className="bg-[#003258]">No contract — enter client manually</option>
                    {contracts.map(c => (
                      <option key={c.id} value={c.id} className="bg-[#003258]">
                        {c.title} — {c.client_email || 'no email'}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-white/40 mb-2">Project Name *</label>
                  <input
                    className="w-full bg-white/5 border border-white/10 text-white px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-[#22c8e5]"
                    placeholder="Website Redesign"
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-white/40 mb-2">Client Email</label>
                  <input
                    type="email"
                    className="w-full bg-white/5 border border-white/10 text-white px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-[#22c8e5] disabled:opacity-50"
                    placeholder="client@company.com"
                    value={form.clientEmail}
                    onChange={e => setForm(f => ({ ...f, clientEmail: e.target.value }))}
                    disabled={!!form.contractId}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-widest text-white/40 mb-2">Description (optional)</label>
                  <input
                    className="w-full bg-white/5 border border-white/10 text-white px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-[#22c8e5]"
                    placeholder="Short project summary"
                    value={form.description}
                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  />
                </div>
              </div>

              <div className="pt-2 pb-6 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                <div className="flex items-center justify-between mt-4 mb-3">
                  <label className="text-xs font-bold uppercase tracking-widest text-white/40">
                    Milestones {form.milestones.length > 0 && `(${form.milestones.length})`}
                  </label>
                  <label
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-colors hover:bg-white/10 cursor-pointer"
                    style={{ color: GOLD, border: `1px solid rgba(34,200,229,0.25)` }}
                  >
                    {importing ? <Loader2 size={13} className="animate-spin" /> : <FileUp size={13} />}
                    {importing ? 'Importing…' : 'Import Schedule (Word/PDF)'}
                    <input
                      type="file"
                      accept=".docx,.doc,.pdf"
                      className="hidden"
                      onChange={e => { handleImportDocx(e.target.files?.[0]); e.target.value = ''; }}
                      disabled={importing}
                    />
                  </label>
                </div>

                {form.milestones.length === 0 ? (
                  <p className="text-white/25 text-sm">
                    No milestones yet — add them manually below or import a schedule doc (Phase / What / Who / When table format).
                  </p>
                ) : (
                  form.milestones.map((m, i) => (
                    <MilestoneRow
                      key={m.id || i}
                      m={m}
                      onChange={updated => setForm(f => ({
                        ...f,
                        milestones: f.milestones.map((x, xi) => xi === i ? updated : x),
                      }))}
                      onDelete={() => setForm(f => ({
                        ...f,
                        milestones: f.milestones.filter((_, xi) => xi !== i),
                      }))}
                    />
                  ))
                )}

                <button
                  type="button"
                  onClick={() => setForm(f => ({
                    ...f,
                    milestones: [...f.milestones, { id: Date.now(), name: '', status: 'pending', due_date: '' }],
                  }))}
                  className="flex items-center gap-2 px-4 py-2 mt-3 rounded-xl text-xs font-bold transition-colors hover:bg-white/10"
                  style={{ color: GOLD, border: `1px solid rgba(34,200,229,0.25)` }}
                >
                  <Plus size={13} /> Add Milestone
                </button>
              </div>

              <button
                type="submit"
                disabled={creating || !form.name}
                className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all disabled:opacity-50"
                style={{ background: GOLD, color: '#003258' }}
              >
                {creating ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />}
                {creating ? 'Creating…' : 'Create Project'}
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={28} className="animate-spin" style={{ color: GOLD }} />
        </div>
      ) : projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
            style={{ background: 'rgba(34,200,229,0.08)', border: '1px solid rgba(34,200,229,0.15)' }}
          >
            <Layers size={28} style={{ color: GOLD }} />
          </div>
          <h3 className="text-white font-bold text-lg mb-2">No projects yet</h3>
          <p className="text-white/40 text-sm">Create a project schedule and add milestones to track client work.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {projects.map(p => (
            <ProjectCard
              key={p.id}
              project={p}
              contracts={contracts}
              onUpdated={load}
              onDeleted={id => setProjects(prev => prev.filter(x => x.id !== id))}
            />
          ))}
        </div>
      )}
    </div>
  );
}
