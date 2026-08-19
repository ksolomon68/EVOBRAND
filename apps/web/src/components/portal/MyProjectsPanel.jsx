import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Layers, CheckCircle2, Clock, Circle, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';

const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:5000/api'
  : (window.location.origin + '/api');

const GOLD = '#22c8e5';

const statusConfig = {
  pending:     { label: 'Pending',     color: 'rgba(255,255,255,0.4)',  Icon: Circle },
  in_progress: { label: 'In Progress', color: '#facc15',               Icon: Clock },
  done:        { label: 'Done',        color: '#34d399',               Icon: CheckCircle2 },
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
          transition={{ duration: 0.7, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}

function ProjectCard({ project }) {
  const [expanded, setExpanded] = useState(false);

  const milestones = Array.isArray(project.milestones)
    ? project.milestones
    : typeof project.milestones === 'string'
    ? JSON.parse(project.milestones)
    : [];

  const pct = milestones.length === 0 ? 0
    : Math.round((milestones.filter(m => m.status === 'done').length / milestones.length) * 100);

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
          <p className="text-white font-bold truncate">{project.name}</p>
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
                  {milestones.map((m, i) => {
                    const cfg = statusConfig[m.status] || statusConfig.pending;
                    const StatusIcon = cfg.Icon;
                    return (
                      <div
                        key={m.id || i}
                        className="flex items-center gap-3 py-2.5 border-b last:border-b-0"
                        style={{ borderColor: 'rgba(255,255,255,0.05)' }}
                      >
                        <StatusIcon size={15} style={{ color: cfg.color, flexShrink: 0 }} />
                        <span
                          className="flex-1 text-sm"
                          style={{
                            color: m.status === 'done' ? 'rgba(255,255,255,0.4)' : 'white',
                            textDecoration: m.status === 'done' ? 'line-through' : 'none',
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
                            background: m.status === 'done' ? 'rgba(52,211,153,0.12)'
                              : m.status === 'in_progress' ? 'rgba(250,204,21,0.12)'
                              : 'rgba(255,255,255,0.05)',
                            color: cfg.color,
                          }}
                        >
                          {cfg.label}
                        </span>
                      </div>
                    );
                  })}
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

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/projects`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('evobrand_token')}` },
        });
        const data = await res.json();
        if (res.ok) setProjects(data.projects || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-1">My Projects</h1>
        <p className="text-white/40">Track the progress of your active EVOBRAND projects.</p>
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
          {projects.map(p => <ProjectCard key={p.id} project={p} />)}
        </div>
      )}
    </>
  );
}
