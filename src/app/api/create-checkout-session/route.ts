import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    console.log('🔵 Creating Stripe Checkout Session...');
    
    const body = await req.json();
    const { amount, currency = 'eur', customerInfo, orderDetails, paymentMethod } = body;

    // Basic validation
    if (!amount || amount <= 0 || !customerInfo?.email) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecretKey) {
      return NextResponse.json(
        { error: 'Stripe not configured' },
        { status: 500 }
      );
    }

    console.log('🔵 Creating checkout session for:', {
      amount,
      currency,
      paymentMethod,
      customerEmail: customerInfo.email
    });

    // Create Stripe Checkout Session with iDEAL
    const checkoutData = {
      'payment_method_types[]': paymentMethod === 'ideal' ? 'ideal' : 'card',
      'mode': 'payment',
      'success_url': `${process.env.NEXT_PUBLIC_BASE_URL || 'https://www.warmeleads.eu'}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      'cancel_url': `${process.env.NEXT_PUBLIC_BASE_URL || 'https://www.warmeleads.eu'}/payment-cancelled`,
      'customer_email': customerInfo.email,
      'line_items[0][price_data][currency]': currency,
      'line_items[0][price_data][product_data][name]': `${orderDetails?.leadType || 'Leads'} - ${orderDetails?.industry || 'Algemeen'}`,
      'line_items[0][price_data][product_data][description]': `${orderDetails?.quantity || 'Leads'} voor ${orderDetails?.industry || 'uw bedrijf'}`,
      'line_items[0][price_data][unit_amount]': amount.toString(),
      'line_items[0][quantity]': '1',
      'metadata[source]': 'warmeleads_checkout',
      'metadata[industry]': orderDetails?.industry || 'unknown',
      'metadata[leadType]': orderDetails?.leadType || 'unknown',
      'metadata[customerName]': customerInfo.name,
      'metadata[customerEmail]': customerInfo.email,
      'metadata[customerPhone]': customerInfo.phone || '',
      'metadata[customerCompany]': customerInfo.company || '',
    };

    const response = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${stripeSecretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams(checkoutData).toString(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Stripe Checkout Session error:', errorText);
      return NextResponse.json(
        { error: 'Checkout session creation failed', details: errorText },
        { status: 500 }
      );
    }

    const session = await response.json();
    
    console.log('✅ Checkout session created:', session.id);

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    });
    
  } catch (error) {
    console.error('❌ Checkout session error:', error);
    return NextResponse.json(
      { error: 'Internal error', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    );
  }
}


