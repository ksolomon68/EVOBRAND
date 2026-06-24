import React, { useState, useEffect } from 'react';
import { Loader2, ShieldAlert, Shield, Zap, Star, Search, Check, Plus, X, AlertCircle, KeyRound } from 'lucide-react';

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
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-2xl text-xs font-bold"
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
        className="bg-[#04080f] border border-white/10 text-white text-sm px-3 py-2 rounded-2xl focus:outline-none focus:border-[#22c8e5] transition-colors"
      >
        {PLANS.map(p => (
          <option key={p.value} value={p.value}>{p.label}</option>
        ))}
      </select>
      <button
        onClick={save}
        disabled={saving || value === (currentPlan || '')}
        className="px-4 py-2 rounded-2xl text-xs font-bold uppercase tracking-widest transition-all disabled:opacity-30"
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

function AddClientModal({ existingClients = [], onClose, onAdded }) {
  const [formData, setFormData] = useState({ name: '', email: '', plan: '' });
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Close dropdown on click outside
  useEffect(() => {
    const handleOutsideClick = () => setShowDropdown(false);
    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
  }, []);

  const filteredUsers = searchQuery.trim() === '' ? [] : existingClients.filter(user => {
    const sq = searchQuery.toLowerCase();
    return (user.name || '').toLowerCase().includes(sq) ||
           (user.email || '').toLowerCase().includes(sq);
  }).slice(0, 5);

  const handleSelectUser = (user) => {
    setSelectedUser(user);
    setFormData({
      name: user.name || '',
      email: user.email || '',
      plan: user.support_plan || ''
    });
    setSearchQuery(`${user.name || ''} (${user.email})`);
    setShowDropdown(false);
  };

  const handleClearSelection = () => {
    setSelectedUser(null);
    setFormData({ name: '', email: '', plan: '' });
    setSearchQuery('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (selectedUser) {
        const res = await fetch(`${API_URL}/users/${selectedUser.id}/plan`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('evobrand_token')}`,
          },
          body: JSON.stringify({ plan: formData.plan || null }),
        });
        const data = await res.json().catch(() => ({}));

        if (res.ok) {
          onAdded();
        } else {
          setError(data.error || 'Failed to update plan');
        }
      } else {
        const res = await fetch(`${API_URL}/users`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('evobrand_token')}`,
          },
          body: JSON.stringify(formData),
        });
        const data = await res.json();

        if (res.ok) {
          onAdded();
        } else {
          setError(data.error || 'Failed to add client');
        }
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-[#0f1419] border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl relative" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">Add/Manage Client Plan</h2>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative" onClick={e => e.stopPropagation()}>
            <label className="block text-xs font-bold text-white/40 uppercase tracking-widest mb-2">Search Existing User (Optional)</label>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={e => {
                  setSearchQuery(e.target.value);
                  setShowDropdown(true);
                  if (selectedUser) {
                    setSelectedUser(null);
                    setFormData({ name: '', email: '', plan: '' });
                  }
                }}
                onFocus={() => setShowDropdown(true)}
                className="w-full bg-[#1a2332] border border-white/10 rounded-xl p-3 pr-10 text-white text-sm focus:outline-none focus:border-[#22c8e5]"
                placeholder="Type name or email to search..."
              />
              {selectedUser && (
                <button
                  type="button"
                  onClick={handleClearSelection}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
                >
                  <X size={16} />
                </button>
              )}
            </div>
            
            {showDropdown && filteredUsers.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-[#1a2332] border border-white/10 rounded-xl overflow-hidden shadow-xl max-h-48 overflow-y-auto">
                {filteredUsers.map(u => (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => handleSelectUser(u)}
                    className="w-full text-left px-4 py-2.5 hover:bg-[#22c8e5]/10 text-white text-xs border-b border-white/5 last:border-b-0 flex items-center justify-between"
                  >
                    <div>
                      <p className="font-bold text-white/95">{u.name || 'No name'}</p>
                      <p className="text-white/40 mt-0.5">{u.email}</p>
                    </div>
                    {u.support_plan ? (
                      <span className="text-[10px] bg-[#22c8e5]/10 text-[#22c8e5] border border-[#22c8e5]/20 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                        {u.support_plan}
                      </span>
                    ) : (
                      <span className="text-[10px] text-white/20 font-bold uppercase tracking-wider">
                        No plan
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="border-t border-white/5 my-2" />

          <div>
            <label className="block text-xs font-bold text-white/40 uppercase tracking-widest mb-2">Name</label>
            <input
              type="text"
              required
              disabled={!!selectedUser}
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              className={`w-full border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-[#22c8e5] transition-all ${
                selectedUser ? 'bg-white/5 text-white/40' : 'bg-[#1a2332]'
              }`}
              placeholder="Client Name"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-white/40 uppercase tracking-widest mb-2">Email Address *</label>
            <input
              type="email"
              required
              disabled={!!selectedUser}
              value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
              className={`w-full border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-[#22c8e5] transition-all ${
                selectedUser ? 'bg-white/5 text-white/40' : 'bg-[#1a2332]'
              }`}
              placeholder="client@company.com"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-white/40 uppercase tracking-widest mb-2">Support Plan</label>
            <select
              value={formData.plan}
              onChange={e => setFormData({ ...formData, plan: e.target.value })}
              className="w-full bg-[#1a2332] border border-white/10 rounded-xl p-3 text-white text-sm focus:outline-none focus:border-[#22c8e5]"
            >
              {PLANS.map(p => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center items-center gap-2 py-3 mt-4 rounded-2xl font-bold uppercase tracking-widest text-[#003258] disabled:opacity-50"
            style={{ background: GOLD }}
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : (selectedUser ? 'Update Plan' : 'Create Client')}
          </button>
        </form>
      </div>
    </div>
  );
}

function SetPasswordModal({ client, onClose }) {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMsg('');
    if (password.length < 8) return setError('Password must be at least 8 characters');
    if (password !== confirm) return setError('Passwords do not match');

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/users/${client.id}/password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('evobrand_token')}`,
        },
        body: JSON.stringify({ password }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setMsg('Password updated successfully');
        setPassword('');
        setConfirm('');
        setTimeout(onClose, 1500);
      } else {
        setError(data.error || 'Failed to update password');
      }
    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-[#0f1419] border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl relative" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2"><KeyRound size={18} style={{ color: GOLD }} /> Set Password</h2>
            <p className="text-xs text-white/40 mt-1">{client.name || client.email}</p>
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors"><X size={20} /></button>
        </div>

        {error && <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>}
        {msg && <div className="mb-4 p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-sm flex items-center gap-2"><Check size={14} />{msg}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-white/40 uppercase tracking-widest mb-2">New Password</label>
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full bg-[#1a2332] border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-[#22c8e5]"
              placeholder="Min 8 characters"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-white/40 uppercase tracking-widest mb-2">Confirm Password</label>
            <input
              type="password"
              required
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              className="w-full bg-[#1a2332] border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-[#22c8e5]"
              placeholder="Re-enter password"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center items-center gap-2 py-3 mt-2 rounded-2xl font-bold uppercase tracking-widest text-[#003258] disabled:opacity-50"
            style={{ background: GOLD }}
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function AdminClientPlansPanel({ user }) {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [search, setSearch] = useState('');
  const [filterPlan, setFilterPlan] = useState('all');
  const [showAddClient, setShowAddClient] = useState(false);
  const [passwordClient, setPasswordClient] = useState(null);

  const isAdmin = user?.is_admin === 1 || user?.is_admin === true;

  const fetchClients = async () => {
    setLoading(true);
    setFetchError('');
    try {
      const res = await fetch(`${API_URL}/users`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('evobrand_token')}` },
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setClients(data.users || []);
      } else {
        setFetchError(data.error || `Server error (${res.status})`);
      }
    } catch (err) {
      setFetchError('Network error — could not reach the server. Please check your connection.');
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
    const s = search.toLowerCase();
    const matchSearch = !search ||
      (c.name || '').toLowerCase().includes(s) ||
      (c.email || '').toLowerCase().includes(s);
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
            className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 text-white text-sm rounded-2xl focus:outline-none focus:border-[#22c8e5] transition-colors"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setShowAddClient(true)}
            className="px-4 py-2 rounded-2xl text-xs font-bold uppercase tracking-widest flex items-center gap-2 hover:opacity-80 transition-opacity"
            style={{ background: GOLD, color: NAVY }}
          >
            <Plus size={14} /> Add Client
          </button>
          {['all', 'basic', 'pro', 'elite', 'none'].map(f => (
            <button
              key={f}
              onClick={() => setFilterPlan(f)}
              className="px-4 py-2 rounded-2xl text-xs font-bold uppercase tracking-widest transition-all"
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
      ) : fetchError ? (
        <div className="flex flex-col items-center py-16 gap-4">
          <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center max-w-md">
            <p className="font-bold mb-1">Failed to load clients</p>
            <p className="text-red-400/70">{fetchError}</p>
          </div>
          <button
            onClick={fetchClients}
            className="px-5 py-2 rounded-2xl text-xs font-bold uppercase tracking-widest transition-all"
            style={{ background: 'rgba(34,200,229,0.15)', color: GOLD }}
          >
            Retry
          </button>
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
                <th className="px-6 py-3">Password</th>
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
                  <td className="px-6 py-4">
                    <button
                      onClick={() => setPasswordClient(client)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all hover:opacity-80"
                      style={{ background: 'rgba(34,200,229,0.08)', color: GOLD, border: '1px solid rgba(34,200,229,0.2)' }}
                    >
                      <KeyRound size={11} /> Set Password
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showAddClient && (
        <AddClientModal
          existingClients={clients}
          onClose={() => setShowAddClient(false)}
          onAdded={() => {
            setShowAddClient(false);
            fetchClients();
          }}
        />
      )}

      {passwordClient && (
        <SetPasswordModal
          client={passwordClient}
          onClose={() => setPasswordClient(null)}
        />
      )}
    </div>
  );
}
