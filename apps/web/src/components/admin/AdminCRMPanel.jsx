import React, { useState, useEffect, useRef } from 'react';
import { Users, Mail, Plus, Trash2, Send, CheckCircle2, AlertCircle, Loader2, Eye, MousePointerClick, Pencil, X, Check, FileText, Bold, Italic, Link2, List } from 'lucide-react';

const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
  ? 'http://localhost:5000' 
  : window.location.origin;

const BEIGE = '#b49969';

export default function AdminCRMPanel({ user }) {
  const [activeTab, setActiveTab] = useState('audience'); // 'audience' or 'campaigns'
  
  // State for Audience Tab
  const [lists, setLists] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [filterList, setFilterList] = useState('');   // contacts filter dropdown
  const [targetList, setTargetList] = useState('');   // add contact form
  const [editingContact, setEditingContact] = useState(null); // { id, first_name, last_name, list_id }
  const [isSavingContact, setIsSavingContact] = useState(false);
  const [loadingAudience, setLoadingAudience] = useState(false);
  const [newContact, setNewContact] = useState({ email: '', first_name: '', last_name: '' });

  // State for Campaigns Tab
  const [campaigns, setCampaigns] = useState([]);
  const [loadingCampaigns, setLoadingCampaigns] = useState(false);
  const [draft, setDraft] = useState({ subject: '', html_content: '' });
  const [campaignListIds, setCampaignListIds] = useState([]);
  const [editingCampaignId, setEditingCampaignId] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [sendConfirmId, setSendConfirmId] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const [isSavingCampaign, setIsSavingCampaign] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [isDeletingCampaign, setIsDeletingCampaign] = useState(null);
  const contentRef = useRef(null);
  
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
      fetchContacts(filterList);
    }
  }, [filterList, activeTab, isAdmin]);

  // --- API Calls ---

  const getJSONOrError = async (res) => {
    const contentType = res.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await res.json();
    }
    const text = await res.text();
    const cleanText = text.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    const snippet = cleanText.substring(0, 150) || 'Empty response';
    return { error: `HTTP ${res.status}: ${snippet}` };
  };

  const fetchLists = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/crm/lists`);
      const data = await getJSONOrError(res);
      if (!res.ok) throw new Error(data.error || 'Failed to fetch lists');
      setLists(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching lists:', err);
    }
  };

  const fetchContacts = async (listId) => {
    setLoadingAudience(true);
    try {
      const url = listId ? `${API_BASE}/api/crm/contacts?list_id=${listId}` : `${API_BASE}/api/crm/contacts`;
      const res = await fetch(url);
      const data = await getJSONOrError(res);
      if (!res.ok) throw new Error(data.error || 'Failed to fetch contacts');
      setContacts(Array.isArray(data) ? data : []);
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
      const data = await getJSONOrError(res);
      if (!res.ok) throw new Error(data.error || 'Failed to fetch campaigns');
      setCampaigns(Array.isArray(data) ? data : []);
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

    if (!newContact.email || !targetList) {
      setError('Email and a selected list are required.');
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/crm/contacts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newContact,
          list_id: targetList
        })
      });

      const data = await getJSONOrError(res);
      if (!res.ok) throw new Error(data.error || 'Failed to add contact');

      setMessage('Contact added successfully!');
      setNewContact({ email: '', first_name: '', last_name: '' });
      fetchContacts(filterList);
      
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteContact = async (id) => {
    if (!window.confirm('Are you sure you want to delete this contact?')) return;
    try {
      const res = await fetch(`${API_BASE}/api/crm/contacts/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await getJSONOrError(res);
        throw new Error(data.error || 'Failed to delete contact');
      }
      fetchContacts(filterList);
    } catch (err) {
      console.error('Error deleting contact:', err);
    }
  };

  const handleUpdateContact = async () => {
    const listId = String(editingContact?.list_id || '');
    if (!listId) {
      setError('Please select a list.');
      return;
    }
    setIsSavingContact(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/api/crm/contacts/${editingContact.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_name: editingContact.first_name,
          last_name: editingContact.last_name,
          list_id: listId,
        }),
      });
      const data = await getJSONOrError(res);
      if (!res.ok) throw new Error(data.error || 'Failed to update contact');
      setEditingContact(null);
      setMessage('Contact updated!');
      fetchContacts(filterList);
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSavingContact(false);
    }
  };

  const resetDraft = () => {
    setDraft({ subject: '', html_content: '' });
    setCampaignListIds([]);
    setEditingCampaignId(null);
    setShowPreview(false);
  };

  const loadDraftForEdit = (campaign) => {
    setDraft({ subject: campaign.subject, html_content: campaign.html_content });
    const ids = campaign.target_list_ids
      ? JSON.parse(campaign.target_list_ids).map(String)
      : [String(campaign.list_id)];
    setCampaignListIds(ids);
    setEditingCampaignId(campaign.id);
    setShowPreview(false);
    setActiveTab('campaigns');
  };

  const toggleListId = (id) => {
    const sid = String(id);
    setCampaignListIds(prev =>
      prev.includes(sid) ? prev.filter(x => x !== sid) : [...prev, sid]
    );
  };

  const insertTag = (open, close) => {
    const ta = contentRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const selected = ta.value.substring(start, end) || 'text';
    const inserted = `${open}${selected}${close}`;
    const newVal = ta.value.substring(0, start) + inserted + ta.value.substring(end);
    setDraft(prev => ({ ...prev, html_content: newVal }));
    setTimeout(() => { ta.focus(); ta.setSelectionRange(start + inserted.length, start + inserted.length); }, 0);
  };

  const handleSaveCampaign = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    if (!draft.subject || !draft.html_content || !campaignListIds.length) {
      setError('Subject, content, and at least one list are required.');
      return;
    }
    setIsSavingCampaign(true);
    try {
      const method = editingCampaignId ? 'PUT' : 'POST';
      const url = editingCampaignId
        ? `${API_BASE}/api/crm/campaigns/${editingCampaignId}`
        : `${API_BASE}/api/crm/campaigns`;
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...draft, target_list_ids: campaignListIds }),
      });
      const data = await getJSONOrError(res);
      if (!res.ok) throw new Error(data.error || 'Failed to save campaign');
      setMessage(editingCampaignId ? 'Draft updated!' : 'Campaign saved as draft!');
      if (!editingCampaignId && data.id) setEditingCampaignId(data.id);
      fetchCampaigns();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSavingCampaign(false);
    }
  };

  const handleSendCampaign = async (id) => {
    setSendConfirmId(null);
    setIsSending(true);
    setError('');
    setMessage('');
    try {
      const res = await fetch(`${API_BASE}/api/crm/campaigns/${id}/send`, { method: 'POST' });
      const data = await getJSONOrError(res);
      if (!res.ok) throw new Error(data.error || 'Failed to send campaign');
      setMessage(data.message);
      resetDraft();
      fetchCampaigns();
      setTimeout(() => setMessage(''), 5000);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSending(false);
    }
  };

  const handlePreviewCampaign = async (id) => {
    setIsPreviewing(true);
    setError('');
    setMessage('');

    try {
      const res = await fetch(`${API_BASE}/api/crm/campaigns/${id}/preview`, { method: 'POST' });
      const data = await getJSONOrError(res);
      
      if (!res.ok) throw new Error(data.error || 'Failed to send preview');
      
      setMessage(data.message);
      
      setTimeout(() => setMessage(''), 5000);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsPreviewing(false);
    }
  };

  const handleDeleteCampaign = async (id, subject) => {
    if (!window.confirm(`Delete "${subject}"? This cannot be undone.`)) return;
    setIsDeletingCampaign(id);
    setError('');
    setMessage('');
    try {
      const res = await fetch(`${API_BASE}/api/crm/campaigns/${id}`, { method: 'DELETE' });
      const data = await getJSONOrError(res);
      if (!res.ok) throw new Error(data.error || 'Failed to delete campaign');
      setMessage('Campaign deleted.');
      if (id === editingCampaignId) resetDraft();
      fetchCampaigns();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsDeletingCampaign(null);
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
              className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-sm font-bold transition-colors ${
                activeTab === 'audience' ? 'bg-[#22c8e5] text-[#003258]' : 'text-white/40 hover:text-white'
              }`}
            >
              <Users size={16} /> Audience
            </button>
            <button
              onClick={() => setActiveTab('campaigns')}
              className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-sm font-bold transition-colors ${
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
                  value={targetList}
                  onChange={(e) => setTargetList(e.target.value)}
                  className="w-full bg-[#1a2332] border border-white/10 rounded-xl p-3 text-white text-sm focus:outline-none focus:border-[#22c8e5]"
                >
                  <option value="" className="bg-[#1a2332] text-white">Select a list...</option>
                  {lists.map(list => (
                    <option key={list.id} value={list.id} className="bg-[#1a2332] text-white">{list.name}</option>
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
                className="w-full bg-[#22c8e5] text-[#003258] py-3 rounded-2xl font-bold hover:bg-white transition-colors flex items-center justify-center gap-2 mt-4"
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
                {contacts.length > 0 && <span className="text-xs bg-[#22c8e5]/20 text-[#22c8e5] px-2 py-1 rounded-2xl ml-2">{contacts.length}</span>}
              </h3>
              
              <div className="flex items-center gap-2">
                <span className="text-xs text-white/40 uppercase font-bold tracking-wider">Filter:</span>
                <select
                  value={filterList}
                  onChange={(e) => setFilterList(e.target.value)}
                  className="bg-[#1a2332] border border-white/10 rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:border-[#22c8e5]"
                >
                  <option value="" className="bg-[#1a2332] text-white">All Lists</option>
                  {lists.map(list => (
                    <option key={list.id} value={list.id} className="bg-[#1a2332] text-white">{list.name}</option>
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
                    {contacts.map((contact) => {
                      const isEditing = editingContact?.id === contact.id;
                      return (
                        <tr key={contact.id} className={`border-b border-white/5 transition-colors ${isEditing ? 'bg-[#22c8e5]/5' : 'hover:bg-white/5'}`}>
                          <td className="p-4">
                            {isEditing ? (
                              <div className="flex gap-2">
                                <input
                                  value={editingContact.first_name || ''}
                                  onChange={(e) => setEditingContact({ ...editingContact, first_name: e.target.value })}
                                  placeholder="First"
                                  className="w-24 bg-[#1a2332] border border-white/20 rounded-lg px-2 py-1 text-white text-xs focus:outline-none focus:border-[#22c8e5]"
                                />
                                <input
                                  value={editingContact.last_name || ''}
                                  onChange={(e) => setEditingContact({ ...editingContact, last_name: e.target.value })}
                                  placeholder="Last"
                                  className="w-24 bg-[#1a2332] border border-white/20 rounded-lg px-2 py-1 text-white text-xs focus:outline-none focus:border-[#22c8e5]"
                                />
                              </div>
                            ) : (
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
                            )}
                          </td>
                          <td className="p-4 text-sm text-white/70">
                            {isEditing ? (
                              <select
                                value={editingContact.list_id}
                                onChange={(e) => setEditingContact({ ...editingContact, list_id: e.target.value })}
                                className="bg-[#1a2332] border border-white/20 rounded-lg px-2 py-1 text-white text-xs focus:outline-none focus:border-[#22c8e5]"
                              >
                                {lists.map(list => (
                                  <option key={list.id} value={list.id} className="bg-[#1a2332] text-white">{list.name}</option>
                                ))}
                              </select>
                            ) : (
                              <span className="bg-white/10 px-2 py-1 rounded-2xl text-xs">{contact.list_name}</span>
                            )}
                          </td>
                          <td className="p-4">
                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full ${
                              contact.status === 'subscribed' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                            }`}>
                              {contact.status}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              {isEditing ? (
                                <>
                                  <button
                                    onClick={handleUpdateContact}
                                    disabled={isSavingContact}
                                    className="p-2 text-emerald-400 hover:bg-emerald-400/10 rounded-lg transition-colors disabled:opacity-50"
                                    title="Save"
                                  >
                                    {isSavingContact ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                                  </button>
                                  <button
                                    onClick={() => setEditingContact(null)}
                                    className="p-2 text-white/40 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                                    title="Cancel"
                                  >
                                    <X size={16} />
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button
                                    onClick={() => setEditingContact({ id: contact.id, first_name: contact.first_name || '', last_name: contact.last_name || '', list_id: String(contact.list_id) })}
                                    className="p-2 text-white/40 hover:text-[#22c8e5] hover:bg-[#22c8e5]/10 rounded-lg transition-colors"
                                    title="Edit Contact"
                                  >
                                    <Pencil size={16} />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteContact(contact.id)}
                                    className="p-2 text-white/40 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                                    title="Delete Contact"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- CAMPAIGNS TAB --- */}
      {activeTab === 'campaigns' && (
        <>
          {/* Send Confirmation Modal */}
          {sendConfirmId !== null && (() => {
            const camp = campaigns.find(c => c.id === sendConfirmId);
            if (!camp) return null;
            const targetIds = camp.target_list_ids
              ? JSON.parse(camp.target_list_ids).map(String)
              : [String(camp.list_id)];
            const targetedLists = lists.filter(l => targetIds.includes(String(l.id)));
            const totalCount = targetedLists.reduce((s, l) => s + (l.contact_count || 0), 0);
            return (
              <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                <div className="bg-[#0f1419] border border-white/10 rounded-2xl p-6 max-w-md w-full shadow-2xl">
                  <h3 className="text-lg font-bold text-white mb-1">Confirm Send</h3>
                  <p className="text-sm text-white/50 mb-4">This cannot be undone once sent.</p>
                  <div className="bg-[#1a2332] rounded-xl p-4 mb-4 space-y-2">
                    <p className="text-sm font-bold text-white">{camp.subject}</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {targetedLists.map(l => (
                        <span key={l.id} className="text-xs bg-[#22c8e5]/20 text-[#22c8e5] px-2 py-1 rounded-full">
                          {l.name} ({l.contact_count ?? 0})
                        </span>
                      ))}
                    </div>
                    <p className="text-xs text-white/40 pt-1">≈ {totalCount} subscribers</p>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setSendConfirmId(null)}
                      className="flex-1 py-2 rounded-xl border border-white/10 text-white/60 text-sm font-bold hover:bg-white/5 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleSendCampaign(sendConfirmId)}
                      disabled={isSending}
                      className="flex-1 py-2 rounded-xl bg-[#22c8e5] text-[#003258] text-sm font-bold hover:bg-white transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {isSending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                      Send Now
                    </button>
                  </div>
                </div>
              </div>
            );
          })()}

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Compose Panel */}
            <div className="bg-[#0f1419] rounded-2xl border border-white/5 p-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Mail size={18} className="text-[#22c8e5]" />
                  {editingCampaignId ? 'Edit Draft' : 'New Campaign'}
                </h3>
                {editingCampaignId && (
                  <button onClick={resetDraft} className="text-xs text-white/40 hover:text-white flex items-center gap-1 transition-colors">
                    <Plus size={12} /> New Draft
                  </button>
                )}
              </div>

              <form onSubmit={handleSaveCampaign} className="space-y-4">
                {/* Subject */}
                <div>
                  <label className="block text-xs font-bold text-white/40 uppercase tracking-wider mb-2">Subject Line *</label>
                  <input
                    type="text"
                    value={draft.subject}
                    onChange={(e) => setDraft(prev => ({ ...prev, subject: e.target.value }))}
                    className="w-full bg-[#1a2332] border border-white/10 rounded-xl p-3 text-white text-sm focus:outline-none focus:border-[#22c8e5]"
                    placeholder="Monthly Newsletter: Top AI Trends"
                  />
                </div>

                {/* List selection */}
                <div>
                  <label className="block text-xs font-bold text-white/40 uppercase tracking-wider mb-2">Target Lists *</label>
                  <div className="bg-[#1a2332] rounded-xl border border-white/10 divide-y divide-white/5">
                    {lists.map(list => {
                      const checked = campaignListIds.includes(String(list.id));
                      return (
                        <label key={list.id} className={`flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-white/5 transition-colors ${checked ? 'bg-[#22c8e5]/5' : ''}`}>
                          <div className="flex items-center gap-3">
                            <div className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition-colors ${checked ? 'bg-[#22c8e5] border-[#22c8e5]' : 'border-white/20'}`}>
                              {checked && <Check size={10} className="text-[#003258]" />}
                            </div>
                            <input type="checkbox" checked={checked} onChange={() => toggleListId(list.id)} className="sr-only" />
                            <span className="text-sm text-white">{list.name}</span>
                          </div>
                          <span className="text-xs text-white/40">{list.contact_count ?? 0} subscribers</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Toolbar + Content */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold text-white/40 uppercase tracking-wider">Email Content *</label>
                    <button
                      type="button"
                      onClick={() => setShowPreview(p => !p)}
                      className={`text-xs px-3 py-1 rounded-lg font-bold transition-colors flex items-center gap-1.5 ${showPreview ? 'bg-[#22c8e5] text-[#003258]' : 'text-white/40 hover:text-white border border-white/10'}`}
                    >
                      <Eye size={12} /> {showPreview ? 'Code' : 'Preview'}
                    </button>
                  </div>
                  {!showPreview && (
                    <div className="flex gap-1 mb-2 flex-wrap">
                      {[
                        { icon: <Bold size={13} />, title: 'Bold', open: '<strong>', close: '</strong>' },
                        { icon: <Italic size={13} />, title: 'Italic', open: '<em>', close: '</em>' },
                        { icon: <span className="text-xs font-bold">H2</span>, title: 'Heading', open: '<h2>', close: '</h2>' },
                        { icon: <List size={13} />, title: 'List item', open: '<li>', close: '</li>' },
                      ].map(btn => (
                        <button
                          key={btn.title}
                          type="button"
                          title={btn.title}
                          onClick={() => insertTag(btn.open, btn.close)}
                          className="px-2 py-1 bg-[#1a2332] border border-white/10 rounded-lg text-white/60 hover:text-white hover:border-white/30 transition-colors"
                        >
                          {btn.icon}
                        </button>
                      ))}
                      <button
                        type="button"
                        title="Link"
                        onClick={() => {
                          const url = prompt('Enter URL:');
                          if (!url) return;
                          const ta = contentRef.current;
                          if (!ta) return;
                          const s = ta.selectionStart, e2 = ta.selectionEnd;
                          const sel = ta.value.substring(s, e2) || 'link text';
                          const ins = `<a href="${url}">${sel}</a>`;
                          const nv = ta.value.substring(0, s) + ins + ta.value.substring(e2);
                          setDraft(prev => ({ ...prev, html_content: nv }));
                          setTimeout(() => { ta.focus(); ta.setSelectionRange(s + ins.length, s + ins.length); }, 0);
                        }}
                        className="px-2 py-1 bg-[#1a2332] border border-white/10 rounded-lg text-white/60 hover:text-white hover:border-white/30 transition-colors"
                      >
                        <Link2 size={13} />
                      </button>
                    </div>
                  )}
                  {showPreview ? (
                    <div
                      className="w-full bg-white rounded-xl p-4 min-h-[200px] text-[#111] text-sm overflow-auto"
                      dangerouslySetInnerHTML={{ __html: draft.html_content || '<p class="text-gray-400">Nothing to preview yet.</p>' }}
                    />
                  ) : (
                    <textarea
                      ref={contentRef}
                      rows={10}
                      value={draft.html_content}
                      onChange={(e) => setDraft(prev => ({ ...prev, html_content: e.target.value }))}
                      className="w-full bg-[#1a2332] border border-white/10 rounded-xl p-4 text-white text-sm focus:outline-none focus:border-[#22c8e5] font-mono resize-y"
                      placeholder="<h1>Hello!</h1><p>Welcome to our newsletter...</p>"
                    />
                  )}
                </div>

                {/* Checklist */}
                <div className="flex gap-4 text-xs">
                  {[
                    { label: 'Subject', ok: !!draft.subject },
                    { label: 'Content', ok: !!draft.html_content },
                    { label: `Lists (${campaignListIds.length})`, ok: campaignListIds.length > 0 },
                  ].map(item => (
                    <span key={item.label} className={`flex items-center gap-1 font-bold ${item.ok ? 'text-emerald-400' : 'text-white/30'}`}>
                      {item.ok ? <Check size={12} /> : <X size={12} />} {item.label}
                    </span>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-1">
                  <button
                    type="submit"
                    disabled={isSavingCampaign}
                    className="flex-1 bg-white text-[#0f1419] py-3 rounded-2xl font-bold hover:bg-[#22c8e5] transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isSavingCampaign ? <Loader2 size={16} className="animate-spin" /> : <FileText size={16} />}
                    {editingCampaignId ? 'Update Draft' : 'Save Draft'}
                  </button>
                  {editingCampaignId && (
                    <button
                      type="button"
                      onClick={() => setSendConfirmId(editingCampaignId)}
                      disabled={!draft.subject || !draft.html_content || !campaignListIds.length || isSavingCampaign}
                      className="flex-1 bg-[#22c8e5] text-[#003258] py-3 rounded-2xl font-bold hover:bg-white transition-colors flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <Send size={16} /> Send Now
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* Campaign History */}
            <div className="bg-[#0f1419] rounded-2xl border border-white/5 flex flex-col overflow-hidden">
              <div className="p-6 border-b border-white/5 bg-[#1a2332]/50 flex items-center justify-between">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Send size={18} className="text-[#22c8e5]" /> Campaign History
                </h3>
                <button
                  onClick={resetDraft}
                  className="text-xs bg-[#22c8e5]/10 text-[#22c8e5] px-3 py-1.5 rounded-lg font-bold hover:bg-[#22c8e5]/20 transition-colors flex items-center gap-1.5"
                >
                  <Plus size={12} /> New Draft
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {loadingCampaigns ? (
                  <div className="flex justify-center items-center h-full text-white/40 py-12">
                    <Loader2 size={24} className="animate-spin" />
                  </div>
                ) : campaigns.length === 0 ? (
                  <div className="flex flex-col items-center justify-center text-white/40 py-12 text-center">
                    <Mail size={48} className="mb-4 opacity-20" />
                    <p>No campaigns yet.</p>
                    <p className="text-sm mt-2">Start by filling in the compose form.</p>
                  </div>
                ) : (
                  campaigns.map((campaign) => {
                    const targetIds = campaign.target_list_ids
                      ? JSON.parse(campaign.target_list_ids).map(String)
                      : [String(campaign.list_id)];
                    const targetNames = lists
                      .filter(l => targetIds.includes(String(l.id)))
                      .map(l => l.name);
                    const isActive = editingCampaignId === campaign.id;
                    return (
                      <div key={campaign.id} className={`bg-[#1a2332] border rounded-xl p-5 transition-colors ${isActive ? 'border-[#22c8e5]/50' : 'border-white/10 hover:border-white/20'}`}>
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1 min-w-0 pr-3">
                            <h4 className="font-bold text-white text-base leading-tight">{campaign.subject}</h4>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {targetNames.map(name => (
                                <span key={name} className="text-[10px] bg-[#22c8e5]/15 text-[#22c8e5] px-2 py-0.5 rounded-full font-bold">{name}</span>
                              ))}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full ${campaign.status === 'sent' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                              {campaign.status}
                            </span>
                            <button
                              onClick={() => handleDeleteCampaign(campaign.id, campaign.subject)}
                              disabled={isDeletingCampaign === campaign.id}
                              className="p-1.5 text-white/30 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors disabled:opacity-40"
                              title="Delete"
                            >
                              {isDeletingCampaign === campaign.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                            </button>
                          </div>
                        </div>

                        <div className="text-white/30 mb-3 bg-black/20 p-3 rounded-lg line-clamp-2 font-mono text-[11px]">
                          {campaign.html_content}
                        </div>

                        {campaign.status === 'sent' && (
                          <div className="flex gap-3 mb-3">
                            <div className="flex items-center gap-1.5 bg-sky-500/10 border border-sky-500/20 rounded-lg px-3 py-1.5">
                              <Eye size={12} className="text-sky-400" />
                              <span className="text-xs font-bold text-sky-300">{campaign.open_count ?? 0} Opens</span>
                            </div>
                            <div className="flex items-center gap-1.5 bg-violet-500/10 border border-violet-500/20 rounded-lg px-3 py-1.5">
                              <MousePointerClick size={12} className="text-violet-400" />
                              <span className="text-xs font-bold text-violet-300">{campaign.click_count ?? 0} Clicks</span>
                            </div>
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-3 border-t border-white/10">
                          <div className="text-xs text-white/40">
                            {campaign.status === 'sent'
                              ? `Sent: ${new Date(campaign.sent_at).toLocaleString()}`
                              : `Saved: ${new Date(campaign.created_at).toLocaleString()}`}
                          </div>
                          {campaign.status === 'draft' && (
                            <div className="flex gap-2">
                              <button
                                onClick={() => handlePreviewCampaign(campaign.id)}
                                disabled={isPreviewing || isSending}
                                className="bg-transparent border border-[#22c8e5] text-[#22c8e5] px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 hover:bg-[#22c8e5]/10 transition-colors disabled:opacity-50"
                              >
                                {isPreviewing ? <Loader2 size={13} className="animate-spin" /> : <Mail size={13} />}
                                Preview
                              </button>
                              <button
                                onClick={() => loadDraftForEdit(campaign)}
                                className="border border-white/20 text-white/60 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 hover:bg-white/10 transition-colors"
                              >
                                <Pencil size={13} /> Edit
                              </button>
                              <button
                                onClick={() => setSendConfirmId(campaign.id)}
                                disabled={isSending}
                                className="bg-[#22c8e5] text-[#003258] px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 hover:bg-white transition-colors disabled:opacity-50"
                              >
                                <Send size={13} /> Send
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
