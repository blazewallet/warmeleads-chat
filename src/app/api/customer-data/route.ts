import { NextRequest, NextResponse } from 'next/server';
import { put, head, del, list } from '@vercel/blob';

// Blob store naam voor customer data
const BLOB_STORE_PREFIX = 'customer-data';

// Check if blob storage is configured
function isBlobStorageConfigured(): boolean {
  return !!process.env.BLOB_READ_WRITE_TOKEN;
}

// GET: Haal customer data op uit Blob Storage (alle customers of specifieke customer)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get('customerId');
    
    console.log('📊 GET /api/customer-data');
    console.log('  Customer ID:', customerId || 'ALL');
    console.log('  Blob storage configured:', isBlobStorageConfigured());
    
    if (!isBlobStorageConfigured()) {
      console.error('❌ Blob storage not configured');
      return NextResponse.json(
        { error: 'Blob storage not configured' },
        { status: 500 }
      );
    }

    // Als specifieke customer wordt gevraagd
    if (customerId) {
      const blobName = `${BLOB_STORE_PREFIX}/${customerId}.json`;
      
      try {
        const response = await fetch(`https://blob.vercel-storage.com/${blobName}`, {
          headers: {
            'Authorization': `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}`
          }
        });
        
        if (!response.ok) {
          console.log(`ℹ️ No blob found for customer ${customerId}`);
          return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
        }
        
        const data = await response.json();
        console.log(`✅ Loaded customer data for ${customerId}`);
        
        return NextResponse.json({
          success: true,
          customerData: data
        });
      } catch (error) {
        console.error(`❌ Error loading customer ${customerId}:`, error);
        return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
      }
    }
    
    // Haal alle customers op
    try {
      const { blobs } = await list({
        prefix: `${BLOB_STORE_PREFIX}/`,
        token: process.env.BLOB_READ_WRITE_TOKEN
      });
      
      console.log(`📋 Found ${blobs.length} customer blobs`);
      
      // Haal alle customer data op
      const customers = await Promise.all(
        blobs.map(async (blob) => {
          try {
            const response = await fetch(blob.url);
            const data = await response.json();
            return data;
          } catch (error) {
            console.error(`❌ Error loading blob ${blob.pathname}:`, error);
            return null;
          }
        })
      );
      
      // Filter out nulls
      const validCustomers = customers.filter(c => c !== null);
      console.log(`✅ Loaded ${validCustomers.length} customers`);
      
      return NextResponse.json({
        success: true,
        customers: validCustomers
      });
    } catch (error) {
      console.error('❌ Error listing customer blobs:', error);
      return NextResponse.json(
        { error: 'Failed to load customers', details: error instanceof Error ? error.message : 'Unknown error' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('❌ Error in GET /api/customer-data:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// POST: Sla customer data op in Blob Storage
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { customerId, customerData, whatsappConfig } = body;
    
    console.log('💾 POST /api/customer-data');
    console.log('  Customer ID:', customerId);
    console.log('  Email:', customerData?.email);
    console.log('  Has Google Sheet URL:', !!customerData?.googleSheetUrl);
    console.log('  Email notifications enabled:', customerData?.emailNotifications?.enabled);
    console.log('  Has WhatsApp config:', !!whatsappConfig);
    console.log('  Blob storage configured:', isBlobStorageConfigured());
    
    if (!customerId || (!customerData && !whatsappConfig)) {
      console.error('❌ Missing required fields');
      return NextResponse.json(
        { error: 'Customer ID and customer data or WhatsApp config are required' },
        { status: 400 }
      );
    }

    if (!isBlobStorageConfigured()) {
      console.error('❌ Blob storage not configured');
      return NextResponse.json(
        { error: 'Blob storage not configured' },
        { status: 500 }
      );
    }

    const blobName = `${BLOB_STORE_PREFIX}/${customerId}.json`;
    
    // If we're only updating WhatsApp config, get existing customer data first
    let dataToStore;
    if (whatsappConfig && !customerData) {
      // Only updating WhatsApp config, get existing customer data
      try {
        const existingResponse = await fetch(`https://blob.vercel-storage.com/${blobName}`, {
          headers: {
            'Authorization': `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}`
          }
        });
        
        if (existingResponse.ok) {
          const existingData = await existingResponse.json();
          dataToStore = {
            ...existingData,
            whatsappConfig,
            lastUpdated: new Date().toISOString()
          };
          console.log('📝 Updating existing customer data with WhatsApp config');
        } else {
          // No existing data, create new with just WhatsApp config
          dataToStore = {
            customerId,
            whatsappConfig,
            lastUpdated: new Date().toISOString()
          };
          console.log('📝 Creating new customer data with WhatsApp config');
        }
      } catch (error) {
        console.log('ℹ️ No existing customer data found, creating new with WhatsApp config');
        dataToStore = {
          customerId,
          whatsappConfig,
          lastUpdated: new Date().toISOString()
        };
      }
    } else {
      // Normal customer data update
      dataToStore = {
        ...customerData,
        customerId,
        lastUpdated: new Date().toISOString()
      };
    }

    console.log('💾 Writing customer data to blob storage:');
    console.log('  Blob name:', blobName);

    // Check if blob already exists and delete it first
    try {
      const existingBlob = await head(blobName);
      if (existingBlob) {
        console.log('📝 Blob already exists, deleting old version...');
        await del(existingBlob.url);
        console.log('✅ Old blob deleted');
      }
    } catch (error) {
      console.log('ℹ️ No existing blob found, creating new one');
    }

    // Write new blob
    const blob = await put(blobName, JSON.stringify(dataToStore), {
      access: 'public',
      addRandomSuffix: false,
      contentType: 'application/json'
    });

    console.log('✅ Successfully saved customer data to blob storage!');
    console.log('  Blob URL:', blob.url);
    console.log(`✅ Saved customer data for ${customerId}`);

    return NextResponse.json({
      success: true,
      customerId,
      blobUrl: blob.url
    });
  } catch (error) {
    console.error('❌ Error in POST /api/customer-data:', error);
    return NextResponse.json(
      { 
        error: 'Failed to save customer data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// DELETE: Verwijder customer data uit Blob Storage
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get('customerId');
    
    console.log('🗑️ DELETE /api/customer-data');
    console.log('  Customer ID:', customerId);
    
    if (!customerId) {
      return NextResponse.json(
        { error: 'Customer ID is required' },
        { status: 400 }
      );
    }

    if (!isBlobStorageConfigured()) {
      return NextResponse.json(
        { error: 'Blob storage not configured' },
        { status: 500 }
      );
    }

    const blobName = `${BLOB_STORE_PREFIX}/${customerId}.json`;
    
    try {
      const existingBlob = await head(blobName);
      if (existingBlob) {
        await del(existingBlob.url);
        console.log(`✅ Deleted customer data for ${customerId}`);
        
        return NextResponse.json({
          success: true,
          message: 'Customer data deleted'
        });
      } else {
        return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
      }
    } catch (error) {
      console.error(`❌ Error deleting customer ${customerId}:`, error);
      return NextResponse.json(
        { error: 'Failed to delete customer data' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('❌ Error in DELETE /api/customer-data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

