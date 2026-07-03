import { useState, useEffect, useCallback, useRef } from 'react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts';
import {
  Users, Eye, MousePointerClick, RefreshCw, AlertCircle, Zap,
  Globe, Monitor, Smartphone, Tablet, TrendingUp, Activity,
  ArrowUpRight, MapPin, Chrome, Wifi, Clock, BarChart2,
} from 'lucide-react';

// ─── Constants ────────────────────────────────────────────────────────────────
const CYAN  = '#22c8e5';
const VIOLET = '#a78bfa';
const EMERALD = '#34d399';
const AMBER = '#fbbf24';
const ROSE  = '#fb7185';
const INDIGO = '#6366f1';

const CHANNEL_COLORS = {
  direct:        CYAN,
  organic_search: EMERALD,
  referral:      VIOLET,
  social:        AMBER,
  email:         ROSE,
  paid_search:   '#f97316',
  paid_social:   '#ec4899',
  campaign:      INDIGO,
};
const CHANNEL_LABELS = {
  direct:        'Direct',
  organic_search: 'Organic Search',
  referral:      'Referral',
  social:        'Social',
  email:         'Email',
  paid_search:   'Paid Search',
  paid_social:   'Paid Social',
  campaign:      'Campaign',
};
const DEVICE_ICONS = { desktop: Monitor, mobile: Smartphone, tablet: Tablet };
const BROWSER_COLORS = [CYAN, VIOLET, EMERALD, AMBER, ROSE, INDIGO, '#f97316', '#ec4899', '#14b8a6', '#8b5cf6'];

const TABS = [
  { key: 'overview',   label: 'Overview',   icon: BarChart2 },
  { key: 'sources',    label: 'Sources',    icon: TrendingUp },
  { key: 'geo',        label: 'Geographic', icon: Globe },
  { key: 'devices',    label: 'Devices',    icon: Monitor },
  { key: 'engagement', label: 'Engagement', icon: Activity },
];

const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:5000/api/analytics'
  : `${window.location.origin}/api/analytics`;

// ─── Utilities ────────────────────────────────────────────────────────────────
function fmtDate(isoDate) {
  const d = new Date(isoDate + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
function pct(val, total) {
  if (!total) return 0;
  return ((val / total) * 100).toFixed(1);
}
function barWidth(val, max) {
  if (!max) return 0;
  return Math.max(2, (val / max) * 100);
}
function countryFlag(country) {
  const map = {
    'United States': '🇺🇸', 'Canada': '🇨🇦', 'United Kingdom': '🇬🇧',
    'Australia': '🇦🇺', 'Germany': '🇩🇪', 'France': '🇫🇷', 'India': '🇮🇳',
    'Brazil': '🇧🇷', 'Mexico': '🇲🇽', 'Japan': '🇯🇵', 'China': '🇨🇳',
    'South Korea': '🇰🇷', 'Netherlands': '🇳🇱', 'Spain': '🇪🇸', 'Italy': '🇮🇹',
    'Singapore': '🇸🇬', 'Nigeria': '🇳🇬', 'South Africa': '🇿🇦',
    'Philippines': '🇵🇭', 'Indonesia': '🇮🇩', 'Unknown': '🌐',
  };
  return map[country] || '🌐';
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function Skeleton({ className = '' }) {
  return <div className={`rounded-lg animate-pulse ${className}`} style={{ background: 'rgba(255,255,255,0.07)' }} />;
}

function StatCard({ icon: Icon, label, value, sub, accent = CYAN, pulse = false }) {
  return (
    <div className="rounded-2xl p-5 flex flex-col gap-2 relative overflow-hidden"
         style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
      {pulse && (
        <span className="absolute top-3 right-3 flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: EMERALD }} />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5" style={{ background: EMERALD }} />
        </span>
      )}
      <div className="flex items-center gap-2">
        <Icon size={15} style={{ color: accent }} />
        <span className="text-xs uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.45)' }}>{label}</span>
      </div>
      <div className="text-3xl font-bold text-white">{value ?? '—'}</div>
      {sub && <div className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>{sub}</div>}
    </div>
  );
}

function SectionCard({ title, children }) {
  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
      {title && (
        <div className="px-6 py-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <h3 className="text-sm font-semibold text-white">{title}</h3>
        </div>
      )}
      {children}
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl px-4 py-3 text-sm shadow-xl" style={{ background: '#0a1628', border: `1px solid ${CYAN}40` }}>
      <div className="font-semibold mb-1.5 text-white">{label?.includes('-') ? fmtDate(label) : label}</div>
      {payload.map(p => (
        <div key={p.dataKey} className="flex items-center gap-2" style={{ color: p.color }}>
          <span className="w-2 h-2 rounded-full inline-block" style={{ background: p.color }} />
          {p.name}: <span className="font-bold ml-1">{Number(p.value).toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
};

// ─── Tab: Overview ────────────────────────────────────────────────────────────
function OverviewTab({ overview, daily, pages, loading }) {
  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {loading ? Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-28" />) : overview ? (
          <>
            <StatCard icon={Eye} label="Page Views" value={overview.pageViews?.toLocaleString()} sub="last 30 days" />
            <StatCard icon={Users} label="Visitors" value={overview.visitors?.toLocaleString()} sub="unique IPs" accent={VIOLET} />
            <StatCard icon={MousePointerClick} label="Sessions" value={overview.sessions?.toLocaleString()} sub="last 30 days" accent={EMERALD} />
            <StatCard icon={Zap} label="Today" value={overview.pageViewsToday?.toLocaleString()} sub="page views" accent={AMBER} />
            <StatCard icon={Activity} label="Active Now" value={overview.activeNow?.toLocaleString()} sub="last 5 min" accent={EMERALD} pulse={overview.activeNow > 0} />
            <StatCard icon={ArrowUpRight} label="New Visitors" value={overview.newVisitors?.toLocaleString()} sub={`${pct(overview.newVisitors, overview.visitors)}% of total`} accent={ROSE} />
          </>
        ) : null}
      </div>

      {/* Daily traffic chart */}
      <SectionCard title="Daily Traffic — Last 28 Days">
        <div className="p-6">
          {loading ? <Skeleton className="h-56" /> : daily.length === 0 ? (
            <div className="h-56 flex items-center justify-center text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>
              No data yet — traffic will appear here once your site receives visitors.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={230}>
              <LineChart data={daily} margin={{ top: 4, right: 4, bottom: 0, left: -10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="date" tickFormatter={fmtDate} tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11 }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                <YAxis tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }} />
                <Line type="monotone" dataKey="pageViews" stroke={CYAN} strokeWidth={2} dot={false} name="Page Views" />
                <Line type="monotone" dataKey="visitors" stroke={VIOLET} strokeWidth={2} dot={false} name="Visitors" />
                <Line type="monotone" dataKey="sessions" stroke={EMERALD} strokeWidth={2} dot={false} name="Sessions" strokeDasharray="4 2" />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </SectionCard>

      {/* Top pages */}
      <SectionCard title="Top Pages — Last 30 Days">
        {loading ? (
          <div className="p-6 space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-8" />)}</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <th className="text-left px-6 py-3 font-medium" style={{ color: 'rgba(255,255,255,0.4)' }}>#</th>
                <th className="text-left px-6 py-3 font-medium" style={{ color: 'rgba(255,255,255,0.4)' }}>Page</th>
                <th className="text-right px-6 py-3 font-medium" style={{ color: 'rgba(255,255,255,0.4)' }}>Views</th>
                <th className="text-right px-6 py-3 font-medium hidden md:table-cell" style={{ color: 'rgba(255,255,255,0.4)' }}>Visitors</th>
              </tr>
            </thead>
            <tbody>
              {pages.map((pg, i) => (
                <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-3 font-mono text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>{i + 1}</td>
                  <td className="px-6 py-3">
                    <div className="font-medium text-white truncate max-w-xs">{pg.page_title || pg.page_path}</div>
                    <div className="text-xs mt-0.5 truncate" style={{ color: 'rgba(255,255,255,0.35)' }}>{pg.page_path}</div>
                  </td>
                  <td className="px-6 py-3 text-right font-mono" style={{ color: CYAN }}>{pg.views.toLocaleString()}</td>
                  <td className="px-6 py-3 text-right hidden md:table-cell" style={{ color: 'rgba(255,255,255,0.5)' }}>{pg.visitors.toLocaleString()}</td>
                </tr>
              ))}
              {pages.length === 0 && (
                <tr><td colSpan={4} className="px-6 py-8 text-center text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>No page data yet</td></tr>
              )}
            </tbody>
          </table>
        )}
      </SectionCard>
    </div>
  );
}

// ─── Tab: Sources ─────────────────────────────────────────────────────────────
function SourcesTab({ sources, loading }) {
  if (loading) return <div className="space-y-6">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-48" />)}</div>;
  if (!sources) return <div className="text-center py-16 text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>No source data yet.</div>;

  const { channels = [], referrers = [], campaigns = [] } = sources;
  const totalSessions = channels.reduce((s, c) => s + c.sessions, 0);

  // Prepare pie data
  const pieData = channels.map(c => ({
    name: CHANNEL_LABELS[c.channel] || c.channel,
    value: c.sessions,
    color: CHANNEL_COLORS[c.channel] || '#6b7280',
  }));

  return (
    <div className="space-y-6">
      {/* Channel split */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Pie chart */}
        <SectionCard title="Traffic by Channel">
          <div className="p-6">
            {channels.length === 0 ? (
              <div className="h-40 flex items-center justify-center text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>No channel data yet</div>
            ) : (
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <ResponsiveContainer width={180} height={180}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value" strokeWidth={0}>
                      {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                    </Pie>
                    <Tooltip formatter={(v) => [v.toLocaleString() + ' sessions']} contentStyle={{ background: '#0a1628', border: `1px solid ${CYAN}40`, borderRadius: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex-1 space-y-2 w-full">
                  {pieData.map((d, i) => (
                    <div key={i} className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: d.color }} />
                        <span className="text-sm truncate" style={{ color: 'rgba(255,255,255,0.75)' }}>{d.name}</span>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <span className="text-xs font-mono" style={{ color: 'rgba(255,255,255,0.4)' }}>{pct(d.value, totalSessions)}%</span>
                        <span className="text-sm font-semibold text-white font-mono">{d.value.toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </SectionCard>

        {/* Channel bar breakdown */}
        <SectionCard title="Sessions by Channel">
          <div className="p-6">
            {channels.length === 0 ? (
              <div className="h-40 flex items-center justify-center text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>No data yet</div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={channels.map(c => ({ ...c, name: CHANNEL_LABELS[c.channel] || c.channel, fill: CHANNEL_COLORS[c.channel] || '#6b7280' }))} margin={{ left: -10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis dataKey="name" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="sessions" name="Sessions" radius={[4, 4, 0, 0]}>
                    {channels.map((c, i) => <Cell key={i} fill={CHANNEL_COLORS[c.channel] || CYAN} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </SectionCard>
      </div>

      {/* Top referrer domains */}
      <SectionCard title="Top Referrer Domains">
        {referrers.length === 0 ? (
          <div className="px-6 py-8 text-center text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>No referral traffic yet</div>
        ) : (
          <div className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
            {referrers.map((r, i) => (
              <div key={i} className="px-6 py-3 flex items-center justify-between gap-4 hover:bg-white/5 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-xs font-mono w-5 text-right flex-shrink-0" style={{ color: 'rgba(255,255,255,0.3)' }}>{i + 1}</span>
                  <Globe size={13} style={{ color: VIOLET, flexShrink: 0 }} />
                  <span className="text-sm font-medium text-white truncate">{r.domain}</span>
                </div>
                <div className="flex items-center gap-6 flex-shrink-0">
                  <div className="text-right">
                    <div className="text-sm font-semibold" style={{ color: VIOLET }}>{r.sessions.toLocaleString()}</div>
                    <div className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>sessions</div>
                  </div>
                  <div className="text-right hidden sm:block">
                    <div className="text-sm font-semibold text-white">{r.visitors.toLocaleString()}</div>
                    <div className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>visitors</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionCard>

      {/* UTM Campaigns */}
      {campaigns.length > 0 && (
        <SectionCard title="UTM Campaigns">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                {['Source', 'Medium', 'Campaign', 'Sessions', 'Visitors'].map(h => (
                  <th key={h} className="text-left px-6 py-3 font-medium" style={{ color: 'rgba(255,255,255,0.4)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {campaigns.map((c, i) => (
                <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-3 text-white font-medium">{c.source}</td>
                  <td className="px-6 py-3" style={{ color: 'rgba(255,255,255,0.6)' }}>{c.medium}</td>
                  <td className="px-6 py-3" style={{ color: 'rgba(255,255,255,0.6)' }}>{c.campaign}</td>
                  <td className="px-6 py-3 font-mono" style={{ color: AMBER }}>{c.sessions.toLocaleString()}</td>
                  <td className="px-6 py-3 font-mono" style={{ color: 'rgba(255,255,255,0.5)' }}>{c.visitors.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </SectionCard>
      )}
    </div>
  );
}

// ─── Tab: Geographic ──────────────────────────────────────────────────────────
function GeoTab({ geo, loading }) {
  const [geoView, setGeoView] = useState('countries');
  if (loading) return <div className="space-y-6">{Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-64" />)}</div>;
  if (!geo) return <div className="text-center py-16 text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>No geographic data yet.</div>;

  const { countries = [], regions = [], cities = [] } = geo;
  const datasets = { countries, regions, cities };
  const data = datasets[geoView] || [];
  const maxSessions = data[0]?.sessions || 1;

  const nameKey = geoView === 'countries' ? 'country' : geoView === 'regions' ? 'region' : 'city';

  return (
    <div className="space-y-6">
      {/* Sub-nav */}
      <div className="flex gap-2">
        {['countries', 'regions', 'cities'].map(v => (
          <button key={v} onClick={() => setGeoView(v)}
            className="px-4 py-1.5 rounded-lg text-sm font-medium transition-all capitalize"
            style={geoView === v
              ? { background: `${CYAN}22`, color: CYAN, border: `1px solid ${CYAN}50` }
              : { background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.08)' }
            }>
            {v}
          </button>
        ))}
      </div>

      <SectionCard title={`Top ${geoView.charAt(0).toUpperCase() + geoView.slice(1)} — Last 30 Days`}>
        {data.length === 0 ? (
          <div className="px-6 py-12 text-center text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>
            Geographic data will appear as visitors are tracked with IP geolocation.
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
            {data.map((row, i) => (
              <div key={i} className="px-6 py-3 hover:bg-white/5 transition-colors">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono w-5 text-right" style={{ color: 'rgba(255,255,255,0.3)' }}>{i + 1}</span>
                    {geoView === 'countries' && <span className="text-lg leading-none">{countryFlag(row.country)}</span>}
                    {geoView !== 'countries' && <MapPin size={13} style={{ color: CYAN }} />}
                    <div>
                      <span className="text-sm font-medium text-white">{row[nameKey]}</span>
                      {geoView !== 'countries' && (
                        <span className="text-xs ml-2" style={{ color: 'rgba(255,255,255,0.35)' }}>{row.country}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-6 flex-shrink-0">
                    <div className="text-right">
                      <div className="text-sm font-semibold" style={{ color: CYAN }}>{row.sessions.toLocaleString()}</div>
                      <div className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>sessions</div>
                    </div>
                    <div className="text-right hidden sm:block">
                      <div className="text-sm font-semibold text-white">{row.visitors.toLocaleString()}</div>
                      <div className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>visitors</div>
                    </div>
                    <div className="text-right hidden md:block w-12">
                      <div className="text-xs font-mono" style={{ color: 'rgba(255,255,255,0.4)' }}>{pct(row.sessions, data.reduce((s, d) => s + d.sessions, 0))}%</div>
                    </div>
                  </div>
                </div>
                {/* Progress bar */}
                <div className="ml-8 h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
                  <div className="h-1 rounded-full transition-all" style={{ width: `${barWidth(row.sessions, maxSessions)}%`, background: `linear-gradient(90deg, ${CYAN}, ${VIOLET})` }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionCard>
    </div>
  );
}

// ─── Tab: Devices ─────────────────────────────────────────────────────────────
function DevicesTab({ devices, loading }) {
  if (loading) return <div className="space-y-6">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-48" />)}</div>;
  if (!devices) return <div className="text-center py-16 text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>No device data yet.</div>;

  const { devices: devList = [], browsers = [], oses = [] } = devices;
  const totalSessions = devList.reduce((s, d) => s + d.sessions, 0);
  const maxBrowser = browsers[0]?.sessions || 1;
  const maxOs = oses[0]?.sessions || 1;

  const devicePieData = devList.map((d, i) => ({
    name: d.device_type.charAt(0).toUpperCase() + d.device_type.slice(1),
    value: d.sessions,
    color: [CYAN, VIOLET, EMERALD][i] || AMBER,
  }));

  return (
    <div className="space-y-6">
      {/* Device type: stats + pie */}
      <div className="grid lg:grid-cols-2 gap-6">
        <SectionCard title="Device Types">
          <div className="p-6">
            {devList.length === 0 ? (
              <div className="h-40 flex items-center justify-center text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>No device data yet</div>
            ) : (
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <ResponsiveContainer width={180} height={180}>
                  <PieChart>
                    <Pie data={devicePieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value" strokeWidth={0}>
                      {devicePieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                    </Pie>
                    <Tooltip formatter={(v) => [v.toLocaleString() + ' sessions']} contentStyle={{ background: '#0a1628', border: `1px solid ${CYAN}40`, borderRadius: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex-1 space-y-4 w-full">
                  {devList.map((d, i) => {
                    const Icon = DEVICE_ICONS[d.device_type] || Monitor;
                    const color = devicePieData[i]?.color || CYAN;
                    return (
                      <div key={i} className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Icon size={14} style={{ color }} />
                            <span className="text-sm font-medium text-white capitalize">{d.device_type}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-mono" style={{ color: 'rgba(255,255,255,0.4)' }}>{pct(d.sessions, totalSessions)}%</span>
                            <span className="text-sm font-semibold font-mono" style={{ color }}>{d.sessions.toLocaleString()}</span>
                          </div>
                        </div>
                        <div className="h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
                          <div className="h-1.5 rounded-full" style={{ width: `${barWidth(d.sessions, totalSessions)}%`, background: color }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </SectionCard>

        {/* OS breakdown */}
        <SectionCard title="Operating Systems">
          <div className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
            {oses.length === 0 ? (
              <div className="px-6 py-8 text-center text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>No OS data yet</div>
            ) : oses.map((o, i) => (
              <div key={i} className="px-6 py-3 hover:bg-white/5 transition-colors">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm text-white">{o.os}</span>
                  <div className="flex items-center gap-4">
                    <span className="text-xs font-mono" style={{ color: 'rgba(255,255,255,0.4)' }}>{pct(o.sessions, oses.reduce((s, x) => s + x.sessions, 0))}%</span>
                    <span className="text-sm font-semibold font-mono" style={{ color: EMERALD }}>{o.sessions.toLocaleString()}</span>
                  </div>
                </div>
                <div className="h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
                  <div className="h-1 rounded-full" style={{ width: `${barWidth(o.sessions, maxOs)}%`, background: `linear-gradient(90deg, ${EMERALD}, ${CYAN})` }} />
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      {/* Browser breakdown */}
      <SectionCard title="Browsers">
        <div className="p-6">
          {browsers.length === 0 ? (
            <div className="h-32 flex items-center justify-center text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>No browser data yet</div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-x-8 gap-y-2">
              {browsers.map((b, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full" style={{ background: BROWSER_COLORS[i % BROWSER_COLORS.length] }} />
                      <span className="text-sm text-white">{b.browser}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono" style={{ color: 'rgba(255,255,255,0.4)' }}>{pct(b.sessions, browsers.reduce((s, x) => s + x.sessions, 0))}%</span>
                      <span className="text-sm font-mono font-semibold" style={{ color: BROWSER_COLORS[i % BROWSER_COLORS.length] }}>{b.sessions.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
                    <div className="h-1.5 rounded-full" style={{ width: `${barWidth(b.sessions, maxBrowser)}%`, background: BROWSER_COLORS[i % BROWSER_COLORS.length] }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </SectionCard>
    </div>
  );
}

// ─── Tab: Engagement ──────────────────────────────────────────────────────────
function EngagementTab({ engagement, realtime, loading }) {
  if (loading) return <div className="space-y-6">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-48" />)}</div>;

  return (
    <div className="space-y-6">
      {/* Key metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard icon={MousePointerClick} label="Avg Pages / Session" value={engagement?.avgPagesPerSession ?? '—'} sub="last 30 days" />
        <StatCard icon={ArrowUpRight} label="Bounce Rate" value={engagement ? `${engagement.bounceRate}%` : '—'} sub="single-page sessions" accent={ROSE} />
        <StatCard icon={Activity} label="Active Now" value={realtime?.activeNow ?? '—'} sub="last 5 min" accent={EMERALD} pulse={(realtime?.activeNow || 0) > 0} />
      </div>

      {/* Hourly heatmap (today) */}
      <SectionCard title="Traffic by Hour — Last 30 Days">
        <div className="p-6">
          {(!engagement?.byHour || engagement.byHour.length === 0) ? (
            <div className="h-32 flex items-center justify-center text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>No hourly data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={engagement.byHour} margin={{ left: -10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="hour" tickFormatter={h => `${h}:00`} tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: '#0a1628', border: `1px solid ${CYAN}40`, borderRadius: 12 }} labelFormatter={h => `Hour: ${h}:00`} />
                <Bar dataKey="pageViews" name="Page Views" fill={CYAN} radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </SectionCard>

      {/* Day of week */}
      <SectionCard title="Traffic by Day of Week — Last 30 Days">
        <div className="p-6">
          {(!engagement?.byDow || engagement.byDow.length === 0) ? (
            <div className="h-32 flex items-center justify-center text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>No day-of-week data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={engagement.byDow} margin={{ left: -10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="day_name" tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: '#0a1628', border: `1px solid ${CYAN}40`, borderRadius: 12 }} />
                <Bar dataKey="pageViews" name="Page Views" fill={VIOLET} radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </SectionCard>

      {/* Real-time active pages */}
      {realtime?.recentPages?.length > 0 && (
        <SectionCard title="Currently Active Pages (Last 5 min)">
          <div className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
            {realtime.recentPages.map((p, i) => (
              <div key={i} className="px-6 py-3 flex items-center justify-between hover:bg-white/5 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="flex h-2 w-2 flex-shrink-0">
                    <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full opacity-75" style={{ background: EMERALD }} />
                    <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: EMERALD }} />
                  </span>
                  <div className="min-w-0">
                    <div className="text-sm text-white truncate">{p.page_title || p.page_path}</div>
                    <div className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>{p.page_path}</div>
                  </div>
                </div>
                <span className="text-sm font-mono ml-4 flex-shrink-0" style={{ color: EMERALD }}>{p.hits} hits</span>
              </div>
            ))}
          </div>
        </SectionCard>
      )}
    </div>
  );
}

// ─── Main Panel ───────────────────────────────────────────────────────────────
export default function AdminAnalyticsPanel() {
  const [tab, setTab] = useState('overview');
  const [overview, setOverview] = useState(null);
  const [daily, setDaily] = useState([]);
  const [pages, setPages] = useState([]);
  const [sources, setSources] = useState(null);
  const [geo, setGeo] = useState(null);
  const [devices, setDevices] = useState(null);
  const [engagement, setEngagement] = useState(null);
  const [realtime, setRealtime] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const realtimeRef = useRef(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const token = localStorage.getItem('evobrand_token');
    const h = { Authorization: `Bearer ${token}` };

    const safeFetch = async (url) => {
      try {
        const r = await fetch(url, { headers: h });
        if (!r.ok) return null;
        return r.json();
      } catch { return null; }
    };

    try {
      const [ov, day, pg, src, geo, dev, eng, rt] = await Promise.all([
        safeFetch(`${API_BASE}/overview`),
        safeFetch(`${API_BASE}/daily`),
        safeFetch(`${API_BASE}/pages`),
        safeFetch(`${API_BASE}/sources`),
        safeFetch(`${API_BASE}/geo`),
        safeFetch(`${API_BASE}/devices`),
        safeFetch(`${API_BASE}/engagement`),
        safeFetch(`${API_BASE}/realtime`),
      ]);
      if (!ov) throw new Error('Failed to load overview');
      setOverview(ov);
      setDaily(Array.isArray(day) ? day : []);
      setPages(Array.isArray(pg) ? pg : []);
      setSources(src);
      setGeo(geo);
      setDevices(dev);
      setEngagement(eng);
      setRealtime(rt);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Poll realtime every 30 seconds
  const pollRealtime = useCallback(async () => {
    const token = localStorage.getItem('evobrand_token');
    try {
      const r = await fetch(`${API_BASE}/realtime`, { headers: { Authorization: `Bearer ${token}` } });
      if (r.ok) setRealtime(await r.json());
    } catch { /* silent */ }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    realtimeRef.current = setInterval(pollRealtime, 30000);
    return () => clearInterval(realtimeRef.current);
  }, [pollRealtime]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-white">Analytics</h2>
          <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
            Last 30 days · evobrand.net
            {realtime?.activeNow > 0 && (
              <span className="ml-3 inline-flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full inline-block" style={{ background: EMERALD }} />
                <span style={{ color: EMERALD }}>{realtime.activeNow} active now</span>
              </span>
            )}
          </p>
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

      {/* Tab nav */}
      <div className="flex gap-1 p-1 rounded-xl overflow-x-auto" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap flex-shrink-0"
            style={tab === t.key
              ? { background: `${CYAN}1a`, color: CYAN, border: `1px solid ${CYAN}40` }
              : { color: 'rgba(255,255,255,0.5)', border: '1px solid transparent' }
            }>
            <t.icon size={14} />
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === 'overview'   && <OverviewTab   overview={overview} daily={daily} pages={pages} loading={loading} />}
      {tab === 'sources'    && <SourcesTab    sources={sources} loading={loading} />}
      {tab === 'geo'        && <GeoTab        geo={geo} loading={loading} />}
      {tab === 'devices'    && <DevicesTab    devices={devices} loading={loading} />}
      {tab === 'engagement' && <EngagementTab engagement={engagement} realtime={realtime} loading={loading} />}
    </div>
  );
}
