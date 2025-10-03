/**
 * WHATSAPP WEBHOOK API
 * 
 * Handles webhook events from WhatsApp Business API
 * - Message status updates (sent, delivered, read, failed)
 * - Incoming messages
 */

import { NextRequest, NextResponse } from 'next/server';
import { whatsappService } from '@/lib/whatsappAPI';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log('📨 WhatsApp webhook received:', JSON.stringify(body, null, 2));

    // Handle different webhook events
    if (body.entry) {
      for (const entry of body.entry) {
        if (entry.changes) {
          for (const change of entry.changes) {
            if (change.field === 'messages') {
              await handleMessageEvents(change.value);
            }
          }
        }
      }
    }

    return NextResponse.json({ status: 'ok' });
  } catch (error) {
    console.error('Error in WhatsApp webhook:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}

// Handle message events
async function handleMessageEvents(value: any) {
  try {
    // Handle status updates
    if (value.statuses) {
      for (const status of value.statuses) {
        await handleStatusUpdate(status);
      }
    }

    // Handle incoming messages
    if (value.messages) {
      for (const message of value.messages) {
        await handleIncomingMessage(message);
      }
    }
  } catch (error) {
    console.error('Error handling message events:', error);
  }
}

// Handle status updates
async function handleStatusUpdate(status: any) {
  try {
    const { id, status: messageStatus, timestamp } = status;
    
    console.log(`📊 Message status update: ${id} -> ${messageStatus}`);
    
    // Update message status in our system
    await whatsappService.updateMessageStatus(id, messageStatus);
    
    // Log status update
    console.log(`✅ Message ${id} status updated to ${messageStatus}`);
  } catch (error) {
    console.error('Error handling status update:', error);
  }
}

// Handle incoming messages
async function handleIncomingMessage(message: any) {
  try {
    const { id, from, timestamp, type, text } = message;
    
    console.log(`📨 Incoming message from ${from}: ${text?.body || 'non-text message'}`);
    
    // Store incoming message
    // This could trigger auto-responses or notifications
    
    // For now, just log it
    console.log(`✅ Incoming message ${id} processed`);
  } catch (error) {
    console.error('Error handling incoming message:', error);
  }
}

// GET: Webhook verification (for Meta)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const mode = searchParams.get('hub.mode');
    const token = searchParams.get('hub.verify_token');
    const challenge = searchParams.get('hub.challenge');

    // Verify webhook
    if (mode === 'subscribe' && token === process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN) {
      console.log('✅ WhatsApp webhook verified');
      return new NextResponse(challenge);
    } else {
      console.log('❌ WhatsApp webhook verification failed');
      return NextResponse.json({ error: 'Verification failed' }, { status: 403 });
    }
  } catch (error) {
    console.error('Error in WhatsApp webhook verification:', error);
    return NextResponse.json({ error: 'Verification error' }, { status: 500 });
  }
}
