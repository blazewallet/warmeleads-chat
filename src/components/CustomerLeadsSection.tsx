'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { type Lead, type Customer } from '@/lib/crmSystem';
import { 
  ChartBarIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';

interface CustomerLeadsSectionProps {
  customer: Customer;
  onUpdateLead: (leadId: string, updates: Partial<Lead>) => void;
  onAddLead: (leadData: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onDeleteLead: (leadId: string) => void;
}

export function CustomerLeadsSection({ 
  customer, 
  onUpdateLead, 
  onAddLead, 
  onDeleteLead 
}: CustomerLeadsSectionProps) {
  const leads = customer.leadData || [];
  
  // Calculate lead statistics
  const stats = {
    total: leads.length,
    new: leads.filter(l => l.status === 'new').length,
    contacted: leads.filter(l => l.status === 'contacted').length,
    qualified: leads.filter(l => l.status === 'qualified').length,
    converted: leads.filter(l => l.status === 'converted').length,
    lost: leads.filter(l => l.status === 'lost').length,
    conversionRate: leads.length > 0 ? (leads.filter(l => l.status === 'converted').length / leads.length * 100) : 0
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-brand-purple to-brand-pink rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">Uw Leads</h1>
            <p className="text-white/80">
              Beheer uw leads en synchroniseer met Google Sheets
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{stats.total}</div>
            <div className="text-white/80 text-sm">Totaal leads</div>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Nieuwe Leads</p>
              <p className="text-2xl font-bold text-blue-600">{stats.new}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-xl">🆕</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Gecontacteerd</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.contacted}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <span className="text-xl">📞</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Geconverteerd</p>
              <p className="text-2xl font-bold text-green-600">{stats.converted}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="text-xl">✅</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Conversie Rate</p>
              <p className="text-2xl font-bold text-purple-600">{stats.conversionRate.toFixed(1)}%</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <ChartBarIcon className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Google Sheets Integration Info */}
      {!customer.googleSheetId ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-blue-50 border border-blue-200 rounded-xl p-6"
        >
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-2xl">📊</span>
            </div>
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">
                Google Sheets Integratie
              </h3>
              <p className="text-blue-800 mb-4">
                Koppel uw Google Sheets voor automatische lead synchronisatie. 
                Wijzigingen in uw account worden automatisch bijgewerkt in uw spreadsheet en vice versa.
              </p>
              <div className="space-y-2 text-sm text-blue-700">
                <div>✅ Bidirectionele synchronisatie</div>
                <div>✅ Realtime updates</div>
                <div>✅ Automatische backup in Google Drive</div>
                <div>✅ Toegang voor uw team</div>
              </div>
              <div className="mt-4">
                <p className="text-blue-600 text-sm font-medium">
                  Neem contact op met onze support om Google Sheets te koppelen.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      ) : (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <span>📊</span>
              </div>
              <div>
                <h3 className="font-semibold text-green-800">Google Sheets Gekoppeld</h3>
                <p className="text-green-700 text-sm">
                  Wijzigingen worden automatisch gesynchroniseerd
                </p>
              </div>
            </div>
            <a
              href={customer.googleSheetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              📊 Open Sheet
            </a>
          </div>
        </div>
      )}

      {/* Leads Table Placeholder */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h3 className="font-semibold text-gray-900 mb-4">Lead Overzicht</h3>
        {leads.length === 0 ? (
          <div className="text-center py-8">
            <UserGroupIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Nog geen leads beschikbaar</p>
            <p className="text-gray-400 text-sm mt-2">
              Leads verschijnen hier na aankoop en Google Sheets koppeling
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {leads.map((lead) => (
              <div key={lead.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium text-gray-900">{lead.name}</div>
                    <div className="text-sm text-gray-600">{lead.email}</div>
                    <div className="text-sm text-gray-500">{lead.interest}</div>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    lead.status === 'new' ? 'bg-blue-100 text-blue-800' :
                    lead.status === 'contacted' ? 'bg-yellow-100 text-yellow-800' :
                    lead.status === 'qualified' ? 'bg-purple-100 text-purple-800' :
                    lead.status === 'converted' ? 'bg-green-100 text-green-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {lead.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}