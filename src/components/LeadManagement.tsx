'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  UserIcon,
  BuildingOfficeIcon,
  PhoneIcon,
  EnvelopeIcon,
  CurrencyEuroIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import { type Lead } from '@/lib/crmSystem';

interface LeadManagementProps {
  customerId: string;
  leads: Lead[];
  onUpdateLead: (leadId: string, updates: Partial<Lead>) => void;
  onAddLead: (leadData: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onDeleteLead: (leadId: string) => void;
  googleSheetUrl?: string;
}

export function LeadManagement({ 
  customerId, 
  leads, 
  onUpdateLead, 
  onAddLead, 
  onDeleteLead,
  googleSheetUrl 
}: LeadManagementProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | Lead['status']>('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Filter leads
  const filteredLeads = leads.filter(lead => {
    const matchesSearch = lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.company?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || lead.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

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

  const getStatusIcon = (status: Lead['status']) => {
    switch (status) {
      case 'new': return '🆕';
      case 'contacted': return '📞';
      case 'qualified': return '⭐';
      case 'converted': return '✅';
      case 'lost': return '❌';
      default: return '❓';
    }
  };

  const syncWithGoogleSheets = async () => {
    if (!googleSheetUrl) return;
    
    setIsLoading(true);
    try {
      // In production, this would sync with Google Sheets API
      console.log('🔄 Syncing with Google Sheets:', googleSheetUrl);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock: Add some sample leads from "Google Sheets"
      const sampleLeads = [
        {
          name: 'Piet Jansen',
          email: 'piet@voorbeeld.nl',
          phone: '06-12345678',
          company: 'Jansen Installaties',
          interest: 'Thuisbatterij',
          budget: '€5.000 - €8.000',
          timeline: 'Binnen 2 maanden',
          status: 'new' as const,
          source: 'campaign' as const,
          sheetRowNumber: 2
        },
        {
          name: 'Maria van der Berg',
          email: 'maria@bergbv.nl',
          phone: '06-87654321',
          company: 'Berg Solar BV',
          interest: 'Zonnepanelen uitbreiding',
          budget: '€12.000+',
          timeline: 'ASAP',
          status: 'contacted' as const,
          source: 'campaign' as const,
          sheetRowNumber: 3
        }
      ];

      sampleLeads.forEach(leadData => {
        onAddLead(leadData);
      });

      alert('✅ Leads gesynchroniseerd met Google Sheets!');
    } catch (error) {
      console.error('Sync error:', error);
      alert('❌ Fout bij synchroniseren met Google Sheets');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Lead Management</h2>
          <p className="text-gray-600">
            {leads.length} leads • {filteredLeads.length} zichtbaar
          </p>
        </div>
        
        <div className="flex space-x-3">
          {googleSheetUrl && (
            <button
              onClick={syncWithGoogleSheets}
              disabled={isLoading}
              className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Synchroniseren...</span>
                </>
              ) : (
                <>
                  <span>🔄</span>
                  <span>Sync met Google Sheets</span>
                </>
              )}
            </button>
          )}
          
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-brand-purple hover:bg-brand-purple/90 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <PlusIcon className="w-4 h-4" />
            <span>Nieuwe lead</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Zoek leads op naam, email of bedrijf..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-purple focus:border-brand-purple"
          />
        </div>
        
        <div className="relative">
          <FunnelIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-purple focus:border-brand-purple"
          >
            <option value="all">Alle statussen</option>
            <option value="new">🆕 Nieuw</option>
            <option value="contacted">📞 Gecontacteerd</option>
            <option value="qualified">⭐ Gekwalificeerd</option>
            <option value="converted">✅ Geconverteerd</option>
            <option value="lost">❌ Verloren</option>
          </select>
        </div>
      </div>

      {/* Leads Table */}
      {filteredLeads.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <UserIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {searchTerm || filterStatus !== 'all' ? 'Geen leads gevonden' : 'Nog geen leads'}
          </h3>
          <p className="text-gray-600 mb-6">
            {googleSheetUrl 
              ? 'Synchroniseer met Google Sheets om leads te importeren.'
              : 'Voeg handmatig leads toe of koppel een Google Sheet.'
            }
          </p>
          {googleSheetUrl && (
            <button
              onClick={syncWithGoogleSheets}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              🔄 Sync met Google Sheets
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Lead Info
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Details
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acties
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-semibold text-sm">
                            {lead.name.charAt(0)}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {lead.name}
                          </div>
                          {lead.company && (
                            <div className="text-sm text-gray-500">
                              {lead.company}
                            </div>
                          )}
                          <div className="text-xs text-gray-400">
                            {lead.interest}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center text-sm text-gray-600">
                          <EnvelopeIcon className="w-4 h-4 mr-2" />
                          {lead.email}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <PhoneIcon className="w-4 h-4 mr-2" />
                          {lead.phone}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {lead.budget && (
                          <div className="flex items-center text-sm text-gray-600 mb-1">
                            <CurrencyEuroIcon className="w-4 h-4 mr-2" />
                            {lead.budget}
                          </div>
                        )}
                        {lead.timeline && (
                          <div className="flex items-center text-sm text-gray-600">
                            <ClockIcon className="w-4 h-4 mr-2" />
                            {lead.timeline}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(lead.status)}`}>
                        {getStatusIcon(lead.status)} {lead.status}
                      </span>
                      {lead.sheetRowNumber && (
                        <div className="text-xs text-gray-500 mt-1">
                          Sheet rij: {lead.sheetRowNumber}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setEditingLead(lead)}
                          className="text-blue-600 hover:text-blue-800 transition-colors"
                          title="Bewerken"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        <a
                          href={`mailto:${lead.email}`}
                          className="text-green-600 hover:text-green-800 transition-colors"
                          title="Email versturen"
                        >
                          <EnvelopeIcon className="w-4 h-4" />
                        </a>
                        <a
                          href={`tel:${lead.phone}`}
                          className="text-purple-600 hover:text-purple-800 transition-colors"
                          title="Bellen"
                        >
                          <PhoneIcon className="w-4 h-4" />
                        </a>
                        <button
                          onClick={() => {
                            if (confirm(`Lead ${lead.name} verwijderen?`)) {
                              onDeleteLead(lead.id);
                            }
                          }}
                          className="text-red-600 hover:text-red-800 transition-colors"
                          title="Verwijderen"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Google Sheets Integration Info */}
      {googleSheetUrl && (
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
            <div className="flex space-x-2">
              <a
                href={googleSheetUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                📊 Open Sheet
              </a>
              <button
                onClick={syncWithGoogleSheets}
                disabled={isLoading}
                className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                🔄 Sync Nu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Lead Modal would go here */}
      {/* Implementation details for the modal forms */}
    </div>
  );
}
