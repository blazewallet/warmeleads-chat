'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PhoneIcon,
  EnvelopeIcon,
  ChatBubbleLeftRightIcon,
  ClockIcon,
  StarIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

interface ContactCardProps {
  onContactSelect: (method: 'phone' | 'email' | 'whatsapp') => void;
}

export function ContactCard({ onContactSelect }: ContactCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<'phone' | 'email' | 'whatsapp' | null>(null);

  const handleContactClick = (method: 'phone' | 'email' | 'whatsapp') => {
    setSelectedMethod(method);
    setShowContactModal(true);
  };

  const handleConfirmContact = () => {
    if (selectedMethod) {
      onContactSelect(selectedMethod);
      setShowContactModal(false);
    }
  };

  const getContactInfo = () => {
    switch (selectedMethod) {
      case 'phone':
        return {
          title: 'Direct bellen',
          description: 'Persoonlijk advies binnen 15 minuten',
          action: 'Bel nu: +31 85 047 7067',
          icon: PhoneIcon,
          color: 'from-green-500 to-emerald-600'
        };
      case 'email':
        return {
          title: 'Email sturen',
          description: 'Antwoord binnen 2 uur gegarandeerd',
          action: 'Email: info@warmeleads.eu',
          icon: EnvelopeIcon,
          color: 'from-blue-500 to-indigo-600'
        };
      case 'whatsapp':
        return {
          title: 'WhatsApp sturen',
          description: 'Direct chatten via WhatsApp',
          action: 'WhatsApp: +31 6 1392 7338',
          icon: ChatBubbleLeftRightIcon,
          color: 'from-green-400 to-green-600'
        };
      default:
        return null;
    }
  };

  const contactInfo = getContactInfo();

  return (
    <>
      <motion.div
        className="relative p-8 rounded-2xl text-left overflow-hidden bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 transition-all duration-300 group cursor-pointer"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.5 }}
        whileHover={{ 
          scale: 1.02,
          y: -4,
        }}
        whileTap={{ scale: 0.98 }}
        onHoverStart={() => setIsExpanded(true)}
        onHoverEnd={() => setIsExpanded(false)}
      >
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-brand-purple to-brand-orange opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
        
        {/* Content */}
        <div className="relative z-10">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-purple to-brand-orange flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
              <PhoneIcon className="w-6 h-6 text-white" />
            </div>
          </div>
          
          <h3 className="text-xl font-bold text-white mb-2 group-hover:text-white">
            Liever direct contact?
          </h3>
          
          <p className="text-white/80 group-hover:text-white/90 transition-colors mb-4">
            "Bespaar tijd - neem direct contact op voor een gepersonaliseerd voorstel!"
          </p>

          {/* Contact Buttons */}
          <div className="space-y-2">
            <motion.button
              onClick={() => handleContactClick('phone')}
              className="w-full flex items-center space-x-3 p-3 bg-white/10 hover:bg-white/20 rounded-lg transition-all duration-200"
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.98 }}
            >
              <PhoneIcon className="w-5 h-5 text-white" />
              <span className="text-white font-medium">Bel ons</span>
            </motion.button>

            <motion.button
              onClick={() => handleContactClick('email')}
              className="w-full flex items-center space-x-3 p-3 bg-white/10 hover:bg-white/20 rounded-lg transition-all duration-200"
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.98 }}
            >
              <EnvelopeIcon className="w-5 h-5 text-white" />
              <span className="text-white font-medium">E-mail ons</span>
            </motion.button>

            <motion.button
              onClick={() => handleContactClick('whatsapp')}
              className="w-full flex items-center space-x-3 p-3 bg-white/10 hover:bg-white/20 rounded-lg transition-all duration-200"
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.98 }}
            >
              <ChatBubbleLeftRightIcon className="w-5 h-5 text-white" />
              <span className="text-white font-medium">WhatsApp ons</span>
            </motion.button>
          </div>

          {/* Trust Indicator */}
          <motion.div
            className="mt-4 flex items-center space-x-2 text-white/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: isExpanded ? 1 : 0.7 }}
            transition={{ duration: 0.3 }}
          >
            <StarIcon className="w-4 h-4 text-yellow-400" />
            <span className="text-sm">Gemiddeld 3 min gesprek = Perfect advies</span>
          </motion.div>

          {/* Arrow */}
          <motion.div
            className="absolute top-6 right-6 text-white/60 group-hover:text-white"
            initial={{ x: 0 }}
            whileHover={{ x: 4 }}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </motion.div>
        </div>
      </motion.div>

      {/* Contact Confirmation Modal */}
      <AnimatePresence>
        {showContactModal && contactInfo && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowContactModal(false)} />
            
            <motion.div
              className="relative bg-white rounded-2xl p-8 shadow-2xl max-w-md w-full"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
            >
              <button
                onClick={() => setShowContactModal(false)}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>

              <div className="text-center">
                <div className={`w-16 h-16 bg-gradient-to-br ${contactInfo.color} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                  <contactInfo.icon className="w-8 h-8 text-white" />
                </div>
                
                <h3 className="text-2xl font-bold text-brand-navy mb-2">
                  {contactInfo.title}
                </h3>
                
                <p className="text-gray-600 mb-4">
                  {contactInfo.description}
                </p>

                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <p className="font-mono text-brand-navy font-semibold">
                    {contactInfo.action}
                  </p>
                </div>

                {/* Trust Indicators */}
                <div className="bg-green-50 rounded-lg p-4 mb-6">
                  <div className="flex items-center justify-center space-x-4 text-sm text-green-800">
                    <div className="flex items-center space-x-1">
                      <ClockIcon className="w-4 h-4" />
                      <span>15 min response</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <StarIcon className="w-4 h-4" />
                      <span>Persoonlijk advies</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <motion.button
                    onClick={handleConfirmContact}
                    className="w-full chat-button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    ✅ Ja, neem contact op!
                  </motion.button>
                  
                  <button
                    onClick={() => setShowContactModal(false)}
                    className="w-full text-gray-500 hover:text-gray-700 py-2"
                  >
                    Toch liever chatten
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
