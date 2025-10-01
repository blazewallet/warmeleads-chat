'use client';

import React from 'react';
import { motion } from 'framer-motion';

export function TypingIndicator() {
  return (
    <motion.div
      className="flex justify-start mb-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-end space-x-2">
        {/* Lisa's Avatar */}
        <div className="w-8 h-8 rounded-full bg-lisa-gradient flex items-center justify-center flex-shrink-0">
          <span className="text-white text-sm font-bold">L</span>
        </div>

        {/* Typing Bubble */}
        <div className="bg-white rounded-chat p-4 shadow-lisa border-l-4 border-brand-pink relative">
          <div className="flex space-x-1">
            <motion.div
              className="w-2 h-2 bg-brand-pink rounded-full"
              animate={{
                y: [0, -8, 0],
              }}
              transition={{
                duration: 0.6,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
            <motion.div
              className="w-2 h-2 bg-brand-pink rounded-full"
              animate={{
                y: [0, -8, 0],
              }}
              transition={{
                duration: 0.6,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: 0.1,
              }}
            />
            <motion.div
              className="w-2 h-2 bg-brand-pink rounded-full"
              animate={{
                y: [0, -8, 0],
              }}
              transition={{
                duration: 0.6,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: 0.2,
              }}
            />
          </div>

          {/* Message Tail */}
          <div className="absolute top-4 -left-2 w-0 h-0 border-r-8 border-r-white border-t-4 border-t-transparent border-b-4 border-b-transparent" />
        </div>
      </div>

      {/* "Lisa is aan het typen..." text */}
      <div className="absolute -bottom-6 left-10">
        <motion.p
          className="text-white/60 text-xs"
          animate={{
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          Lisa is aan het typen...
        </motion.p>
      </div>
    </motion.div>
  );
}
