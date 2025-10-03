/**
 * WHATSAPP SETTINGS COMPONENT
 * 
 * Settings interface for WhatsApp Business API
 * - Warmeleads WhatsApp (default, gratis)
 * - Customer own WhatsApp Business (premium, €750 setup)
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PhoneIcon,
  CogIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  CurrencyEuroIcon,
  ClockIcon,
  ChatBubbleLeftRightIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { WhatsAppConfig, DEFAULT_TEMPLATES } from '@/lib/whatsappAPI';

interface WhatsAppSettingsProps {
  customerId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function WhatsAppSettings({ customerId, isOpen, onClose }: WhatsAppSettingsProps) {
  const [config, setConfig] = useState<WhatsAppConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [testMessage, setTestMessage] = useState('');
  const [testPhone, setTestPhone] = useState('');
  const [showSetupModal, setShowSetupModal] = useState(false);

  // Load WhatsApp config
  useEffect(() => {
    if (isOpen && customerId) {
      loadConfig();
    }
  }, [isOpen, customerId]);

  const loadConfig = async () => {
    try {
      setIsLoading(true);
      console.log(`🔄 Loading WhatsApp config for customer: ${customerId}`);
      
      if (!customerId) {
        console.error('❌ No customerId provided!');
        throw new Error('No customerId provided');
      }
      
      const response = await fetch(`/api/whatsapp/config?customerId=${customerId}`);
      console.log(`📡 WhatsApp config response status: ${response.status}`);
      console.log(`📡 WhatsApp config response headers:`, response.headers);
      
      if (response.ok) {
        const data = await response.json();
        console.log(`✅ WhatsApp config response data:`, data);
        
        if (data.config) {
          console.log(`✅ WhatsApp config loaded:`, data.config);
          setConfig(data.config);
        } else {
          console.error('❌ No config in response:', data);
          throw new Error('No config in response');
        }
      } else {
        console.error(`❌ WhatsApp config failed: ${response.status}`);
        const error = await response.json().catch(() => ({ error: 'Failed to parse error response' }));
        console.error('Error details:', error);
        throw new Error(`API error: ${response.status}`);
      }
    } catch (error) {
      console.error('❌ Error loading WhatsApp config:', error);
      // Set default config on error
      const defaultConfig = {
        customerId,
        enabled: false,
        useOwnNumber: false,
        businessName: '',
          warmeleadsNumber: '+31850477067',
        templates: DEFAULT_TEMPLATES,
        timing: {
          newLead: 'immediate' as const,
          followUp: 24,
          reminder: 72
        },
        usage: {
          messagesSent: 0,
          messagesDelivered: 0,
          messagesRead: 0,
          messagesFailed: 0,
          lastReset: new Date().toISOString()
        },
        billing: {
          plan: 'basic' as const,
          messagesLimit: 50,
          setupPaid: false
        }
      };
      console.log('🔄 Setting default config:', defaultConfig);
      setConfig(defaultConfig);
    } finally {
      console.log('🔄 Setting isLoading to false');
      setIsLoading(false);
    }
  };

  const saveConfig = async () => {
    if (!config) return;

    try {
      setIsSaving(true);
      const response = await fetch('/api/whatsapp/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerId, config })
      });

      if (response.ok) {
        alert('✅ WhatsApp configuratie opgeslagen!');
        // Don't reload config, just update local state
        console.log('✅ Config saved successfully, keeping local state');
      } else if (response.status === 402) {
        // Payment required for own number setup
        setShowSetupModal(true);
      } else {
        const error = await response.json();
        console.error('❌ WhatsApp config save error:', error);
        alert(`❌ Fout: ${error.error}`);
      }
    } catch (error) {
      console.error('Error saving WhatsApp config:', error);
      alert('❌ Fout bij opslaan van configuratie');
    } finally {
      setIsSaving(false);
    }
  };

  const sendTestMessage = async () => {
    if (!testPhone || !testMessage) {
      alert('❌ Voer telefoonnummer en bericht in');
      return;
    }

    try {
      // Get fresh config from server to ensure we have the latest enabled status
      console.log('📤 Getting fresh config from server...');
      const configResponse = await fetch(`/api/whatsapp/config?customerId=${customerId}`);
      if (!configResponse.ok) {
        alert('❌ Kon WhatsApp configuratie niet ophalen');
        return;
      }
      const { config: freshConfig } = await configResponse.json();
      
      if (!freshConfig || !freshConfig.enabled) {
        alert('❌ WhatsApp is niet ingeschakeld. Schakel eerst WhatsApp in en sla op.');
        return;
      }

      console.log('📤 Sending test message:', { customerId, testPhone, testMessage, freshConfig });
      
      const response = await fetch('/api/whatsapp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId,
          phoneNumber: testPhone,
          message: testMessage,
          leadName: 'Test Lead',
          product: 'Test Product'
        })
      });

      if (response.ok) {
        alert('✅ Test bericht verzonden!');
        setTestMessage('');
        setTestPhone('');
      } else {
        const error = await response.json();
        console.error('❌ Test message error:', error);
        alert(`❌ Fout: ${error.error}`);
      }
    } catch (error) {
      console.error('Error sending test message:', error);
      alert('❌ Fout bij verzenden van test bericht');
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        >
          <div className="p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                  <ChatBubbleLeftRightIcon className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">WhatsApp Business API</h3>
                  <p className="text-gray-600">Configureer automatische WhatsApp berichten</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <XCircleIcon className="w-6 h-6" />
              </button>
            </div>

            {isLoading ? (
              <div className="text-center py-8">
                <div className="w-8 h-8 border-4 border-green-500/30 border-t-green-500 rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600">WhatsApp configuratie laden...</p>
              </div>
            ) : config ? (
              <div className="space-y-8">
                {/* Enable/Disable Toggle */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900">WhatsApp Berichten</h4>
                      <p className="text-gray-600">Schakel automatische WhatsApp berichten in/uit</p>
                    </div>
                    <button
                      onClick={() => setConfig({ ...config, enabled: !config.enabled })}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        config.enabled ? 'bg-green-600' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          config.enabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* WhatsApp Number Selection */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">WhatsApp Nummer</h4>
                  
                  {/* Warmeleads Option */}
                  <div className="mb-4">
                    <label className="flex items-center space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name="whatsappNumber"
                        checked={!config.useOwnNumber}
                        onChange={() => setConfig({ ...config, useOwnNumber: false })}
                        className="h-4 w-4 text-green-600"
                      />
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <PhoneIcon className="w-5 h-5 text-green-600" />
                          <span className="font-medium text-gray-900">Warmeleads WhatsApp Business</span>
                          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">GRATIS</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          Berichten worden verzonden via Warmeleads WhatsApp Business nummer
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          📱 {config.warmeleadsNumber}
                        </p>
                      </div>
                    </label>
                  </div>

                  {/* Customer Own Number Option */}
                  <div>
                    <label className="flex items-center space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name="whatsappNumber"
                        checked={config.useOwnNumber}
                        onChange={() => setConfig({ ...config, useOwnNumber: true })}
                        className="h-4 w-4 text-green-600"
                      />
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <PhoneIcon className="w-5 h-5 text-blue-600" />
                          <span className="font-medium text-gray-900">Eigen WhatsApp Business</span>
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">€750 SETUP</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          Koppel je eigen WhatsApp Business nummer voor volledige controle
                        </p>
                        {!config.billing?.setupPaid && (
                          <div className="flex items-center space-x-2 mt-2">
                            <ExclamationTriangleIcon className="w-4 h-4 text-amber-500" />
                            <span className="text-sm text-amber-600">
                              Setup vereist: €750 eenmalige kosten
                            </span>
                          </div>
                        )}
                      </div>
                    </label>
                  </div>
                </div>

                {/* Business Information */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Bedrijfsinformatie</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Bedrijfsnaam
                      </label>
                      <input
                        type="text"
                        value={config.businessName}
                        onChange={(e) => setConfig({ ...config, businessName: e.target.value })}
                        placeholder="Uw bedrijfsnaam"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      />
                    </div>
                    {config.useOwnNumber && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          WhatsApp Business Nummer
                        </label>
                        <input
                          type="text"
                          value={config.businessPhone || ''}
                          onChange={(e) => setConfig({ ...config, businessPhone: e.target.value })}
                          placeholder="+31 6 12345678"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Message Templates */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Bericht Templates</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nieuwe Lead Template
                      </label>
                      <textarea
                        value={config.templates.newLead}
                        onChange={(e) => setConfig({ 
                          ...config, 
                          templates: { ...config.templates, newLead: e.target.value }
                        })}
                        rows={6}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        placeholder="Bericht template voor nieuwe leads..."
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Gebruik {`{{leadName}}`}, {`{{product}}`}, {`{{businessName}}`} voor variabelen
                      </p>
                    </div>
                  </div>
                </div>

                {/* Timing Settings */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Timing Instellingen</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nieuwe Lead Bericht
                      </label>
                      <select
                        value={config.timing.newLead}
                        onChange={(e) => setConfig({ 
                          ...config, 
                          timing: { ...config.timing, newLead: e.target.value as any }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      >
                        <option value="immediate">Direct</option>
                        <option value="1hour">Na 1 uur</option>
                        <option value="24hours">Na 24 uur</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Test Message */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Test Bericht</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Test Telefoonnummer
                      </label>
                      <input
                        type="text"
                        value={testPhone}
                        onChange={(e) => setTestPhone(e.target.value)}
                        placeholder="+31 6 12345678"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Test Bericht
                      </label>
                      <textarea
                        value={testMessage}
                        onChange={(e) => setTestMessage(e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        placeholder="Test bericht..."
                      />
                    </div>
                    <button
                      onClick={sendTestMessage}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                      📤 Verstuur Test Bericht
                    </button>
                  </div>
                </div>

                {/* Usage Stats */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Gebruik Statistieken</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{config.usage.messagesSent}</div>
                      <div className="text-sm text-gray-600">Verzonden</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{config.usage.messagesDelivered}</div>
                      <div className="text-sm text-gray-600">Bezorgd</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">{config.usage.messagesRead}</div>
                      <div className="text-sm text-gray-600">Gelezen</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">{config.usage.messagesFailed}</div>
                      <div className="text-sm text-gray-600">Mislukt</div>
                    </div>
                  </div>
                </div>

                {/* Save Button */}
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={onClose}
                    className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-medium transition-colors"
                  >
                    Annuleren
                  </button>
                  <button
                    onClick={saveConfig}
                    disabled={isSaving}
                    className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold transition-colors disabled:opacity-50"
                  >
                    {isSaving ? 'Opslaan...' : 'Opslaan'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <XCircleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
                <p className="text-gray-600">Fout bij laden van WhatsApp configuratie</p>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
