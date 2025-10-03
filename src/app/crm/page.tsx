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
      router.push('/');
      return;
    }
    
    loadCRMData();
  }, [isAuthenticated, user, authLoading, router]);

  // Load CRM data with Google Sheets sync
  const loadCRMData = async () => {
    setIsLoading(true);
    
    let customer: Customer | null = null;
    try {
      const response = await fetch('/api/customer-data');
      if (response.ok) {
        const data = await response.json();
        console.log('📡 CRM Dashboard: API response:', data);
        
        // Handle different response structures
        if (data.customers && Array.isArray(data.customers)) {
          customer = data.customers.find((c: any) => c.email === user?.email);
        } else if (data.customer) {
          customer = data.customer;
        } else if (data.success && data.customer) {
          customer = data.customer;
        } else {
          console.log('ℹ️ CRM Dashboard: Unexpected API response structure, falling back to localStorage.');
          const allCustomers = crmSystem.getAllCustomers();
          customer = allCustomers.find(c => c.email === user?.email) || null;
        }
        
        if (customer) {
          console.log('✅ CRM Dashboard: Customer data fetched from API.');
        } else {
          console.log('ℹ️ CRM Dashboard: Customer not found in API response, falling back to localStorage.');
          const allCustomers = crmSystem.getAllCustomers();
          customer = allCustomers.find(c => c.email === user?.email) || null;
        }
      } else {
        console.log('ℹ️ CRM Dashboard: API fetch failed, falling back to localStorage.');
        // Fallback to localStorage if API fails or no data
        const allCustomers = crmSystem.getAllCustomers();
        customer = allCustomers.find(c => c.email === user?.email) || null;
      }

      if (!customer) {
        console.log('ℹ️ CRM Dashboard: Customer not found in any source, creating fallback customer.');
        // Create a minimal fallback customer to prevent crashes
        customer = {
          id: user?.email || 'unknown',
          name: user?.name || 'Unknown User',
          email: user?.email || 'unknown@example.com',
          company: 'Unknown Company',
          phone: '',
          address: '',
          city: '',
          status: 'customer',
          googleSheetUrl: '',
          leadData: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          emailNotifications: {
            newLeads: true,
            weeklyReports: false
          }
        };
      }

      // 🔄 CRITICAL: Always sync with Google Sheets for fresh data
      if (customer.googleSheetUrl) {
        console.log('🔄 CRM Dashboard: Syncing with Google Sheets for fresh data...');
        try {
          const { readCustomerLeads } = await import('@/lib/googleSheetsAPI');
          const freshLeads = await readCustomerLeads(customer.googleSheetUrl);
          
          // Update customer with fresh leads
          customer.leadData = freshLeads;
          console.log(`✅ CRM Dashboard: Synced ${freshLeads.length} fresh leads from Google Sheets`);
          
          // Update blob storage with fresh data
          try {
            await fetch('/api/customer-data', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                customerId: customer.id,
                customerData: customer
              })
            });
            console.log('✅ CRM Dashboard: Updated blob storage with fresh data');
          } catch (blobError) {
            console.error('❌ CRM Dashboard: Failed to update blob storage:', blobError);
          }
        } catch (syncError) {
          console.error('❌ CRM Dashboard: Google Sheets sync failed:', syncError);
          // Continue with existing data if sync fails
        }
      }

      setCustomerData(customer);
      setLeads(customer.leadData || []);
      
      // Generate branch analytics
      if (customer.leadData && customer.leadData.length > 0) {
        const analytics = branchIntelligence.analyzeBranchPerformance(customer.leadData);
        setBranchAnalytics(analytics);
      }
      
      setIsLoading(false);
      console.log('✅ CRM Dashboard: Data loaded successfully');
    } catch (error) {
      console.error('❌ CRM Dashboard: Error loading data:', error);
      setIsLoading(false);
    }
  };

  // Calculate stats
  const stats = {
    total: leads.length,
    new: leads.filter(l => l.status === 'new').length,
    contacted: leads.filter(l => l.status === 'contacted').length,
    qualified: leads.filter(l => l.status === 'qualified').length,
    converted: leads.filter(l => l.status === 'converted').length,
    lost: leads.filter(l => l.status === 'lost').length,
    conversionRate: leads.length > 0 ? (leads.filter(l => l.status === 'converted').length / leads.length) * 100 : 0
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-xl">CRM Dashboard laden...</p>
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
            <div>
              <h1 className="text-3xl font-bold text-white">CRM Dashboard</h1>
              <p className="text-white/70 mt-2">Overzicht van je leads en prestaties</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/crm/leads')}
                className="bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-lg transition-colors flex items-center space-x-2"
              >
                <UserGroupIcon className="w-5 h-5" />
                <span>Mijn Leads</span>
              </button>
              <button
                onClick={() => router.push('/crm/analytics')}
                className="bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-lg transition-colors flex items-center space-x-2"
              >
                <ChartBarIcon className="w-5 h-5" />
                <span>Analytics</span>
              </button>
              <button
                onClick={() => router.push('/crm/settings')}
                className="bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-lg transition-colors flex items-center space-x-2"
              >
                <CogIcon className="w-5 h-5" />
                <span>Instellingen</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Stats Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
        >
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                <UserGroupIcon className="w-6 h-6 text-blue-400" />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-white">{stats.total}</div>
                <div className="text-xs text-white/60">Totaal Leads</div>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                <ArrowUpIcon className="w-6 h-6 text-green-400" />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-white">{stats.converted}</div>
                <div className="text-xs text-white/60">Geconverteerd</div>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                <ChartBarIcon className="w-6 h-6 text-purple-400" />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-white">{stats.conversionRate.toFixed(1)}%</div>
                <div className="text-xs text-white/60">Conversie Rate</div>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center">
                <ClockIcon className="w-6 h-6 text-orange-400" />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-white">{stats.new}</div>
                <div className="text-xs text-white/60">Nieuwe Leads</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Branch Analytics */}
        {branchAnalytics.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-8"
          >
            <h2 className="text-2xl font-bold text-white mb-6">Branch Prestaties</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {branchAnalytics.slice(0, 6).map((analytics, index) => (
                <motion.div
                  key={analytics.branch}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="bg-white/5 rounded-xl p-4 border border-white/10"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-white text-sm">
                      {analytics.branch === 'Thuisbatterijen' && '🔋'}
                      {analytics.branch === 'Financial Lease' && '🚗'}
                      {analytics.branch === 'Warmtepompen' && '🔥'}
                      {analytics.branch === 'Zonnepanelen' && '☀️'}
                      {analytics.branch === 'Airco' && '❄️'}
                      {' '}{analytics.branch}
                    </h3>
                    <span className="text-xs bg-white/20 px-2 py-1 rounded-full text-white">
                      {analytics.conversionRate.toFixed(1)}%
                    </span>
                  </div>
                  <div className="space-y-2 text-xs text-white/70">
                    <div className="flex justify-between">
                      <span>Leads:</span>
                      <span className="text-white">{analytics.totalLeads}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Omzet:</span>
                      <span className="text-white">€{Math.round(analytics.revenue)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Gem. waarde:</span>
                      <span className="text-white">€{Math.round(analytics.avgLeadValue)}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <button
            onClick={() => router.push('/crm/leads')}
            className="bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-2xl p-6 transition-all group"
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center group-hover:bg-blue-500/30 transition-colors">
                <UserGroupIcon className="w-6 h-6 text-blue-400" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-white">Leads Beheren</h3>
                <p className="text-sm text-white/70">Bekijk en beheer al je leads</p>
              </div>
              <ArrowRightIcon className="w-5 h-5 text-white/50 ml-auto" />
            </div>
          </button>

          <button
            onClick={() => router.push('/crm/analytics')}
            className="bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-2xl p-6 transition-all group"
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center group-hover:bg-purple-500/30 transition-colors">
                <ChartBarIcon className="w-6 h-6 text-purple-400" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-white">Analytics</h3>
                <p className="text-sm text-white/70">Diepgaande inzichten en rapporten</p>
              </div>
              <ArrowRightIcon className="w-5 h-5 text-white/50 ml-auto" />
            </div>
          </button>

          <button
            onClick={() => router.push('/crm/settings')}
            className="bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-2xl p-6 transition-all group"
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center group-hover:bg-orange-500/30 transition-colors">
                <CogIcon className="w-6 h-6 text-orange-400" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-white">Instellingen</h3>
                <p className="text-sm text-white/70">Configureer je CRM voorkeuren</p>
              </div>
              <ArrowRightIcon className="w-5 h-5 text-white/50 ml-auto" />
            </div>
          </button>
        </motion.div>
      </div>
    </div>
  );
}