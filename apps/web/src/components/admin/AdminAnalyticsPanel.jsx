import { useState, useEffect, useCallback } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts';
import { Users, Eye, MousePointerClick, RefreshCw, AlertCircle, Zap } from 'lucide-react';

const GOLD = '#22c8e5';
const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:5000/api/analytics'
  : `${window.location.origin}/api/analytics`;

function fmtDate(isoDate) {
  const d = new Date(isoDate + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function StatCard({ icon: Icon, label, value, sub }) {
  return (
    <div className="rounded-2xl p-5 flex flex-col gap-2" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
      <div className="flex items-center gap-2">
        <Icon size={16} style={{ color: GOLD }} />
        <span className="text-xs uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.45)' }}>{label}</span>
      </div>
      <div className="text-3xl font-bold text-white">{value}</div>
      {sub && <div className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>{sub}</div>}
    </div>
  );
}

function Skeleton({ className = '' }) {
  return <div className={`rounded-lg animate-pulse ${className}`} style={{ background: 'rgba(255,255,255,0.07)' }} />;
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl px-4 py-3 text-sm shadow-lg" style={{ background: '#0f1a2e', border: `1px solid ${GOLD}40` }}>
      <div className="font-semibold mb-1 text-white">{fmtDate(label)}</div>
      {payload.map(p => (
        <div key={p.dataKey} style={{ color: p.color }}>
          {p.name}: <span className="font-bold">{p.value.toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
};

export default function AdminAnalyticsPanel() {
  const [overview, setOverview] = useState(null);
  const [daily, setDaily] = useState([]);
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const token = localStorage.getItem('evobrand_token');
    const headers = { Authorization: `Bearer ${token}` };
    try {
      const [ovRes, dayRes, pgRes] = await Promise.all([
        fetch(`${API_BASE}/overview`, { headers }),
        fetch(`${API_BASE}/daily`, { headers }),
        fetch(`${API_BASE}/pages`, { headers }),
      ]);
      if (!ovRes.ok) throw new Error(`HTTP ${ovRes.status}`);
      const [ov, day, pg] = await Promise.all([ovRes.json(), dayRes.json(), pgRes.json()]);
      setOverview(ov);
      setDaily(Array.isArray(day) ? day : []);
      setPages(Array.isArray(pg) ? pg : []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Analytics</h2>
          <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>Last 30 days · evobrand.net</p>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-opacity disabled:opacity-40"
          style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.1)' }}
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="rounded-xl px-4 py-3 text-sm flex items-center gap-2" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5' }}>
          <AlertCircle size={14} /> {error}
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28" />)
        ) : overview ? (
          <>
            <StatCard icon={Eye} label="Page Views" value={overview.pageViews.toLocaleString()} sub="last 30 days" />
            <StatCard icon={Users} label="Visitors" value={overview.visitors.toLocaleString()} sub="unique IPs" />
            <StatCard icon={MousePointerClick} label="Sessions" value={overview.sessions.toLocaleString()} sub="last 30 days" />
            <StatCard icon={Zap} label="Today" value={overview.pageViewsToday.toLocaleString()} sub="page views" />
          </>
        ) : null}
      </div>

      {/* Daily traffic chart */}
      <div className="rounded-2xl p-6" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
        <h3 className="text-sm font-semibold text-white mb-5">Daily Traffic — Last 28 Days</h3>
        {loading ? (
          <Skeleton className="h-56" />
        ) : daily.length === 0 ? (
          <div className="h-56 flex items-center justify-center text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>
            No data yet — traffic will appear here once your site receives visitors.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={daily} margin={{ top: 4, right: 4, bottom: 0, left: -10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="date" tickFormatter={fmtDate} tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11 }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
              <YAxis tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }} />
              <Line type="monotone" dataKey="pageViews" stroke={GOLD} strokeWidth={2} dot={false} name="Page Views" />
              <Line type="monotone" dataKey="visitors" stroke="#a78bfa" strokeWidth={2} dot={false} name="Visitors" />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Top pages */}
      <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="px-6 py-4" style={{ background: 'rgba(255,255,255,0.04)' }}>
          <h3 className="text-sm font-semibold text-white">Top Pages — Last 30 Days</h3>
        </div>
        {loading ? (
          <div className="p-6 space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-8" />)}</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <th className="text-left px-6 py-3 font-medium" style={{ color: 'rgba(255,255,255,0.4)' }}>Page</th>
                <th className="text-right px-6 py-3 font-medium" style={{ color: 'rgba(255,255,255,0.4)' }}>Views</th>
                <th className="text-right px-6 py-3 font-medium hidden md:table-cell" style={{ color: 'rgba(255,255,255,0.4)' }}>Visitors</th>
              </tr>
            </thead>
            <tbody>
              {pages.map((pg, i) => (
                <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-3">
                    <div className="font-medium text-white truncate max-w-xs">{pg.page_title || pg.page_path}</div>
                    <div className="text-xs mt-0.5 truncate" style={{ color: 'rgba(255,255,255,0.35)' }}>{pg.page_path}</div>
                  </td>
                  <td className="px-6 py-3 text-right font-mono" style={{ color: GOLD }}>{pg.views.toLocaleString()}</td>
                  <td className="px-6 py-3 text-right hidden md:table-cell" style={{ color: 'rgba(255,255,255,0.5)' }}>{pg.visitors.toLocaleString()}</td>
                </tr>
              ))}
              {pages.length === 0 && (
                <tr><td colSpan={3} className="px-6 py-8 text-center text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>No page data yet</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
