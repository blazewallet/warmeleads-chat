'use client';

import React, { useState, useEffect } from 'react';
import { CustomerPortal } from '@/components/CustomerPortal';
import { EmployeeSetupModal } from '@/components/EmployeeSetupModal';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/lib/auth';

export default function PortalPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { logout, init, isAuthenticated } = useAuthStore();
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [setupEmail, setSetupEmail] = useState<string>('');

  // Initialize auth state on portal load
  React.useEffect(() => {
    init();
  }, [init]);

  // Check for setup parameter
  React.useEffect(() => {
    const setupParam = searchParams.get('setup');
    if (setupParam && !isAuthenticated) {
      setSetupEmail(decodeURIComponent(setupParam));
      setShowSetupModal(true);
    }
  }, [searchParams, isAuthenticated]);

  const handleBackToHome = () => {
    // Navigate to homepage WITHOUT logging out - user stays logged in
    console.log('🏠 Portal: Navigating to home, user should stay logged in');
    router.push('/');
  };

  const handleStartChat = () => {
    router.push('/?chat=direct');
  };

  const handleSetupSuccess = () => {
    setShowSetupModal(false);
    // Redirect to clean URL without setup parameter
    router.push('/portal');
  };

  const handleSetupClose = () => {
    setShowSetupModal(false);
    // Redirect to clean URL without setup parameter
    router.push('/portal');
  };

  return (
    <>
      <CustomerPortal onBackToHome={handleBackToHome} onStartChat={handleStartChat} />
      
      {showSetupModal && setupEmail && (
        <EmployeeSetupModal
          isOpen={showSetupModal}
          onClose={handleSetupClose}
          employeeEmail={setupEmail}
          onSuccess={handleSetupSuccess}
        />
      )}
    </>
  );
}