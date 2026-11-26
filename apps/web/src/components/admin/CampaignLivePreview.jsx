import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Monitor, Smartphone, Loader2, Check, AlertTriangle, Eye } from 'lucide-react';
import { blocksToHtml } from './CampaignBlockEditor.jsx';
import { getReadinessChecks, collectResources } from './campaignReadiness.js';
export { getReadinessChecks } from './campaignReadiness.js';

const FRAMES = {
  desktop: { width: 640, height: 760, label: 'Desktop', icon: Monitor },
  mobile: { width: 375, height: 760, label: 'Mobile', icon: Smartphone },
};

/**
 * Live, in-browser preview of the email as subscribers will receive it.
 * The HTML comes from the server's real email template, so the preview
 * cannot drift from what actually gets sent.
 */
export default function CampaignLivePreview({ apiBase, subject, blocks, accentColor, headingFont, lists, targetListIds, purpose = 'newsletter', onPurposeChange }) {
  const [device, setDevice] = useState('desktop');
  const [html, setHtml] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [boxWidth, setBoxWidth] = useState(0);
  const [technical, setTechnical] = useState(null);
  const [checking, setChecking] = useState(false);
  const [checkVersion, setCheckVersion] = useState(0);
  const [verifyKey, setVerifyKey] = useState('');
  const boxRef = useRef(null);

  const contentHtml = useMemo(() => blocksToHtml(blocks, accentColor), [blocks, accentColor]);

  const assessmentKey = JSON.stringify([subject, contentHtml]);
  useEffect(() => {
    const controller = new AbortController();
    setChecking(true);
    const timer = setTimeout(async () => {
      try {
        const response = await fetch(`${apiBase}/api/crm/readiness`, {
          method: 'POST', signal: controller.signal,
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('evobrand_token')}` },
          body: JSON.stringify({ subject, html_content: contentHtml, resources: collectResources(contentHtml), verifyLinks: verifyKey === assessmentKey }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Technical checks unavailable');
        if (!controller.signal.aborted) setTechnical({ ...data, key: assessmentKey });
      } catch (error) {
        if (!controller.signal.aborted) setTechnical({key:assessmentKey, checks:[{id:'technical-error',status:'unknown',severity:'advisory',label:'Technical checks could not be completed',recommendation:`${error.message}. Recheck technical setup after resolving the connection or sign-in issue.`}]});
      } finally { if (!controller.signal.aborted) setChecking(false); }
    }, 700);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [apiBase, subject, contentHtml, assessmentKey, checkVersion, verifyKey]);

  // Re-render shortly after the admin stops typing.
  useEffect(() => {
    if (!blocks.length) {
      setHtml('');
      setError('');
      return undefined;
    }
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`${apiBase}/api/crm/preview-html`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ subject, html_content: contentHtml, accent_color: accentColor, heading_font: headingFont }),
          signal: controller.signal,
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Preview failed');
        setHtml(data.html);
        setError('');
      } catch (err) {
        if (err.name !== 'AbortError') setError(err.message || 'Preview failed');
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 350);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [apiBase, subject, contentHtml, accentColor, headingFont, blocks.length]);

  // Scale the fixed-width email frame down to fit the pane.
  useEffect(() => {
    const el = boxRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return undefined;
    const ro = new ResizeObserver(([entry]) => setBoxWidth(entry.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const frame = FRAMES[device];
  const scale = boxWidth ? Math.min(1, boxWidth / frame.width) : 1;
  const selected = lists.filter((l) => targetListIds.includes(String(l.id)));
  const recipients = selected.reduce((sum, l) => sum + (Number(l.contact_count) || 0), 0);
  const currentTechnical = technical?.key === assessmentKey ? technical : null;
  const { checks, score, critical, unverified } = getReadinessChecks({ subject, blocks, listCount: targetListIds.length, purpose, technical: currentTechnical?.checks });
  const scoreColor = score === 100 ? 'text-emerald-400' : score >= 70 ? 'text-amber-400' : 'text-red-400';

  return (
    <aside className="bg-[#0f1419] rounded-2xl border border-white/5 p-6 space-y-5" aria-label="Live email preview">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Eye size={18} className="text-[#22c8e5]" /> Live Preview
          {loading && <Loader2 size={14} className="animate-spin text-white/40" aria-label="Updating preview" />}
        </h3>
        <div className="flex gap-1 bg-[#1a2332] rounded-xl p-1" role="group" aria-label="Preview device">
          {Object.entries(FRAMES).map(([key, f]) => {
            const Icon = f.icon;
            return (
              <button
                key={key}
                type="button"
                aria-pressed={device === key}
                onClick={() => setDevice(key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${device === key ? 'bg-[#22c8e5] text-[#003258]' : 'text-white/50 hover:text-white'}`}
              >
                <Icon size={13} /> {f.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Inbox row: how it looks before the email is opened */}
      <div className="bg-[#1a2332] border border-white/10 rounded-xl px-4 py-3 text-sm">
        <div className="flex items-baseline justify-between gap-3">
          <span className="font-bold text-white truncate">EVOBRAND</span>
          <span className="text-[11px] text-white/30 flex-shrink-0">Now</span>
        </div>
        <div className={`truncate ${subject ? 'text-white' : 'text-white/30 italic'}`}>{subject || 'Subject line appears here'}</div>
        <div className="text-[11px] text-white/40 mt-1">
          To: {selected.length ? `${selected.map((l) => l.name).join(', ')} (${recipients} subscribers)` : 'no list selected'}
        </div>
      </div>

      {/* The email itself */}
      <div ref={boxRef} className="w-full">
        {html ? (
          <div
            className="mx-auto rounded-xl overflow-hidden border border-white/10 bg-[#0b0f1a]"
            style={{ width: frame.width * scale, height: frame.height * scale }}
          >
            <iframe
              title="Email preview"
              srcDoc={html}
              sandbox=""
              style={{ width: frame.width, height: frame.height, border: 0, transform: `scale(${scale})`, transformOrigin: 'top left', display: 'block' }}
            />
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-white/10 text-center text-white/30 text-sm py-16 px-6">
            Add a block to the email and the preview appears here, updating as you type.
          </div>
        )}
        {error && <p className="text-xs text-red-400 mt-2" role="alert">Preview unavailable: {error}</p>}
      </div>

      {/* Send readiness */}
      <div className="space-y-4">
        <div className="flex items-start gap-4">
          <div className={`text-3xl font-black leading-none tabular-nums ${scoreColor}`} aria-label={`Send readiness ${score} percent`}>{score}</div>
          <div>
            <p className="text-xs font-bold text-white/40 uppercase tracking-wider">Send readiness</p>
            <p className="text-xs text-white/60 mt-1" aria-live="polite">{critical ? `${critical} critical error${critical === 1 ? '' : 's'} to resolve` : 'No critical errors detected'} · {unverified} unverified</p>
            <p className="text-[11px] text-white/40 mt-1">Score covers assessed checks only. It does not guarantee delivery or inbox placement.</p>
          </div>
        </div>
        <label className="block text-xs text-white/60">Campaign purpose
          <select value={purpose} onChange={e => onPurposeChange?.(e.target.value)} className="mt-1 w-full bg-[#1a2332] border border-white/10 rounded-xl px-3 py-2 text-white">
            <option value="newsletter">Informational newsletter (CTA optional)</option>
            <option value="holiday">Holiday greeting (CTA optional)</option>
            <option value="promotion">Promotion (CTA recommended)</option>
          </select>
        </label>
        {[
          ['Critical errors', checks.filter(c => c.status === 'fail' && c.severity === 'critical')],
          ['Recommendations', checks.filter(c => c.status === 'fail' && c.severity !== 'critical')],
          ['Not verified', checks.filter(c => c.status === 'unknown')],
          ['Checks passed', checks.filter(c => c.status === 'pass')],
        ].map(([label, items]) => items.length > 0 && <details key={label} open={label !== 'Checks passed'} className="text-xs">
          <summary className={`cursor-pointer font-bold ${label === 'Critical errors' ? 'text-red-300' : 'text-white/60'}`}>{label} ({items.length})</summary>
          <ul className="space-y-3 mt-2">
            {items.map(c => <li key={c.id} className={`flex items-start gap-2 ${c.status === 'pass' ? 'text-white/60' : c.severity === 'critical' ? 'text-red-300' : 'text-amber-200'}`}>
              {c.status === 'pass' ? <Check size={13} className="text-emerald-400 mt-0.5 flex-shrink-0" /> : <AlertTriangle size={13} className="mt-0.5 flex-shrink-0" />}
              <div className="min-w-0 break-words"><p>{c.label}</p>{c.recommendation && <p className="text-white/60 mt-1">{c.recommendation}</p>}
                {c.details?.map((detail,i) => typeof detail === 'string' ? <p className="text-white/50 mt-1 break-all" key={i}>{detail}</p> : <div key={i} className="mt-2 border-l border-[#22c8e5]/40 pl-2">
                  <p><strong>“{detail.word}”</strong> — {detail.location}, characters {detail.start}–{detail.end}</p>
                  <p className="text-white/60 mt-1">“{detail.excerpt}”</p><p className="text-white/50 mt-1">{detail.reason} {detail.recommendation}</p>
                </div>)}
              </div>
            </li>)}
          </ul>
        </details>)}
        <div className="flex flex-wrap gap-2">
          <button type="button" disabled={checking} onClick={() => setCheckVersion(v => v + 1)} className="text-xs border border-white/15 rounded-lg px-3 py-2 text-white/70 disabled:opacity-40">Recheck technical setup</button>
          <button type="button" disabled={checking} onClick={() => { setVerifyKey(assessmentKey); setCheckVersion(v => v + 1); }} className="text-xs bg-[#22c8e5] text-[#003258] rounded-lg px-3 py-2 font-bold disabled:opacity-40">Check links &amp; image sizes</button>
          {checking && <span className="text-xs text-white/50 flex items-center gap-1"><Loader2 size={12} className="animate-spin" />Checking…</span>}
        </div>
        <p className="text-[11px] text-white/40">Link checks use HEAD requests. Tracking, video landing and unsubscribe URLs are skipped to avoid recording clicks or changing subscriptions. DNS checks confirm published records, not actual message authentication.</p>
        {currentTechnical?.plainText && <details className="text-xs text-white/60"><summary className="cursor-pointer">Plain-text email preview</summary><pre className="mt-2 max-h-64 overflow-auto whitespace-pre-wrap break-words bg-black/20 rounded p-3">{currentTechnical.plainText}</pre></details>}
      </div>
    </aside>
  );
}
