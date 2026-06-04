import React, { useEffect, useRef } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';

const ScoreCounter = ({ target, duration = 2.5, className = '' }) => {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (v) => Math.round(v));
  const ref = useRef(null);

  useEffect(() => {
    const controls = animate(count, target, {
      duration,
      ease: 'easeOut',
    });
    return controls.stop;
  }, [target, duration, count]);

  return (
    <motion.span ref={ref} className={className}>
      {rounded}
    </motion.span>
  );
};

export default ScoreCounter;
