'use client';

import React from 'react';
import { CustomerPortal } from '@/components/CustomerPortal';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/auth';

export default function PortalPage() {
  const router = useRouter();
  const { logout } = useAuthStore();

  const handleBackToHome = () => {
    // Logout user first, then redirect to homepage
    logout();
    setTimeout(() => {
      window.location.href = '/';
    }, 100);
  };

  const handleStartChat = () => {
    router.push('/?chat=direct');
  };

  return (
    <CustomerPortal onBackToHome={handleBackToHome} onStartChat={handleStartChat} />
  );
}