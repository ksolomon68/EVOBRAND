import React from 'react';
import { motion } from 'framer-motion';

const ScoreRadar = ({ categories }) => {
  const items = categories ? Object.values(categories) : [];

  if (!items.length) return null;

  const size = 320;
  const cx = size / 2;
  const cy = size / 2;
  const maxR = size * 0.38;
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

  const dataPath = items
    .map((cat, i) => {
      const r = ((cat.score ?? 0) / 100) * maxR;
      const p = point(r, i);
      return `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`;
    })
    .join(' ') + 'Z';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
      className="w-full flex items-center justify-center"
      style={{ minHeight: 260 }}
    >
      <svg viewBox={`0 0 ${size} ${size}`} width="100%" style={{ maxWidth: size }}>
        {/* Grid rings */}
        {gridPolygons.map((d, i) => (
          <path key={i} d={d} fill="none" stroke="rgba(34,200,229,0.15)" strokeWidth={1} />
        ))}

        {/* Spokes */}
        {spokeLines.map((d, i) => (
          <path key={i} d={d} stroke="rgba(34,200,229,0.15)" strokeWidth={1} />
        ))}

        {/* Data polygon */}
        <motion.path
          d={dataPath}
          fill="rgba(34,200,229,0.15)"
          stroke="#22C8E5"
          strokeWidth={2}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.3 }}
        />

        {/* Data points */}
        {items.map((cat, i) => {
          const r = ((cat.score ?? 0) / 100) * maxR;
          const p = point(r, i);
          return (
            <circle key={i} cx={p.x} cy={p.y} r={4} fill="#22C8E5" />
          );
        })}

        {/* Labels */}
        {items.map((cat, i) => {
          const labelR = maxR + 22;
          const p = point(labelR, i);
          const ang = angle(i) * (180 / Math.PI);
          let anchor = 'middle';
          if (ang > -150 && ang < -30) anchor = 'middle';
          else if (p.x > cx + 10) anchor = 'start';
          else if (p.x < cx - 10) anchor = 'end';

          return (
            <text
              key={i}
              x={p.x}
              y={p.y}
              textAnchor={anchor}
              dominantBaseline="central"
              fill="#94a3b8"
              fontSize="11"
              fontFamily="sans-serif"
            >
              {cat.label}
            </text>
          );
        })}
      </svg>
    </motion.div>
  );
};

export default ScoreRadar;
