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
  const [useFreeFormTest, setUseFreeFormTest] = useState(false); // Default to template (more reliable)
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
      console.log('💾 Saving WhatsApp config:', { customerId, config: { enabled: config.enabled, businessName: config.businessName } });
      
      const response = await fetch('/api/whatsapp/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerId, config })
      });

      console.log('📡 Save response status:', response.status);
      console.log('📡 Save response ok:', response.ok);
      
      if (response.ok) {
        const result = await response.json();
        console.log('✅ Config saved successfully:', result);
        console.log('✅ Saved config details:', { 
          enabled: result.config?.enabled, 
          businessName: result.config?.businessName 
        });
        
        // Update local state with the saved config to ensure consistency
        if (result.config) {
          setConfig(result.config);
          console.log('✅ Local state updated with saved config:', { enabled: result.config.enabled });
        }
        
        alert('✅ WhatsApp configuratie opgeslagen!');
      } else if (response.status === 402) {
        // Payment required for own number setup
        console.log('💳 Payment required for own number setup');
        setShowSetupModal(true);
      } else {
        console.error('❌ WhatsApp config save failed with status:', response.status);
        const error = await response.json().catch(() => ({ error: 'Failed to parse error response' }));
        console.error('❌ WhatsApp config save error details:', error);
        alert(`❌ Fout bij opslaan: ${error.error || 'Server error ' + response.status}`);
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
      console.log('📡 Config response status:', configResponse.status);
      console.log('📡 Config response ok:', configResponse.ok);
      
      if (!configResponse.ok) {
        console.error('❌ Failed to get fresh config, status:', configResponse.status);
        alert('❌ Kon WhatsApp configuratie niet ophalen');
        return;
      }
      
      const configData = await configResponse.json();
      console.log('📡 Config response data:', configData);
      const { config: freshConfig } = configData;
      
      console.log('📡 Fresh config details:', { 
        enabled: freshConfig?.enabled, 
        businessName: freshConfig?.businessName,
        useOwnNumber: freshConfig?.useOwnNumber 
      });
      
      if (!freshConfig || !freshConfig.enabled) {
        console.error('❌ WhatsApp not enabled in fresh config:', freshConfig);
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
          product: 'Test Product',
          useFreeForm: useFreeFormTest // Use toggle setting for test
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
          className="bg-white rounded-xl sm:rounded-2xl shadow-2xl max-w-4xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto mx-2 sm:mx-0"
        >
          <div className="p-4 sm:p-6">
            {/* Header - Mobile Optimized */}
            <div className="flex justify-between items-start sm:items-center mb-4 sm:mb-6">
              <div className="flex items-center space-x-2 sm:space-x-3 flex-1">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-500/20 rounded-lg sm:rounded-xl flex items-center justify-center">
                  <ChatBubbleLeftRightIcon className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-lg sm:text-2xl font-bold text-gray-900">WhatsApp Business API</h3>
                  <p className="text-sm sm:text-base text-gray-600 hidden sm:block">Configureer automatische WhatsApp berichten</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1"
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
              <div className="space-y-4 sm:space-y-8">
                {/* Enable/Disable Toggle - Mobile Optimized */}
                <div className="bg-gray-50 rounded-lg sm:rounded-xl p-4 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-base sm:text-lg font-semibold text-gray-900">WhatsApp Berichten</h4>
                      <p className="text-sm sm:text-base text-gray-600">Schakel automatische WhatsApp berichten in/uit</p>
                    </div>
                    <button
                      onClick={() => setConfig({ ...config, enabled: !config.enabled })}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0 ml-3 ${
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

                {/* WhatsApp Number Selection - Mobile Optimized */}
                <div className="bg-gray-50 rounded-lg sm:rounded-xl p-4 sm:p-6">
                  <h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">WhatsApp Nummer</h4>
                  
                  {/* Warmeleads Option */}
                  <div className="mb-3 sm:mb-4">
                    <label className="flex items-start space-x-3 p-3 sm:p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name="whatsappNumber"
                        checked={!config.useOwnNumber}
                        onChange={() => setConfig({ ...config, useOwnNumber: false })}
                        className="h-4 w-4 text-green-600 mt-1 flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-2">
                          <div className="flex items-center space-x-2">
                            <PhoneIcon className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 flex-shrink-0" />
                            <span className="font-medium text-gray-900 text-sm sm:text-base">Warmeleads WhatsApp Business</span>
                          </div>
                          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full self-start">GRATIS</span>
                        </div>
                        <p className="text-xs sm:text-sm text-gray-600 mt-1">
                          Berichten worden verzonden via Warmeleads WhatsApp Business nummer
                        </p>
                        <p className="text-xs sm:text-sm text-gray-500 mt-1">
                          📱 {config.warmeleadsNumber}
                        </p>
                      </div>
                    </label>
                  </div>

                  {/* Customer Own Number Option */}
                  <div>
                    <label className="flex items-start space-x-3 p-3 sm:p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name="whatsappNumber"
                        checked={config.useOwnNumber}
                        onChange={() => setConfig({ ...config, useOwnNumber: true })}
                        className="h-4 w-4 text-green-600 mt-1 flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-2">
                          <div className="flex items-center space-x-2">
                            <PhoneIcon className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 flex-shrink-0" />
                            <span className="font-medium text-gray-900 text-sm sm:text-base">Eigen WhatsApp Business</span>
                          </div>
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full self-start">€750 SETUP</span>
                        </div>
                        <p className="text-xs sm:text-sm text-gray-600 mt-1">
                          Koppel je eigen WhatsApp Business nummer voor volledige controle
                        </p>
                        {!config.billing?.setupPaid && (
                          <div className="flex items-center space-x-2 mt-2">
                            <ExclamationTriangleIcon className="w-4 h-4 text-amber-500 flex-shrink-0" />
                            <span className="text-xs sm:text-sm text-amber-600">
                              Setup vereist: €750 eenmalige kosten
                            </span>
                          </div>
                        )}
                      </div>
                    </label>
                  </div>
                </div>

                {/* Business Information - Mobile Optimized */}
                <div className="bg-gray-50 rounded-lg sm:rounded-xl p-4 sm:p-6">
                  <h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Bedrijfsinformatie</h4>
                  <div className="space-y-3 sm:space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Bedrijfsnaam
                      </label>
                      <input
                        type="text"
                        value={config.businessName}
                        onChange={(e) => setConfig({ ...config, businessName: e.target.value })}
                        placeholder="Uw bedrijfsnaam"
                        className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
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
                          className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Message Templates - Mobile Optimized */}
                <div className="bg-gray-50 rounded-lg sm:rounded-xl p-4 sm:p-6">
                  <h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Bericht Templates</h4>
                  <div className="space-y-3 sm:space-y-4">
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
                        rows={4}
                        className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none"
                        placeholder="Bericht template voor nieuwe leads..."
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Gebruik {`{{leadName}}`}, {`{{product}}`}, {`{{businessName}}`} voor variabelen
                      </p>
                    </div>
                  </div>
                </div>

                {/* Timing Settings - Mobile Optimized */}
                <div className="bg-gray-50 rounded-lg sm:rounded-xl p-4 sm:p-6">
                  <h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Timing Instellingen</h4>
                  <div className="space-y-3 sm:space-y-4">
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
                        className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      >
                        <option value="immediate">Direct</option>
                        <option value="1hour">Na 1 uur</option>
                        <option value="24hours">Na 24 uur</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Test Message - Mobile Optimized */}
                <div className="bg-gray-50 rounded-lg sm:rounded-xl p-4 sm:p-6">
                  <h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Test Bericht</h4>
                  
                  {/* Message Type Toggle */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bericht Type
                    </label>
                    <div className="flex space-x-4">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="messageType"
                          checked={useFreeFormTest}
                          onChange={() => setUseFreeFormTest(true)}
                          className="mr-2 text-green-600 focus:ring-green-500"
                        />
                        <span className="text-sm text-gray-700">Free-form (Direct)</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="messageType"
                          checked={!useFreeFormTest}
                          onChange={() => setUseFreeFormTest(false)}
                          className="mr-2 text-green-600 focus:ring-green-500"
                        />
                        <span className="text-sm text-gray-700">Template</span>
                      </label>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {useFreeFormTest 
                        ? '⚠️ Direct tekst bericht - werkt ALLEEN binnen 24u na klant bericht!' 
                        : '✅ Gebruikt WhatsApp template (altijd werkend)'}
                    </p>
                    {useFreeFormTest && (
                      <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-xs text-yellow-800">
                          <strong>Let op:</strong> Free-form berichten werken alleen binnen 24 uur nadat de klant jou een bericht heeft gestuurd. 
                          Voor nieuwe gesprekken moet je template berichten gebruiken.
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-3 sm:space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Test Telefoonnummer
                      </label>
                      <input
                        type="text"
                        value={testPhone}
                        onChange={(e) => setTestPhone(e.target.value)}
                        placeholder="+31 6 12345678"
                        className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
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
                        className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none"
                        placeholder={useFreeFormTest 
                          ? "Hallo! Dit is een test bericht van WarmeLeads. Hoe gaat het met je?" 
                          : "Test bericht (gebruikt goedgekeurde template)..."
                        }
                      />
                    </div>
                    <button
                      onClick={sendTestMessage}
                      className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm sm:text-base"
                    >
                      📤 Verstuur Test Bericht
                    </button>
                  </div>
                </div>

                {/* Usage Stats - Mobile Optimized */}
                <div className="bg-gray-50 rounded-lg sm:rounded-xl p-4 sm:p-6">
                  <h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Gebruik Statistieken</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                    <div className="text-center">
                      <div className="text-xl sm:text-2xl font-bold text-green-600">{config.usage.messagesSent}</div>
                      <div className="text-xs sm:text-sm text-gray-600">Verzonden</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl sm:text-2xl font-bold text-blue-600">{config.usage.messagesDelivered}</div>
                      <div className="text-xs sm:text-sm text-gray-600">Bezorgd</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl sm:text-2xl font-bold text-purple-600">{config.usage.messagesRead}</div>
                      <div className="text-xs sm:text-sm text-gray-600">Gelezen</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl sm:text-2xl font-bold text-red-600">{config.usage.messagesFailed}</div>
                      <div className="text-xs sm:text-sm text-gray-600">Mislukt</div>
                    </div>
                  </div>
                </div>

                {/* Save Button - Mobile Optimized */}
                <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3">
                  <button
                    onClick={onClose}
                    className="w-full sm:w-auto px-6 py-2.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-medium transition-colors text-sm sm:text-base"
                  >
                    Annuleren
                  </button>
                  <button
                    onClick={saveConfig}
                    disabled={isSaving}
                    className="w-full sm:w-auto px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold transition-colors disabled:opacity-50 text-sm sm:text-base"
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
