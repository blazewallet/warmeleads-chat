'use client';

import React from 'react';
import { CustomerPortal } from '@/components/CustomerPortal';
import { LoginForm } from '@/components/LoginForm';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/lib/auth';

export default function PortalPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { logout, init, initiatePasswordSetup, user, isAuthenticated, needsPasswordSetup } = useAuthStore();

  // Initialize auth state on portal load
  React.useEffect(() => {
    init();
  }, [init]);

  // Check for URL parameters to initiate password setup
  React.useEffect(() => {
    const emailParam = searchParams.get('email');
    const setupParam = searchParams.get('setup');

    if (emailParam && setupParam === 'true') {
      console.log('🔑 URL parameters detected for password setup:', { emailParam, setupParam });
      initiatePasswordSetup(decodeURIComponent(emailParam));
    }
  }, [searchParams, initiatePasswordSetup]);

  // Check if we should show login form for password setup
  const emailParam = searchParams.get('email');
  const setupParam = searchParams.get('setup');
  const shouldShowLoginForm = !isAuthenticated && emailParam && setupParam === 'true';

  const handleBackToHome = () => {
    // Navigate to homepage WITHOUT logging out - user stays logged in
    console.log('🏠 Portal: Navigating to home, user should stay logged in');
    router.push('/');
  };

  const handleStartChat = () => {
    router.push('/?chat=direct');
  };

  const handleLoginSuccess = () => {
    // Password setup completed, user should now be logged in
    // No need to do anything special, the CustomerPortal will render automatically
  };

  const handleBackToAuth = () => {
    router.push('/');
  };

  const handleSwitchToRegister = () => {
    // Not needed for password setup flow
  };

  const handleSwitchToGuest = () => {
    // Not needed for password setup flow
  };

  // Show login form for password setup when user is not authenticated but has setup parameters
  if (shouldShowLoginForm) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-600 to-orange-600 flex items-center justify-center p-4">
        <LoginForm
          onBack={handleBackToAuth}
          onSwitchToRegister={handleSwitchToRegister}
          onSwitchToGuest={handleSwitchToGuest}
          onSuccess={handleLoginSuccess}
        />
      </div>
    );
  }

  return (
    <CustomerPortal onBackToHome={handleBackToHome} onStartChat={handleStartChat} />
  );
}