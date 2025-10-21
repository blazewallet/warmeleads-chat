import Stripe from 'stripe';

// Use live Stripe keys
const stripeSecretKey = process.env.STRIPE_SECRET_KEY || 'sk_test_dummy_for_build';

console.log('Stripe configuration:', {
  hasSecretKey: !!process.env.STRIPE_SECRET_KEY,
  keyPrefix: process.env.STRIPE_SECRET_KEY?.substring(0, 8) + '...',
  nodeEnv: process.env.NODE_ENV,
  usingLiveKeys: process.env.NODE_ENV === 'production'
});

if (!process.env.STRIPE_SECRET_KEY && process.env.NODE_ENV === 'production') {
  console.error('STRIPE_SECRET_KEY not found in production!');
} else if (!process.env.STRIPE_SECRET_KEY) {
  console.warn('STRIPE_SECRET_KEY not found, using dummy key for build');
}

export const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2025-08-27.basil',
  typescript: true,
  timeout: 20000, // 20 seconds timeout
  maxNetworkRetries: 3,
});

export interface PricingTier {
  minQuantity: number;
  maxQuantity?: number;
  pricePerLead: number; // in cents
}

export interface LeadPackage {
  id: string;
  name: string;
  description: string;
  basePrice: number; // Deprecated - use pricing tiers instead
  price: number; // Deprecated
  currency: string;
  industry: string;
  type: 'exclusive' | 'shared';
  quantity: number;
  minQuantity?: number; // For exclusive leads
  pricingTiers?: PricingTier[]; // For tiered pricing
  features: string[];
}

export const leadPackages: Record<string, LeadPackage[]> = {
  'Test': [
    {
      id: 'test_exclusive',
      name: '🧪 Test Exclusieve Leads',
      description: 'Test exclusieve leads - €0,01 per lead voor het testen van de betaalflow',
      basePrice: 1, // €0.01
      price: 1,
      currency: 'eur',
      industry: 'Test',
      type: 'exclusive',
      quantity: 1,
      minQuantity: 1, // Minimum 1 lead voor testen
      pricingTiers: [
        { minQuantity: 1, pricePerLead: 1 }, // €0.01 per lead
      ],
      features: [
        '🧪 TEST MODUS - Alleen voor testen',
        '€0,01 per lead',
        'Minimum 1 lead',
        'Ideaal voor het testen van betaalflow',
        'iDEAL, Bancontact en Card betaling'
      ]
    },
    {
      id: 'test_shared',
      name: '🧪 Test Gedeelde Leads',
      description: 'Test gedeelde leads - €0,01 per lead voor het testen van de betaalflow',
      basePrice: 1, // €0.01
      price: 1,
      currency: 'eur',
      industry: 'Test',
      type: 'shared',
      quantity: 10, // Vaste batch van 10 leads
      features: [
        '🧪 TEST MODUS - Alleen voor testen',
        '€0,01 per lead',
        'Vaste batch van 10 leads',
        'Totaal: €0,10',
        'Ideaal voor het testen van betaalflow'
      ]
    }
  ],
  'Thuisbatterijen': [
    {
      id: 'thuisbatterij_exclusive',
      name: 'Exclusieve Thuisbatterij Leads',
      description: 'Exclusieve thuisbatterij leads met staffelkorting',
      basePrice: 4250,
      price: 4250, // Base price per lead
      currency: 'eur',
      industry: 'Thuisbatterijen',
      type: 'exclusive',
      quantity: 30,
      minQuantity: 30,
      pricingTiers: [
        { minQuantity: 30, maxQuantity: 49, pricePerLead: 4250 }, // €42.50
        { minQuantity: 50, maxQuantity: 74, pricePerLead: 4000 }, // €40.00
        { minQuantity: 75, pricePerLead: 3750 }, // €37.50
      ],
      features: [
        '100% exclusieve leads',
        'Verse leads binnen 15 minuten',
        'Staffelkorting vanaf 50 leads',
        'Nederlandse prospects',
        '24/7 support'
      ]
    },
    {
      id: 'thuisbatterij_shared',
      name: 'Gedeelde Thuisbatterij Leads',
      description: '500 gedeelde thuisbatterij leads (gedeeld met max 2 anderen)',
      basePrice: 1250,
      price: 1250, // €12.50 per lead
      currency: 'eur',
      industry: 'Thuisbatterijen',
      type: 'shared',
      quantity: 500,
      features: [
        'Gedeeld met max 2 anderen',
        'Verse leads binnen 15 minuten',
        'Vaste batch van 500 leads',
        'Nederlandse prospects',
        'Email support'
      ]
    }
  ],
  'Zonnepanelen': [
    {
      id: 'zonnepanelen_exclusive',
      name: 'Exclusieve Zonnepanelen Leads',
      description: 'Exclusieve zonnepanelen leads met staffelkorting',
      basePrice: 4250,
      price: 4250,
      currency: 'eur',
      industry: 'Zonnepanelen',
      type: 'exclusive',
      quantity: 30,
      minQuantity: 30,
      pricingTiers: [
        { minQuantity: 30, maxQuantity: 49, pricePerLead: 4250 },
        { minQuantity: 50, maxQuantity: 74, pricePerLead: 4000 },
        { minQuantity: 75, pricePerLead: 3750 },
      ],
      features: [
        '100% exclusieve leads',
        'Verse leads binnen 15 minuten',
        'Staffelkorting vanaf 50 leads',
        'Nederlandse prospects',
        '24/7 support'
      ]
    },
    {
      id: 'zonnepanelen_shared',
      name: 'Gedeelde Zonnepanelen Leads',
      description: '500 gedeelde zonnepanelen leads (gedeeld met max 2 anderen)',
      basePrice: 1250,
      price: 1250,
      currency: 'eur',
      industry: 'Zonnepanelen',
      type: 'shared',
      quantity: 500,
      features: [
        'Gedeeld met max 2 anderen',
        'Verse leads binnen 15 minuten',
        'Vaste batch van 500 leads',
        'Nederlandse prospects',
        'Email support'
      ]
    }
  ],
  'Warmtepompen': [
    {
      id: 'warmtepomp_exclusive',
      name: 'Exclusieve Warmtepomp Leads',
      description: 'Exclusieve warmtepomp leads met staffelkorting',
      basePrice: 4250,
      price: 4250,
      currency: 'eur',
      industry: 'Warmtepompen',
      type: 'exclusive',
      quantity: 30,
      minQuantity: 30,
      pricingTiers: [
        { minQuantity: 30, maxQuantity: 49, pricePerLead: 4250 },
        { minQuantity: 50, maxQuantity: 74, pricePerLead: 4000 },
        { minQuantity: 75, pricePerLead: 3750 },
      ],
      features: [
        '100% exclusieve leads',
        'Verse leads binnen 15 minuten',
        'Staffelkorting vanaf 50 leads',
        'Nederlandse prospects',
        '24/7 support'
      ]
    },
    {
      id: 'warmtepomp_shared',
      name: 'Gedeelde Warmtepomp Leads',
      description: '500 gedeelde warmtepomp leads (gedeeld met max 2 anderen)',
      basePrice: 1250,
      price: 1250,
      currency: 'eur',
      industry: 'Warmtepompen',
      type: 'shared',
      quantity: 500,
      features: [
        'Gedeeld met max 2 anderen',
        'Verse leads binnen 15 minuten',
        'Vaste batch van 500 leads',
        'Nederlandse prospects',
        'Email support'
      ]
    }
  ],
  'Airco': [
    {
      id: 'airco_exclusive',
      name: 'Exclusieve Airco Leads',
      description: 'Exclusieve airco leads met staffelkorting',
      basePrice: 4250,
      price: 4250,
      currency: 'eur',
      industry: 'Airco',
      type: 'exclusive',
      quantity: 30,
      minQuantity: 30,
      pricingTiers: [
        { minQuantity: 30, maxQuantity: 49, pricePerLead: 4250 },
        { minQuantity: 50, maxQuantity: 74, pricePerLead: 4000 },
        { minQuantity: 75, pricePerLead: 3750 },
      ],
      features: [
        '100% exclusieve leads',
        'Verse leads binnen 15 minuten',
        'Staffelkorting vanaf 50 leads',
        'Nederlandse prospects',
        '24/7 support'
      ]
    },
    {
      id: 'airco_shared',
      name: 'Gedeelde Airco Leads',
      description: '500 gedeelde airco leads (gedeeld met max 2 anderen)',
      basePrice: 1250,
      price: 1250,
      currency: 'eur',
      industry: 'Airco',
      type: 'shared',
      quantity: 500,
      features: [
        'Gedeeld met max 2 anderen',
        'Verse leads binnen 15 minuten',
        'Vaste batch van 500 leads',
        'Nederlandse prospects',
        'Email support'
      ]
    }
  ],
  'Financial Lease': [
    {
      id: 'lease_exclusive',
      name: 'Exclusieve Financial Lease Leads',
      description: 'Exclusieve financial lease leads met staffelkorting',
      basePrice: 4250,
      price: 4250,
      currency: 'eur',
      industry: 'Financial Lease',
      type: 'exclusive',
      quantity: 30,
      minQuantity: 30,
      pricingTiers: [
        { minQuantity: 30, maxQuantity: 49, pricePerLead: 4250 },
        { minQuantity: 50, maxQuantity: 74, pricePerLead: 4000 },
        { minQuantity: 75, pricePerLead: 3750 },
      ],
      features: [
        '100% exclusieve leads',
        'Verse leads binnen 15 minuten',
        'Staffelkorting vanaf 50 leads',
        'Nederlandse zakelijke prospects',
        '24/7 support'
      ]
    },
    {
      id: 'lease_shared',
      name: 'Gedeelde Financial Lease Leads',
      description: '500 gedeelde financial lease leads (gedeeld met max 2 anderen)',
      basePrice: 1250,
      price: 1250,
      currency: 'eur',
      industry: 'Financial Lease',
      type: 'shared',
      quantity: 500,
      features: [
        'Gedeeld met max 2 anderen',
        'Verse leads binnen 15 minuten',
        'Vaste batch van 500 leads',
        'Nederlandse zakelijke prospects',
        'Email support'
      ]
    }
  ]
};

export async function createPaymentIntent(
  packageId: string,
  quantity: number = 1,
  customerInfo: {
    name: string;
    email: string;
    phone?: string;
    company?: string;
  }
): Promise<{ clientSecret: string; paymentIntentId: string }> {
  try {
    // Find the package
    const allPackages = Object.values(leadPackages).flat();
    const selectedPackage = allPackages.find(pkg => pkg.id === packageId);
    
    if (!selectedPackage) {
      throw new Error('Package not found');
    }

    const totalAmount = selectedPackage.price * quantity;

    // Create or retrieve customer
    let customer;
    const existingCustomers = await stripe.customers.list({
      email: customerInfo.email,
      limit: 1,
    });

    if (existingCustomers.data.length > 0) {
      customer = existingCustomers.data[0];
    } else {
      customer = await stripe.customers.create({
        name: customerInfo.name,
        email: customerInfo.email,
        phone: customerInfo.phone,
        metadata: {
          company: customerInfo.company || '',
        },
      });
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalAmount,
      currency: selectedPackage.currency,
      customer: customer.id,
      metadata: {
        packageId,
        quantity: quantity.toString(),
        industry: selectedPackage.industry,
        type: selectedPackage.type,
        customerName: customerInfo.name,
        customerCompany: customerInfo.company || '',
      },
      description: `${selectedPackage.name} x${quantity}`,
      receipt_email: customerInfo.email,
      shipping: {
        name: customerInfo.name,
        address: {
          line1: 'Digital Delivery',
          city: 'Online',
          country: 'NL',
        },
      },
    });

    return {
      clientSecret: paymentIntent.client_secret!,
      paymentIntentId: paymentIntent.id,
    };
  } catch (error) {
    console.error('Error creating payment intent:', error);
    throw error;
  }
}

export async function handleSuccessfulPayment(paymentIntentId: string) {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    
    if (paymentIntent.status === 'succeeded') {
      // Extract order information
      const orderData = {
        paymentIntentId,
        customerId: paymentIntent.customer as string,
        packageId: paymentIntent.metadata.packageId,
        quantity: parseInt(paymentIntent.metadata.quantity),
        industry: paymentIntent.metadata.industry,
        type: paymentIntent.metadata.type,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        customerName: paymentIntent.metadata.customerName,
        customerCompany: paymentIntent.metadata.customerCompany,
        createdAt: new Date(paymentIntent.created * 1000),
      };

      // Here you would typically:
      // 1. Save order to database
      // 2. Trigger lead delivery process
      // 3. Send confirmation email
      // 4. Update CRM system
      
      console.log('Order processed:', orderData);
      
      return orderData;
    }
    
    return null;
  } catch (error) {
    console.error('Error handling successful payment:', error);
    throw error;
  }
}

export function calculateDiscount(
  originalPrice: number,
  discountPercentage: number
): { discountedPrice: number; savings: number } {
  const savings = Math.round(originalPrice * (discountPercentage / 100));
  const discountedPrice = originalPrice - savings;
  
  return {
    discountedPrice,
    savings,
  };
}

export function formatPrice(amountInCents: number, currency: string = 'EUR'): string {
  return new Intl.NumberFormat('nl-NL', {
    style: 'currency',
    currency,
  }).format(amountInCents / 100);
}

// Calculate price based on quantity and pricing tiers
export function calculatePackagePrice(pkg: LeadPackage, quantity: number): { pricePerLead: number; totalPrice: number; tierInfo?: string } {
  // For shared leads, quantity is fixed
  if (pkg.type === 'shared') {
    const totalPrice = pkg.price * pkg.quantity; // €12.50 * 500 = €6250
    return {
      pricePerLead: pkg.price,
      totalPrice,
      tierInfo: `Vaste batch van ${pkg.quantity} leads`
    };
  }
  
  // For exclusive leads, use pricing tiers
  if (pkg.pricingTiers && pkg.pricingTiers.length > 0) {
    // Find the applicable tier
    const tier = pkg.pricingTiers.find(t => {
      if (t.maxQuantity) {
        return quantity >= t.minQuantity && quantity <= t.maxQuantity;
      }
      return quantity >= t.minQuantity;
    });
    
    if (tier) {
      const totalPrice = tier.pricePerLead * quantity;
      let tierInfo = '';
      
      if (tier.maxQuantity) {
        tierInfo = `${formatPrice(tier.pricePerLead)} per lead (${tier.minQuantity}-${tier.maxQuantity} leads)`;
      } else {
        tierInfo = `${formatPrice(tier.pricePerLead)} per lead (${tier.minQuantity}+ leads)`;
      }
      
      return {
        pricePerLead: tier.pricePerLead,
        totalPrice,
        tierInfo
      };
    }
  }
  
  // Fallback to base price
  const totalPrice = pkg.price * quantity;
  return {
    pricePerLead: pkg.price,
    totalPrice,
    tierInfo: `${formatPrice(pkg.price)} per lead`
  };
}
