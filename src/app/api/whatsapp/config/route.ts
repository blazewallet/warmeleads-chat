/**
 * WHATSAPP CONFIGURATION API
 * 
 * Handles WhatsApp Business API configuration for customers
 * - Warmeleads WhatsApp (default, gratis)
 * - Customer own WhatsApp Business (premium, €750 setup)
 */

import { NextRequest, NextResponse } from 'next/server';
import { put, del } from '@vercel/blob';
import { WhatsAppConfig, DEFAULT_TEMPLATES } from '@/lib/whatsappAPI';

// GET: Haal WhatsApp configuratie op
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get('customerId');

    if (!customerId) {
      return NextResponse.json({ error: 'Customer ID is required' }, { status: 400 });
    }

    const blobName = `whatsapp-config/${customerId}.json`;
    
    try {
      const response = await fetch(`https://blob.vercel-storage.com/${blobName}`);
      if (response.ok) {
        const config = await response.json();
        // FORCE enabled to be boolean when loading
        config.enabled = Boolean(config.enabled);
        console.log(`✅ WhatsApp config loaded for customer ${customerId}:`, { enabled: config.enabled, businessName: config.businessName });
        return NextResponse.json({ config });
      } else {
        console.log(`ℹ️ No WhatsApp config found for customer ${customerId}, returning default`);
        // Return default config if none exists
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
      }
    } catch (error) {
      console.error('Error fetching WhatsApp config:', error);
      return NextResponse.json({ error: 'Failed to fetch config' }, { status: 500 });
    }
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

    const blobName = `whatsapp-config/${customerId}.json`;
    
    // Save config to blob storage - FORCE enabled to be boolean
    const configToSave = {
      ...config,
      enabled: Boolean(config.enabled), // FORCE boolean conversion
      customerId,
      lastUpdated: new Date().toISOString()
    };
    
    console.log(`💾 Saving WhatsApp config for customer ${customerId}:`, { 
      enabled: configToSave.enabled, 
      businessName: configToSave.businessName,
      useOwnNumber: configToSave.useOwnNumber 
    });
    
    console.log(`💾 Attempting to save blob: ${blobName}`);
    console.log(`💾 Config to save:`, JSON.stringify(configToSave, null, 2));
    
    try {
      // Delete existing blob first to ensure clean save
      try {
        await del(blobName);
        console.log(`🗑️ Deleted existing blob for customer ${customerId}`);
      } catch (deleteError) {
        console.log(`ℹ️ No existing blob to delete for customer ${customerId}`);
      }
      
      const blobResult = await put(blobName, JSON.stringify(configToSave), { 
        access: 'public',
        addRandomSuffix: false // Don't add random suffix
      });
      
      console.log(`💾 Blob save result:`, blobResult);
    } catch (blobError) {
      console.error(`❌ Blob save failed:`, blobError);
      throw blobError;
    }
    
    console.log(`✅ WhatsApp config saved for customer ${customerId}`);
    
    // Verify the config was saved correctly by reading it back
    try {
      const verifyResponse = await fetch(`https://blob.vercel-storage.com/${blobName}`);
      if (verifyResponse.ok) {
        const savedConfig = await verifyResponse.json();
        console.log(`🔍 Verification: Config saved correctly with enabled: ${savedConfig.enabled}`);
        console.log(`🔍 Verification: Full saved config:`, JSON.stringify(savedConfig, null, 2));
      } else {
        console.error(`❌ Verification failed: Could not read back saved config - Status: ${verifyResponse.status}`);
        // Try alternative verification method
        console.log(`🔍 Trying alternative verification...`);
        const altResponse = await fetch(`${request.nextUrl.origin}/api/whatsapp/config?customerId=${customerId}`);
        if (altResponse.ok) {
          const altConfig = await altResponse.json();
          console.log(`🔍 Alternative verification:`, altConfig);
        }
      }
    } catch (verifyError) {
      console.error(`❌ Verification error:`, verifyError);
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

    const blobName = `whatsapp-config/${customerId}.json`;
    
    try {
      await del(blobName);
      console.log(`✅ WhatsApp config deleted for customer ${customerId}`);
      
      return NextResponse.json({ 
        success: true, 
        message: 'WhatsApp configuration deleted successfully' 
      });
    } catch (error) {
      console.error('Error deleting WhatsApp config:', error);
      return NextResponse.json({ error: 'Failed to delete config' }, { status: 500 });
    }
  } catch (error) {
    console.error('Error in DELETE /api/whatsapp/config:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
