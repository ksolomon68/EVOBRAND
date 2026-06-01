import React, { useState, useEffect } from 'react';
import { Loader2, ShieldAlert, Ticket, DollarSign, Reply, CheckCircle, AlertCircle } from 'lucide-react';

const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
  ? 'http://localhost:5000/api/support' 
  : 'https://evobrandconcepts.com/api/support';

export default function AdminTicketPanel({ user }) {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [priceInput, setPriceInput] = useState('');
  
  const isAdmin = user?.is_admin === 1 || user?.is_admin === true;

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('evobrand_token');
      const response = await fetch(`${API_URL}/tickets`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        setTickets(data.tickets);
      }
    } catch (err) {
      console.error('Error fetching admin tickets:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchTickets();
    }
  }, [isAdmin]);

  const handleSelectTicket = async (ticket) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('evobrand_token');
      const response = await fetch(`${API_URL}/tickets/${ticket.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        setSelectedTicket({ ...data.ticket, history: data.replies });
        setPriceInput(data.ticket.quoted_price || '');
      }
    } catch (err) {
      console.error('Error fetching ticket details:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    
    try {
      const token = localStorage.getItem('evobrand_token');
      const response = await fetch(`${API_URL}/tickets/${selectedTicket.id}/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ message: replyText })
      });
      
      if (response.ok) {
        setReplyText('');
        handleSelectTicket(selectedTicket);
        fetchTickets();
      }
    } catch (err) {
      console.error('Error replying:', err);
    }
  };

  const handleUpdateTicket = async (updates) => {
    try {
      const token = localStorage.getItem('evobrand_token');
      const response = await fetch(`${API_URL}/tickets/${selectedTicket.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updates)
      });
      
      if (response.ok) {
        handleSelectTicket(selectedTicket);
        fetchTickets();
      } else {
        const data = await response.json().catch(() => ({}));
        alert(`Failed to save: ${data.error || response.statusText}`);
      }
    } catch (err) {
      console.error('Error updating ticket:', err);
    }
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

  if (selectedTicket) {
    return (
      <div>
        <button onClick={() => setSelectedTicket(null)} className="mb-6 text-[#22c8e5] font-bold text-sm hover:underline">
          &larr; Back to Tickets
        </button>
        <div className="flex gap-6">
          {/* Thread View */}
          <div className="flex-1 bg-white/5 border border-white/10 p-6 rounded-2xl">
            <h2 className="text-2xl font-bold text-white mb-4">{selectedTicket.subject}</h2>
            <div className="mb-6">
              <p className="text-white/40 text-sm">From: {selectedTicket.user_name} ({selectedTicket.user_email})</p>
              <p className="text-white/80 mt-2 p-4 bg-white/5 rounded-lg">{selectedTicket.message}</p>
            </div>
            
            <div className="space-y-4 mb-6">
              {selectedTicket.history?.map((msg) => (
                <div key={msg.id} className={`flex ${msg.sender_is_admin ? 'justify-end' : 'justify-start'}`}>
                  <div className={`p-4 rounded-xl max-w-[80%] ${msg.sender_is_admin ? 'bg-[#22c8e5]/20 text-white' : 'bg-white/10 text-white'}`}>
                    <p className="text-xs font-bold mb-1 opacity-50">{msg.sender_is_admin ? 'EVO Admin' : 'Client'}</p>
                    {msg.message}
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={handleReply} className="flex gap-2">
              <input
                type="text"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Type your reply..."
                className="flex-1 bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-[#22c8e5]"
              />
              <button type="submit" className="px-6 bg-[#22c8e5] text-[#003258] font-bold rounded-xl hover:bg-[#1ba3c0]">
                Reply
              </button>
            </form>
          </div>

          {/* Controls Panel */}
          <div className="w-80 bg-white/5 border border-white/10 p-6 rounded-2xl space-y-6">
            <h3 className="font-bold text-white uppercase tracking-widest text-sm">Ticket Settings</h3>
            
            <div>
              <label className="text-xs text-white/40 font-bold mb-2 block">Status</label>
              <select
                value={selectedTicket.status}
                onChange={(e) => handleUpdateTicket({ status: e.target.value })}
                className="w-full bg-[#04080f] border border-white/10 text-white p-2 rounded-lg"
              >
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </div>

            <div>
              <label className="text-xs text-white/40 font-bold mb-2 block">Priority</label>
              <select
                value={selectedTicket.priority}
                onChange={(e) => handleUpdateTicket({ priority: e.target.value })}
                className="w-full bg-[#04080f] border border-white/10 text-white p-2 rounded-lg"
              >
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            <div className="pt-6 border-t border-white/10">
              <label className="text-xs text-[#22c8e5] font-bold mb-2 block">Quoted Price ($)</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={priceInput}
                  onChange={(e) => setPriceInput(e.target.value)}
                  className="w-full bg-[#04080f] border border-[#22c8e5]/30 text-[#22c8e5] font-bold p-2 rounded-lg"
                  placeholder="0.00"
                />
                <button
                  onClick={() => handleUpdateTicket({ quoted_price: priceInput })}
                  className="px-3 bg-[#22c8e5]/20 text-[#22c8e5] rounded-lg hover:bg-[#22c8e5]/30"
                >
                  Save
                </button>
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedTicket.is_paid === 1 || selectedTicket.is_paid === true}
                  onChange={(e) => handleUpdateTicket({ is_paid: e.target.checked })}
                  className="w-4 h-4 rounded text-[#22c8e5]"
                />
                <span className="text-sm font-bold text-white/80">Mark as Paid</span>
              </label>
            </div>

          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-1">Global Support Inbox</h1>
        <p className="text-white/40">Manage all client tickets, quote prices, and resolve issues.</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-10"><Loader2 className="animate-spin text-[#22c8e5]" /></div>
      ) : (
        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-white/5 text-white/40 text-xs font-bold uppercase tracking-widest border-b border-white/10">
              <tr>
                <th className="p-4">Ticket</th>
                <th className="p-4">Client</th>
                <th className="p-4">Status</th>
                <th className="p-4">Quote</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="text-sm text-white">
              {tickets.map(t => (
                <tr key={t.id} className="border-b border-white/5 hover:bg-white/5">
                  <td className="p-4 font-bold">{t.subject}</td>
                  <td className="p-4 text-white/60">{t.user_name}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs uppercase font-bold ${
                      t.status === 'open' ? 'bg-green-500/20 text-green-400' : 'bg-white/10'
                    }`}>
                      {t.status}
                    </span>
                  </td>
                  <td className="p-4 font-bold text-[#22c8e5]">
                    {t.quoted_price > 0 ? `$${t.quoted_price}` : '-'}
                  </td>
                  <td className="p-4 text-right">
                    <button onClick={() => handleSelectTicket(t)} className="text-[#22c8e5] hover:underline font-bold text-xs">
                      Manage &rarr;
                    </button>
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
