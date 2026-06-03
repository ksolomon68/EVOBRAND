import React, { useState, useEffect } from 'react';
import { Loader2, ShieldAlert, Shield, Zap, Star, Search, Check } from 'lucide-react';

const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:5000/api/support'
  : (window.location.origin + '/api/support');

const GOLD = '#22c8e5';
const NAVY = '#003258';

const PLANS = [
  { value: '',      label: 'No Plan',     icon: null,            color: 'rgba(255,255,255,0.2)' },
  { value: 'basic', label: 'Basic',       icon: Shield,          color: '#22c8e5' },
  { value: 'pro',   label: 'Pro',         icon: Zap,             color: '#22c8e5' },
  { value: 'elite', label: 'Elite',       icon: Star,            color: '#E8DDD0' },
];

function PlanBadge({ plan }) {
  const p = PLANS.find(p => p.value === (plan || ''));
  if (!p || !p.value) return <span className="text-xs text-white/25 font-bold">No Plan</span>;
  const Icon = p.icon;
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold"
      style={{ background: `${p.color}15`, color: p.color, border: `1px solid ${p.color}30` }}>
      {Icon && <Icon size={11} />}
      {p.label}
    </span>
  );
}

function PlanSelector({ userId, currentPlan, onSaved }) {
  const [value, setValue] = useState(currentPlan || '');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  const save = async () => {
    setSaving(true);
    setMsg('');
    try {
      const res = await fetch(`${API_URL}/users/${userId}/plan`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('evobrand_token')}`,
        },
        body: JSON.stringify({ plan: value || null }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setMsg('Saved');
        onSaved(userId, value);
        setTimeout(() => setMsg(''), 2000);
      } else {
        setMsg(data.error || 'Failed');
      }
    } catch {
      setMsg('Network error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <select
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="bg-[#04080f] border border-white/10 text-white text-sm px-3 py-2 rounded-lg focus:outline-none focus:border-[#22c8e5] transition-colors"
      >
        {PLANS.map(p => (
          <option key={p.value} value={p.value}>{p.label}</option>
        ))}
      </select>
      <button
        onClick={save}
        disabled={saving || value === (currentPlan || '')}
        className="px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all disabled:opacity-30"
        style={{ background: 'rgba(34,200,229,0.15)', color: GOLD }}
      >
        {saving ? <Loader2 size={12} className="animate-spin" /> : 'Save'}
      </button>
      {msg && (
        <span className={`text-xs font-bold ${msg === 'Saved' ? 'text-green-400' : 'text-red-400'}`}>
          {msg === 'Saved' && <Check size={12} className="inline mr-1" />}{msg}
        </span>
      )}
    </div>
  );
}

export default function AdminClientPlansPanel({ user }) {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterPlan, setFilterPlan] = useState('all');

  const isAdmin = user?.is_admin === 1 || user?.is_admin === true;

  const fetchClients = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/users`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('evobrand_token')}` },
      });
      const data = await res.json();
      if (res.ok) setClients(data.users || []);
    } catch (err) {
      console.error('Fetch clients error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (isAdmin) fetchClients(); }, [isAdmin]);

  const handleSaved = (userId, newPlan) => {
    setClients(prev => prev.map(c => c.id === userId ? { ...c, support_plan: newPlan || null } : c));
  };

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center rounded-2xl border" style={{ borderColor: 'rgba(34,200,229,0.12)', background: 'rgba(10,22,40,0.5)' }}>
        <ShieldAlert size={36} style={{ color: 'rgba(34,200,229,0.4)' }} className="mb-4" />
        <h3 className="text-lg font-bold text-white mb-2">Admin Access Only</h3>
        <p className="text-sm text-white/40">This panel is restricted to administrator accounts.</p>
      </div>
    );
  }

  const planCounts = {
    all: clients.length,
    basic: clients.filter(c => c.support_plan === 'basic').length,
    pro: clients.filter(c => c.support_plan === 'pro').length,
    elite: clients.filter(c => c.support_plan === 'elite').length,
    none: clients.filter(c => !c.support_plan).length,
  };

  const filtered = clients.filter(c => {
    const matchSearch = !search ||
      c.name?.toLowerCase().includes(search.toLowerCase()) ||
      c.email?.toLowerCase().includes(search.toLowerCase());
    const matchPlan = filterPlan === 'all' ? true
      : filterPlan === 'none' ? !c.support_plan
      : c.support_plan === filterPlan;
    return matchSearch && matchPlan;
  });

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-1">Client Plans</h1>
        <p className="text-white/40 text-sm">Assign and manage WordPress maintenance plans for your clients.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Basic',  value: planCounts.basic,  icon: Shield, color: '#22c8e5' },
          { label: 'Pro',    value: planCounts.pro,    icon: Zap,    color: '#22c8e5' },
          { label: 'Elite',  value: planCounts.elite,  icon: Star,   color: '#E8DDD0' },
          { label: 'No Plan',value: planCounts.none,   icon: null,   color: 'rgba(255,255,255,0.3)' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="p-5 rounded-2xl border flex items-center gap-4"
            style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.07)' }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: `${color}18` }}>
              {Icon && <Icon size={18} style={{ color }} />}
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{value}</p>
              <p className="text-xs text-white/40 font-bold uppercase tracking-widest">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 text-white text-sm rounded-xl focus:outline-none focus:border-[#22c8e5] transition-colors"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {['all', 'basic', 'pro', 'elite', 'none'].map(f => (
            <button
              key={f}
              onClick={() => setFilterPlan(f)}
              className="px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all"
              style={filterPlan === f
                ? { background: GOLD, color: NAVY }
                : { background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.4)' }}
            >
              {f === 'none' ? 'No Plan' : f} {f !== 'all' && `(${planCounts[f] ?? 0})`}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="animate-spin" style={{ color: GOLD }} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-white/30">No clients found.</div>
      ) : (
        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-x-auto">
          <table className="w-full text-left">
            <thead className="border-b border-white/10 text-[10px] font-bold uppercase tracking-widest text-white/30">
              <tr>
                <th className="px-6 py-3">Client</th>
                <th className="px-6 py-3">Current Plan</th>
                <th className="px-6 py-3">Assign Plan</th>
                <th className="px-6 py-3">Joined</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(client => (
                <tr key={client.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4">
                    <p className="text-white font-semibold text-sm">{client.name || '—'}</p>
                    <p className="text-white/40 text-xs mt-0.5">{client.email}</p>
                  </td>
                  <td className="px-6 py-4">
                    <PlanBadge plan={client.support_plan} />
                  </td>
                  <td className="px-6 py-4">
                    <PlanSelector
                      userId={client.id}
                      currentPlan={client.support_plan}
                      onSaved={handleSaved}
                    />
                  </td>
                  <td className="px-6 py-4 text-white/30 text-xs">
                    {client.created_at ? new Date(client.created_at).toLocaleDateString() : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
