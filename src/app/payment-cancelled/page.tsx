'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function PaymentCancelledPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-purple to-brand-pink flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-3xl p-8 max-w-md w-full mx-4 text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6"
        >
          <svg className="w-10 h-10 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.664-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </motion.div>

        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Betaling geannuleerd
        </h1>

        <p className="text-gray-600 mb-6">
          U heeft de betaling geannuleerd. Geen zorgen, er is niets afgeschreven van uw rekening.
        </p>

        <div className="bg-blue-50 rounded-2xl p-4 mb-6 text-left">
          <h3 className="font-semibold text-blue-800 mb-2">Wilt u toch bestellen?</h3>
          <p className="text-sm text-blue-700">
            Ga terug naar de website om opnieuw een bestelling te plaatsen. Uw gegevens zijn niet opgeslagen.
          </p>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => router.back()}
            className="block w-full bg-gradient-to-r from-brand-purple to-brand-pink text-white font-semibold py-3 rounded-2xl hover:shadow-lg transition-all duration-300"
          >
            Terug naar bestelling
          </button>
          
          <Link 
            href="/"
            className="block w-full border-2 border-gray-200 text-gray-700 font-semibold py-3 rounded-2xl hover:bg-gray-50 transition-all duration-300"
          >
            Terug naar homepage
          </Link>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            Hulp nodig? Neem contact op via{' '}
            <a href="mailto:info@warmeleads.eu" className="text-brand-purple hover:underline">
              info@warmeleads.eu
            </a>
            {' '}of{' '}
            <a href="tel:+31850477067" className="text-brand-purple hover:underline">
              085-0477067
            </a>
          </p>
        </div>
      </motion.div>
    </div>
  );
}


