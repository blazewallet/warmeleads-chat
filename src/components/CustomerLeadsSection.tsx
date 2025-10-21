'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { type Lead, type Customer } from '@/lib/crmSystem';
import { 
  ChartBarIcon,
  UserGroupIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { getStatusColor, getStatusLabel } from '@/lib/revenueCalculator';

interface LeadRowProps {
  lead: Lead;
  onUpdateLead: (leadId: string, updates: Partial<Lead>) => void;
}

function LeadRow({ lead, onUpdateLead }: LeadRowProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editStatus, setEditStatus] = useState(lead.status);
  const [editDealValue, setEditDealValue] = useState(lead.dealValue?.toString() || '');

  const handleSave = () => {
    const updates: Partial<Lead> = {
      status: editStatus,
      dealValue: editDealValue ? parseFloat(editDealValue) : undefined,
      updatedAt: new Date()
    };
    onUpdateLead(lead.id, updates);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditStatus(lead.status);
    setEditDealValue(lead.dealValue?.toString() || '');
    setIsEditing(false);
  };

  return (
    <tr className="border-b border-gray-100 hover:bg-gray-50">
      <td className="py-3 px-4">
        <div className="font-medium text-gray-900">{lead.name}</div>
        <div className="text-sm text-gray-500">{lead.interest}</div>
      </td>
      <td className="py-3 px-4 text-sm text-gray-600">{lead.email}</td>
      <td className="py-3 px-4">
        {isEditing ? (
          <select
            value={editStatus}
            onChange={(e) => setEditStatus(e.target.value as Lead['status'])}
            className="text-sm border border-gray-300 rounded px-2 py-1"
          >
            <option value="new">Nieuw</option>
            <option value="contacted">Gecontacteerd</option>
            <option value="qualified">Gekwalificeerd</option>
            <option value="proposal">Voorstel</option>
            <option value="negotiation">Onderhandeling</option>
            <option value="converted">Geconverteerd</option>
            <option value="deal_closed">Deal gesloten</option>
            <option value="lost">Verloren</option>
          </select>
        ) : (
          <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(lead.status)}`}>
            {getStatusLabel(lead.status)}
          </span>
        )}
      </td>
      <td className="py-3 px-4">
        {isEditing ? (
          <input
            type="number"
            value={editDealValue}
            onChange={(e) => setEditDealValue(e.target.value)}
            placeholder="€0"
            className="text-sm border border-gray-300 rounded px-2 py-1 w-24"
          />
        ) : (
          <span className="text-sm text-gray-600">
            {lead.dealValue ? `€${lead.dealValue.toLocaleString()}` : '-'}
          </span>
        )}
      </td>
      <td className="py-3 px-4">
        {isEditing ? (
          <div className="flex space-x-2">
            <button
              onClick={handleSave}
              className="text-green-600 hover:text-green-800"
            >
              <CheckIcon className="w-4 h-4" />
            </button>
            <button
              onClick={handleCancel}
              className="text-red-600 hover:text-red-800"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setIsEditing(true)}
            className="text-gray-400 hover:text-gray-600"
          >
            <PencilIcon className="w-4 h-4" />
          </button>
        )}
      </td>
    </tr>
  );
}

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
  
  // Calculate lead statistics - include both converted and deal_closed
  const stats = {
    total: leads.length,
    new: leads.filter(l => l.status === 'new').length,
    contacted: leads.filter(l => l.status === 'contacted').length,
    qualified: leads.filter(l => l.status === 'qualified').length,
    // Converted includes both 'converted' and 'deal_closed' statuses
    converted: leads.filter(l => l.status === 'converted' || l.status === 'deal_closed').length,
    deal_closed: leads.filter(l => l.status === 'deal_closed').length,
    lost: leads.filter(l => l.status === 'lost').length,
    // Conversion rate based on both converted and deal_closed
    conversionRate: leads.length > 0 ? (leads.filter(l => l.status === 'converted' || l.status === 'deal_closed').length / leads.length * 100) : 0
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
              <p className="text-sm font-medium text-gray-600">Gesloten deals</p>
              <p className="text-2xl font-bold text-green-600">{stats.deal_closed}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="text-xl">💰</span>
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
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Naam</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Email</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Deal Waarde</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Acties</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((lead) => (
                  <LeadRow 
                    key={lead.id} 
                    lead={lead} 
                    onUpdateLead={onUpdateLead}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}