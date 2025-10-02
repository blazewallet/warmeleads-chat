'use client';

import React from 'react';
import { CustomerPortal } from '@/components/CustomerPortal';
import { useRouter } from 'next/navigation';

export default function PortalPage() {
  const router = useRouter();

  const handleBackToHome = () => {
    // Logout user first, then go to homepage
    // This will clear auth state and show landing page
    window.location.href = '/';
  };

  const handleStartChat = () => {
    router.push('/?chat=direct');
  };

  return (
    <CustomerPortal onBackToHome={handleBackToHome} onStartChat={handleStartChat} />
  );
}