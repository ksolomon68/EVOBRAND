import React from 'react';
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
} from 'recharts';
import { motion } from 'framer-motion';

const ScoreRadar = ({ categories }) => {
  const data = categories
    ? Object.values(categories).map((cat) => ({
        subject: cat.label,
        score: cat.score,
        fullMark: 100,
      }))
    : [];

  const CustomTick = ({ x, y, payload }) => (
    <text
      x={x}
      y={y}
      textAnchor="middle"
      dominantBaseline="central"
      style={{ fill: '#94a3b8', fontSize: '11px', fontFamily: 'Source Sans 3, sans-serif' }}
    >
      {payload.value}
    </text>
  );

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
      className="w-full h-[320px] md:h-[380px]"
    >
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
          <PolarGrid stroke="rgba(34,200,229,0.15)" />
          <PolarAngleAxis dataKey="subject" tick={<CustomTick />} />
          <Radar
            name="Brand Score"
            dataKey="score"
            stroke="#22C8E5"
            strokeWidth={2}
            fill="rgba(34,200,229,0.15)"
            fillOpacity={1}
            animationBegin={300}
            animationDuration={1200}
            animationEasing="ease-out"
          />
        </RadarChart>
      </ResponsiveContainer>
    </motion.div>
  );
};

export default ScoreRadar;
