import { Suspense } from 'react';
import PaymentSuccessContent from './PaymentSuccessContent';

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gradient-to-br from-brand-purple to-brand-pink flex items-center justify-center">
      <div className="text-white text-xl">Laden...</div>
    </div>}>
      <PaymentSuccessContent />
    </Suspense>
  );
}


