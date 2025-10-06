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
      const storedConfig = await kv.get(`whatsapp-config:${customerId}`) as WhatsAppConfig | null;
      if (storedConfig) {
        console.log(`✅ WhatsApp config loaded from KV for customer ${customerId}:`, { enabled: storedConfig.enabled, businessName: storedConfig.businessName });
        return NextResponse.json({ config: storedConfig });
      }
    } catch (kvError) {
      console.log(`ℹ️ KV storage not available, trying customer data backup:`, kvError);
      
      // Fallback: Check customer data for WhatsApp config
      try {
        const customerDataResponse = await fetch(`${request.nextUrl.origin}/api/customer-data?customerId=${customerId}`);
        if (customerDataResponse.ok) {
          const customerData = await customerDataResponse.json();
          if (customerData.whatsappConfig) {
            console.log(`✅ WhatsApp config loaded from customer data backup for customer ${customerId}:`, { enabled: customerData.whatsappConfig.enabled, businessName: customerData.whatsappConfig.businessName });
            return NextResponse.json({ config: customerData.whatsappConfig });
          }
        }
      } catch (customerDataError) {
        console.log(`ℹ️ Customer data backup also failed:`, customerDataError);
      }
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
      const verifyConfig = await kv.get(`whatsapp-config:${customerId}`) as WhatsAppConfig | null;
      if (verifyConfig) {
        console.log(`🔍 Verification: Config saved correctly with enabled: ${verifyConfig.enabled}`);
        console.log(`🔍 Verification: Full saved config:`, JSON.stringify(verifyConfig, null, 2));
      } else {
        console.error(`❌ Verification failed: Could not read back saved config from KV`);
      }
    } catch (kvError) {
      console.error(`❌ Failed to save config to KV:`, kvError);
      console.log(`🔄 KV storage failed, but continuing with response...`);
      // Continue with the response even if KV fails
    }
    
    // Also store in customer data as backup
    try {
      const customerDataResponse = await fetch(`${request.nextUrl.origin}/api/customer-data`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId,
          whatsappConfig: configToSave
        })
      });
      
      if (customerDataResponse.ok) {
        console.log(`✅ WhatsApp config also saved to customer data for customer ${customerId}`);
      } else {
        console.log(`ℹ️ Failed to save WhatsApp config to customer data, but continuing...`);
      }
    } catch (customerDataError) {
      console.log(`ℹ️ Customer data backup failed, but continuing:`, customerDataError);
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