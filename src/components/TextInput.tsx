'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { PaperAirplaneIcon } from '@heroicons/react/24/outline';

interface TextInputProps {
  placeholder: string;
  onSubmit: (value: string) => void;
  multiline?: boolean;
  example?: string;
}

export function TextInput({ placeholder, onSubmit, multiline = false, example }: TextInputProps) {
  const [value, setValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim()) {
      onSubmit(value.trim());
      setValue('');
    }
  };

  return (
    <motion.div
      className="mt-4 p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <form onSubmit={handleSubmit} className="space-y-3">
        {example && (
          <div className="text-white/60 text-sm">
            <span className="font-medium">Voorbeeld:</span> {example}
          </div>
        )}
        
        <div className="flex space-x-2">
          {multiline ? (
            <textarea
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={placeholder}
              className="flex-1 px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/60 focus:bg-white/30 focus:border-white/50 focus:outline-none transition-all resize-none"
              rows={3}
            />
          ) : (
            <input
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={placeholder}
              className="flex-1 px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/60 focus:bg-white/30 focus:border-white/50 focus:outline-none transition-all"
            />
          )}
          
          <motion.button
            type="submit"
            disabled={!value.trim()}
            className={`
              px-4 py-3 rounded-lg transition-all duration-200 flex items-center justify-center
              ${value.trim() 
                ? 'bg-white text-brand-purple hover:bg-white/90 shadow-lg' 
                : 'bg-white/20 text-white/40 cursor-not-allowed'
              }
            `}
            whileHover={value.trim() ? { scale: 1.05 } : {}}
            whileTap={value.trim() ? { scale: 0.95 } : {}}
          >
            <PaperAirplaneIcon className="w-5 h-5" />
          </motion.button>
        </div>
        
        <div className="text-white/50 text-xs">
          Druk Enter om te versturen
        </div>
      </form>
    </motion.div>
  );
}
