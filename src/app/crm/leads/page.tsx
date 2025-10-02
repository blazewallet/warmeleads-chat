'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ArrowLeftIcon, UserIcon } from '@heroicons/react/24/outline';
import { useAuthStore } from '@/lib/auth';
import { crmSystem } from '@/lib/crmSystem';

export default function CRMLeadsPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuthStore();

  // Auth check
  useEffect(() => {
    if (authLoading) return;
    
    if (!isAuthenticated || !user?.email) {
      window.location.href = '/';
      return;
    }
  }, [isAuthenticated, user, authLoading]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-sm border-b border-white/20">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/crm')}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <ArrowLeftIcon className="w-6 h-6 text-white" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-white">📊 CRM Leads Management</h1>
                <p className="text-white/80 text-sm">Clean leads interface</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="text-center py-16">
          <UserIcon className="w-16 h-16 text-white/40 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">CRM Leads Module</h3>
          <p className="text-white/70 mb-6">
            Clean leads management interface - analytics moved to main CRM dashboard
          </p>
          <button
            onClick={() => router.push('/crm')}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
          >
            ← Terug naar CRM Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
