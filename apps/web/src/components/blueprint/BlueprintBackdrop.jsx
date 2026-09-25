import React from 'react';
import { createPortal } from 'react-dom';

/**
 * Fixed layer behind the Blueprint page: a tinted field that changes color
 * section by section, a faint drafting grid, a cursor glow, and a wireframe
 * dashboard that the hero draws as you scroll. Rendered into <body> so the
 * route transition's transform cannot break position: fixed.
 *
 * Every drawable stroke carries pathLength="1", so the drawing is a single
 * dashoffset tween from 1 to 0 with no measuring.
 */

const KPI_X = [300, 580, 860];
const NAV_Y = [150, 190, 230, 270, 310];
const TABLE_Y = [420, 470, 520, 570, 620];

export default function BlueprintBackdrop({ drawn = false }) {
  return createPortal(
    <div className={`bp-backdrop ${drawn ? 'bp-backdrop--drawn' : ''}`} aria-hidden="true">
      <div className="bp-backdrop__grid" />
      <div className="bp-backdrop__glow" />
      <svg className="bp-backdrop__art" viewBox="0 0 1200 760" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="bp-area" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--cyan-400)" stopOpacity="0.35" />
            <stop offset="100%" stopColor="var(--cyan-400)" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Phase 3 fills sit under the strokes. */}
        <g className="bp-fills">
          <rect x="40" y="40" width="1120" height="680" rx="16" className="bp-fill bp-fill--frame" />
          <rect x="40" y="90" width="220" height="630" className="bp-fill bp-fill--side" />
          {KPI_X.map((x) => (
            <rect key={x} x={x} y="210" width="250" height="120" rx="10" className="bp-fill bp-fill--card" />
          ))}
          <rect x="300" y="360" width="540" height="320" rx="10" className="bp-fill bp-fill--card" />
          <rect x="870" y="360" width="250" height="320" rx="10" className="bp-fill bp-fill--card" />
          <path d="M330 640 L400 600 L470 612 L540 540 L610 560 L680 470 L750 492 L810 420 L810 650 L330 650 Z" className="bp-fill bp-fill--area" fill="url(#bp-area)" />
          <rect x="300" y="120" width="220" height="44" rx="8" className="bp-fill bp-fill--accent" />
        </g>

        {/* Phase 1: the frame and structure. */}
        <g className="bp-phase bp-phase--1">
          <rect pathLength="1" x="40" y="40" width="1120" height="680" rx="16" className="bp-draw" />
          <line pathLength="1" x1="40" y1="90" x2="1160" y2="90" className="bp-draw" />
          {[72, 96, 120].map((cx) => (
            <circle key={cx} pathLength="1" cx={cx} cy="65" r="7" className="bp-draw" />
          ))}
          <rect pathLength="1" x="440" y="54" width="320" height="22" rx="11" className="bp-draw bp-draw--soft" />
          <line pathLength="1" x1="260" y1="90" x2="260" y2="720" className="bp-draw" />
          {NAV_Y.map((y, i) => (
            <line key={y} pathLength="1" x1="72" y1={y} x2={i === 0 ? 220 : 180 - i * 8} y2={y} className="bp-draw bp-draw--soft" />
          ))}
        </g>

        {/* Phase 2: the components. */}
        <g className="bp-phase bp-phase--2">
          <rect pathLength="1" x="300" y="120" width="220" height="44" rx="8" className="bp-draw" />
          <line pathLength="1" x1="900" y1="142" x2="1120" y2="142" className="bp-draw bp-draw--soft" />
          {KPI_X.map((x) => (
            <g key={x}>
              <rect pathLength="1" x={x} y="210" width="250" height="120" rx="10" className="bp-draw" />
              <line pathLength="1" x1={x + 24} y1="244" x2={x + 120} y2="244" className="bp-draw bp-draw--soft" />
              <line pathLength="1" x1={x + 24} y1="290" x2={x + 190} y2="290" className="bp-draw bp-draw--bold" />
            </g>
          ))}
          <rect pathLength="1" x="300" y="360" width="540" height="320" rx="10" className="bp-draw" />
          {[440, 500, 560, 620].map((y) => (
            <line key={y} pathLength="1" x1="330" y1={y} x2="810" y2={y} className="bp-draw bp-draw--faint" />
          ))}
          <polyline
            pathLength="1"
            points="330,640 400,600 470,612 540,540 610,560 680,470 750,492 810,420"
            className="bp-draw bp-draw--bold bp-draw--accent"
          />
          <rect pathLength="1" x="870" y="360" width="250" height="320" rx="10" className="bp-draw" />
          {TABLE_Y.map((y) => (
            <line key={y} pathLength="1" x1="894" y1={y} x2="1096" y2={y} className="bp-draw bp-draw--soft" />
          ))}
        </g>

        {/* Drafting marks: dimension lines and callouts. */}
        <g className="bp-phase bp-phase--marks">
          <line pathLength="1" x1="40" y1="742" x2="1160" y2="742" className="bp-draw bp-draw--faint" />
          <line pathLength="1" x1="40" y1="734" x2="40" y2="750" className="bp-draw bp-draw--faint" />
          <line pathLength="1" x1="1160" y1="734" x2="1160" y2="750" className="bp-draw bp-draw--faint" />
          <line pathLength="1" x1="1178" y1="40" x2="1178" y2="720" className="bp-draw bp-draw--faint" />
          <text x="600" y="738" className="bp-label" textAnchor="middle">1120 · 12 COL GRID</text>
          <text x="1188" y="380" className="bp-label" transform="rotate(90 1188 380)" textAnchor="middle">680</text>
          <text x="300" y="200" className="bp-label">KPI · LIVE</text>
          <text x="300" y="352" className="bp-label">TREND · 12 MO</text>
          <text x="870" y="352" className="bp-label">RECORDS</text>
        </g>
      </svg>
    </div>,
    document.body
  );
}
