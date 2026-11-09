import { fields, stages, score, recommendation } from './model.mjs';
const esc = value => String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const labels={opportunities:'Opportunities',awards:'Awards',contacts:'Agency contacts',partners:'Partners',tasks:'Outreach tasks'};
const singular={opportunities:'opportunity',awards:'award',contacts:'contact',partners:'partner',tasks:'task'};
const recordLink = r => '/record?id='+encodeURIComponent(r.id);
const money = n => new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:2}).format(n);
const clock = new Intl.DateTimeFormat('en-US',{timeZone:'America/Chicago',dateStyle:'medium',timeStyle:'short'});
const stamp = value => clock.format(new Date(value))+' CT';
const headings = (eyebrow,title,description,action='') => '<header><div><div class="eyebrow">'+esc(eyebrow)+'</div><h1>'+esc(title)+'</h1><p>'+esc(description)+'</p></div>'+action+'</header>';
const button=(href,label)=>'<a class="button" href="'+esc(href)+'">'+esc(label)+'</a>';
const formButton=label=>'<button type="submit">'+esc(label)+'</button>';
const errorBox=error=>error?'<p role="alert" class="error">'+esc(error)+'</p>':'';
function page(body,user,path) {
 const nav=[['/','Overview'],...Object.entries(labels).map(([key,label])=>['/'+key,label]),['/activity','Capture history'],...(user?.role==='admin'?[['/import','Import records']]:[])];
 return '<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>EVOBRAND | Capture Desk</title><link rel="stylesheet" href="/style.css"><body>'+
 (user?'<aside><div class="brand"><span>E</span> EVOBRAND<small>GOVCON INTELLIGENCE</small></div><nav aria-label="Workspace">'+nav.map(([href,label])=>'<a href="'+href+'"'+(href===path?' aria-current="page"':'')+'>'+label+'</a>').join('')+'</nav><div class="account"><strong>'+esc(user.role)+'</strong><small>'+esc(user.email)+'</small><form method="post" action="/logout"><button class="secondary">Sign out</button></form></div></aside>':'')+
 '<main class="'+(user?'':'signin')+'">'+body+'</main></body></html>';
}
export function login(error) {
 return page('<section class="panel"><div class="eyebrow">EVOBRAND / GOVCON INTELLIGENCE</div><h1>Capture Desk</h1><p>Sign in to your internal capture workspace.</p>'+errorBox(error)+'<form method="post" action="/login"><label>Email<input required type="email" name="email" autocomplete="username"></label><label>Password<input required type="password" name="password" autocomplete="current-password"></label>'+formButton('Sign in')+'</form></section>');
}
const empty = text => '<p class="empty">'+esc(text)+'</p>';
const panel=(title,content)=>'<section class="panel"><h2>'+esc(title)+'</h2>'+content+'</section>';
const card=(label,value,context)=>'<section class="metric"><small>'+esc(label)+'</small><strong>'+esc(value)+'</strong><p>'+esc(context)+'</p></section>';
const historyList = rows => rows.length?'<ul class="history">'+rows.map(r=>'<li><strong>'+esc(r.action)+'</strong> <a href="'+recordLink({id:r.record_id})+'">'+esc(r.title)+'</a><small>'+esc(r.actor)+' · '+stamp(r.at)+'</small>'+((()=>{const data=JSON.parse(r.snapshot).data;return data.decision && data.decision!=='Pending'?'<p>'+esc(data.decision)+' · '+esc(score(data)??'Unscored')+' / 100<br>'+esc(data.rationale)+'</p>':'';})())+'</li>').join('')+'</ul>':empty('Activity appears here as records are created and updated.');
function dashboard(rows,history,canEdit) {
 const opp=rows.filter(r=>r.kind==='opportunities');
 const active=opp.filter(r=>['Research','Qualifying','Pursuit','Submitted'].includes(r.data.stage));
 const valued=active.filter(r=>r.data.estimate!==undefined);
 const tasks=rows.filter(r=>r.kind==='tasks');
 const today=new Intl.DateTimeFormat('en-CA',{timeZone:'America/Chicago',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
 const alerts=rows.flatMap(r=>{
  const date=r.kind==='opportunities'&&active.includes(r)?r.data.deadline:r.kind==='awards'?r.data.expiration:r.kind==='tasks'&&r.data.status!=='Done'?r.data.due:null;
  if(!date)return [];
  const days=date.length===10?(Date.parse(date)-Date.parse(today))/86400000:Math.ceil((Date.parse(date)-Date.now())/86400000);
  const overdue=date.length===10?days<0:Date.parse(date)<Date.now();
  return days<=(r.kind==='awards'?90:30)?[{r,date,days,overdue}]:[];
 }).sort((a,b)=>a.days-b.days);
 const alertList=alerts.length?'<ul class="history">'+alerts.map(({r,date,overdue})=>'<li><a href="'+recordLink(r)+'">'+esc(r.title)+'</a><small>'+esc(labels[r.kind])+' · '+(date.length===10?esc(date):stamp(date))+(overdue?' · Past due':'')+'</small></li>').join('')+'</ul>':empty('Upcoming dates appear here once you add deadlines, contract end dates or outreach tasks.');
 return '<section class="hero">'+headings('Capture operations / Executive overview','GovCon Intelligence','Track federal demand, teaming and capture decisions in one workspace.',canEdit?button('/new?kind=opportunities','+ Add opportunity'):'')+'<div class="plan">90-DAY CAPTURE WINDOW <b>Nov 9, 2026 – Feb 6, 2027</b></div></section>'+
 '<div class="metrics">'+card('Active opportunities',active.length,'Research through submitted')+card('Estimated EVOBRAND share',valued.length?money(valued.reduce((n,r)=>n+r.data.estimate,0)):'—',valued.length+' of '+active.length+' active pursuits valued')+card('Open outreach tasks',tasks.filter(r=>r.data.status==='Open').length,tasks.filter(r=>r.data.status==='Done').length+' completed')+card('Awards on file',rows.filter(r=>r.kind==='awards').length,'Historical contract intelligence')+'</div>'+
 '<div class="grid">'+panel('Pipeline stages','<ul class="stages">'+stages.map(stage=>{const count=opp.filter(r=>r.data.stage===stage).length;return '<li><span>'+esc(stage)+'</span><meter min="0" max="'+Math.max(1,opp.length)+'" value="'+count+'">'+count+'</meter><b>'+count+'</b></li>';}).join('')+'</ul>')+
 panel('Deadline & expiration watch','<p class="muted">30 days for responses and outreach · 90 days for award end dates</p>'+alertList)+
 panel('90-day capture scorecard','<dl><dt>Prime / subcontract active</dt><dd>'+active.filter(r=>r.data.track==='Prime').length+' / '+active.filter(r=>r.data.track==='Subcontract').length+'</dd><dt>Submitted or decided after submission</dt><dd>'+opp.filter(r=>['Submitted','Won','Lost'].includes(r.data.stage)).length+'</dd><dt>Bid / conditional / no-bid</dt><dd>'+['Bid','Conditional','No-bid'].map(d=>opp.filter(r=>r.data.decision===d).length).join(' / ')+'</dd></dl><p class="muted">Counts reflect current workspace records. The plan targets a 40/60 prime-to-teaming effort split.</p>')+
 panel('Recent capture activity',historyList(history.slice(0,6)))+'</div>';
}
function edit(kind,r,rows) {
 const d=r?.data||{};
 function input(key,label,value='',options) {
  const name=esc(key);
  let control='<input name="'+name+'" value="'+esc(value)+'"'+(key==='title'?' required maxlength="180"':'')+'>';
  if(options) control='<select name="'+name+'"><option value="">Select…</option>'+options.map(([v,l])=>'<option value="'+esc(v)+'"'+(v===value?' selected':'')+'>'+esc(l)+'</option>').join('')+'</select>';
  if(['notes','rationale','workshare'].includes(key)) control='<textarea name="'+name+'" rows="3">'+esc(value)+'</textarea>';
  return '<label>'+esc(label)+control+'</label>';
 }
 return '<form class="record-form" method="post" action="/save"><input type="hidden" name="kind" value="'+kind+'">'+(r?'<input type="hidden" name="id" value="'+esc(r.id)+'"><input type="hidden" name="version" value="'+esc(r.updated)+'">':'')+
 input('title','Name / title',r?.title)+input('source','Source URL',r?.source)+input('externalId','External reference ID',r?.external_id)+
 (kind==='tasks'?input('parent','Related record',r?.parent,rows.filter(x=>x.kind!=='tasks').map(x=>[x.id,x.title])):'')+
 Object.entries(fields[kind]).map(([key,label])=>input(key,Array.isArray(label)?key[0].toUpperCase()+key.slice(1):label,d[key],Array.isArray(label)?label.map(x=>[x,x]):key==='partner'?rows.filter(x=>x.kind==='partners').map(x=>[x.id,x.title]):undefined)).join('')+
 '<div>'+formButton('Save '+singular[kind])+'</div></form>';
}
function detail(r,rows,history,canEdit) {
 const d=r.data;
 const properties=Object.entries(d).map(([k,v])=>{
  const label=fields[r.kind][k];
  if(k==='partner') v=rows.find(x=>x.id===v)?.title??v;
  if(k==='deadline') v=stamp(v);
  if(['estimate','awardValue'].includes(k)) v=money(v);
  return '<dt>'+esc(Array.isArray(label)?k:label??k)+'</dt><dd>'+esc(v)+'</dd>';
 }).join('');
 return headings(labels[r.kind],r.title,'Created '+stamp(r.created)+' · Updated '+stamp(r.updated),button('/'+r.kind,'Back to '+labels[r.kind].toLowerCase()))+
 (r.kind==='opportunities'?'<div class="metrics two">'+card('Qualification score',score(d)===null?'—':score(d)+' / 100',recommendation(d))+card('Recorded decision',d.decision||'Pending',d.stage||'Research')+'</div>':'')+
 '<div class="grid">'+panel('Record details',(r.source?'<p><a rel="noreferrer" href="'+esc(r.source)+'">Open source record ↗</a></p>':'')+(r.external_id?'<p>Reference '+esc(r.external_id)+'</p>':'')+(r.parent?'<p><a href="'+recordLink({id:r.parent})+'">Open related record</a></p>':'')+'<dl>'+properties+'</dl>')+
 panel('Capture history',historyList(history.filter(h=>h.record_id===r.id)))+
 (r.kind==='tasks'?'':panel('Linked outreach',list(rows.filter(x=>x.parent===r.id))))+'</div>'+
 (canEdit?panel('Edit '+singular[r.kind],edit(r.kind,r,rows)):'');
}
function list(rows) {
 return rows.length?'<div class="table"><table><thead><tr><th>Record</th><th>Status / organization</th><th>Updated</th></tr></thead><tbody>'+rows.map(r=>'<tr><td><a href="'+recordLink(r)+'">'+esc(r.title)+'</a><small>'+esc(r.data.type??r.data.position??r.data.incumbent??'')+'</small></td><td>'+esc(r.data.stage??r.data.status??r.data.agency??'—')+'</td><td>'+stamp(r.updated)+'</td></tr>').join('')+'</tbody></table></div>':empty('No records to show.');
}
export function render(url,user,rows,history,error) {
 if(!user)return login(error);
 const path=url.pathname, kind=path.slice(1), canEdit=user.role!=='viewer';
 let content;
 if(error) content=headings('Capture Desk','Unable to save','Go back to revise your entry.')+errorBox(error)+button('/','Return to overview');
 else if(path==='/') content=dashboard(rows,history,canEdit);
 else if(Object.hasOwn(labels,kind)){
  const q=(url.searchParams.get('q')||'').trim().toLowerCase();
  content=headings('Capture workspace',labels[kind],'Browse and search your capture records.',canEdit?button('/new?kind='+kind,'+ Add '+singular[kind]):'')+
  panel(labels[kind],'<form class="search"><label>Search records<input name="q" value="'+esc(q)+'"></label>'+formButton('Search')+'</form>'+list(rows.filter(r=>r.kind===kind&&[r.title,r.external_id,r.data.agency,r.data.incumbent,r.data.type].some(v=>String(v??'').toLowerCase().includes(q)))));
 } else if(path==='/record'){
  const r=rows.find(x=>x.id===url.searchParams.get('id'));
  if(r) content=detail(r,rows,history,canEdit);
 } else if(path==='/new' && canEdit){
  const target=url.searchParams.get('kind');
  if(Object.hasOwn(labels,target)) content=headings('Capture workspace','Add '+singular[target],'Record your source and capture context.')+panel('New record',edit(target,null,rows));
 } else if(path==='/activity') content=headings('Audit trail','Capture history','Changes and bid decisions, with actor and timestamp.')+panel('Activity log',historyList(history));
 else if(path==='/import' && user.role==='admin') content=headings('Data intake','Import records','Paste a JSON array of 1–250 records. The batch commits only when every row is valid.')+
 panel('Import batch',(url.searchParams.has('count')?'<p role="status">Imported '+esc(url.searchParams.get('count'))+' records.</p>':'')+'<form method="post" action="/import"><label>JSON records<textarea name="rows" rows="10" required placeholder=\'[{"kind":"partners","title":"Partner organization","status":"Prospective"}]\'></textarea></label>'+formButton('Validate and import')+'</form>');
 return content?page(content,user,path):null;
}
