import React, { useState, useEffect, useRef } from 'react';
import { Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const GOLD = '#b49969';
const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:5000/api'
  : (window.location.origin + '/api');

export default function NotificationDropdown({ onNavigate }) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [dropStyle, setDropStyle] = useState({});
  const containerRef = useRef(null);
  const buttonRef = useRef(null);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('evobrand_token');
      if (!token) return;
      const response = await fetch(`${API_BASE}/notifications`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  };

  const markAsRead = async (id) => {
    try {
      const token = localStorage.getItem('evobrand_token');
      await fetch(`${API_BASE}/notifications/${id}/read`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: 1 } : n));
    } catch (err) {
      console.error('Failed to mark read:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem('evobrand_token');
      await fetch(`${API_BASE}/notifications/read-all`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setNotifications(prev => prev.map(n => ({ ...n, is_read: 1 })));
    } catch (err) {
      console.error('Failed to mark all read:', err);
    }
  };

  const handleNotificationClick = (notif) => {
    if (!notif.is_read) markAsRead(notif.id);
    if (notif.link && onNavigate) {
      if (notif.link.includes('ticket')) onNavigate('dashboard');
      if (notif.link.includes('contract')) onNavigate('my-contracts');
      if (notif.link.includes('project')) onNavigate(notif.link.replace('#', ''));
      setIsOpen(false);
    }
  };

  const handleToggle = () => {
    if (!isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const dropWidth = Math.min(384, window.innerWidth - 24);
      // Align right edge of dropdown to right edge of button, clamped to viewport
      const left = Math.max(12, rect.right - dropWidth);
      setDropStyle({
        position: 'fixed',
        top: rect.bottom + 10,
        left,
        width: dropWidth,
        zIndex: 9999,
      });
    }
    setIsOpen(prev => !prev);
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div ref={containerRef}>
      <button
        ref={buttonRef}
        onClick={handleToggle}
        className="relative p-3 rounded-xl transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#22c8e5]"
        style={{
          background: isOpen ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.04)',
          color: isOpen ? '#fff' : 'rgba(255,255,255,0.35)'
        }}
        aria-label="Notifications"
        onMouseEnter={(e) => { if (!isOpen) e.currentTarget.style.color = GOLD; }}
        onMouseLeave={(e) => { if (!isOpen) e.currentTarget.style.color = 'rgba(255,255,255,0.35)'; }}
      >
        {unreadCount > 0 ? (
          <>
            <Bell size={17} aria-hidden="true" />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-red-500 ring-2 ring-[#04080f]" />
          </>
        ) : (
          <Bell size={17} aria-hidden="true" />
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="rounded-2xl shadow-2xl border border-white/10 overflow-hidden"
            style={{ ...dropStyle, background: '#0a101d', backdropFilter: 'blur(20px)' }}
          >
            <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/5">
              <h3 className="text-white font-bold text-sm tracking-wide">Notifications</h3>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-[10px] uppercase tracking-widest font-bold text-white/40 hover:text-white transition-colors"
                >
                  Mark all read
                </button>
              )}
            </div>

            <div className="max-h-[400px] overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-white/30 text-sm">
                  You're all caught up!
                </div>
              ) : (
                notifications.map(notif => (
                  <div
                    key={notif.id}
                    onClick={() => handleNotificationClick(notif)}
                    className={`p-4 border-b border-white/5 cursor-pointer transition-colors ${notif.is_read ? 'hover:bg-white/5 opacity-60' : 'bg-[#22c8e5]/5 hover:bg-[#22c8e5]/10'}`}
                  >
                    <div className="flex gap-3">
                      <div className="mt-1">
                        <div className={`w-2 h-2 rounded-full ${notif.is_read ? 'bg-transparent' : 'bg-[#22c8e5]'}`} />
                      </div>
                      <div>
                        <h4 className={`text-sm ${notif.is_read ? 'text-white/70' : 'text-white font-bold'}`}>
                          {notif.title}
                        </h4>
                        <p className="text-xs text-white/50 mt-1 leading-relaxed">
                          {notif.message}
                        </p>
                        <p className="text-[10px] text-white/30 uppercase tracking-widest font-bold mt-2">
                          {new Date(notif.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
