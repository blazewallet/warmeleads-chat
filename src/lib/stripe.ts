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

export interface LeadPackage {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  industry: string;
  type: 'exclusive' | 'shared';
  quantity: number;
  features: string[];
}

export const leadPackages: Record<string, LeadPackage[]> = {
  'Thuisbatterijen': [
    {
      id: 'thuisbatterij_exclusive_30',
      name: 'Exclusieve Thuisbatterij Leads - 30+',
      description: '30+ exclusieve thuisbatterij leads per maand',
      price: 4250, // €42.50 in cents
      currency: 'eur',
      industry: 'Thuisbatterijen',
      type: 'exclusive',
      quantity: 30,
      features: [
        '100% exclusieve leads',
        'Verse leads binnen 15 minuten',
        'Hoge conversiekans',
        'Nederlandse prospects',
        '24/7 support'
      ]
    },
    {
      id: 'thuisbatterij_shared_500',
      name: 'Gedeelde Thuisbatterij Leads - 500 stuks',
      description: '500 gedeelde thuisbatterij leads (gedeeld met 2 anderen)',
      price: 1250, // €12.50 in cents
      currency: 'eur',
      industry: 'Thuisbatterijen',
      type: 'shared',
      quantity: 500,
      features: [
        'Gedeeld met max 2 anderen',
        'Verse leads binnen 15 minuten',
        'Uitstekende prijs-kwaliteit',
        'Nederlandse prospects',
        'Email support'
      ]
    }
  ],
  'Zonnepanelen': [
    {
      id: 'zonnepanelen_exclusive_30',
      name: 'Exclusieve Zonnepanelen Leads - 30+',
      description: '30+ exclusieve zonnepanelen leads per maand',
      price: 4500, // €45.00 in cents
      currency: 'eur',
      industry: 'Zonnepanelen',
      type: 'exclusive',
      quantity: 30,
      features: [
        '100% exclusieve leads',
        'Verse leads binnen 15 minuten',
        'Hoge conversiekans',
        'Nederlandse prospects',
        '24/7 support'
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
