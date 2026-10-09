import{j as e,n as d,m as w}from"./index-01bef4d4.js";import{L as j,r as N}from"./react-616f86a4.js";import{S as E}from"./ScoreCounter-84b880d7.js";import{S as z,T as R}from"./triangle-alert-7acfcd5c.js";import{C as S}from"./circle-check-big-22ead3ab.js";import{C as D}from"./calendar-d50a3b58.js";import{D as B}from"./download-3f74ace6.js";const L={A:"#22C8E5",B:"#4ade80",C:"#facc15",D:"#fb923c",F:"#f87171"},O={Low:"#4ade80",Moderate:"#facc15",High:"#fb923c",Critical:"#f87171"},k={Critical:"bg-red-500/20 text-red-400 border-red-500/30",Serious:"bg-orange-500/20 text-orange-400 border-orange-500/30",Moderate:"bg-yellow-500/20 text-yellow-400 border-yellow-500/30",Minor:"bg-white/10 text-white/50 border-white/15"},y=[{icon:"🌐",label:"Fetching your website...",sub:"Checking availability & markup"},{icon:"🔍",label:"Running Lighthouse accessibility audit...",sub:"Checking against WCAG success criteria"},{icon:"🏗️",label:"Analyzing page structure...",sub:"Headings, landmarks, forms, ARIA"},{icon:"🧠",label:"Preparing your evidence-based report...",sub:"Prioritizing fixes by impact"}],P=()=>e.jsx("div",{className:"absolute inset-0 pointer-events-none z-0 opacity-[0.035]",style:{backgroundImage:`url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,backgroundRepeat:"repeat",backgroundSize:"128px"}}),F=()=>{const[i,o]=N.useState(0);N.useEffect(()=>{const t=setInterval(()=>{o(l=>Math.min(l+1,y.length-1))},2200);return()=>clearInterval(t)},[]);const n=y[i];return e.jsxs("div",{className:"fixed inset-0 z-50 bg-[#04080f] flex flex-col items-center justify-center",children:[e.jsx(P,{}),e.jsxs("div",{className:"relative z-10 flex flex-col items-center max-w-sm w-full px-6",children:[e.jsx(d.img,{src:"/logo.png",alt:"EVOBRAND",className:"h-16 mb-10",animate:{opacity:[.7,1,.7]},transition:{duration:2.5,repeat:1/0}}),e.jsxs("div",{className:"relative w-20 h-20 mb-8",children:[e.jsx(d.div,{className:"absolute inset-0 rounded-full border-2 border-[#22C8E5]/20"}),e.jsx(d.div,{className:"absolute inset-0 rounded-full border-t-2 border-[#22C8E5]",animate:{rotate:360},transition:{duration:1.2,repeat:1/0,ease:"linear"}}),e.jsx(w,{mode:"wait",children:e.jsx(d.div,{initial:{opacity:0,scale:.5},animate:{opacity:1,scale:1},exit:{opacity:0,scale:.5},transition:{duration:.3},className:"absolute inset-0 flex items-center justify-center text-xl",children:n.icon},i)})]}),e.jsx(w,{mode:"wait",children:e.jsxs(d.div,{initial:{opacity:0,y:10},animate:{opacity:1,y:0},exit:{opacity:0,y:-10},transition:{duration:.4},className:"text-center mb-8",children:[e.jsx("p",{className:"text-white font-bold text-xl mb-1",children:n.label}),e.jsx("p",{className:"text-evo-fog text-sm",children:n.sub})]},i)}),e.jsx("div",{className:"flex items-center gap-2",children:y.map((t,l)=>e.jsx(d.div,{className:"rounded-full",animate:{width:l===i?20:6,height:6,backgroundColor:l<=i?"#22C8E5":"rgba(255,255,255,0.1)"},transition:{duration:.3}},l))}),e.jsx("p",{className:"text-evo-fog text-xs mt-6 text-center",children:"Live accessibility scan in progress. This can take up to a minute."})]})]})},T=i=>{const o=i.pour&&typeof i.pour=="object"?Object.values(i.pour):[],n=i.overall_score===null||i.overall_score===void 0||!Number.isFinite(Number(i.overall_score))?null:Number(i.overall_score);return{...i,overall_score:n,grade:n===null?null:i.grade||null,remediation_priority:i.remediation_priority||null,headline:i.headline||"",pour:o,critical_issues:Array.isArray(i.critical_issues)?i.critical_issues:[],quick_wins:Array.isArray(i.quick_wins)?i.quick_wins:[],roadmap:Array.isArray(i.roadmap)?i.roadmap:[],evobrand_support:Array.isArray(i.evobrand_support)?i.evobrand_support.filter(t=>typeof t=="string"):[],disclaimer:i.disclaimer||"This report is based on an automated scan and is not a substitute for a full manual WCAG audit or legal advice.",cta:i.cta||"Ready to make your site accessible to everyone?",scan_meta:i.scan_meta||null}},q=i=>{if(!i)return null;const o=i.basis==="lighthouse"?`Google Lighthouse${i.lighthouse_version?` ${i.lighthouse_version}`:""}, ${i.device||"mobile"} view`:i.basis==="html"?"Basic HTML checks only":"Scan did not complete",n=i.scanned_at?new Date(i.scanned_at).toLocaleDateString("en-US",{year:"numeric",month:"long",day:"numeric"}):null;return{url:i.scanned_url||i.requested_url,basis:o,when:n}},J=({report:i,isLoading:o,onDownloadPDF:n})=>{var b,v;if(o)return e.jsx(F,{});if(!i)return null;const t=T(i),l=t.overall_score!==null,g=L[t.grade]||"#22C8E5",u=O[t.remediation_priority]||"#facc15",x=q(t.scan_meta),f=t.pour.some(a=>typeof a.score=="number");return e.jsx("div",{className:"min-h-screen bg-[#04080f] pt-8 pb-20",children:e.jsxs("div",{className:"container mx-auto px-4 max-w-5xl",children:[e.jsx("h1",{className:"sr-only",children:"EVOBRAND Accessibility Scan Report"}),e.jsxs(d.div,{initial:{opacity:0,y:40},animate:{opacity:1,y:0},transition:{duration:.8,ease:"easeOut"},className:"text-center mb-16",children:[l?e.jsxs(e.Fragment,{children:[e.jsxs("div",{className:"relative inline-block mb-6",children:[e.jsx("div",{className:"absolute inset-0 blur-3xl rounded-full opacity-30",style:{background:"#22C8E5"}}),e.jsxs("div",{className:"relative flex items-center justify-center gap-6",children:[e.jsxs("span",{className:"sr-only",children:["Accessibility score: ",t.overall_score," out of 100",t.grade?`, grade ${t.grade}`:"","."]}),e.jsx("span",{"aria-hidden":"true",className:"font-bold leading-none",style:{fontSize:"clamp(80px, 15vw, 140px)",color:"#22C8E5"},children:e.jsx(E,{target:t.overall_score,duration:2.5})}),t.grade&&e.jsxs("div",{"aria-hidden":"true",className:"flex flex-col items-center",children:[e.jsx("div",{className:"w-16 h-16 rounded-full flex items-center justify-center border-2 font-bold text-3xl",style:{borderColor:g,color:g,background:`${g}15`},children:t.grade}),e.jsx("span",{className:"text-evo-fog text-xs mt-1",children:"Grade"})]})]})]}),e.jsx("p",{className:"text-evo-fog text-sm uppercase tracking-widest mb-3",children:"Lighthouse Automated Score"}),t.remediation_priority&&e.jsx("div",{className:"flex justify-center mb-4",children:e.jsxs("span",{className:"inline-flex items-center gap-2 text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-widest",style:{background:`${u}18`,color:u,border:`1px solid ${u}40`},children:[e.jsx(z,{size:13,"aria-hidden":"true"}),t.remediation_priority," · Remediation priority"]})})]}):e.jsx("p",{className:"text-evo-fog text-sm uppercase tracking-widest mb-4",children:t.status==="failed"?"Scan could not complete":"Limited scan · not scored"}),t.headline&&e.jsx("h2",{className:"text-2xl md:text-3xl font-bold text-white max-w-2xl mx-auto leading-tight",children:t.headline}),x&&e.jsxs("p",{className:"text-evo-fog text-xs mt-5 max-w-2xl mx-auto break-words",children:["Page scanned: ",e.jsx("span",{className:"text-white/70",children:x.url})," · ",x.basis,x.when?` · ${x.when}`:""]})]}),e.jsxs("section",{className:"bg-white/5 border border-white/10 rounded-2xl p-6 mb-10",children:[e.jsx("h3",{className:"text-white font-bold text-lg mb-3",children:"What this scan covers"}),e.jsx("p",{className:"text-white/70 text-sm leading-relaxed",children:t.disclaimer}),((v=(b=t.scan_meta)==null?void 0:b.checks_not_completed)==null?void 0:v.length)>0&&e.jsxs("p",{className:"text-amber-200 text-sm mt-3",children:["Checks that could not complete: ",t.scan_meta.checks_not_completed.join("; "),". These require review and were not counted as passing."]})]}),f&&e.jsx(d.div,{initial:{opacity:0,y:30},animate:{opacity:1,y:0},transition:{duration:.7,delay:.2},className:"grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-16",children:t.pour.map((a,c)=>{const s=typeof a.score=="number";return e.jsxs("div",{className:"bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-5",children:[e.jsxs("div",{className:"flex items-center justify-between mb-2",children:[e.jsx("span",{className:"font-bold text-white text-sm",children:a.label}),e.jsx("span",{className:"font-bold text-[#22C8E5] text-xl",children:s?a.score:"—"})]}),e.jsx("div",{className:"w-full h-1.5 bg-white/10 rounded-full mb-3 overflow-hidden",children:e.jsx(d.div,{className:"h-full rounded-full bg-[#22C8E5]",initial:{width:0},animate:{width:`${s?a.score:0}%`},transition:{duration:1,delay:.3+c*.1,ease:"easeOut"}})}),s&&a.total>0&&e.jsxs("p",{className:"text-white/70 text-xs mb-1",children:[a.passed," of ",a.total," checks passed"]}),e.jsx("p",{className:"text-white/50 text-xs leading-relaxed",children:a.insight})]},a.label||c)})}),t.critical_issues.length>0&&e.jsxs(d.div,{initial:{opacity:0},animate:{opacity:1},transition:{duration:.5,delay:.5},className:"mb-16",children:[e.jsxs("h3",{className:"font-bold text-white text-2xl md:text-3xl mb-6 flex items-center gap-3",children:[e.jsx(R,{size:26,className:"text-orange-400"}),"Issues Found"]}),e.jsx("div",{className:"space-y-4",children:t.critical_issues.map((a,c)=>e.jsxs(d.div,{initial:{opacity:0,y:20},animate:{opacity:1,y:0},transition:{duration:.5,delay:.5+c*.06},className:"bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6",children:[e.jsxs("div",{className:"flex items-start justify-between gap-4 mb-3 flex-wrap",children:[e.jsx("h4",{className:"font-bold text-white text-lg",children:a.title}),e.jsx("span",{className:`text-xs px-2.5 py-1 rounded-2xl border font-semibold whitespace-nowrap ${k[a.severity]||k.Moderate}`,children:a.severity})]}),a.wcag&&e.jsxs("p",{className:"text-[#22C8E5]/70 text-xs font-mono mb-3",children:[a.wcag_failure===!1?"":"WCAG ",a.wcag]}),a.verification_required&&e.jsx("p",{className:"text-amber-200 text-xs mb-3",children:"Potential issue from raw HTML — verify on the rendered page."}),e.jsx("p",{className:"text-white/60 text-sm leading-relaxed mb-2",children:a.detail}),e.jsxs("p",{className:"text-evo-fog text-sm leading-relaxed",children:[e.jsx("span",{className:"text-white/60 font-semibold",children:"Fix: "}),a.fix]}),Array.isArray(a.examples)&&a.examples.length>0&&e.jsxs("details",{className:"mt-3",children:[e.jsxs("summary",{className:"text-xs text-white/60 cursor-pointer",children:["Show ",a.examples.length===1?"the flagged element":`${a.examples.length} flagged elements`]}),a.examples.map((s,h)=>e.jsx("code",{className:"block mt-2 text-xs text-white/70 bg-black/30 rounded-lg px-3 py-2 break-all",children:s},h))]})]},c))})]}),t.quick_wins.length>0&&e.jsxs(d.div,{initial:{opacity:0,y:30},animate:{opacity:1,y:0},transition:{duration:.7,delay:.7},className:"bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 mb-16",children:[e.jsxs("h3",{className:"font-bold text-white text-xl mb-5 flex items-center gap-2",children:[e.jsx(S,{size:20,className:"text-green-400"}),"Quick Wins"]}),e.jsx("ul",{className:"space-y-3",children:t.quick_wins.map((a,c)=>e.jsxs("li",{className:"flex items-start gap-3 text-white/70 text-sm leading-relaxed",children:[e.jsx("span",{className:"w-1.5 h-1.5 bg-green-400 rounded-full mt-2 flex-shrink-0"}),a]},c))})]}),t.roadmap.length>0&&e.jsxs(d.div,{initial:{opacity:0},animate:{opacity:1},transition:{duration:.5,delay:.9},className:"mb-16",children:[e.jsx("h3",{className:"font-bold text-white text-2xl md:text-3xl mb-6",children:"Your Suggested Remediation Plan"}),e.jsx("div",{className:"grid md:grid-cols-3 gap-5",children:t.roadmap.map((a,c)=>e.jsxs(d.div,{initial:{opacity:0,y:20},animate:{opacity:1,y:0},transition:{duration:.5,delay:.9+c*.1},className:"bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6",children:[e.jsx("p",{className:"text-[#22C8E5] text-xs font-bold uppercase tracking-widest mb-2",children:a.phase}),e.jsx("h4",{className:"font-bold text-white text-lg mb-4",children:a.focus}),e.jsx("ul",{className:"space-y-2.5",children:a.actions.map((s,h)=>e.jsxs("li",{className:"flex items-start gap-2.5 text-white/60 text-sm leading-relaxed",children:[e.jsx("span",{className:"w-1.5 h-1.5 bg-[#22C8E5] rounded-full mt-1.5 flex-shrink-0"}),s]},h))})]},c))})]}),t.evobrand_support.length>0&&e.jsxs("section",{className:"bg-white/5 border border-[#22C8E5]/30 rounded-2xl p-6 md:p-8 mb-12",children:[e.jsx("h3",{className:"font-bold text-white text-2xl mb-4",children:"How EVOBRAND can help"}),e.jsx("p",{className:"text-white/70 text-sm mb-4 leading-relaxed",children:"Bring your report to a strategy call. We can review the evidence, agree on the scope, and discuss practical website improvements."}),e.jsx("ul",{className:"list-disc pl-5 space-y-3 text-white/70 text-sm leading-relaxed",children:t.evobrand_support.map((a,c)=>e.jsx("li",{children:a},c))}),e.jsx(j,{to:"/book-consultation",className:"inline-flex text-[#22C8E5] font-semibold mt-5 hover:underline",children:"Discuss your website improvements →"})]}),e.jsxs(d.div,{initial:{opacity:0,y:30},animate:{opacity:1,y:0},transition:{duration:.7,delay:1.1},className:"bg-gradient-to-br from-[#003258] to-[#022040] border border-[#22C8E5]/20 rounded-2xl p-8 md:p-10 text-center",children:[e.jsx("p",{className:"text-white/80 text-lg mb-6 max-w-2xl mx-auto leading-relaxed",children:t.cta}),e.jsxs("div",{className:"flex flex-col sm:flex-row gap-6 sm:gap-4 justify-center mb-6",children:[e.jsxs(j,{to:"/book-consultation",className:"inline-flex items-center justify-center w-full sm:w-auto gap-2 px-8 py-4 bg-[#22C8E5] text-[#003258] rounded-2xl font-bold uppercase tracking-wider hover:bg-[#1db5d0] transition-colors",children:[e.jsx(D,{size:18}),"Book a Free Strategy Call"]}),e.jsxs("button",{onClick:n,className:"inline-flex items-center justify-center w-full sm:w-auto gap-2 px-8 py-4 border border-[#22C8E5]/40 text-[#22C8E5] rounded-2xl font-bold uppercase tracking-wider hover:border-[#22C8E5] transition-colors cursor-pointer h-[56px]",children:[e.jsx(B,{size:18}),"Download PDF Report"]})]}),e.jsx("p",{className:"text-gray-300 text-xs max-w-xl mx-auto leading-relaxed mb-3",children:t.disclaimer}),e.jsx("p",{className:"text-gray-300 text-sm font-medium",children:"Keisha Solomon · CEO, EVOBRAND Concepts · Ellis County, TX"})]})]})})},p="#22C8E5",m="#003258",_="#04080f",$={Critical:"background:#fee2e2;color:#dc2626",Serious:"background:#ffedd5;color:#ea580c",Moderate:"background:#fef9c3;color:#ca8a04",Minor:"background:#f1f5f9;color:#64748b"},C={Low:"background:#dcfce7;color:#16a34a",Moderate:"background:#fef9c3;color:#ca8a04",High:"background:#ffedd5;color:#ea580c",Critical:"background:#fee2e2;color:#dc2626"},r=i=>String(i??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");function M(i){const o=i.overall_score===null||i.overall_score===void 0||!Number.isFinite(Number(i.overall_score))?null:Number(i.overall_score),n=i.pour&&typeof i.pour=="object"?Object.values(i.pour):[];return{...i,overall_score:o,grade:o===null?null:i.grade||null,remediation_priority:i.remediation_priority||null,headline:i.headline||"",pour:n,critical_issues:Array.isArray(i.critical_issues)?i.critical_issues:[],quick_wins:Array.isArray(i.quick_wins)?i.quick_wins:[],roadmap:Array.isArray(i.roadmap)?i.roadmap:[],evobrand_support:Array.isArray(i.evobrand_support)?i.evobrand_support.filter(t=>typeof t=="string"):[],disclaimer:i.disclaimer||"This report is based on an automated scan and is not a substitute for a full manual WCAG audit or legal advice.",cta:i.cta||"Ready to make your site accessible to everyone?",scan_meta:i.scan_meta||null}}function I(i){if(!i)return"";const o=i.basis==="lighthouse"?`Google Lighthouse${i.lighthouse_version?` ${i.lighthouse_version}`:""} · ${i.device||"mobile"}`:i.basis==="html"?"Basic HTML checks only":"Scan did not complete",n=i.scanned_at?new Date(i.scanned_at).toLocaleDateString("en-US",{year:"numeric",month:"long",day:"numeric"}):"";return[`Page scanned: ${i.scanned_url||i.requested_url}`,o,n].filter(Boolean).join(" · ")}function G(i){return i.map(o=>{const n=typeof o.score=="number",t=n?Math.min(100,Math.max(0,o.score)):0,l=t>=75?"#22d3a0":t>=50?p:"#f59e0b",g=n&&o.total?`<span style="font-size:11px;color:#64748b;font-weight:500;margin-left:8px;">${o.passed} of ${o.total} checks passed</span>`:"";return`
      <div style="margin-bottom:20px;">
        <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:6px;">
          <span style="font-size:13px;font-weight:600;color:#1e293b;">${r(o.label)}${g}</span>
          <span style="font-size:18px;font-weight:800;color:${m};">${n?t:"—"}</span>
        </div>
        <div style="height:8px;background:#e2e8f0;border-radius:99px;overflow:hidden;">
          <div style="height:8px;background:${l};border-radius:99px;width:${t}%;"></div>
        </div>
        <p style="font-size:11px;color:#64748b;margin-top:4px;">${r(o.insight)}</p>
      </div>
    `}).join("")}function V(i,o,n){var a,c;const t=M(i),l=t.grade==="A"?"#22d3a0":t.grade==="B"?"#4ade80":t.grade==="C"?"#facc15":t.grade==="D"?"#fb923c":"#f87171",g={A:"Excellent",B:"Good",C:"Average",D:"Needs Work",F:"Critical"}[t.grade]||"",u=C[t.remediation_priority]||C.Moderate,x=t.critical_issues.map(s=>{const h=$[s.severity]||$.Moderate;return`
      <div style="background:white;border-radius:12px;padding:20px 24px;margin-bottom:16px;border:1px solid #e2e8f0;border-left:4px solid ${p};break-inside:avoid;box-shadow:0 1px 3px rgba(0,0,0,0.06);">
        <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:8px;">
          <div style="font-size:15px;font-weight:700;color:${m};">${r(s.title)}</div>
          <span style="font-size:10px;font-weight:700;${h};padding:3px 10px;border-radius:99px;white-space:nowrap;">${r(s.severity)}</span>
        </div>
        ${s.wcag?`<div style="font-size:11px;color:${p};font-family:monospace;margin-bottom:8px;">${s.wcag_failure===!1?"":"WCAG "}${r(s.wcag)}</div>`:""}
        ${s.verification_required?'<p style="font-size:11px;color:#92400e;margin-bottom:8px;">Potential issue from raw HTML — verify on the rendered page.</p>':""}
        <div style="font-size:12px;color:#4b5563;line-height:1.7;margin-bottom:8px;">${r(s.detail)}</div>
        <div style="font-size:12px;color:#374151;line-height:1.7;"><strong>Fix:</strong> ${r(s.fix)}</div>
        ${(s.examples||[]).length?`<div style="margin-top:10px;font-size:10px;color:#64748b;">Example${s.examples.length>1?"s":""} from the page:</div>
        ${s.examples.map(A=>`<div style="font-family:monospace;font-size:10px;color:#334155;background:#f1f5f9;border-radius:6px;padding:6px 8px;margin-top:4px;word-break:break-all;">${r(A)}</div>`).join("")}`:""}
      </div>
    `}).join(""),f=t.quick_wins.map(s=>`
    <div style="display:flex;align-items:flex-start;gap:10px;margin-bottom:12px;">
      <div style="flex-shrink:0;width:20px;height:20px;border-radius:50%;background:#dcfce7;display:flex;align-items:center;justify-content:center;margin-top:1px;">
        <span style="color:#16a34a;font-size:11px;font-weight:700;">✓</span>
      </div>
      <span style="font-size:13px;color:#374151;line-height:1.6;">${r(s)}</span>
    </div>
  `).join(""),b=t.roadmap.map(s=>`
    <div style="background:white;border:1px solid #e2e8f0;border-radius:12px;padding:20px;margin-bottom:14px;break-inside:avoid;">
      <div style="font-size:10px;font-weight:700;color:${p};text-transform:uppercase;letter-spacing:1.5px;margin-bottom:4px;">${r(s.phase)}</div>
      <div style="font-size:15px;font-weight:700;color:${m};margin-bottom:10px;">${r(s.focus)}</div>
      <ul>${(s.actions||[]).map(h=>`<li style="font-size:12px;color:#4b5563;line-height:1.9;">• ${r(h)}</li>`).join("")}</ul>
    </div>
  `).join(""),v=G(t.pour);return`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>EVOBRAND Accessibility Report: ${r(o)}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@600;700&family=Inter:wght@400;500;600;700;900&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Inter', Arial, sans-serif; color: #111827; background: white; }
    .cover { background: ${_}; color: white; min-height: 100vh; display: flex; flex-direction: column; page-break-after: always; position: relative; overflow: hidden; }
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
    .grade-ring { width: 70px; height: 70px; border-radius: 50%; border: 3px solid ${l}; display: flex; align-items: center; justify-content: center; margin-bottom: 8px; }
    .grade-letter { font-family: 'Rajdhani', sans-serif; font-size: 34px; color: ${l}; font-weight: 700; line-height: 1; }
    .grade-sub { font-size: 10px; color: rgba(255,255,255,0.35); letter-spacing: 1px; text-transform: uppercase; }
    .risk-card { border-radius: 16px; padding: 28px 24px; display: flex; flex-direction: column; align-items: center; justify-content: center; min-width: 140px; ${u}; }
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
    .cta-page { background: linear-gradient(135deg, ${_} 0%, ${m} 100%); color: white; padding: 80px 60px; text-align: center; min-height: 100vh; display: flex; flex-direction: column; justify-content: center; align-items: center; page-break-before: always; }
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
        <div class="cover-business">${r(o)}</div>
        <div class="cover-date">Generated ${r(n)}</div>
        <div class="cover-date">${r(I(t.scan_meta))}</div>
        ${t.overall_score!==null?`<div class="cover-score-row">
          <div class="score-card">
            <div class="score-card-label">Lighthouse Automated Score</div>
            <div class="big-score">${t.overall_score}<span style="font-size:28px;color:rgba(34,200,229,0.5)">/100</span></div>
          </div>
          ${t.grade?`<div class="grade-card">
            <div class="grade-ring"><span class="grade-letter">${r(t.grade)}</span></div>
            <div class="grade-sub">${g}</div>
          </div>`:""}
          ${t.remediation_priority?`<div class="risk-card">
            <div class="risk-label">Remediation Priority</div>
            <div class="risk-value">${r(t.remediation_priority)}</div>
          </div>`:""}
        </div>`:'<div class="cover-score-row"><div class="score-card"><div class="score-card-label">Accessibility Score</div><div style="font-size:18px;color:white;font-weight:600;">Not scored</div></div></div>'}
        ${t.headline?`<div class="cover-headline">${r(t.headline)}</div>`:""}
      </div>
      <div class="cover-footer">Confidential · EVOBRAND Concepts · evobrand.net</div>
    </div>
  </div>

  <div class="page">
    <div class="page-header">
      <div class="page-title">Automated Checks by Principle</div>
      <img class="page-logo" src="${window.location.origin}/logo.png" alt="EVOBRAND" onerror="this.style.display='none'" />
    </div>
    <div class="section-label">Score by POUR Principle</div>
    <div class="disclaimer">${r(t.disclaimer)}${(c=(a=t.scan_meta)==null?void 0:a.checks_not_completed)!=null&&c.length?`<p>Checks that could not complete: ${r(t.scan_meta.checks_not_completed.join("; "))}. These require review.</p>`:""}</div>
    <div style="margin-top:8px;">${v||'<p style="font-size:12px;color:#64748b;">Not measured for this scan.</p>'}</div>
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
    ${f?`<div class="section-label">Quick Wins</div><div style="margin-bottom:28px;">${f}</div>`:""}
    ${b?`<div class="section-label">Suggested Remediation Plan</div><div style="margin-top:12px;">${b}</div>`:""}
    <div class="disclaimer">${r(t.disclaimer)}</div>
  </div>

  ${t.evobrand_support.length?`<div class="page"><div class="page-header"><div class="page-title">How EVOBRAND Can Help</div></div><p style="font-size:13px;line-height:1.7;margin-bottom:16px;">Bring your report to a strategy call to review the evidence, agree on scope, and discuss practical website improvements.</p><ul>${t.evobrand_support.map(s=>`<li style="font-size:13px;line-height:1.8;margin-bottom:12px;">• ${r(s)}</li>`).join("")}</ul><a href="https://evobrandconcepts.com/book-consultation">Discuss your website improvements</a></div>`:""}
  <div class="cta-page">
    <div class="cta-eyebrow">Next Steps</div>
    <div class="cta-title">Make Your Site<br/>Accessible to Everyone</div>
    <div class="cta-text">${r(t.cta)}</div>
    <a class="cta-pill" href="https://evobrandconcepts.com/book-consultation">Book a Free Strategy Call</a>
    <div class="cta-contact">
      Keisha Solomon · CEO, EVOBRAND Concepts<br/>
      info@evobrand.net
    </div>
  </div>

</body>
</html>`}const Z=(i,o)=>{const n=new Date().toLocaleDateString("en-US",{year:"numeric",month:"long",day:"numeric"}),t=V(i,o,n),l=window.open("","_blank","width=900,height=700");if(!l){alert("Please allow popups to download the PDF report.");return}l.document.open(),l.document.write(t),l.document.close(),l.onload=()=>{setTimeout(()=>{l.focus(),l.print()},500)}};export{J as A,Z as d};
