import React, { useState, useEffect } from 'react';
import { Calendar, Loader2, XCircle, ExternalLink, Video } from 'lucide-react';

const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:5000/api'
  : (window.location.origin + '/api');

export default function AdminBookingsPanel({ user }) {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [canceling, setCanceling] = useState(null);

  useEffect(() => {
    fetchMeetings();
  }, []);

  const fetchMeetings = async () => {
    try {
      const res = await fetch(`${API_BASE}/scheduler/meetings/0`, {
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch meetings');
      const data = await res.json();
      setMeetings(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this booking? The client will be notified via email.')) return;
    
    setCanceling(id);
    try {
      const res = await fetch(`${API_BASE}/scheduler/meetings/${id}/cancel`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      if (!res.ok) throw new Error('Failed to cancel meeting');
      
      // Update local state
      setMeetings(meetings.map(m => m.id === id ? { ...m, status: 'canceled' } : m));
    } catch (err) {
      alert(err.message);
    } finally {
      setCanceling(null);
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="animate-spin text-[#22c8e5]" size={32} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-xl">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[#22c8e5]/10">
          <Calendar size={20} className="text-[#22c8e5]" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white tracking-wide">Bookings Overview</h2>
          <p className="text-sm text-white/50">Manage all scheduled meetings and consultations</p>
        </div>
      </div>

      <div className="bg-[rgba(13,30,53,0.7)] backdrop-blur-md border border-[rgba(34,200,229,0.12)] rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-white/80">
            <thead className="bg-[#003258] text-white/90 uppercase tracking-wider text-xs border-b border-[rgba(34,200,229,0.12)]">
              <tr>
                <th className="p-4 font-semibold">Client</th>
                <th className="p-4 font-semibold">Date & Time</th>
                <th className="p-4 font-semibold">Type</th>
                <th className="p-4 font-semibold">Notes</th>
                <th className="p-4 font-semibold">Meeting Link</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(255,255,255,0.05)]">
              {meetings.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-white/50">
                    No bookings found.
                  </td>
                </tr>
              ) : (
                meetings.map(m => (
                  <tr key={m.id} className="hover:bg-[rgba(255,255,255,0.02)] transition-colors">
                    <td className="p-4">
                      <div className="font-semibold text-white">{m.client_name || 'Guest'}</div>
                      <div className="text-xs text-white/50">{m.client_email || 'N/A'}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-semibold text-[#22c8e5]">{formatDate(m.date)}</div>
                      <div className="text-xs text-white/70">{m.time} ({m.duration} min)</div>
                    </td>
                    <td className="p-4 capitalize">
                      <span className="bg-white/10 px-2 py-1 rounded text-xs">
                        {m.type}
                      </span>
                    </td>
                    <td className="p-4 max-w-[200px] truncate text-white/60" title={m.notes}>
                      {m.notes || '-'}
                    </td>
                    <td className="p-4">
                      {m.meet_link && m.status !== 'canceled' ? (
                        <a href={m.meet_link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[#22c8e5] hover:underline text-xs">
                          <Video size={12} /> Join Meet
                        </a>
                      ) : '-'}
                    </td>
                    <td className="p-4">
                      {m.status === 'canceled' ? (
                        <span className="text-red-400 font-semibold text-xs flex items-center gap-1">
                          <XCircle size={12} /> Canceled
                        </span>
                      ) : (
                        <span className="text-green-400 font-semibold text-xs flex items-center gap-1">
                          <Loader2 size={12} className="animate-spin text-green-400" /> Scheduled
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      {m.status !== 'canceled' && (
                        <button
                          onClick={() => handleCancel(m.id)}
                          disabled={canceling === m.id}
                          className="text-xs font-semibold text-red-400 hover:text-red-300 transition-colors disabled:opacity-50"
                        >
                          {canceling === m.id ? 'Canceling...' : 'Cancel'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
