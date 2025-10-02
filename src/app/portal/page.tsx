'use client';

import React from 'react';
import { CustomerPortal } from '@/components/CustomerPortal';
import { useRouter } from 'next/navigation';

export default function PortalPage() {
  const router = useRouter();

  const handleBackToHome = () => {
    router.push('/');
  };

  const handleStartChat = (context: string) => {
    router.push(`/?chat=${context}`);
  };

  return (
    <CustomerPortal onBackToHome={handleBackToHome} onStartChat={handleStartChat} />
  );
}