'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  XMarkIcon, 
  PlusIcon, 
  UserPlusIcon,
  TrashIcon,
  PencilIcon,
  CheckIcon
} from '@heroicons/react/24/outline';
import { useAuthStore, type UserPermissions } from '@/lib/auth';

interface EmployeeAccount {
  email: string;
  name: string;
  role: 'employee';
  permissions: UserPermissions;
  invitedAt: string;
  acceptedAt?: string;
  isActive: boolean;
}

interface Company {
  id: string;
  ownerEmail: string;
  companyName: string;
  employees: EmployeeAccount[];
  createdAt: string;
}

interface EmployeeManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
}

export function EmployeeManagementModal({ isOpen, onClose, user }: EmployeeManagementModalProps) {
  const [company, setCompany] = useState<Company | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteData, setInviteData] = useState({
    email: '',
    name: '',
    permissions: {
      canViewLeads: true,
      canViewOrders: true,
      canManageEmployees: false,
      canCheckout: false,
    }
  });

  // Load company data when modal opens - always fetch fresh data
  useEffect(() => {
    if (isOpen && user?.email) {
      console.log('🔄 Modal opened, loading fresh company data for:', user.email);
      loadCompanyData();
    }
  }, [isOpen, user?.email]);

  const loadCompanyData = async (clearMessages = true) => {
    setIsLoading(true);
    setError(null);
    if (clearMessages) {
      setSuccess(null);
    }
    
    try {
      console.log('🔄 Loading company data for:', user.email, 'at', new Date().toISOString());
      
      // Add cache-busting parameter to force fresh data
      const cacheBuster = `t=${Date.now()}`;
      const response = await fetch(`/api/auth/company?ownerEmail=${encodeURIComponent(user.email)}&${cacheBuster}`, {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      
      const data = await response.json();
      
      console.log('🔄 Company data response:', { 
        ok: response.ok, 
        success: data.success, 
        employees: data.company?.employees?.length,
        timestamp: new Date().toISOString()
      });
      
      if (response.ok && data.success) {
        // Only update state if we have fresh data that's different from current state
        const newEmployeeCount = data.company?.employees?.length || 0;
        const currentEmployeeCount = company?.employees?.length || 0;
        const newEmployeeEmails = data.company?.employees?.map((emp: any) => emp.email) || [];
        const currentEmployeeEmails = company?.employees?.map((emp: any) => emp.email) || [];
        
        // Check if the employee data has actually changed
        const hasChanged = newEmployeeCount !== currentEmployeeCount || 
          !newEmployeeEmails.every((email, index) => email === currentEmployeeEmails[index]);
        
        if (hasChanged || !company) {
          setCompany(data.company);
          console.log('✅ Company data updated:', { 
            oldCount: currentEmployeeCount,
            newCount: newEmployeeCount,
            oldEmails: currentEmployeeEmails,
            newEmails: newEmployeeEmails
          });
        } else {
          console.log('✅ Company data unchanged, no state update needed:', { 
            employeeCount: newEmployeeCount,
            employeeEmails: newEmployeeEmails
          });
        }
      } else {
        setError(data.error || 'Fout bij het laden van bedrijfsgegevens');
      }
    } catch (err) {
      console.error('❌ Error loading company data:', err);
      setError('Fout bij het laden van bedrijfsgegevens');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInviteEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inviteData.email || !inviteData.name) {
      setError('Email en naam zijn verplicht');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/invite-employee', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ownerEmail: user.email,
          employeeEmail: inviteData.email,
          employeeName: inviteData.name,
          permissions: inviteData.permissions
        })
      });

      const result = await response.json();

      if (response.ok && result.success) {
        console.log('✅ Employee invitation successful, reloading data...');
        
        // Show immediate feedback
        setSuccess(`${inviteData.name} is succesvol uitgenodigd!`);
        
        setShowInviteForm(false);
        setInviteData({
          email: '',
          name: '',
          permissions: {
            canViewLeads: true,
            canViewOrders: true,
            canManageEmployees: false,
            canCheckout: false,
          }
        });
        
        // Wait for the new employee to appear with retries
        const checkForNewEmployee = async (attempt = 1, maxAttempts = 10) => {
          if (attempt > maxAttempts) {
            console.log('⚠️ Max attempts reached, employee may not appear immediately');
            await loadCompanyData(false); // Final load attempt
            return;
          }
          
          console.log(`🔄 Checking for new employee ${result.employee.email} (attempt ${attempt}/${maxAttempts})`);
          
          // Wait before checking (Blob Storage needs time to propagate)
          await new Promise(resolve => setTimeout(resolve, 1000 + (attempt * 500)));
          
          try {
            // Fetch fresh data directly to check
            const cacheBuster = `t=${Date.now()}`;
            const response = await fetch(`/api/auth/company?ownerEmail=${encodeURIComponent(user.email)}&${cacheBuster}`, {
              headers: {
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache'
              }
            });
            
            const data = await response.json();
            
            if (response.ok && data.success && data.company?.employees) {
              const employeeEmails = data.company.employees.map((emp: any) => emp.email) || [];
              const employeeExists = employeeEmails.includes(result.employee.email);
              
              if (employeeExists) {
                console.log(`✅ New employee ${result.employee.email} is now visible! Updating UI...`);
                // Update the state with the fresh data
                setCompany(data.company);
                return;
              } else {
                console.log(`⏳ Employee ${result.employee.email} still not visible, retrying...`, {
                  currentEmployees: employeeEmails,
                  lookingFor: result.employee.email
                });
                await checkForNewEmployee(attempt + 1, maxAttempts);
              }
            } else {
              console.log('❌ Failed to fetch company data for retry:', response.status);
              await checkForNewEmployee(attempt + 1, maxAttempts);
            }
          } catch (error) {
            console.error('❌ Error checking for new employee:', error);
            await checkForNewEmployee(attempt + 1, maxAttempts);
          }
        };
        
        // Start checking for the new employee
        checkForNewEmployee();
        
        // Clear success message after longer delay to account for retries
        setTimeout(() => {
          setSuccess(null);
        }, 15000);
      } else {
        setError(result.error || 'Fout bij het uitnodigen van werknemer');
      }
    } catch (err) {
      setError('Fout bij het uitnodigen van werknemer');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveEmployee = async (employeeEmail: string) => {
    // Find employee name for better confirmation message
    const employee = company?.employees.find(emp => emp.email === employeeEmail);
    const employeeName = employee?.name || employeeEmail;
    
    console.log('🗑️ Delete button clicked for:', { employeeEmail, employeeName, ownerEmail: user.email });
    
    if (!confirm(`Weet je zeker dat je ${employeeName} (${employeeEmail}) wilt verwijderen? Dit kan niet ongedaan worden gemaakt.`)) {
      console.log('🗑️ Delete cancelled by user');
      return;
    }

    console.log('🗑️ Delete confirmed by user, starting deletion...');
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      console.log('🗑️ Attempting to delete employee:', { ownerEmail: user.email, employeeEmail });
      
      const deleteUrl = `/api/auth/company?ownerEmail=${encodeURIComponent(user.email)}&employeeEmail=${encodeURIComponent(employeeEmail)}`;
      console.log('🗑️ Delete URL:', deleteUrl);
      
      const response = await fetch(deleteUrl, { method: 'DELETE' });

      console.log('🗑️ Delete response status:', response.status);
      console.log('🗑️ Delete response ok:', response.ok);
      
      const result = await response.json();
      console.log('🗑️ Delete response result:', result);

      if (response.ok && result.success) {
        console.log('✅ Employee deletion successful, updating UI...');
        
        // Immediately update the local state to remove the employee from UI
        if (company) {
          const updatedCompany = {
            ...company,
            employees: company.employees.filter(emp => emp.email !== employeeEmail)
          };
          setCompany(updatedCompany);
          console.log('✅ Local UI updated immediately:', { 
            beforeCount: company.employees.length, 
            afterCount: updatedCompany.employees.length 
          });
        }
        
        // Show success message
        const successMessage = `${employeeName} is succesvol verwijderd uit het team.`;
        setSuccess(successMessage);
        console.log('✅ Success message set:', successMessage);
        
        // Verify the deletion was successful with retries
        const verifyDeletion = async (attempt = 1, maxAttempts = 5) => {
          if (attempt > maxAttempts) {
            console.log('⚠️ Max verification attempts reached');
            return;
          }
          
          console.log(`🔄 Verifying deletion of ${employeeEmail} (attempt ${attempt}/${maxAttempts})`);
          
          // Wait a bit for Blob Storage to propagate the deletion
          await new Promise(resolve => setTimeout(resolve, 1000 + (attempt * 500)));
          
          try {
            // Fetch fresh data to verify deletion
            const cacheBuster = `t=${Date.now()}`;
            const response = await fetch(`/api/auth/company?ownerEmail=${encodeURIComponent(user.email)}&${cacheBuster}`, {
              headers: {
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache'
              }
            });
            
            const data = await response.json();
            
            if (response.ok && data.success && data.company?.employees) {
              const employeeEmails = data.company.employees.map((emp: any) => emp.email) || [];
              const stillExists = employeeEmails.includes(employeeEmail);
              
              if (!stillExists) {
                console.log(`✅ Employee ${employeeEmail} deletion confirmed and UI updated`);
                // Update the state with the confirmed fresh data
                setCompany(data.company);
              } else {
                console.log(`⏳ Employee ${employeeEmail} still exists in data, retrying verification...`);
                await verifyDeletion(attempt + 1, maxAttempts);
              }
            } else {
              console.log('❌ Failed to fetch company data for verification:', response.status);
            }
          } catch (error) {
            console.error('❌ Error verifying deletion:', error);
          }
        };
        
        // Start verification process
        verifyDeletion();
        
        // Clear success message after 5 seconds
        setTimeout(() => {
          console.log('⏰ Clearing success message');
          setSuccess(null);
        }, 5000);
      } else {
        console.error('❌ Delete failed:', { status: response.status, result });
        const errorMessage = result.error || 'Fout bij het verwijderen van werknemer';
        setError(errorMessage);
        console.error('❌ Error message set:', errorMessage);
      }
    } catch (err) {
      console.error('❌ Delete error:', err);
      const errorMessage = 'Fout bij het verwijderen van werknemer';
      setError(errorMessage);
    } finally {
      console.log('🗑️ Delete operation finished, setting loading to false');
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('nl-NL');
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
      >
        <div className="flex min-h-full items-center justify-center p-4">
          <div className="relative w-full max-w-4xl bg-gradient-to-br from-orange-50 to-red-50 rounded-3xl shadow-2xl" onClick={(e) => e.stopPropagation()}>
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
                  <UserPlusIcon className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold">Team Beheer</h2>
                  <p className="text-orange-100 mt-1">
                    Beheer werknemers en hun toegang
                  </p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-8">
              {error && (
                <div className="mb-6 p-4 bg-red-100 border-2 border-red-300 rounded-xl text-red-700">
                  {error}
                </div>
              )}
              
              {success && (
                <div className="mb-6 p-4 bg-green-100 border-2 border-green-300 rounded-xl text-green-700">
                  <div className="flex items-center gap-2">
                    <CheckIcon className="w-5 h-5" />
                    {success}
                  </div>
                </div>
              )}

              {/* Invite Button */}
              <div className="mb-6 flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-900">Werknemers</h3>
                <button
                  onClick={() => setShowInviteForm(!showInviteForm)}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-xl hover:from-orange-700 hover:to-red-700 transition-all font-medium"
                >
                  <PlusIcon className="w-5 h-5" />
                  Werknemer uitnodigen
                </button>
              </div>

              {/* Invite Form */}
              {showInviteForm && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-6 p-6 bg-white rounded-2xl border-2 border-orange-200 shadow-sm"
                >
                  <h4 className="text-lg font-bold text-gray-900 mb-4">Nieuwe werknemer uitnodigen</h4>
                  
                  <form onSubmit={handleInviteEmployee} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email adres
                        </label>
                        <input
                          type="email"
                          required
                          value={inviteData.email}
                          onChange={(e) => setInviteData({ ...inviteData, email: e.target.value })}
                          className="w-full px-3 py-2 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-orange-500"
                          placeholder="werknemer@bedrijf.nl"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Volledige naam
                        </label>
                        <input
                          type="text"
                          required
                          value={inviteData.name}
                          onChange={(e) => setInviteData({ ...inviteData, name: e.target.value })}
                          className="w-full px-3 py-2 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-orange-500"
                          placeholder="Jan Werknemer"
                        />
                      </div>
                    </div>

                    {/* Permissions */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Toegangsrechten
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={inviteData.permissions.canViewLeads}
                            onChange={(e) => setInviteData({
                              ...inviteData,
                              permissions: { ...inviteData.permissions, canViewLeads: e.target.checked }
                            })}
                            className="rounded border-gray-300"
                          />
                          <span className="text-sm text-gray-700">Leads bekijken</span>
                        </label>
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={inviteData.permissions.canViewOrders}
                            onChange={(e) => setInviteData({
                              ...inviteData,
                              permissions: { ...inviteData.permissions, canViewOrders: e.target.checked }
                            })}
                            className="rounded border-gray-300"
                          />
                          <span className="text-sm text-gray-700">Orders bekijken</span>
                        </label>
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={inviteData.permissions.canManageEmployees}
                            onChange={(e) => setInviteData({
                              ...inviteData,
                              permissions: { ...inviteData.permissions, canManageEmployees: e.target.checked }
                            })}
                            className="rounded border-gray-300"
                          />
                          <span className="text-sm text-gray-700">Werknemers beheren</span>
                        </label>
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={inviteData.permissions.canCheckout}
                            onChange={(e) => setInviteData({
                              ...inviteData,
                              permissions: { ...inviteData.permissions, canCheckout: e.target.checked }
                            })}
                            className="rounded border-gray-300"
                          />
                          <span className="text-sm text-gray-700">Kunnen bestellen</span>
                        </label>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="px-6 py-2 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-xl hover:from-orange-700 hover:to-red-700 transition-all font-medium disabled:opacity-50"
                      >
                        {isLoading ? 'Uitnodigen...' : 'Uitnodigen'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowInviteForm(false)}
                        className="px-6 py-2 bg-gray-300 text-gray-700 rounded-xl hover:bg-gray-400 transition-all font-medium"
                      >
                        Annuleren
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}

              {/* Employees List */}
              <div className="bg-white rounded-2xl border-2 border-orange-200 shadow-sm">
                {isLoading ? (
                  <div className="p-8 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto"></div>
                    <p className="mt-2 text-gray-600">Laden...</p>
                  </div>
                ) : (company?.employees && company.employees.length > 0) ? (
                  <div className="divide-y divide-gray-200">
                    {company.employees.map((employee, index) => (
                      <div key={employee.email} className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className="text-lg font-semibold text-gray-900">{employee.name}</h4>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                employee.isActive 
                                  ? 'bg-green-100 text-green-700 border border-green-300'
                                  : employee.acceptedAt
                                    ? 'bg-blue-100 text-blue-700 border border-blue-300'
                                    : 'bg-yellow-100 text-yellow-700 border border-yellow-300'
                              }`}>
                                {employee.isActive ? 'Actief' : employee.acceptedAt ? 'Account Aangemaakt' : 'Uitgenodigd'}
                              </span>
                            </div>
                            <p className="text-gray-600 mb-2">{employee.email}</p>
                            <div className="flex flex-wrap gap-2">
                              {employee.permissions.canViewLeads && (
                                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-md text-xs">Leads</span>
                              )}
                              {employee.permissions.canViewOrders && (
                                <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-md text-xs">Orders</span>
                              )}
                              {employee.permissions.canManageEmployees && (
                                <span className="px-2 py-1 bg-green-100 text-green-700 rounded-md text-xs">Team</span>
                              )}
                              {employee.permissions.canCheckout && (
                                <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded-md text-xs">Bestellen</span>
                              )}
                            </div>
                            <p className="text-sm text-gray-500 mt-2">
                              Uitgenodigd op {formatDate(employee.invitedAt)}
                              {employee.acceptedAt && (
                                <span> • Geaccepteerd op {formatDate(employee.acceptedAt)}</span>
                              )}
                            </p>
                          </div>
                          <button
                            onClick={() => handleRemoveEmployee(employee.email)}
                            className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                            title="Werknemer verwijderen"
                          >
                            <TrashIcon className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center text-gray-500">
                    <UserPlusIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>Nog geen werknemers toegevoegd</p>
                    <p className="text-sm">Nodig je eerste werknemer uit om te beginnen</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

