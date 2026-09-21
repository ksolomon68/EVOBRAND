import { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import SEO from '@/components/SEO.jsx';
import {
  LayoutDashboard, Plus, LogOut, Ticket, Bell,
  Loader2, Calendar, ShieldCheck, Users, FileText, Menu, X, CheckCircle2, AlertCircle, BarChart2,
  Layers,
} from 'lucide-react';
import ClientOverview from '../components/portal/ClientOverview';
import TicketList from '../components/portal/TicketList';
import NewTicketForm from '../components/portal/NewTicketForm';
import TicketDetail from '../components/portal/TicketDetail';
import NotificationDropdown from '../components/portal/NotificationDropdown';
import MyMeetings from '../components/portal/MyMeetings';
import AdminTicketPanel from '../components/admin/AdminTicketPanel';
import AdminCRMPanel from '../components/admin/AdminCRMPanel';
import AdminClientPlansPanel from '../components/admin/AdminClientPlansPanel';
import ContractBuilderPanel from '../components/admin/ContractBuilderPanel';
import AdminBlackoutPanel from '../components/admin/AdminBlackoutPanel';
import AdminContactFormsPanel from '../components/admin/AdminContactFormsPanel';
import MyContractsPanel from '../components/portal/MyContractsPanel';
import MyProjectsPanel from '../components/portal/MyProjectsPanel';
import AdminAnalyticsPanel from '../components/admin/AdminAnalyticsPanel';
import AdminDashboard from '../components/admin/AdminDashboard';
import ProjectTrackerPanel from '../components/admin/ProjectTrackerPanel';
import { useAuth } from '../hooks/useAuth.jsx';
import { useNavigate, useLocation } from 'react-router-dom';

const GOLD = '#22c8e5';
const NAVY = '#003258';

// ─── Nav item component ───────────────────────────────────────────────────────

function NavItem({ icon: Icon, label, active, onClick, badge }) {
  return (
    <button
      onClick={onClick}
      aria-current={active ? 'page' : undefined}
      className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-colors font-medium text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${
        active
          ? 'text-[#003258]'
          : 'text-slate-300 hover:text-white hover:bg-white/5'
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
  const drawerRef = useRef(null);
  useEffect(() => {
    if (!mobileOpen) return;
    const previous = document.activeElement;
    const drawer = drawerRef.current;
    drawer?.querySelector('button')?.focus();
    const onKey = event => {
      if (event.key === 'Escape') setMobileOpen(false);
      if (event.key !== 'Tab') return;
      const controls = drawer.querySelectorAll('button, a[href]');
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    drawer?.addEventListener('keydown', onKey);
    return () => { drawer?.removeEventListener('keydown', onKey); previous?.focus(); };
  }, [mobileOpen, setMobileOpen]);

  const navGroups = [
    { label: 'Workspace', items: [
      { key: 'dashboard', icon: LayoutDashboard, label: 'Overview' },
      { key: isAdmin ? 'project-tracker' : 'my-projects', icon: Layers, label: isAdmin ? 'Projects' : 'Project timeline' },
      { key: 'meetings', icon: Calendar, label: 'Meetings' },
      { key: 'my-contracts', icon: FileText, label: 'Contracts' },
      { key: isAdmin ? 'admin' : 'my-tickets', icon: Ticket, label: 'Support tickets' },
    ] },
    ...(isAdmin ? [
      { label: 'Relationships', items: [
        { key: 'contact-forms', icon: Bell, label: 'Inquiries' },
        { key: 'crm', icon: Users, label: 'CRM & campaigns' },
        { key: 'client-plans', icon: ShieldCheck, label: 'Service plans' },
      ] },
      { label: 'Operations', items: [
        { key: 'scheduler-admin', icon: Calendar, label: 'Booking availability' },
        { key: 'analytics', icon: BarChart2, label: 'Analytics' },
        { key: 'contract-builder', icon: FileText, label: 'Contract builder' },
      ] },
    ] : []),
  ];

  const initials =
    user?.name
      ?.split(' ')
      .map((n) => n[0])
      .join('') ?? 'U';

  const navContent = (
    <div className="flex flex-col h-full min-h-0">
        <div className="p-5 flex-1 overflow-y-auto min-h-0">
          <div className="flex flex-col items-start gap-4 mb-8">
            <img src="/logo.png" alt="EVOBRAND" className="h-10 object-contain" />
            <div className="h-px w-8" style={{ background: `${GOLD}30` }} aria-hidden="true" />
            <span className="font-bold tracking-[0.3em] text-xs uppercase" style={{ color: `${GOLD}60` }}>{isAdmin ? 'Studio workspace' : 'Client workspace'}</span>
          </div>
          <nav className="space-y-6" aria-label="Main portal navigation">
            {navGroups.map(group => <div key={group.label}>
              <p className="portal-nav-label">{group.label}</p>
              <div className="space-y-1">{group.items.map(({ key, icon, label }) => (
                <NavItem key={key} icon={icon} label={label}
                  active={view === key || (view === 'detail' && key === (isAdmin ? 'admin' : 'my-tickets'))}
                  onClick={() => { setView(key); setSelectedTicket(null); setMobileOpen(false); }} />
              ))}</div>
            </div>)}
          </nav>
        </div>
        <div className="flex-shrink-0 p-8 border-t" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
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
      <div ref={drawerRef} role="dialog" aria-label="Workspace navigation" aria-modal={mobileOpen || undefined} aria-hidden={!mobileOpen} inert={mobileOpen ? undefined : ''} className={`fixed inset-y-0 left-0 z-50 w-72 flex flex-col transition-transform duration-300 md:hidden ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}
        style={{ background: '#04080f', borderRight: '1px solid rgba(255,255,255,0.05)' }}>
        <button onClick={() => setMobileOpen(false)}
          aria-label="Close navigation"
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
  const isAdmin = user?.is_admin === 1 || user?.is_admin === true;
  const navigate = useNavigate();
  const location = useLocation();
  const VALID_VIEWS = ['dashboard','meetings','analytics','admin','client-plans','contact-forms','scheduler-admin','crm','contracts','my-tickets','blackout','my-contracts','contract-builder','project-tracker','my-projects'];
  const [view, setView] = useState(() => {
    const hash = window.location.hash.replace('#', '');
    return VALID_VIEWS.includes(hash) ? hash : 'dashboard';
  });
  const [tickets, setTickets] = useState([]);
  const [ticketsError, setTicketsError] = useState(false);
  const [editingContract, setEditingContract] = useState(null);
  const [duplicatingContract, setDuplicatingContract] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showNewTicketModal, setShowNewTicketModal] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [paymentBanner, setPaymentBanner] = useState(null); // { type: 'success'|'cancelled', message }
  const [planUsage, setPlanUsage] = useState(null); // { plan, quota, used, remaining, unlimited }

  useEffect(() => {
    if (!authLoading && !user) navigate('/login');
  }, [user, authLoading, navigate]);

  // ── Handle Stripe payment redirect ───────────────────────────────────────────
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const payment = params.get('payment');
    const type    = params.get('type');
    const id      = params.get('id');

    if (payment === 'success' && type && id) {
      // Remove query params from URL cleanly
      navigate('/client-portal', { replace: true });

      // Verify with backend & mark as paid
      const sessionId = params.get('sessionId') ||
        sessionStorage.getItem(`stripe_session_${type}_${id}`);

      if (sessionId) {
        const token = localStorage.getItem('evobrand_token');
        const apiBase = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
          ? 'http://localhost:5000/api'
          : (window.location.origin + '/api');
        fetch(`${apiBase}/payments/verify-session?sessionId=${sessionId}&type=${type}&id=${id}`, {
          headers: { 'Authorization': `Bearer ${token}` },
        }).catch(() => {});
      }

      setPaymentBanner({ type: 'success', message: 'Payment successful! Your invoice has been marked as paid.' });
      setTimeout(() => setPaymentBanner(null), 7000);
    } else if (payment === 'cancelled') {
      navigate('/client-portal', { replace: true });
      setPaymentBanner({ type: 'cancelled', message: 'Payment cancelled. You can complete it any time from your portal.' });
      setTimeout(() => setPaymentBanner(null), 6000);
    }
  }, [location.search]);

  useEffect(() => {
    if (user) fetchTickets(true);
  }, [user]);

  // Sync view → URL hash so refresh restores the active panel
  useEffect(() => {
    if (view !== 'detail') {
      window.location.hash = view === 'dashboard' ? '' : view;
    }
  }, [view]);

  // Keep view in sync with browser back/forward navigation
  useEffect(() => {
    const onHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      setView(VALID_VIEWS.includes(hash) ? hash : 'dashboard');
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000/api/support'
    : (window.location.origin + '/api/support');

  // Refetch right before the ticket form opens so the quota shown is current
  // even if the client already used one up earlier in the session.
  useEffect(() => {
    if (!showNewTicketModal) return;
    const token = localStorage.getItem('evobrand_token');
    fetch(`${API_URL}/plan-usage`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : null)
      .then(data => setPlanUsage(data))
      .catch(() => setPlanUsage(null));
  }, [showNewTicketModal]);

  const fetchTickets = async (isInitial = false) => {
    if (isInitial) setLoading(true);
    setTicketsError(false);
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
      setTicketsError(true);
    } finally {
      if (isInitial) setLoading(false);
    }
  };

  const handleCreateTicket = async (formData) => {
    try {
      const token = localStorage.getItem('evobrand_token');

      // Use FormData so the file attachment is transmitted as multipart
      const body = new FormData();
      body.append('email', user.email);
      body.append('name', user.name || '');
      body.append('subject', formData.subject);
      body.append('message', formData.description);
      body.append('priority', formData.priority?.toLowerCase() || 'normal');
      body.append('service', formData.service || 'General');
      body.append('ticket_type', formData.ticketType || 'standard');
      if (formData.file) {
        body.append('file', formData.file);
      }

      const response = await fetch(`${API_URL}/ticket`, {
        method: 'POST',
        headers: {
          // Do NOT set Content-Type — browser sets it automatically with the correct multipart boundary
          'Authorization': `Bearer ${token}`,
        },
        body,
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

  const handleClientReply = async (ticketId, message, file) => {
    try {
      const token = localStorage.getItem('evobrand_token');
      // multipart/form-data whenever a file is attached — Content-Type with
      // the multipart boundary is set automatically by fetch, don't set it
      // manually or the boundary gets lost and the upload breaks.
      const body = new FormData();
      body.append('message', message);
      if (file) body.append('file', file);

      const response = await fetch(`${API_URL}/tickets/${ticketId}/reply`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body,
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
    const attemptClose = async () => {
      const token = localStorage.getItem('evobrand_token');
      const response = await fetch(`${API_URL}/tickets/${ticketId}/close`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || `Server error (${response.status})`);
      return true;
    };

    try {
      try {
        await attemptClose();
      } catch (firstErr) {
        // Auto-retry once after 1.5s (handles transient Passenger/node hiccups)
        console.warn('Close ticket first attempt failed, retrying...', firstErr.message);
        await new Promise(r => setTimeout(r, 1500));
        await attemptClose();
      }

      await fetchTickets();
      if (selectedTicket && selectedTicket.id === ticketId) {
        setSelectedTicket(prev => ({ ...prev, status: 'closed' }));
      }
    } catch (err) {
      console.error('Error closing ticket:', err);
      alert('Failed to close ticket. Please try again.');
    }
  };


  const handleSignOut = async () => {
    window.location.hash = '';
    await signOut();
    navigate('/login');
  };

  const openTicketCount = tickets.filter((t) => t.status === 'open' || t.status === 'in_progress').length;

  // ── Resolve page title & breadcrumb ─────────────────────────────────────────
  const pageTitle = {
    dashboard: 'Overview',
    'my-tickets': 'Support tickets',
    analytics: 'Analytics',
    detail: 'Ticket Details',
    meetings: 'My Meetings',
    'my-contracts': 'My Contracts',
    'my-projects': 'Project timeline',
    admin: 'Support Tickets',
    'client-plans': 'Service plans',
    'contact-forms': 'Inquiries',
    'scheduler-admin': 'Booking availability',
    crm: 'CRM & Campaigns',
    'contract-builder': 'Contract Builder',
    'project-tracker': 'Projects',
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
        <p className="text-white/40 font-bold tracking-widest text-xs uppercase">Loading your workspace…</p>
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

      {/* Payment result banner */}
      <AnimatePresence>
        {paymentBanner && (
          <motion.div
            key="payment-banner"
            initial={{ opacity: 0, y: -60 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -60 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            className="fixed top-4 left-1/2 z-[9999] flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl"
            style={{
              transform: 'translateX(-50%)',
              background: paymentBanner.type === 'success'
                ? 'linear-gradient(135deg, rgba(52,211,153,0.15), rgba(16,185,129,0.1))'
                : 'linear-gradient(135deg, rgba(250,204,21,0.15), rgba(234,179,8,0.1))',
              border: `1px solid ${paymentBanner.type === 'success' ? 'rgba(52,211,153,0.3)' : 'rgba(250,204,21,0.3)'}`,
              backdropFilter: 'blur(16px)',
              maxWidth: '90vw',
            }}
          >
            {paymentBanner.type === 'success'
              ? <CheckCircle2 size={18} className="text-green-400 flex-shrink-0" />
              : <AlertCircle size={18} className="text-yellow-400 flex-shrink-0" />
            }
            <p className="text-white text-sm font-bold">{paymentBanner.message}</p>
            <button
              onClick={() => setPaymentBanner(null)}
              className="ml-2 text-white/40 hover:text-white transition-colors"
            >
              <X size={15} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="portal-shell h-dvh flex overflow-hidden" style={{ background: '#04080f' }}>
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
        <div className="flex-1 flex flex-col h-full overflow-hidden min-w-0" style={{ background: '#04080f' }}>
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
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <NotificationDropdown onNavigate={(v) => { setView(v === 'my-tickets' && isAdmin ? 'admin' : v); setMobileNavOpen(false); }} />
              <button
                onClick={handleSignOut}
                className="md:hidden p-2.5 rounded-xl transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-red-400"
                style={{ background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.35)' }}
                aria-label="Sign out"
                onMouseEnter={(e) => { e.currentTarget.style.color = '#f87171'; e.currentTarget.style.background = 'rgba(248,113,113,0.08)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.35)'; e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
              >
                <LogOut size={16} aria-hidden="true" />
              </button>
              <div className="h-8 w-px" style={{ background: 'rgba(255,255,255,0.05)' }} aria-hidden="true" />
              <button
                onClick={() => setShowNewTicketModal(true)}
                className="flex items-center gap-2 px-3 sm:px-5 py-2.5 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#22c8e5]"
                style={{ background: GOLD, color: NAVY, boxShadow: `0 4px 16px ${GOLD}20` }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.85')}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
              >
                <Plus size={14} aria-hidden="true" />
                <span>New ticket</span>
              </button>
            </div>
          </header>

          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto px-4 py-6 sm:p-6 lg:p-10">
            <div className="max-w-6xl mx-auto">
              {ticketsError && <div role="alert" className="portal-notice mb-6">Support information could not be refreshed. <button className="portal-text-link" onClick={() => fetchTickets()}>Try again</button></div>}
              <AnimatePresence mode="wait">
                {/* ── Dashboard ── */}
                {(view === 'dashboard' || view === 'my-tickets') && (
                  <motion.div
                    key={view}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.25 }}
                  >
                    {view === 'dashboard' && isAdmin ? (
                      <AdminDashboard
                        tickets={tickets}
                        setView={setView}
                        onViewTicket={async (ticket) => {
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
                        }}
                      />
                    ) : view === 'dashboard' ? (
                      <ClientOverview user={user} tickets={tickets} setView={setView} />
                    ) : (
                      <>
                        <div className="mb-8">
                          <h1 className="text-3xl font-bold text-white mb-2">Support tickets</h1>
                          <p className="portal-muted">Ask a question, request a change, or follow up with our team.</p>
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
                      </>
                    )}
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
                      onBack={() => setView(isAdmin ? 'admin' : 'my-tickets')}
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

                {/* ── Analytics Panel (admin) ── */}
                {view === 'analytics' && (
                  <motion.div
                    key="analytics"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <AdminAnalyticsPanel />
                  </motion.div>
                )}

                {/* ── Support Tickets Panel ── */}
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

                {/* ── Client Plans Panel ── */}
                {view === 'client-plans' && (
                  <motion.div
                    key="client-plans"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <AdminClientPlansPanel user={user} />
                  </motion.div>
                )}

                {/* ── Contact Forms Panel ── */}
                {view === 'contact-forms' && (
                  <motion.div
                    key="contact-forms"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <AdminContactFormsPanel user={user} />
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
                {view === 'contract-builder' && isAdmin && (
                  <motion.div
                    key="contract-builder"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ContractBuilderPanel
                      editingContract={editingContract}
                      duplicatingContract={duplicatingContract}
                      onClear={() => { setEditingContract(null); setDuplicatingContract(null); }}
                    />
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
                    <MyContractsPanel
                      user={user}
                      onEditContract={(contract) => {
                        setEditingContract(contract);
                        setDuplicatingContract(null);
                        setView('contract-builder');
                      }}
                      onDuplicateContract={(contract) => {
                        setDuplicatingContract(contract);
                        setEditingContract(null);
                        setView('contract-builder');
                      }}
                    />
                  </motion.div>
                )}
                {/* ── My Schedule (client) ── */}
                {view === 'my-projects' && (
                  <motion.div
                    key="my-projects"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <MyProjectsPanel />
                  </motion.div>
                )}

                {/* ── Project Schedule (admin) ── */}
                {view === 'project-tracker' && isAdmin && (
                  <motion.div
                    key="project-tracker"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ProjectTrackerPanel />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showNewTicketModal && (
          <NewTicketForm
            onClose={() => setShowNewTicketModal(false)}
            onSubmit={handleCreateTicket}
            user={user}
            usage={planUsage}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default ClientPortalPage;
