'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/n navigation';
import { 
  ArrowLeftIcon,
  PlusIcon,
  ClockIcon,
  CheckCircleIcon,
  CurrencyEuroIcon,
  ChartBarIcon,
  ChatBubbleLeftRightIcon,
  Cog6ToothIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import { Logo } from './Logo';
import { useAuthStore } from '../lib/auth';
import { CustomerLeadsSection } from './CustomerLeadsSection';
import { crmSystem, type Customer, type Lead } from '@/lib/crmSystem';

interface CustomerPortalProps {
  onBackToHome: () => void;
  onStartChat: () => void;
}

// Gebruik echte bestellingen van de gebruiker of toon demo data alleen voor demo account
const getRecentOrders = (user: any) => {
  if (user?.email === 'demo@warmeleads.eu') {
    // Demo gebruiker - toon demo bestellingen
    return [
      {
        id: '#WL-2024-001',
        type: 'Exclusieve Thuisbatterij Leads',
        quantity: 50,
        status: 'geleverd',
        date: '2024-01-15',
        amount: '€2.000',
        leads: 47,
        conversions: 12,
      },
      {
        id: '#WL-2024-002', 
        type: 'Gedeelde Zonnepaneel Leads',
        quantity: 500,
        status: 'actief',
        date: '2024-01-20',
        amount: '€7.500',
        leads: 423,
        conversions: 89,
      }
    ];
  }
  
  // Echte gebruiker - toon hun eigen bestellingen
  if (user?.orders && user.orders.length > 0) {
    return user.orders.map((order: any, index: number) => ({
      id: `#WL-${new Date().getFullYear()}-${String(index + 1).padStart(3, '0')}`,
      type: order.type,
      quantity: order.quantity,
      status: order.status === 'delivered' ? 'geleverd' : order.status === 'active' ? 'actief' : order.status,
      date: order.date,
      amount: `€${(order.amount / 1000).toFixed(1)}K`,
      leads: order.leads || 0,
      conversions: order.conversions || 0,
    }));
  }
  
  // Geen bestellingen
  return [];
};

const quickActions = [
  {
    icon: PlusIcon,
    title: 'Nieuwe bestelling',
    description: 'Bestel meer leads voor uw campagnes',
    action: 'reorder',
    color: 'bg-green-500',
  },
  {
    icon: UserIcon,
    title: 'Mijn Leads',
    description: 'Beheer uw leads en Google Sheets sync',
    action: 'leads',
    color: 'bg-blue-500',
    requiresAccount: true,
  },
  {
    icon: Cog6ToothIcon,
    title: 'CRM Dashboard',
    description: 'Enterprise-grade lead management & analytics',
    action: 'crm',
    color: 'bg-purple-600',
    requiresAccount: true,
  },
  {
    icon: ChartBarIcon,
    title: 'Performance dashboard',
    description: 'Bekijk uw conversie statistieken',
    action: 'analytics',
    color: 'bg-purple-500',
  },
  {
    icon: Cog6ToothIcon,
    title: 'Account instellingen',
    description: 'Wijzig uw voorkeuren en gegevens',
    action: 'settings',
    color: 'bg-indigo-500',
  },
  {
    icon: ChatBubbleLeftRightIcon,
    title: 'Support chat',
    description: 'Vragen of hulp nodig?',
    action: 'support',
    color: 'bg-orange-500',
  },
];

export function CustomerPortal({ onBackToHome, onStartChat }: CustomerPortalProps) {
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const [customerData, setCustomerData] = useState<Customer | null>(null);
  const { user, isAuthenticated, logout } = useAuthStore();
  const router = useRouter();
  
  // Debug auth state
  useEffect(() => {
    console.log('🔍 CustomerPortal auth debug:', {
      user: user,
      isAuthenticated: isAuthenticated,
      userEmail: user?.email,
      userName: user?.name,
      isGuest: user?.isGuest,
      hasCustomerData: !!customerData,
      customerHasAccount: customerData?.hasAccount
    });
  }, [user, isAuthenticated, customerData]);

  // Load customer data from CRM
  useEffect(() => {
    if (user?.email) {
      const customers = crmSystem.getAllCustomers();
      const customer = customers.find(c => c.email === user.email);
      setCustomerData(customer || null);
    }
  }, [user]);
  
  // Haal bestellingen op basis van gebruiker
  const recentOrders = getRecentOrders(user);

  const handleLogout = () => {
    console.log('Logout knop geklikt');
    logout();
    console.log('Logout functie uitgevoerd');
    // Direct navigate to home after logout
    onBackToHome();
  };

  const handleQuickAction = (action: string) => {
    if (action === 'reorder' || action === 'support') {
      onStartChat();
    } else if (action === 'leads') {
      // Navigate to CRM leads page
      router.push('/crm/leads');
    } else if (action === 'crm') {
      // Navigate to CRM dashboard
      router.push('/crm');
    } else {
      setSelectedAction(action);
    }
  };

  // Lead management handlers
  const handleUpdateLead = (leadId: string, updates: Partial<Lead>) => {
    if (customerData) {
      crmSystem.updateCustomerLead(customerData.id, leadId, updates);
      // Refresh customer data
      const updatedCustomer = crmSystem.getCustomerById(customerData.id);
      if (updatedCustomer) {
        setCustomerData(updatedCustomer);
      }
    }
  };

  const handleAddLead = (leadData: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (customerData) {
      crmSystem.addLeadToCustomer(customerData.id, leadData);
      // Refresh customer data
      const updatedCustomer = crmSystem.getCustomerById(customerData.id);
      if (updatedCustomer) {
        setCustomerData(updatedCustomer);
      }
    }
  };

  const handleDeleteLead = (leadId: string) => {
    if (customerData) {
      // Remove lead from customer data
      const updatedLeads = customerData.leadData?.filter(l => l.id !== leadId) || [];
      customerData.leadData = updatedLeads;
      setCustomerData({ ...customerData });
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <motion.div
        className="flex items-center justify-between p-4 glass-effect"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <button
          onClick={onBackToHome}
          className="flex items-center space-x-2 text-white/80 hover:text-white transition-colors"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          <span>Home</span>
        </button>
        
        <div className="text-center">
          <h1 className="text-white font-bold text-xl">Mijn Account</h1>
          <p className="text-white/60 text-sm">
            Welkom terug, {user?.name || (user?.isGuest ? 'Gast' : 'Gebruiker')}!
            {user?.isGuest && (
              <span className="block text-xs text-brand-pink mt-1">
                Gast account - <button 
                  onClick={() => {/* TODO: Show account creation */}}
                  className="underline hover:text-brand-orange"
                >
                  Maak account aan
                </button>
              </span>
            )}
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={onStartChat}
            className="chat-button px-4 py-2 text-sm"
          >
            💬 Support
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white/80 hover:text-white transition-all"
          >
            <UserIcon className="w-4 h-4" />
            <span className="text-sm">Uitloggen</span>
          </button>
        </div>
      </motion.div>

      <div className="flex-1 p-4 space-y-6">
        {/* Account Summary */}
        <motion.div
          className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 className="text-white font-bold text-xl mb-4">Account overzicht</h2>
          
          {recentOrders.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-white">
                  {recentOrders.reduce((total: number, order: any) => total + (order.leads || 0), 0).toLocaleString()}
                </div>
                <div className="text-white/60 text-sm">Totaal Leads</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-400">
                  {(() => {
                    const totalLeads = recentOrders.reduce((total: number, order: any) => total + (order.leads || 0), 0);
                    const totalConversions = recentOrders.reduce((total: number, order: any) => total + (order.conversions || 0), 0);
                    return totalLeads > 0 ? ((totalConversions / totalLeads) * 100).toFixed(1) : '0.0';
                  })()}%
                </div>
                <div className="text-white/60 text-sm">Conversie Rate</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-400">
                  €{recentOrders.reduce((total: number, order: any) => {
                    const amount = parseFloat(order.amount.replace('€', '').replace('K', '000'));
                    return total + (isNaN(amount) ? 0 : amount);
                  }, 0).toLocaleString()}
                </div>
                <div className="text-white/60 text-sm">Gegenereerde Omzet</div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <PlusIcon className="w-8 h-8 text-white/60" />
              </div>
              <h3 className="text-white/80 text-lg font-medium mb-2">Start uw leadgeneratie reis</h3>
              <p className="text-white/60 text-sm">
                Maak uw eerste bestelling en zie hier uw resultaten verschijnen!
              </p>
            </div>
          )}
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {quickActions
            .filter(action => {
              // Always show non-account actions
              if (!action.requiresAccount) return true;
              
              // For leads action, always show if authenticated (regardless of guest status)
              if (action.action === 'leads') return isAuthenticated;
              
              // For other account-required actions, show if user is authenticated and not a guest
              return isAuthenticated && user && !user.isGuest;
            })
            .map((action, index) => {
            const Icon = action.icon;
            return (
              <motion.button
                key={action.action}
                onClick={() => handleQuickAction(action.action)}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 text-left hover:bg-white/20 transition-all group"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-start space-x-4">
                  <div className={`w-12 h-12 ${action.color} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-white font-semibold mb-1">{action.title}</h3>
                    <p className="text-white/70 text-sm">{action.description}</p>
                  </div>
                  <svg className="w-5 h-5 text-white/40 group-hover:text-white/80 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </motion.button>
            );
          })}
        </motion.div>

        {/* Recent Orders */}
        <motion.div
          className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-white font-bold text-xl">Recente bestellingen</h2>
            <button
              onClick={onStartChat}
              className="text-brand-pink hover:text-brand-orange transition-colors text-sm"
            >
              Nieuwe bestelling →
            </button>
          </div>

          {recentOrders.length > 0 ? (
            <div className="space-y-4">
              {recentOrders.map((order: any, index: number) => (
                <motion.div
                  key={order.id}
                  className="bg-white/5 rounded-xl p-4 border border-white/10"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <div className="text-white font-medium">{order.type}</div>
                      <div className="text-white/60 text-sm">{order.id} • {order.date}</div>
                    </div>
                    <div className={`
                      px-3 py-1 rounded-full text-xs font-medium
                      ${order.status === 'geleverd' 
                        ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                        : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                      }
                    `}>
                      {order.status === 'geleverd' ? (
                        <div className="flex items-center space-x-1">
                          <CheckCircleIcon className="w-3 h-3" />
                          <span>Geleverd</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-1">
                          <ClockIcon className="w-3 h-3" />
                          <span>Actief</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <div className="text-white/60">Leads</div>
                      <div className="text-white font-medium">{order.leads}/{order.quantity}</div>
                    </div>
                                         <div>
                       <div className="text-white/60">Conversies</div>
                       <div className="text-white font-medium">{order.conversions}</div>
                     </div>
                    <div>
                      <div className="text-white/60">Waarde</div>
                      <div className="text-white font-medium">{order.amount}</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div
              className="text-center py-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <PlusIcon className="w-8 h-8 text-white/60" />
              </div>
              <h3 className="text-white/80 text-lg font-medium mb-2">Nog geen bestellingen</h3>
              <p className="text-white/60 text-sm mb-6">
                Maak uw eerste bestelling en begin met het genereren van leads!
              </p>
              <motion.button
                onClick={onStartChat}
                className="chat-button inline-flex items-center space-x-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <PlusIcon className="w-5 h-5" />
                <span>Eerste Bestelling via Lisa</span>
              </motion.button>
            </motion.div>
          )}
        </motion.div>

        {/* Reorder CTA */}
        <motion.div
          className="bg-gradient-to-r from-brand-pink/20 to-brand-orange/20 rounded-2xl p-6 border border-brand-pink/30 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <h3 className="text-white font-bold text-xl mb-2">
            Klaar voor meer leads? 🚀
          </h3>
          <p className="text-white/80 mb-4">
            Gebaseerd op uw geschiedenis raden we aan: meer exclusieve thuisbatterij leads
          </p>
          <motion.button
            onClick={onStartChat}
            className="chat-button inline-flex items-center space-x-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <PlusIcon className="w-5 h-5" />
            <span>Nieuwe Bestelling via Lisa</span>
          </motion.button>
        </motion.div>

        {/* Leads section removed - now on dedicated page */}
      </div>
    </div>
  );
}
