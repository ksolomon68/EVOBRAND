(function(){const p="cbc-a11y-v3",r={a11y:'<svg viewBox="0 0 24 24" fill="#003258"><circle cx="12" cy="4" r="2"/><path d="M19 9H5a1 1 0 000 2h4.5l-1.6 7.4a1 1 0 001.96.4L11 13h2l1.14 5.84a1 1 0 001.96-.4L14.5 11H19a1 1 0 000-2z"/></svg>',wheelchair:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="5" r="2"/><path d="M8 9h3l1 5h4"/><path d="M10 14l-1 5"/><path d="M8 18a5 5 0 1 0 8 0"/></svg>',eye:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>',droplet:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>',df:'<svg viewBox="0 0 24 24"><text x="3" y="17" font-size="14" font-weight="700" fill="currentColor" font-family="Georgia,serif">Df</text></svg>',headphones:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/></svg>',contrast:'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 2a10 10 0 0 1 0 20V2z" fill="currentColor"/></svg>',moon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>',palette:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/><circle cx="7.5" cy="12.5" r="1.5" fill="currentColor"/><circle cx="10.5" cy="7.5" r="1.5" fill="currentColor"/><circle cx="16.5" cy="10.5" r="1.5" fill="currentColor"/></svg>',textA:'<svg viewBox="0 0 24 24"><text x="2" y="18" font-size="18" font-weight="700" fill="currentColor" font-family="Arial,sans-serif">A</text><text x="14" y="16" font-size="11" font-weight="700" fill="currentColor" font-family="Arial,sans-serif">A</text></svg>',link:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>',cursor:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4l7.07 17 2.51-7.39L21 11.07z"/></svg>',guide:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="2" y1="12" x2="22" y2="12"/><polyline points="5 8 2 12 5 16"/><polyline points="19 8 22 12 19 16"/></svg>',mask:'<svg viewBox="0 0 24 24" fill="currentColor"><rect x="2" y="2" width="20" height="7" rx="1" opacity="0.35"/><rect x="2" y="15" width="20" height="7" rx="1" opacity="0.35"/><rect x="2" y="9" width="20" height="6" rx="1" opacity="0.08"/></svg>',pause:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>',keyboard:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="6" width="20" height="12" rx="2"/><line x1="6" y1="10" x2="6.01" y2="10" stroke-width="3" stroke-linecap="round"/><line x1="10" y1="10" x2="10.01" y2="10" stroke-width="3" stroke-linecap="round"/><line x1="14" y1="10" x2="14.01" y2="10" stroke-width="3" stroke-linecap="round"/><line x1="18" y1="10" x2="18.01" y2="10" stroke-width="3" stroke-linecap="round"/><line x1="8" y1="14" x2="16" y2="14" stroke-linecap="round"/></svg>',underline:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 3v7a6 6 0 0 0 12 0V3"/><line x1="4" y1="21" x2="20" y2="21"/></svg>',headphone2:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/></svg>',reset:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="14" height="14"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-4.95"/></svg>'},d=[{id:"screenReader",label:"Screen Reader",ico:"headphones",cls:"aw-sr"},{id:"highContrast",label:"Contrast +",ico:"contrast",cls:"aw-contrast"},{id:"darkMode",label:"Dark Mode",ico:"moon",cls:"aw-dark"},{id:"desaturate",label:"Desaturate",ico:"palette",cls:"aw-desat"},{id:"highlightLinks",label:"Highlight Links",ico:"link",cls:"aw-hilite"},{id:"dyslexiaFont",label:"Dyslexia Font",ico:"df",cls:"aw-dyslexia"},{id:"bigCursor",label:"Big Cursor",ico:"cursor",cls:"aw-cursor"},{id:"readingGuide",label:"Reading Guide",ico:"guide",cls:"aw-guide-on"},{id:"readingMask",label:"Reading Mask",ico:"mask",cls:"aw-mask-on"},{id:"stopAnimations",label:"Stop Animations",ico:"pause",cls:"aw-freeze"},{id:"keyboardNav",label:"Keyboard Nav",ico:"keyboard",cls:"aw-keynav"},{id:"linkUnderline",label:"Link Underline",ico:"underline",cls:"aw-underline"}],u=[{id:"motor",label:`Motor
Impaired`,ico:"wheelchair",set:{keyboardNav:!0,bigCursor:!0,stopAnimations:!0}},{id:"visual",label:`Visually
Impaired`,ico:"eye",set:{highContrast:!0,textSize:130,screenReader:!0}},{id:"colorblind",label:`Color
Blind`,ico:"droplet",set:{desaturate:!0,linkUnderline:!0,highlightLinks:!0}},{id:"dyslexia",label:"Dyslexia",ico:"df",set:{dyslexiaFont:!0,linkUnderline:!0,readingGuide:!0}}],v={activeProfile:null,textSize:100,screenReader:!1,highContrast:!1,darkMode:!1,desaturate:!1,highlightLinks:!1,dyslexiaFont:!1,bigCursor:!1,readingGuide:!1,readingMask:!1,stopAnimations:!1,keyboardNav:!1,linkUnderline:!1};let t=b(),y=!1;function b(){try{return{...v,...JSON.parse(localStorage.getItem(p))}}catch{return{...v}}}function g(){try{localStorage.setItem(p,JSON.stringify(t))}catch{}}function c(){for(let e=110;e<=150;e+=10)document.documentElement.classList.remove(`aw-t${e}`);t.textSize>100&&document.documentElement.classList.add(`aw-t${Math.min(t.textSize,150)}`),d.forEach(e=>document.documentElement.classList.toggle(e.cls,!!t[e.id])),C(),z()}function k(e){var a;t[e]=!t[e],t.activeProfile=null,g(),c(),s((t[e]?"Enabled":"Disabled")+": "+(((a=d.find(i=>i.id===e))==null?void 0:a.label)||e))}function E(e){var a;if(t.activeProfile===e)t={...v};else{const i=u.find(n=>n.id===e);if(!i)return;t={...v,activeProfile:e,...i.set}}g(),c(),s(t.activeProfile?((a=u.find(i=>i.id===e))==null?void 0:a.label.replace(`
`," "))+" profile applied.":"Profile cleared.")}function B(){t={...v},g(),c(),s("All accessibility settings reset.")}function C(){const e=document.getElementById("a11y-badge");if(!e)return;const a=d.filter(i=>t[i.id]).length+(t.textSize!==100?1:0);e.textContent=a,e.classList.toggle("show",a>0)}function z(){d.forEach(n=>{const l=document.getElementById(`aw-card-${n.id}`);l&&(l.classList.toggle("on",!!t[n.id]),l.setAttribute("aria-checked",String(!!t[n.id])))}),u.forEach(n=>{const l=document.getElementById(`aw-prof-${n.id}`);l&&(l.classList.toggle("on",t.activeProfile===n.id),l.setAttribute("aria-pressed",String(t.activeProfile===n.id)))});const e=document.getElementById("aw-ts-val"),a=document.getElementById("aw-ts-dec"),i=document.getElementById("aw-ts-inc");e&&(e.textContent=t.textSize+"%"),a&&(a.disabled=t.textSize<=100),i&&(i.disabled=t.textSize>=150)}function s(e){const a=document.getElementById("a11y-live");a&&(a.textContent="",setTimeout(()=>{a.textContent=e},50))}function M(){const e=u.map(i=>`
      <button class="aw-profile" id="aw-prof-${i.id}" data-prof="${i.id}"
              aria-pressed="false">
        <span class="aw-profile-ico" aria-hidden="true">${r[i.ico]}</span>
        <span class="aw-profile-name">${i.label.replace(`
`,"<br>")}</span>
      </button>`).join(""),a=d.map(i=>`
      <button class="aw-card" id="aw-card-${i.id}" data-feat="${i.id}"
              role="switch" aria-checked="false">
        <span class="aw-card-ico" aria-hidden="true">${r[i.ico]}</span>
        <span class="aw-card-lbl">${i.label}</span>
      </button>`).join("");return`
      <div id="a11y-panel" role="dialog" aria-modal="true" aria-label="Accessibility Menu">
        <div class="aw-header">
          <div class="aw-header-icon">${r.a11y}</div>
          <div class="aw-header-copy">
            <h2>Accessibility Menu</h2>
            <p>Customize your experience · Alt+A</p>
          </div>
          <button class="aw-close" id="aw-close" aria-label="Close accessibility menu">&#x2715;</button>
        </div>

        <div class="aw-body">
          <div class="aw-section">
            <div class="aw-section-title">Accessibility Profiles</div>
            <div class="aw-profiles">${e}</div>
          </div>

          <div class="aw-section">
            <div class="aw-section-title">Text Size</div>
            <div class="aw-stepper">
              <div class="aw-stepper-lbl">${r.textA} Font Size</div>
              <div class="aw-stepper-ctrl">
                <button class="aw-step-btn" id="aw-ts-dec" aria-label="Decrease text size" disabled>&#8722;</button>
                <span class="aw-step-val" id="aw-ts-val">100%</span>
                <button class="aw-step-btn" id="aw-ts-inc" aria-label="Increase text size">&#43;</button>
              </div>
            </div>
          </div>

          <div class="aw-section">
            <div class="aw-section-title">Adjustments</div>
            <div class="aw-grid">${a}</div>
          </div>

          <button class="aw-reset" id="aw-reset">${r.reset}&nbsp; Reset All Settings</button>
        </div>

        <div class="aw-footer">
          <a class="stmt" href="/accessibility-statement" target="_blank" rel="noopener">Accessibility Statement</a>
          <div class="aw-branding">Accessibility by <a href="https://evobrand.net" target="_blank" rel="noopener noreferrer">EVOBRAND Concepts</a></div>
        </div>
      </div>

      <button id="a11y-trigger" aria-label="Open Accessibility Menu"
              aria-expanded="false" aria-controls="a11y-panel">
        ${r.a11y}
        <span id="a11y-badge" aria-hidden="true"></span>
      </button>

      <div id="a11y-overlay" aria-hidden="true"></div>
      <div id="a11y-guide"  aria-hidden="true"></div>
      <div id="a11y-mask"   aria-hidden="true"></div>
      <div id="a11y-live" role="status" aria-live="polite" aria-atomic="true"></div>
    `}function w(){y=!0,document.getElementById("a11y-panel").classList.add("open"),document.getElementById("a11y-overlay").classList.add("show"),document.getElementById("a11y-trigger").setAttribute("aria-expanded","true"),document.body.style.overflow="hidden",setTimeout(()=>{var e;return(e=document.getElementById("aw-close"))==null?void 0:e.focus()},50),s("Accessibility menu opened.")}function f(){y=!1,document.getElementById("a11y-panel").classList.remove("open"),document.getElementById("a11y-overlay").classList.remove("show"),document.getElementById("a11y-trigger").setAttribute("aria-expanded","false"),document.body.style.overflow="",document.getElementById("a11y-trigger").focus(),s("Accessibility menu closed.")}function L(){document.addEventListener("mousemove",e=>{t.readingGuide&&document.documentElement.style.setProperty("--aw-guide",e.clientY+"px"),t.readingMask&&document.documentElement.style.setProperty("--aw-mask",(e.clientY/innerHeight*100).toFixed(1)+"%")})}function A(e){e.addEventListener("keydown",a=>{if(a.key!=="Tab")return;const i=[...e.querySelectorAll('button:not(:disabled), a[href], [tabindex]:not([tabindex="-1"])')];if(!i.length)return;const n=i[0],l=i[i.length-1];a.shiftKey&&document.activeElement===n?(a.preventDefault(),l.focus()):!a.shiftKey&&document.activeElement===l&&(a.preventDefault(),n.focus())})}function S(){var n,l,x;const e=document.getElementById("a11y-panel"),a=document.getElementById("a11y-trigger"),i=document.getElementById("a11y-overlay");a.addEventListener("click",()=>y?f():w()),i.addEventListener("click",f),document.getElementById("aw-close").addEventListener("click",f),u.forEach(o=>{var h;(h=document.getElementById(`aw-prof-${o.id}`))==null||h.addEventListener("click",()=>E(o.id))}),d.forEach(o=>{var h;(h=document.getElementById(`aw-card-${o.id}`))==null||h.addEventListener("click",()=>k(o.id))}),(n=document.getElementById("aw-ts-inc"))==null||n.addEventListener("click",()=>{t.textSize>=150||(t.textSize=Math.min(t.textSize+10,150),t.activeProfile=null,g(),c(),s("Text size: "+t.textSize+"%"))}),(l=document.getElementById("aw-ts-dec"))==null||l.addEventListener("click",()=>{t.textSize<=100||(t.textSize=Math.max(t.textSize-10,100),t.activeProfile=null,g(),c(),s("Text size: "+t.textSize+"%"))}),(x=document.getElementById("aw-reset"))==null||x.addEventListener("click",B),document.addEventListener("keydown",o=>{if(o.key==="Escape"&&y){f();return}o.altKey&&o.key.toLowerCase()==="a"&&(o.preventDefault(),y?f():w())}),A(e)}function m(){["a11y-panel","a11y-trigger","a11y-overlay","a11y-guide","a11y-mask","a11y-live"].forEach(a=>{var i;return(i=document.getElementById(a))==null?void 0:i.remove()});const e=document.createElement("div");e.innerHTML=M(),document.body.appendChild(e),c(),S(),L()}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",m):m()})();
