'use client';

import React from 'react';
import { CustomerPortal } from '@/components/CustomerPortal';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/auth';

export default function PortalPage() {
  const router = useRouter();
  const { logout } = useAuthStore();

  const handleBackToHome = () => {
    // Navigate to homepage WITHOUT logging out - user stays logged in
    router.push('/');
  };

  const handleStartChat = () => {
    router.push('/?chat=direct');
  };

  return (
    <CustomerPortal onBackToHome={handleBackToHome} onStartChat={handleStartChat} />
  );
}