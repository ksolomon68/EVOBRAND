import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowLeft, Plus, RefreshCw, Search, Mail, CheckCircle2, Clock } from 'lucide-react';
import { formatCST } from '../../lib/datetime';

const API = ['localhost', '127.0.0.1'].includes(window.location.hostname) ? 'http://localhost:5000/api/sales' : `${window.location.origin}/api/sales`;
const CLOSED = ['won', 'lost'];
const SOURCES = { manual: 'Added manually', brand_audit: 'Brand audit', accessibility_audit: 'Accessibility check', inquiry: 'Website inquiry', booking: 'Consultation booking', contract: 'Signed contract' };
const inputClass = 'w-full rounded-lg border border-white/20 bg-[#0b1727] px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-400';
const buttonClass = 'inline-flex items-center justify-center gap-2 rounded-lg border border-white/20 px-3 py-2 text-sm font-medium text-white hover:bg-white/10 disabled:opacity-50 disabled:cursor-wait';
const money = value => Number(value || 0).toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 });
const todayCT = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Chicago', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
const due = lead => !CLOSED.includes(lead.stage) && lead.follow_up_date && lead.follow_up_date.slice(0, 10) <= todayCT();
const blank = { name: '', email: '', company: '', phone: '', value: '0', stage: 'new', next_action: '', follow_up_date: '' };

async function request(path = '', options = {}) {
  const response = await fetch(`${API}${path}`, {
    ...options,
    headers: { Authorization: `Bearer ${localStorage.getItem('evobrand_token')}`, 'Content-Type': 'application/json' },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || `Unable to load sales information (${response.status})`);
  return data;
}

function LeadForm({ initial, stages, creating, busy, onSave, onCancel }) {
  const [fields, setFields] = useState(() => ({ ...blank, ...initial, follow_up_date: initial?.follow_up_date?.slice(0, 10) || '' }));
  const closed = CLOSED.includes(fields.stage);
  const set = (key, value) => setFields(old => ({ ...old, [key]: value }));
  function submit(event) {
    event.preventDefault();
    const values = { ...fields, follow_up_date: closed ? null : fields.follow_up_date || null, next_action: closed ? '' : fields.next_action };
    // Only editable fields are sent; source IDs and server timestamps stay on the server.
    const body = Object.fromEntries(Object.keys(blank).filter(key => creating || key !== 'email').map(key => [key, values[key]]));
    onSave(body);
  }
  return <form onSubmit={submit} className="space-y-4">
    <div className="grid gap-4 sm:grid-cols-2">
      <label className="text-sm text-slate-300">Contact name<input autoFocus className={inputClass} value={fields.name} maxLength={255} onChange={e => set('name', e.target.value)} /></label>
      <label className="text-sm text-slate-300">Email<input required type="email" disabled={!creating} className={inputClass} value={fields.email} maxLength={255} onChange={e => set('email', e.target.value)} /></label>
      <label className="text-sm text-slate-300">Company<input className={inputClass} value={fields.company} maxLength={255} onChange={e => set('company', e.target.value)} /></label>
      <label className="text-sm text-slate-300">Phone<input type="tel" className={inputClass} value={fields.phone} maxLength={50} onChange={e => set('phone', e.target.value)} /></label>
      <label className="text-sm text-slate-300">Sales stage<select aria-label="Sales stage" className={inputClass} value={fields.stage} onChange={e => set('stage', e.target.value)}>{stages.map(stage => <option key={stage.id} value={stage.id}>{stage.label}</option>)}</select></label>
      <label className="text-sm text-slate-300">Deal value (USD)<input type="number" min="0" max="9999999999.99" step="0.01" required className={inputClass} value={fields.value} onChange={e => set('value', e.target.value)} /></label>
      <label className="text-sm text-slate-300">Next action<input disabled={closed} className={inputClass} value={closed ? '' : fields.next_action} maxLength={500} onChange={e => set('next_action', e.target.value)} /></label>
      <label className="text-sm text-slate-300">Follow-up date (Central time)<input type="date" disabled={closed} className={inputClass} value={closed ? '' : fields.follow_up_date} onChange={e => set('follow_up_date', e.target.value)} /></label>
    </div>
    {closed && <p className="text-sm text-slate-400">Closing a lead clears its next action and reminder. You can reopen it by choosing an active stage.</p>}
    <div className="flex gap-2"><button disabled={busy} className={`${buttonClass} bg-cyan-500/20`} type="submit">{busy ? 'Saving…' : creating ? 'Add lead' : 'Save changes'}</button><button disabled={busy} className={buttonClass} type="button" onClick={onCancel}>Cancel</button></div>
  </form>;
}

function EmailDraft({ lead, templates }) {
  const [selected, setSelected] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [message, setMessage] = useState('');
  function choose(id) {
    setSelected(id); setMessage('');
    const template = templates.find(item => item.id === id);
    if (!template) { setSubject(''); setBody(''); return; }
    const values = { name: lead.name || 'there', company: lead.company || 'your business', booking_url: `${window.location.origin}/book-consultation` };
    const fill = value => value.replace(/\{\{(\w+)\}\}/g, (_, key) => values[key] || '');
    setSubject(fill(template.subject)); setBody(fill(template.body));
  }
  return <section className="rounded-xl border border-white/10 bg-white/[0.03] p-5 space-y-3">
    <h3 className="font-semibold text-white flex items-center gap-2"><Mail size={17} /> Email templates</h3>
    <p className="text-sm text-slate-400">Review and personalize a draft before opening it in your email app. Opening a draft does not send or log an email.</p>
    <label className="block text-sm text-slate-300">Template<select aria-label="Template" className={inputClass} value={selected} onChange={e => choose(e.target.value)}><option value="">Choose a template</option>{templates.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
    {selected && <>
      <label className="block text-sm text-slate-300">Subject<input className={inputClass} value={subject} onChange={e => setSubject(e.target.value)} /></label>
      <label className="block text-sm text-slate-300">Message<textarea aria-label="Message" className={inputClass} rows={12} value={body} onChange={e => setBody(e.target.value)} /></label>
      <div className="flex flex-wrap gap-2">
        <a className={buttonClass} href={`mailto:${encodeURIComponent(lead.email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`}>Open email draft</a>
        <button className={buttonClass} onClick={async () => { try { await navigator.clipboard.writeText(`Subject: ${subject}\n\n${body}`); setMessage('Draft copied.'); } catch { setMessage('Copy unavailable. Select and copy the message above.'); } }}>Copy draft</button>
      </div><p role="status" className="text-sm text-cyan-300">{message}</p>
    </>}
  </section>;
}

export default function AdminSalesPanel() {
  const [data, setData] = useState({ leads: [], stages: [], templates: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [search, setSearch] = useState('');
  const [onlyDue, setOnlyDue] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [detail, setDetail] = useState(null);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState('');
  const selection = useRef(0);
  const detailHeading = useRef(null);

  const load = useCallback(async () => {
    setLoading(true);
    try { setData(await request()); }
    catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    const version = ++selection.current;
    setDetail(null); setEditing(false); setNote('');
    if (!selectedId) return;
    request(`/${selectedId}`).then(value => { if (version === selection.current) { setDetail(value); detailHeading.current?.focus(); } }).catch(err => { if (version === selection.current) setError(err.message); });
    return () => { selection.current++; };
  }, [selectedId]);

  async function mutate(work, success) {
    setBusy(true); setError(''); setMessage('');
    try {
      const saved = await work();
      // Refresh both the board and the timeline only after a confirmed save.
      setData(await request());
      if (selectedId) setDetail(await request(`/${selectedId}`));
      setCreating(false); setEditing(false); setNote(''); setMessage(success);
      return saved;
    } catch (err) { setError(err.message); return null; }
    finally { setBusy(false); }
  }
  const openLeads = data.leads.filter(lead => !CLOSED.includes(lead.stage));
  const dueLeads = openLeads.filter(due);
  const filtered = data.leads.filter(lead => (!onlyDue || due(lead)) && `${lead.name} ${lead.email} ${lead.company}`.toLowerCase().includes(search.toLowerCase()));
  const lead = detail?.lead;
  return <div className="space-y-6">
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div><h1 ref={detailHeading} tabIndex={-1} className="text-3xl font-bold text-white">Sales pipeline</h1><p className="mt-1 text-sm text-slate-400">From audit to client. Bookings and signed service agreements advance active leads automatically.</p></div>
      <div className="flex gap-2"><button disabled={busy || loading} className={buttonClass} onClick={() => { setError(''); load(); }}><RefreshCw size={15} />Refresh board</button><button disabled={busy || loading} className={buttonClass} onClick={() => { setSelectedId(null); setCreating(true); setError(''); setMessage(''); }}><Plus size={15} />Add lead</button></div>
    </div>
    {error && <p role="alert" className="rounded-lg border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-200">{error}</p>}
    {message && <p role="status" className="text-sm text-cyan-300">{message}</p>}
    {creating ? <section className="rounded-xl border border-white/10 p-5"><h2 className="text-xl font-semibold text-white mb-4">Add a sales contact</h2><LeadForm stages={data.stages} creating busy={busy} onCancel={() => setCreating(false)} onSave={values => mutate(() => request('', { method: 'POST', body: JSON.stringify(values) }), 'Lead added.')} /></section>
      : selectedId ? <>
        <button className={buttonClass} disabled={busy} onClick={() => { setSelectedId(null); setError(''); setMessage(''); }}><ArrowLeft size={15} />Back to board</button>
        {!lead ? <p role="status" className="text-slate-300">{error ? 'Contact could not be loaded. Return to the board and try again.' : 'Loading contact…'}</p> : <div className="grid gap-5 xl:grid-cols-2">
          <div className="space-y-5">
            <section className="rounded-xl border border-white/10 bg-white/[0.03] p-5 space-y-4">
              <div className="flex items-start justify-between gap-3"><div><h2 className="text-xl font-semibold text-white">{lead.name || lead.email}</h2><p className="text-slate-300 break-all">{lead.email}</p><p className="text-sm text-slate-400">{lead.company} {lead.phone && `· ${lead.phone}`}</p></div><button className={buttonClass} disabled={busy} onClick={() => setEditing(!editing)}>{editing ? 'Close editor' : 'Edit contact'}</button></div>
              <p className="text-sm text-slate-400">{SOURCES[lead.source] || lead.source} · {data.stages.find(stage => stage.id === lead.stage)?.label} · {money(lead.value)}</p>
              {editing ? <LeadForm key={lead.id} initial={lead} stages={data.stages} busy={busy} onCancel={() => setEditing(false)} onSave={values => mutate(() => request(`/${lead.id}`, { method: 'PATCH', body: JSON.stringify(values) }), 'Contact saved.')} /> : <>
                <label className="block text-sm text-slate-300">Move to stage<select aria-label="Move to stage" disabled={busy} className={inputClass} value={lead.stage} onChange={e => mutate(() => request(`/${lead.id}`, { method: 'PATCH', body: JSON.stringify({ stage: e.target.value }) }), 'Sales stage updated.')} >{data.stages.map(stage => <option key={stage.id} value={stage.id}>{stage.label}</option>)}</select></label>
                <p className={due(lead) ? 'text-amber-300 text-sm' : 'text-slate-300 text-sm'}><Clock size={14} className="inline mr-2" />{lead.follow_up_date ? `Follow up ${lead.follow_up_date.slice(0, 10)} (Central time)${due(lead) ? ' · Due' : ''}` : 'No reminder scheduled'}</p>
                {lead.next_action && <p className="text-sm text-white">Next: {lead.next_action}</p>}
              </>}
            </section>
            <section className="rounded-xl border border-white/10 bg-white/[0.03] p-5 space-y-3">
              <h3 className="font-semibold text-white">Notes & follow-up</h3>
              <label className="block text-sm text-slate-300">Activity note<textarea aria-label="Activity note" className={inputClass} rows={3} maxLength={5000} value={note} onChange={e => setNote(e.target.value)} placeholder="Record a conversation, next step, or completed follow-up." /></label>
              <div className="flex flex-wrap gap-2"><button disabled={busy || !note.trim()} className={buttonClass} onClick={() => mutate(() => request(`/${lead.id}/activities`, { method: 'POST', body: JSON.stringify({ kind: 'note', description: note }) }), 'Note added.')} >Add note</button><button disabled={busy || !note.trim() || CLOSED.includes(lead.stage)} className={buttonClass} onClick={() => mutate(() => request(`/${lead.id}/activities`, { method: 'POST', body: JSON.stringify({ kind: 'follow_up', description: note }) }), 'Follow-up logged and reminder cleared.')}><CheckCircle2 size={15} />Complete follow-up</button></div>
              <p className="text-xs text-slate-400">Completing a follow-up logs your note and clears the current reminder. Edit the contact to schedule the next one.</p>
            </section>
            <EmailDraft key={lead.id} lead={lead} templates={data.templates} />
          </div>
          <section className="rounded-xl border border-white/10 bg-white/[0.03] p-5"><h3 className="font-semibold text-white mb-2">Contact history</h3><p className="text-xs text-slate-400 mb-5">Matched by email: audits, inquiries, meetings, contracts, projects, and sales activity. Source entries show their current status.</p>
            {!detail.activities.length ? <p className="text-sm text-slate-400">No activity yet.</p> : <ol className="space-y-5">{detail.activities.map(activity => <li key={activity.id} className="border-l-2 border-cyan-400/30 pl-4"><p className="text-xs text-cyan-300 uppercase tracking-wide">{activity.kind.replace('_', ' ')} · {formatCST(activity.created_at)}</p><p className="text-sm text-white whitespace-pre-wrap break-words mt-1">{activity.description}</p>{activity.actor && <p className="text-xs text-slate-400 mt-1">By {activity.actor}</p>}</li>)}</ol>}
          </section>
        </div>}
      </> : <>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">{[['Open leads', openLeads.length], ['Open pipeline value', money(openLeads.reduce((sum, item) => sum + Number(item.value), 0))], ['Follow-ups due', dueLeads.length]].map(([label, value]) => <div key={label} className="rounded-xl border border-white/10 p-4"><p className="text-sm text-slate-400">{label}</p><p className="text-2xl text-white font-semibold mt-1">{loading ? '…' : value}</p></div>)}</div>
        <div className="flex flex-wrap gap-3 items-center"><label className="flex items-center gap-2 flex-1 min-w-[220px]"><Search size={17} className="text-slate-400" /><span className="sr-only">Search contacts</span><input className={inputClass} placeholder="Search name, company, or email" value={search} onChange={e => setSearch(e.target.value)} /></label><label className="text-sm text-slate-300 flex gap-2 items-center"><input type="checkbox" checked={onlyDue} onChange={e => setOnlyDue(e.target.checked)} />Due follow-ups only</label></div>
        {loading ? <p role="status" className="text-slate-300">Loading pipeline…</p> : <>
          {!data.leads.length && <p className="rounded-xl border border-dashed border-white/20 p-5 text-slate-300">Your pipeline is empty. Add a lead, or new audit and inquiry submissions will appear here. Existing audits are imported when the API starts.</p>}
          {!!data.leads.length && !filtered.length && <p className="text-slate-300">No leads match these filters.</p>}
          <div className="grid gap-3 md:grid-cols-2 2xl:grid-cols-3">{data.stages.map(stage => {
            const leads = filtered.filter(item => item.stage === stage.id);
            return <section key={stage.id} className="rounded-xl border border-white/10 bg-white/[0.02] p-3 min-w-0"><div className="flex justify-between items-center mb-3"><h2 className="font-semibold text-white">{stage.label} <span className="text-slate-400 text-xs">({leads.length})</span></h2><span className="text-xs text-slate-400">{money(leads.reduce((sum, item) => sum + Number(item.value), 0))}</span></div><div className="space-y-2">{leads.map(item => <button key={item.id} onClick={() => { setSelectedId(item.id); setError(''); setMessage(''); }} className="w-full text-left rounded-lg border border-white/10 bg-[#0b1727] hover:border-cyan-400/60 p-3 focus-visible:outline-cyan-400"><p className="text-white font-medium truncate">{item.company || item.name || item.email}</p><p className="text-sm text-slate-400 truncate">{item.name ? `${item.name} · ` : ''}{item.email}</p><div className="flex justify-between gap-2 mt-3 text-xs"><span className="text-cyan-300">{money(item.value)}</span><span className={due(item) ? 'text-amber-300' : 'text-slate-400'}>{item.follow_up_date ? `${due(item) ? 'Due · ' : ''}${item.follow_up_date.slice(0, 10)}` : SOURCES[item.source]}</span></div>{item.next_action && <p className="text-xs text-slate-300 mt-2 truncate">{item.next_action}</p>}</button>)}{!leads.length && <p className="text-xs text-slate-500 py-4 text-center">No leads in this stage</p>}</div></section>;
          })}</div>
        </>}
      </>}
  </div>;
}
