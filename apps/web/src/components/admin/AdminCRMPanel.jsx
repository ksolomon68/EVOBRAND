import React, { useState, useEffect } from 'react';
import { Users, Mail, Plus, Trash2, Send, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
  ? 'http://localhost:5000' 
  : 'https://evobrandconcepts.com';

const BEIGE = '#b49969';

export default function AdminCRMPanel({ user }) {
  const [activeTab, setActiveTab] = useState('audience'); // 'audience' or 'campaigns'
  
  // State for Audience Tab
  const [lists, setLists] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [selectedList, setSelectedList] = useState('');
  const [loadingAudience, setLoadingAudience] = useState(false);
  const [newContact, setNewContact] = useState({ email: '', first_name: '', last_name: '' });

  // State for Campaigns Tab
  const [campaigns, setCampaigns] = useState([]);
  const [loadingCampaigns, setLoadingCampaigns] = useState(false);
  const [newCampaign, setNewCampaign] = useState({ subject: '', html_content: '', list_id: '' });
  const [isSending, setIsSending] = useState(false);
  
  // General State
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const isAdmin = user?.user_metadata?.role === 'admin' || user?.is_admin === 1 || user?.is_admin === true;

  useEffect(() => {
    if (isAdmin) {
      fetchLists();
      fetchCampaigns();
    }
  }, [isAdmin]);

  useEffect(() => {
    if (activeTab === 'audience' && isAdmin) {
      fetchContacts(selectedList);
    }
  }, [selectedList, activeTab, isAdmin]);

  // --- API Calls ---

  const fetchLists = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/crm/lists`);
      const data = await res.json();
      setLists(data);
      if (data.length > 0 && !selectedList) {
        setSelectedList(data[0].id);
      }
    } catch (err) {
      console.error('Error fetching lists:', err);
    }
  };

  const fetchContacts = async (listId) => {
    setLoadingAudience(true);
    try {
      const url = listId ? `${API_BASE}/api/crm/contacts?list_id=${listId}` : `${API_BASE}/api/crm/contacts`;
      const res = await fetch(url);
      const data = await res.json();
      setContacts(data);
    } catch (err) {
      console.error('Error fetching contacts:', err);
    } finally {
      setLoadingAudience(false);
    }
  };

  const fetchCampaigns = async () => {
    setLoadingCampaigns(true);
    try {
      const res = await fetch(`${API_BASE}/api/crm/campaigns`);
      const data = await res.json();
      setCampaigns(data);
    } catch (err) {
      console.error('Error fetching campaigns:', err);
    } finally {
      setLoadingCampaigns(false);
    }
  };

  const handleAddContact = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!newContact.email || !selectedList) {
      setError('Email and a selected list are required.');
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/crm/contacts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newContact,
          list_id: selectedList
        })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to add contact');
      
      setMessage('Contact added successfully!');
      setNewContact({ email: '', first_name: '', last_name: '' });
      fetchContacts(selectedList);
      
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteContact = async (id) => {
    if (!window.confirm('Are you sure you want to delete this contact?')) return;
    try {
      const res = await fetch(`${API_BASE}/api/crm/contacts/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete contact');
      fetchContacts(selectedList);
    } catch (err) {
      console.error('Error deleting contact:', err);
    }
  };

  const handleCreateCampaign = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!newCampaign.subject || !newCampaign.html_content || !newCampaign.list_id) {
      setError('Subject, content, and target list are required.');
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/crm/campaigns`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCampaign)
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create campaign');
      
      setMessage('Campaign saved as draft!');
      setNewCampaign({ subject: '', html_content: '', list_id: '' });
      fetchCampaigns();
      
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSendCampaign = async (id) => {
    if (!window.confirm('Are you sure you want to send this campaign to the entire list? This cannot be undone.')) return;
    
    setIsSending(true);
    setError('');
    setMessage('');

    try {
      const res = await fetch(`${API_BASE}/api/crm/campaigns/${id}/send`, { method: 'POST' });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || 'Failed to send campaign');
      
      setMessage(data.message);
      fetchCampaigns();
      
      setTimeout(() => setMessage(''), 5000);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSending(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="bg-[#0f1419] rounded-2xl border border-white/5 p-8 text-center flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 mb-4">
          <AlertCircle size={32} />
        </div>
        <h3 className="text-lg font-bold mb-2 text-white">Admin Access Only</h3>
        <p className="text-sm text-white/40 max-w-sm">This CRM panel is restricted to administrator accounts.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header & Tabs */}
      <div className="bg-[#0f1419] rounded-2xl border border-white/5 p-6 shadow-xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">CRM & Campaigns</h2>
            <p className="text-sm text-white/40">Manage your audience and send email broadcasts</p>
          </div>
          <div className="flex bg-[#1a2332] p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('audience')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-bold transition-colors ${
                activeTab === 'audience' ? 'bg-[#22c8e5] text-[#003258]' : 'text-white/40 hover:text-white'
              }`}
            >
              <Users size={16} /> Audience
            </button>
            <button
              onClick={() => setActiveTab('campaigns')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-bold transition-colors ${
                activeTab === 'campaigns' ? 'bg-[#22c8e5] text-[#003258]' : 'text-white/40 hover:text-white'
              }`}
            >
              <Mail size={16} /> Campaigns
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3">
            <AlertCircle size={18} className="text-red-500 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-red-200">{error}</p>
          </div>
        )}

        {message && (
          <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-start gap-3">
            <CheckCircle2 size={18} className="text-emerald-500 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-emerald-200">{message}</p>
          </div>
        )}
      </div>

      {/* --- AUDIENCE TAB --- */}
      {activeTab === 'audience' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Add Contact Form */}
          <div className="lg:col-span-1 bg-[#0f1419] rounded-2xl border border-white/5 p-6 h-fit">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Plus size={18} className="text-[#22c8e5]" /> Add Contact
            </h3>
            
            <form onSubmit={handleAddContact} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-white/40 uppercase tracking-wider mb-2">Target List</label>
                <select 
                  value={selectedList}
                  onChange={(e) => setSelectedList(e.e.target.value)}
                  className="w-full bg-[#1a2332] border border-white/10 rounded-xl p-3 text-white text-sm focus:outline-none focus:border-[#22c8e5]"
                >
                  <option value="">Select a list...</option>
                  {lists.map(list => (
                    <option key={list.id} value={list.id}>{list.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-white/40 uppercase tracking-wider mb-2">Email Address *</label>
                <input 
                  type="email" 
                  required
                  value={newContact.email}
                  onChange={(e) => setNewContact({...newContact, email: e.target.value})}
                  className="w-full bg-[#1a2332] border border-white/10 rounded-xl p-3 text-white text-sm focus:outline-none focus:border-[#22c8e5]"
                  placeholder="name@company.com"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-white/40 uppercase tracking-wider mb-2">First Name</label>
                  <input 
                    type="text" 
                    value={newContact.first_name}
                    onChange={(e) => setNewContact({...newContact, first_name: e.target.value})}
                    className="w-full bg-[#1a2332] border border-white/10 rounded-xl p-3 text-white text-sm focus:outline-none focus:border-[#22c8e5]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-white/40 uppercase tracking-wider mb-2">Last Name</label>
                  <input 
                    type="text" 
                    value={newContact.last_name}
                    onChange={(e) => setNewContact({...newContact, last_name: e.target.value})}
                    className="w-full bg-[#1a2332] border border-white/10 rounded-xl p-3 text-white text-sm focus:outline-none focus:border-[#22c8e5]"
                  />
                </div>
              </div>

              <button 
                type="submit"
                className="w-full bg-[#22c8e5] text-[#003258] py-3 rounded-xl font-bold hover:bg-white transition-colors flex items-center justify-center gap-2 mt-4"
              >
                <Plus size={16} /> Add to List
              </button>
            </form>
          </div>

          {/* Contact List */}
          <div className="lg:col-span-2 bg-[#0f1419] rounded-2xl border border-white/5 overflow-hidden flex flex-col">
            <div className="p-6 border-b border-white/5 flex justify-between items-center bg-[#1a2332]/50">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Users size={18} className="text-[#22c8e5]" /> 
                Subscribers
                {contacts.length > 0 && <span className="text-xs bg-[#22c8e5]/20 text-[#22c8e5] px-2 py-1 rounded-full ml-2">{contacts.length}</span>}
              </h3>
              
              <div className="flex items-center gap-2">
                <span className="text-xs text-white/40 uppercase font-bold tracking-wider">Filter:</span>
                <select 
                  value={selectedList}
                  onChange={(e) => setSelectedList(e.target.value)}
                  className="bg-transparent border border-white/10 rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:border-[#22c8e5]"
                >
                  <option value="">All Lists</option>
                  {lists.map(list => (
                    <option key={list.id} value={list.id}>{list.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex-1 overflow-x-auto min-h-[400px]">
              {loadingAudience ? (
                <div className="flex justify-center items-center h-full text-white/40">
                  <Loader2 size={24} className="animate-spin" />
                </div>
              ) : contacts.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-white/40 p-12 text-center">
                  <Users size={48} className="mb-4 opacity-20" />
                  <p>No contacts found in this list.</p>
                </div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/5 bg-[#1a2332]/30">
                      <th className="p-4 text-xs font-bold text-white/40 uppercase tracking-wider">Contact</th>
                      <th className="p-4 text-xs font-bold text-white/40 uppercase tracking-wider">List</th>
                      <th className="p-4 text-xs font-bold text-white/40 uppercase tracking-wider">Status</th>
                      <th className="p-4 text-xs font-bold text-white/40 uppercase tracking-wider text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {contacts.map((contact) => (
                      <tr key={contact.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-[#22c8e5]/20 text-[#22c8e5] flex items-center justify-center font-bold text-xs flex-shrink-0">
                              {contact.first_name ? contact.first_name[0].toUpperCase() : contact.email[0].toUpperCase()}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-white">
                                {contact.first_name || contact.last_name ? `${contact.first_name || ''} ${contact.last_name || ''}` : 'Unknown'}
                              </p>
                              <p className="text-xs text-white/40">{contact.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 text-sm text-white/70">
                          <span className="bg-white/10 px-2 py-1 rounded-md text-xs">{contact.list_name}</span>
                        </td>
                        <td className="p-4">
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full ${
                            contact.status === 'subscribed' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                          }`}>
                            {contact.status}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <button 
                            onClick={() => handleDeleteContact(contact.id)}
                            className="p-2 text-white/40 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                            title="Delete Contact"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- CAMPAIGNS TAB --- */}
      {activeTab === 'campaigns' && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Create Campaign */}
          <div className="bg-[#0f1419] rounded-2xl border border-white/5 p-6">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <Mail size={18} className="text-[#22c8e5]" /> Draft New Campaign
            </h3>
            
            <form onSubmit={handleCreateCampaign} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-white/40 uppercase tracking-wider mb-2">Subject Line *</label>
                <input 
                  type="text" 
                  required
                  value={newCampaign.subject}
                  onChange={(e) => setNewCampaign({...newCampaign, subject: e.target.value})}
                  className="w-full bg-[#1a2332] border border-white/10 rounded-xl p-3 text-white text-sm focus:outline-none focus:border-[#22c8e5]"
                  placeholder="Monthly Newsletter: Top AI Trends"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-white/40 uppercase tracking-wider mb-2">Target Audience List *</label>
                <select 
                  required
                  value={newCampaign.list_id}
                  onChange={(e) => setNewCampaign({...newCampaign, list_id: e.target.value})}
                  className="w-full bg-[#1a2332] border border-white/10 rounded-xl p-3 text-white text-sm focus:outline-none focus:border-[#22c8e5]"
                >
                  <option value="">Select a list to send to...</option>
                  {lists.map(list => (
                    <option key={list.id} value={list.id}>{list.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-white/40 uppercase tracking-wider mb-2 flex justify-between">
                  <span>Email Content (HTML Supported) *</span>
                </label>
                <textarea 
                  required
                  rows={10}
                  value={newCampaign.html_content}
                  onChange={(e) => setNewCampaign({...newCampaign, html_content: e.target.value})}
                  className="w-full bg-[#1a2332] border border-white/10 rounded-xl p-4 text-white text-sm focus:outline-none focus:border-[#22c8e5] font-mono resize-y"
                  placeholder="<h1>Hello!</h1><p>Welcome to our newsletter...</p>"
                ></textarea>
                <p className="text-xs text-white/30 mt-2">You can use standard HTML tags like &lt;h1&gt;, &lt;p&gt;, &lt;b&gt;, &lt;a href="..."&gt;</p>
              </div>

              <button 
                type="submit"
                className="w-full bg-white text-[#0f1419] py-3 rounded-xl font-bold hover:bg-[#22c8e5] transition-colors flex items-center justify-center gap-2 mt-2"
              >
                Save as Draft
              </button>
            </form>
          </div>

          {/* Campaigns List */}
          <div className="bg-[#0f1419] rounded-2xl border border-white/5 flex flex-col overflow-hidden">
            <div className="p-6 border-b border-white/5 bg-[#1a2332]/50">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Send size={18} className="text-[#22c8e5]" /> Campaign History
              </h3>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {loadingCampaigns ? (
                <div className="flex justify-center items-center h-full text-white/40 py-12">
                  <Loader2 size={24} className="animate-spin" />
                </div>
              ) : campaigns.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-white/40 py-12 text-center">
                  <Mail size={48} className="mb-4 opacity-20" />
                  <p>No campaigns found.</p>
                  <p className="text-sm mt-2">Draft your first campaign on the left.</p>
                </div>
              ) : (
                campaigns.map((campaign) => (
                  <div key={campaign.id} className="bg-[#1a2332] border border-white/10 rounded-xl p-5 hover:border-[#22c8e5]/30 transition-colors">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-bold text-white text-lg">{campaign.subject}</h4>
                        <p className="text-xs text-[#22c8e5] font-bold mt-1">To: {campaign.list_name || 'Unknown List'}</p>
                      </div>
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full ${
                        campaign.status === 'sent' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                      }`}>
                        {campaign.status}
                      </span>
                    </div>
                    
                    <div className="text-sm text-white/50 mb-4 bg-black/20 p-3 rounded-lg line-clamp-2 overflow-hidden text-ellipsis font-mono text-[11px]">
                      {campaign.html_content}
                    </div>
                    
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
                      <div className="text-xs text-white/40">
                        {campaign.status === 'sent' 
                          ? `Sent: ${new Date(campaign.sent_at).toLocaleString()}` 
                          : `Created: ${new Date(campaign.created_at).toLocaleString()}`}
                      </div>
                      
                      {campaign.status === 'draft' && (
                        <button
                          onClick={() => handleSendCampaign(campaign.id)}
                          disabled={isSending}
                          className="bg-[#22c8e5] text-[#003258] px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isSending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                          Send Now
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
