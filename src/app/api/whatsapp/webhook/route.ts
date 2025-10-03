/**
 * TWILIO WHATSAPP WEBHOOK API
 * 
 * Handles webhook events from Twilio WhatsApp Business API
 * - Message status updates (sent, delivered, read, failed)
 * - Incoming messages
 */

import { NextRequest, NextResponse } from 'next/server';
import { whatsappService } from '@/lib/whatsappAPI';

export async function POST(request: NextRequest) {
  try {
    // Twilio sends form data, not JSON
    const formData = await request.formData();
    const body = Object.fromEntries(formData.entries());
    
    console.log('📨 Twilio WhatsApp webhook received:', JSON.stringify(body, null, 2));

    // Handle Twilio webhook events
    const messageSid = body.MessageSid;
    const messageStatus = body.MessageStatus;
    const from = body.From;
    const to = body.To;
    const bodyText = body.Body;

    if (messageSid && messageStatus) {
      // Handle message status update
      await handleTwilioStatusUpdate(messageSid, messageStatus);
    }

    if (from && to && bodyText) {
      // Handle incoming message
      await handleTwilioIncomingMessage(messageSid, from, to, bodyText);
    }

    return NextResponse.json({ status: 'ok' });
  } catch (error) {
    console.error('Error in Twilio WhatsApp webhook:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}

// Handle Twilio status updates
async function handleTwilioStatusUpdate(messageSid: string, messageStatus: string) {
  try {
    console.log(`📊 Twilio message status update: ${messageSid} -> ${messageStatus}`);
    
    // Map Twilio status to our status format
    let mappedStatus = messageStatus;
    if (messageStatus === 'sent') mappedStatus = 'sent';
    else if (messageStatus === 'delivered') mappedStatus = 'delivered';
    else if (messageStatus === 'read') mappedStatus = 'read';
    else if (messageStatus === 'failed') mappedStatus = 'failed';
    
    // Update message status in our system
    await whatsappService.updateMessageStatus(messageSid, mappedStatus);
    
    console.log(`✅ Twilio message ${messageSid} status updated to ${mappedStatus}`);
  } catch (error) {
    console.error('Error handling Twilio status update:', error);
  }
}

// Handle Twilio incoming messages
async function handleTwilioIncomingMessage(messageSid: string, from: string, to: string, bodyText: string) {
  try {
    console.log(`📨 Twilio incoming message from ${from}: ${bodyText}`);
    
    // Store incoming message
    // This could trigger auto-responses or notifications
    
    console.log(`✅ Twilio incoming message ${messageSid} processed`);
  } catch (error) {
    console.error('Error handling Twilio incoming message:', error);
  }
}

// GET: Health check for Twilio webhook
export async function GET(request: NextRequest) {
  try {
    console.log('✅ Twilio WhatsApp webhook health check');
    return NextResponse.json({ 
      status: 'ok', 
      service: 'Twilio WhatsApp Webhook',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in Twilio WhatsApp webhook health check:', error);
    return NextResponse.json({ error: 'Health check failed' }, { status: 500 });
  }
}
