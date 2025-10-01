'use client';

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { DocumentTextIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { PricingCalculator } from '@/lib/pricing';

interface InvoiceChatMessageProps {
  orderData: {
    industry: string;
    leadType: string;
    quantity: string;
    total: string;
    customerInfo: {
      name: string;
      email: string;
      phone: string;
      company?: string;
    };
  };
  onConfirm: () => void;
  onBack: () => void;
}

export function InvoiceChatMessage({ orderData, onConfirm, onBack }: InvoiceChatMessageProps) {
  const invoiceNumber = `WL-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;
  const invoiceDate = new Date().toLocaleDateString('nl-NL');

  // Calculate correct pricing
  const calculatePrice = () => {
    const { leadType, quantity, industry } = orderData;
    
    if (!leadType || !quantity || !industry) {
      return '€0,00';
    }
    
    try {
      const quantityNumber = parseInt(quantity.match(/\d+/)?.[0] || '0');
      if (quantityNumber === 0) return '€0,00';
      
      const type = (leadType.toLowerCase().includes('exclusief') || 
                   leadType.toLowerCase().includes('exclusieve') ||
                   leadType.toLowerCase().includes('exclusive')) ? 'exclusive' : 'shared';
      
      const calculation = PricingCalculator.calculateOrder(industry, type, quantityNumber);
      return PricingCalculator.formatPrice(calculation.total);
    } catch (error) {
      console.error('Error calculating price:', error);
      return '€0,00';
    }
  };

  // Memoize expensive calculations
  const { totalAmount, quantityNumber } = useMemo(() => {
    const amount = calculatePrice();
    const qty = parseInt(orderData.quantity.match(/\d+/)?.[0] || '0');
    return { totalAmount: amount, quantityNumber: qty };
  }, [orderData]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="flex justify-start mb-4"
    >
      <div className="flex flex-row items-start space-x-2 sm:space-x-3 max-w-full sm:max-w-lg">
        {/* Lisa Avatar */}
        <motion.div
          className="w-8 h-8 rounded-full bg-gradient-to-r from-brand-purple to-brand-pink flex items-center justify-center flex-shrink-0"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
        >
          <span className="text-white text-sm font-bold">L</span>
        </motion.div>

        {/* Invoice Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-4 sm:p-6 max-w-sm sm:max-w-md w-full">
          {/* Header */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-r from-brand-purple to-brand-pink rounded-xl flex items-center justify-center">
              <DocumentTextIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">Uw bestelling</h3>
              <p className="text-sm text-gray-500">Factuur {invoiceNumber}</p>
            </div>
          </div>

          {/* Customer Info */}
          <div className="bg-gray-50 rounded-xl p-4 mb-4">
            <h4 className="font-semibold text-gray-800 mb-2">Klantgegevens</h4>
            <div className="space-y-1 text-sm text-gray-600">
              <div><strong>Naam:</strong> {orderData.customerInfo.name}</div>
              <div><strong>Email:</strong> {orderData.customerInfo.email}</div>
              <div><strong>Telefoon:</strong> {orderData.customerInfo.phone}</div>
              {orderData.customerInfo.company && (
                <div><strong>Bedrijf:</strong> {orderData.customerInfo.company}</div>
              )}
            </div>
          </div>

          {/* Order Details */}
          <div className="border-t border-gray-200 pt-4 mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">Product:</span>
              <span className="font-medium text-gray-900">{orderData.leadType}</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">Branche:</span>
              <span className="font-medium text-gray-900">{orderData.industry}</span>
            </div>
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm text-gray-600">Aantal:</span>
              <span className="font-medium text-gray-900">{quantityNumber} leads</span>
            </div>
            
            <div className="flex justify-between items-center pt-4 border-t border-gray-200">
              <span className="font-bold text-gray-900">Totaal:</span>
              <span className="font-bold text-xl text-brand-purple">{totalAmount}</span>
            </div>
            <div className="text-xs text-gray-500 text-right mt-1">Inclusief BTW</div>
          </div>

          {/* Guarantees */}
          <div className="bg-green-50 rounded-xl p-4 mb-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircleIcon className="w-5 h-5 text-green-600" />
              <h4 className="font-semibold text-green-800">Onze garanties</h4>
            </div>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• Verse leads binnen 15 minuten</li>
              <li>• Realtime dashboard toegang</li>
              <li>• Nederlandse prospects</li>
              <li>• 30 dagen kwaliteitsgarantie</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <motion.button
              onClick={onBack}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors text-sm font-medium"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              ← Wijzigen
            </motion.button>
            
            <motion.button
              onClick={onConfirm}
              className="flex-1 sm:flex-2 px-6 py-3 bg-gradient-to-r from-brand-purple to-brand-pink text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300 text-sm"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              💳 Betalen via iDEAL
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
