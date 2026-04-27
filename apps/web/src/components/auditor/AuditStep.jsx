import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const AuditStep = ({ children, stepKey }) => (
  <AnimatePresence mode="wait">
    <motion.div
      key={stepKey}
      initial={{ opacity: 0, x: 60 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -60 }}
      transition={{ duration: 0.35, ease: 'easeInOut' }}
    >
      {children}
    </motion.div>
  </AnimatePresence>
);

export default AuditStep;
