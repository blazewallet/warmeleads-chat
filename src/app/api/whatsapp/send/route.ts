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
    
    console.log(`📡 Send API: Config loaded for customer ${customerId}:`, { 
      enabled: config.enabled, 
      businessName: config.businessName,
      type: typeof config.enabled 
    });

    if (!config.enabled) {
      console.log(`❌ Send API: WhatsApp not enabled for customer ${customerId}`);
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

    // QUICKPULSE-STYLE TWILIO WHATSAPP BUSINESS API Implementation
    console.log(`📤 [QUICKPULSE-STYLE TWILIO] Sending WhatsApp message to ${phoneNumber}`);
    console.log(`📝 [QUICKPULSE-STYLE TWILIO] Message: ${processedMessage}`);
    
    // Get Twilio credentials from environment
    const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID;
    const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
    const twilioMessagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID;
    const twilioContentSid = process.env.TWILIO_CONTENT_SID; // Optional - can be null for direct messaging
    
    console.log(`🔑 Twilio Account SID: ${twilioAccountSid ? 'SET' : 'NOT SET'}`);
    console.log(`🔑 Twilio Auth Token: ${twilioAuthToken ? 'SET' : 'NOT SET'}`);
    console.log(`🔑 Twilio Messaging Service SID: ${twilioMessagingServiceSid ? 'SET' : 'NOT SET'}`);
    console.log(`🔑 Twilio Content SID: ${twilioContentSid ? 'SET' : 'NOT SET'}`);
    
    if (!twilioAccountSid || !twilioAuthToken || !twilioMessagingServiceSid) {
      console.error('❌ Twilio WhatsApp credentials not configured');
      return NextResponse.json({
        success: false,
        error: 'Twilio WhatsApp not configured. Please contact support.'
      }, { status: 500 });
    }
    
    // Format phone number for Twilio (whatsapp:+31...)
    const formattedPhone = phoneNumber.startsWith('whatsapp:') 
      ? phoneNumber 
      : `whatsapp:${phoneNumber.replace(/^\+/, '').replace(/\s/g, '')}`;
    
    console.log(`📞 Formatted phone: ${formattedPhone}`);
    
    // Create Twilio API URL
    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`;
    console.log(`🌐 Twilio API URL: ${twilioUrl}`);
    
    // EXACT QUICKPULSE IMPLEMENTATION - Always use ContentSid
    // QuickPulse always uses ContentSid, so we need to create a default one
    const defaultContentSid = twilioContentSid || 'HX1234567890abcdef1234567890abcdef'; // Default template
    
    // Prepare placeholders for Twilio template (exact QuickPulse style)
    const placeholders = {
      "1": leadName || "Lead",
      "2": config.businessName || "WarmeLeads"
    };
    
    // Prepare request body (EXACT QuickPulse style)
    const requestBody = new URLSearchParams({
      To: formattedPhone,
      MessagingServiceSid: twilioMessagingServiceSid,
      ContentSid: defaultContentSid,
      ContentVariables: JSON.stringify(placeholders)
    });
    
    console.log(`📝 Request body (EXACT QuickPulse style):`, {
      To: formattedPhone,
      MessagingServiceSid: twilioMessagingServiceSid,
      ContentSid: defaultContentSid,
      ContentVariables: JSON.stringify(placeholders)
    });
    
    // Send message via Twilio WhatsApp API (QuickPulse style)
    const twilioResponse = await fetch(twilioUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(`${twilioAccountSid}:${twilioAuthToken}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: requestBody
    });
    
    console.log(`📡 Twilio response status: ${twilioResponse.status}`);
    console.log(`📡 Twilio response headers:`, Object.fromEntries(twilioResponse.headers.entries()));
    
    const twilioData = await twilioResponse.json();
    console.log(`📡 Twilio response data:`, twilioData);
    
    let result;
    if (twilioResponse.ok && twilioData.sid) {
      result = {
        success: true,
        messageId: twilioData.sid
      };
      console.log(`✅ Twilio WhatsApp message sent successfully (QuickPulse style): ${result.messageId}`);
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
      
      // Log the message
      await WhatsAppService.logMessage({
        id: result.messageId,
        customerId,
        leadId: leadId || 'unknown',
        phoneNumber,
        message: processedMessage,
        template: template || 'newLead',
        status: 'sent',
        sentAt: new Date().toISOString(),
        type: 'template',
        templateName: template || 'newLead',
        direction: 'outgoing',
        retryCount: 0
      });

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
