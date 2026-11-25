import React, { useEffect, useRef, useState } from 'react';
export const VIDEO_API = `${['localhost','127.0.0.1'].includes(window.location.hostname) ? 'http://localhost:5000' : window.location.origin}/api/videos`;
const headers = () => ({ Authorization: `Bearer ${localStorage.getItem('evobrand_token')}` });
export async function videoRequest(path = '', options = {}) {
  const response = await fetch(VIDEO_API + path, { ...options, headers: { ...headers(), 'Content-Type':'application/json', ...options.headers } });
  if (!response.ok) { const error = await response.json().catch(() => ({})); throw new Error(error.error || `Video request failed (${response.status})`); }
  return response.status === 204 ? null : response.json().catch(() => null);
}
const field = 'w-full bg-[#003258] border border-white/20 rounded p-2 text-white text-sm';
export default function VideoBlockFields({ block, onChange }) {
  const [videos,setVideos] = useState([]), [error,setError] = useState(''), [progress,setProgress] = useState(null), [pending,setPending] = useState('');
  const [start,setStart] = useState(0), [duration,setDuration] = useState(3), [copy,setCopy] = useState(''), [ctaUrl,setCtaUrl] = useState(''), [ctaLabel,setCtaLabel] = useState('Learn more');
  const latest = useRef({block,onChange}); latest.current = {block,onChange};
  const upload = useRef(null);
  const hydrated = useRef('');
  const set = patch => onChange({...block,...patch});
  useEffect(() => {
    let active = true;
    async function load() { try {
      const rows = await videoRequest(); if (!active) return; setVideos(rows.filter(v=>v.status!=='deleted'));
      if (pending) { const v = rows.find(v=>v.id===pending); if (v?.status==='ready') { latest.current.onChange({...latest.current.block,videoId:v.id,landingUrl:v.landingUrl,gifUrl:v.gifUrl,posterUrl:v.posterUrl,title:v.title});setPending(''); } }
    } catch(e) { if(active)setError(e.message); } }
    load(); const timer=setInterval(load,4000); return()=>{active=false;clearInterval(timer);};
  },[pending]);
  useEffect(()=>()=>upload.current?.abort(),[]);
  const selected = videos.find(v=>v.id === (pending || block.videoId));
  useEffect(() => {
    if (!selected || hydrated.current === selected.id) return;
    hydrated.current = selected.id;
    setCopy(selected.copy || ''); setCtaUrl(selected.cta_url || ''); setCtaLabel(selected.cta_label || 'Learn more');
    setStart(selected.gif_start ?? 0); setDuration(selected.gif_duration ?? 3);
  }, [selected]);
  async function action(fn) { setError('');try {await fn();}catch(e){setError(e.message);} }
  function select(id) {
    const v=videos.find(v=>v.id===id); if(!v)return;
    setCopy(v.copy || '');setCtaUrl(v.cta_url || '');setCtaLabel(v.cta_label || 'Learn more');
    if(v.status!=='ready'){setPending(id);set({videoId:'',landingUrl:'',gifUrl:'',posterUrl:''});return;}
    setPending('');set({videoId:id,title:v.title,landingUrl:v.landingUrl,gifUrl:v.gifUrl,posterUrl:v.posterUrl});
  }
  function sendFile(file) {
    if(!file)return;
    if(!/\.mp4$/i.test(file.name) || file.size>250*1024*1024){setError('Choose an MP4 up to 250 MB.');return;}
    const data=new FormData();data.append('file',file);data.append('gifStart',start);data.append('gifDuration',duration);data.append('title',block.title || file.name);
    const xhr=new XMLHttpRequest();upload.current=xhr;xhr.open('POST',VIDEO_API);xhr.setRequestHeader('Authorization',headers().Authorization);setError('');setProgress(0);
    xhr.upload.onprogress=e=>{if(e.lengthComputable)setProgress(Math.round(e.loaded/e.total*100));};
    xhr.onload=()=>{setProgress(null);let response;try{response=JSON.parse(xhr.responseText);}catch{response={};}if(xhr.status===202){setPending(response.id);latest.current.onChange({...latest.current.block,videoId:'',landingUrl:'',gifUrl:'',posterUrl:''});}else setError(response.error || 'Upload failed.');};
    xhr.onerror=()=>{setProgress(null);setError('Upload failed. Check your connection and retry.');};xhr.send(data);
  }
  return <div className="space-y-3">
    <label className="block">Video library<select aria-label="Video library" className={field} value={pending || block.videoId || ''} onChange={e=>select(e.target.value)}><option value="">Select a video</option>{videos.map(v=><option key={v.id} value={v.id}>{v.title} — {v.status}</option>)}</select></label>
    <div className="flex gap-3"><label>GIF start (seconds)<input className={field} type="number" min="0" max="1800" step="0.1" value={start} onChange={e=>setStart(e.target.value)}/></label><label>GIF duration (seconds)<input className={field} type="number" min="0.5" max="10" step="0.1" value={duration} onChange={e=>setDuration(e.target.value)}/></label></div>
    <label className="block">Upload MP4 (250 MB maximum)<input className={field} type="file" accept="video/mp4,.mp4" disabled={progress!==null} onChange={e=>sendFile(e.target.files[0])}/></label>
    {progress!==null && <div role="status"><progress max="100" value={progress}/> {progress}% uploaded</div>}
    {pending && <p role="status">{selected?.status === 'failed' ? 'Processing stopped. Review the error below, then retry.' : selected?.status === 'processing' ? 'Processing your video in the background…' : 'Queued — waiting for the video worker.'}</p>}
    {selected?.error && <p role="alert">{selected.error}</p>}
    {selected?.status==='failed' && <button type="button" onClick={()=>action(()=>videoRequest(`/${selected.id}/retry`,{method:'POST',body:JSON.stringify({gifStart:start,gifDuration:duration})}))}>Retry processing</button>}
    {selected?.gif_bytes>=1000000 && <p>GIF exceeds 1 MB. Choose JPEG for a lighter email.</p>}
    {['title','alt','cta'].map(key=><label className="block" key={key}>{({title:'Email title',alt:'Image alt text',cta:'Email CTA'})[key]}<input className={field} value={block[key] || ''} onChange={e=>set({[key]:e.target.value})}/></label>)}
    <label className="block">Preview<select className={field} value={block.previewType || 'gif'} onChange={e=>set({previewType:e.target.value})}><option value="gif">Animated GIF</option><option value="jpeg">Static JPEG</option></select></label>
    <label className="block">Alignment<select className={field} value={block.align || 'center'} onChange={e=>set({align:e.target.value})}>{['left','center','right'].map(v=><option key={v}>{v}</option>)}</select></label>
    <div className="flex gap-3">{[['width','Width (height scales automatically)',160,600],['radius','Corner radius',0,40]].map(([key,label,min,max])=><label key={key}>{label}<input className={field} type="number" min={min} max={max} value={block[key] ?? min} onChange={e=>set({[key]:e.target.value})}/></label>)}<label>Background<input type="color" value={block.background || '#003258'} onChange={e=>set({background:e.target.value})}/></label></div>
    {selected?.status==='ready' && <fieldset className="space-y-2 border border-white/20 p-3"><legend>Public landing page (shared by campaigns using this video)</legend><label className="block">Campaign copy<textarea className={field} value={copy} onChange={e=>setCopy(e.target.value)}/></label><label className="block">Landing CTA label<input className={field} value={ctaLabel} onChange={e=>setCtaLabel(e.target.value)}/></label><label className="block">Landing CTA URL<input className={field} type="url" value={ctaUrl} onChange={e=>setCtaUrl(e.target.value)}/></label><button type="button" onClick={()=>action(()=>videoRequest(`/${selected.id}`,{method:'PATCH',body:JSON.stringify({title:block.title,copy,ctaLabel,ctaUrl})}))}>Save landing page</button><a className="ml-4 underline" href={selected.landingUrl} target="_blank" rel="noreferrer">Open landing page</a></fieldset>}
    {selected && ['ready','failed'].includes(selected.status) && <button className="text-red-300" type="button" onClick={()=>{if(window.confirm('Permanently delete this media? Existing emails linking to it will stop working.'))action(async()=>{await videoRequest(`/${selected.id}`,{method:'DELETE'});setPending('');set({videoId:'',gifUrl:'',posterUrl:'',landingUrl:''});});}}>Delete media</button>}
    {error && <p role="alert" className="text-red-300">{error}</p>}
  </div>;
}
