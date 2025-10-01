'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  UserIcon,
  DocumentTextIcon,
  ChartBarIcon,
  CogIcon,
  EyeIcon,
  PencilIcon,
  ArrowDownTrayIcon,
  ArrowTopRightOnSquareIcon
} from '@heroicons/react/24/outline';
import { useAuthStore } from '@/lib/auth';
import { type Lead } from '@/lib/crmSystem';
import { crmSystem } from '@/lib/crmSystem';

export default function CustomerPortalPage() {
  const { user, isAuthenticated } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'leads' | 'orders' | 'settings'>('dashboard');
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      window.location.href = '/login';
      return;
    }

    loadCustomerData();
  }, [isAuthenticated, user]);

  const loadCustomerData = async () => {
    try {
      if (!user?.email) return;

      // Get customer from CRM
      const customers = crmSystem.getAllCustomers();
      const customer = customers.find(c => c.email === user.email);
      
      if (customer && customer.googleSheetId) {
        // Load leads from Google Sheets
        const customerLeads = customer.leadData || [];
        setLeads(customerLeads);
      }
    } catch (error) {
      console.error('Error loading customer data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateLead = async (leadId: string, updates: Partial<Lead>) => {
    try {
      if (!user?.email) return;

      const customers = crmSystem.getAllCustomers();
      const customer = customers.find(c => c.email === user.email);
      
      if (customer) {
        const success = crmSystem.updateCustomerLead(customer.id, leadId, updates);
        if (success) {
          // Update local state
          setLeads(prev => prev.map(lead => 
            lead.id === leadId ? { ...lead, ...updates } : lead
          ));
          setEditingLead(null);
          alert('✅ Lead bijgewerkt!');
        } else {
          alert('❌ Fout bij bijwerken lead');
        }
      }
    } catch (error) {
      console.error('Error updating lead:', error);
      alert('❌ Fout bij bijwerken lead');
    }
  };

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Toegang vereist</h2>
          <p className="text-gray-600 mb-6">Log in om uw klantomgeving te bekijken.</p>
          <a href="/login" className="bg-brand-purple text-white px-6 py-3 rounded-lg hover:bg-brand-purple/90 transition-colors">
            Inloggen
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Klantomgeving</h1>
              <p className="text-gray-600">Welkom terug, {user.name || user.email}</p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">{user.company}</span>
              <div className="w-10 h-10 bg-gradient-to-r from-brand-purple to-brand-pink rounded-full flex items-center justify-center">
                <span className="text-white font-semibold">
                  {user.name?.charAt(0) || user.email.charAt(0).toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: ChartBarIcon },
              { id: 'leads', label: `Mijn Leads (${leads.length})`, icon: DocumentTextIcon },
              { id: 'orders', label: 'Bestellingen', icon: DocumentTextIcon },
              { id: 'settings', label: 'Instellingen', icon: CogIcon }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-2 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'border-brand-purple text-brand-purple'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Totaal Leads</p>
                    <p className="text-3xl font-bold text-gray-900">{leads.length}</p>
                  </div>
                  <DocumentTextIcon className="w-8 h-8 text-blue-600" />
                </div>
              </div>
              
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Nieuwe Leads</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {leads.filter(l => l.status === 'new').length}
                    </p>
                  </div>
                  <DocumentTextIcon className="w-8 h-8 text-green-600" />
                </div>
              </div>
              
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Conversies</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {leads.filter(l => l.status === 'converted').length}
                    </p>
                  </div>
                  <ChartBarIcon className="w-8 h-8 text-purple-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Recente Activiteit</h2>
              <div className="space-y-3">
                {leads.slice(0, 5).map((lead) => (
                  <div key={lead.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium">{lead.name}</div>
                      <div className="text-sm text-gray-600">{lead.interest}</div>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      lead.status === 'new' ? 'bg-blue-100 text-blue-800' :
                      lead.status === 'contacted' ? 'bg-yellow-100 text-yellow-800' :
                      lead.status === 'qualified' ? 'bg-green-100 text-green-800' :
                      lead.status === 'converted' ? 'bg-purple-100 text-purple-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {lead.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'leads' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Mijn Leads</h2>
              <div className="flex space-x-3">
                <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2">
                  <ArrowDownTrayIcon className="w-4 h-4" />
                  <span>Export CSV</span>
                </button>
                <a 
                  href={crmSystem.getAllCustomers().find(c => c.email === user.email)?.googleSheetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
                >
                  <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                  <span>Open Google Sheet</span>
                </a>
              </div>
            </div>

            {isLoading ? (
              <div className="text-center py-12">
                <div className="w-8 h-8 border-4 border-brand-purple/30 border-t-brand-purple rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600">Leads laden...</p>
              </div>
            ) : leads.length === 0 ? (
              <div className="text-center py-12">
                <DocumentTextIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Nog geen leads</h3>
                <p className="text-gray-600">Uw leads verschijnen hier zodra ze worden geleverd.</p>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Lead</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Details</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acties</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {leads.map((lead) => (
                        <tr key={lead.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div>
                              <div className="font-medium text-gray-900">{lead.name}</div>
                              <div className="text-sm text-gray-500">{lead.interest}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm">
                              <div>{lead.email}</div>
                              <div className="text-gray-500">{lead.phone}</div>
                              {lead.address && <div className="text-gray-400 text-xs">{lead.address}</div>}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm">
                              <div><strong>Budget:</strong> {lead.budget || 'Niet opgegeven'}</div>
                              <div><strong>Timeline:</strong> {lead.timeline || 'Niet opgegeven'}</div>
                              <div className="text-xs text-gray-500">
                                {new Date(lead.createdAt).toLocaleDateString('nl-NL')}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              lead.status === 'new' ? 'bg-blue-100 text-blue-800' :
                              lead.status === 'contacted' ? 'bg-yellow-100 text-yellow-800' :
                              lead.status === 'qualified' ? 'bg-green-100 text-green-800' :
                              lead.status === 'converted' ? 'bg-purple-100 text-purple-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {lead.status === 'new' ? '🆕 Nieuw' :
                               lead.status === 'contacted' ? '📞 Benaderd' :
                               lead.status === 'qualified' ? '✅ Gekwalificeerd' :
                               lead.status === 'converted' ? '🎯 Geconverteerd' : '❌ Verloren'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => setEditingLead(lead)}
                                className="text-brand-purple hover:text-brand-pink transition-colors"
                                title="Bewerk lead"
                              >
                                <PencilIcon className="w-4 h-4" />
                              </button>
                              <a
                                href={`mailto:${lead.email}`}
                                className="text-blue-600 hover:text-blue-800 transition-colors"
                                title="Email lead"
                              >
                                📧
                              </a>
                              <a
                                href={`tel:${lead.phone}`}
                                className="text-green-600 hover:text-green-800 transition-colors"
                                title="Bel lead"
                              >
                                📞
                              </a>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Mijn Bestellingen</h2>
            <p className="text-gray-600">Uw bestellingsgeschiedenis en actieve lead pakketten.</p>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Account Instellingen</h2>
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Profiel Informatie</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Naam</label>
                    <input type="text" value={user.name || ''} className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Bedrijf</label>
                    <input type="text" value={user.company || ''} className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2" />
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Lead Voorkeuren</h3>
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" defaultChecked />
                    <span className="text-sm">Email notificaties voor nieuwe leads</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" defaultChecked />
                    <span className="text-sm">SMS notificaties voor urgente leads</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Edit Lead Modal */}
      {editingLead && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Lead Bewerken</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <select 
                  value={editingLead.status}
                  onChange={(e) => setEditingLead({...editingLead, status: e.target.value as Lead['status']})}
                  className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2"
                >
                  <option value="new">🆕 Nieuw</option>
                  <option value="contacted">📞 Benaderd</option>
                  <option value="qualified">✅ Gekwalificeerd</option>
                  <option value="converted">🎯 Geconverteerd</option>
                  <option value="lost">❌ Verloren</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Notities</label>
                <textarea
                  value={editingLead.notes || ''}
                  onChange={(e) => setEditingLead({...editingLead, notes: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 h-24"
                  placeholder="Voeg notities toe..."
                />
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => setEditingLead(null)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Annuleren
                </button>
                <button
                  onClick={() => handleUpdateLead(editingLead.id, {
                    status: editingLead.status,
                    notes: editingLead.notes
                  })}
                  className="flex-1 px-4 py-2 bg-brand-purple text-white rounded-lg hover:bg-brand-purple/90"
                >
                  Opslaan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
