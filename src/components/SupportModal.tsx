'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, PhoneIcon, EnvelopeIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';

interface SupportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SupportModal({ isOpen, onClose }: SupportModalProps) {
  const contactOptions = [
    {
      icon: ChatBubbleLeftRightIcon,
      title: 'WhatsApp ons',
      description: 'Direct contact via WhatsApp',
      color: 'from-green-500 to-emerald-600',
      action: () => window.open('https://wa.me/31613927338', '_blank'),
    },
    {
      icon: PhoneIcon,
      title: 'Bel ons',
      description: '+31 85 047 7067',
      color: 'from-blue-500 to-cyan-600',
      action: () => window.location.href = 'tel:+31850477067',
    },
    {
      icon: EnvelopeIcon,
      title: 'E-mail ons',
      description: 'info@warmeleads.eu',
      color: 'from-purple-500 to-pink-600',
      action: () => window.location.href = 'mailto:info@warmeleads.eu',
    },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-0 z-50 overflow-y-auto"
          >
            <div className="flex min-h-full items-center justify-center p-4">
              <div className="relative w-full max-w-md bg-gradient-to-br from-orange-50 to-red-50 rounded-3xl shadow-2xl">
                {/* Header */}
                <div className="relative bg-gradient-to-r from-orange-600 to-red-600 text-white px-8 py-6 rounded-t-3xl">
                  <button
                    onClick={onClose}
                    className="absolute top-6 right-6 p-2 hover:bg-white/20 rounded-full transition-colors"
                  >
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                  
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                      <ChatBubbleLeftRightIcon className="w-8 h-8" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold">Contact & Support</h2>
                      <p className="text-orange-100 mt-1">
                        Hoe kunnen we je helpen?
                      </p>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-8 space-y-4">
                  {contactOptions.map((option, index) => {
                    const Icon = option.icon;
                    return (
                      <motion.button
                        key={option.title}
                        onClick={option.action}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="w-full flex items-center gap-4 p-5 bg-white hover:bg-orange-50 rounded-2xl border-2 border-orange-200 hover:border-orange-400 transition-all group shadow-sm hover:shadow-md"
                      >
                        <div className={`p-3 rounded-xl bg-gradient-to-br ${option.color} group-hover:scale-110 transition-transform`}>
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1 text-left">
                          <h3 className="text-gray-900 font-bold">{option.title}</h3>
                          <p className="text-gray-600 text-sm">{option.description}</p>
                        </div>
                        <svg className="w-5 h-5 text-gray-400 group-hover:text-orange-600 group-hover:translate-x-1 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </motion.button>
                    );
                  })}
                </div>

                {/* Footer */}
                <div className="px-8 pb-8 pt-4 border-t border-orange-200">
                  <div className="text-center text-gray-600 text-sm">
                    <p className="mb-2">💬 Gemiddelde reactietijd: <span className="text-orange-600 font-bold">3 minuten</span></p>
                    <p className="text-xs">Beschikbaar op werkdagen van 9:00 - 18:00</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

