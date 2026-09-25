import React from 'react';

/*
 * Line illustrations for the mega-menu feature cards, drawn in the same
 * blueprint language as the site: cyan strokes on navy. Each panel mounts
 * fresh when it opens, so the CSS draw-in plays every time. Strokes use
 * pathLength="1" so one keyframe draws any shape; --d staggers them.
 * Decorative only.
 */

const d = (n) => ({ '--d': `${n * 0.07}s` });

function About() {
  return (
    <div className="mega-art__about">
      <svg viewBox="0 0 320 220" className="mega-art__svg">
        <ellipse pathLength="1" cx="160" cy="104" rx="128" ry="42" className="mega-art__line mega-art__line--soft" style={d(0)} transform="rotate(-14 160 104)" />
        <ellipse pathLength="1" cx="160" cy="104" rx="104" ry="80" className="mega-art__line mega-art__line--faint" style={d(2)} transform="rotate(22 160 104)" />
        <circle cx="46" cy="130" r="4" className="mega-art__dot" style={d(6)} />
        <circle cx="266" cy="70" r="4" className="mega-art__dot" style={d(8)} />
        <line pathLength="1" x1="30" y1="206" x2="290" y2="206" className="mega-art__line mega-art__line--faint" style={d(4)} />
        {[30, 117, 203, 290].map((x, i) => (
          <line key={x} pathLength="1" x1={x} y1="200" x2={x} y2="212" className="mega-art__line" style={d(5 + i)} />
        ))}
        <text x="30" y="194" className="mega-art__label">1999</text>
        <text x="117" y="194" className="mega-art__label" textAnchor="middle">2010</text>
        <text x="290" y="194" className="mega-art__label" textAnchor="end">TODAY</text>
      </svg>
      <img
        className="mega-art__sphere"
        src="/brand/evo-sphere-256.webp"
        srcSet="/brand/evo-sphere-256.webp 256w, /brand/evo-sphere-512.webp 512w"
        sizes="130px"
        width="256"
        height="256"
        alt=""
      />
    </div>
  );
}

/** Three practices wired to one core: websites, applications, brand. */
function Services() {
  const nodes = [
    { x: 60, y: 48, label: 'WEB' },
    { x: 262, y: 70, label: 'APPS' },
    { x: 150, y: 196, label: 'BRAND' },
  ];
  return (
    <svg viewBox="0 0 320 230" className="mega-art__svg">
      <circle pathLength="1" cx="160" cy="108" r="46" className="mega-art__line mega-art__line--faint" style={d(0)} />
      {nodes.map((n, i) => (
        <path
          key={n.label}
          pathLength="1"
          d={`M160 108 C ${(160 + n.x) / 2} ${108}, ${(160 + n.x) / 2} ${n.y}, ${n.x} ${n.y}`}
          className="mega-art__line mega-art__line--flow"
          style={d(2 + i)}
        />
      ))}
      <rect pathLength="1" x="136" y="84" width="48" height="48" rx="12" className="mega-art__line mega-art__line--bold" style={d(1)} />
      <rect x="148" y="96" width="24" height="24" rx="6" className="mega-art__fill" style={d(6)} />
      {nodes.map((n, i) => (
        <g key={n.label}>
          <circle pathLength="1" cx={n.x} cy={n.y} r="17" className="mega-art__line" style={d(5 + i)} />
          <circle cx={n.x} cy={n.y} r="5" className="mega-art__dot" style={d(7 + i)} />
          <text x={n.x} y={n.y + (n.y > 150 ? 32 : -26)} className="mega-art__label" textAnchor="middle">{n.label}</text>
        </g>
      ))}
    </svg>
  );
}

/** Three screens stacked in perspective, drawn as wireframes. */
function Work() {
  const screens = [
    { x: 30, y: 30, o: 'faint' },
    { x: 62, y: 62, o: 'soft' },
    { x: 94, y: 94, o: '' },
  ];
  return (
    <svg viewBox="0 0 320 230" className="mega-art__svg mega-art__svg--tilt">
      {screens.map((s, i) => (
        <g key={s.x} className={`mega-art__screen mega-art__screen--${i}`}>
          <rect pathLength="1" x={s.x} y={s.y} width="190" height="120" rx="10" className={`mega-art__line mega-art__line--panel ${s.o ? `mega-art__line--${s.o}` : ''}`} style={d(i * 2)} />
          <line pathLength="1" x1={s.x} y1={s.y + 18} x2={s.x + 190} y2={s.y + 18} className="mega-art__line mega-art__line--faint" style={d(i * 2 + 1)} />
        </g>
      ))}
      <line pathLength="1" x1="112" y1="136" x2="180" y2="136" className="mega-art__line mega-art__line--thick" style={d(6)} />
      <line pathLength="1" x1="112" y1="152" x2="160" y2="152" className="mega-art__line mega-art__line--soft" style={d(7)} />
      <polyline pathLength="1" points="112,196 140,182 164,188 190,164 216,172 262,142" className="mega-art__line mega-art__line--bold" style={d(8)} />
      <rect x="226" y="126" width="48" height="16" rx="8" className="mega-art__fill" style={d(10)} />
    </svg>
  );
}

/** A score dial sweeping up while a scan line passes over a page. */
function Tools() {
  return (
    <svg viewBox="0 0 320 230" className="mega-art__svg">
      <rect pathLength="1" x="30" y="40" width="120" height="160" rx="10" className="mega-art__line mega-art__line--soft" style={d(0)} />
      {[70, 90, 110, 130, 150, 170].map((y, i) => (
        <line key={y} pathLength="1" x1="46" y1={y} x2={i % 2 ? 110 : 132} y2={y} className="mega-art__line mega-art__line--faint" style={d(1 + i * 0.5)} />
      ))}
      <line x1="24" y1="60" x2="156" y2="60" className="mega-art__scan" />
      <path pathLength="1" d="M186 170 A 62 62 0 1 1 290 170" className="mega-art__line mega-art__line--faint" style={d(1)} />
      <path pathLength="1" d="M186 170 A 62 62 0 0 1 282 96" className="mega-art__line mega-art__line--gauge" style={d(3)} />
      <line pathLength="1" x1="238" y1="138" x2="270" y2="104" className="mega-art__line mega-art__line--bold" style={d(6)} />
      <circle cx="238" cy="138" r="6" className="mega-art__dot" style={d(6)} />
      <text x="238" y="194" className="mega-art__label mega-art__label--big" textAnchor="middle">SCORE</text>
    </svg>
  );
}

/** An open book with a play button: reading and watching. */
function Resources() {
  return (
    <svg viewBox="0 0 320 230" className="mega-art__svg">
      <path pathLength="1" d="M160 70 C 130 52, 80 50, 40 60 L 40 184 C 80 174, 130 176, 160 194 Z" className="mega-art__line mega-art__line--soft" style={d(0)} />
      <path pathLength="1" d="M160 70 C 190 52, 240 50, 280 60 L 280 184 C 240 174, 190 176, 160 194 Z" className="mega-art__line mega-art__line--soft" style={d(1)} />
      <line pathLength="1" x1="160" y1="70" x2="160" y2="194" className="mega-art__line" style={d(2)} />
      {[92, 112, 132, 152].map((y, i) => (
        <line key={y} pathLength="1" x1="62" y1={y - i * 1.5} x2={i === 3 ? 110 : 138} y2={y + 2} className="mega-art__line mega-art__line--faint" style={d(3 + i * 0.5)} />
      ))}
      <circle pathLength="1" cx="220" cy="122" r="30" className="mega-art__line mega-art__line--bold" style={d(5)} />
      <path d="M212 108 L 236 122 L 212 136 Z" className="mega-art__fill" style={d(8)} />
    </svg>
  );
}

const ART = { about: About, services: Services, work: Work, tools: Tools, resources: Resources };

export default function MegaArt({ id }) {
  const Art = ART[id];
  if (!Art) return null;
  return (
    <div className={`mega-art mega-art--${id}`} aria-hidden="true">
      <Art />
    </div>
  );
}
