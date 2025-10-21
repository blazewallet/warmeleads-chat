'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UserGroupIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  ChatBubbleLeftRightIcon,
  DocumentTextIcon,
  EnvelopeIcon,
  PhoneIcon,
  XMarkIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { getAllCustomers, type Customer } from '@/lib/crmSystem';
import { ADMIN_CONFIG, getFirstAdminEmail } from '@/config/admin';

// Customer Detail Modal Component
function CustomerDetailModal({ customer, onClose, onRefresh }: { customer: Customer; onClose: () => void; onRefresh: () => void }) {
  const [activeTab, setActiveTab] = useState<'info' | 'chat' | 'orders' | 'invoices' | 'notes' | 'account'>('info');
  const [notes, setNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-brand-purple to-brand-pink text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">
                  {customer.name?.charAt(0) || customer.email.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <h2 className="text-2xl font-bold">{customer.name || 'Naamloos'}</h2>
                <p className="text-white/80">{customer.email}</p>
                {customer.company && <p className="text-white/60 text-sm">{customer.company}</p>}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {/* Quick Actions */}
              <div className="flex space-x-2">
                <a
                  href={`mailto:${customer.email}`}
                  className="bg-white/20 hover:bg-white/30 text-white p-2 rounded-lg transition-colors"
                  title="Email versturen"
                >
                  <EnvelopeIcon className="w-5 h-5" />
                </a>
                {customer.phone && (
                  <a
                    href={`tel:${customer.phone}`}
                    className="bg-white/20 hover:bg-white/30 text-white p-2 rounded-lg transition-colors"
                    title="Bellen"
                  >
                    <PhoneIcon className="w-5 h-5" />
                  </a>
                )}
                {customer.phone && (
                  <a
                    href={`https://wa.me/${customer.phone.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-white/20 hover:bg-white/30 text-white p-2 rounded-lg transition-colors"
                    title="WhatsApp"
                  >
                    💬
                  </a>
                )}
              </div>
              <button onClick={onClose} className="text-white/80 hover:text-white">
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6 overflow-x-auto">
            {[
              { id: 'info', label: 'Info', icon: UserGroupIcon },
              { id: 'chat', label: `Chat (${customer.chatHistory.length})`, icon: ChatBubbleLeftRightIcon },
              { id: 'orders', label: `Bestellingen (${customer.orders.length})`, icon: DocumentTextIcon },
              { id: 'invoices', label: `Facturen (${customer.openInvoices.length})`, icon: ClockIcon },
              { id: 'notes', label: 'Notities', icon: DocumentTextIcon },
              ...(customer.hasAccount ? [{ id: 'account', label: 'Account Beheer', icon: UserGroupIcon }] : [])
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-2 border-b-2 font-medium text-sm flex items-center space-x-2 whitespace-nowrap ${
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

        {/* Tab Content */}
        <div className="p-6 max-h-96 overflow-y-auto">
          {activeTab === 'info' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Contact Info</h3>
                  <div className="space-y-2 text-sm">
                    <div><strong>Naam:</strong> {customer.name || 'Niet opgegeven'}</div>
                    <div><strong>Email:</strong> {customer.email}</div>
                    <div><strong>Telefoon:</strong> {customer.phone || 'Niet opgegeven'}</div>
                    <div><strong>Bedrijf:</strong> {customer.company || 'Niet opgegeven'}</div>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Statistieken</h3>
                  <div className="space-y-2 text-sm">
                    <div><strong>Status:</strong> {customer.status}</div>
                    <div><strong>Bron:</strong> {customer.source}</div>
                    <div><strong>Chat berichten:</strong> {customer.chatHistory.length}</div>
                    <div><strong>Bestellingen:</strong> {customer.orders.length}</div>
                    <div><strong>Totale waarde:</strong> €{customer.orders.reduce((sum, o) => sum + o.amount, 0).toFixed(2)}</div>
                  </div>
                </div>
              </div>

              {customer.dataHistory.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Wijzigingsgeschiedenis</h3>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {customer.dataHistory.slice(-10).map((change, index) => (
                      <div key={index} className="text-sm bg-gray-50 p-3 rounded-lg">
                        <strong>{change.field}:</strong> "{change.oldValue || 'leeg'}" → "{change.newValue}"
                        <div className="text-xs text-gray-500 mt-1">
                          {new Date(change.timestamp).toLocaleString('nl-NL')} via {change.source}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'chat' && (
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">Chat Geschiedenis</h3>
              {customer.chatHistory.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Nog geen chat berichten</p>
              ) : (
                <div className="space-y-3 max-h-80 overflow-y-auto bg-gray-50 p-4 rounded-lg">
                  {customer.chatHistory.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.type === 'lisa' ? 'justify-start' : 'justify-end'}`}>
                      <div className={`max-w-xs px-4 py-2 rounded-lg ${
                        msg.type === 'lisa' 
                          ? 'bg-white text-gray-900 shadow-sm' 
                          : 'bg-brand-purple text-white'
                      }`}>
                        <div className="text-sm">{msg.content}</div>
                        <div className="text-xs opacity-70 mt-1">
                          {new Date(msg.timestamp).toLocaleTimeString('nl-NL')}
                          {msg.step && ` (${msg.step})`}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'invoices' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold text-gray-900">Open Facturen</h3>
                {customer.openInvoices.length > 0 && (
                  <button className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                    📧 Verstuur reminder
                  </button>
                )}
              </div>
              {customer.openInvoices.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Geen openstaande facturen</p>
              ) : (
                <div className="space-y-3">
                  {customer.openInvoices.map((invoice) => (
                    <div key={invoice.id} className="border border-orange-200 rounded-lg p-4 bg-orange-50">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium">{invoice.quantity} {invoice.leadType}</div>
                          <div className="text-sm text-gray-600">{invoice.industry}</div>
                          <div className="text-lg font-bold text-orange-600">{invoice.amount}</div>
                          <div className="text-xs text-gray-500">
                            Aangemaakt: {new Date(invoice.createdAt).toLocaleString('nl-NL')}
                          </div>
                          {invoice.lastReminderSent && (
                            <div className="text-xs text-gray-500">
                              Laatste reminder: {new Date(invoice.lastReminderSent).toLocaleString('nl-NL')}
                            </div>
                          )}
                        </div>
                        <div className="text-right">
                          <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                            invoice.status === 'overdue' ? 'bg-red-100 text-red-800' :
                            invoice.status === 'sent' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {invoice.status}
                          </span>
                          <div className="text-xs text-gray-500 mt-1">
                            {invoice.reminderCount} reminder{invoice.reminderCount !== 1 ? 's' : ''}
                          </div>
                          <div className="mt-2">
                            <button className="text-xs bg-orange-600 hover:bg-orange-700 text-white px-3 py-1 rounded transition-colors">
                              💌 Verstuur reminder
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'notes' && (
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">Klant Notities</h3>
              <div className="space-y-3">
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Voeg notities toe over deze klant..."
                  className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-purple focus:border-brand-purple resize-none"
                />
                <button className="bg-brand-purple hover:bg-brand-purple/90 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                  💾 Notitie opslaan
                </button>
              </div>
              <div className="border-t border-gray-200 pt-4">
                <h4 className="font-medium text-gray-900 mb-2">Eerdere notities:</h4>
                <p className="text-gray-500 text-sm">Nog geen notities toegevoegd</p>
              </div>
            </div>
          )}

          {activeTab === 'account' && customer.hasAccount && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-brand-purple/10 to-brand-pink/10 rounded-xl p-6 border border-brand-purple/20">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="text-2xl">👤</span>
                  Account Beheer
                </h3>
                
                <div className="space-y-4">
                  {/* Account Status */}
                  <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200">
                    <div>
                      <p className="font-medium text-gray-900">Account Status</p>
                      <p className="text-sm text-gray-500">Activeer of deactiveer toegang tot het leadportaal</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        customer.hasAccount ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {customer.hasAccount ? '✅ Actief' : '⏸️ Inactief'}
                      </span>
                      <button
                        onClick={async () => {
                          if (isProcessing) return;
                          setIsProcessing(true);
                          
                          const action = customer.hasAccount ? 'deactivate' : 'activate';
                          const confirmed = confirm(`Weet je zeker dat je dit account wilt ${action === 'activate' ? 'activeren' : 'deactiveren'}?`);
                          
                          if (confirmed) {
                            try {
                              const response = await fetch('/api/auth/manage-account', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                  action,
                                  email: customer.email,
                                  adminEmail: getFirstAdminEmail()
                                })
                              });

                              const result = await response.json();
                              
                              if (result.success) {
                                alert(`✅ ${result.message}`);
                                onRefresh();
                                onClose();
                              } else {
                                alert(`❌ ${result.message || 'Er ging iets mis'}`);
                              }
                            } catch (error) {
                              console.error('Error managing account:', error);
                              alert('❌ Fout bij het beheren van account');
                            }
                          }
                          
                          setIsProcessing(false);
                        }}
                        disabled={isProcessing}
                        className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                          customer.hasAccount
                            ? 'bg-orange-500 hover:bg-orange-600 text-white'
                            : 'bg-green-500 hover:bg-green-600 text-white'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        {isProcessing ? '⏳ Bezig...' : customer.hasAccount ? '⏸️ Deactiveren' : '✅ Activeren'}
                      </button>
                    </div>
                  </div>

                  {/* Account Info */}
                  <div className="p-4 bg-white rounded-lg border border-gray-200">
                    <h4 className="font-medium text-gray-900 mb-3">Account Informatie</h4>
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex justify-between">
                        <span>Email:</span>
                        <span className="font-medium text-gray-900">{customer.email}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Account aangemaakt:</span>
                        <span className="font-medium text-gray-900">
                          {customer.accountCreatedAt ? new Date(customer.accountCreatedAt).toLocaleDateString('nl-NL') : 'Onbekend'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Laatste activiteit:</span>
                        <span className="font-medium text-gray-900">
                          {new Date(customer.lastActivity).toLocaleDateString('nl-NL')}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Leads:</span>
                        <span className="font-medium text-gray-900">{customer.leadData?.length || 0}</span>
                      </div>
                    </div>
                  </div>

                  {/* Danger Zone */}
                  <div className="p-4 bg-red-50 rounded-lg border-2 border-red-200">
                    <h4 className="font-medium text-red-900 mb-2 flex items-center gap-2">
                      <span>⚠️</span>
                      Danger Zone
                    </h4>
                    <p className="text-sm text-red-700 mb-4">
                      Het verwijderen van een account is permanent en kan niet ongedaan worden gemaakt. 
                      Alle gegevens, leads, en toegang worden volledig verwijderd.
                    </p>
                    <button
                      onClick={async () => {
                        if (isProcessing) return;
                        
                        const confirmed = confirm(
                          `⚠️ WAARSCHUWING!\n\nWeet je ZEKER dat je het account van ${customer.email} wilt verwijderen?\n\nDit verwijdert:\n- Account toegang\n- Alle opgeslagen data\n- Lead geschiedenis\n\nDeze actie kan NIET ongedaan worden gemaakt!`
                        );
                        
                        if (confirmed) {
                          const doubleConfirm = confirm(
                            `Laatste bevestiging!\n\nTyp "VERWIJDEREN" in de volgende prompt om door te gaan.`
                          );
                          
                          if (doubleConfirm) {
                            const finalConfirm = prompt('Typ "VERWIJDEREN" om door te gaan:');
                            
                            if (finalConfirm === 'VERWIJDEREN') {
                              setIsProcessing(true);
                              
                              let deletedFromBlob = false;
                              let deletedFromLocalStorage = false;
                              
                              try {
                                // First try to delete from Blob Storage
                                const response = await fetch('/api/auth/manage-account', {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({
                                    action: 'delete',
                                    email: customer.email,
                                    adminEmail: getFirstAdminEmail()
                                  })
                                });

                                const result = await response.json();
                                
                                if (result.success) {
                                  console.log(`✅ Deleted from Blob Storage: ${customer.email}`);
                                  deletedFromBlob = true;
                                } else {
                                  console.warn(`⚠️ Not in Blob Storage: ${customer.email}`);
                                }
                              } catch (error) {
                                console.error('Error deleting from Blob Storage:', error);
                              }
                              
                              // Also try to delete from localStorage CRM
                              try {
                                const crmData = localStorage.getItem('warmeleads_crm_data');
                                if (crmData) {
                                  const crm = JSON.parse(crmData);
                                  if (crm.customers && Array.isArray(crm.customers)) {
                                    const originalLength = crm.customers.length;
                                    crm.customers = crm.customers.filter((c: any) => c.email !== customer.email);
                                    
                                    if (crm.customers.length < originalLength) {
                                      localStorage.setItem('warmeleads_crm_data', JSON.stringify(crm));
                                      console.log(`✅ Deleted from localStorage CRM: ${customer.email}`);
                                      deletedFromLocalStorage = true;
                                    }
                                  }
                                }
                              } catch (error) {
                                console.error('Error deleting from localStorage:', error);
                              }
                              
                              setIsProcessing(false);
                              
                              // Show appropriate message
                              if (deletedFromBlob || deletedFromLocalStorage) {
                                let message = '✅ Account succesvol verwijderd!\n\n';
                                if (deletedFromBlob) message += '• Verwijderd uit Blob Storage (cross-device)\n';
                                if (deletedFromLocalStorage) message += '• Verwijderd uit localStorage (dit apparaat)\n';
                                alert(message);
                                onRefresh();
                                onClose();
                              } else {
                                alert(`❌ Account niet gevonden in Blob Storage of localStorage.\n\nDeze klant staat mogelijk alleen in de CRM database.`);
                              }
                            } else {
                              alert('❌ Verwijderen geannuleerd');
                            }
                          }
                        }
                      }}
                      disabled={isProcessing}
                      className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-lg font-semibold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isProcessing ? '⏳ Bezig met verwijderen...' : '🗑️ Account permanent verwijderen'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'lead' | 'customer' | 'open_invoices'>('all');

  useEffect(() => {
    const loadCustomers = async () => {
      try {
        console.log('🔄 Loading customers from Blob Storage and localStorage...');
        
        // 1. Get CRM customers from localStorage (contains lead data, google sheets, etc.)
        const crmCustomers = getAllCustomers();
        console.log(`📦 Loaded ${crmCustomers.length} customers from CRM (localStorage)`);
        
        // 2. Fetch registered accounts from Blob Storage (cross-device)
        const registeredEmails = new Set<string>();
        
        try {
          const response = await fetch(`/api/auth/list-accounts?adminEmail=${encodeURIComponent(getFirstAdminEmail())}`);
          if (response.ok) {
            const { accounts } = await response.json();
            console.log(`✅ Fetched ${accounts.length} registered accounts from Blob Storage`);
            
            accounts.forEach((account: any) => {
              if (account.email && !account.isGuest) {
                registeredEmails.add(account.email);
              }
            });
          } else {
            console.warn('⚠️ Failed to fetch accounts from Blob Storage, falling back to localStorage');
          }
        } catch (error) {
          console.error('❌ Error fetching accounts from Blob Storage:', error);
        }
        
        // 3. Fallback: Also check localStorage for accounts (backward compatibility)
        const authUsers = JSON.parse(localStorage.getItem('warmeleads-auth-store') || '{}');
        if (authUsers.state?.user?.email) {
          registeredEmails.add(authUsers.state.user.email);
        }
        
        // Also add all configured admin emails
        ADMIN_CONFIG.adminEmails.forEach(email => {
          registeredEmails.add(email);
        });
        
        // Check localStorage for other registered users (legacy)
        const authData = localStorage.getItem('auth-users') || '[]';
        try {
          const users = JSON.parse(authData);
          users.forEach((user: any) => {
            if (user.email && !user.isGuest) {
              registeredEmails.add(user.email);
            }
          });
        } catch (e) {
          console.log('No additional auth users found in localStorage');
        }
        
        // 4. Merge: Update CRM customers with account status from Blob Storage
        const syncedCustomers = crmCustomers.map(customer => {
          const hasAccount = registeredEmails.has(customer.email);
          if (hasAccount && !customer.hasAccount) {
            // Update customer to have account
            customer.hasAccount = true;
            customer.accountCreatedAt = new Date();
            customer.status = 'customer';
            
            console.log(`✅ Synced account status for ${customer.email}`);
          }
          return customer;
        });
        
        // 5. Add accounts that are not yet in CRM
        registeredEmails.forEach(email => {
          const existsInCrm = syncedCustomers.some(c => c.email === email);
          if (!existsInCrm) {
            console.log(`➕ Adding new account to CRM list: ${email}`);
            syncedCustomers.push({
              id: `account-${email}`,
              email: email,
              name: email.split('@')[0],
              hasAccount: true,
              accountCreatedAt: new Date(),
              status: 'customer',
              createdAt: new Date(),
              lastActivity: new Date(),
              source: 'direct',
              leadData: [],
              orders: [],
              chatHistory: [],
              openInvoices: [],
              dataHistory: [],
              notes: [],
              tags: ['registered-account'],
              whatsappConfig: {
                enabled: false,
                phoneNumber: '',
                notificationTypes: []
              }
            } as Customer);
          }
        });
        
        setCustomers(syncedCustomers);
        
        console.log('📊 Loaded customers with Blob Storage sync:', {
          totalCustomers: syncedCustomers.length,
          withAccounts: syncedCustomers.filter(c => c.hasAccount).length,
          registeredEmailsCount: registeredEmails.size,
          registeredEmails: Array.from(registeredEmails)
        });
      } catch (error) {
        console.error('❌ Error loading customers:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCustomers();
    const interval = setInterval(loadCustomers, 30000);
    return () => clearInterval(interval);
  }, []);

  const filteredCustomers = customers.filter(customer => 
    customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.company?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Klanten</h1>
          <p className="text-gray-600 mt-1">
            {customers.length} totaal • {customers.filter(c => c.hasAccount).length} met account • {customers.filter(c => c.openInvoices.length > 0).length} met open facturen
          </p>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={() => {
              // Force reload to sync auth data
              window.location.reload();
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            🔄 Sync accounts
          </button>
          
          <button
            onClick={() => {
              // Count localStorage accounts before clearing
              const authStore = localStorage.getItem('warmeleads-auth-store');
              const authUsers = localStorage.getItem('auth-users');
              const crmData = localStorage.getItem('warmeleads_crm_data');
              
              let accountCount = 0;
              let crmCustomerCount = 0;
              let detailsText = '';
              
              try {
                if (authStore) {
                  const data = JSON.parse(authStore);
                  if (data.state?.user) {
                    accountCount++;
                    detailsText += `\n- Auth store: ${data.state.user.email}`;
                  }
                }
                
                if (authUsers) {
                  const users = JSON.parse(authUsers);
                  if (Array.isArray(users)) {
                    accountCount += users.length;
                    users.forEach((u: any) => {
                      detailsText += `\n- Legacy auth: ${u.email}`;
                    });
                  }
                }
                
                if (crmData) {
                  const crm = JSON.parse(crmData);
                  if (crm.customers && Array.isArray(crm.customers)) {
                    crmCustomerCount = crm.customers.length;
                    detailsText += `\n- CRM klanten: ${crmCustomerCount} klant(en)`;
                  }
                }
              } catch (e) {
                console.error('Error counting accounts:', e);
              }
              
              const totalItems = accountCount + (crmCustomerCount > 0 ? 1 : 0); // CRM counts as 1 item
              
              if (totalItems === 0) {
                alert('ℹ️ Er zijn geen accounts of data in localStorage gevonden.');
                return;
              }
              
              const confirmed = confirm(
                `⚠️ WAARSCHUWING!\n\nJe staat op het punt om ALLE data uit localStorage te verwijderen.\n\n` +
                `Gevonden:${detailsText}\n\n` +
                `Totaal: ${accountCount} account(s) + ${crmCustomerCount} CRM klant(en)\n\n` +
                `Let op:\n` +
                `✓ Data wordt ALLEEN uit localStorage verwijderd\n` +
                `✓ Blob Storage blijft intact (cross-device data blijft bestaan)\n` +
                `✓ Je moet mogelijk opnieuw inloggen na deze actie\n\n` +
                `Weet je zeker dat je wilt doorgaan?`
              );
              
              if (!confirmed) {
                return;
              }
              
              // Double confirmation for safety
              const doubleConfirm = confirm(
                `Laatste bevestiging!\n\nType "WISSEN" in de volgende prompt om door te gaan.`
              );
              
              if (!doubleConfirm) {
                return;
              }
              
              const finalConfirm = prompt('Typ "WISSEN" om alle localStorage accounts te verwijderen:');
              
              if (finalConfirm === 'WISSEN') {
                // Clear all auth-related localStorage
                const keysToRemove = [
                  'warmeleads-auth-store',
                  'auth-users',
                  'warmeleads_crm_data',
                  'guest-customer-data'
                ];
                
                let removed = 0;
                keysToRemove.forEach(key => {
                  if (localStorage.getItem(key)) {
                    localStorage.removeItem(key);
                    removed++;
                    console.log(`🗑️ Removed from localStorage: ${key}`);
                  }
                });
                
                console.log(`✅ Cleared ${removed} localStorage items`);
                alert(
                  `✅ LocalStorage succesvol gewist!\n\n` +
                  `${removed} item(s) verwijderd uit localStorage\n` +
                  `${accountCount} account(s) verwijderd\n` +
                  `${crmCustomerCount} CRM klant(en) verwijderd\n\n` +
                  `⚠️ Blob Storage (cross-device) blijft intact\n\n` +
                  `De pagina wordt nu herladen...`
                );
                
                // Reload to reflect changes
                window.location.reload();
              } else {
                alert('❌ Actie geannuleerd - niets is verwijderd');
              }
            }}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
            title="Verwijder alle accounts uit localStorage (Blob Storage blijft intact)"
          >
            🗑️ Clear localStorage
          </button>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="relative"
      >
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Zoek klanten op naam, email of bedrijf..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-purple focus:border-brand-purple"
        />
      </motion.div>

      {isLoading ? (
        <div className="text-center py-12">
          <div className="w-8 h-8 border-4 border-brand-purple/30 border-t-brand-purple rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Klanten laden...</p>
        </div>
      ) : filteredCustomers.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center py-12"
        >
          <UserGroupIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {searchTerm ? 'Geen klanten gevonden' : 'Nog geen klanten'}
          </h3>
          <p className="text-gray-600">
            {searchTerm 
              ? 'Probeer een andere zoekterm.' 
              : 'Klanten verschijnen hier zodra ze contactgegevens invullen in de chat.'
            }
          </p>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-sm overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Klant
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Activiteit
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredCustomers.map((customer) => (
                  <tr 
                    key={customer.id} 
                    onClick={() => setSelectedCustomer(customer)}
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-r from-brand-purple to-brand-pink rounded-full flex items-center justify-center">
                          <span className="text-white font-semibold text-sm">
                            {customer.name?.charAt(0) || customer.email.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {customer.name || 'Naamloos'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {customer.email}
                          </div>
                          {customer.company && (
                            <div className="text-xs text-gray-400">
                              {customer.company}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        {customer.phone && (
                          <div className="flex items-center text-sm text-gray-600">
                            <PhoneIcon className="w-4 h-4 mr-2" />
                            {customer.phone}
                          </div>
                        )}
                        <div className="flex items-center text-sm text-gray-600">
                          <EnvelopeIcon className="w-4 h-4 mr-2" />
                          {customer.email}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                       <div className="space-y-1">
                         <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                           customer.status === 'customer' ? 'bg-green-100 text-green-800' :
                           customer.status === 'contacted' ? 'bg-blue-100 text-blue-800' :
                           customer.status === 'lead' ? 'bg-yellow-100 text-yellow-800' :
                           'bg-gray-100 text-gray-800'
                         }`}>
                           {customer.status === 'customer' ? '🎯 Klant' :
                            customer.status === 'contacted' ? '📞 Gecontacteerd' :
                            customer.status === 'lead' ? '🔥 Lead' : '💤 Inactief'}
                         </span>
                         
                         <div className="flex flex-wrap gap-1">
                           {customer.hasAccount ? (
                             <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                               👤 Account
                             </span>
                           ) : (
                             <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-600">
                               👤 Geen account
                             </span>
                           )}
                           
                           {customer.googleSheetId && (
                             <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                               📊 Sheet gekoppeld
                             </span>
                           )}
                           
                           {customer.openInvoices.length > 0 && (
                             <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-800">
                               📋 {customer.openInvoices.length} open factuur{customer.openInvoices.length !== 1 ? 'en' : ''}
                             </span>
                           )}
                         </div>
                       </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {new Date(customer.lastActivity).toLocaleDateString('nl-NL')}
                      </div>
                      <div className="text-xs text-gray-500">
                        {customer.chatHistory.length} chat berichten
                      </div>
                      <div className="text-xs text-gray-500">
                        {customer.orders.length} bestellingen (€{customer.orders.reduce((sum, o) => sum + o.amount, 0).toFixed(2)})
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedCustomer(customer);
                          }}
                          className="text-brand-purple hover:text-brand-pink transition-colors"
                          title="Bekijk details"
                        >
                          <EyeIcon className="w-5 h-5" />
                        </button>
                        
                        {!customer.hasAccount && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              // Create account for customer
                              const confirmed = confirm(`Account aanmaken voor ${customer.name || customer.email}?`);
                              if (confirmed) {
                                // This would integrate with your auth system
                                alert('Account aanmaken functionaliteit - integratie met auth systeem nodig');
                              }
                            }}
                            className="text-purple-600 hover:text-purple-800 transition-colors"
                            title="Account aanmaken"
                          >
                            👤
                          </button>
                        )}
                        
                        {customer.hasAccount && (
                          <>
                            <button
                              onClick={async (e) => {
                                e.stopPropagation();
                                const currentUrl = customer.googleSheetUrl || '';
                                const sheetUrl = prompt(
                                  `Google Sheets URL voor deze klant:\n${currentUrl ? `Huidige URL: ${currentUrl}\n\n` : ''}Voer nieuwe URL in:\n(Bijv: https://docs.google.com/spreadsheets/d/1ABC.../edit)`,
                                  currentUrl
                                );
                                
                                if (sheetUrl && sheetUrl.includes('docs.google.com/spreadsheets')) {
                                  try {
                                    // Extract sheet ID from URL
                                    const match = sheetUrl.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
                                    if (match) {
                                      const sheetId = match[1];
                                      
                                      console.log('📊 Saving Google Sheets URL to blob storage...');
                                      console.log('Customer ID:', customer.id);
                                      console.log('Customer Email:', customer.email);
                                      console.log('Google Sheets URL:', sheetUrl);
                                      console.log('Sheet ID:', sheetId);
                                      
                                      // Save to Vercel Blob Storage in customer-data (niet customer-sheets!)
                                      // Gebruik email als customerId voor consistentie
                                      const response = await fetch('/api/customer-data', {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({
                                          customerId: customer.email, // Gebruik email, niet ID!
                                          customerData: {
                                            id: customer.email,
                                            email: customer.email,
                                            name: customer.name,
                                            googleSheetUrl: sheetUrl,
                                            googleSheetId: sheetId
                                          }
                                        })
                                      });

                                      if (response.ok) {
                                        const result = await response.json();
                                        console.log('✅ Successfully saved:', result);
                                        
                                        if (result.blobUrl) {
                                          console.log('✅ Saved to blob storage!');
                                          console.log('Blob URL:', result.blobUrl);
                                        } else if (result.warning) {
                                          console.warn('⚠️', result.warning);
                                        }
                                        
                                        // Update customer with Google Sheet info (localStorage blijft als backup)
                                        const updatedCustomers = customers.map(c => 
                                          c.id === customer.id 
                                            ? { ...c, googleSheetId: sheetId, googleSheetUrl: sheetUrl }
                                            : c
                                        );
                                        
                                        // Save to localStorage
                                        localStorage.setItem('warmeleads_crm_data', JSON.stringify({
                                          customers: updatedCustomers.map(c => [c.id, c]),
                                          customersByEmail: updatedCustomers.map(c => [c.email, c.id])
                                        }));
                                        
                                        const storageType = result.blobUrl ? 'blob storage en localStorage' : 'localStorage (blob storage niet geconfigureerd)';
                                        alert(`✅ Google Sheet ${customer.googleSheetId ? 'bijgewerkt' : 'gekoppeld'} en opgeslagen in ${storageType} voor ${customer.name || customer.email}!`);
                                        window.location.reload();
                                      } else {
                                        const error = await response.json();
                                        console.error('❌ Failed to save to blob storage:', error);
                                        
                                        // Still update localStorage as fallback
                                        const updatedCustomers = customers.map(c => 
                                          c.id === customer.id 
                                            ? { ...c, googleSheetId: sheetId, googleSheetUrl: sheetUrl }
                                            : c
                                        );
                                        
                                        localStorage.setItem('warmeleads_crm_data', JSON.stringify({
                                          customers: updatedCustomers.map(c => [c.id, c]),
                                          customersByEmail: updatedCustomers.map(c => [c.email, c.id])
                                        }));
                                        
                                        alert(`⚠️ Google Sheet opgeslagen in localStorage (blob storage fout: ${error.details || error.error})\n\nDe URL werkt nog steeds via localStorage.`);
                                        window.location.reload();
                                      }
                                    } else {
                                      console.error('❌ Invalid Google Sheets URL format');
                                      alert('❌ Ongeldige Google Sheets URL');
                                    }
                                  } catch (error) {
                                    console.error('❌ Error saving Google Sheet URL:', error);
                                    alert('❌ Fout bij koppelen Google Sheet');
                                  }
                                } else if (sheetUrl !== null && sheetUrl !== '') {
                                  console.error('❌ URL does not contain docs.google.com/spreadsheets');
                                  alert('❌ Ongeldige Google Sheets URL');
                                }
                              }}
                              className="text-green-600 hover:text-green-800 transition-colors"
                              title={customer.googleSheetId ? "Google Sheet URL wijzigen" : "Google Sheet koppelen"}
                            >
                              {customer.googleSheetId ? '✏️📊' : '📊'}
                            </button>
                            
                            {customer.googleSheetId && (
                              <a
                                href={customer.googleSheetUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="text-blue-600 hover:text-blue-800 transition-colors ml-2"
                                title="Open Google Sheet"
                              >
                                🔗
                              </a>
                            )}
                          </>
                        )}
                        
                        <a
                          href={`mailto:${customer.email}`}
                          onClick={(e) => e.stopPropagation()}
                          className="text-blue-600 hover:text-blue-800 transition-colors"
                          title="Email versturen"
                        >
                          <EnvelopeIcon className="w-5 h-5" />
                        </a>
                        {customer.phone && (
                          <a
                            href={`tel:${customer.phone}`}
                            onClick={(e) => e.stopPropagation()}
                            className="text-green-600 hover:text-green-800 transition-colors"
                            title="Bellen"
                          >
                            <PhoneIcon className="w-5 h-5" />
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* Customer Detail Modal */}
      <AnimatePresence>
        {selectedCustomer && (
          <CustomerDetailModal 
            customer={selectedCustomer} 
            onClose={() => setSelectedCustomer(null)}
            onRefresh={async () => {
              // Reload customers after account management action
              const loadCustomers = async () => {
                try {
                  const crmCustomers = getAllCustomers();
                  const registeredEmails = new Set<string>();
                  
                  try {
                    const response = await fetch(`/api/auth/list-accounts?adminEmail=${encodeURIComponent(getFirstAdminEmail())}`);
                    if (response.ok) {
                      const { accounts } = await response.json();
                      accounts.forEach((account: any) => {
                        if (account.email && !account.isGuest) {
                          registeredEmails.add(account.email);
                        }
                      });
                    }
                  } catch (error) {
                    console.error('Error fetching accounts:', error);
                  }
                  
                  const syncedCustomers = crmCustomers.map(customer => {
                    const hasAccount = registeredEmails.has(customer.email);
                    if (hasAccount && !customer.hasAccount) {
                      customer.hasAccount = true;
                      customer.accountCreatedAt = new Date();
                      customer.status = 'customer';
                    }
                    return customer;
                  });
                  
                  setCustomers(syncedCustomers);
                } catch (error) {
                  console.error('Error reloading customers:', error);
                }
              };
              
              await loadCustomers();
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}