/**
 * Centraal Pricing Management Systeem
 * Alle leadprijzen worden hier beheerd en kunnen via admin worden aangepast
 */

// Backwards compatibility - LEAD_PRICING constant
export const LEAD_PRICING = {
  exclusive: 42.50,
  shared: 12.50,
};

// Backwards compatibility - leadPricing per industry
export const leadPricing: Record<string, { exclusive: number; shared: number }> = {
  'Thuisbatterijen': { exclusive: 42.50, shared: 12.50 },
  'Zonnepanelen': { exclusive: 42.50, shared: 12.50 },
  'Warmtepompen': { exclusive: 42.50, shared: 12.50 },
  'Airco': { exclusive: 42.50, shared: 12.50 },
  'Financial Lease': { exclusive: 42.50, shared: 12.50 },
  'Test': { exclusive: 0.01, shared: 0.01 },
};

export interface BranchPricing {
  branchId: string;
  branchName: string;
  exclusivePrice: number; // Prijs per lead (excl. BTW)
  sharedPrice: number; // Prijs per lead (excl. BTW)
  minQuantityExclusive: number;
  minQuantityShared: number;
  lastUpdated: Date;
}

export interface PricingTier {
  minQuantity: number;
  pricePerLead: number;
  discount?: number;
}

export interface BranchPricingConfig {
  branchId: string;
  branchName: string;
  exclusive: {
    basePrice: number;
    tiers: PricingTier[];
  };
  shared: {
    basePrice: number;
    minQuantity: number;
  };
}

// Default pricing voor alle branches
export const DEFAULT_PRICING: BranchPricingConfig[] = [
  {
    branchId: 'thuisbatterijen',
    branchName: 'Thuisbatterij',
    exclusive: {
      basePrice: 42.50,
      tiers: [
        { minQuantity: 30, pricePerLead: 42.50 },
        { minQuantity: 50, pricePerLead: 40.00, discount: 5.88 },
        { minQuantity: 75, pricePerLead: 37.50, discount: 11.76 }
      ]
    },
    shared: {
      basePrice: 12.50,
      minQuantity: 500
    }
  },
  {
    branchId: 'zonnepanelen',
    branchName: 'Zonnepaneel',
    exclusive: {
      basePrice: 42.50,
      tiers: [
        { minQuantity: 30, pricePerLead: 42.50 },
        { minQuantity: 50, pricePerLead: 40.00, discount: 5.88 },
        { minQuantity: 75, pricePerLead: 37.50, discount: 11.76 }
      ]
    },
    shared: {
      basePrice: 12.50,
      minQuantity: 500
    }
  },
  {
    branchId: 'warmtepompen',
    branchName: 'Warmtepomp',
    exclusive: {
      basePrice: 42.50,
      tiers: [
        { minQuantity: 30, pricePerLead: 42.50 },
        { minQuantity: 50, pricePerLead: 40.00, discount: 5.88 },
        { minQuantity: 75, pricePerLead: 37.50, discount: 11.76 }
      ]
    },
    shared: {
      basePrice: 12.50,
      minQuantity: 500
    }
  },
  {
    branchId: 'airco',
    branchName: 'Airco',
    exclusive: {
      basePrice: 42.50,
      tiers: [
        { minQuantity: 30, pricePerLead: 42.50 },
        { minQuantity: 50, pricePerLead: 40.00, discount: 5.88 },
        { minQuantity: 75, pricePerLead: 37.50, discount: 11.76 }
      ]
    },
    shared: {
      basePrice: 12.50,
      minQuantity: 500
    }
  },
  {
    branchId: 'financial-lease',
    branchName: 'Financial Lease',
    exclusive: {
      basePrice: 42.50,
      tiers: [
        { minQuantity: 30, pricePerLead: 42.50 },
        { minQuantity: 50, pricePerLead: 40.00, discount: 5.88 },
        { minQuantity: 75, pricePerLead: 37.50, discount: 11.76 }
      ]
    },
    shared: {
      basePrice: 12.50,
      minQuantity: 500
    }
  },
  {
    branchId: 'test',
    branchName: 'Test Branch',
    exclusive: {
      basePrice: 0.01,
      tiers: [
        { minQuantity: 30, pricePerLead: 0.01 }
      ]
    },
    shared: {
      basePrice: 0.01,
      minQuantity: 500
    }
  }
];

/**
 * Get pricing for a specific branch
 */
export async function getBranchPricing(branchId: string): Promise<BranchPricingConfig | null> {
  try {
    // Fetch from API (Blob Storage)
    const response = await fetch('/api/pricing');
    if (response.ok) {
      const allPricing: BranchPricingConfig[] = await response.json();
      return allPricing.find(p => p.branchId === branchId) || null;
    }
  } catch (error) {
    console.error('Error fetching pricing:', error);
  }
  
  // Fallback to default
  return DEFAULT_PRICING.find(p => p.branchId === branchId) || null;
}

/**
 * Get all branch pricing
 */
export async function getAllPricing(): Promise<BranchPricingConfig[]> {
  try {
    const response = await fetch('/api/pricing');
    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    console.error('Error fetching all pricing:', error);
  }
  
  return DEFAULT_PRICING;
}

/**
 * Calculate price for exclusive leads based on quantity
 */
export function calculateExclusivePrice(pricing: BranchPricingConfig, quantity: number): {
  pricePerLead: number;
  totalPrice: number;
  discount: number;
} {
  // Find applicable tier
  const applicableTier = [...pricing.exclusive.tiers]
    .reverse()
    .find(tier => quantity >= tier.minQuantity) || pricing.exclusive.tiers[0];

  const pricePerLead = applicableTier.pricePerLead;
  const totalPrice = pricePerLead * quantity;
  const discount = applicableTier.discount || 0;

  return { pricePerLead, totalPrice, discount };
}

/**
 * Calculate price for shared leads
 */
export function calculateSharedPrice(pricing: BranchPricingConfig, quantity: number): {
  pricePerLead: number;
  totalPrice: number;
} {
  const pricePerLead = pricing.shared.basePrice;
  const totalPrice = pricePerLead * quantity;

  return { pricePerLead, totalPrice };
}

/**
 * Format price for display (excl. BTW)
 */
export function formatPrice(price: number): string {
  return `€${price.toFixed(2).replace('.', ',')}`;
}

/**
 * Calculate VAT amount (21%)
 */
export function calculateVAT(price: number): number {
  return price * 0.21;
}

/**
 * Calculate total including VAT
 */
export function calculateTotalWithVAT(price: number): number {
  return price * 1.21;
}

// Backwards compatibility exports for old components
export class PricingCalculator {
  static calculateExclusiveLeadPrice(quantity: number): number {
    return 4250; // €42.50 in cents
  }

  static calculateSharedLeadPrice(quantity: number): number {
    return 1250; // €12.50 in cents
  }

  static calculateOrder(industry: string, type: 'exclusive' | 'shared', quantity: number): {
    subtotal: number;
    vat: number;
    total: number;
    pricePerLead: number;
  } {
    const pricePerLeadEur = type === 'exclusive' ? 42.50 : 12.50;
    const pricePerLead = pricePerLeadEur * 100; // Convert to cents
    const subtotal = pricePerLeadEur * quantity;
    const vat = calculateVAT(subtotal);
    const total = calculateTotalWithVAT(subtotal);
    
    return { 
      subtotal: subtotal * 100, // Convert to cents
      vat: vat * 100, 
      total: total * 100, 
      pricePerLead 
    };
  }

  static formatPrice(cents: number): string {
    return formatPrice(cents / 100);
  }
}

export function calculateOrderTotal(userProfile: any): string {
  // Extract quantity and leadType from user profile
  const quantityStr = userProfile.quantity || '30 leads';
  const quantity = parseInt(quantityStr) || 30;
  const isShared = userProfile.leadType?.toLowerCase().includes('gedeeld');
  
  // Calculate based on type
  const pricePerLead = isShared ? 12.50 : 42.50;
  const subtotal = pricePerLead * quantity;
  const total = calculateTotalWithVAT(subtotal);
  
  return formatPrice(total);
}