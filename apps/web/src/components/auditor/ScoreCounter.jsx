import React, { useEffect, useRef } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';

const ScoreCounter = ({ target, duration = 2.5, className = '' }) => {
  const safeTarget = Number.isFinite(Number(target)) ? Number(target) : 0;
  const count = useMotionValue(0);
  const rounded = useTransform(count, (v) => Math.round(v));
  const ref = useRef(null);

  useEffect(() => {
    const controls = animate(count, safeTarget, {
      duration,
      ease: 'easeOut',
    });
    return controls.stop;
  }, [safeTarget, duration, count]);

  return (
    <motion.span ref={ref} className={className}>
      {rounded}
    </motion.span>
  );
};

export default ScoreCounter;
