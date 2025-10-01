'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  DocumentTextIcon,
  CurrencyEuroIcon
} from '@heroicons/react/24/outline';

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Echte bestellingen laden (momenteel leeg)
    setIsLoading(false);
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-gray-900">Bestellingen</h1>
        <p className="text-gray-600 mt-1">
          Overzicht van alle bestellingen en hun status
        </p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="admin-card text-center">
          <div className="text-3xl font-bold text-brand-purple">0</div>
          <div className="text-gray-600">Totaal Bestellingen</div>
        </div>
        <div className="admin-card text-center">
          <div className="text-3xl font-bold text-green-600">€0</div>
          <div className="text-gray-600">Gerealiseerde Omzet</div>
        </div>
        <div className="admin-card text-center">
          <div className="text-3xl font-bold text-yellow-600">€0</div>
          <div className="text-gray-600">Pending Omzet</div>
        </div>
        <div className="admin-card text-center">
          <div className="text-3xl font-bold text-brand-pink">0</div>
          <div className="text-gray-600">Afgeronde Orders</div>
        </div>
      </div>

      {/* Empty State */}
      <motion.div
        className="admin-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="text-center py-12">
          <DocumentTextIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-900 mb-2">Nog geen bestellingen</h3>
          <p className="text-gray-500 mb-6">
            Bestellingen verschijnen hier automatisch wanneer klanten leads kopen
          </p>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 max-w-md mx-auto">
            <h4 className="font-semibold text-green-800 mb-2">Hoe krijg je bestellingen?</h4>
            <ul className="text-sm text-green-700 text-left space-y-1">
              <li>• Klanten gaan naar www.warmeleads.eu</li>
              <li>• Ze starten de chat en kiezen leads</li>
              <li>• Na succesvolle Stripe betaling</li>
              <li>• Verschijnt de bestelling automatisch hier</li>
            </ul>
          </div>
        </div>
      </motion.div>
    </div>
  );
}