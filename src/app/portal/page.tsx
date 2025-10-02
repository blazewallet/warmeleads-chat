'use client';

import React from 'react';
import { CustomerPortal } from '@/components/CustomerPortal';
import { useRouter } from 'next/navigation';

export default function PortalPage() {
  const router = useRouter();

  const handleBackToHome = () => {
    router.push('/');
  };

  const handleStartChat = () => {
    router.push('/?chat=direct');
  };

  return (
    <CustomerPortal onBackToHome={handleBackToHome} onStartChat={handleStartChat} />
  );
}