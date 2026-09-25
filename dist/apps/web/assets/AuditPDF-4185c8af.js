import{j as e,m,a as T,A as R}from"./index-646abfaa.js";import{r as j,L as F}from"./react-6d68b9b0.js";import{S as G}from"./ScoreCounter-6a38e1b7.js";import{C as D}from"./circle-check-big-472677f3.js";import{T as O}from"./trending-up-edbe7859.js";import{C as Y}from"./calendar-71606139.js";import{D as W}from"./download-97664c81.js";import{M as V}from"./mail-dd504982.js";const H=[25,50,75,100],U=(t="")=>{const i=t.trim().split(/\s+/);if(i.length<2)return[t];const a=Math.ceil(i.length/2);return[i.slice(0,a).join(" "),i.slice(a).join(" ")]},_=t=>t>=75?"#22d3a0":t>=50?"#22C8E5":"#f59e0b",K=({categories:t})=>{const i=t?Object.values(t):[],a=j.useId(),o=j.useId();if(!i.length)return null;const n=360,l=n/2,c=n/2,g=n*.3,r=4,p=i.length,x=s=>Math.PI*2*s/p-Math.PI/2,h=(s,d)=>({x:l+s*Math.cos(x(d)),y:c+s*Math.sin(x(d))}),y=Array.from({length:r},(s,d)=>{const u=g*(d+1)/r;return Array.from({length:p},(f,N)=>h(u,N)).map((f,N)=>`${N===0?"M":"L"}${f.x},${f.y}`).join(" ")+"Z"}),$=Array.from({length:p},(s,d)=>{const u=h(g,d);return`M${l},${c} L${u.x},${u.y}`}),b=i.map((s,d)=>h((s.score??0)/100*g,d)),A=b.map((s,d)=>`${d===0?"M":"L"}${s.x},${s.y}`).join(" ")+"Z";return e.jsx(m.div,{initial:{opacity:0,scale:.9},animate:{opacity:1,scale:1},transition:{duration:.8,ease:"easeOut"},className:"w-full flex items-center justify-center",style:{minHeight:300},children:e.jsxs("svg",{viewBox:`0 0 ${n} ${n}`,width:"100%",style:{maxWidth:n,overflow:"visible"},role:"img","aria-label":`Brand radar: ${i.map(s=>`${s.label} ${s.score}`).join(", ")}`,children:[e.jsxs("defs",{children:[e.jsxs("radialGradient",{id:a,cx:"50%",cy:"50%",r:"65%",children:[e.jsx("stop",{offset:"0%",stopColor:"#22C8E5",stopOpacity:"0.45"}),e.jsx("stop",{offset:"100%",stopColor:"#22C8E5",stopOpacity:"0.06"})]}),e.jsxs("filter",{id:o,x:"-60%",y:"-60%",width:"220%",height:"220%",children:[e.jsx("feGaussianBlur",{stdDeviation:"3.5",result:"blur"}),e.jsxs("feMerge",{children:[e.jsx("feMergeNode",{in:"blur"}),e.jsx("feMergeNode",{in:"SourceGraphic"})]})]})]}),y.map((s,d)=>e.jsx("path",{d:s,fill:"none",stroke:"rgba(34,200,229,0.14)",strokeWidth:d===r-1?1.25:1},d)),H.map((s,d)=>e.jsx("text",{x:l+6,y:c-g*s/100,fontSize:"8.5",fontFamily:"sans-serif",fill:"rgba(148,163,184,0.55)",children:s},s)),$.map((s,d)=>e.jsx("path",{d:s,stroke:"rgba(34,200,229,0.14)",strokeWidth:1},d)),e.jsx(m.path,{d:A,fill:`url(#${a})`,stroke:"none",initial:{opacity:0},animate:{opacity:1},transition:{duration:.6,delay:.5}}),e.jsx(m.path,{d:A,fill:"none",stroke:"#22C8E5",strokeWidth:2.25,strokeLinejoin:"round",filter:`url(#${o})`,initial:{pathLength:0,opacity:0},animate:{pathLength:1,opacity:1},transition:{duration:1.1,ease:"easeOut",delay:.2}}),b.map((s,d)=>{const u=_(i[d].score??0),f=.9+d*.08;return e.jsxs("g",{children:[e.jsx(m.circle,{cx:s.x,cy:s.y,fill:u,fillOpacity:.18,initial:{r:0,opacity:0},animate:{r:7,opacity:1},transition:{duration:.4,delay:f,ease:"easeOut"}}),e.jsx(m.circle,{cx:s.x,cy:s.y,fill:u,stroke:"#04080f",strokeWidth:1.5,initial:{r:0,opacity:0},animate:{r:4,opacity:1},transition:{duration:.4,delay:f,ease:"easeOut"}}),e.jsx("title",{children:`${i[d].label}: ${i[d].score}/100`})]},d)}),i.map((s,d)=>{const u=g+30,f=h(u,d),N=x(d)*(180/Math.PI);let k="middle";f.x>l+8?k="start":f.x<l-8&&(k="end");const L=N>-150&&N<-30,z=U(s.label),E=12,P=-((z.length-1)*E)/2;return e.jsx("g",{children:e.jsxs("text",{x:f.x,y:f.y,textAnchor:k,fontFamily:"sans-serif",children:[z.map((I,S)=>e.jsx("tspan",{x:f.x,dy:S===0?P:E,fontSize:"11",fill:"#cbd5e1",fontWeight:L?700:600,children:I},S)),e.jsx("tspan",{x:f.x,dy:E+2,fontSize:"12",fontWeight:"800",fill:_(s.score??0),children:s.score??0})]})},d)})]})})},q=window.location.hostname==="localhost"||window.location.hostname==="127.0.0.1"?"http://localhost:5000/api/newsletter/subscribe":`${window.location.origin}/api/newsletter/subscribe`;function Z({prefillEmail:t="",prefillName:i=""}){const[a,o]=j.useState(t),[n,l]=j.useState(i),[c,g]=j.useState("idle"),[r,p]=j.useState(""),x=async h=>{if(h.preventDefault(),!!a.trim()){g("loading");try{const y=await fetch(q,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:a.trim(),name:n.trim(),source:"audit"})});if(!y.ok){const $=await y.json().catch(()=>({}));throw new Error($.error||"Subscription failed")}g("success")}catch(y){p(y.message||"Something went wrong"),g("error")}}};return c==="success"?e.jsx("div",{className:"mt-8 pt-8 border-t border-white/10 text-center",children:e.jsxs("div",{className:"inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-[#22C8E5]/10 border border-[#22C8E5]/30",children:[e.jsx(D,{size:16,className:"text-[#22C8E5]"}),e.jsx("span",{className:"text-[#22C8E5] font-bold text-sm",children:"You're on the list! Watch your inbox for AI brand tips."})]})}):e.jsxs("div",{className:"mt-8 pt-8 border-t border-white/10",children:[e.jsxs("div",{className:"flex items-center justify-center gap-2 mb-3",children:[e.jsx(V,{size:15,className:"text-[#22C8E5]"}),e.jsx("p",{className:"text-white/60 text-sm font-semibold",children:"Get AI brand tips & strategies delivered to your inbox"})]}),e.jsxs("form",{onSubmit:x,className:"flex flex-col sm:flex-row gap-3 max-w-md mx-auto",children:[!i&&e.jsx("input",{type:"text",placeholder:"Your name",value:n,onChange:h=>l(h.target.value),className:"flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#22C8E5]/50"}),e.jsx("input",{type:"email",required:!0,placeholder:"Your email",value:a,onChange:h=>o(h.target.value),className:"flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#22C8E5]/50"}),e.jsx("button",{type:"submit",disabled:c==="loading",className:"px-6 py-3 rounded-xl bg-[#22C8E5]/20 border border-[#22C8E5]/40 text-[#22C8E5] text-sm font-bold uppercase tracking-wider hover:bg-[#22C8E5]/30 transition-colors disabled:opacity-50 whitespace-nowrap",children:c==="loading"?"Subscribing…":"Subscribe"})]}),c==="error"&&e.jsx("p",{className:"text-red-400 text-xs text-center mt-2",children:r}),e.jsx("p",{className:"text-evo-fog text-[11px] text-center mt-3",children:"No spam. Unsubscribe any time."})]})}const C=[{icon:"🌐",label:"Fetching your website...",sub:"Checking availability, SSL & metadata"},{icon:"⚡",label:"Running PageSpeed analysis...",sub:"Performance, SEO & accessibility scores"},{icon:"🔍",label:"Scanning Google presence...",sub:"Search visibility & brand mentions"},{icon:"📊",label:"Analyzing competitive position...",sub:"Industry benchmarks & gaps"},{icon:"🧠",label:"AI scoring your brand...",sub:"Claude synthesizing all data points"},{icon:"📋",label:"Building your report...",sub:"Personalizing recommendations"}],J={A:"#22C8E5",B:"#4ade80",C:"#facc15",D:"#fb923c",F:"#f87171"},X={High:"bg-red-500/20 text-red-400 border-red-500/30",Medium:"bg-yellow-500/20 text-yellow-400 border-yellow-500/30",Low:"bg-green-500/20 text-green-400 border-green-500/30"},Q=()=>e.jsx("div",{className:"absolute inset-0 pointer-events-none z-0 opacity-[0.035]",style:{backgroundImage:`url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,backgroundRepeat:"repeat",backgroundSize:"128px"}}),ee=({hasWebsite:t})=>{const[i,a]=j.useState(t?0:4);j.useEffect(()=>{const n=setInterval(()=>{a(l=>{const c=C.length;return Math.min(l+1,c-1)})},2200);return()=>clearInterval(n)},[t]);const o=C[i]||C[C.length-1];return e.jsxs("div",{className:"fixed inset-0 z-50 bg-[#04080f] flex flex-col items-center justify-center",children:[e.jsx(Q,{}),e.jsxs("div",{className:"relative z-10 flex flex-col items-center max-w-sm w-full px-6",children:[e.jsx(m.img,{src:"/logo.png",alt:"EVOBRAND",className:"h-16 mb-10",animate:{opacity:[.7,1,.7]},transition:{duration:2.5,repeat:1/0}}),e.jsxs("div",{className:"relative w-20 h-20 mb-8",children:[e.jsx(m.div,{className:"absolute inset-0 rounded-full border-2 border-[#22C8E5]/20"}),e.jsx(m.div,{className:"absolute inset-0 rounded-full border-t-2 border-[#22C8E5]",animate:{rotate:360},transition:{duration:1.2,repeat:1/0,ease:"linear"}}),e.jsx(m.div,{className:"absolute inset-2 rounded-full border-t-2 border-[#22C8E5]/40",animate:{rotate:-360},transition:{duration:2,repeat:1/0,ease:"linear"}}),e.jsx(R,{mode:"wait",children:e.jsx(m.div,{initial:{opacity:0,scale:.5},animate:{opacity:1,scale:1},exit:{opacity:0,scale:.5},transition:{duration:.3},className:"absolute inset-0 flex items-center justify-center text-xl",children:o.icon},i)})]}),e.jsx(R,{mode:"wait",children:e.jsxs(m.div,{initial:{opacity:0,y:10},animate:{opacity:1,y:0},exit:{opacity:0,y:-10},transition:{duration:.4},className:"text-center mb-8",children:[e.jsx("p",{className:"text-white font-bold text-xl mb-1",children:o.label}),e.jsx("p",{className:"text-evo-fog text-sm",children:o.sub})]},i)}),t&&e.jsx("div",{className:"flex items-center gap-2",children:C.map((n,l)=>e.jsx(m.div,{className:"rounded-full",animate:{width:l===i?20:6,height:6,backgroundColor:l<=i?"#22C8E5":"rgba(255,255,255,0.1)"},transition:{duration:.3}},l))}),t&&e.jsx("p",{className:"text-evo-fog text-xs mt-6 text-center",children:"Live internet scan in progress. This takes ~15 seconds"})]})]})},te=({report:t})=>{const i=J[t.grade]||"#22C8E5";return e.jsxs(m.div,{initial:{opacity:0,y:40},animate:{opacity:1,y:0},transition:{duration:.8,ease:"easeOut"},className:"text-center mb-16",children:[e.jsxs("div",{className:"relative inline-block mb-6",children:[e.jsx("div",{className:"absolute inset-0 blur-3xl rounded-full opacity-30",style:{background:"#22C8E5"}}),e.jsxs("div",{className:"relative flex items-center justify-center gap-6",children:[e.jsx("span",{className:"font-bold leading-none",style:{fontSize:"clamp(80px, 15vw, 140px)",color:"#22C8E5"},children:e.jsx(G,{target:t.overall_score,duration:2.5})}),e.jsxs("div",{className:"flex flex-col items-center",children:[e.jsx("div",{className:"w-16 h-16 rounded-full flex items-center justify-center border-2 font-bold text-3xl",style:{borderColor:i,color:i,background:`${i}15`},children:t.grade}),e.jsx("span",{className:"text-evo-fog text-xs mt-1 ",children:"Grade"})]})]})]}),e.jsx("p",{className:"text-evo-fog text-sm uppercase tracking-widest mb-4",children:"Overall Brand Score"}),e.jsx("h2",{className:"text-2xl md:text-3xl font-bold text-white max-w-2xl mx-auto leading-tight",children:t.headline})]})},ie=({rec:t,delay:i})=>e.jsxs(m.div,{initial:{opacity:0,y:30},animate:{opacity:1,y:0},transition:{duration:.6,delay:i,ease:"easeOut"},className:"bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 border-t-2",style:{borderTopColor:"#22C8E5"},children:[e.jsxs("div",{className:"flex items-start justify-between mb-4",children:[e.jsx("span",{className:"font-bold text-[#22C8E5]/30 text-5xl leading-none",children:String(t.priority).padStart(2,"0")}),e.jsxs("div",{className:"flex gap-2 flex-wrap justify-end",children:[e.jsxs("span",{className:`text-xs px-2 py-1 rounded-2xl border font-semibold ${X[t.impact]}`,children:[t.impact," Impact"]}),e.jsxs("span",{className:"text-xs px-2 py-1 rounded-2xl border border-white/10 text-evo-fog ",children:[t.effort," Effort"]})]})]}),e.jsx("h3",{className:"font-bold text-white text-xl mb-3",children:t.title}),e.jsx("p",{className:"text-white/60 text-sm leading-relaxed",children:t.detail}),t.roiNote&&e.jsxs("p",{className:"text-[#22C8E5]/80 text-xs leading-relaxed mt-4 pt-4 border-t border-white/10 flex items-start gap-2",children:[e.jsx(O,{size:13,className:"flex-shrink-0 mt-0.5"}),t.roiNote]})]}),ae=({roadmap:t})=>!t||t.length===0?null:e.jsxs(m.div,{initial:{opacity:0},animate:{opacity:1},transition:{duration:.5,delay:1.35},className:"mb-16",children:[e.jsx("h3",{className:"font-bold text-white text-2xl md:text-3xl mb-6",children:"Your 90-Day Roadmap"}),e.jsx("div",{className:"grid md:grid-cols-3 gap-5",children:t.map((i,a)=>e.jsxs(m.div,{initial:{opacity:0,y:20},animate:{opacity:1,y:0},transition:{duration:.5,delay:1.35+a*.1},className:"bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6",children:[e.jsx("p",{className:"text-[#22C8E5] text-xs font-bold uppercase tracking-widest mb-2",children:i.phase}),e.jsx("h4",{className:"font-bold text-white text-lg mb-4",children:i.focus}),e.jsx("ul",{className:"space-y-2.5",children:i.actions.map((o,n)=>e.jsxs("li",{className:"flex items-start gap-2.5 text-white/60 text-sm leading-relaxed",children:[e.jsx("span",{className:"w-1.5 h-1.5 bg-[#22C8E5] rounded-full mt-1.5 flex-shrink-0"}),o]},n))})]},a))})]}),se=({comparison:t,businessName:i})=>t?e.jsxs(m.div,{initial:{opacity:0,y:30},animate:{opacity:1,y:0},transition:{duration:.7,delay:1},className:"bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 mb-16",children:[e.jsxs("h3",{className:"font-bold text-white text-xl mb-2",children:["You vs. ",t.competitor_name||"Your Competitor"]}),t.summary&&e.jsx("p",{className:"text-white/50 text-sm leading-relaxed mb-6",children:t.summary}),e.jsx("div",{className:"overflow-x-auto",children:e.jsxs("table",{className:"w-full text-sm min-w-[420px]",children:[e.jsx("thead",{children:e.jsxs("tr",{className:"border-b border-white/10",children:[e.jsx("th",{className:"text-left text-evo-fog font-semibold uppercase text-xs tracking-wider py-2 pr-4",children:"Factor"}),e.jsx("th",{className:"text-left text-evo-fog font-semibold uppercase text-xs tracking-wider py-2 pr-4",children:i||"You"}),e.jsx("th",{className:"text-left text-evo-fog font-semibold uppercase text-xs tracking-wider py-2",children:t.competitor_name||"Them"})]})}),e.jsx("tbody",{children:t.rows.map((a,o)=>e.jsxs("tr",{className:"border-b border-white/5 last:border-0",children:[e.jsx("td",{className:"py-3 pr-4 text-white/70 font-medium",children:a.factor}),e.jsx("td",{className:`py-3 pr-4 ${a.edge==="you"?"text-green-400 font-semibold":"text-white/60"}`,children:a.you}),e.jsx("td",{className:`py-3 ${a.edge==="them"?"text-red-400 font-semibold":"text-white/60"}`,children:a.them})]},o))})]})})]}):null,oe=t=>{let i=t;return i?(!Array.isArray(i)&&typeof i=="object"&&(i=Object.values(i)),Array.isArray(i)?i.filter(a=>a&&typeof a=="object").map((a,o)=>({priority:a.priority??o+1,impact:a.impact||a.impact_level||a.impactLevel||"Medium",effort:a.effort||a.effort_level||a.effortLevel||"Medium",title:a.title||a.name||a.recommendation||a.action||a.summary||`Recommendation ${o+1}`,detail:a.detail||a.description||a.details||a.body||"",roiNote:a.roi_note||a.roiNote||""})):[]):[]},ne=t=>Array.isArray(t)?t.filter(i=>i&&typeof i=="object"&&(i.phase||i.focus)).map(i=>({phase:i.phase||"",focus:i.focus||"",actions:Array.isArray(i.actions)?i.actions.filter(Boolean):[]})):[],re=[{priority:1,impact:"High",effort:"Medium",title:"Develop Brand Guidelines",detail:"Create a unified style guide covering colors, fonts, and tone of voice to ensure visual consistency across all platforms."},{priority:2,impact:"Medium",effort:"Low",title:"Refresh Website Messaging",detail:"Update your website copy to speak directly to your target audience and clearly communicate your unique value proposition."},{priority:3,impact:"Medium",effort:"High",title:"Build a Content Strategy",detail:"Implement a consistent content calendar across social channels to increase brand visibility and audience engagement."}],le=t=>{const i=t.overall_score??t.overallScore??t.score,a=oe(t.recommendations),o=Array.isArray(t.gaps)&&t.gaps.length>0?t.gaps:Array.isArray(t.weaknesses)&&t.weaknesses.length>0?t.weaknesses:[];return{...t,overall_score:Number.isFinite(Number(i))?Number(i):0,grade:t.grade||"C",headline:t.headline||t.summary||"",strengths:Array.isArray(t.strengths)&&t.strengths.length>0?t.strengths:Array.isArray(t.positives)&&t.positives.length>0?t.positives:["Industry experience","Clear understanding of your challenges"],gaps:o.length>0?o:["Inconsistent visual identity","Limited digital presence","Undefined target audience"],recommendations:a.length>0?a:re,roadmap:ne(t.roadmap),competitiveComparison:t.competitive_comparison&&t.competitive_comparison.available&&Array.isArray(t.competitive_comparison.rows)&&t.competitive_comparison.rows.length>0?t.competitive_comparison:null,categories:(()=>{const n=Number.isFinite(Number(t.overall_score??t.score))?Number(t.overall_score??t.score):60,l={visual_identity:{label:"Visual Identity",score:Math.min(100,n+5),insight:"Visual consistency needs attention."},digital_presence:{label:"Digital Presence",score:n,insight:"Online footprint is average."},brand_clarity:{label:"Brand Clarity",score:Math.max(0,n-5),insight:"Brand voice could be sharper."},audience_alignment:{label:"Audience Alignment",score:Math.max(0,n-8),insight:"Messaging could speak more directly to your ideal client."},competitive_position:{label:"Competitive Position",score:Math.min(100,n+2),insight:"Standing out from competitors needs sharper differentiation."}};return t.categories?Array.isArray(t.categories)?t.categories.length===0?l:Object.fromEntries(t.categories.map((c,g)=>[`cat${g}`,c])):typeof t.categories=="object"&&Object.keys(t.categories).length>0?t.categories:l:l})(),cta:t.cta||"Ready to take your brand to the next level?"}},ve=({report:t,onDownloadPDF:i,isLoading:a,hasWebsite:o,prefillEmail:n,prefillName:l})=>{if(a)return e.jsx(ee,{hasWebsite:o});if(!t)return null;const c=le(t),g=c.categories?Object.values(c.categories):[],r=async()=>{i&&i()};return e.jsx("div",{className:"min-h-screen bg-[#04080f] pt-8 pb-20",children:e.jsxs("div",{className:"container mx-auto px-4 max-w-5xl",children:[e.jsx(te,{report:c}),e.jsxs("div",{className:"grid md:grid-cols-2 gap-8 mb-16",children:[e.jsxs(m.div,{initial:{opacity:0,y:30},animate:{opacity:1,y:0},transition:{duration:.7,delay:.3},className:"bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 flex flex-col",children:[e.jsx("h3",{className:"font-bold text-white text-xl mb-4 text-center",children:"Brand Radar"}),e.jsx(K,{categories:c.categories})]}),e.jsx("div",{className:"flex flex-col gap-4",children:g.map((p,x)=>e.jsxs(m.div,{initial:{opacity:0,x:20},animate:{opacity:1,x:0},transition:{duration:.5,delay:.3+x*.08},className:"bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl px-5 py-4",children:[e.jsxs("div",{className:"flex items-center justify-between mb-2",children:[e.jsx("span",{className:"font-semibold text-white text-base",children:p.label}),e.jsxs("span",{className:"font-bold text-[#22C8E5]",children:[p.score,"/100"]})]}),e.jsx("div",{className:"w-full h-1 bg-white/10 rounded-full overflow-hidden",children:e.jsx(m.div,{className:"h-full rounded-full bg-[#22C8E5]",initial:{width:0},animate:{width:`${p.score}%`},transition:{duration:.9,delay:.5+x*.08,ease:"easeOut"}})})]},p.label))})]}),e.jsxs(m.div,{initial:{opacity:0,y:30},animate:{opacity:1,y:0},transition:{duration:.7,delay:.9},className:"grid md:grid-cols-2 gap-6 mb-16",children:[e.jsxs("div",{className:"bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6",children:[e.jsxs("h3",{className:"font-bold text-white text-xl mb-5 flex items-center gap-2",children:[e.jsx(D,{size:20,className:"text-green-400"}),"What's Working"]}),e.jsx("ul",{className:"space-y-3",children:c.strengths.map((p,x)=>e.jsxs("li",{className:"flex items-start gap-3 text-white/70 text-sm leading-relaxed",children:[e.jsx("span",{className:"w-1.5 h-1.5 bg-green-400 rounded-full mt-2 flex-shrink-0"}),p]},x))})]}),e.jsxs("div",{className:"bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6",children:[e.jsxs("h3",{className:"font-bold text-white text-xl mb-5 flex items-center gap-2",children:[e.jsx(O,{size:20,className:"text-[#22C8E5]"}),"Where to Grow"]}),e.jsx("ul",{className:"space-y-3",children:c.gaps.map((p,x)=>e.jsxs("li",{className:"flex items-start gap-3 text-white/70 text-sm leading-relaxed",children:[e.jsx(T,{size:14,className:"text-[#22C8E5] mt-1 flex-shrink-0"}),p]},x))})]})]}),e.jsx(se,{comparison:c.competitiveComparison,businessName:c.businessName}),e.jsxs(m.div,{initial:{opacity:0},animate:{opacity:1},transition:{duration:.5,delay:1.2},className:"mb-16",children:[e.jsx("h3",{className:"font-bold text-white text-2xl md:text-3xl mb-6",children:"Your Action Plan"}),e.jsx("div",{className:"grid md:grid-cols-3 gap-5",children:c.recommendations.map((p,x)=>e.jsx(ie,{rec:p,delay:1.2+x*.1},x))})]}),e.jsx(ae,{roadmap:c.roadmap}),e.jsxs(m.div,{initial:{opacity:0,y:30},animate:{opacity:1,y:0},transition:{duration:.7,delay:1.5},className:"bg-gradient-to-br from-[#003258] to-[#022040] border border-[#22C8E5]/20 rounded-2xl p-8 md:p-10 text-center",children:[e.jsx("p",{className:"text-white/80 text-lg mb-6 max-w-2xl mx-auto leading-relaxed",children:c.cta}),e.jsxs("div",{className:"flex flex-col sm:flex-row gap-6 sm:gap-4 justify-center mb-6",children:[e.jsx("div",{className:"flex flex-col items-center",children:e.jsxs(F,{to:"/contact",className:"inline-flex items-center justify-center w-full sm:w-auto gap-2 px-8 py-4 bg-[#22C8E5] text-[#003258] rounded-2xl font-bold uppercase tracking-wider hover:bg-[#1db5d0] transition-colors",id:"audit-book-call-btn",children:[e.jsx(Y,{size:18}),"Book a Free Strategy Call"]})}),e.jsx("div",{className:"flex flex-col items-center",children:e.jsxs("button",{onClick:r,className:"inline-flex items-center justify-center w-full sm:w-auto gap-2 px-8 py-4 border border-[#22C8E5]/40 text-[#22C8E5] rounded-2xl font-bold uppercase tracking-wider hover:border-[#22C8E5] transition-colors cursor-pointer h-[56px]",id:"audit-download-pdf-btn",children:[e.jsx(W,{size:18}),"Download PDF Report"]})})]}),e.jsx("p",{className:"text-evo-fog text-sm ",children:"Keisha Solomon · CEO, EVOBRAND Concepts · Ellis County, TX"}),e.jsx(Z,{prefillEmail:n,prefillName:l})]})]})})},w="#22C8E5",v="#003258",B="#04080f",M={High:"background:#fee2e2;color:#dc2626",Medium:"background:#fef9c3;color:#ca8a04",Low:"background:#dcfce7;color:#16a34a"};function de(t){return t.map(i=>{const a=Math.min(100,Math.max(0,i.score||0)),o=a>=75?"#22d3a0":a>=50?w:"#f59e0b";return`
      <div style="margin-bottom:20px;">
        <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:6px;">
          <span style="font-size:13px;font-weight:600;color:#1e293b;">${i.label}</span>
          <span style="font-size:18px;font-weight:800;color:${v};">${a}</span>
        </div>
        <div style="height:8px;background:#e2e8f0;border-radius:99px;overflow:hidden;">
          <div style="height:8px;background:${o};border-radius:99px;width:${a}%;"></div>
        </div>
        <p style="font-size:11px;color:#64748b;margin-top:4px;">${i.insight||""}</p>
      </div>
    `}).join("")}function ce(t){const i=Number.isFinite(Number(t.overall_score))?Number(t.overall_score):60,a={visual_identity:{label:"Visual Identity",score:Math.min(100,i+5),insight:"Visual consistency needs attention."},digital_presence:{label:"Digital Presence",score:i,insight:"Online footprint is average."},brand_clarity:{label:"Brand Clarity",score:Math.max(0,i-5),insight:"Brand voice could be sharper."},audience_alignment:{label:"Audience Alignment",score:Math.max(0,i-8),insight:"Messaging could speak more directly to your ideal client."},competitive_position:{label:"Competitive Position",score:Math.min(100,i+2),insight:"Standing out from competitors needs sharper differentiation."}};let o=t.categories;(!o||typeof o=="object"&&!Array.isArray(o)&&Object.keys(o).length===0)&&(o=a),Array.isArray(o)&&o.length===0&&(o=a);const n=[{priority:1,impact:"High",effort:"Medium",title:"Develop Brand Guidelines",detail:"Create a unified document to ensure visual consistency across all platforms."},{priority:2,impact:"Medium",effort:"Low",title:"Refresh Website Messaging",detail:"Update your copy to target your specific audience more directly."},{priority:3,impact:"Medium",effort:"High",title:"Build a Content Strategy",detail:"Implement a cohesive content calendar for your social channels."}];let l=t.recommendations;!l||!Array.isArray(l)||l.length===0?l=n:(l=l.map((r,p)=>{var x,h;return{priority:r.priority??p+1,impact:r.impact||"Medium",effort:r.effort||"Medium",title:r.title||r.name||r.recommendation||((x=n[p])==null?void 0:x.title)||`Recommendation ${p+1}`,detail:r.detail||r.description||r.details||((h=n[p])==null?void 0:h.detail)||"",roiNote:r.roi_note||r.roiNote||""}}),l.every(r=>!r.title||r.title.startsWith("Recommendation"))&&(l=n));const c=Array.isArray(t.roadmap)?t.roadmap.filter(r=>r&&(r.phase||r.focus)).map(r=>({phase:r.phase||"",focus:r.focus||"",actions:Array.isArray(r.actions)?r.actions.filter(Boolean):[]})):[],g=t.competitive_comparison&&t.competitive_comparison.available&&Array.isArray(t.competitive_comparison.rows)&&t.competitive_comparison.rows.length>0?t.competitive_comparison:null;return{...t,overall_score:i,grade:t.grade||"C",headline:t.headline||t.summary||"Your brand audit is complete.",categories:o,strengths:Array.isArray(t.strengths)&&t.strengths.length>0?t.strengths:["Industry experience","Clear understanding of your challenges"],gaps:Array.isArray(t.gaps)&&t.gaps.length>0?t.gaps:["Inconsistent visual identity","Limited digital presence","Undefined target audience"],recommendations:l,roadmap:c,competitiveComparison:g,cta:t.cta||"Ready to take your brand to the next level? Let's build something great together."}}function pe(t,i,a){const o=ce(t),n=Array.isArray(o.categories)?o.categories:Object.values(o.categories),l=o.recommendations||[],c=o.grade==="A"?"#22d3a0":o.grade==="B"?"#4ade80":o.grade==="C"?"#facc15":o.grade==="D"?"#fb923c":"#f87171",g={A:"Excellent",B:"Good",C:"Average",D:"Needs Work",F:"Critical"}[o.grade]||"",r=(o.strengths||[]).map(s=>`
    <div style="display:flex;align-items:flex-start;gap:10px;margin-bottom:12px;">
      <div style="flex-shrink:0;width:20px;height:20px;border-radius:50%;background:#dcfce7;display:flex;align-items:center;justify-content:center;margin-top:1px;">
        <span style="color:#16a34a;font-size:11px;font-weight:700;">✓</span>
      </div>
      <span style="font-size:13px;color:#374151;line-height:1.6;">${s}</span>
    </div>
  `).join(""),p=(o.gaps||[]).map(s=>`
    <div style="display:flex;align-items:flex-start;gap:10px;margin-bottom:12px;">
      <div style="flex-shrink:0;width:20px;height:20px;border-radius:50%;background:#fff7ed;display:flex;align-items:center;justify-content:center;margin-top:1px;">
        <span style="color:#ea580c;font-size:11px;font-weight:700;">→</span>
      </div>
      <span style="font-size:13px;color:#374151;line-height:1.6;">${s}</span>
    </div>
  `).join(""),x=l.map((s,d)=>{const u=M[s.impact]||M.Medium,f=String(s.priority||d+1).padStart(2,"0");return`
      <div style="background:white;border-radius:12px;padding:20px 24px;margin-bottom:16px;border:1px solid #e2e8f0;border-left:4px solid ${w};break-inside:avoid;box-shadow:0 1px 3px rgba(0,0,0,0.06);">
        <div style="display:flex;align-items:flex-start;gap:16px;">
          <div style="font-size:36px;font-weight:900;color:#e2e8f0;line-height:1;flex-shrink:0;">${f}</div>
          <div style="flex:1;">
            <div style="font-size:15px;font-weight:700;color:${v};margin-bottom:6px;">${s.title}</div>
            <div style="font-size:12px;color:#4b5563;line-height:1.7;margin-bottom:10px;">${s.detail}</div>
            <div style="margin-bottom:10px;">
              <span style="font-size:10px;font-weight:700;${u};padding:3px 10px;border-radius:99px;margin-right:6px;">${s.impact} Impact</span>
              <span style="font-size:10px;font-weight:700;background:#f1f5f9;color:#64748b;padding:3px 10px;border-radius:99px;">${s.effort} Effort</span>
            </div>
            ${s.roiNote?`<div style="font-size:11px;color:${v};font-weight:600;border-top:1px solid #f1f5f9;padding-top:8px;">${s.roiNote}</div>`:""}
          </div>
        </div>
      </div>
    `}).join(""),h=de(n),y=o.roadmap||[],$=y.map(s=>`
    <div style="background:white;border:1px solid #e2e8f0;border-radius:12px;padding:20px;margin-bottom:14px;break-inside:avoid;">
      <div style="font-size:10px;font-weight:700;color:${w};text-transform:uppercase;letter-spacing:1.5px;margin-bottom:4px;">${s.phase}</div>
      <div style="font-size:15px;font-weight:700;color:${v};margin-bottom:10px;">${s.focus}</div>
      <ul>
        ${s.actions.map(d=>`<li style="font-size:12px;color:#4b5563;line-height:1.9;">• ${d}</li>`).join("")}
      </ul>
    </div>
  `).join(""),b=o.competitiveComparison,A=b?b.rows.map(s=>`
    <tr>
      <td style="padding:10px 12px;font-size:12px;color:#374151;font-weight:600;border-bottom:1px solid #f1f5f9;">${s.factor}</td>
      <td style="padding:10px 12px;font-size:12px;border-bottom:1px solid #f1f5f9;color:${s.edge==="you"?"#16a34a":"#4b5563"};font-weight:${s.edge==="you"?"700":"400"};">${s.you}</td>
      <td style="padding:10px 12px;font-size:12px;border-bottom:1px solid #f1f5f9;color:${s.edge==="them"?"#dc2626":"#4b5563"};font-weight:${s.edge==="them"?"700":"400"};">${s.them}</td>
    </tr>
  `).join(""):"";return`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>EVOBRAND Brand Audit: ${i}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@600;700&family=Inter:wght@400;500;600;700;900&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Inter', Arial, sans-serif; color: #111827; background: white; }

    /* ── Cover ── */
    .cover {
      background: ${B};
      color: white;
      padding: 0;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      page-break-after: always;
      position: relative;
      overflow: hidden;
    }
    .cover-accent {
      position: absolute;
      top: -120px; right: -120px;
      width: 500px; height: 500px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(34,200,229,0.12) 0%, transparent 70%);
      pointer-events: none;
    }
    .cover-accent2 {
      position: absolute;
      bottom: -80px; left: -80px;
      width: 360px; height: 360px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(0,50,88,0.5) 0%, transparent 70%);
      pointer-events: none;
    }
    .cover-inner { padding: 56px 56px 40px; flex: 1; display: flex; flex-direction: column; justify-content: space-between; position: relative; z-index: 1; }
    .cover-logo-img { height: 40px; margin-bottom: 60px; display: block; }
    .cover-eyebrow { font-size: 10px; color: ${w}; letter-spacing: 3px; text-transform: uppercase; font-weight: 600; margin-bottom: 12px; }
    .cover-business { font-family: 'Rajdhani', sans-serif; font-size: 44px; color: white; font-weight: 700; line-height: 1.05; max-width: 520px; }
    .cover-date { font-size: 12px; color: rgba(255,255,255,0.35); margin-top: 10px; }
    .cover-score-row { display: flex; align-items: stretch; gap: 16px; margin-top: 48px; }
    .score-card {
      background: ${v};
      border-radius: 16px;
      padding: 28px 32px;
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }
    .score-card-label { font-size: 9px; color: rgba(255,255,255,0.4); letter-spacing: 2.5px; text-transform: uppercase; margin-bottom: 8px; }
    .big-score { font-family: 'Rajdhani', sans-serif; font-size: 72px; color: ${w}; font-weight: 700; line-height: 1; }
    .grade-card {
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 16px;
      padding: 28px 32px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-width: 120px;
    }
    .grade-ring {
      width: 70px; height: 70px; border-radius: 50%;
      border: 3px solid ${c};
      display: flex; align-items: center; justify-content: center;
      margin-bottom: 8px;
    }
    .grade-letter { font-family: 'Rajdhani', sans-serif; font-size: 34px; color: ${c}; font-weight: 700; line-height: 1; }
    .grade-sub { font-size: 10px; color: rgba(255,255,255,0.35); letter-spacing: 1px; text-transform: uppercase; }
    .cover-headline { font-size: 14px; color: rgba(255,255,255,0.6); margin-top: 24px; line-height: 1.7; max-width: 540px; font-style: italic; }
    .cover-footer { font-size: 10px; color: rgba(255,255,255,0.2); border-top: 1px solid rgba(255,255,255,0.07); padding-top: 16px; }

    /* ── Page Layout ── */
    .page { padding: 52px 56px; page-break-before: always; }
    .page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 36px; padding-bottom: 16px; border-bottom: 2px solid #f1f5f9; }
    .page-logo { height: 28px; opacity: 0.5; }
    .page-title { font-family: 'Rajdhani', sans-serif; font-size: 24px; font-weight: 700; color: ${v}; }
    .section-label { font-size: 9px; font-weight: 700; color: ${w}; letter-spacing: 2.5px; text-transform: uppercase; margin-bottom: 6px; }
    .section-heading { font-family: 'Rajdhani', sans-serif; font-size: 20px; font-weight: 700; color: ${v}; margin-bottom: 20px; }
    .divider { height: 1px; background: #f1f5f9; margin: 32px 0; }
    .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; }
    ul { list-style: none; }

    /* ── CTA Page ── */
    .cta-page {
      background: linear-gradient(135deg, ${B} 0%, ${v} 100%);
      color: white; padding: 80px 60px; text-align: center;
      min-height: 100vh; display: flex; flex-direction: column;
      justify-content: center; align-items: center;
      page-break-before: always;
    }
    .cta-eyebrow { font-size: 10px; color: ${w}; letter-spacing: 3px; text-transform: uppercase; font-weight: 600; margin-bottom: 16px; }
    .cta-title { font-family: 'Rajdhani', sans-serif; font-size: 36px; color: white; margin-bottom: 20px; line-height: 1.2; }
    .cta-text { font-size: 15px; color: rgba(255,255,255,0.7); line-height: 1.8; max-width: 480px; margin-bottom: 36px; }
    .cta-pill { display: inline-block; background: ${w}; color: ${v}; font-family: 'Rajdhani', sans-serif; font-size: 18px; font-weight: 700; padding: 12px 32px; border-radius: 99px; margin-bottom: 36px; }
    .cta-contact { font-size: 11px; color: rgba(255,255,255,0.3); line-height: 1.8; }

    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .page { page-break-before: always; }
    }
  </style>
</head>
<body>

  <!-- ── Cover ── -->
  <div class="cover">
    <div class="cover-accent"></div>
    <div class="cover-accent2"></div>
    <div class="cover-inner">
      <div>
        <img class="cover-logo-img" src="${window.location.origin}/logo.png" alt="EVOBRAND" onerror="this.style.display='none'" />
        <div class="cover-eyebrow">Brand Audit Report · Confidential</div>
        <div class="cover-business">${i}</div>
        <div class="cover-date">Generated ${a}</div>
        <div class="cover-score-row">
          <div class="score-card">
            <div class="score-card-label">Overall Brand Score</div>
            <div class="big-score">${o.overall_score}<span style="font-size:28px;color:rgba(34,200,229,0.5)">/100</span></div>
          </div>
          <div class="grade-card">
            <div class="grade-ring"><span class="grade-letter">${o.grade}</span></div>
            <div class="grade-sub">${g}</div>
          </div>
        </div>
        <div class="cover-headline">"${o.headline}"</div>
      </div>
      <div class="cover-footer">Confidential · EVOBRAND Concepts · evobrand.net</div>
    </div>
  </div>

  <!-- ── Category Scores ── -->
  <div class="page">
    <div class="page-header">
      <div class="page-title">Brand Performance Breakdown</div>
      <img class="page-logo" src="${window.location.origin}/logo.png" alt="EVOBRAND" onerror="this.style.display='none'" />
    </div>
    <div class="section-label">Score by Category</div>
    <div style="margin-top:8px;">${h}</div>
  </div>

  <!-- ── Strengths & Gaps ── -->
  <div class="page">
    <div class="page-header">
      <div class="page-title">Brand Analysis</div>
      <img class="page-logo" src="${window.location.origin}/logo.png" alt="EVOBRAND" onerror="this.style.display='none'" />
    </div>
    <div class="two-col">
      <div>
        <div class="section-label">What's Working</div>
        <div class="section-heading">Your Strengths</div>
        ${r}
      </div>
      <div>
        <div class="section-label">Where to Grow</div>
        <div class="section-heading">Growth Opportunities</div>
        ${p}
      </div>
    </div>
  </div>

  ${b?`
  <!-- ── Competitive Comparison ── -->
  <div class="page">
    <div class="page-header">
      <div class="page-title">Competitive Position</div>
      <img class="page-logo" src="${window.location.origin}/logo.png" alt="EVOBRAND" onerror="this.style.display='none'" />
    </div>
    <div class="section-label">Head-to-Head</div>
    <div class="section-heading">You vs. ${b.competitor_name||"Your Competitor"}</div>
    ${b.summary?`<p style="font-size:13px;color:#4b5563;line-height:1.7;margin-bottom:20px;">${b.summary}</p>`:""}
    <table style="width:100%;border-collapse:collapse;">
      <thead>
        <tr style="border-bottom:2px solid #e2e8f0;">
          <th style="text-align:left;padding:8px 12px;font-size:10px;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;">Factor</th>
          <th style="text-align:left;padding:8px 12px;font-size:10px;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;">${i}</th>
          <th style="text-align:left;padding:8px 12px;font-size:10px;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;">${b.competitor_name||"Them"}</th>
        </tr>
      </thead>
      <tbody>${A}</tbody>
    </table>
  </div>`:""}

  <!-- ── Action Plan ── -->
  <div class="page">
    <div class="page-header">
      <div class="page-title">Your Action Plan</div>
      <img class="page-logo" src="${window.location.origin}/logo.png" alt="EVOBRAND" onerror="this.style.display='none'" />
    </div>
    <div class="section-label">Prioritized Recommendations</div>
    <div style="margin-top:16px;">${x}</div>
  </div>

  ${y.length>0?`
  <!-- ── 90-Day Roadmap ── -->
  <div class="page">
    <div class="page-header">
      <div class="page-title">90-Day Roadmap</div>
      <img class="page-logo" src="${window.location.origin}/logo.png" alt="EVOBRAND" onerror="this.style.display='none'" />
    </div>
    <div class="section-label">Your Path Forward</div>
    <div style="margin-top:16px;">${$}</div>
  </div>`:""}

  <!-- ── CTA ── -->
  <div class="cta-page">
    <div class="cta-eyebrow">Next Steps</div>
    <div class="cta-title">Ready to Elevate<br/>Your Brand?</div>
    <div class="cta-text">${o.cta}</div>
    <div class="cta-pill">evobrand.net</div>
    <div class="cta-contact">
      Keisha Solomon · CEO, EVOBRAND Concepts<br/>
      info@evobrand.net
    </div>
  </div>

</body>
</html>`}const we=(t,i)=>{const a=new Date().toLocaleDateString("en-US",{year:"numeric",month:"long",day:"numeric"}),o=pe(t,i,a),n=window.open("","_blank","width=900,height=700");if(!n){alert("Please allow popups to download the PDF report.");return}n.document.open(),n.document.write(o),n.document.close(),n.onload=()=>{setTimeout(()=>{n.focus(),n.print()},500)}};export{ve as A,we as d};
