/**
 * Lead Packages Generator
 * Genereert dynamisch lead packages op basis van centrale pricing configuratie
 */

import { type BranchPricingConfig } from './pricing';

export interface LeadPackage {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  price: number;
  currency: string;
  industry: string;
  type: 'exclusive' | 'shared';
  quantity: number;
  minQuantity: number;
  pricingTiers: Array<{ minQuantity: number; pricePerLead: number }>;
  features: string[];
}

/**
 * Generate lead packages from pricing configuration
 */
export function generateLeadPackages(pricingConfig: BranchPricingConfig[]): Record<string, LeadPackage[]> {
  const packages: Record<string, LeadPackage[]> = {};

  pricingConfig.forEach(config => {
    const branchPackages: LeadPackage[] = [];

    // Exclusive package
    const exclusivePrice = config.exclusive.basePrice * 100; // Convert to cents
    branchPackages.push({
      id: `${config.branchId}_exclusive`,
      name: `Exclusieve ${config.branchName} Leads`,
      description: `Exclusieve ${config.branchName.toLowerCase()} leads - alleen voor jou!`,
      basePrice: exclusivePrice,
      price: exclusivePrice,
      currency: 'eur',
      industry: config.branchName,
      type: 'exclusive',
      quantity: config.exclusive.tiers[0].minQuantity,
      minQuantity: config.exclusive.tiers[0].minQuantity,
      pricingTiers: config.exclusive.tiers.map(tier => ({
        minQuantity: tier.minQuantity,
        pricePerLead: tier.pricePerLead * 100 // Convert to cents
      })),
      features: [
        `€${config.exclusive.basePrice.toFixed(2)} per lead (excl. BTW)`,
        'Exclusief voor jou - niet gedeeld',
        `Minimum ${config.exclusive.tiers[0].minQuantity} leads`,
        'Direct contact met klant',
        '15 minuten delivery',
        'Gekwalificeerde leads',
        ...(config.exclusive.tiers.length > 1 ? [
          `Bulkkorting: vanaf ${config.exclusive.tiers[1].minQuantity} leads = €${config.exclusive.tiers[1].pricePerLead.toFixed(2)}/lead`,
        ] : [])
      ]
    });

    // Shared package
    const sharedPrice = config.shared.basePrice * 100; // Convert to cents
    branchPackages.push({
      id: `${config.branchId}_shared`,
      name: `Gedeelde ${config.branchName} Leads`,
      description: `Gedeelde ${config.branchName.toLowerCase()} leads - maximaal 5 bedrijven`,
      basePrice: sharedPrice,
      price: sharedPrice,
      currency: 'eur',
      industry: config.branchName,
      type: 'shared',
      quantity: config.shared.minQuantity,
      minQuantity: config.shared.minQuantity,
      pricingTiers: [
        { minQuantity: config.shared.minQuantity, pricePerLead: sharedPrice }
      ],
      features: [
        `€${config.shared.basePrice.toFixed(2)} per lead (excl. BTW)`,
        'Gedeeld met max. 5 bedrijven',
        `Alleen in batches van ${config.shared.minQuantity} leads`,
        'Zeer betaalbaar',
        'Grote volumes mogelijk',
        'Gekwalificeerde leads'
      ]
    });

    packages[config.branchName] = branchPackages;
  });

  return packages;
}

/**
 * Get lead packages for a specific branch
 */
export async function getLeadPackagesForBranch(branchName: string): Promise<LeadPackage[]> {
  try {
    const response = await fetch('/api/pricing');
    if (response.ok) {
      const pricingConfig: BranchPricingConfig[] = await response.json();
      const allPackages = generateLeadPackages(pricingConfig);
      return allPackages[branchName] || [];
    }
  } catch (error) {
    console.error('Error fetching lead packages:', error);
  }
  
  return [];
}

/**
 * Get all lead packages
 */
export async function getAllLeadPackages(): Promise<Record<string, LeadPackage[]>> {
  try {
    const response = await fetch('/api/pricing');
    if (response.ok) {
      const pricingConfig: BranchPricingConfig[] = await response.json();
      return generateLeadPackages(pricingConfig);
    }
  } catch (error) {
    console.error('Error fetching all lead packages:', error);
  }
  
  return {};
}

/**
 * Calculate package price based on quantity
 */
export function calculatePackagePrice(
  leadPackage: LeadPackage,
  quantity: number
): {
  pricePerLead: number;
  totalPrice: number;
  discount: number;
} {
  if (leadPackage.type === 'shared') {
    const pricePerLead = leadPackage.basePrice;
    const totalPrice = pricePerLead * quantity;
    return { pricePerLead, totalPrice, discount: 0 };
  }

  // Find applicable tier for exclusive leads
  const applicableTier = [...leadPackage.pricingTiers]
    .reverse()
    .find(tier => quantity >= tier.minQuantity) || leadPackage.pricingTiers[0];

  const pricePerLead = applicableTier.pricePerLead;
  const totalPrice = pricePerLead * quantity;
  
  // Calculate discount percentage
  const basePrice = leadPackage.pricingTiers[0].pricePerLead;
  const discount = basePrice > pricePerLead
    ? ((basePrice - pricePerLead) / basePrice) * 100
    : 0;

  return { pricePerLead, totalPrice, discount };
}
