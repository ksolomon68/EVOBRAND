import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Layers, Plus, Trash2, X, Loader2, CheckCircle2, Check,
  AlertCircle, Circle, Clock, ChevronDown, ChevronUp, Edit3, Save,
} from 'lucide-react';

const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:5000/api'
  : (window.location.origin + '/api');

const GOLD = '#22c8e5';

function authHeaders() {
  return { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('evobrand_token')}` };
}

const statusConfig = {
  pending:     { label: 'Pending',     color: 'rgba(255,255,255,0.4)',  bg: 'rgba(255,255,255,0.06)',  Icon: Circle },
  in_progress: { label: 'In Progress', color: '#facc15',               bg: 'rgba(250,204,21,0.12)',   Icon: Clock },
  done:        { label: 'Done',        color: '#34d399',               bg: 'rgba(52,211,153,0.12)',   Icon: CheckCircle2 },
};

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
  const isDone = m.status === 'done';
  return (
    <div className="flex items-center gap-3 py-2.5 border-b last:border-b-0" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
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
        value={m.name}
        placeholder="Milestone name…"
        onChange={e => onChange({ ...m, name: e.target.value })}
        style={{
          textDecoration: isDone ? 'line-through' : 'none',
          color: isDone ? 'rgba(255,255,255,0.4)' : 'white'
        }}
      />
      <input
        type="date"
        className="bg-transparent text-white/40 text-xs outline-none border-0"
        value={m.due_date || ''}
        onChange={e => onChange({ ...m, due_date: e.target.value })}
      />
      <button
        type="button"
        onClick={onDelete}
        className="flex-shrink-0 p-1 rounded-lg text-white/20 hover:text-red-400 transition-colors"
      >
        <X size={14} />
      </button>
    </div>
  );
}

function ProjectCard({ project, onUpdated, onDeleted }) {
  const [expanded, setExpanded] = useState(false);
  const [milestones, setMilestones] = useState([]);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

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
  }, [project.milestones]);

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
        body: JSON.stringify({ milestones: sorted }),
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

  const done = milestones.filter(m => m.status === 'done').length;
  const pct = milestones.length === 0 ? 0 : Math.round((done / milestones.length) * 100);

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
          <p className="text-white font-bold truncate">{project.name}</p>
          <p className="text-white/40 text-xs mt-0.5">
            {project.client_email || 'No client linked'}
            {project.description && ` · ${project.description}`}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <div
            className="text-xs font-bold px-2.5 py-1 rounded-full"
            style={{
              background: pct === 100 ? 'rgba(52,211,153,0.12)' : 'rgba(34,200,229,0.1)',
              color: pct === 100 ? '#34d399' : GOLD,
            }}
          >
            {pct}%
          </div>

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

                <div className="flex items-center gap-3 mt-4">
                  <button
                    type="button"
                    onClick={addMilestone}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-colors hover:bg-white/10"
                    style={{ color: GOLD, border: `1px solid rgba(34,200,229,0.25)` }}
                  >
                    <Plus size={13} /> Add Milestone
                  </button>

                  {editing && (
                    <button
                      type="button"
                      onClick={save}
                      disabled={saving}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all"
                      style={{ background: GOLD, color: '#003258' }}
                    >
                      {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
                      {saving ? 'Saving…' : 'Save Changes'}
                    </button>
                  )}
                </div>

                {/* Linked Schedule Files */}
                {project.schedules && project.schedules.length > 0 && (
                  <div className="mt-6 pt-4 border-t border-[rgba(255,255,255,0.06)]">
                    <h4 className="text-white text-xs font-bold uppercase tracking-widest mb-3" style={{ color: GOLD }}>Linked Schedule Files</h4>
                    <div className="space-y-2">
                      {project.schedules.map(s => (
                        <div key={s.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10 text-xs">
                          <span className="text-white font-medium truncate">{s.title} ({s.original_name})</span>
                          <button
                            onClick={() => {
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
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
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
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [toast, setToast] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', clientEmail: '' });

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 4000);
  };

  const load = async () => {
    try {
      const token = localStorage.getItem('evobrand_token');
      const [projRes, schedRes] = await Promise.all([
        fetch(`${API_BASE}/projects`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE}/schedules`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      if (projRes.ok) {
        const pData = await projRes.json();
        setProjects(pData.projects || []);
      }
      if (schedRes.ok) {
        const sData = await schedRes.json();
        setSchedules(sData.schedules || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.name) return;
    setCreating(true);
    try {
      const res = await fetch(`${API_BASE}/projects`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ name: form.name, description: form.description, clientEmail: form.clientEmail }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Create failed');
      showToast('success', 'Project tracker created!');
      setForm({ name: '', description: '', clientEmail: '' });
      setShowForm(false);
      await load();
    } catch (err) {
      showToast('error', err.message);
    } finally {
      setCreating(false);
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
            Project Tracker
          </h1>
          <p className="text-white/40">Create and manage project milestones for each client.</p>
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
              <h3 className="text-white font-bold text-lg mb-6">Create New Project</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
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
                  <input
                    className="w-full bg-white/5 border border-white/10 text-white px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-[#22c8e5]"
                    placeholder="Short project summary"
                    value={form.description}
                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  />
                </div>
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
          <p className="text-white/40 text-sm">Create a project tracker and add milestones to track client work.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {projects.map(p => (
            <ProjectCard
              key={p.id}
              project={{
                ...p,
                schedules: schedules.filter(s => s.client_email === p.client_email)
              }}
              onUpdated={load}
              onDeleted={id => setProjects(prev => prev.filter(x => x.id !== id))}
            />
          ))}
        </div>
      )}
    </div>
  );
}
