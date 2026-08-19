import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Layers, ChevronDown, ChevronUp, Loader2, Check, FileText } from 'lucide-react';

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
          transition={{ duration: 0.7, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}

function MilestoneRow({ m, onToggle, saving }) {
  const isDone = m.status === 'done';
  return (
    <div
      className="flex items-center gap-3 py-2.5 border-b last:border-b-0"
      style={{ borderColor: 'rgba(255,255,255,0.05)' }}
    >
      <button
        type="button"
        onClick={onToggle}
        disabled={saving}
        className="flex-shrink-0 w-5 h-5 rounded border flex items-center justify-center transition-all focus:outline-none disabled:opacity-50"
        style={{
          borderColor: isDone ? '#34d399' : 'rgba(255,255,255,0.2)',
          background: isDone ? 'rgba(52,211,153,0.1)' : 'transparent',
        }}
        title={isDone ? 'Mark incomplete' : 'Mark complete'}
      >
        {isDone && <Check size={12} className="text-[#34d399]" />}
      </button>
      <span
        className="flex-1 text-sm"
        style={{
          color: isDone ? 'rgba(255,255,255,0.4)' : 'white',
          textDecoration: isDone ? 'line-through' : 'none',
        }}
      >
        {m.name || '(unnamed)'}
      </span>
      {m.due_date && (
        <span className="text-xs text-white/30 flex-shrink-0">
          Due {new Date(m.due_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </span>
      )}
      <span
        className="text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0"
        style={{
          background: isDone ? 'rgba(52,211,153,0.12)'
            : m.status === 'in_progress' ? 'rgba(250,204,21,0.12)'
            : 'rgba(255,255,255,0.05)',
          color: isDone ? '#34d399' : m.status === 'in_progress' ? '#facc15' : 'rgba(255,255,255,0.4)',
        }}
      >
        {isDone ? 'Done' : m.status === 'in_progress' ? 'In Progress' : 'Pending'}
      </span>
    </div>
  );
}

function ProjectCard({ project, onUpdated }) {
  const [expanded, setExpanded] = useState(false);
  const [saving, setSaving] = useState(false);

  const milestones = (Array.isArray(project.milestones)
    ? project.milestones
    : typeof project.milestones === 'string'
    ? JSON.parse(project.milestones)
    : []
  ).sort((a, b) => {
    if (!a.due_date) return 1;
    if (!b.due_date) return -1;
    return new Date(a.due_date) - new Date(b.due_date);
  });

  const pct = milestones.length === 0 ? 0
    : Math.round((milestones.filter(m => m.status === 'done').length / milestones.length) * 100);

  const toggleMilestone = async (index) => {
    const updated = milestones.map((m, i) =>
      i === index ? { ...m, status: m.status === 'done' ? 'pending' : 'done' } : m
    );
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/projects/${project.id}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify({ milestones: updated }),
      });
      if (!res.ok) throw new Error('Failed to update milestone');
      onUpdated && onUpdated();
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl overflow-hidden border transition-all"
      style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.07)' }}
      onMouseEnter={e => e.currentTarget.style.borderColor = `${GOLD}30`}
      onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'}
    >
      <div className="flex items-center gap-4 px-6 py-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-white font-bold truncate">{project.name}</p>
            {project.contract_title && (
              <span
                className="text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0"
                style={{ background: 'rgba(34,200,229,0.1)', color: GOLD }}
              >
                {project.contract_title}
              </span>
            )}
          </div>
          {project.description && (
            <p className="text-white/40 text-xs mt-0.5 truncate">{project.description}</p>
          )}
        </div>
        <div
          className="text-xs font-bold px-2.5 py-1 rounded-full flex-shrink-0"
          style={{
            background: pct === 100 ? 'rgba(52,211,153,0.12)' : 'rgba(34,200,229,0.1)',
            color: pct === 100 ? '#34d399' : GOLD,
          }}
        >
          {pct === 100 ? '✓ Complete' : `${pct}%`}
        </div>
        <button
          onClick={() => setExpanded(v => !v)}
          className="p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors flex-shrink-0"
        >
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
      </div>

      <div className="px-6 pb-4">
        <ProgressBar milestones={milestones} />
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="border-t px-6 pb-6 pt-4" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
              {milestones.length === 0 ? (
                <p className="text-white/25 text-sm">No milestones defined yet.</p>
              ) : (
                <div>
                  {milestones.map((m, i) => (
                    <MilestoneRow key={m.id || i} m={m} saving={saving} onToggle={() => toggleMilestone(i)} />
                  ))}
                </div>
              )}

              {/* Attachments */}
              {project.schedules && project.schedules.length > 0 && (
                <div className="mt-6 pt-4 border-t border-[rgba(255,255,255,0.06)]">
                  <h4 className="text-white text-xs font-bold uppercase tracking-widest mb-3" style={{ color: GOLD }}>Attachments</h4>
                  <div className="space-y-2">
                    {project.schedules.map(s => (
                      <div key={s.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10 text-xs">
                        <span className="text-white font-medium truncate flex items-center gap-2">
                          <FileText size={13} style={{ color: GOLD }} /> {s.title} ({s.original_name})
                        </span>
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
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function MyProjectsPanel() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const token = localStorage.getItem('evobrand_token');
      const res = await fetch(`${API_BASE}/projects`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        const data = await res.json();
        setProjects(data.projects || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-1">My Schedule</h1>
        <p className="text-white/40">Track and check off milestones as they're completed — updates live, no downloads needed.</p>
      </div>

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
          <p className="text-white/40 text-sm">
            Your project milestones and progress will appear here once EVOBRAND sets them up.
          </p>
        </div>
      ) : (
        <div className="space-y-4 max-w-3xl">
          {projects.map(p => (
            <ProjectCard key={p.id} project={p} onUpdated={load} />
          ))}
        </div>
      )}
    </>
  );
}
