'use client';

import { motion } from 'framer-motion';
import React from 'react';

export default function AnimatedContainer({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7 }}
      className="max-w-3xl mx-auto bg-gradient-to-br from-green-500 to-blue-500 p-10 rounded-xl shadow-xl text-white"
    >
      {children}
    </motion.div>
  );
}
