export interface LeadPricing {
  industry: string;
  exclusive: {
    '30+': number;
    '50+': number;
    '75+': number;
  };
  shared: {
    price: number;
    minQuantity: number;
  };
}

export const LEAD_PRICING: Record<string, LeadPricing> = {
  'Thuisbatterijen': {
    industry: 'Thuisbatterijen',
    exclusive: {
      '30+': 42.50,
      '50+': 40.00,
      '75+': 37.50,
    },
    shared: {
      price: 12.50,
      minQuantity: 500,
    },
  },
  'Zonnepanelen': {
    industry: 'Zonnepanelen',
    exclusive: {
      '30+': 45.00,
      '50+': 42.50,
      '75+': 40.00,
    },
    shared: {
      price: 15.00,
      minQuantity: 500,
    },
  },
  'Warmtepompen': {
    industry: 'Warmtepompen',
    exclusive: {
      '30+': 50.00,
      '50+': 47.50,
      '75+': 45.00,
    },
    shared: {
      price: 16.50,
      minQuantity: 500,
    },
  },
  'Airco\'s': {
    industry: 'Airco\'s',
    exclusive: {
      '30+': 35.00,
      '50+': 32.50,
      '75+': 30.00,
    },
    shared: {
      price: 11.00,
      minQuantity: 500,
    },
  },
  'Financial Lease': {
    industry: 'Financial Lease',
    exclusive: {
      '30+': 55.00,
      '50+': 52.50,
      '75+': 50.00,
    },
    shared: {
      price: 18.00,
      minQuantity: 500,
    },
  },
};

export interface OrderCalculation {
  basePrice: number;
  quantity: number;
  subtotal: number;
  discount: number;
  total: number;
  pricePerLead: number;
  savings?: number;
}

export class PricingCalculator {
  static calculateOrder(
    industry: string,
    leadType: 'exclusive' | 'shared',
    quantity: number,
    discountPercentage: number = 0
  ): OrderCalculation {
    const pricing = LEAD_PRICING[industry];
    if (!pricing) {
      throw new Error(`Pricing not found for industry: ${industry}`);
    }

    let pricePerLead: number;

    if (leadType === 'shared') {
      pricePerLead = pricing.shared.price;
      if (quantity < pricing.shared.minQuantity) {
        throw new Error(`Minimum quantity for shared leads is ${pricing.shared.minQuantity}`);
      }
    } else {
      // Exclusive leads - determine price tier
      if (quantity >= 75) {
        pricePerLead = pricing.exclusive['75+'];
      } else if (quantity >= 50) {
        pricePerLead = pricing.exclusive['50+'];
      } else {
        pricePerLead = pricing.exclusive['30+'];
      }
    }

    const subtotal = quantity * pricePerLead;
    const discount = subtotal * (discountPercentage / 100);
    const total = subtotal - discount;

    return {
      basePrice: pricePerLead,
      quantity,
      subtotal,
      discount,
      total,
      pricePerLead,
      savings: discount > 0 ? discount : undefined,
    };
  }

  static formatPrice(amount: number, currency: string = 'EUR'): string {
    return new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency,
    }).format(amount);
  }

  static getRecommendedQuantity(
    industry: string,
    leadType: 'exclusive' | 'shared',
    budget: number
  ): number {
    const pricing = LEAD_PRICING[industry];
    if (!pricing) {
      return 30; // Default fallback
    }

    if (leadType === 'shared') {
      return Math.floor(budget / pricing.shared.price);
    } else {
      // Find the best tier for the budget
      const price75 = pricing.exclusive['75+'];
      const price50 = pricing.exclusive['50+'];
      const price30 = pricing.exclusive['30+'];

      if (budget >= 75 * price75) {
        return Math.floor(budget / price75);
      } else if (budget >= 50 * price50) {
        return Math.floor(budget / price50);
      } else {
        return Math.floor(budget / price30);
      }
    }
  }

  static getAllIndustries(): string[] {
    return Object.keys(LEAD_PRICING);
  }

  static getIndustryPricing(industry: string): LeadPricing | null {
    return LEAD_PRICING[industry] || null;
  }
}

// Helper function for backward compatibility
export function calculateOrderTotal(profile: {
  industry?: string;
  leadType?: string;
  quantity?: string;
}): string {
  if (!profile.industry || !profile.leadType || !profile.quantity) {
    return 'Wordt berekend...';
  }

  try {
    // Parse quantity
    const quantityMatch = profile.quantity.match(/\d+/);
    const quantity = quantityMatch ? parseInt(quantityMatch[0]) : 0;
    
    if (quantity === 0) {
      return 'Ongeldig aantal';
    }

    // Determine lead type
    const leadType = (profile.leadType.toLowerCase().includes('exclusief') || 
                     profile.leadType.toLowerCase().includes('exclusieve') ||
                     profile.leadType.toLowerCase().includes('exclusive')) ? 'exclusive' : 'shared';

    const calculation = PricingCalculator.calculateOrder(
      profile.industry,
      leadType,
      quantity
    );

    return PricingCalculator.formatPrice(calculation.total);
  } catch (error) {
    console.error('Error calculating order total:', error);
    return 'Fout bij berekening';
  }
}
