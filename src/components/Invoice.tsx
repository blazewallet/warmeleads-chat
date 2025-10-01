'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { DocumentTextIcon, BuildingOfficeIcon, EnvelopeIcon, PhoneIcon } from '@heroicons/react/24/outline';
import { PricingCalculator } from '@/lib/pricing';

interface InvoiceProps {
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

export function Invoice({ orderData, onConfirm, onBack }: InvoiceProps) {
  const invoiceNumber = `WL-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;
  const invoiceDate = new Date().toLocaleDateString('nl-NL');
  const dueDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('nl-NL');

  // Bereken totaal op basis van orderData using correct pricing
  const calculatePrice = () => {
    const { leadType, quantity, industry } = orderData;
    
    if (!leadType || !quantity || !industry) {
      return '€0,00';
    }
    
    try {
      // Parse quantity number from string like "30 leads - €1.275"
      const quantityNumber = parseInt(quantity.match(/\d+/)?.[0] || '0');
      
      if (quantityNumber === 0) return '€0,00';
      
      // Determine lead type
      const type = (leadType.toLowerCase().includes('exclusief') || 
                   leadType.toLowerCase().includes('exclusieve') ||
                   leadType.toLowerCase().includes('exclusive')) ? 'exclusive' : 'shared';
      
      // Use the PricingCalculator for accurate pricing
      const calculation = PricingCalculator.calculateOrder(industry, type, quantityNumber);
      
      return PricingCalculator.formatPrice(calculation.total);
    } catch (error) {
      console.error('Error calculating price in Invoice:', error);
      return '€0,00';
    }
  };

  const totalAmount = calculatePrice(); // Always calculate price from orderData

  return (
    <motion.div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-brand-purple to-brand-pink text-white p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <DocumentTextIcon className="w-8 h-8" />
              <div>
                <h2 className="text-2xl font-bold">Factuur</h2>
                <p className="text-white/80">WarmeLeads.eu</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-white/80">Factuur nr.</div>
              <div className="text-lg font-bold">{invoiceNumber}</div>
            </div>
          </div>
        </div>

        {/* Invoice Details */}
        <div className="p-6 space-y-6">
          {/* Company Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Van:</h3>
              <div className="space-y-2 text-gray-600">
                <div className="font-semibold">WarmeLeads.eu</div>
                <div>Verse leads binnen 15 minuten</div>
                <div>KvK: 12345678</div>
                <div>BTW: NL123456789B01</div>
                <div>info@warmeleads.eu</div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Naar:</h3>
              <div className="space-y-2 text-gray-600">
                <div className="font-semibold">{orderData.customerInfo.name}</div>
                {orderData.customerInfo.company && (
                  <div>{orderData.customerInfo.company}</div>
                )}
                <div className="flex items-center space-x-2">
                  <EnvelopeIcon className="w-4 h-4 text-gray-400" />
                  <span>{orderData.customerInfo.email}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <PhoneIcon className="w-4 h-4 text-gray-400" />
                  <span>{orderData.customerInfo.phone}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Invoice Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="text-sm text-gray-500">Factuurdatum:</div>
              <div className="font-semibold">{invoiceDate}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Vervaldatum:</div>
              <div className="font-semibold">{dueDate}</div>
            </div>
          </div>

          {/* Order Details */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Bestelling</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="font-semibold text-gray-700">Product</div>
                <div className="font-semibold text-gray-700">Aantal</div>
                <div className="font-semibold text-gray-700 text-right">Prijs</div>
              </div>
              <div className="border-t border-gray-200 mt-2 pt-2">
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-gray-600">
                    {orderData.leadType} - {orderData.industry}
                  </div>
                  <div className="text-gray-600">{orderData.quantity}</div>
                  <div className="text-gray-600 text-right">{totalAmount}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Total */}
          <div className="border-t border-gray-200 pt-6">
            <div className="flex justify-between items-center text-xl font-bold">
              <span>Totaal:</span>
              <span className="text-brand-pink">{totalAmount}</span>
            </div>
            <div className="text-sm text-gray-500 mt-1">Inclusief BTW</div>
          </div>

          {/* Terms */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-800 mb-2">📋 Leveringsvoorwaarden</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Verse leads uit onze campagnes binnen 15 minuten na betaling</li>
              <li>• Realtime inladen in uw persoonlijke dashboard</li>
              <li>• Leads gegenereerd via actieve advertentiecampagnes</li>
              <li>• 30 dagen garantie op leadkwaliteit</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4 pt-4">
            <motion.button
              onClick={onBack}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              ← Terug
            </motion.button>
            
            <motion.button
              onClick={onConfirm}
              className="flex-1 chat-button py-3 text-white font-semibold rounded-lg"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              💳 Betalen & Starten
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
