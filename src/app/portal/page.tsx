'use client';

import React from 'react';
import { CustomerPortal } from '@/components/CustomerPortal';

export default function PortalPage() {
  const handleBackToHome = () => {
    // This shouldn't be needed since we're in the portal
    // But keeping it for compatibility
    window.location.href = '/';
  };

  const handleStartChat = (context: string = 'customer') => {
    // Start chat from portal
    window.location.href = '/?chat=' + context;
  };

  return (
    <CustomerPortal 
      onBackToHome={handleBackToHome} 
      onStartChat={() => handleStartChat('customer')} 
    />
  );
}
