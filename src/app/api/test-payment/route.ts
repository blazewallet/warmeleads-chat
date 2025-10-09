import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log('Test payment request received:', body);
    
    // Simulate successful response
    return NextResponse.json({
      clientSecret: 'pi_test_1234567890_secret_test123',
      paymentIntentId: 'pi_test_1234567890',
      testMode: true
    });
  } catch (error) {
    console.error('Test payment error:', error);
    return NextResponse.json(
      { error: 'Test payment failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}


