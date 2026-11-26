export function visibleText(value = '') {
  return String(value).replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, '').replace(/<[^>]+>/g, ' ').replace(/&nbsp;/gi, ' ').replace(/&amp;/gi, '&').replace(/&quot;/gi, '"').replace(/&#39;|&apos;/gi, "'").replace(/&#(x[0-9a-f]+|\d+);/gi, (_, n) => { const code = n[0].toLowerCase() === 'x' ? parseInt(n.slice(1),16) : Number(n); return code <= 0x10ffff ? String.fromCodePoint(code) : ''; }).replace(/\s+/g, ' ').trim();
}
export const validLink = value => {
  try { const u = new URL(value); return ['https:','http:'].includes(u.protocol) ? !!u.hostname : ['mailto:','tel:'].includes(u.protocol) && !!u.pathname; } catch { return false; }
};
export function analyzeCopy(subject, blocks) {
  const fields = [{location:'Subject',text:visibleText(subject)}];
  blocks.forEach((b,i) => {
    for (const key of ['text','content','title','label','cta','linkLabel']) {
      if (b[key]) fields.push({location:`Block ${i+1} (${b.type}), ${key}`,text:visibleText(b[key])});
    }
  });
  const findings = [];
  for (const {text,location} of fields) {
    // Only a whole approved sentence is recognized; surrounding sales copy is still checked.
    const approved = /\bwe automate the mundane to free the human spirit\.?/ig;
    const safeRanges = [...text.matchAll(approved)].map(m=>[m.index,m.index+m[0].length]);
    const tokens = [...text.matchAll(/\b(?:free|act now|urgent|guarantee(?:d)?|winner|click here|risk[- ]free|100% guaranteed)\b|!{2,}/ig)];
    for (const m of tokens) {
      if (safeRanges.some(([a,b])=>m.index>=a && m.index<b)) continue;
      const begin = Math.max(text.lastIndexOf('.',m.index-1),text.lastIndexOf('?',m.index-1),text.lastIndexOf('!',m.index-1))+1;
      const rest = text.slice(m.index+m[0].length).search(/[.!?]/);
      const end = rest<0 ? text.length : m.index+m[0].length+rest+1;
      const sentence=text.slice(begin,end).trim();
      const commercial=/\b(buy|offer|claim|prize|cash|money|discount|sale|deal|limited|win|reward|profit|purchase)\b/i.test(sentence);
      const pressure=/\b(act now|urgent|today only|last chance|expires|guaranteed)\b|!{2,}/i.test(sentence);
      const suspicious = (commercial && (pressure || /\b(free|winner|guarantee)/i.test(m[0]))) || /\b(?:guaranteed (?:profit|income|returns)|risk[- ]free (?:investment|profit))\b/i.test(sentence);
      if (!suspicious) continue;
      findings.push({word:m[0],location,start:m.index+1,end:m.index+m[0].length,excerpt:sentence.slice(0,240),reason:'Promotional language combined with urgency, a giveaway, or an absolute claim.',recommendation:'Use specific, supportable terms and remove unnecessary pressure. Keep legitimate context.'});
    }
  }
  return findings;
}
export function getReadinessChecks({subject='',blocks=[],listCount=0,purpose='newsletter',technical=null}) {
  const checks=[];
  const add=(id,ok,severity,label,recommendation,details=[])=>checks.push({id,status:ok?'pass':'fail',severity,label,recommendation:ok?'':recommendation,details});
  const copy=blocks.map(b=>visibleText(b.text || b.content || b.title || b.label || '')).join(' ').trim();
  add('subject',!!subject.trim(),'critical','Subject line is present','Add a subject before sending.');
  add('length',subject.trim().length>=25 && subject.trim().length<=65,'advisory',`Subject length: ${subject.trim().length} characters`,'Consider 25–65 characters so the subject is easier to scan; shorter or longer subjects can still be appropriate.');
  add('body',!!copy || blocks.some(b=>b.type==='image'&&b.src || b.type==='video'&&b.videoId),'critical','Email has visible content','Add text, an image, or a processed video. Spacers and dividers alone are not content.');
  add('lists',listCount>0,'critical','At least one audience list is selected','Choose a list. The sender also checks for active subscribed recipients.');
  const actions=blocks.filter(b=> (b.type==='button'&&validLink(b.url)) || (b.type==='image'&&b.src&&validLink(b.linkUrl)) || (b.type==='video'&&b.videoId&&validLink(b.landingUrl)) || (b.type==='event'&&validLink(b.linkUrl)) || (b.type==='text'&&[...String(b.content||'').matchAll(/href\s*=\s*["']([^"']+)["']/gi)].some(m=>validLink(m[1]))));
  add('cta',purpose!=='promotion'||actions.length>0,'advisory',purpose==='promotion'?`${actions.length} clickable call${actions.length===1?'':'s'} to action`:'CTA optional for this newsletter or greeting','Add a button, linked image, linked video preview, or descriptive text link for a promotional campaign.');
  const images=blocks.map((b,i)=>({b,i})).filter(({b})=>['image','video'].includes(b.type));
  const missingAlt=images.filter(({b})=>!String(b.alt||'').trim() && !(b.type==='video'&&String(b.title||'').trim()));
  add('alt',!missingAlt.length,'advisory','Images have descriptive alt text','Describe the image or video so readers understand it with images disabled.',missingAlt.map(({i})=>`Block ${i+1}: add alt text.`));
  const missingMedia=images.filter(({b})=>b.type==='image'?!b.src:!b.videoId||!b.posterUrl||!b.gifUrl);
  add('media',!missingMedia.length,'critical','Media sources are present','Add an image URL or select a ready video. The sender checks saved video availability.',missingMedia.map(({i})=>`Block ${i+1}: missing media source.`));
  const broken=[];
  blocks.forEach((b,i)=>{
    const keys=b.type==='button'?['url']:b.type==='image'?['src','linkUrl']:b.type==='video'?['landingUrl','posterUrl','gifUrl']:b.type==='event'?['linkUrl']:[];
    for(const key of keys) if((b[key] || key==='url') && (!validLink(b[key]) || ['src','posterUrl','gifUrl'].includes(key) && !/^https?:/i.test(b[key])))broken.push(`Block ${i+1}, ${key}: ${b[key] || '(empty)'}`);
    if(b.type==='text')for(const m of String(b.content||'').matchAll(/href\s*=\s*["']([^"']*)["']/gi))if(!validLink(m[1]))broken.push(`Block ${i+1}, text link: ${m[1] || '(empty)'}`);
  });
  add('urls',!broken.length,'critical','Link and image URLs are valid','Use a complete HTTPS URL, or a valid mailto/tel link. Replace empty or placeholder links.',broken);
  const findings=analyzeCopy(subject,blocks);
  add('copy',!findings.length,'advisory',findings.length?`${findings.length} contextual copy recommendation${findings.length===1?'':'s'}`:'No contextual copy concerns detected','Review the highlighted phrases in context; these are recommendations, not a spam verdict.',findings);
  if(technical)checks.push(...technical);
  else checks.push({id:'technical',status:'unknown',severity:'advisory',label:'Sender, unsubscribe, plain text and DNS checks pending',recommendation:'Wait for the technical checks, or use Recheck technical setup.'});
  const assessed=checks.filter(c=>c.status==='pass'||c.status==='fail');
  const weight=c=>c.severity==='critical'?5:1;
  const total=assessed.reduce((n,c)=>n+weight(c),0);
  return {checks,findings,score:total?Math.round(100*assessed.filter(c=>c.status==='pass').reduce((n,c)=>n+weight(c),0)/total):0,critical:checks.filter(c=>c.status==='fail'&&c.severity==='critical').length,unverified:checks.filter(c=>c.status==='unknown').length};
}
// Parse the generated email fragment without executing or loading its content.
export function collectResources(html) {
  const doc=new DOMParser().parseFromString(html,'text/html');
  return [...doc.querySelectorAll('a[href], img[src]')].map((el,i)=>({url:el.getAttribute(el.tagName==='IMG'?'src':'href'),kind:el.tagName==='IMG'?'image':'link',location:`Rendered ${el.tagName==='IMG'?'image':'link'} ${i+1}`,alt:el.tagName==='IMG'?el.getAttribute('alt'):undefined}));
}
