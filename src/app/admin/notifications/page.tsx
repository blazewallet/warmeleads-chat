'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BellIcon
} from '@heroicons/react/24/outline';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Echte notificaties laden (momenteel leeg)
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
        <h1 className="text-3xl font-bold text-gray-900">Notificaties</h1>
        <p className="text-gray-600 mt-1">
          Systeem meldingen en belangrijke updates
        </p>
      </motion.div>

      {/* Empty State */}
      <motion.div
        className="admin-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="text-center py-12">
          <BellIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-900 mb-2">Nog geen notificaties</h3>
          <p className="text-gray-500 mb-6">
            Systeem notificaties verschijnen hier automatisch
          </p>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 max-w-md mx-auto">
            <h4 className="font-semibold text-yellow-800 mb-2">Wat krijg je hier te zien?</h4>
            <ul className="text-sm text-yellow-700 text-left space-y-1">
              <li>• Nieuwe bestellingen alerts</li>
              <li>• Stripe betaling notificaties</li>
              <li>• AI blog artikel publicaties</li>
              <li>• Systeem status updates</li>
            </ul>
          </div>
        </div>
      </motion.div>
    </div>
  );
}