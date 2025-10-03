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

    // If customer wants to use own number, check if setup is paid
    if (config.useOwnNumber && !config.billing?.setupPaid) {
      return NextResponse.json({ 
        error: 'Own WhatsApp number setup requires €750 payment',
        setupRequired: true,
        setupCost: 750
      }, { status: 402 }); // Payment Required
    }

    const blobName = `whatsapp-config/${customerId}.json`;
    
    // Save config to blob storage
    const configToSave = {
      ...config,
      customerId,
      lastUpdated: new Date().toISOString()
    };
    
    console.log(`💾 Saving WhatsApp config for customer ${customerId}:`, { 
      enabled: configToSave.enabled, 
      businessName: configToSave.businessName,
      useOwnNumber: configToSave.useOwnNumber 
    });
    
    await put(blobName, JSON.stringify(configToSave), { 
      access: 'public',
      allowOverwrite: true // Allow overwriting existing blobs
    });
    
    console.log(`✅ WhatsApp config saved for customer ${customerId}`);
    
    return NextResponse.json({ 
      success: true, 
      message: 'WhatsApp configuration saved successfully' 
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
