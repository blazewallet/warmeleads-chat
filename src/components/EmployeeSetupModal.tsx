'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  XMarkIcon, 
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { useAuthStore } from '@/lib/auth';

interface EmployeeSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  employeeEmail: string;
  onSuccess: () => void;
}

export function EmployeeSetupModal({ isOpen, onClose, employeeEmail, onSuccess }: EmployeeSetupModalProps) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const { login } = useAuthStore();

  const validatePassword = (pwd: string) => {
    if (pwd.length < 6) {
      return 'Wachtwoord moet minimaal 6 karakters lang zijn';
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!password || !confirmPassword) {
      setError('Voer een wachtwoord in en bevestig het');
      return;
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    if (password !== confirmPassword) {
      setError('Wachtwoorden komen niet overeen');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/activate-employee', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: employeeEmail,
          password: password
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccess(true);
        
        // Auto login after account activation
        setTimeout(async () => {
          try {
            await login(employeeEmail, password);
            onSuccess();
          } catch (loginError) {
            console.error('Login failed after activation:', loginError);
            onSuccess(); // Still close modal and redirect to login
          }
        }, 1500);
      } else {
        setError(data.error || 'Fout bij het activeren van uw account');
      }
    } catch (err) {
      setError('Netwerkfout of server niet bereikbaar');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="fixed inset-0 z-50 overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex min-h-full items-center justify-center p-4">
          <div className="relative w-full max-w-md bg-gradient-to-br from-orange-50 to-red-50 rounded-3xl shadow-2xl">
            {/* Header */}
            <div className="relative bg-gradient-to-r from-orange-600 to-red-600 text-white px-8 py-6 rounded-t-3xl">
              <button
                onClick={onClose}
                className="absolute top-6 right-6 p-2 hover:bg-white/20 rounded-full transition-colors"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
              
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                  <LockClosedIcon className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Account Aanmaken</h2>
                  <p className="text-orange-100 mt-1">
                    Stel uw wachtwoord in voor {employeeEmail}
                  </p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-8">
              {success ? (
                <div className="text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="mb-6"
                  >
                    <CheckCircleIcon className="w-16 h-16 text-green-600 mx-auto" />
                  </motion.div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Account Geactiveerd!</h3>
                  <p className="text-gray-600 mb-6">
                    Uw account is succesvol geactiveerd. U wordt nu ingelogd...
                  </p>
                </div>
              ) : (
                <>
                  {error && (
                    <div className="mb-6 p-4 bg-red-100 border-2 border-red-300 rounded-xl text-red-700">
                      {error}
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email adres
                      </label>
                      <input
                        type="email"
                        value={employeeEmail}
                        disabled
                        className="w-full px-3 py-3 bg-gray-100 border-2 border-gray-300 rounded-xl text-gray-600"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nieuw wachtwoord
                      </label>
                      <div className="relative">
                        <LockClosedIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full pl-10 pr-12 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-orange-500"
                          placeholder="Minimaal 6 karakters"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showPassword ? (
                            <EyeSlashIcon className="w-5 h-5" />
                          ) : (
                            <EyeIcon className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Bevestig wachtwoord
                      </label>
                      <div className="relative">
                        <LockClosedIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="w-full pl-10 pr-12 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-orange-500"
                          placeholder="Herhaal uw wachtwoord"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showConfirmPassword ? (
                            <EyeSlashIcon className="w-5 h-5" />
                          ) : (
                            <EyeIcon className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    </div>

                    <motion.button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-bold py-3 px-4 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {isLoading ? 'Account activeren...' : 'Account Aanmaken'}
                    </motion.button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
