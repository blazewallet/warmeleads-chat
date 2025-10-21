'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  HomeIcon,
  ChatBubbleLeftRightIcon,
  ChartBarIcon,
  CogIcon,
  UserGroupIcon,
  CurrencyEuroIcon,
  DocumentTextIcon,
  BellIcon,
} from '@heroicons/react/24/outline';

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: HomeIcon },
  { name: 'Klanten', href: '/admin/customers', icon: UserGroupIcon },
  { name: 'Bestellingen', href: '/admin/orders', icon: DocumentTextIcon },
  { name: 'Prijsbeheer', href: '/admin/pricing', icon: CurrencyEuroIcon },
  { name: 'Analytics', href: '/admin/analytics', icon: ChartBarIcon },
  { name: 'Content', href: '/admin/content', icon: DocumentTextIcon },
  { name: 'Live chats', href: '/admin/chats', icon: ChatBubbleLeftRightIcon },
  { name: 'Instellingen', href: '/admin/settings', icon: CogIcon },
  { name: 'Notificaties', href: '/admin/notifications', icon: BellIcon },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <motion.div
      className={`bg-brand-navy text-white transition-all duration-300 ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
      animate={{ width: isCollapsed ? 64 : 256 }}
    >
      {/* Logo */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <h1 className="text-xl font-bold gradient-text">WarmeLeads</h1>
              <p className="text-white/60 text-sm">Admin Dashboard</p>
            </motion.div>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <svg
              className={`w-5 h-5 transition-transform ${
                isCollapsed ? 'rotate-180' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-2">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link key={item.name} href={item.href}>
              <motion.div
                className={`
                  flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
                  ${
                    isActive
                      ? 'bg-lisa-gradient text-white shadow-lg'
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }
                `}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {!isCollapsed && (
                  <motion.span
                    className="ml-3"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                  >
                    {item.name}
                  </motion.span>
                )}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* Status Indicator */}
      {!isCollapsed && (
        <motion.div
          className="absolute bottom-4 left-4 right-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="bg-white/10 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-xs text-white/60">System Online</span>
            </div>
            <div className="text-xs text-white/40 mt-1">
              Last update: 2 min ago
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
