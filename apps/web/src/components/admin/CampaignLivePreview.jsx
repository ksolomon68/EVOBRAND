import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Monitor, Smartphone, Loader2, Check, AlertTriangle, Eye } from 'lucide-react';
import { blocksToHtml } from './CampaignBlockEditor.jsx';

const FRAMES = {
  desktop: { width: 640, height: 760, label: 'Desktop', icon: Monitor },
  mobile: { width: 375, height: 760, label: 'Mobile', icon: Smartphone },
};

const SPAM_WORDS = /\b(free|act now|urgent|guarantee|winner|click here)\b|!!/i;

/** Pre-send checks, shown beside the preview so problems surface before Send. */
export function getReadinessChecks({ subject, blocks, listCount }) {
  const subjectLen = subject.trim().length;
  const buttons = blocks.filter((b) => b.type === 'button').length;
  const images = blocks.filter((b) => b.type === 'image');
  const copy = JSON.stringify(blocks.map((b) => ({ ...b, id: undefined }))) + ' ' + subject;

  const checks = [
    { ok: subjectLen >= 25 && subjectLen <= 65, label: `Subject is 25 to 65 characters (${subjectLen} now)` },
    { ok: blocks.length > 0, label: 'Email has content' },
    { ok: listCount > 0, label: 'At least one list selected' },
    {
      ok: buttons === 1,
      label: buttons === 1 ? 'One clear button' : buttons === 0 ? 'Add a button so readers know what to do' : `Use one main button, not ${buttons}`,
    },
    {
      ok: images.every((b) => b.src && b.alt),
      label: images.length ? 'Every image has a source and alt text' : 'Images (none added)',
      skip: images.length === 0,
    },
    { ok: !SPAM_WORDS.test(copy), label: 'No spam trigger words' },
  ].filter((c) => !c.skip);

  const score = Math.round((checks.filter((c) => c.ok).length / checks.length) * 100);
  return { checks, score };
}

/**
 * Live, in-browser preview of the email as subscribers will receive it.
 * The HTML comes from the server's real email template, so the preview
 * cannot drift from what actually gets sent.
 */
export default function CampaignLivePreview({ apiBase, subject, blocks, accentColor, headingFont, lists, targetListIds }) {
  const [device, setDevice] = useState('desktop');
  const [html, setHtml] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [boxWidth, setBoxWidth] = useState(0);
  const boxRef = useRef(null);

  const contentHtml = useMemo(() => blocksToHtml(blocks, accentColor), [blocks, accentColor]);

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
  const { checks, score } = getReadinessChecks({ subject, blocks, listCount: targetListIds.length });
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
      <div className="flex items-start gap-4">
        <div className={`text-3xl font-black leading-none tabular-nums ${scoreColor}`} aria-label={`Send readiness ${score} percent`}>{score}</div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-white/40 uppercase tracking-wider mb-2">Send readiness</p>
          <ul className="space-y-1">
            {checks.map((c) => (
              <li key={c.label} className={`flex items-start gap-2 text-xs ${c.ok ? 'text-white/60' : 'text-amber-300'}`}>
                {c.ok ? <Check size={13} className="text-emerald-400 mt-0.5 flex-shrink-0" /> : <AlertTriangle size={13} className="mt-0.5 flex-shrink-0" />}
                <span>{c.label}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </aside>
  );
}
