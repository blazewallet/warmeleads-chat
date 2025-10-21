'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeftIcon,
  EyeIcon,
  EyeSlashIcon,
  UserIcon,
  LockClosedIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline';
import { useAuthStore } from '../lib/auth';
import { ADMIN_CONFIG } from '@/config/admin';

interface LoginFormProps {
  onBack: () => void;
  onSwitchToRegister: () => void;
  onSwitchToGuest: () => void;
  onSuccess: () => void;
}

export function LoginForm({ onBack, onSwitchToRegister, onSwitchToGuest, onSuccess }: LoginFormProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    company: '',
    phone: ''
  });

  const { login, register, isLoading, error, clearError, setupPassword, needsPasswordSetup, passwordSetupEmail } = useAuthStore();

  // Auto-fill email when password setup is needed
  useEffect(() => {
    if (needsPasswordSetup && passwordSetupEmail && !formData.email) {
      setFormData(prev => ({ ...prev, email: passwordSetupEmail }));
      setIsLogin(false); // Switch to registration-like view for password setup
    }
  }, [needsPasswordSetup, passwordSetupEmail, formData.email]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    try {
      // Check if we're in password setup mode first
      if (needsPasswordSetup && passwordSetupEmail) {
        await setupPassword(passwordSetupEmail, formData.password);
        onSuccess();
        return;
      }

      if (isLogin) {
        await login(formData.email, formData.password);
      } else {
        await register({
          email: formData.email,
          password: formData.password,
          name: formData.name,
          company: formData.company,
          phone: formData.phone
        });
      }
      onSuccess();
    } catch (error) {
      // Check if this is a password reset error
      if (error instanceof Error && error.message === 'PASSWORD_RESET_REQUIRED') {
        // The login function will set needsPasswordSetup state
        return;
      }
      // Other errors are handled by the store
    }
  };

  const handlePasswordSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    try {
      if (!passwordSetupEmail) {
        throw new Error('Geen email beschikbaar voor password setup');
      }
      
      await setupPassword(passwordSetupEmail, formData.password);
      onSuccess();
    } catch (error) {
      // Error is handled by the store
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <motion.div
      className="min-h-screen flex flex-col"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Header */}
      <motion.div
        className="flex items-center p-4 glass-effect"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-white/80 hover:text-white transition-colors"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          <span>Terug</span>
        </button>
        
        <div className="text-center flex-1">
          <h1 className="text-white font-bold text-xl">
            {needsPasswordSetup ? 'Wachtwoord instellen' : (isLogin ? 'Inloggen' : 'Account aanmaken')}
          </h1>
          <p className="text-white/60 text-sm">
            {needsPasswordSetup 
              ? 'Stel een wachtwoord in voor je account' 
              : (isLogin ? 'Log in op je account' : 'Maak een nieuw account aan')
            }
          </p>
        </div>
      </motion.div>

      <div className="flex-1 flex items-center justify-center p-4">
        <motion.div
          className="w-full max-w-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {/* Form Card */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
            <form onSubmit={needsPasswordSetup ? handlePasswordSetup : handleSubmit} className="space-y-6">
              {/* Email Field - Hidden or disabled for password setup */}
              {!needsPasswordSetup && (
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">
                    Email adres
                  </label>
                  <div className="relative">
                    <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-brand-pink/50 focus:border-transparent transition-all"
                      placeholder="jouw@email.nl"
                      required
                    />
                  </div>
                </div>
              )}
              
              {/* Show email in password setup mode */}
              {needsPasswordSetup && passwordSetupEmail && (
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">
                    Email adres
                  </label>
                  <div className="relative">
                    <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
                    <input
                      type="email"
                      value={passwordSetupEmail}
                      disabled
                      className="w-full pl-10 pr-4 py-3 bg-white/20 border border-white/20 rounded-xl text-white/60"
                    />
                  </div>
                  <p className="text-white/60 text-xs mt-1">Stel een wachtwoord in voor dit account</p>
                </div>
              )}

              {/* Password Field */}
              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">
                  {needsPasswordSetup ? 'Nieuw wachtwoord' : 'Wachtwoord'}
                </label>
                <div className="relative">
                  <LockClosedIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className="w-full pl-10 pr-12 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-brand-pink/50 focus:border-transparent transition-all"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/40 hover:text-white/60 transition-colors"
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="w-5 h-5" />
                    ) : (
                      <EyeIcon className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Additional fields for registration - only show when not in password setup */}
              {!isLogin && !needsPasswordSetup && (
                <>
                  <div>
                    <label className="block text-white/80 text-sm font-medium mb-2">
                      Naam
                    </label>
                    <div className="relative">
                      <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-brand-pink/50 focus:border-transparent transition-all"
                        placeholder="Jouw naam"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-white/80 text-sm font-medium mb-2">
                      Bedrijfsnaam (optioneel)
                    </label>
                    <input
                      type="text"
                      value={formData.company}
                      onChange={(e) => handleInputChange('company', e.target.value)}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-brand-pink/50 focus:border-transparent transition-all"
                      placeholder="Jouw bedrijf"
                    />
                  </div>

                  <div>
                    <label className="block text-white/80 text-sm font-medium mb-2">
                      Telefoonnummer (optioneel)
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-brand-pink/50 focus:border-transparent transition-all"
                      placeholder="06 12345678"
                    />
                  </div>
                </>
              )}

              {/* Error Message */}
              {error && (
                <motion.div
                  className="bg-red-500/20 border border-red-500/30 rounded-xl p-4 text-red-400 text-sm"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {error}
                </motion.div>
              )}

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={isLoading}
                className="w-full chat-button py-3 text-white font-semibold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                whileHover={{ scale: isLoading ? 1 : 1.02 }}
                whileTap={{ scale: isLoading ? 1 : 0.98 }}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>
                      {needsPasswordSetup 
                        ? 'Wachtwoord instellen...' 
                        : (isLogin ? 'Inloggen...' : 'Aanmaken...')
                      }
                    </span>
                  </div>
                ) : (
                  <span>
                    {needsPasswordSetup 
                      ? 'Wachtwoord instellen' 
                      : (isLogin ? 'Inloggen' : 'Account aanmaken')
                    }
                  </span>
                )}
              </motion.button>
            </form>

            {/* Demo Info */}
            {ADMIN_CONFIG.demoAccount && (
              <div className="mt-6 p-4 bg-blue-500/20 border border-blue-500/30 rounded-xl">
                <p className="text-blue-300 text-sm text-center">
                  <strong>Demo account:</strong><br />
                  Email: {ADMIN_CONFIG.demoAccount.email}<br />
                  Wachtwoord: {ADMIN_CONFIG.demoAccount.password}
                </p>
              </div>
            )}
          </div>

          {/* Action Links - Hide during password setup */}
          {!needsPasswordSetup && (
            <div className="mt-6 text-center space-y-4">
              <motion.button
                onClick={() => setIsLogin(!isLogin)}
                className="text-white/60 hover:text-white transition-colors text-sm"
                whileHover={{ scale: 1.05 }}
              >
                {isLogin ? 'Nog geen account? Maak er een aan' : 'Al een account? Log in'}
              </motion.button>

              <div className="text-white/40 text-xs">of</div>

              <motion.button
                onClick={onSwitchToGuest}
                className="text-brand-pink hover:text-brand-orange transition-colors text-sm font-medium"
                whileHover={{ scale: 1.05 }}
              >
                Doorgaan als gast (geen account nodig)
              </motion.button>
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}
