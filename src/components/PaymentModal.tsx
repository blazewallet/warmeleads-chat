'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, CheckIcon, CreditCardIcon } from '@heroicons/react/24/outline';
import { leadPackages, formatPrice } from '@/lib/stripe';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  industry: string;
  leadType: 'exclusive' | 'shared';
  customerInfo: {
    name: string;
    email: string;
    phone?: string;
    company?: string;
  };
}

export function PaymentModal({ 
  isOpen, 
  onClose, 
  industry, 
  leadType, 
  customerInfo 
}: PaymentModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const packages = leadPackages[industry]?.filter(pkg => pkg.type === leadType) || [];

  const handlePayment = async (packageId: string) => {
    setIsProcessing(true);
    
    try {
      // Create payment intent
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          packageId,
          quantity: 1,
          customerInfo,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create payment intent');
      }

      const { clientSecret } = await response.json();
      
      // Here you would integrate with Stripe Elements
      console.log('Payment intent created:', clientSecret);
      
      // For now, we'll simulate a successful payment
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        setIsProcessing(false);
        onClose();
        // Show success message
        alert('Betaling succesvol! Uw leads worden binnen 15 minuten geleverd.');
        timeoutRef.current = null;
      }, 2000);

    } catch (error) {
      console.error('Payment failed:', error);
      setIsProcessing(false);
      alert('Betaling mislukt. Probeer het opnieuw.');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 overflow-y-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
          
          {/* Modal */}
          <div className="flex min-h-full items-center justify-center p-4">
            <motion.div
              className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Bestelling Afronden
                  </h2>
                  <p className="text-gray-600 mt-1">
                    {leadType === 'exclusive' ? 'Exclusieve' : 'Gedeelde'} {industry} leads
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6">
                {/* Customer Info */}
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-2">Klantgegevens</h3>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p><strong>Naam:</strong> {customerInfo.name}</p>
                    <p><strong>Email:</strong> {customerInfo.email}</p>
                    {customerInfo.phone && (
                      <p><strong>Telefoon:</strong> {customerInfo.phone}</p>
                    )}
                    {customerInfo.company && (
                      <p><strong>Bedrijf:</strong> {customerInfo.company}</p>
                    )}
                  </div>
                </div>

                {/* Package Selection */}
                <div className="space-y-4">
                  <h3 className="font-medium text-gray-900">Kies uw pakket:</h3>
                  
                  {packages.map((pkg) => (
                    <motion.div
                      key={pkg.id}
                      className={`
                        border-2 rounded-xl p-6 cursor-pointer transition-all duration-200
                        ${selectedPackage === pkg.id 
                          ? 'border-brand-pink bg-brand-pink/5' 
                          : 'border-gray-200 hover:border-brand-pink/50'
                        }
                      `}
                      onClick={() => setSelectedPackage(pkg.id)}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <div className={`
                              w-5 h-5 rounded-full border-2 flex items-center justify-center
                              ${selectedPackage === pkg.id 
                                ? 'border-brand-pink bg-brand-pink' 
                                : 'border-gray-300'
                              }
                            `}>
                              {selectedPackage === pkg.id && (
                                <CheckIcon className="w-3 h-3 text-white" />
                              )}
                            </div>
                            <h4 className="font-semibold text-gray-900">{pkg.name}</h4>
                          </div>
                          
                          <p className="text-gray-600 mt-2 ml-8">{pkg.description}</p>
                          
                          <div className="mt-3 ml-8">
                            <div className="flex items-center space-x-4">
                              <span className="text-2xl font-bold text-brand-pink">
                                {formatPrice(pkg.price)}
                              </span>
                              <span className="text-gray-500">per lead</span>
                            </div>
                            
                            <ul className="mt-3 space-y-1">
                              {pkg.features.map((feature, index) => (
                                <li key={index} className="flex items-center text-sm text-gray-600">
                                  <CheckIcon className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                                  {feature}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="text-sm text-gray-500">Totaal</div>
                          <div className="text-xl font-bold text-gray-900">
                            {formatPrice(pkg.price * pkg.quantity)}
                          </div>
                          <div className="text-xs text-gray-500">
                            {pkg.quantity} leads
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Special Offer */}
                <motion.div
                  className="mt-6 p-4 bg-gradient-to-r from-brand-pink/10 to-brand-orange/10 rounded-lg border border-brand-pink/20"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-brand-pink rounded-full animate-pulse" />
                    <span className="font-medium text-brand-pink">Nieuwe klant voordeel!</span>
                  </div>
                  <p className="text-sm text-gray-700 mt-1">
                    🎁 <strong>Eerste 10 leads gratis</strong> om de kwaliteit te testen
                  </p>
                  <p className="text-sm text-gray-700">
                    ⚡ <strong>20% korting</strong> op uw eerste bestelling deze maand
                  </p>
                </motion.div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between p-6 border-t border-gray-200">
                <div className="text-sm text-gray-500">
                  🔒 Veilige betaling via Stripe • Leads binnen 15 minuten
                </div>
                
                <div className="flex space-x-3">
                  <button
                    onClick={onClose}
                    className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                    disabled={isProcessing}
                  >
                    Annuleren
                  </button>
                  
                  <motion.button
                    onClick={() => selectedPackage && handlePayment(selectedPackage)}
                    disabled={!selectedPackage || isProcessing}
                    className={`
                      px-8 py-3 rounded-lg font-medium flex items-center space-x-2 transition-all duration-200
                      ${selectedPackage && !isProcessing
                        ? 'chat-button' 
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }
                    `}
                    whileHover={selectedPackage && !isProcessing ? { scale: 1.05 } : {}}
                    whileTap={selectedPackage && !isProcessing ? { scale: 0.95 } : {}}
                  >
                    {isProcessing ? (
                      <>
                        <div className="loading-spinner" />
                        <span>Verwerken...</span>
                      </>
                    ) : (
                      <>
                        <CreditCardIcon className="w-5 h-5" />
                        <span>Betalen & Starten</span>
                      </>
                    )}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
