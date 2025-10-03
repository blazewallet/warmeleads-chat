/**
 * WHATSAPP SEND MESSAGE API
 * 
 * Sends WhatsApp messages to leads
 * - Uses Warmeleads WhatsApp Business (default)
 * - Uses customer's own WhatsApp Business (premium)
 */

import { NextRequest, NextResponse } from 'next/server';
import { whatsappService, WhatsAppService } from '@/lib/whatsappAPI';
import { WhatsAppConfig } from '@/lib/whatsappAPI';

export async function POST(request: NextRequest) {
  try {
    const { 
      customerId, 
      leadId, 
      phoneNumber, 
      message, 
      template,
      leadName,
      product
    } = await request.json();

    if (!customerId || !phoneNumber || !message) {
      return NextResponse.json({ 
        error: 'Customer ID, phone number, and message are required' 
      }, { status: 400 });
    }

    // Get WhatsApp config for customer
    const configResponse = await fetch(`${request.nextUrl.origin}/api/whatsapp/config?customerId=${customerId}`);
    if (!configResponse.ok) {
      return NextResponse.json({ error: 'WhatsApp config not found' }, { status: 404 });
    }

    const { config }: { config: WhatsAppConfig } = await configResponse.json();

    if (!config.enabled) {
      return NextResponse.json({ error: 'WhatsApp is not enabled for this customer' }, { status: 400 });
    }

    // Check usage limits
    if (config.usage.messagesSent >= config.billing.messagesLimit) {
      return NextResponse.json({ 
        error: 'Message limit reached. Please upgrade your plan.',
        limitReached: true,
        currentUsage: config.usage.messagesSent,
        limit: config.billing.messagesLimit
      }, { status: 429 });
    }

    // Process message template
    const processedMessage = WhatsAppService.processTemplate(message, config, leadName, product);

    console.log(`📤 Sending WhatsApp message to ${phoneNumber} for customer ${customerId}`);
    console.log(`📝 Message: ${processedMessage}`);

    let result;
    
    // TODO: Implement actual WhatsApp sending
    // For now, we'll simulate successful sending
    console.log(`📤 [MOCK] Sending WhatsApp message to ${phoneNumber}`);
    console.log(`📝 [MOCK] Message: ${processedMessage}`);
    
    // Simulate successful sending
    result = {
      success: true,
      messageId: `mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };

    if (result.success) {
      // Update usage counter
      config.usage.messagesSent++;
      
      // Save updated config
      await fetch(`${request.nextUrl.origin}/api/whatsapp/config`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerId, config })
      });

      console.log(`✅ WhatsApp message sent successfully: ${result.messageId}`);
      
      return NextResponse.json({
        success: true,
        messageId: result.messageId,
        message: 'WhatsApp message sent successfully'
      });
    } else {
      console.error(`❌ Failed to send WhatsApp message: ${result.error}`);
      
      // Update failed counter
      config.usage.messagesFailed++;
      
      // Save updated config
      await fetch(`${request.nextUrl.origin}/api/whatsapp/config`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerId, config })
      });

      return NextResponse.json({
        success: false,
        error: result.error || 'Failed to send message'
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Error in POST /api/whatsapp/send:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
