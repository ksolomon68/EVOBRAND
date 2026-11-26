const {test}=require('node:test');
const assert=require('node:assert/strict');
const {htmlToText,campaignMessage}=require('./message');
const {publicIP,safeURL,probe}=require('./network');
const {authenticationChecks}=require('./dns');
test('brand tagline, ordinary urgency and free in prose do not trigger spam penalties',async()=>{
  const {analyzeCopy}=await import('../../../web/src/components/admin/campaignReadiness.js');
  assert.deepEqual(analyzeCopy('A Thanksgiving message',[{type:'text',content:'We automate the mundane to <strong>free</strong> the human spirit.'}]),[]);
  assert.deepEqual(analyzeCopy('Urgent service update',[{type:'text',content:'Feel free to contact our support team.'}]),[]);
  assert.deepEqual(analyzeCopy('Our update',[{type:'image',src:'https://example.com/free-winner.jpg',alt:'',id:'free-urgent'}]),[]);
});
test('contextual findings show exact matches, visible-text locations and surrounding copy',async()=>{
  const {analyzeCopy}=await import('../../../web/src/components/admin/campaignReadiness.js');
  const text='Claim your FREE prize. Act now to buy this limited offer!!';
  const findings=analyzeCopy('News',[{type:'text',content:text}]);
  assert(findings.some(f=>f.word==='FREE'&&f.location==='Block 1 (text), content'));
  for(const f of findings){assert.equal(text.slice(f.start-1,f.end),f.word);assert(f.excerpt);assert(f.recommendation);}
  assert(analyzeCopy('News',[{type:'text',content:'We automate the mundane to free the human spirit. Claim FREE cash now!!'}]).length>0);
});
test('linked videos and images are CTAs; holiday greetings do not require one',async()=>{
  const {getReadinessChecks}=await import('../../../web/src/components/admin/campaignReadiness.js');
  const args={subject:'A thoughtful Thanksgiving message',listCount:1,purpose:'promotion'};
  for(const block of [{type:'image',src:'https://example.com/img.jpg',alt:'Play',linkUrl:'https://example.com/watch'},{type:'video',videoId:'1',title:'Film',landingUrl:'https://example.com/watch',posterUrl:'https://example.com/p.jpg',gifUrl:'https://example.com/p.gif'}]){
    assert.equal(getReadinessChecks({...args,blocks:[block]}).checks.find(c=>c.id==='cta').status,'pass');
  }
  assert.equal(getReadinessChecks({...args,purpose:'holiday',blocks:[{type:'text',content:'Thank you.'}]}).checks.find(c=>c.id==='cta').status,'pass');
});
test('critical errors differ from advice and score updates after corrections',async()=>{
  const {getReadinessChecks}=await import('../../../web/src/components/admin/campaignReadiness.js');
  const bad=getReadinessChecks({subject:'',blocks:[{type:'button',label:'Go',url:'javascript:alert(1)'}],listCount:0});
  const good=getReadinessChecks({subject:'A thoughtful Thanksgiving message',blocks:[{type:'button',label:'Go',url:'https://example.com'}],listCount:1});
  assert(bad.critical>=3);assert.equal(good.critical,0);assert(good.score>bad.score);assert(good.unverified>0);
  assert.equal(getReadinessChecks({subject:'Hello',blocks:[{type:'spacer'}],listCount:1}).checks.find(c=>c.id==='body').status,'fail');
});
test('text alternatives retain links, image descriptions and unsubscribe while dropping CSS',()=>{
  const message=campaignMessage('Hello','<p>A &amp; B</p><img src="https://example.com/p.jpg" alt="Watch Bolt"><a href="https://example.com/watch">Watch now</a>',4,'https://evobrand.net','reader@example.com');
  assert(message.text.includes('A & B'));assert(message.text.includes('Watch Bolt'));assert(message.text.includes('unsubscribe?email=reader%40example.com'));assert(!message.text.includes('@import'));
  assert(htmlToText('<style>body{color:red}</style><p>Hello &#128578;</p>').includes('🙂'));
});
test('network checks block internal addresses, credentials, action links and DNS rebinding',async()=>{
  for(const ip of ['127.0.0.1','10.1.2.3','169.254.169.254','172.16.2.1','192.168.1.1','100.64.0.1','::1','fc00::1','::ffff:127.0.0.1','2001:db8::1'])assert(!publicIP(ip),ip);
  assert(publicIP('8.8.8.8'));assert(publicIP('2606:4700:4700::1111'));
  for(const url of ['file:///etc/passwd','https://user:pass@example.com','https://example.com/api/newsletter/unsubscribe?email=x','https://example.com/api/crm/track/click?cid=4','https://example.com/api/videos/watch/abc'])assert.throws(()=>safeURL(url));
  const result=await probe('https://example.com',0,async()=>[{address:'8.8.8.8',family:4},{address:'127.0.0.1',family:4}]);
  assert.equal(result.status,'unknown');assert.match(result.message,/Private/);
});
test('DNS checks report publication separately from unavailable or unconfigured checks',async()=>{
  const records={'example.com':[['v=spf1 include:provider.example -all']], '_dmarc.example.com':[['v=DMARC1; p=none;']], 'mail._domainkey.example.com':[['v=DKIM1; p=','YWJjZA==']]};
  const checks=await authenticationChecks('example.com',{DKIM_SELECTORS:'mail'},async name=>records[name]||[]);
  assert(checks.every(c=>c.status==='pass'));
  const absent=await authenticationChecks('example.com',{},async()=>{throw Object.assign(new Error('timeout'),{code:'ETIMEOUT'});});
  assert(absent.every(c=>c.status==='unknown'));
  const broken=await authenticationChecks('example.com',{DKIM_SELECTORS:'mail'},async()=>[['v=spf1 +all'],['v=spf1 -all']]);
  assert.equal(broken.find(c=>c.id==='spf').status,'fail');
});
test('redirects to private endpoints are never requested and HEAD pins the validated IP',async()=>{
  const https=require('node:https');const {EventEmitter}=require('node:events');const original=https.request;let requests=0;
  https.request=(url,options,callback)=>{
    requests++;assert.equal(options.method,'HEAD');options.lookup('example.com',{},(err,ip)=>assert.equal(ip,'8.8.8.8'));
    const request=new EventEmitter();request.end=()=>{callback({statusCode:302,headers:{location:'http://127.0.0.1/private'},resume(){}});request.emit('close');};request.destroy=()=>{};return request;
  };
  try{const result=await probe('https://example.com',0,async()=>[{address:'8.8.8.8',family:4}]);assert.equal(result.status,'unknown');assert.equal(requests,1);}finally{https.request=original;}
});
