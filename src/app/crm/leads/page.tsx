'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  ArrowLeftIcon,
  PlusIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  UserIcon,
  PhoneIcon,
  EnvelopeIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { useAuthStore } from '@/lib/auth';
import { crmSystem, type Customer, type Lead } from '@/lib/crmSystem';
import { branchIntelligence, type Branch } from '@/lib/branchIntelligence';

export default function CRMLeadsPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuthStore();
  
  // State
  const [customerData, setCustomerData] = useState<Customer | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | Lead['status']>('all');
  const [filterBranch, setFilterBranch] = useState<'all' | Branch>('all');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [leadsPerPage, setLeadsPerPage] = useState(10);

  // Auth check
  useEffect(() => {
    if (authLoading) return;
    
    if (!isAuthenticated || !user?.email) {
      window.location.href = '/';
      return;
    }
    
    loadCustomerData();
  }, [isAuthenticated, user, authLoading]);

  const loadCustomerData = async () => {
    try {
      const customer = crmSystem.getCustomerByEmail(user?.email!);
      if (!customer) {
        console.error('No customer found');
        setIsLoading(false);
        return;
      }

      setCustomerData(customer);
      setLeads(customer.leadData || []);
      
      console.log(`✅ Loaded ${customer.leadData?.length || 0} leads for CRM`);
    } catch (error) {
      console.error('Error loading customer data:', error);
    }
    
    setIsLoading(false);
  };

  // Filtered leads with branch intelligence
  const { filteredLeads, totalPages, paginatedLeads } = useMemo(() => {
    const filtered = leads.filter(lead => {
      const matchesSearch = lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           lead.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           lead.interest.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = filterStatus === 'all' || lead.status === filterStatus;
      
      const matchesBranch = filterBranch === 'all' || (() => {
        const intelligence = branchIntelligence.detectBranch(lead);
        return intelligence.detectedBranch === filterBranch;
      })();
      
      return matchesSearch && matchesStatus && matchesBranch;
    });

    const sorted = filtered.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return dateB - dateA;
    });

    const total = Math.ceil(sorted.length / leadsPerPage);
    const startIndex = (currentPage - 1) * leadsPerPage;
    const endIndex = startIndex + leadsPerPage;
    const paginated = sorted.slice(startIndex, endIndex);

    return {
      filteredLeads: sorted,
      totalPages: total,
      paginatedLeads: paginated
    };
  }, [leads, searchTerm, filterStatus, filterBranch, currentPage, leadsPerPage]);

  const getStatusColor = (status: Lead['status']) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800';
      case 'contacted': return 'bg-yellow-100 text-yellow-800';
      case 'qualified': return 'bg-purple-100 text-purple-800';
      case 'converted': return 'bg-green-100 text-green-800';
      case 'lost': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
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
                onClick={() => router.push('/crm')}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <ArrowLeftIcon className="w-6 h-6 text-white" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-white">📊 CRM Leads Management</h1>
                <p className="text-white/80 text-sm">Manage leads with AI-powered branch detection</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={() => router.push('/crm/analytics')}
                className="bg-purple-600/80 hover:bg-purple-600 text-white px-4 py-2 rounded-xl transition-colors flex items-center space-x-2"
              >
                <ChartBarIcon className="w-5 h-5" />
                <span>Analytics</span>
              </button>
              
              <button
                className="bg-green-600/80 hover:bg-green-600 text-white px-4 py-2 rounded-xl transition-colors flex items-center space-x-2"
              >
                <PlusIcon className="w-5 h-5" />
                <span>Add Lead</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        
        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-8"
        >
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Zoek leads op naam, email, bedrijf of interesse..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white/90"
              />
            </div>
            
            {/* Status Filter */}
            <div className="relative">
              <FunnelIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none z-10" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white/90 appearance-none cursor-pointer"
              >
                <option value="all">Alle statussen</option>
                <option value="new">🆕 Nieuw</option>
                <option value="contacted">📞 Gecontacteerd</option>
                <option value="qualified">⭐ Gekwalificeerd</option>
                <option value="converted">✅ Geconverteerd</option>
                <option value="lost">❌ Verloren</option>
              </select>
              <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>

            {/* Branch Filter */}
            <div className="relative">
              <ChartBarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none z-10" />
              <select
                value={filterBranch}
                onChange={(e) => setFilterBranch(e.target.value as any)}
                className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white/90 appearance-none cursor-pointer"
              >
                <option value="all">Alle branches</option>
                <option value="Thuisbatterijen">🔋 Thuisbatterijen</option>
                <option value="Financial Lease">🚗 Financial Lease</option>
                <option value="Warmtepompen">🔥 Warmtepompen</option>
                <option value="Zonnepanelen">☀️ Zonnepanelen</option>
                <option value="Airco">❄️ Airco</option>
                <option value="Custom">🎯 Multi-Branch</option>
                <option value="Unknown">❓ Overige</option>
              </select>
              <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </motion.div>

        {/* Leads Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {paginatedLeads.length === 0 ? (
            <div className="col-span-full text-center py-16">
              <UserIcon className="w-16 h-16 text-white/40 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Geen leads gevonden</h3>
              <p className="text-white/70 mb-6">
                {searchTerm || filterStatus !== 'all' || filterBranch !== 'all' 
                  ? 'Pas je filters aan of zoek andere termen.'
                  : 'Je leads verschijnen hier na aankoop en Google Sheets koppeling.'
                }
              </p>
              <button
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
              >
                ➕ Voeg uw eerste lead toe
              </button>
            </div>
          ) : (
            paginatedLeads.map((lead) => (
              <motion.div
                key={lead.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 hover:bg-white/20 transition-all"
              >
                {/* Lead Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
                      <span className="text-white font-bold text-lg">
                        {lead.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-lg">{lead.name}</h3>
                      <p className="text-white/70 text-sm">{lead.email}</p>
                      {lead.company && (
                        <p className="text-white/60 text-xs">{lead.company}</p>
                      )}
                    </div>
                  </div>
                  
                  {/* Status Badge */}
                  <select
                    className={`px-3 py-1 rounded-full text-xs font-semibold border-0 ${getStatusColor(lead.status)} cursor-pointer`}
                  >
                    <option value="new">🆕 Nieuw</option>
                    <option value="contacted">📞 Contact</option>
                    <option value="qualified">⭐ Kwalif</option>
                    <option value="converted">✅ Gesloten</option>
                    <option value="lost">❌ Verloren</option>
                  </select>
                </div>

                {/* 🧠 AI Branch Detection */}
                {(() => {
              const intelligence = branchIntelligence.detectBranch(lead);
              const branchIcon = intelligence.detectedBranch === 'Thuisbatterijen' ? '🔋' :
                               intelligence.detectedBranch === 'Financial Lease' ? '🚗' :
                               intelligence.detectedBranch === 'Warmtepompen' ? '🔥' :
                               intelligence.detectedBranch === 'Zonnepanelen' ? '☀️' :
                               intelligence.detectedBranch === 'Airco' ? '❄️' :
                               intelligence.detectedBranch === 'Custom' ? '🎯' : '❓';
              
              return (
                <div className="mb-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    intelligence.detectedBranch === 'Thuisbatterijen' ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30' :
                    intelligence.detectedBranch === 'Financial Lease' ? 'bg-green-500/20 text-green-300 border border-green-500/30' :
                    intelligence.detectedBranch === 'Warmtepompen' ? 'bg-red-500/20 text-red-300 border border-red-500/30' :
                    intelligence.detectedBranch === 'Zonnepanelen' ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30' :
                    intelligence.detectedBranch === 'Airco' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
                    'bg-gray-500/20 text-gray-300 border border-gray-500/30'
                  }`}>
                    {branchIcon} {intelligence.detectedBranch} ({intelligence.confidence}%)
                  </span>
                </div>
              );
            })()}

                {/* Lead Details */}
                <div className="space-y-3 mb-4">
                  {lead.phone && (
                    <div className="flex items-center space-x-2">
                      <PhoneIcon className="w-4 h-4 text-white/60" />
                      <a href={`tel:${lead.phone}`} className="text-white hover:text-purple-300 transition-colors">
                        {lead.phone}
                      </a>
                    </div>
                  )}
                  
                  <div className="flex items-center space-x-2">
                    <EnvelopeIcon className="w-4 h-4 text-white/60" />
                    <span className="text-white/80 text-sm">{lead.email}</span>
                  </div>
                  
                  {lead.interest && (
                    <div className="bg-white/5 rounded-lg p-3">
                      <div className="text-white/70 text-xs mb-1">Interesse:</div>
                      <div className="text-white text-sm font-medium">{lead.interest}</div>
                    </div>
                  )}
                  
                  {lead.budget && (
                    <div className="bg-white/5 rounded-lg p-3">
                      <div className="text-white/70 text-xs mb-1">Budget:</span>
                      <div className="text-white text-sm font-medium">{lead.budget}</span>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-2">
                  <a
                    href={`tel:${lead.phone}`}
                    className="flex-1 bg-green-600/80 hover:bg-green-600 text-white px-3 py-2 rounded-lg text-center text-sm font-medium transition-colors"
                  >
                    📞 Bellen
                  </a>
                  <a
                    href={`mailto:${lead.email}`}
                    className="flex-1 bg-blue-600/80 hover:bg-blue-600 text-white px-3 py-2 rounded-lg text-center text-sm font-medium transition-colors"
                  >
                    📧 E-mail
                  </a>
                  <button
                    className="flex-1 bg-purple-600/80 hover:bg-purple-600 text-white px-3 py-2 rounded-lg text-center text-sm font-medium transition-colors"
                  >
                    ✏️ Bewerk
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </motion.div>

      </div>
    </div>
  );
}
