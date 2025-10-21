'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  BellIcon,
  MagnifyingGlassIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';
import { getFirstAdminEmail } from '@/config/admin';

export function AdminHeader() {
  return (
    <motion.header
      className="bg-white border-b border-gray-200 px-6 py-4"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center justify-between">
        {/* Search */}
        <div className="flex-1 max-w-lg">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Zoek leads, chats, analytics..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-pink focus:border-transparent"
            />
          </div>
        </div>

        {/* Right Side */}
        <div className="flex items-center space-x-4">
          {/* Live Stats */}
          <div className="hidden md:flex items-center space-x-6 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-gray-600">12 Active Chats</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-brand-orange rounded-full" />
              <span className="text-gray-600">€2,340 Today</span>
            </div>
          </div>

          {/* Notifications */}
          <motion.button
            className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <BellIcon className="w-6 h-6" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </motion.button>

          {/* User Menu */}
          <div className="relative group">
            <motion.button
              className="flex items-center space-x-2 p-2 text-gray-600 hover:text-gray-800 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <UserCircleIcon className="w-8 h-8" />
              <div className="hidden md:block text-left">
                <div className="text-sm font-medium">Admin User</div>
                <div className="text-xs text-gray-500">{getFirstAdminEmail()}</div>
              </div>
            </motion.button>
            
            {/* Dropdown Menu */}
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
              <div className="py-2">
                <button
                  onClick={() => {
                    localStorage.removeItem('warmeleads_admin_token');
                    localStorage.removeItem('warmeleads_admin_user');
                    window.location.href = '/admin/login';
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  🚪 Uitloggen
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.header>
  );
}
