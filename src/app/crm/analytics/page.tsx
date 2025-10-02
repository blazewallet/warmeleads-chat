'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  ArrowLeftIcon,
  ChartBarIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  ClockIcon,
  UserGroupIcon,
  CurrencyEuroIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  SparklesIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import { useAuthStore } from '@/lib/auth';
import { crmSystem, type Customer, type Lead } from '@/lib/crmSystem';
import { branchIntelligence, type BranchAnalytics, type Branch } from '@/lib/branchIntelligence';

export default function CRMAnalyticsPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuthStore();
  const [customerData, setCustomerData] = useState<Customer | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [branchAnalytics, setBranchAnalytics] = useState<BranchAnalytics[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedBranch, setSelectedBranch] = useState<Branch | 'all'>('all');
  const [dateRange, setDateRange] = useState<'week' | 'month' | 'quarter' | 'year'>('month');

  // Load CRM data
  const loadCRMData = async () => {
    try {
      setIsLoading(true);
      
      // Try to get customer data from API first
      let customer: Customer | null = null;
      try {
        const response = await fetch('/api/customer-data', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (response.ok) {
          customer = await response.json();
          console.log('✅ Fetched customer data from API');
        } else {
          console.log('⚠️ Could not fetch from API, falling back to localStorage');
        }
      } catch (error) {
        console.log('⚠️ API fetch failed, falling back to localStorage');
      }

      // Fallback to localStorage
      if (!customer && user?.email) {
        const allCustomers = crmSystem.getAllCustomers();
        customer = allCustomers.find(cust => cust.email === user.email) || null;
      }

      if (!customer) {
        console.error('❌ No customer data found');
        return;
      }

      console.log('📊 Customer loaded:', customer.name);
      setCustomerData(customer);
      
      if (customer.leadData && customer.leadData.length > 0) {
        setLeads(customer.leadData);
        
        // Generate branch analytics
        const analytics = branchIntelligence.analyzeBranchPerformance(customer.leadData);
        setBranchAnalytics(analytics);
        console.log('📈 Branch analytics generated:', analytics.length, 'branches');
      }
      
    } catch (error) {
      console.error('❌ Error loading CRM data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && isAuthenticated && user) {
      loadCRMData();
    }
  }, [authLoading, isAuthenticated, user]);

  // Filter leads by date range
  const getFilteredLeads = () => {
    if (!leads.length) return [];

    const now = new Date();
    let cutoffDate = new Date();

    switch (dateRange) {
      case 'week':
        cutoffDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        cutoffDate.setMonth(now.getMonth() - 1);
        break;
      case 'quarter':
        cutoffDate.setMonth(now.getMonth() - 3);
        break;
      case 'year':
        cutoffDate.setFullYear(now.getFullYear() - 1);
        break;
    }

    return leads.filter(lead => {
      const leadDate = new Date(lead.createdAt);
      return leadDate >= cutoffDate;
    });
  };

  // Calculate overall stats
  const getOverallStats = () => {
    const filteredLeads = getFilteredLeads();
    const totalLeads = filteredLeads.length;
    
    const conversionMap = new Map<string, number>();
    const revenueMap = new Map<string, number>();

    filteredLeads.forEach(lead => {
      const intelligence = branchIntelligence.detectBranch(lead);
      const branch = intelligence.detectedBranch;
      
      // Count conversions
      const currentConversions = conversionMap.get(branch) || 0;
      conversionMap.set(branch, currentConversions + (lead.status === 'qualified' ? 1 : 0));
      
      // Estimate revenue based on branch
      const currentRevenue = revenueMap.get(branch) || 0;
      const estimatedValue = branchIntelligence.analyzeBranchPerformance([lead])[0]?.revenue || 0;
      revenueMap.set(branch, currentRevenue + estimatedValue);
    });

    const totalConversions = Array.from(conversionMap.values()).reduce((sum, val) => sum + val, 0);
    const totalRevenue = Array.from(revenueMap.values()).reduce((sum, val) => sum + val, 0);
    const conversionRate = totalLeads > 0 ? (totalConversions / totalLeads) * 100 : 0;
    const avgLeadValue = totalLeads > 0 ? totalRevenue / totalLeads : 0;

    return {
      revenue: totalRevenue,
      totalLeads,
      conversions: totalConversions,
      conversionRate,
      avgLeadValue
    };
  };

  const overallStats = getOverallStats();

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-xl">Analytics laden...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-sm border-b border-white/20">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <button
                onClick={() => router.push('/crm')}
                className="flex items-center space-x-2 text-white/80 hover:text-white transition-colors"
              >
                <ArrowLeftIcon className="w-5 h-5" />
                <span>Terug naar CRM</span>
              </button>
              
              <div className="h-8 w-px bg-white/30"></div>
              
              <div>
                <h1 className="text-3xl font-bold text-white flex items-center space-x-3">
                  <ChartBarIcon className="w-8 h-8 text-purple-400" />
                  <span>Geavanceerde Analytics</span>
                </h1>
                <p className="text-white/80 text-sm mt-1">
                  {user?.name} • {overallStats.totalLeads} leads deze {dateRange === 'week' ? 'week' : dateRange === 'month' ? 'maand' : dateRange === 'quarter' ? 'kwartaal' : 'jaar'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {/* Date Range Selector */}
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value as any)}
                className="bg-white/20 text-white border border-white/30 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
              >
                <option value="week" className="bg-gray-800">Laatste week</option>
                <option value="month" className="bg-gray-800">Laatste maand</option<｜tool▁calls▁end｜>>
                <option value="quarter" className="bg-gray-800">Laatste kwartaal</option>
                <option value="year" className="bg-gray-800">Laatste jaar</option>
              </select>
              
              {/* Branch Selector */}
              <select
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value as Branch | 'all')}
                className="bg-white/20 text-white border border-white/30 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
              >
                <option value="all" className="bg-gray-800">Alle branches</option>
                {branchAnalytics.map(analytics => (
                  <option key={analytics.branch} value={analytics.branch} className="bg-gray-800">
                    {analytics.branch}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        
        {/* Overview Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                <CurrencyEuroIcon className="w-6 h-6 text-blue-400" />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-white">€{Math.round(overallStats.revenue / 1000)}K</div>
                <div className="text-xs text-white/60">Totale Omzet</div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <TrendingUpIcon className="w-4 h-4 text-green-400" />
              <span className="text-sm text-green-400">+12% deze {dateRange}</span>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                <UserGroupIcon className="w-6 h-6 text-purple-400" />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-white">{overallStats.totalLeads}</div>
                <div className="text-xs text-white/60">Nieuwe Leads</div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <ArrowUpIcon className="w-4 h-4 text-green-400" />
              <span className="text-sm text-green-400">+8% vs vorige periode</span>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                <CheckCircleIcon className="w-6 h-6 text-green-400" />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-white">{overallStats.conversionRate.toFixed(1)}%</div>
                <div className="text-xs text-white/60">Conversie Rate</div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <ArrowUpIcon className="w-4 h-4 text-green-400" />
              <span className="text-sm text-green-400">+2.3% vs doel</span>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center">
                <SparklesIcon className="w-6 h-6 text-orange-400" />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-white">€{Math.round(overallStats.avgLeadValue)}</div>
                <div className="text-xs text-white/60">Gem. Lead Waarde</div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <TrendingUpIcon className="w-4 h-4 text-green-400" />
              <span className="text-sm text-green-400">+5.1% verbetering</span>
            </div>
          </div>
        </motion.div>

        {/* Branch Analytics */}
        {branchAnalytics.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center space-x-2">
                <EyeIcon className="w-6 h-6 text-blue-400" />
                <span>Branch Prestatie Analyse</span>
              </h2>
              <div className="text-sm text-white/70">
                Gefilterd op: {selectedBranch === 'all' ? 'Alle branches' : selectedBranch}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {branchAnalytics
                .filter(analytics => selectedBranch === 'all' || analytics.branch === selectedBranch)
                .map((analytics, index) => (
                <motion.div
                  key={analytics.branch}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 hover:bg-white/20 transition-all"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-white text-lg flex items-center space-x-2">
                      {analytics.branch === 'Thuisbatterijen' && <span>🔋</span>}
                      {analytics.branch === 'Financial Lease' && <span>🚗</span>}
                      {analytics.branch === 'Warmtepompen' && <span>🔥</span>}
                      {analytics.branch === 'Zonnepanelen' && <span>☀️</span>}
                      <span>{analytics.branch}</span>
                    </h3>
                    <div className={`flex items-center space-x-1 text-xs px-2 py-1 rounded-full ${
                      analytics.trends.growth > 0 ? 'bg-green-100 text-green-800' : 
                      analytics.trends.growth < 0 ? 'bg-red-100 text-red-800' : 
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {analytics.trends.growth > 0 ? <ArrowUpIcon className="w-3 h-3" /> : 
                       analytics.trends.growth < 0 ? <ArrowDownIcon className="w-3 h-3" /> :
                       <ClockIcon className="w-3 h-3" />}
                      <span>{Math.abs(analytics.trends.growth)}%</span>
                    </div>
                  </div>

                  {/* Performance Chart Placeholder */}
                  <div className="bg-black/20 rounded-xl p-4 mb-4">
                    <div className="h-24 flex items-end justify-between space-x-2">
                      {[
                        { value: analytics.trends.periods[0]?.leads?.count || 0, label: 'W1' },
                        { value: analytics.trends.periods[1]?.leads?.count || 0, label: 'W2' },
                        { value: analytics.trends.periods[2]?.leads?.count || 0, label: 'W3' },
                        { value: analytics.totalLeads, label: 'W4' }
                      ].map((bar, i) => (
                        <div key={i} className="flex flex-col items-center space-y-2">
                          <div 
                            className={`w-6 rounded-t transition-all duration-500 ${
                              analytics.trends.growth > 0 ? 'bg-gradient-to-t from-green-400 to-green-600' :
                              analytics.trends.growth < 0 ? 'bg-gradient-to-t from-red-400 to-red-600' :
                              'bg-gradient-to-t from-blue-400 to-blue-600'
                            }`}
                            style={{ height: `${Math.max(20, (bar.value / Math.max(...[
                              analytics.trends.periods[0]?.leads?.count || 0,
                              analytics.trends.periods[1]?.leads?.count || 0,
                              analytics.trends.periods[2]?.leads?.count || 0,
                              analytics.totalLeads
                            ])) * 100)}px` }}
                          />
                          <span className="text-xs text-white/70">{bar.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-white/70 text-sm">Leads:</span>
                      <span className="font-bold text-white">{analytics.totalLeads}</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-white/70 text-sm">Conversie:</span>
                      <span className="font-bold text-purple-400">{analytics.conversionRate.toFixed(1)}%</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-white/70 text-sm">Omzet:</span>
                      <span className="font-bold text-green-400">€{Math.round(analytics.revenue / 1000)}K</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-white/70 text-sm">Gem. Waarde:</span>
                      <span className="font-bold text-blue-400">€{Math.round(analytics.avgLeadValue)}</span>
                    </div>

                    {/* Branch Tips */}
                    <div className="mt-4 p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                      <h4 className="text-sm font-medium text-blue-300 mb-2">💡 Branch Tip</h4>
                      <p className="text-xs text-blue-200">
                        {analytics.branch === 'Thuisbatterijen' && 'Focus op kopers met dynamische contracten voor betere conversie'}
                        {analytics.branch === 'Financial Lease' && 'Zorg voor snelle offerte productie voor hogere conversie rates'}
                        {analytics.branch === 'Warmtepompen' && 'Benadruk milieubaten voor grotere projecten'}
                        {analytics.branch === 'Zonnepanelen' && 'Gebruik zonnepotentieel data voor overtuigende argumenten'}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* AI Recommendations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl p-8 border border-purple-500/30"
        >
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center space-x-3">
            <SparklesIcon className="w-7 h-7 text-yellow-400" />
            <span>AI-Aanbevelingen</span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">🎯 Optimale Focus Branches</h3>
              <div className="space-y-3">
                {branchAnalytics
                  .sort((a, b) => b.conversionRate - a.conversionRate)
                  .slice(0, 2)
                  .map((analytics, index) => (
                    <div key={analytics.branch} className="flex items-center justify-between p-3 bg-white/10 rounded-lg">
                      <span className="text-white font-medium">{analytics.branch}</span>
                      <span className="text-green-400 font-bold">{analytics.conversionRate.toFixed(1)}% conversie</span>
                    </div>
                  ))}
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">📈 Groeikansen</h3>
              <div className="space-y-3">
                {branchAnalytics
                  .filter(a => a.trends.growth < 0)
                  .slice(0, 2)
                  .map((analytics, index) => (
                    <div key={analytics.branch} className="flex items-center justify-between p-3 bg-white/10 rounded-lg">
                      <span className="text-white font-medium">{analytics.branch}</span>
                      <span className="text-orange-400 font-bold">-{Math.abs(analytics.trends.growth)}% aandacht nodig</span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
