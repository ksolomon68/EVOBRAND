import{n as _,j as e,m as c,k as v}from"./index-ab734acb.js";import{L as C,r as y}from"./react-616f86a4.js";import{S as A}from"./ScoreCounter-87f0cefb.js";import{S as z}from"./shield-alert-8196fe90.js";import{C as E}from"./circle-check-big-72a1b33b.js";import{C as R}from"./calendar-04f8e529.js";import{D as S}from"./download-73767a1e.js";/**
 * @license lucide-react v0.469.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const D=_("TriangleAlert",[["path",{d:"m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3",key:"wmoenq"}],["path",{d:"M12 9v4",key:"juzpu7"}],["path",{d:"M12 17h.01",key:"p32p05"}]]),B={A:"#22C8E5",B:"#4ade80",C:"#facc15",D:"#fb923c",F:"#f87171"},L={Low:"#4ade80",Moderate:"#facc15",High:"#fb923c",Critical:"#f87171"},w={Critical:"bg-red-500/20 text-red-400 border-red-500/30",Serious:"bg-orange-500/20 text-orange-400 border-orange-500/30",Moderate:"bg-yellow-500/20 text-yellow-400 border-yellow-500/30",Minor:"bg-white/10 text-white/50 border-white/15"},f=[{icon:"🌐",label:"Fetching your website...",sub:"Checking availability & markup"},{icon:"🔍",label:"Running Lighthouse accessibility audit...",sub:"Checking against WCAG success criteria"},{icon:"🏗️",label:"Analyzing page structure...",sub:"Headings, landmarks, forms, ARIA"},{icon:"🧠",label:"AI compiling your report...",sub:"Prioritizing fixes by impact"}],O=()=>e.jsx("div",{className:"absolute inset-0 pointer-events-none z-0 opacity-[0.035]",style:{backgroundImage:`url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,backgroundRepeat:"repeat",backgroundSize:"128px"}}),P=()=>{const[i,s]=y.useState(0);y.useEffect(()=>{const a=setInterval(()=>{s(r=>Math.min(r+1,f.length-1))},2200);return()=>clearInterval(a)},[]);const l=f[i];return e.jsxs("div",{className:"fixed inset-0 z-50 bg-[#04080f] flex flex-col items-center justify-center",children:[e.jsx(O,{}),e.jsxs("div",{className:"relative z-10 flex flex-col items-center max-w-sm w-full px-6",children:[e.jsx(c.img,{src:"/logo.png",alt:"EVOBRAND",className:"h-16 mb-10",animate:{opacity:[.7,1,.7]},transition:{duration:2.5,repeat:1/0}}),e.jsxs("div",{className:"relative w-20 h-20 mb-8",children:[e.jsx(c.div,{className:"absolute inset-0 rounded-full border-2 border-[#22C8E5]/20"}),e.jsx(c.div,{className:"absolute inset-0 rounded-full border-t-2 border-[#22C8E5]",animate:{rotate:360},transition:{duration:1.2,repeat:1/0,ease:"linear"}}),e.jsx(v,{mode:"wait",children:e.jsx(c.div,{initial:{opacity:0,scale:.5},animate:{opacity:1,scale:1},exit:{opacity:0,scale:.5},transition:{duration:.3},className:"absolute inset-0 flex items-center justify-center text-xl",children:l.icon},i)})]}),e.jsx(v,{mode:"wait",children:e.jsxs(c.div,{initial:{opacity:0,y:10},animate:{opacity:1,y:0},exit:{opacity:0,y:-10},transition:{duration:.4},className:"text-center mb-8",children:[e.jsx("p",{className:"text-white font-bold text-xl mb-1",children:l.label}),e.jsx("p",{className:"text-evo-fog text-sm",children:l.sub})]},i)}),e.jsx("div",{className:"flex items-center gap-2",children:f.map((a,r)=>e.jsx(c.div,{className:"rounded-full",animate:{width:r===i?20:6,height:6,backgroundColor:r<=i?"#22C8E5":"rgba(255,255,255,0.1)"},transition:{duration:.3}},r))}),e.jsx("p",{className:"text-evo-fog text-xs mt-6 text-center",children:"Live accessibility scan in progress. This can take up to a minute."})]})]})},F=i=>{const s=i.pour&&typeof i.pour=="object"?Object.values(i.pour):[],l=i.overall_score===null||i.overall_score===void 0||!Number.isFinite(Number(i.overall_score))?null:Number(i.overall_score);return{...i,overall_score:l,grade:l===null?null:i.grade||null,risk_level:l===null?null:i.risk_level||null,headline:i.headline||"",pour:s,critical_issues:Array.isArray(i.critical_issues)?i.critical_issues:[],quick_wins:Array.isArray(i.quick_wins)?i.quick_wins:[],roadmap:Array.isArray(i.roadmap)?i.roadmap:[],disclaimer:i.disclaimer||"This report is based on an automated scan and is not a substitute for a full manual WCAG audit or legal advice.",cta:i.cta||"Ready to make your site accessible to everyone?",scan_meta:i.scan_meta||null}},I=i=>{if(!i)return null;const s=i.basis==="lighthouse"?`Google Lighthouse${i.lighthouse_version?` ${i.lighthouse_version}`:""}, ${i.device||"mobile"} view`:i.basis==="html"?"Basic HTML checks only":"Scan did not complete",l=i.scanned_at?new Date(i.scanned_at).toLocaleDateString("en-US",{year:"numeric",month:"long",day:"numeric"}):null;return{url:i.scanned_url||i.requested_url,basis:s,when:l}},X=({report:i,isLoading:s,onDownloadPDF:l})=>{if(s)return e.jsx(P,{});if(!i)return null;const a=F(i),r=a.overall_score!==null,g=B[a.grade]||"#22C8E5",h=L[a.risk_level]||"#facc15",x=I(a.scan_meta),b=a.pour.some(t=>typeof t.score=="number");return e.jsx("div",{className:"min-h-screen bg-[#04080f] pt-8 pb-20",children:e.jsxs("div",{className:"container mx-auto px-4 max-w-5xl",children:[e.jsx("h1",{className:"sr-only",children:"EVOBRAND Accessibility Scan Report"}),e.jsxs(c.div,{initial:{opacity:0,y:40},animate:{opacity:1,y:0},transition:{duration:.8,ease:"easeOut"},className:"text-center mb-16",children:[r?e.jsxs(e.Fragment,{children:[e.jsxs("div",{className:"relative inline-block mb-6",children:[e.jsx("div",{className:"absolute inset-0 blur-3xl rounded-full opacity-30",style:{background:"#22C8E5"}}),e.jsxs("div",{className:"relative flex items-center justify-center gap-6",children:[e.jsxs("span",{className:"sr-only",children:["Accessibility score: ",a.overall_score," out of 100",a.grade?`, grade ${a.grade}`:"","."]}),e.jsx("span",{"aria-hidden":"true",className:"font-bold leading-none",style:{fontSize:"clamp(80px, 15vw, 140px)",color:"#22C8E5"},children:e.jsx(A,{target:a.overall_score,duration:2.5})}),a.grade&&e.jsxs("div",{"aria-hidden":"true",className:"flex flex-col items-center",children:[e.jsx("div",{className:"w-16 h-16 rounded-full flex items-center justify-center border-2 font-bold text-3xl",style:{borderColor:g,color:g,background:`${g}15`},children:a.grade}),e.jsx("span",{className:"text-evo-fog text-xs mt-1",children:"Grade"})]})]})]}),e.jsx("p",{className:"text-evo-fog text-sm uppercase tracking-widest mb-3",children:"Accessibility Score"}),a.risk_level&&e.jsx("div",{className:"flex justify-center mb-4",children:e.jsxs("span",{className:"inline-flex items-center gap-2 text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-widest",style:{background:`${h}18`,color:h,border:`1px solid ${h}40`},children:[e.jsx(z,{size:13,"aria-hidden":"true"}),a.risk_level," Risk"]})})]}):e.jsx("p",{className:"text-evo-fog text-sm uppercase tracking-widest mb-4",children:a.status==="failed"?"Scan could not complete":"Limited scan · not scored"}),a.headline&&e.jsx("h2",{className:"text-2xl md:text-3xl font-bold text-white max-w-2xl mx-auto leading-tight",children:a.headline}),x&&e.jsxs("p",{className:"text-evo-fog text-xs mt-5 max-w-2xl mx-auto break-words",children:["Page scanned: ",e.jsx("span",{className:"text-white/70",children:x.url})," · ",x.basis,x.when?` · ${x.when}`:""]})]}),b&&e.jsx(c.div,{initial:{opacity:0,y:30},animate:{opacity:1,y:0},transition:{duration:.7,delay:.2},className:"grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-16",children:a.pour.map((t,d)=>{const o=typeof t.score=="number";return e.jsxs("div",{className:"bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-5",children:[e.jsxs("div",{className:"flex items-center justify-between mb-2",children:[e.jsx("span",{className:"font-bold text-white text-sm",children:t.label}),e.jsx("span",{className:"font-bold text-[#22C8E5] text-xl",children:o?t.score:"—"})]}),e.jsx("div",{className:"w-full h-1.5 bg-white/10 rounded-full mb-3 overflow-hidden",children:e.jsx(c.div,{className:"h-full rounded-full bg-[#22C8E5]",initial:{width:0},animate:{width:`${o?t.score:0}%`},transition:{duration:1,delay:.3+d*.1,ease:"easeOut"}})}),o&&t.total>0&&e.jsxs("p",{className:"text-white/70 text-xs mb-1",children:[t.passed," of ",t.total," checks passed"]}),e.jsx("p",{className:"text-white/50 text-xs leading-relaxed",children:t.insight})]},t.label||d)})}),a.critical_issues.length>0&&e.jsxs(c.div,{initial:{opacity:0},animate:{opacity:1},transition:{duration:.5,delay:.5},className:"mb-16",children:[e.jsxs("h3",{className:"font-bold text-white text-2xl md:text-3xl mb-6 flex items-center gap-3",children:[e.jsx(D,{size:26,className:"text-orange-400"}),"Issues Found"]}),e.jsx("div",{className:"space-y-4",children:a.critical_issues.map((t,d)=>e.jsxs(c.div,{initial:{opacity:0,y:20},animate:{opacity:1,y:0},transition:{duration:.5,delay:.5+d*.06},className:"bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6",children:[e.jsxs("div",{className:"flex items-start justify-between gap-4 mb-3 flex-wrap",children:[e.jsx("h4",{className:"font-bold text-white text-lg",children:t.title}),e.jsx("span",{className:`text-xs px-2.5 py-1 rounded-2xl border font-semibold whitespace-nowrap ${w[t.severity]||w.Moderate}`,children:t.severity})]}),t.wcag&&e.jsxs("p",{className:"text-[#22C8E5]/70 text-xs font-mono mb-3",children:[t.wcag_failure===!1?"":"WCAG ",t.wcag]}),e.jsx("p",{className:"text-white/60 text-sm leading-relaxed mb-2",children:t.detail}),e.jsxs("p",{className:"text-evo-fog text-sm leading-relaxed",children:[e.jsx("span",{className:"text-white/60 font-semibold",children:"Fix: "}),t.fix]}),Array.isArray(t.examples)&&t.examples.length>0&&e.jsxs("details",{className:"mt-3",children:[e.jsxs("summary",{className:"text-xs text-white/60 cursor-pointer",children:["Show ",t.examples.length===1?"the flagged element":`${t.examples.length} flagged elements`]}),t.examples.map((o,u)=>e.jsx("code",{className:"block mt-2 text-xs text-white/70 bg-black/30 rounded-lg px-3 py-2 break-all",children:o},u))]})]},d))})]}),a.quick_wins.length>0&&e.jsxs(c.div,{initial:{opacity:0,y:30},animate:{opacity:1,y:0},transition:{duration:.7,delay:.7},className:"bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 mb-16",children:[e.jsxs("h3",{className:"font-bold text-white text-xl mb-5 flex items-center gap-2",children:[e.jsx(E,{size:20,className:"text-green-400"}),"Quick Wins"]}),e.jsx("ul",{className:"space-y-3",children:a.quick_wins.map((t,d)=>e.jsxs("li",{className:"flex items-start gap-3 text-white/70 text-sm leading-relaxed",children:[e.jsx("span",{className:"w-1.5 h-1.5 bg-green-400 rounded-full mt-2 flex-shrink-0"}),t]},d))})]}),a.roadmap.length>0&&e.jsxs(c.div,{initial:{opacity:0},animate:{opacity:1},transition:{duration:.5,delay:.9},className:"mb-16",children:[e.jsx("h3",{className:"font-bold text-white text-2xl md:text-3xl mb-6",children:"Your 90-Day Remediation Plan"}),e.jsx("div",{className:"grid md:grid-cols-3 gap-5",children:a.roadmap.map((t,d)=>e.jsxs(c.div,{initial:{opacity:0,y:20},animate:{opacity:1,y:0},transition:{duration:.5,delay:.9+d*.1},className:"bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6",children:[e.jsx("p",{className:"text-[#22C8E5] text-xs font-bold uppercase tracking-widest mb-2",children:t.phase}),e.jsx("h4",{className:"font-bold text-white text-lg mb-4",children:t.focus}),e.jsx("ul",{className:"space-y-2.5",children:t.actions.map((o,u)=>e.jsxs("li",{className:"flex items-start gap-2.5 text-white/60 text-sm leading-relaxed",children:[e.jsx("span",{className:"w-1.5 h-1.5 bg-[#22C8E5] rounded-full mt-1.5 flex-shrink-0"}),o]},u))})]},d))})]}),e.jsxs(c.div,{initial:{opacity:0,y:30},animate:{opacity:1,y:0},transition:{duration:.7,delay:1.1},className:"bg-gradient-to-br from-[#003258] to-[#022040] border border-[#22C8E5]/20 rounded-2xl p-8 md:p-10 text-center",children:[e.jsx("p",{className:"text-white/80 text-lg mb-6 max-w-2xl mx-auto leading-relaxed",children:a.cta}),e.jsxs("div",{className:"flex flex-col sm:flex-row gap-6 sm:gap-4 justify-center mb-6",children:[e.jsxs(C,{to:"/contact",className:"inline-flex items-center justify-center w-full sm:w-auto gap-2 px-8 py-4 bg-[#22C8E5] text-[#003258] rounded-2xl font-bold uppercase tracking-wider hover:bg-[#1db5d0] transition-colors",children:[e.jsx(R,{size:18}),"Book a Free Strategy Call"]}),e.jsxs("button",{onClick:l,className:"inline-flex items-center justify-center w-full sm:w-auto gap-2 px-8 py-4 border border-[#22C8E5]/40 text-[#22C8E5] rounded-2xl font-bold uppercase tracking-wider hover:border-[#22C8E5] transition-colors cursor-pointer h-[56px]",children:[e.jsx(S,{size:18}),"Download PDF Report"]})]}),e.jsx("p",{className:"text-gray-300 text-xs max-w-xl mx-auto leading-relaxed mb-3",children:a.disclaimer}),e.jsx("p",{className:"text-gray-300 text-sm font-medium",children:"Keisha Solomon · CEO, EVOBRAND Concepts · Ellis County, TX"})]})]})})},p="#22C8E5",m="#003258",j="#04080f",k={Critical:"background:#fee2e2;color:#dc2626",Serious:"background:#ffedd5;color:#ea580c",Moderate:"background:#fef9c3;color:#ca8a04",Minor:"background:#f1f5f9;color:#64748b"},N={Low:"background:#dcfce7;color:#16a34a",Moderate:"background:#fef9c3;color:#ca8a04",High:"background:#ffedd5;color:#ea580c",Critical:"background:#fee2e2;color:#dc2626"},n=i=>String(i??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");function M(i){const s=i.overall_score===null||i.overall_score===void 0||!Number.isFinite(Number(i.overall_score))?null:Number(i.overall_score),l=i.pour&&typeof i.pour=="object"?Object.values(i.pour):[];return{...i,overall_score:s,grade:s===null?null:i.grade||null,risk_level:s===null?null:i.risk_level||null,headline:i.headline||"",pour:l,critical_issues:Array.isArray(i.critical_issues)?i.critical_issues:[],quick_wins:Array.isArray(i.quick_wins)?i.quick_wins:[],roadmap:Array.isArray(i.roadmap)?i.roadmap:[],disclaimer:i.disclaimer||"This report is based on an automated scan and is not a substitute for a full manual WCAG audit or legal advice.",cta:i.cta||"Ready to make your site accessible to everyone?",scan_meta:i.scan_meta||null}}function q(i){if(!i)return"";const s=i.basis==="lighthouse"?`Google Lighthouse${i.lighthouse_version?` ${i.lighthouse_version}`:""} · ${i.device||"mobile"}`:i.basis==="html"?"Basic HTML checks only":"Scan did not complete",l=i.scanned_at?new Date(i.scanned_at).toLocaleDateString("en-US",{year:"numeric",month:"long",day:"numeric"}):"";return[`Page scanned: ${i.scanned_url||i.requested_url}`,s,l].filter(Boolean).join(" · ")}function G(i){return i.map(s=>{const l=typeof s.score=="number",a=l?Math.min(100,Math.max(0,s.score)):0,r=a>=75?"#22d3a0":a>=50?p:"#f59e0b",g=l&&s.total?`<span style="font-size:11px;color:#64748b;font-weight:500;margin-left:8px;">${s.passed} of ${s.total} checks passed</span>`:"";return`
      <div style="margin-bottom:20px;">
        <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:6px;">
          <span style="font-size:13px;font-weight:600;color:#1e293b;">${n(s.label)}${g}</span>
          <span style="font-size:18px;font-weight:800;color:${m};">${l?a:"—"}</span>
        </div>
        <div style="height:8px;background:#e2e8f0;border-radius:99px;overflow:hidden;">
          <div style="height:8px;background:${r};border-radius:99px;width:${a}%;"></div>
        </div>
        <p style="font-size:11px;color:#64748b;margin-top:4px;">${n(s.insight)}</p>
      </div>
    `}).join("")}function T(i,s,l){const a=M(i),r=a.grade==="A"?"#22d3a0":a.grade==="B"?"#4ade80":a.grade==="C"?"#facc15":a.grade==="D"?"#fb923c":"#f87171",g={A:"Excellent",B:"Good",C:"Average",D:"Needs Work",F:"Critical"}[a.grade]||"",h=N[a.risk_level]||N.Moderate,x=a.critical_issues.map(o=>{const u=k[o.severity]||k.Moderate;return`
      <div style="background:white;border-radius:12px;padding:20px 24px;margin-bottom:16px;border:1px solid #e2e8f0;border-left:4px solid ${p};break-inside:avoid;box-shadow:0 1px 3px rgba(0,0,0,0.06);">
        <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:8px;">
          <div style="font-size:15px;font-weight:700;color:${m};">${n(o.title)}</div>
          <span style="font-size:10px;font-weight:700;${u};padding:3px 10px;border-radius:99px;white-space:nowrap;">${n(o.severity)}</span>
        </div>
        ${o.wcag?`<div style="font-size:11px;color:${p};font-family:monospace;margin-bottom:8px;">${o.wcag_failure===!1?"":"WCAG "}${n(o.wcag)}</div>`:""}
        <div style="font-size:12px;color:#4b5563;line-height:1.7;margin-bottom:8px;">${n(o.detail)}</div>
        <div style="font-size:12px;color:#374151;line-height:1.7;"><strong>Fix:</strong> ${n(o.fix)}</div>
        ${(o.examples||[]).length?`<div style="margin-top:10px;font-size:10px;color:#64748b;">Example${o.examples.length>1?"s":""} from the page:</div>
        ${o.examples.map($=>`<div style="font-family:monospace;font-size:10px;color:#334155;background:#f1f5f9;border-radius:6px;padding:6px 8px;margin-top:4px;word-break:break-all;">${n($)}</div>`).join("")}`:""}
      </div>
    `}).join(""),b=a.quick_wins.map(o=>`
    <div style="display:flex;align-items:flex-start;gap:10px;margin-bottom:12px;">
      <div style="flex-shrink:0;width:20px;height:20px;border-radius:50%;background:#dcfce7;display:flex;align-items:center;justify-content:center;margin-top:1px;">
        <span style="color:#16a34a;font-size:11px;font-weight:700;">✓</span>
      </div>
      <span style="font-size:13px;color:#374151;line-height:1.6;">${n(o)}</span>
    </div>
  `).join(""),t=a.roadmap.map(o=>`
    <div style="background:white;border:1px solid #e2e8f0;border-radius:12px;padding:20px;margin-bottom:14px;break-inside:avoid;">
      <div style="font-size:10px;font-weight:700;color:${p};text-transform:uppercase;letter-spacing:1.5px;margin-bottom:4px;">${n(o.phase)}</div>
      <div style="font-size:15px;font-weight:700;color:${m};margin-bottom:10px;">${n(o.focus)}</div>
      <ul>${(o.actions||[]).map(u=>`<li style="font-size:12px;color:#4b5563;line-height:1.9;">• ${n(u)}</li>`).join("")}</ul>
    </div>
  `).join(""),d=G(a.pour);return`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>EVOBRAND Accessibility Report: ${n(s)}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@600;700&family=Inter:wght@400;500;600;700;900&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Inter', Arial, sans-serif; color: #111827; background: white; }
    .cover { background: ${j}; color: white; min-height: 100vh; display: flex; flex-direction: column; page-break-after: always; position: relative; overflow: hidden; }
    .cover-accent { position: absolute; top: -120px; right: -120px; width: 500px; height: 500px; border-radius: 50%; background: radial-gradient(circle, rgba(34,200,229,0.12) 0%, transparent 70%); pointer-events: none; }
    .cover-inner { padding: 56px 56px 40px; flex: 1; display: flex; flex-direction: column; justify-content: space-between; position: relative; z-index: 1; }
    .cover-logo-img { height: 40px; margin-bottom: 60px; display: block; }
    .cover-eyebrow { font-size: 10px; color: ${p}; letter-spacing: 3px; text-transform: uppercase; font-weight: 600; margin-bottom: 12px; }
    .cover-business { font-family: 'Rajdhani', sans-serif; font-size: 44px; color: white; font-weight: 700; line-height: 1.05; max-width: 520px; }
    .cover-date { font-size: 12px; color: rgba(255,255,255,0.35); margin-top: 10px; }
    .cover-score-row { display: flex; align-items: stretch; gap: 16px; margin-top: 48px; flex-wrap: wrap; }
    .score-card { background: ${m}; border-radius: 16px; padding: 28px 32px; flex: 1; min-width: 200px; display: flex; flex-direction: column; justify-content: center; }
    .score-card-label { font-size: 9px; color: rgba(255,255,255,0.4); letter-spacing: 2.5px; text-transform: uppercase; margin-bottom: 8px; }
    .big-score { font-family: 'Rajdhani', sans-serif; font-size: 72px; color: ${p}; font-weight: 700; line-height: 1; }
    .grade-card { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; padding: 28px 32px; display: flex; flex-direction: column; align-items: center; justify-content: center; min-width: 120px; }
    .grade-ring { width: 70px; height: 70px; border-radius: 50%; border: 3px solid ${r}; display: flex; align-items: center; justify-content: center; margin-bottom: 8px; }
    .grade-letter { font-family: 'Rajdhani', sans-serif; font-size: 34px; color: ${r}; font-weight: 700; line-height: 1; }
    .grade-sub { font-size: 10px; color: rgba(255,255,255,0.35); letter-spacing: 1px; text-transform: uppercase; }
    .risk-card { border-radius: 16px; padding: 28px 24px; display: flex; flex-direction: column; align-items: center; justify-content: center; min-width: 140px; ${h}; }
    .risk-label { font-size: 10px; letter-spacing: 2px; text-transform: uppercase; opacity: 0.7; margin-bottom: 6px; }
    .risk-value { font-family: 'Rajdhani', sans-serif; font-size: 24px; font-weight: 700; }
    .cover-headline { font-size: 14px; color: rgba(255,255,255,0.6); margin-top: 24px; line-height: 1.7; max-width: 540px; font-style: italic; }
    .cover-footer { font-size: 10px; color: rgba(255,255,255,0.2); border-top: 1px solid rgba(255,255,255,0.07); padding-top: 16px; }
    .page { padding: 52px 56px; page-break-before: always; }
    .page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 36px; padding-bottom: 16px; border-bottom: 2px solid #f1f5f9; }
    .page-logo { height: 28px; opacity: 0.5; }
    .page-title { font-family: 'Rajdhani', sans-serif; font-size: 24px; font-weight: 700; color: ${m}; }
    .section-label { font-size: 9px; font-weight: 700; color: ${p}; letter-spacing: 2.5px; text-transform: uppercase; margin-bottom: 6px; }
    .section-heading { font-family: 'Rajdhani', sans-serif; font-size: 20px; font-weight: 700; color: ${m}; margin-bottom: 20px; }
    ul { list-style: none; }
    .disclaimer { margin-top: 24px; padding: 16px 20px; background: #f8fafc; border-radius: 10px; font-size: 11px; color: #64748b; line-height: 1.6; }
    .cta-page { background: linear-gradient(135deg, ${j} 0%, ${m} 100%); color: white; padding: 80px 60px; text-align: center; min-height: 100vh; display: flex; flex-direction: column; justify-content: center; align-items: center; page-break-before: always; }
    .cta-eyebrow { font-size: 10px; color: ${p}; letter-spacing: 3px; text-transform: uppercase; font-weight: 600; margin-bottom: 16px; }
    .cta-title { font-family: 'Rajdhani', sans-serif; font-size: 36px; color: white; margin-bottom: 20px; line-height: 1.2; }
    .cta-text { font-size: 15px; color: rgba(255,255,255,0.7); line-height: 1.8; max-width: 480px; margin-bottom: 36px; }
    .cta-pill { display: inline-block; background: ${p}; color: ${m}; font-family: 'Rajdhani', sans-serif; font-size: 18px; font-weight: 700; padding: 12px 32px; border-radius: 99px; margin-bottom: 36px; }
    .cta-contact { font-size: 11px; color: rgba(255,255,255,0.3); line-height: 1.8; }
    @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } .page { page-break-before: always; } }
  </style>
</head>
<body>

  <div class="cover">
    <div class="cover-accent"></div>
    <div class="cover-inner">
      <div>
        <img class="cover-logo-img" src="${window.location.origin}/logo.png" alt="EVOBRAND" onerror="this.style.display='none'" />
        <div class="cover-eyebrow">Accessibility Report · Confidential</div>
        <div class="cover-business">${n(s)}</div>
        <div class="cover-date">Generated ${n(l)}</div>
        <div class="cover-date">${n(q(a.scan_meta))}</div>
        ${a.overall_score!==null?`<div class="cover-score-row">
          <div class="score-card">
            <div class="score-card-label">Accessibility Score</div>
            <div class="big-score">${a.overall_score}<span style="font-size:28px;color:rgba(34,200,229,0.5)">/100</span></div>
          </div>
          ${a.grade?`<div class="grade-card">
            <div class="grade-ring"><span class="grade-letter">${n(a.grade)}</span></div>
            <div class="grade-sub">${g}</div>
          </div>`:""}
          ${a.risk_level?`<div class="risk-card">
            <div class="risk-label">Risk Level</div>
            <div class="risk-value">${n(a.risk_level)}</div>
          </div>`:""}
        </div>`:'<div class="cover-score-row"><div class="score-card"><div class="score-card-label">Accessibility Score</div><div style="font-size:18px;color:white;font-weight:600;">Not scored</div></div></div>'}
        ${a.headline?`<div class="cover-headline">${n(a.headline)}</div>`:""}
      </div>
      <div class="cover-footer">Confidential · EVOBRAND Concepts · evobrand.net</div>
    </div>
  </div>

  <div class="page">
    <div class="page-header">
      <div class="page-title">WCAG Performance Breakdown</div>
      <img class="page-logo" src="${window.location.origin}/logo.png" alt="EVOBRAND" onerror="this.style.display='none'" />
    </div>
    <div class="section-label">Score by POUR Principle</div>
    <div style="margin-top:8px;">${d||'<p style="font-size:12px;color:#64748b;">Not measured for this scan.</p>'}</div>
  </div>

  ${x?`
  <div class="page">
    <div class="page-header">
      <div class="page-title">Issues Found</div>
      <img class="page-logo" src="${window.location.origin}/logo.png" alt="EVOBRAND" onerror="this.style.display='none'" />
    </div>
    <div class="section-label">Evidence-Based Findings</div>
    <div style="margin-top:16px;">${x}</div>
  </div>`:""}

  <div class="page">
    <div class="page-header">
      <div class="page-title">Quick Wins &amp; Roadmap</div>
      <img class="page-logo" src="${window.location.origin}/logo.png" alt="EVOBRAND" onerror="this.style.display='none'" />
    </div>
    ${b?`<div class="section-label">Quick Wins</div><div style="margin-bottom:28px;">${b}</div>`:""}
    ${t?`<div class="section-label">90-Day Remediation Plan</div><div style="margin-top:12px;">${t}</div>`:""}
    <div class="disclaimer">${n(a.disclaimer)}</div>
  </div>

  <div class="cta-page">
    <div class="cta-eyebrow">Next Steps</div>
    <div class="cta-title">Make Your Site<br/>Accessible to Everyone</div>
    <div class="cta-text">${n(a.cta)}</div>
    <div class="cta-pill">evobrand.net</div>
    <div class="cta-contact">
      Keisha Solomon · CEO, EVOBRAND Concepts<br/>
      info@evobrand.net
    </div>
  </div>

</body>
</html>`}const J=(i,s)=>{const l=new Date().toLocaleDateString("en-US",{year:"numeric",month:"long",day:"numeric"}),a=T(i,s,l),r=window.open("","_blank","width=900,height=700");if(!r){alert("Please allow popups to download the PDF report.");return}r.document.open(),r.document.write(a),r.document.close(),r.onload=()=>{setTimeout(()=>{r.focus(),r.print()},500)}};export{X as A,J as d};
