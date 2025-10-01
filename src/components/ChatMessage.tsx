'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { nl } from 'date-fns/locale';

interface Message {
  id: string;
  type: 'lisa' | 'user';
  content: string;
  timestamp: Date;
  options?: string[];
}

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isLisa = message.type === 'lisa';

  return (
    <motion.div
      className={`flex ${isLisa ? 'justify-start' : 'justify-end'} mb-4`}
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      <div className={`flex ${isLisa ? 'flex-row' : 'flex-row-reverse'} items-end space-x-2 max-w-xs sm:max-w-md`}>
        {/* Avatar */}
        {isLisa && (
          <motion.div
            className="w-8 h-8 rounded-full bg-lisa-gradient flex items-center justify-center flex-shrink-0"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
          >
            <span className="text-white text-sm font-bold">L</span>
          </motion.div>
        )}

        {/* Message Bubble */}
        <div className="flex flex-col">
          <motion.div
            className={`
              ${isLisa 
                ? 'chat-message lisa' 
                : 'chat-message user'
              }
              relative
            `}
            whileHover={{ scale: 1.02 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            {/* Message Content */}
            <div className="text-sm leading-relaxed">
              {message.content}
            </div>

            {/* Message Tail */}
            <div className={`
              absolute top-4 w-0 h-0
              ${isLisa 
                ? '-left-2 border-r-8 border-r-white border-t-4 border-t-transparent border-b-4 border-b-transparent' 
                : '-right-2 border-l-8 border-l-brand-pink border-t-4 border-t-transparent border-b-4 border-b-transparent'
              }
            `} />
          </motion.div>

          {/* Timestamp */}
          <div className={`text-xs text-white/60 mt-1 ${isLisa ? 'text-left' : 'text-right'}`}>
            {format(message.timestamp, 'HH:mm', { locale: nl })}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
