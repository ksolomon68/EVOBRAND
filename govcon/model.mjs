export const stages = ['Research','Qualifying','Pursuit','Submitted','Won','Lost','No-bid'];
export const criteria = {fit:25,experience:20,access:15,team:15,capacity:15,economics:10};
export const offers = ['Operations modernization','Supplier engagement','AI readiness and training','Accessibility and web modernization'];
export const fields = {
 opportunities: {
  agency:'Agency / buying office', type:['Sources sought','RFI','Solicitation','Forecast','Teaming lead'], track:['Prime','Subcontract'], stage:stages,
  offer:offers, deadline:'Response deadline (ISO 8601 with time zone)', owner:'Capture owner', partner:'Teaming partner', workshare:'EVOBRAND work package and proposed roles', share:'EVOBRAND workshare %', estimate:'Estimated EVOBRAND share (USD)',
  eligibility:['Unknown','Pass','Fail'], security:['Unknown','Pass','Fail'], schedule:['Unknown','Pass','Fail'],
  ...Object.fromEntries(Object.entries(criteria).map(([k,w])=>[k,k[0].toUpperCase()+k.slice(1)+' (0–5, weight '+w+'%)'])),
  decision:['Pending','Bid','Conditional','No-bid'], rationale:'Decision rationale / corrective actions', notes:'Capture notes'
 },
 awards:{agency:'Awarding agency', incumbent:'Incumbent', expiration:'Current period end (YYYY-MM-DD)', awardValue:'Reported award amount (USD)', valueBasis:'Amount basis (e.g. obligations)', notes:'Recompete research notes'},
 contacts:{agency:'Agency / organization', position:'Title / role', email:'Business email', notes:'Relationship and outreach notes'},
 partners:{status:['Prospective','Engaged','Teaming','Inactive'], email:'Business email', notes:'Capabilities, roles and relationship notes'},
 tasks:{owner:'Owner', due:'Due date (YYYY-MM-DD)', channel:['Email','Call','Meeting','Research','Response','Proposal','Other'], status:['Open','Done'], notes:'Next action / outcome'}
};
export function score(data) {
 if (Object.keys(criteria).some(k=>data[k]===undefined)) return null;
 return Object.entries(criteria).reduce((total,[key,weight])=>total+data[key]*weight/5,0);
}
export function recommendation(data) {
 if (['eligibility','security','schedule'].some(k=>data[k]==='Fail')) return 'Blocked by mandatory gate';
 if (['eligibility','security','schedule'].some(k=>data[k]!=='Pass')) return 'Verify mandatory gates';
 if (score(data)===null) return 'Complete scorecard';
 return score(data)>=80 ? 'Pursue' : score(data)>=65 ? 'Conditional pursuit' : 'Decline or monitor';
}
export function validate(kind, input, get) {
 if (!Object.hasOwn(fields,kind) || !input || typeof input!=='object') throw Error('Invalid record.');
 const val = key => {
  const value = input[key];
  if (value==null) return '';
  if (!['string','number'].includes(typeof value) || String(value).length>4000) throw Error('Invalid field '+key);
  return String(value).trim();
 };
 const title=val('title'), source=val('source')||null, externalId=val('externalId')||null, parent=val('parent')||null;
 if (!title || title.length>180) throw Error('Enter a title up to 180 characters.');
 if (source && !['https:','http:'].includes(new URL(source).protocol)) throw Error('Use an HTTP(S) source URL.');
 if (externalId && !source) throw Error('A source link is required with an external ID.');
 if (kind==='awards' && !source) throw Error('Awards require a source link.');
 if (parent && (kind!=='tasks' || !['opportunities','contacts','partners','awards'].includes(get(parent)?.kind))) throw Error('Invalid linked record.');
 const data = {};
 for (const [key,label] of Object.entries(fields[kind])) {
  const value = val(key);
  if (!value) continue;
  if (Array.isArray(label) && !label.includes(value)) throw Error('Invalid '+key);
  if (['due','expiration'].includes(key) && (!/^\d{4}-\d{2}-\d{2}$/.test(value) || !Number.isFinite(Date.parse(value)) || new Date(value).toISOString().slice(0,10)!==value)) throw Error('Enter a valid date for '+key);
  if (key==='deadline' && (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?(Z|[+-]\d{2}:\d{2})$/.test(value) || !Number.isFinite(Date.parse(value)) || new Date(value.slice(0,10)).toISOString().slice(0,10)!==value.slice(0,10))) throw Error('Enter a deadline with an explicit time zone.');
  if (Object.hasOwn(criteria,key) || ['estimate','share','awardValue'].includes(key)) {
   const n=Number(value);
   const max=Object.hasOwn(criteria,key)?5:key==='share'?100:1e12;
   if (!/^\d+(\.\d{1,2})?$/.test(value) || n>max || (Object.hasOwn(criteria,key)&&!Number.isInteger(n))) throw Error('Invalid number for '+key);
   data[key]=n;
  } else data[key]=value;
 }
 if (kind==='opportunities') {
  data.stage ??= 'Research';
  data.decision ??= 'Pending';
  if (data.partner && get(data.partner)?.kind!=='partners') throw Error('Select a valid partner.');
  if (['Sources sought','RFI','Solicitation'].includes(data.type) && !source) throw Error('Published notices require a source link.');
  if (data.decision!=='Pending' && !data.rationale) throw Error('Document the decision rationale.');
  if (data.decision==='Bid' && (['eligibility','security','schedule'].some(k=>data[k]!=='Pass') || score(data)===null || score(data)<80 || !data.owner || !data.deadline || Date.parse(data.deadline)<=Date.now())) throw Error('Bid requires a named owner, future deadline, passing gates and a score of 80 or more.');
  if (data.decision==='Conditional' && (['eligibility','security','schedule'].some(k=>data[k]==='Fail') || score(data)===null || score(data)<65)) throw Error('Conditional pursuit requires at least 65 and no failed gate.');
  if (data.decision==='No-bid') data.stage='No-bid';
  if (data.stage==='No-bid' && data.decision!=='No-bid') throw Error('Record a no-bid decision and rationale.');
 }
 if (kind==='awards' && data.awardValue!==undefined && !data.valueBasis) throw Error('Enter the basis for the reported award amount.');
 if (kind==='tasks') data.status ??= 'Open';
 return {kind,title,source,externalId,parent,data};
}
