'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, DocumentArrowDownIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

interface OrderDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: any; // Full order object from Blob Storage
}

export function OrderDetailModal({ isOpen, onClose, order }: OrderDetailModalProps) {
  if (!order) return null;

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency: 'EUR',
    }).format(cents / 100);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('nl-NL', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-0 z-50 overflow-y-auto"
          >
            <div className="flex min-h-full items-center justify-center p-4">
              <div className="relative w-full max-w-4xl bg-gradient-to-br from-orange-50 to-red-50 rounded-3xl shadow-2xl max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="relative bg-gradient-to-r from-orange-600 to-red-600 text-white px-8 py-6 rounded-t-3xl">
                  <button
                    onClick={onClose}
                    className="absolute top-6 right-6 p-2 hover:bg-white/20 rounded-full transition-colors"
                  >
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                  
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                      <CheckCircleIcon className="w-8 h-8" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold">Bestelling Details</h2>
                      <p className="text-orange-100 mt-1">
                        {order.orderNumber}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-8 overflow-y-auto max-h-[calc(90vh-200px)]">
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Left Column - Order Info */}
                    <div className="space-y-4">
                      {/* Status */}
                      <div className="bg-white rounded-2xl p-5 border-2 border-orange-200 shadow-sm">
                        <h3 className="text-gray-900 font-bold mb-3 flex items-center gap-2">
                          <CheckCircleIcon className="w-5 h-5 text-green-600" />
                          Status
                        </h3>
                        <div className="flex items-center gap-2">
                          <span className={`
                            px-3 py-1 rounded-full text-xs font-bold
                            ${order.status === 'completed' || order.status === 'delivered'
                              ? 'bg-green-100 text-green-700 border-2 border-green-300'
                              : 'bg-blue-100 text-blue-700 border-2 border-blue-300'
                            }
                          `}>
                            {order.status === 'completed' || order.status === 'delivered' ? 'Geleverd' : 'Actief'}
                          </span>
                        </div>
                        <p className="text-gray-600 text-sm mt-2">
                          Besteld op {formatDate(order.createdAt)}
                        </p>
                    </div>

                      {/* Customer Info */}
                      <div className="bg-white rounded-2xl p-5 border-2 border-orange-200 shadow-sm">
                        <h3 className="text-gray-900 font-bold mb-3">Klantgegevens</h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Naam:</span>
                            <span className="text-gray-900 font-semibold">{order.customerName}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Email:</span>
                            <span className="text-gray-900 font-semibold">{order.customerEmail}</span>
                          </div>
                          {order.customerCompany && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">Bedrijf:</span>
                              <span className="text-gray-900 font-semibold">{order.customerCompany}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Product Info */}
                      <div className="bg-white rounded-2xl p-5 border-2 border-orange-200 shadow-sm">
                        <h3 className="text-gray-900 font-bold mb-3">Product Details</h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Package:</span>
                            <span className="text-gray-900 font-semibold">{order.packageName}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Branche:</span>
                            <span className="text-gray-900 font-semibold">{order.industry}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Type:</span>
                            <span className="text-gray-900 font-semibold">
                              {order.leadType === 'exclusive' ? 'Exclusieve leads' : 'Gedeelde leads'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Aantal leads:</span>
                            <span className="text-gray-900 font-semibold">{order.quantity}</span>
                          </div>
                        </div>
                      </div>

                      {/* Payment Info */}
                      <div className="bg-white rounded-2xl p-5 border-2 border-orange-200 shadow-sm">
                        <h3 className="text-gray-900 font-bold mb-3">Betaling</h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Betaalmethode:</span>
                            <span className="text-gray-900 font-semibold uppercase">{order.paymentMethod}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Status:</span>
                            <span className="text-green-600 font-bold">Betaald</span>
                          </div>
                        </div>
                      </div>
                  </div>

                    {/* Right Column - Price Breakdown & Invoice */}
                    <div className="space-y-4">
                      {/* Price Breakdown */}
                      <div className="bg-gradient-to-br from-orange-100 to-red-100 rounded-2xl p-6 border-2 border-orange-300 shadow-md">
                        <h3 className="text-gray-900 font-bold mb-4">Prijsopbouw</h3>
                        <div className="space-y-3">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-700">Prijs per lead:</span>
                            <span className="text-gray-900 font-semibold">
                              {formatPrice(order.pricePerLead)} <span className="text-xs text-gray-600">excl. BTW</span>
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-700">Aantal:</span>
                            <span className="text-gray-900 font-semibold">{order.quantity}x</span>
                          </div>
                          <div className="border-t-2 border-orange-300 pt-3 space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-700">Subtotaal (excl. BTW):</span>
                              <span className="text-gray-900 font-semibold">{formatPrice(order.totalAmount)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-700">BTW ({order.vatPercentage}%):</span>
                              <span className="text-gray-900 font-semibold">{formatPrice(order.vatAmount)}</span>
                            </div>
                          </div>
                          <div className="border-t-2 border-orange-400 pt-3">
                            <div className="flex justify-between items-center">
                              <span className="text-gray-900 font-bold">Totaal (incl. BTW):</span>
                              <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-red-600">
                                {formatPrice(order.totalAmountInclVAT)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Invoice Section */}
                      {order.invoiceUrl && (
                        <div className="bg-white rounded-2xl p-5 border-2 border-orange-200 shadow-sm">
                          <h3 className="text-gray-900 font-bold mb-3 flex items-center gap-2">
                            <DocumentArrowDownIcon className="w-5 h-5 text-orange-600" />
                            Factuur
                          </h3>
                          <div className="space-y-3">
                            <div className="text-sm text-gray-600">
                              Factuurnummer: <span className="text-gray-900 font-semibold">{order.invoiceNumber || `INV-${order.orderNumber}`}</span>
                            </div>
                            
                            {/* Download Button */}
                            <a
                              href={order.invoiceUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-bold py-3 px-4 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg"
                            >
                              <DocumentArrowDownIcon className="w-5 h-5" />
                              Download factuur (PDF)
                            </a>

                            {/* PDF Preview */}
                            <div className="mt-4">
                              <div className="bg-gray-100 rounded-xl overflow-hidden border-2 border-orange-200">
                                <iframe
                                  src={`${order.invoiceUrl}#toolbar=0&navpanes=0&scrollbar=0`}
                                  className="w-full h-[400px]"
                                  title="Factuur Preview"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                  </div>
                </div>
              </div>

                {/* Footer */}
                <div className="px-8 pb-8 pt-6 border-t-2 border-orange-200 flex justify-end gap-3">
                  {order.invoiceUrl && (
                    <a
                      href={order.invoiceUrl}
                      download
                      className="px-6 py-3 bg-white hover:bg-orange-50 text-gray-900 border-2 border-orange-300 rounded-xl transition-all font-bold shadow-sm hover:shadow-md"
                    >
                      Download factuur
                    </a>
                  )}
                  <button
                    onClick={onClose}
                    className="px-8 py-3 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white rounded-xl transition-all font-bold shadow-md hover:shadow-lg"
                  >
                    Sluiten
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

