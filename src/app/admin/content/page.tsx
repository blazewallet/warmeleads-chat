'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  DocumentTextIcon,
  PlusIcon
} from '@heroicons/react/24/outline';

export default function ContentPage() {
  const [content, setContent] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Echte content data laden (momenteel leeg)
    setIsLoading(false);
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex justify-between items-center"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Content Beheer</h1>
          <p className="text-gray-600 mt-1">
            Beheer blog artikelen, prijzen, chat flows en landing pages
          </p>
        </div>
        <div className="flex space-x-3">
          <button className="bg-gradient-to-r from-brand-purple to-brand-pink text-white px-4 py-2 rounded-lg font-semibold hover:scale-105 transition-transform flex items-center space-x-2">
            <PlusIcon className="w-5 h-5" />
            <span>Nieuw Artikel</span>
          </button>
          <button className="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:scale-105 transition-transform">
            🤖 AI Genereren
          </button>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="admin-card text-center">
          <div className="text-3xl font-bold text-blue-600">7</div>
          <div className="text-gray-600">Blog Artikelen</div>
          <div className="text-xs text-gray-500 mt-1">Live op website</div>
        </div>
        <div className="admin-card text-center">
          <div className="text-3xl font-bold text-orange-600">5</div>
          <div className="text-gray-600">Landing Pages</div>
          <div className="text-xs text-gray-500 mt-1">Branche specifiek</div>
        </div>
        <div className="admin-card text-center">
          <div className="text-3xl font-bold text-purple-600">1</div>
          <div className="text-gray-600">Chat Flows</div>
          <div className="text-xs text-gray-500 mt-1">Express checkout</div>
        </div>
        <div className="admin-card text-center">
          <div className="text-3xl font-bold text-green-600">100%</div>
          <div className="text-gray-600">Live Status</div>
          <div className="text-xs text-gray-500 mt-1">Alle content actief</div>
        </div>
      </div>

      {/* Content Info */}
      <motion.div
        className="admin-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="text-center py-8">
          <DocumentTextIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-900 mb-2">Content Management</h3>
          <p className="text-gray-500 mb-6">
            Alle website content wordt automatisch beheerd
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-800 mb-2">🤖 AI Blog Systeem</h4>
              <ul className="text-sm text-blue-700 text-left space-y-1">
                <li>• Automatische artikelen elke maandag</li>
                <li>• SEO geoptimaliseerd</li>
                <li>• Actuele marktdata</li>
                <li>• www.warmeleads.eu/blog</li>
              </ul>
            </div>
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <h4 className="font-semibold text-orange-800 mb-2">🎯 Landing Pages</h4>
              <ul className="text-sm text-orange-700 text-left space-y-1">
                <li>• /leads-thuisbatterijen</li>
                <li>• /leads-zonnepanelen</li>
                <li>• /leads-warmtepompen</li>
                <li>• /leads-financial-lease</li>
              </ul>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}