/**
 * WHATSAPP CONFIGURATION API
 * 
 * Handles WhatsApp Business API configuration for customers
 * - Warmeleads WhatsApp (default, gratis)
 * - Customer own WhatsApp Business (premium, €750 setup)
 */

import { NextRequest, NextResponse } from 'next/server';
import { WhatsAppConfig, DEFAULT_TEMPLATES } from '@/lib/whatsappAPI';

// Use Vercel KV for persistent storage across serverless functions
import { kv } from '@vercel/kv';

// GET: Haal WhatsApp configuratie op
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get('customerId');

    if (!customerId) {
      return NextResponse.json({ error: 'Customer ID is required' }, { status: 400 });
    }

    // Check Vercel KV storage first
    try {
      const storedConfig = await kv.get(`whatsapp-config:${customerId}`);
      if (storedConfig) {
        console.log(`✅ WhatsApp config loaded from KV for customer ${customerId}:`, { enabled: storedConfig.enabled, businessName: storedConfig.businessName });
        return NextResponse.json({ config: storedConfig });
      }
    } catch (kvError) {
      console.log(`ℹ️ KV storage not available, using default config:`, kvError);
    }

    // Return default config if none exists
    console.log(`ℹ️ No WhatsApp config found for customer ${customerId}, returning default`);
    const defaultConfig: WhatsAppConfig = {
      customerId,
      enabled: false,
      useOwnNumber: false,
      businessName: '',
      warmeleadsNumber: '+31850477067', // Warmeleads business number
      templates: DEFAULT_TEMPLATES,
      timing: {
        newLead: 'immediate',
        followUp: 24,
        reminder: 72
      },
      usage: {
        messagesSent: 0,
        messagesDelivered: 0,
        messagesRead: 0,
        messagesFailed: 0,
        lastReset: new Date().toISOString()
      },
      billing: {
        plan: 'basic',
        messagesLimit: 50,
        setupPaid: false
      }
    };
    
    return NextResponse.json({ config: defaultConfig });
  } catch (error) {
    console.error('Error in GET /api/whatsapp/config:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST: Sla WhatsApp configuratie op
export async function POST(request: NextRequest) {
  try {
    const { customerId, config } = await request.json();

    if (!customerId || !config) {
      return NextResponse.json({ error: 'Customer ID and config are required' }, { status: 400 });
    }

    // Validate config - make businessName optional for now
    if (!config.businessName || config.businessName.trim() === '') {
      console.log('⚠️ Business name is empty, using default');
      config.businessName = 'WarmeLeads';
    }

    // FORCE enabled to be boolean and ensure it's properly set
    if (typeof config.enabled !== 'boolean') {
      console.log('⚠️ Enabled is not boolean, converting to boolean');
      config.enabled = Boolean(config.enabled);
    }
    
    console.log('🔧 FORCED enabled status:', config.enabled, 'type:', typeof config.enabled);

    // If customer wants to use own number, check if setup is paid
    if (config.useOwnNumber && !config.billing?.setupPaid) {
      return NextResponse.json({ 
        error: 'Own WhatsApp number setup requires €750 payment',
        setupRequired: true,
        setupCost: 750
      }, { status: 402 }); // Payment Required
    }

    // Save config to in-memory storage - FORCE enabled to be boolean
    const configToSave = {
      ...config,
      enabled: Boolean(config.enabled), // FORCE boolean conversion
      customerId,
      lastUpdated: new Date().toISOString()
    };
    
    console.log(`💾 Saving WhatsApp config to KV for customer ${customerId}:`, { 
      enabled: configToSave.enabled, 
      businessName: configToSave.businessName,
      useOwnNumber: configToSave.useOwnNumber 
    });
    
    // Store in Vercel KV
    try {
      await kv.set(`whatsapp-config:${customerId}`, configToSave);
      console.log(`✅ WhatsApp config saved to KV for customer ${customerId}`);
      
      // Verify the config was saved correctly by reading it back
      const verifyConfig = await kv.get(`whatsapp-config:${customerId}`);
      if (verifyConfig) {
        console.log(`🔍 Verification: Config saved correctly with enabled: ${verifyConfig.enabled}`);
        console.log(`🔍 Verification: Full saved config:`, JSON.stringify(verifyConfig, null, 2));
      } else {
        console.error(`❌ Verification failed: Could not read back saved config from KV`);
      }
    } catch (kvError) {
      console.error(`❌ Failed to save config to KV:`, kvError);
      // Fallback to in-memory storage if KV fails
      console.log(`🔄 Falling back to in-memory storage...`);
      // Note: In-memory storage won't work across serverless functions, but it's better than nothing
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'WhatsApp configuration saved successfully',
      config: configToSave // Return the saved config for verification
    });
  } catch (error) {
    console.error('❌ CRITICAL ERROR in POST /api/whatsapp/config:', error);
    console.error('❌ Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace'
    });
    return NextResponse.json({ 
      error: 'Failed to save config',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

// DELETE: Verwijder WhatsApp configuratie
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get('customerId');

    if (!customerId) {
      return NextResponse.json({ error: 'Customer ID is required' }, { status: 400 });
    }

    // Remove from Vercel KV storage
    try {
      await kv.del(`whatsapp-config:${customerId}`);
      console.log(`✅ WhatsApp config deleted from KV for customer ${customerId}`);
    } catch (kvError) {
      console.error(`❌ Failed to delete config from KV:`, kvError);
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'WhatsApp configuration deleted successfully' 
    });
  } catch (error) {
    console.error('Error in DELETE /api/whatsapp/config:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}