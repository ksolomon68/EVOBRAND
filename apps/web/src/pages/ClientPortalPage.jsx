import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import SEO from '@/components/SEO.jsx';
import {
  LayoutDashboard, Plus, LogOut, Ticket, Bell,
  Loader2, Calendar, ShieldCheck, Users, FileText, Menu, X
} from 'lucide-react';
import TicketList from '../components/portal/TicketList';
import NewTicketForm from '../components/portal/NewTicketForm';
import TicketDetail from '../components/portal/TicketDetail';
import NotificationDropdown from '../components/portal/NotificationDropdown';
import MyMeetings from '../components/portal/MyMeetings';
import AdminTicketPanel from '../components/admin/AdminTicketPanel';
import AdminCRMPanel from '../components/admin/AdminCRMPanel';
import ContractBuilderPanel from '../components/admin/ContractBuilderPanel';
import AdminBlackoutPanel from '../components/admin/AdminBlackoutPanel';
import MyContractsPanel from '../components/portal/MyContractsPanel';
import { useAuth } from '../hooks/useAuth.jsx';
import { useNavigate } from 'react-router-dom';

const GOLD = '#22c8e5';
const NAVY = '#003258';

// ─── Nav item component ───────────────────────────────────────────────────────

function NavItem({ icon: Icon, label, active, onClick, badge }) {
  return (
    <button
      onClick={onClick}
      aria-current={active ? 'page' : undefined}
      className={`w-full flex items-center gap-3 px-5 py-3.5 rounded-2xl transition-all duration-300 font-bold text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${
        active
          ? 'text-[#003258]'
          : 'text-white/40 hover:text-white hover:bg-white/5'
      }`}
      style={active ? { background: GOLD } : {}}
    >
      <Icon size={16} aria-hidden="true" />
      <span className="flex-1 text-left">{label}</span>
      {badge != null && badge > 0 && (
        <span
          className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
          style={{
            background: active ? 'rgba(10,22,40,0.2)' : 'rgba(34,200,229,0.15)',
            color: active ? NAVY : GOLD,
          }}
          aria-label={`${badge} items`}
        >
          {badge}
        </span>
      )}
    </button>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

function Sidebar({ user, view, setView, setSelectedTicket, openTicketCount, handleSignOut, mobileOpen, setMobileOpen }) {
  const isAdmin = user?.is_admin === 1 || user?.is_admin === true;

  const navItems = [
    { key: 'dashboard', icon: LayoutDashboard, label: 'Dashboard', badge: openTicketCount },
    { key: 'meetings', icon: Calendar, label: 'My Meetings' },
    { key: 'my-contracts', icon: FileText, label: 'My Contracts' },
    ...(isAdmin ? [
      { key: 'admin', icon: ShieldCheck, label: 'Admin Controls' },
      { key: 'scheduler-admin', icon: Calendar, label: 'Availability Controls' },
      { key: 'crm', icon: Users, label: 'CRM & Campaigns' },
      { key: 'contract-builder', icon: FileText, label: 'Contract Builder' },
    ] : []),
  ];

  const initials =
    user?.name
      ?.split(' ')
      .map((n) => n[0])
      .join('') ?? 'U';

  const navContent = (
    <div className="flex flex-col h-full">
        <div className="p-8">
          <div className="flex flex-col items-start gap-4 mb-12">
            <img src="/logo.png" alt="EVOBRAND" className="h-10 object-contain" />
            <div className="h-px w-8" style={{ background: `${GOLD}30` }} aria-hidden="true" />
            <span className="font-bold tracking-[0.3em] text-xs uppercase" style={{ color: `${GOLD}60` }}>Client Portal</span>
          </div>
          <nav className="space-y-1" aria-label="Main portal navigation">
            {navItems.map(({ key, icon, label, badge }) => (
              <NavItem key={key} icon={icon} label={label}
                active={view === key || (view === 'detail' && key === 'dashboard')}
                badge={badge}
                onClick={() => { setView(key); setSelectedTicket(null); setMobileOpen(false); }}
              />
            ))}
            <div className="pl-4 pt-1">
              <NavItem icon={Ticket} label="My Tickets" active={false}
                onClick={() => { setView('dashboard'); setSelectedTicket(null); setMobileOpen(false); }}
              />
            </div>
          </nav>
        </div>
        <div className="mt-auto p-8 border-t" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
          <div className="flex items-center gap-4 mb-5">
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center font-bold shadow-lg text-sm"
              style={{ background: `linear-gradient(135deg, ${GOLD}, #1ba3c0)`, color: NAVY, boxShadow: `0 4px 16px ${GOLD}25` }}
              aria-hidden="true"
            >
              {user?.name?.split(' ').map(n => n[0]).join('') ?? 'U'}
            </div>
            <div className="overflow-hidden">
              <p className="text-white text-sm font-bold truncate">{user?.name || 'Project Lead'}</p>
              <p className="text-white/40 text-xs truncate">{user?.email}</p>
            </div>
          </div>
          <button onClick={handleSignOut}
            className="w-full flex items-center justify-center gap-2 p-3.5 rounded-2xl transition-all duration-300 text-xs font-bold uppercase tracking-widest"
            style={{ background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.5)' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#f87171'; e.currentTarget.style.background = 'rgba(248,113,113,0.08)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
          >
            <LogOut size={13} aria-hidden="true" /><span>Sign Out</span>
          </button>
        </div>
    </div>
  );

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden" onClick={() => setMobileOpen(false)}
          style={{ background: 'rgba(0,0,0,0.7)' }} />
      )}
      {/* Mobile drawer */}
      <div className={`fixed inset-y-0 left-0 z-50 w-72 flex flex-col transition-transform duration-300 md:hidden ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}
        style={{ background: '#04080f', borderRight: '1px solid rgba(255,255,255,0.05)' }}>
        <button onClick={() => setMobileOpen(false)}
          className="absolute top-4 right-4 p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors">
          <X size={18} />
        </button>
        {navContent}
      </div>
      {/* Desktop sidebar */}
      <aside
        className="w-72 border-r hidden md:flex flex-col"
        style={{ background: '#04080f', borderColor: 'rgba(255,255,255,0.05)' }}
        aria-label="Portal navigation"
      >
        {navContent}
      </aside>
    </>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const ClientPortalPage = () => {
  const { user, signOut, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [view, setView] = useState('dashboard');
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showNewTicketModal, setShowNewTicketModal] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) navigate('/login');
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) fetchTickets(true);
  }, [user]);

  const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
    ? 'http://localhost:5000/api/support' 
    : (window.location.origin + '/api/support');

  const fetchTickets = async (isInitial = false) => {
    if (isInitial) setLoading(true);
    try {
      const token = localStorage.getItem('evobrand_token');
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 10000);
      let response;
      try {
        response = await fetch(`${API_URL}/tickets`, {
          headers: { 'Authorization': `Bearer ${token}` },
          signal: controller.signal,
        });
      } finally {
        clearTimeout(timer);
      }
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      setTickets(
        (data.tickets || []).map((t) => ({
          ...t,
          status: t.status?.toLowerCase() || 'open',
          lastUpdated: t.updated_at,
          service: 'Support',
        }))
      );
    } catch (err) {
      // Keep stale ticket data — don't blank the list on API error
      console.error('Error fetching tickets:', err);
    } finally {
      if (isInitial) setLoading(false);
    }
  };

  const handleCreateTicket = async (formData) => {
    try {
      const token = localStorage.getItem('evobrand_token');
      const response = await fetch(`${API_URL}/ticket`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          email: user.email,
          name: user.name,
          subject: formData.subject,
          message: formData.description,
          priority: formData.priority?.toLowerCase() || 'normal'
        })
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      fetchTickets();
      setShowNewTicketModal(false);
    } catch (err) {
      console.error('Error creating ticket:', err);
      alert('Failed to create ticket. Please try again.');
    }
  };

  const handleClientReply = async (ticketId, message) => {
    try {
      const token = localStorage.getItem('evobrand_token');
      const response = await fetch(`${API_URL}/tickets/${ticketId}/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ message })
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      await fetchTickets();
      // Refetch the detail view to get the latest thread
      if (selectedTicket && selectedTicket.id === ticketId) {
         const detailResponse = await fetch(`${API_URL}/tickets/${ticketId}`, {
           headers: { 'Authorization': `Bearer ${token}` }
         });
         if (detailResponse.ok) {
           const detailData = await detailResponse.json();
           setSelectedTicket({ ...detailData.ticket, history: detailData.replies });
         }
      }
    } catch (err) {
      console.error('Error replying:', err);
      alert('Failed to send reply.');
    }
  };

  const handleCloseTicket = async (ticketId) => {
    try {
      const token = localStorage.getItem('evobrand_token');
      const response = await fetch(`${API_URL}/tickets/${ticketId}/close`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      await fetchTickets();
      if (selectedTicket && selectedTicket.id === ticketId) {
        setSelectedTicket(prev => ({ ...prev, status: 'closed' }));
      }
    } catch (err) {
      console.error('Error closing ticket:', err);
      alert('Failed to close ticket.');
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const openTicketCount = tickets.filter((t) => t.status === 'open' || t.status === 'in_progress').length;

  // ── Resolve page title & breadcrumb ─────────────────────────────────────────
  const pageTitle = {
    dashboard: 'Operational Dashboard',
    detail: 'Ticket Details',
    meetings: 'My Meetings',
    'my-contracts': 'My Contracts',
    admin: 'Admin Controls',
    'scheduler-admin': 'Availability Controls',
    crm: 'CRM & Campaigns',
    'contract-builder': 'Contract Builder',
  }[view] ?? 'Dashboard';

  if (authLoading || loading) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center text-white"
        style={{ background: '#04080f' }}
        role="status"
        aria-label="Loading portal"
      >
        <Loader2 size={36} className="animate-spin mb-4" style={{ color: GOLD }} aria-hidden="true" />
        <p className="text-white/40 font-bold tracking-widest text-xs uppercase">Accessing Secure Vault...</p>
      </div>
    );
  }

  return (
    <>
      <SEO 
        title={pageTitle}
        description="EVOBRAND Client Portal - Secure access to your projects and meetings."
        noindex={true}
      />

      <div className="min-h-screen flex overflow-x-hidden" style={{ background: '#04080f' }}>
        <Sidebar
          user={user}
          view={view}
          setView={setView}
          setSelectedTicket={setSelectedTicket}
          openTicketCount={openTicketCount}
          handleSignOut={handleSignOut}
          mobileOpen={mobileNavOpen}
          setMobileOpen={setMobileNavOpen}
        />

        {/* Main content */}
        <main className="flex-1 flex flex-col h-screen overflow-hidden min-w-0" style={{ background: '#04080f' }}>
          {/* Top bar */}
          <header
            className="h-16 border-b flex items-center justify-between px-4 md:px-8 flex-shrink-0"
            style={{ borderColor: 'rgba(255,255,255,0.05)', background: '#04080f' }}
          >
            <div className="flex items-center gap-3">
              <button onClick={() => setMobileNavOpen(true)}
                className="md:hidden p-2.5 rounded-xl transition-colors"
                style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.6)' }}
                aria-label="Open navigation">
                <Menu size={20} />
              </button>
              <div className="hidden md:block">
                <h2 className="text-white/50 font-bold uppercase tracking-[0.2em] text-xs">{pageTitle}</h2>
              </div>
              <img src="/logo.png" alt="EVOBRAND" className="h-6 md:hidden" />
            </div>
            <div className="flex items-center gap-4">
              <NotificationDropdown onNavigate={(v) => { setView(v); setMobileNavOpen(false); }} />
              <button
                onClick={handleSignOut}
                className="md:hidden p-3 rounded-xl transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-red-400"
                style={{ background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.35)' }}
                aria-label="Sign out"
                onMouseEnter={(e) => { e.currentTarget.style.color = '#f87171'; e.currentTarget.style.background = 'rgba(248,113,113,0.08)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.35)'; e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
              >
                <LogOut size={17} aria-hidden="true" />
              </button>
              <div className="h-8 w-px" style={{ background: 'rgba(255,255,255,0.05)' }} aria-hidden="true" />
              <button
                onClick={() => setShowNewTicketModal(true)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest transition-all shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#22c8e5]"
                style={{ background: GOLD, color: NAVY, boxShadow: `0 4px 16px ${GOLD}20` }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.85')}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
              >
                <Plus size={14} aria-hidden="true" />
                <span>New Ticket</span>
              </button>
            </div>
          </header>

          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto p-8">
            <div className="max-w-6xl mx-auto">
              <AnimatePresence mode="wait">
                {/* ── Dashboard ── */}
                {(view === 'dashboard') && (
                  <motion.div
                    key="dashboard"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.25 }}
                  >
                    <div className="mb-10">
                      <h1 className="text-4xl font-bold text-white mb-2">Operational Dashboard</h1>
                      <p className="text-white/40">Manage your deployment tickets and monitor system updates.</p>
                    </div>

                    {/* Stat cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-12">
                      {[
                        {
                          label: 'Active Tickets',
                          value: tickets.filter((t) => t.status === 'open' || t.status === 'in_progress').length,
                          color: GOLD,
                        },
                        {
                          label: 'Awaiting Action',
                          value: tickets.filter((t) => t.status === 'pending').length,
                          color: '#facc15',
                        },
                        {
                          label: 'Resolved',
                          value: tickets.filter((t) => t.status === 'resolved').length,
                          color: '#34d399',
                        },
                      ].map(({ label, value, color }) => (
                        <div
                          key={label}
                          className="p-8 rounded-3xl border transition-all"
                          style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.07)' }}
                          onMouseEnter={(e) => (e.currentTarget.style.borderColor = `${color}30`)}
                          onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)')}
                        >
                          <h3 className="text-white/40 text-xs font-bold uppercase tracking-widest mb-3">{label}</h3>
                          <p className="text-5xl font-bold" style={{ color }}>{value}</p>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xl font-bold text-white">System Transmissions</h2>
                      <div className="flex items-center gap-2 text-white/40 text-xs font-bold uppercase tracking-widest">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" aria-hidden="true" />
                        Live Sync
                      </div>
                    </div>

                    <TicketList tickets={tickets} onViewTicket={async (ticket) => {
                      setSelectedTicket(ticket);
                      setView('detail');
                      try {
                        const token = localStorage.getItem('evobrand_token');
                        const res = await fetch(`${API_URL}/tickets/${ticket.id}`, { headers: { 'Authorization': `Bearer ${token}` } });
                        if (res.ok) {
                          const data = await res.json();
                          setSelectedTicket({ ...data.ticket, history: data.replies });
                        }
                      } catch (err) { console.error(err); }
                    }} />
                  </motion.div>
                )}

                {/* ── Ticket Detail ── */}
                {view === 'detail' && (
                  <motion.div
                    key="detail"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.25 }}
                  >
                    <TicketDetail
                      ticket={selectedTicket}
                      onBack={() => setView('dashboard')}
                      onReply={handleClientReply}
                      onClose={handleCloseTicket}
                      user={user}
                      onRefresh={fetchTickets}
                    />
                  </motion.div>
                )}

                {/* ── My Meetings ── */}
                {view === 'meetings' && (
                  <motion.div
                    key="meetings"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.25 }}
                  >
                    <MyMeetings userId={user?.id} />
                  </motion.div>
                )}

                {/* ── Admin Controls Panel ── */}
                {view === 'admin' && (
                  <motion.div
                    key="admin"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <AdminTicketPanel user={user} />
                  </motion.div>
                )}

                {/* ── Scheduler Controls Panel ── */}
                {view === 'scheduler-admin' && (
                  <motion.div
                    key="scheduler-admin"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <AdminBlackoutPanel user={user} />
                  </motion.div>
                )}

                {/* ── CRM Panel ── */}
                {view === 'crm' && (
                  <motion.div
                    key="crm"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <AdminCRMPanel user={user} />
                  </motion.div>
                )}

                {/* ── Contract Builder (admin) ── */}
                {view === 'contract-builder' && (
                  <motion.div
                    key="contract-builder"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ContractBuilderPanel />
                  </motion.div>
                )}

                {/* ── My Contracts (all users) ── */}
                {view === 'my-contracts' && (
                  <motion.div
                    key="my-contracts"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <MyContractsPanel user={user} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </main>
      </div>

      <AnimatePresence>
        {showNewTicketModal && (
          <NewTicketForm
            onClose={() => setShowNewTicketModal(false)}
            onSubmit={handleCreateTicket}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default ClientPortalPage;
