import React, { useState } from 'react';
import { Heading2, Type, MousePointerClick, Image as ImageIcon, Calendar, Minus, MoveVertical, GripVertical, Copy, Trash2 } from 'lucide-react';

const ACCENT_SWATCHES = ['#00bcd4', '#2dd4a7', '#3b82f6', '#22c55e', '#a855f7'];

const BLOCK_TYPES = [
  { type: 'heading', label: 'Heading', icon: Heading2 },
  { type: 'text', label: 'Text', icon: Type },
  { type: 'button', label: 'Button', icon: MousePointerClick },
  { type: 'image', label: 'Image', icon: ImageIcon },
  { type: 'event', label: 'Event Card', icon: Calendar },
  { type: 'divider', label: 'Divider', icon: Minus },
  { type: 'spacer', label: 'Spacer', icon: MoveVertical },
];

let blockIdCounter = 0;
const nextBlockId = () => `blk_${Date.now()}_${blockIdCounter++}`;

/** Fresh default props for a newly-added block of the given type. */
export function createBlock(type) {
  const base = { id: nextBlockId(), type };
  switch (type) {
    case 'heading': return { ...base, text: 'Your Heading' };
    case 'text': return { ...base, content: 'Write something for your subscribers...' };
    case 'button': return { ...base, label: 'Learn More', url: 'https://evobrand.net', style: 'primary' };
    case 'image': return { ...base, src: '', alt: '', linkUrl: '' };
    case 'event': return { ...base, title: 'Event Title', date: '', time: '', location: '', linkLabel: 'View Details', linkUrl: '' };
    case 'divider': return { ...base };
    case 'spacer': return { ...base, height: 32 };
    default: return base;
  }
}

const escapeHtml = (s = '') =>
  String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

function hexToRgb(hex) {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex || '');
  const clean = m ? m[1] : '00bcd4';
  return { r: parseInt(clean.slice(0, 2), 16), g: parseInt(clean.slice(2, 4), 16), b: parseInt(clean.slice(4, 6), 16) };
}

/** Renders the block list into the HTML string stored as the campaign's html_content. */
export function blocksToHtml(blocks, accentColor = '#00bcd4') {
  const rgb = hexToRgb(accentColor);
  const alpha = (a) => `rgba(${rgb.r},${rgb.g},${rgb.b},${a})`;

  return blocks.map((b) => {
    switch (b.type) {
      case 'heading':
        return `<h2>${escapeHtml(b.text)}</h2>`;
      case 'text':
        return b.content
          .split(/\n{2,}/)
          .map((para) => `<p>${escapeHtml(para).replace(/\n/g, '<br>')}</p>`)
          .join('\n');
      case 'button':
        return `<div style="margin:8px 0 20px;"><a href="${escapeHtml(b.url)}" class="btn-${b.style === 'secondary' ? 'secondary' : 'primary'}">${escapeHtml(b.label)}</a></div>`;
      case 'image': {
        const img = `<img src="${escapeHtml(b.src)}" alt="${escapeHtml(b.alt)}" style="max-width:100%;height:auto;display:block;border-radius:4px;margin:0 0 16px;" />`;
        return b.linkUrl ? `<a href="${escapeHtml(b.linkUrl)}">${img}</a>` : img;
      }
      case 'event':
        return `<div class="highlight-box">
  <div style="font-size:10px;letter-spacing:2px;text-transform:uppercase;color:${accentColor};margin-bottom:8px;font-weight:600;">Event</div>
  <h3>${escapeHtml(b.title)}</h3>
  ${(b.date || b.time) ? `<p style="margin-bottom:4px;">${escapeHtml([b.date, b.time].filter(Boolean).join(' · '))}</p>` : ''}
  ${b.location ? `<p style="margin-bottom:16px;">${escapeHtml(b.location)}</p>` : ''}
  ${b.linkUrl ? `<a href="${escapeHtml(b.linkUrl)}" class="btn-secondary">${escapeHtml(b.linkLabel || 'View Details')}</a>` : ''}
</div>`;
      case 'divider':
        return `<div style="height:1px;background:linear-gradient(90deg,transparent,${alpha(0.35)},transparent);margin:24px 0;"></div>`;
      case 'spacer':
        return `<div style="height:${b.height || 32}px;line-height:${b.height || 32}px;font-size:1px;">&nbsp;</div>`;
      default:
        return '';
    }
  }).join('\n');
}

const fieldClass = 'w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#22c8e5] placeholder:text-white/25';
const labelClass = 'block text-[10px] font-bold text-white/40 uppercase tracking-wider mb-1';

function BlockFields({ block, onChange }) {
  const set = (patch) => onChange({ ...block, ...patch });

  switch (block.type) {
    case 'heading':
      return (
        <input className={fieldClass} value={block.text} onChange={(e) => set({ text: e.target.value })} placeholder="Heading text" />
      );
    case 'text':
      return (
        <textarea rows={4} className={fieldClass} value={block.content} onChange={(e) => set({ content: e.target.value })} placeholder="Write your message..." />
      );
    case 'button':
      return (
        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Label</label>
            <input className={fieldClass} value={block.label} onChange={(e) => set({ label: e.target.value })} placeholder="Learn More" />
          </div>
          <div>
            <label className={labelClass}>URL</label>
            <input className={fieldClass} value={block.url} onChange={(e) => set({ url: e.target.value })} placeholder="https://..." />
          </div>
          <div className="sm:col-span-2 flex gap-2">
            {['primary', 'secondary'].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => set({ style: s })}
                className={`px-3 py-1 rounded-lg text-xs font-bold border transition-colors ${block.style === s ? 'bg-[#22c8e5] text-[#003258] border-[#22c8e5]' : 'border-white/15 text-white/50 hover:text-white'}`}
              >
                {s === 'primary' ? 'Solid' : 'Outline'}
              </button>
            ))}
          </div>
        </div>
      );
    case 'image':
      return (
        <div className="space-y-3">
          <div>
            <label className={labelClass}>Image URL</label>
            <input className={fieldClass} value={block.src} onChange={(e) => set({ src: e.target.value })} placeholder="https://.../image.jpg" />
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Alt Text</label>
              <input className={fieldClass} value={block.alt} onChange={(e) => set({ alt: e.target.value })} placeholder="Describe the image" />
            </div>
            <div>
              <label className={labelClass}>Link URL (optional)</label>
              <input className={fieldClass} value={block.linkUrl} onChange={(e) => set({ linkUrl: e.target.value })} placeholder="https://..." />
            </div>
          </div>
          {block.src && (
            <img src={block.src} alt={block.alt} className="max-h-32 rounded-lg border border-white/10" />
          )}
        </div>
      );
    case 'event':
      return (
        <div className="space-y-3">
          <div>
            <label className={labelClass}>Event Title</label>
            <input className={fieldClass} value={block.title} onChange={(e) => set({ title: e.target.value })} placeholder="Quarterly Mixer" />
          </div>
          <div className="grid sm:grid-cols-3 gap-3">
            <div>
              <label className={labelClass}>Date</label>
              <input className={fieldClass} value={block.date} onChange={(e) => set({ date: e.target.value })} placeholder="July 24, 2026" />
            </div>
            <div>
              <label className={labelClass}>Time</label>
              <input className={fieldClass} value={block.time} onChange={(e) => set({ time: e.target.value })} placeholder="6:00 PM" />
            </div>
            <div>
              <label className={labelClass}>Location</label>
              <input className={fieldClass} value={block.location} onChange={(e) => set({ location: e.target.value })} placeholder="Ellis County, TX" />
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Link Label</label>
              <input className={fieldClass} value={block.linkLabel} onChange={(e) => set({ linkLabel: e.target.value })} placeholder="View Details" />
            </div>
            <div>
              <label className={labelClass}>Link URL</label>
              <input className={fieldClass} value={block.linkUrl} onChange={(e) => set({ linkUrl: e.target.value })} placeholder="https://..." />
            </div>
          </div>
        </div>
      );
    case 'divider':
      return <p className="text-xs text-white/30">A thin accent-colored rule.</p>;
    case 'spacer':
      return (
        <div className="flex items-center gap-2">
          {[16, 32, 56].map((h) => (
            <button
              key={h}
              type="button"
              onClick={() => set({ height: h })}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${block.height === h ? 'bg-[#22c8e5] text-[#003258] border-[#22c8e5]' : 'border-white/15 text-white/50 hover:text-white'}`}
            >
              {h === 16 ? 'Small' : h === 32 ? 'Medium' : 'Large'}
            </button>
          ))}
        </div>
      );
    default:
      return null;
  }
}

function BlockPreview({ block, accentColor }) {
  switch (block.type) {
    case 'heading':
      return <h3 className="text-white font-bold text-lg">{block.text || 'Heading'}</h3>;
    case 'text':
      return <p className="text-white/70 text-sm whitespace-pre-wrap">{block.content}</p>;
    case 'button':
      return (
        <a
          href={block.url}
          onClick={(e) => e.preventDefault()}
          className="inline-block px-5 py-2 rounded text-xs font-bold uppercase tracking-widest"
          style={block.style === 'secondary'
            ? { border: `1px solid ${accentColor}`, color: accentColor, background: 'transparent' }
            : { background: accentColor, color: '#0b0f1a' }}
        >
          {block.label || 'Button'}
        </a>
      );
    case 'image':
      return block.src
        ? <img src={block.src} alt={block.alt} className="max-w-full rounded" />
        : <div className="h-24 rounded border border-dashed border-white/15 flex items-center justify-center text-white/25 text-xs">No image URL yet</div>;
    case 'event':
      return (
        <div className="rounded-lg p-4 border" style={{ borderColor: `${accentColor}40`, background: `${accentColor}0d` }}>
          <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: accentColor }}>Event</p>
          <p className="text-white font-bold">{block.title || 'Event Title'}</p>
          <p className="text-white/50 text-xs mt-1">{[block.date, block.time].filter(Boolean).join(' · ')}</p>
          <p className="text-white/50 text-xs">{block.location}</p>
        </div>
      );
    case 'divider':
      return <div className="h-px" style={{ background: `linear-gradient(90deg, transparent, ${accentColor}80, transparent)` }} />;
    case 'spacer':
      return <div style={{ height: block.height || 32 }} className="border border-dashed border-white/10 rounded" />;
    default:
      return null;
  }
}

function DropZone({ index, dragActive, onDrop, onDragOver }) {
  return (
    <div
      onDragOver={(e) => { e.preventDefault(); onDragOver(index); }}
      onDrop={(e) => { e.preventDefault(); onDrop(index, e); }}
      className={`transition-all rounded-lg ${dragActive ? 'h-10 bg-[#22c8e5]/10 border-2 border-dashed border-[#22c8e5]/50' : 'h-2'}`}
    />
  );
}

/**
 * CampaignBlockEditor — drag-and-drop email composer: a block palette,
 * a live-styled canvas, and a design panel (accent color + heading font).
 * `blocks` is the single source of truth; blocksToHtml() renders it to the
 * HTML string that actually gets saved/sent.
 */
export default function CampaignBlockEditor({ blocks, setBlocks, accentColor, setAccentColor, headingFont, setHeadingFont }) {
  const [dragOverIndex, setDragOverIndex] = useState(null);

  const addBlock = (type, atIndex = blocks.length) => {
    const b = createBlock(type);
    setBlocks((prev) => {
      const next = [...prev];
      next.splice(atIndex, 0, b);
      return next;
    });
  };

  const updateBlock = (id, updated) => {
    setBlocks((prev) => prev.map((b) => (b.id === id ? updated : b)));
  };

  const removeBlock = (id) => setBlocks((prev) => prev.filter((b) => b.id !== id));

  const duplicateBlock = (id) => {
    setBlocks((prev) => {
      const idx = prev.findIndex((b) => b.id === id);
      if (idx === -1) return prev;
      const copy = { ...prev[idx], id: nextBlockId() };
      const next = [...prev];
      next.splice(idx + 1, 0, copy);
      return next;
    });
  };

  const handlePaletteDragStart = (e, type) => {
    e.dataTransfer.setData('text/plain', JSON.stringify({ kind: 'new', blockType: type }));
  };

  const handleBlockDragStart = (e, index) => {
    e.dataTransfer.setData('text/plain', JSON.stringify({ kind: 'reorder', index }));
  };

  // Single drop handler for every gap in the canvas — reads what's being
  // dragged (a new palette block, or an existing block being reordered)
  // straight from dataTransfer rather than tracking it in component state.
  const handleDropAt = (atIndex, e) => {
    setDragOverIndex(null);
    let data;
    try {
      data = JSON.parse(e.dataTransfer.getData('text/plain'));
    } catch {
      return;
    }
    if (!data) return;
    if (data.kind === 'new') {
      addBlock(data.blockType, atIndex);
    } else if (data.kind === 'reorder') {
      setBlocks((prev) => {
        const next = [...prev];
        const [moved] = next.splice(data.index, 1);
        const insertAt = atIndex > data.index ? atIndex - 1 : atIndex;
        next.splice(insertAt, 0, moved);
        return next;
      });
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr_240px] gap-5">
      {/* Palette */}
      <div className="space-y-2">
        <p className="text-[10px] font-bold text-white/40 uppercase tracking-wider mb-1">Blocks</p>
        {BLOCK_TYPES.map(({ type, label, icon: Icon }) => (
          <button
            key={type}
            type="button"
            draggable
            onDragStart={(e) => handlePaletteDragStart(e, type)}
            onClick={() => addBlock(type)}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-[#1a2332] border border-white/10 text-white/70 text-sm hover:border-[#22c8e5]/40 hover:text-white transition-colors cursor-grab active:cursor-grabbing"
          >
            <Icon size={16} className="text-[#22c8e5] flex-shrink-0" />
            {label}
          </button>
        ))}
        <p className="text-[11px] text-white/25 pt-1">Drag blocks onto the canvas, or click one to add it.</p>
      </div>

      {/* Canvas */}
      <div
        className="rounded-xl border-2 border-dashed border-white/10 p-4 min-h-[320px] bg-[#0b0f1a]/60"
        onDragOver={(e) => e.preventDefault()}
      >
        {blocks.length === 0 ? (
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const raw = e.dataTransfer.getData('text/plain');
              try {
                const data = JSON.parse(raw);
                if (data.kind === 'new') addBlock(data.blockType);
              } catch { /* ignore */ }
            }}
            className="h-full min-h-[280px] flex items-center justify-center text-center text-white/30 text-sm px-6"
          >
            Drag a block here, or click one on the left, to start building your email.
          </div>
        ) : (
          <div>
            <DropZone
              index={0}
              dragActive={dragOverIndex === 0}
              onDragOver={setDragOverIndex}
              onDrop={handleDropAt}
            />
            {blocks.map((block, index) => {
              const Icon = BLOCK_TYPES.find((t) => t.type === block.type)?.icon;
              return (
                <React.Fragment key={block.id}>
                  <div
                    draggable
                    onDragStart={(e) => handleBlockDragStart(e, index)}
                    onDragEnd={() => setDragOverIndex(null)}
                    className="group bg-[#1a2332] border border-white/10 rounded-xl p-4 hover:border-white/20 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2 text-white/40 cursor-grab active:cursor-grabbing">
                        <GripVertical size={14} />
                        {Icon && <Icon size={13} className="text-[#22c8e5]" />}
                        <span className="text-[10px] font-bold uppercase tracking-wider">{block.type}</span>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button type="button" onClick={() => duplicateBlock(block.id)} title="Duplicate block" className="p-1.5 text-white/30 hover:text-[#22c8e5] hover:bg-[#22c8e5]/10 rounded-lg transition-colors">
                          <Copy size={13} />
                        </button>
                        <button type="button" onClick={() => removeBlock(block.id)} title="Remove block" className="p-1.5 text-white/30 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                    <div className="mb-3">
                      <BlockFields block={block} onChange={(updated) => updateBlock(block.id, updated)} />
                    </div>
                    <div className="pt-3 border-t border-white/5">
                      <BlockPreview block={block} accentColor={accentColor} />
                    </div>
                  </div>
                  <DropZone
                    index={index + 1}
                    dragActive={dragOverIndex === index + 1}
                    onDragOver={setDragOverIndex}
                    onDrop={(i) => handleDrop(i)}
                  />
                </React.Fragment>
              );
            })}
          </div>
        )}
      </div>

      {/* Design */}
      <div className="space-y-5">
        <div>
          <p className="text-[10px] font-bold text-white/40 uppercase tracking-wider mb-2">Accent Color</p>
          <div className="flex gap-2 flex-wrap">
            {ACCENT_SWATCHES.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setAccentColor(c)}
                title={c}
                className="w-7 h-7 rounded-full transition-transform hover:scale-110"
                style={{ background: c, boxShadow: accentColor.toLowerCase() === c.toLowerCase() ? '0 0 0 2px #0f1419, 0 0 0 4px white' : 'none' }}
              />
            ))}
          </div>
        </div>
        <div>
          <p className="text-[10px] font-bold text-white/40 uppercase tracking-wider mb-2">Heading Font</p>
          <select
            value={headingFont}
            onChange={(e) => setHeadingFont(e.target.value)}
            className="w-full bg-[#1a2332] border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#22c8e5]"
          >
            <option value="bebas">Display (Bebas Neue)</option>
            <option value="playfair">Serif (Playfair)</option>
          </select>
        </div>
      </div>
    </div>
  );
}
