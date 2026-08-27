import React, { useId } from 'react';
import { motion } from 'framer-motion';

const TICKS = [25, 50, 75, 100];

// Splits a two-word label ("Digital Presence") onto two stacked lines so
// side-anchored labels grow *taller* instead of *wider* — the previous
// single-line version pushed long labels past the SVG's viewBox and the
// browser's default overflow:hidden on <svg> silently clipped them.
const splitLabel = (label = '') => {
  const words = label.trim().split(/\s+/);
  if (words.length < 2) return [label];
  const mid = Math.ceil(words.length / 2);
  return [words.slice(0, mid).join(' '), words.slice(mid).join(' ')];
};

const scoreColor = (score) => {
  if (score >= 75) return '#22d3a0';
  if (score >= 50) return '#22C8E5';
  return '#f59e0b';
};

const ScoreRadar = ({ categories }) => {
  const items = categories ? Object.values(categories) : [];
  const gradId = useId();
  const glowId = useId();

  if (!items.length) return null;

  const size = 360;
  const cx = size / 2;
  const cy = size / 2;
  const maxR = size * 0.3;
  const levels = 4;
  const n = items.length;

  const angle = (i) => (Math.PI * 2 * i) / n - Math.PI / 2;

  const point = (r, i) => ({
    x: cx + r * Math.cos(angle(i)),
    y: cy + r * Math.sin(angle(i)),
  });

  const gridPolygons = Array.from({ length: levels }, (_, l) => {
    const r = (maxR * (l + 1)) / levels;
    return Array.from({ length: n }, (_, i) => point(r, i))
      .map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`)
      .join(' ') + 'Z';
  });

  const spokeLines = Array.from({ length: n }, (_, i) => {
    const outer = point(maxR, i);
    return `M${cx},${cy} L${outer.x},${outer.y}`;
  });

  const dataPoints = items.map((cat, i) => point(((cat.score ?? 0) / 100) * maxR, i));
  const dataPath = dataPoints
    .map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`)
    .join(' ') + 'Z';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
      className="w-full flex items-center justify-center"
      style={{ minHeight: 300 }}
    >
      <svg
        viewBox={`0 0 ${size} ${size}`}
        width="100%"
        style={{ maxWidth: size, overflow: 'visible' }}
        role="img"
        aria-label={`Brand radar: ${items.map((c) => `${c.label} ${c.score}`).join(', ')}`}
      >
        <defs>
          <radialGradient id={gradId} cx="50%" cy="50%" r="65%">
            <stop offset="0%" stopColor="#22C8E5" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#22C8E5" stopOpacity="0.06" />
          </radialGradient>
          <filter id={glowId} x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="3.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Grid rings */}
        {gridPolygons.map((d, i) => (
          <path
            key={i}
            d={d}
            fill="none"
            stroke="rgba(34,200,229,0.14)"
            strokeWidth={i === levels - 1 ? 1.25 : 1}
          />
        ))}

        {/* Scale tick labels along the top spoke */}
        {TICKS.map((t, i) => (
          <text
            key={t}
            x={cx + 6}
            y={cy - (maxR * t) / 100}
            fontSize="8.5"
            fontFamily="sans-serif"
            fill="rgba(148,163,184,0.55)"
          >
            {t}
          </text>
        ))}

        {/* Spokes */}
        {spokeLines.map((d, i) => (
          <path key={i} d={d} stroke="rgba(34,200,229,0.14)" strokeWidth={1} />
        ))}

        {/* Data polygon fill + glowing outline, drawn in on mount */}
        <motion.path
          d={dataPath}
          fill={`url(#${gradId})`}
          stroke="none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        />
        <motion.path
          d={dataPath}
          fill="none"
          stroke="#22C8E5"
          strokeWidth={2.25}
          strokeLinejoin="round"
          filter={`url(#${glowId})`}
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1.1, ease: 'easeOut', delay: 0.2 }}
        />

        {/* Data points */}
        {dataPoints.map((p, i) => {
          const color = scoreColor(items[i].score ?? 0);
          const delay = 0.9 + i * 0.08;
          return (
            <g key={i}>
              <motion.circle
                cx={p.x}
                cy={p.y}
                fill={color}
                fillOpacity={0.18}
                initial={{ r: 0, opacity: 0 }}
                animate={{ r: 7, opacity: 1 }}
                transition={{ duration: 0.4, delay, ease: 'easeOut' }}
              />
              <motion.circle
                cx={p.x}
                cy={p.y}
                fill={color}
                stroke="#04080f"
                strokeWidth={1.5}
                initial={{ r: 0, opacity: 0 }}
                animate={{ r: 4, opacity: 1 }}
                transition={{ duration: 0.4, delay, ease: 'easeOut' }}
              />
              <title>{`${items[i].label}: ${items[i].score}/100`}</title>
            </g>
          );
        })}

        {/* Labels + score */}
        {items.map((cat, i) => {
          const labelR = maxR + 30;
          const p = point(labelR, i);
          const angDeg = angle(i) * (180 / Math.PI);
          let anchor = 'middle';
          if (p.x > cx + 8) anchor = 'start';
          else if (p.x < cx - 8) anchor = 'end';
          const isTopish = angDeg > -150 && angDeg < -30;

          const lines = splitLabel(cat.label);
          const lineHeight = 12;
          // Center the label block vertically on its anchor point, then
          // stack the score line below it.
          const startDy = -((lines.length - 1) * lineHeight) / 2;

          return (
            <g key={i}>
              <text
                x={p.x}
                y={p.y}
                textAnchor={anchor}
                fontFamily="sans-serif"
              >
                {lines.map((line, li) => (
                  <tspan
                    key={li}
                    x={p.x}
                    dy={li === 0 ? startDy : lineHeight}
                    fontSize="11"
                    fill="#cbd5e1"
                    fontWeight={isTopish ? 700 : 600}
                  >
                    {line}
                  </tspan>
                ))}
                <tspan
                  x={p.x}
                  dy={lineHeight + 2}
                  fontSize="12"
                  fontWeight="800"
                  fill={scoreColor(cat.score ?? 0)}
                >
                  {cat.score ?? 0}
                </tspan>
              </text>
            </g>
          );
        })}
      </svg>
    </motion.div>
  );
};

export default ScoreRadar;
