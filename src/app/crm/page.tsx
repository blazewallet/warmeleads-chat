'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  ChartBarIcon,
  UserGroupIcon,
  CogIcon,
  ArrowRightIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { useAuthStore } from '@/lib/auth';
import { crmSystem, type Customer, type Lead } from '@/lib/crmSystem';
import { branchIntelligence, type BranchAnalytics } from '@/lib/branchIntelligence';

export default function CRMDashboard() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuthStore();
  
  // CRM Data state
  const [customerData, setCustomerData] = useState<Customer | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [branchAnalytics, setBranchAnalytics] = useState<BranchAnalytics[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Auth check
  useEffect(() => {
    if (authLoading) return;
    
    if (!isAuthenticated || !user?.email) {
      window.location.href = '/';
      return;
    }
    
    loadCRMData();
  }, [isAuthenticated, user, authLoading]);

  const loadCRMData = () => {
    const customers = crmSystem.getAllCustomers();
    const customer = customers.find(c => c.email === user?.email);
    
    if (!customer) {
      console.error('No customer found');
      setIsLoading(false);
      return;
    }

    setCustomerData(customer);
    setLeads(customer.leadData || []);
    
    // Generate branch analytics
    if (customer.leadData && customer.leadData.length > 0) {
      const analytics = branchIntelligence.analyzeBranchPerformance(customer.leadData);
      setBranchAnalytics(analytics);
      console.log('📊 CRM Branch analytics generated:', analytics);
    }
    
    setIsLoading(false);
  };

  const handleNavigateToModule = (path: string) => {
    router.push(path);
  };

  // Calculate overall stats
  const overallStats = {
    totalLeads: leads.length,
    converted: leads.filter(l => l.status === 'converted').length,
    conversionRate: leads.length > 0 ? (leads.filter(l => l.status === 'converted').length / leads.length * 100) : 0,
    totalRevenue: branchAnalytics.reduce((sum, analytics) => sum + analytics.revenue, 0),
    avgLeadValue: branchAnalytics.reduce((sum: number, analytics) => sum + analytics.avgLeadValue, 0) / Math.max(branchAnalytics.length, 1),
    totalGrowth: branchAnalytics.length > 0 ? branchAnalytics.reduce((sum: number, analytics) => sum + analytics.trends.growth, 0) / branchAnalytics.length : 0
  };

  if (authLoading || isLoading) {
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
                onClick={() => router.push('/portal')}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <ArrowRightIcon className="w-6 h-6 text-white rotate-180" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-white">🏢 CRM Dashboard</h1>
                <p className="text-white/80 text-sm">Enterprise-grade lead & branch management</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="text-right text-white">
                <div className="text-sm font-medium">{user?.name}</div>
                <div className="text-xs text-white/70">{user?.email}</div>
              </div>
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">{user?.name?.charAt(0)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        
        {/* Quick Navigation Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          <motion.div
            whileHover={{ scale: 1.02 }}
            onClick={() => handleNavigateToModule('/crm/leads')}
            className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 cursor-pointer hover:bg-white/20 transition-all group"
          >
            <div className="flex items-center justify-between mb-4">
              <UserGroupIcon className="w-8 h-8 text-blue-400" />
              <ArrowRightIcon className="w-5 h-5 text-white/60 group-hover:text-white group-hover:translate-x-1 transition-all" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Leads Management</h3>
            <p className="text-white/70 text-sm mb-3">Manage your leads with AI-powered branch detection</p>
            <div className="text-2xl font-bold text-blue-400">{overallStats.totalLeads}</div>
            <div className="text-xs text-white/60">Total leads</div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            onClick={() => handleNavigateToModule('/crm/analytics')}
            className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 cursor-pointer hover:bg-white/20 transition-all group"
          >
            <div className="flex items-center justify-between mb-4">
              <ChartBarIcon className="w-8 h-8 text-purple-400" />
              <ArrowRightIcon className="w-5 h-5 text-white/60 group-hover:text-white group-hover:translate-x-1 transition-all" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Advanced Analytics</h3>
            <p className="text-white/70 text-sm mb-3">Deep dive into branch performance & trends</p>
            <div className="text-2xl font-bold text-purple-400">{overallStats.conversionRate.toFixed(1)}%</div>
            <div className="text-xs text-white/60">Conversion rate</div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            onClick={() => handleNavigateToModule('/crm/settings')}
            className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 cursor-pointer hover:bg-white/20 transition-all group"
          >
            <div className="flex items-center justify-between mb-4">
              <CogIcon className="w-8 h-8 text-green-400" />
              <ArrowRightIcon className="w-5 h-5 text-white/60 group-hover:text-white group-hover:translate-x-1 transition-all" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Settings & Config</h3>
            <p className="text-white/70 text-sm mb-3">Configure branch settings & integrations</p>
            <div className="text-2xl font-bold text-green-400">{branchAnalytics.length}</div>
            <div className="text-xs text-white/60">Active branches</div>
          </motion.div>
        </motion.div>

        {/* Branch Intelligence Overview */}
        {branchAnalytics.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold text-white">🧠 Branch Intelligence Overview</h2>
              <button
                onClick={() => handleNavigateToModule('/crm/analytics')}
                className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-xl transition-colors flex items-center space-x-2"
              >
                <span>Beluister Analytics</span>
                <ArrowRightIcon className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {branchAnalytics.map((analytics, index) => (
                <motion.div
                  key={analytics.branch}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 hover:bg-white/20 transition-all"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-white text-lg">
                      {analytics.branch === 'Thuisbatterijen' && '🔋'}
                      {analytics.branch === 'Financial Lease' && '🚗'}
                      {analytics.branch === 'Warmtepompen' && '🔥'}
                      {analytics.branch === 'Zonnepanelen' && '☀️'}
                      {analytics.branch === 'Airco' && '❄️'}
                      {analytics.branch === 'Custom' && '🎯'}
                      {' '}{analytics.branch}
                    </h3>
                    <div className={`flex items-center space-x-1 text-xs px-2 py-1 rounded-full ${
                      analytics.trends.growth > 0 ? 'bg-green-100 text-green-800' : 
                      analytics.trends.growth < 0 ? 'bg-red-100 text-red-800' : 
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {analytics.trends.growth > 0 ? <ArrowUpIcon className="w-3 h-3" /> : 
                       analytics.trends.growth < 0 ? <ArrowDownIcon className="w-3 h-3" /> :
                       <ClockIcon className="w-3 h-3" />}
                      <span>{analytics.trends.growth > 0 ? '+' : ''}{analytics.trends.growth}%</span>
                    </div>
                  </div>
                  
                  <div className="space-x-3">
                    <div className="flex justify-between items-center">
                      <span className="text-white/70 text-sm">Leads:</span>
                      <span className="font-bold text-white">{analytics.totalLeads}</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-white/70 text-sm">Conversion:</span>
                      <span className="font-bold text-purple-400">{analytics.conversionRate.toFixed(1)}%</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-white/70 text-sm">Revenue:</span>
                      <span className="font-bold text-green-400">€{Math.round(analytics.revenue / 1000)}K</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-white/70 text-sm">AVG Lead:</span>
                      <span className="font-bold text-blue-400">€{Math.round(analytics.avgLeadValue)}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Overall Performance Summary */}
        {branchAnalytics.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-8 bg-white/10 backdrop-blur-sm rounded-2xl p-6"
          >
            <h3 className="text-xl font-bold text-white mb-4">📊 Overall Performance Summary</h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-1">{overallStats.totalLeads}</div>
                <div className="text-sm text-white/70">Total Leads</div>
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-400 mb-1">{overallStats.conversionRate.toFixed(1)}%</div>
                <div className="text-sm text-white/70">Conversion Rate</div>
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-green-400 mb-1">€{Math.round(overallStats.totalRevenue / 1000)}K</div>
                <div className="text-sm text-white/70">Total Revenue</div>
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-400 mb-1">€{Math.round(overallStats.avgLeadValue)}</div>
                <div className="text-sm text-white/70">Average Lead Value</div>
              </div>
            </div>
          </motion.div>
        )}

      </div>
    </div>
  );
}
