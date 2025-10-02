'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  ArrowLeftIcon,
  Cog6ToothIcon,
  ChartBarIcon,
  BellIcon,
  LinkIcon,
  KeyIcon,
  ShieldCheckIcon,
  AdjustmentsHorizontalIcon,
  TrashIcon,
  DocumentArrowDownIcon,
  DocumentArrowUpIcon
} from '@heroicons/react/24/outline';
import { useAuthStore } from '@/lib/auth';
import { crmSystem, type Customer } from '@/lib/crmSystem';

export default function CRMSettingsPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuthStore();
  const [customerData, setCustomerData] = useState<Customer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Settings states
  const [googleSheetUrl, setGoogleSheetUrl] = useState('');
  const [emailNotifications, setEmailNotifications] = useState({
    newLeads: true,
    statusUpdates: true,
    weeklyReports: false
  });
  const [branchSettings, setBranchSettings] = useState({
    autoDetection: true,
    confidenceThreshold: 0.7,
    customBranches: [] as string[]
  });

  // Load customer data
  const loadCRMData = async () => {
    try {
      setIsLoading(true);
      
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
          console.log('✅ Customer data loaded from API');
        }
      } catch (error) {
        console.log('⚠️ API fetch failed, falling back to localStorage');
      }

      if (!customer && user?.email) {
        const allCustomers = crmSystem.getAllCustomers();
        customer = allCustomers.find(cust => cust.email === user.email) || null;
      }

      if (customer) {
        setCustomerData(customer);
        setGoogleSheetUrl(customer.googleSheetUrl || '');
        
        if (customer.emailNotifications) {
          setEmailNotifications({
            newLeads: customer.emailNotifications.newLeads ?? true,
            statusUpdates: customer.emailNotifications.statusUpdates ?? true,
            weeklyReports: customer.emailNotifications.weeklyReports ?? false
          });
        }
      }
      
    } catch (error) {
      console.error('❌ Error loading customer data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && isAuthenticated && user) {
      loadCRMData();
    }
  }, [authLoading, isAuthenticated, user]);

  // Save Google Sheet URL
  const handleSaveGoogleSheetUrl = async () => {
    if (!customerData || !googleSheetUrl.trim()) return;

    try {
      const response = await fetch('/api/customer-sheets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerId: customerData.id,
          googleSheetUrl
        }),
      });

      if (response.ok) {
        // Update local state
        setCustomerData(prev => prev ? { ...prev, googleSheetUrl } : null);
        console.log('✅ Google Sheet URL saved successfully');
        
        // Show success feedback (optional)
        alert('Google Sheet URL succesvol opgeslagen!');
      } else {
        console.error('❌ Failed to save Google Sheet URL');
        alert('Er is een fout opgetreden bij het opslaan van de URL.');
      }
    } catch (error) {
      console.error('❌ Error saving Google Sheet URL:', error);
      alert('Er is een netwerkfout opgetreden.');
    }
  };

  // Save email notification settings
  const handleSaveEmailSettings = async () => {
    if (!customerData) return;

    try {
      // Update customer data with new email notification settings
      const updatedCustomer = {
        ...customerData,
        emailNotifications
      };

      // Save to CRM system
      const success = crmSystem.updateCustomer(customerData.id, updatedCustomer);
      
      if (success) {
        setCustomerData(updatedCustomer);
        console.log('✅ Email notification settings saved');
        alert('E-mail notificatie instellingen opgeslagen!');
      } else {
        console.error('❌ Failed to save email settings');
        alert('Er is een fout opgetreden bij het opslaan van de instellingen.');
      }
    } catch (error) {
      console.error('❌ Error saving email settings:', error);
    }
  };

  // Handle data export
  const handleExportData = () => {
    if (!customerData || !customerData.leadData) return;

    const data = {
      customer: customerData.name,
      email: customerData.email,
      exportDate: new Date().toISOString(),
      leads: customerData.leadData.map(lead => ({
        name: lead.name,
        email: lead.email,
        phone: lead.phone,
        status: lead.status,
        interest: lead.interest,
        budget: lead.budget,
        notes: lead.notes,
        createdAt: lead.createdAt,
        updatedAt: lead.updatedAt
      }))
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `warmeleads-export-${customerData.name}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-xl">Instellingen laden...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
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
                  <Cog6ToothIcon className="w-8 h-8 text-blue-400" />
                  <span>Instellingen & Configuratie</span>
                </h1>
                <p className="text-white/80 text-sm mt-1">
                  {user?.name} • Configureer je CRM en integraties
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8 space-y-8">
        
        {/* Google Sheets Integration */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 backdrop-blur-sm rounded-2xl p-8"
        >
          <div className="flex items-center space-x-3 mb-6">
            <LinkIcon className="w-6 h-6 text-green-400" />
            <h2 className="text-xl font-bold text-white">Google Sheets Integratie</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Google Sheets URL
              </label>
              <div className="flex space-x-3">
                <input
                  type="url"
                  value={googleSheetUrl}
                  onChange={(e) => setGoogleSheetUrl(e.target.value)}
                  placeholder="https://docs.google.com/spreadsheets/d/..."
                  className="flex-1 bg-white/10 border border-white/30 rounded-lg px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-green-400"
                />
                <button
                  onClick={handleSaveGoogleSheetUrl}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition-colors"
                >
                  Opslaan
                </button>
              </div>
              <p className="text-xs text-white/60 mt-2">
                Deze URL wordt gebruikt voor automatische synchronisatie van leads
              </p>
            </div>
          </div>
        </motion.div>

        {/* Email Notifications */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/10 backdrop-blur-sm rounded-2xl p-8"
        >
          <div className="flex items-center space-x-3 mb-6">
            <BellIcon className="w-6 h-6 text-purple-400" />
            <h2 className="text-xl font-bold text-white">E-mail Notificaties</h2>
          </div>
          
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                <div>
                  <h3 className="font-medium text-white">Nieuwe Leads</h3>
                  <p className="text-sm text-white/70">Ontvang een e-mail wanneer een nieuwe lead wordt toegevoegd</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={emailNotifications.newLeads}
                    onChange={(e) => setEmailNotifications(prev => ({ ...prev, newLeads: e.target.checked }))}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                <div>
                  <h3 className="font-medium text-white">Status Updates</h3>
                  <p className="text-sm text-white/70">Ontvang updates wanneer lead status wijzigt</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={emailNotifications.statusUpdates}
                    onChange={(e) => setEmailNotifications(prev => ({ ...prev, statusUpdates: e.target.checked }))}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                <div>
                  <h3 className="font-medium text-white">Wekelijkse Rapportages</h3>
                  <p className="text-sm text-white/70">Dagelijkse samenvatting van prestaties en analytics</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={emailNotifications.weeklyReports}
                    onChange={(e) => setEmailNotifications(prev => ({ ...prev, weeklyReports: e.target.checked }))}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>
            </div>

            <button
              onClick={handleSaveEmailSettings}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition-colors"
            >
              E-mail Instellingen Opslaan
            </button>
          </div>
        </motion.div>

        {/* Branch Intelligence Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/10 backdrop-blur-sm rounded-2xl p-8"
        >
          <div className="flex items-center space-x-3 mb-6">
            <ChartBarIcon className="w-6 h-6 text-blue-400" />
            <h2 className="text-xl font-bold text-white">Branch Intelligence</h2>
          </div>
          
          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
              <div>
                <h3 className="font-medium text-white">Automatische Branch Detectie</h3>
                <p className="text-sm text-white/70">Laat AI automatisch de branch van nieuwe leads bepalen</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={branchSettings.autoDetection}
                  onChange={(e) => setBranchSettings(prev => ({ ...prev, autoDetection: e.target.checked }))}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-medium text-white/80">
                Confidence Threshold ({branchSettings.confidenceThreshold.toFixed(1)})
              </label>
              <input
                type="range"
                min="0.1"
                max="1"
                step="0.1"
                value={branchSettings.confidenceThreshold}
                onChange={(e) => setBranchSettings(prev => ({ ...prev, confidenceThreshold: parseFloat(e.target.value) }))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <p className="text-xs text-white/60">
                Minimum vertrouwen percentage voor automatische branch detectie
              </p>
            </div>
          </div>
        </motion.div>

        {/* Data Management */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/10 backdrop-blur-sm rounded-2xl p-8"
        >
          <div className="flex items-center space-x-3 mb-6">
            <DocumentArrowDownIcon className="w-6 h-6 text-orange-400" />
            <h2 className="text-xl font-bold text-white">Data Beheer</h2>
          </div>
          
          <div className="space-y-4">
            <button
              onClick={handleExportData}
              className="flex items-center space-x-3 w-full p-4 bg-orange-600/20 hover:bg-orange-600/30 border border-orange-500/30 rounded-xl transition-colors"
            >
              <DocumentArrowDownIcon className="w-5 h-5 text-orange-400" />
              <div className="text-left">
                <h3 className="font-medium text-white">Data Exporteren</h3>
                <p className="text-sm text-white/70">Download alle leads en klantgegevens als JSON</p>
              </div>
            </button>

            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-white/5 rounded-xl">
                <div className="text-2xl font-bold text-white">{customerData?.leadData?.length || 0}</div>
                <div className="text-sm text-white/70">Totaal Leads</div>
              </div>
              
              <div className="text-center p-4 bg-white/5 rounded-xl">
                <div className="text-2xl font-bold text-white">
                  {customerData?.leadData?.filter(lead => lead.status === 'qualified').length || 0}
                </div>
                <div className="text-sm text-white/70">Gekwalificeerde Leads</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Security & Privacy */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white/10 backdrop-blur-sm rounded-2xl p-8"
        >
          <div className="flex items-center space-x-3 mb-6">
            <ShieldCheckIcon className="w-6 h-6 text-green-400" />
            <h2 className="text-xl font-bold text-white">Privacy & Beveiliging</h2>
          </div>
          
          <div className="space-y-4 text-sm text-white/70">
            <p>• Alle gegevens worden veilig opgeslagen en versleuteld</p>
            <p>• Google Sheets integratie gebruikt alleen-lezen toegang</p>
            <p>• Jouw gegevens worden niet overschreven zonder verlening</p>
            <p>• Je kunt op elk moment je gegevens exporteren of verwijderen</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
