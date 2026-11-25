const crypto = require('node:crypto');
const escape = value => String(value || '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const automated = req => /bot|crawler|spider|scanner|proofpoint|mimecast|barracuda|safelinks|headless|preview/i.test(req.get('user-agent') || '') || /prefetch|prerender/i.test(req.get('purpose') || req.get('sec-purpose') || '');
function sign(payload) {
  const encoded = Buffer.from(JSON.stringify(payload)).toString('base64url');
  return encoded + '.' + crypto.createHmac('sha256', process.env.JWT_SECRET).update(encoded).digest('base64url');
}
function verify(token) {
  try {
    const [data, signature] = token.split('.');
    const expected = crypto.createHmac('sha256', process.env.JWT_SECRET).update(data).digest('base64url');
    if (signature.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null;
    const payload = JSON.parse(Buffer.from(data, 'base64url').toString());
    return payload.exp > Date.now() ? payload : null;
  } catch { return null; }
}
function landing(video, base, token) {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escape(video.title)} | EVOBRAND</title><style>body{margin:0;background:#003258;color:white;font:18px/1.6 Arial,sans-serif}main{max-width:960px;margin:auto;padding:24px}video{width:100%;max-height:75vh;background:black}a{color:#003258;background:#22c8e5;padding:12px 24px;display:inline-block;border-radius:6px}p{white-space:pre-wrap}h1{line-height:1.2}</style></head><body><main><header>EVOBRAND</header><h1>${escape(video.title)}</h1><video controls playsinline preload="metadata" poster="${base}/poster.jpg"><source src="${base}/video.mp4" type="video/mp4">Your browser does not support video. <a href="${base}/video.mp4">Download video</a></video><p>${escape(video.copy)}</p>${video.cta_url ? `<a href="${escape(video.cta_url)}" rel="noopener">${escape(video.cta_label || 'Learn more')}</a>` : ''}</main><script>
const player=document.querySelector('video'), sent=new Set();
function event(type){if(sent.has(type))return;sent.add(type);fetch('${base.replace('/media/', '/events/')}',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({token:${JSON.stringify(token)},type}),keepalive:true}).catch(()=>{});}
if(document.visibilityState==='visible')event('visit');document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')event('visit')});
player.addEventListener('play',()=>event('play'));
player.addEventListener('timeupdate',()=>{if(!player.seeking && !player.paused && Number.isFinite(player.duration)){for(const n of [25,50,75])if(player.currentTime/player.duration*100>=n)event(String(n));}});
player.addEventListener('ended',()=>event('100'));
</script></body></html>`;
}
module.exports = { escape, automated, sign, verify, landing };
