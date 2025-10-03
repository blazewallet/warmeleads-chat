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
    
            // TWILIO WhatsApp Business API Implementation
            console.log(`📤 [TWILIO] Sending WhatsApp message to ${phoneNumber}`);
            console.log(`📝 [TWILIO] Message: ${processedMessage}`);
            
            // Get Twilio credentials from environment
            const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID;
            const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
            const twilioWhatsAppNumber = 'whatsapp:+31850477067'; // Your WhatsApp Business number
            const twilioMessagingServiceSid = 'MGdd1866d87a5fd62a061cd3a0d35af598'; // Your Messaging Service SID
            
            if (!twilioAccountSid || !twilioAuthToken) {
              console.error('❌ Twilio WhatsApp credentials not configured');
              return NextResponse.json({
                success: false,
                error: 'Twilio WhatsApp not configured. Please contact support.'
              }, { status: 500 });
            }
            
            // Format phone number for Twilio (whatsapp:+31...)
            const formattedPhone = phoneNumber.startsWith('whatsapp:') 
              ? phoneNumber 
              : `whatsapp:${phoneNumber.replace(/^\+/, '')}`;
            
            // Create Twilio API URL
            const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`;
            
            // Send message via Twilio WhatsApp API
            const twilioResponse = await fetch(twilioUrl, {
              method: 'POST',
              headers: {
                'Authorization': `Basic ${Buffer.from(`${twilioAccountSid}:${twilioAuthToken}`).toString('base64')}`,
                'Content-Type': 'application/x-www-form-urlencoded',
              },
              body: new URLSearchParams({
                MessagingServiceSid: twilioMessagingServiceSid, // Use Messaging Service instead of From
                To: formattedPhone, // whatsapp:+31612345678
                Body: processedMessage
              })
            });
            
            const twilioData = await twilioResponse.json();
            
            if (twilioResponse.ok && twilioData.sid) {
              result = {
                success: true,
                messageId: twilioData.sid
              };
              console.log(`✅ Twilio WhatsApp message sent successfully: ${result.messageId}`);
            } else {
              console.error('❌ Twilio WhatsApp API error:', twilioData);
              result = {
                success: false,
                error: twilioData.message || 'Failed to send WhatsApp message via Twilio'
              };
            }

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
      console.error(`❌ Failed to send WhatsApp message`);
      
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
        error: 'Failed to send message'
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
