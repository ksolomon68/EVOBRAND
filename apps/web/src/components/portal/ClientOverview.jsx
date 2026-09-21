import { useEffect, useState } from 'react';
import { ArrowRight, Calendar, FileText, Layers, MessageSquare } from 'lucide-react';

const API = ['localhost', '127.0.0.1'].includes(window.location.hostname)
  ? 'http://localhost:5000/api' : window.location.origin + '/api';

function milestonesOf(project) {
  if (Array.isArray(project.milestones)) return project.milestones;
  try { return JSON.parse(project.milestones || '[]'); } catch { return []; }
}

function dateLabel(value) {
  const date = new Date(String(value).slice(0, 10) + 'T12:00:00');
  return Number.isNaN(date.getTime()) ? 'Date to be confirmed'
    : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function ClientOverview({ user, tickets, setView }) {
  const [data, setData] = useState({ projects: [], meetings: [], contracts: [] });
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState([]);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    const timer = setTimeout(() => controller.abort(), 10000);
    setLoading(true);
    const paths = [
      ['projects', '/projects'],
      ['meetings', `/scheduler/meetings/${user.id}`],
      ['contracts', '/contracts'],
    ];
    Promise.allSettled(paths.map(async ([key, path]) => {
      const response = await fetch(API + path, {
        headers: { Authorization: `Bearer ${localStorage.getItem('evobrand_token')}` },
        signal: controller.signal,
      });
      if (!response.ok) throw new Error(key);
      const result = await response.json();
      return Array.isArray(result) ? result : result[key] || [];
    })).then(results => {
      if (!active) return;
      setData(Object.fromEntries(paths.map(([key], i) => [key, results[i].status === 'fulfilled' ? results[i].value : []])));
      setFailed(paths.filter((_, i) => results[i].status === 'rejected').map(([key]) => key));
      setLoading(false);
      clearTimeout(timer);
    });
    return () => { active = false; clearTimeout(timer); controller.abort(); };
  }, [user.id, attempt]);

  const today = new Date().toLocaleDateString('en-CA');
  const meetings = data.meetings.filter(m => ['scheduled', 'confirmed'].includes(m.status) && m.date?.slice(0, 10) >= today)
    .sort((a, b) => a.date.localeCompare(b.date) || String(a.time).localeCompare(String(b.time)));
  const unsigned = data.contracts.filter(c => c.status === 'sent');
  const projects = data.projects.filter(p => p.status !== 'completed');
  const activeTickets = tickets.filter(t => !['closed', 'resolved'].includes(t.status));

  return <div className="space-y-8">
    <div className="portal-page-heading">
      <p className="portal-eyebrow">Your EVOBRAND workspace</p>
      <h1>Welcome back{user.name ? `, ${user.name.split(' ')[0]}` : ''}.</h1>
      <p className="portal-muted">Your projects, next steps, and conversations with our team.</p>
    </div>

    {failed.length > 0 && <div role="alert" className="portal-notice">
      We couldn't load your {failed.join(', ')}.
      <button className="portal-text-link ml-3" onClick={() => setAttempt(n => n + 1)}>Try again</button>
    </div>}

    {loading ? <div role="status" aria-label="Loading your overview" className="portal-skeleton" /> : <>
      {failed.length === 0 && <section className="portal-next" aria-labelledby="next-action-title">
        <div>
          <p className="portal-eyebrow">Next step</p>
          <h2 id="next-action-title">{unsigned.length ? 'Review your agreement.' : projects.length ? 'See how your project is progressing.' : 'Everything starts with a conversation.'}</h2>
          <p className="portal-muted">{unsigned.length ? `${unsigned[0].title} is ready for your review and signature.`
            : projects.length ? 'Open your timeline for the latest milestones, due dates, and project notes.'
            : 'Use this workspace to follow your work with EVOBRAND. Your project timeline will appear once it is set up.'}</p>
        </div>
        <button className="evo-button" onClick={() => setView(unsigned.length ? 'my-contracts' : projects.length ? 'my-projects' : 'meetings')}>
          {unsigned.length ? 'Review contracts' : projects.length ? 'View timeline' : 'View meetings'}<ArrowRight size={16} />
        </button>
      </section>}

      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <section className="portal-card" aria-labelledby="projects-heading">
          <div className="portal-card-heading"><h2 id="projects-heading"><Layers size={18} /> Current projects</h2>
            <button className="portal-text-link" onClick={() => setView('my-projects')}>View all <ArrowRight size={14} /></button></div>
          {projects.length ? projects.slice(0, 3).map(project => {
            const milestones = milestonesOf(project);
            const completed = milestones.filter(m => m.status === 'done').length;
            const next = milestones.filter(m => m.status !== 'done').sort((a, b) => String(a.due_date || '9999').localeCompare(String(b.due_date || '9999')))[0];
            return <button key={project.id} className="portal-project-row" onClick={() => setView('my-projects')}>
              <strong>{project.name}</strong>
              <span className="portal-muted">{milestones.length ? `${completed} of ${milestones.length} milestones complete` : 'Timeline being prepared'}</span>
              {milestones.length > 0 && <progress value={completed} max={milestones.length} aria-label={`${project.name} progress`} />}
              {next && <span className="portal-muted">Next: {next.name}{next.due_date ? ` · ${dateLabel(next.due_date)}` : ''}</span>}
            </button>;
          }) : <p className="portal-empty">{failed.includes('projects') ? 'Project information is temporarily unavailable.' : 'No active projects yet. Your timeline and milestones will appear here when your project begins.'}</p>}
        </section>
        <section className="portal-card" aria-labelledby="meeting-heading">
          <div className="portal-card-heading"><h2 id="meeting-heading"><Calendar size={18} /> Next meeting</h2></div>
          {meetings[0] ? <div className="p-6 space-y-3">
            <p className="text-xl font-semibold">{dateLabel(meetings[0].date)}</p>
            <p className="portal-muted">{meetings[0].time} CT · {meetings[0].duration || 30} minutes</p>
            <p>{meetings[0].type || 'Consultation'}</p>
            <button className="portal-text-link" onClick={() => setView('meetings')}>Meeting details <ArrowRight size={14} /></button>
          </div> : <div className="p-6"><p className="portal-muted mb-4">{failed.includes('meetings') ? 'Meeting information is temporarily unavailable.' : 'No upcoming meetings. You can book a time whenever you need to talk.'}</p>
            <a className="portal-text-link" href="/book-consultation">Book a strategy call <ArrowRight size={14} /></a></div>}
        </section>
      </div>
      <div className="portal-summary-links">
        <button onClick={() => setView('my-contracts')}><FileText size={20} /><span><strong>Contracts</strong><span className="portal-muted">Review agreements and payment details</span></span><ArrowRight size={16} /></button>
        <button onClick={() => setView('my-tickets')}><MessageSquare size={20} /><span><strong>Support</strong><span className="portal-muted">{activeTickets.length ? `${activeTickets.length} active conversation${activeTickets.length === 1 ? '' : 's'} with our team` : 'Questions, changes, and updates'}</span></span><ArrowRight size={16} /></button>
      </div>
    </>}
  </div>;
}
