import { NextRequest, NextResponse } from 'next/server';
import { stripe, handleSuccessfulPayment } from '@/lib/stripe';
import Stripe from 'stripe';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get('stripe-signature')!;

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json(
        { error: 'Webhook signature verification failed' },
        { status: 400 }
      );
    }

    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log('Payment succeeded:', paymentIntent.id);
        
        // Process the successful payment
        await handleSuccessfulPayment(paymentIntent.id);
        
        // Send lead delivery notification
        await sendLeadDeliveryNotification(paymentIntent);
        
        // Add to admin dashboard
        await addOrderToAdmin(paymentIntent);
        
        break;
      }
      
      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log('Payment failed:', paymentIntent.id);
        
        // Handle failed payment
        await handleFailedPayment(paymentIntent);
        
        break;
      }
      
      case 'customer.created': {
        const customer = event.data.object as Stripe.Customer;
        console.log('Customer created:', customer.id);
        
        // Sync to CRM
        await syncCustomerToCRM(customer);
        
        break;
      }
      
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

async function sendLeadDeliveryNotification(paymentIntent: Stripe.PaymentIntent) {
  try {
    const customer = await stripe.customers.retrieve(paymentIntent.customer as string);
    
    if ('email' in customer && customer.email) {
      // Send confirmation email
      console.log('Sending lead delivery notification to:', customer.email);
      
      // Here you would integrate with your email service
      // Example: await sendEmail({
      //   to: customer.email,
      //   subject: 'Uw leads zijn onderweg! 🚀',
      //   template: 'lead-delivery-confirmation',
      //   data: {
      //     customerName: paymentIntent.metadata.customerName,
      //     packageId: paymentIntent.metadata.packageId,
      //     industry: paymentIntent.metadata.industry,
      //   }
      // });
    }
    
    // Trigger lead delivery process
    await triggerLeadDelivery({
      customerId: paymentIntent.customer as string,
      packageId: paymentIntent.metadata.packageId,
      quantity: parseInt(paymentIntent.metadata.quantity),
      industry: paymentIntent.metadata.industry,
      type: paymentIntent.metadata.type,
    });
    
  } catch (error) {
    console.error('Failed to send lead delivery notification:', error);
  }
}

async function handleFailedPayment(paymentIntent: Stripe.PaymentIntent) {
  try {
    const customer = await stripe.customers.retrieve(paymentIntent.customer as string);
    
    if ('email' in customer && customer.email) {
      // Send payment failure notification
      console.log('Sending payment failure notification to:', customer.email);
      
      // Here you would send a payment failure email with retry options
    }
    
  } catch (error) {
    console.error('Failed to handle payment failure:', error);
  }
}

async function syncCustomerToCRM(customer: Stripe.Customer) {
  try {
    // Here you would sync the customer to your CRM system
    // Example integrations: HubSpot, Salesforce, Pipedrive
    
    const crmData = {
      email: customer.email,
      name: customer.name,
      phone: customer.phone,
      company: customer.metadata.company,
      source: 'WarmeLeads Chat',
      createdAt: new Date(customer.created * 1000),
    };
    
    console.log('Syncing customer to CRM:', crmData);
    
    // Example HubSpot integration:
    // await hubspotClient.crm.contacts.basicApi.create({
    //   properties: {
    //     email: crmData.email,
    //     firstname: crmData.name?.split(' ')[0],
    //     lastname: crmData.name?.split(' ').slice(1).join(' '),
    //     phone: crmData.phone,
    //     company: crmData.company,
    //     hs_lead_status: 'NEW',
    //     lifecyclestage: 'lead',
    //   }
    // });
    
  } catch (error) {
    console.error('Failed to sync customer to CRM:', error);
  }
}

async function triggerLeadDelivery(orderData: {
  customerId: string;
  packageId: string;
  quantity: number;
  industry: string;
  type: string;
}) {
  try {
    // Here you would trigger your lead delivery system
    console.log('Triggering lead delivery:', orderData);
    
    // This could involve:
    // 1. Calling your lead generation API
    // 2. Scheduling lead delivery jobs
    // 3. Updating inventory systems
    // 4. Setting up automated follow-ups
    
    // Example:
    // await leadDeliveryService.scheduleDelivery({
    //   customerId: orderData.customerId,
    //   leads: await generateLeads(orderData.industry, orderData.quantity),
    //   deliveryTime: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
    //   type: orderData.type,
    // });
    
  } catch (error) {
    console.error('Failed to trigger lead delivery:', error);
  }
}

// Voeg bestelling toe aan admin dashboard
async function addOrderToAdmin(paymentIntent: any) {
  try {
    const orderData = {
      orderNumber: `WL-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`,
      customerName: paymentIntent.metadata.customerName || 'Onbekend',
      customerEmail: paymentIntent.receipt_email || 'onbekend@email.com',
      industry: paymentIntent.metadata.industry || 'Onbekend',
      leadType: paymentIntent.metadata.leadType || 'Leads',
      quantity: paymentIntent.metadata.quantity || '1',
      amount: paymentIntent.amount / 100, // Convert from cents
      status: 'completed',
      orderDate: new Date().toISOString(),
      paymentMethod: 'Stripe',
      paymentIntentId: paymentIntent.id
    };

    console.log('📋 Echte bestelling toegevoegd aan admin:', orderData);
    
    // In productie zou dit naar database gaan
    // Voor nu loggen we het voor tracking
    
    return orderData;
    
  } catch (error) {
    console.error('Failed to add order to admin:', error);
  }
}

export async function GET() {
  return NextResponse.json({ message: 'Stripe webhook endpoint' });
}
