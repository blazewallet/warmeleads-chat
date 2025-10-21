// BTW (VAT) berekeningen voor Nederlandse regelgeving

export const VAT_RATE = 0.21; // 21% BTW in Nederland
export const VAT_PERCENTAGE = 21;

export interface PriceBreakdown {
  amountExclVAT: number; // Bedrag exclusief BTW (in centen)
  vatAmount: number;      // BTW bedrag (in centen)
  amountInclVAT: number;  // Bedrag inclusief BTW (in centen)
  currency: string;
}

/**
 * Bereken BTW bedragen op basis van prijs exclusief BTW
 */
export function calculateVAT(amountExclVAT: number, currency: string = 'EUR'): PriceBreakdown {
  const vatAmount = Math.round(amountExclVAT * VAT_RATE);
  const amountInclVAT = amountExclVAT + vatAmount;
  
  return {
    amountExclVAT,
    vatAmount,
    amountInclVAT,
    currency,
  };
}

/**
 * Format bedrag in euro's
 */
export function formatPrice(amountInCents: number, currency: string = 'EUR'): string {
  return new Intl.NumberFormat('nl-NL', {
    style: 'currency',
    currency,
  }).format(amountInCents / 100);
}

/**
 * Format BTW percentage
 */
export function formatVATPercentage(): string {
  return `${VAT_PERCENTAGE}%`;
}

/**
 * Genereer BTW specificatie voor facturen
 */
export function generateVATSpecification(amountExclVAT: number): string {
  const breakdown = calculateVAT(amountExclVAT);
  
  return `
Subtotaal (excl. BTW): ${formatPrice(breakdown.amountExclVAT)}
BTW (${formatVATPercentage()}): ${formatPrice(breakdown.vatAmount)}
───────────────────────────────
Totaal (incl. BTW): ${formatPrice(breakdown.amountInclVAT)}
  `.trim();
}

