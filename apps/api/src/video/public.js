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
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#003258"><title>${escape(video.title)} | EVOBRAND</title><style>
*{box-sizing:border-box}body{margin:0;background:#070d14;color:#f5f8fb;font:16px/1.65 Arial,Helvetica,sans-serif;background-image:radial-gradient(ellipse at 50% 0, #003258 0, transparent 65%);min-height:100vh}a{color:#22c8e5}a:focus-visible,video:focus-visible{outline:3px solid #22c8e5;outline-offset:6px}header{max-width:1120px;margin:auto;padding:28px 24px;border-bottom:1px solid #ffffff16;display:flex;justify-content:space-between;align-items:center;gap:24px}.brand{display:block;line-height:0}.brand img{display:block;width:240px;max-width:48vw;height:auto}.home{font-size:12px;text-decoration:none;letter-spacing:.06em}main{max-width:1040px;margin:auto;padding:44px 24px 56px;text-align:center}.eyebrow{text-transform:uppercase;letter-spacing:.22em;font-size:11px;font-weight:bold;color:#22c8e5;margin:0 0 14px}h1{font-size:clamp(28px,5vw,54px);line-height:1.15;letter-spacing:-.035em;margin:0 auto 30px;max-width:850px;overflow-wrap:anywhere}.player-shell{width:fit-content;max-width:100%;margin:0 auto;border:1px solid #22c8e533;border-radius:18px;overflow:hidden;box-shadow:0 24px 80px #0008;background:#04080f}video{display:block;width:auto;max-width:100%;height:auto;max-height:70vh;max-height:70svh;background:#04080f}.copy{white-space:pre-wrap;max-width:640px;margin:28px auto 0;color:#b3c1cf;text-align:center;overflow-wrap:anywhere}.cta{display:inline-block;margin-top:26px;padding:13px 26px;border-radius:8px;background:#22c8e5;color:#003258;text-decoration:none;font-size:14px;font-weight:bold;transition:background .2s}.cta:hover{background:#8eeaff}footer{max-width:1120px;margin:auto;padding:24px;border-top:1px solid #ffffff16;text-align:center;color:#8892a4;font-size:12px}footer p{margin:0 0 6px}@media(max-width:540px){header{padding:22px 18px}.brand img{width:195px;max-width:58vw}.home{font-size:11px}main{padding:30px 16px 40px}h1{margin-bottom:24px}.player-shell{border-radius:12px}.copy{font-size:15px}.cta{max-width:100%}}
</style></head><body><header><a class="brand" href="https://evobrand.net" aria-label="EVOBRAND home"><img src="https://evobrand.net/logo.png" alt="EVOBRAND" width="1155" height="201"></a><a class="home" href="https://evobrand.net">Explore EVOBRAND &#8599;</a></header><main><p class="eyebrow">A film by EVOBRAND</p><h1>${escape(video.title)}</h1><div class="player-shell"><video aria-label="${escape(video.title)}" controls playsinline preload="metadata" poster="${base}/poster.jpg"><source src="${base}/video.mp4" type="video/mp4">Your browser does not support video. <a href="${base}/video.mp4">Download video</a></video></div>${video.copy ? `<p class="copy">${escape(video.copy)}</p>` : ''}${video.cta_url ? `<a class="cta" href="${escape(video.cta_url)}" rel="noopener">${escape(video.cta_label || 'Learn more')} <span aria-hidden="true">&#8599;</span></a>` : ''}</main><footer><p>We automate the mundane to free the human spirit.</p><span>&copy; ${new Date().getFullYear()} EVOBRAND Concepts</span></footer><script>
const player=document.querySelector('video'), sent=new Set();
function event(type){if(sent.has(type))return;sent.add(type);fetch('${base.replace('/media/', '/events/')}',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({token:${JSON.stringify(token)},type}),keepalive:true}).catch(()=>{});}
if(document.visibilityState==='visible')event('visit');document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')event('visit')});
player.addEventListener('play',()=>event('play'));
player.addEventListener('timeupdate',()=>{if(!player.seeking && !player.paused && Number.isFinite(player.duration)){for(const n of [25,50,75])if(player.currentTime/player.duration*100>=n)event(String(n));}});
player.addEventListener('ended',()=>event('100'));
</script></body></html>`;
}
module.exports = { escape, automated, sign, verify, landing };
