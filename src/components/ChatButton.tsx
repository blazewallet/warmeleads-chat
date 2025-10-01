'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface ChatButtonProps {
  text: string;
  onClick: () => void;
  delay?: number;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
}

export function ChatButton({ 
  text, 
  onClick, 
  delay = 0, 
  variant = 'primary',
  disabled = false 
}: ChatButtonProps) {
  return (
    <motion.button
      className={`
        w-full text-center p-4 rounded-xl font-semibold text-lg transition-all duration-300 shadow-lg
        ${variant === 'primary' 
          ? 'bg-white text-brand-purple border-2 border-white hover:bg-brand-purple hover:text-white' 
          : 'bg-white/10 text-white border-2 border-white/50 hover:bg-white hover:text-brand-purple'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.02] active:scale-[0.98] hover:shadow-xl'}
      `}
      onClick={disabled ? undefined : onClick}
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        duration: 0.3, 
        delay,
        type: 'spring',
        stiffness: 200,
        damping: 20
      }}
      whileHover={disabled ? {} : { 
        scale: 1.02,
        y: -2,
      }}
      whileTap={disabled ? {} : { scale: 0.98 }}
      disabled={disabled}
    >
      <div className="flex items-center justify-center">
        <span className="font-semibold">{text}</span>
        <motion.div
          className="ml-3"
          initial={{ x: 0 }}
          whileHover={{ x: 4 }}
          transition={{ duration: 0.2 }}
        >
          <svg 
            className="w-6 h-6" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2.5} 
              d="M13 7l5 5m0 0l-5 5m5-5H6" 
            />
          </svg>
        </motion.div>
      </div>
    </motion.button>
  );
}
