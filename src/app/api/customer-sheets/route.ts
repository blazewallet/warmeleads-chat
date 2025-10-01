import { NextRequest, NextResponse } from 'next/server';
import { put, head, del } from '@vercel/blob';

// Blob store naam voor customer sheets
const BLOB_STORE_PREFIX = 'customer-sheets';

// Check if blob storage is configured
function isBlobStorageConfigured(): boolean {
  return !!process.env.BLOB_READ_WRITE_TOKEN;
}

// GET: Haal de Google Sheets URL op voor een klant
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const customerId = searchParams.get('customerId');
    
    if (!customerId) {
      return NextResponse.json(
        { error: 'Customer ID is required' },
        { status: 400 }
      );
    }

    // Probeer de URL op te halen uit blob storage
    const blobName = `${BLOB_STORE_PREFIX}/${customerId}.json`;
    
    try {
      // Check if blob exists
      const blobInfo = await head(blobName);
      
      if (!blobInfo) {
        return NextResponse.json(
          { error: 'No Google Sheets URL found for this customer' },
          { status: 404 }
        );
      }

      // Haal de blob content op
      const response = await fetch(blobInfo.url);
      const data = await response.json();
      
      return NextResponse.json({
        customerId: data.customerId,
        googleSheetUrl: data.googleSheetUrl,
        updatedAt: data.updatedAt
      });
    } catch (error) {
      console.error('Error fetching from blob:', error);
      return NextResponse.json(
        { error: 'No Google Sheets URL found for this customer' },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error('Error in GET /api/customer-sheets:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST: Sla een Google Sheets URL op voor een klant
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { customerId, googleSheetUrl } = body;
    
    console.log('📊 POST /api/customer-sheets - Incoming request:');
    console.log('  Customer ID:', customerId);
    console.log('  Google Sheets URL:', googleSheetUrl);
    console.log('  Blob storage configured:', isBlobStorageConfigured());
    
    if (!customerId || !googleSheetUrl) {
      console.error('❌ Missing required fields');
      return NextResponse.json(
        { error: 'Customer ID and Google Sheets URL are required' },
        { status: 400 }
      );
    }

    // Valideer of het een geldige Google Sheets URL is
    if (!googleSheetUrl.includes('docs.google.com/spreadsheets')) {
      console.error('❌ Invalid Google Sheets URL format');
      return NextResponse.json(
        { error: 'Invalid Google Sheets URL' },
        { status: 400 }
      );
    }

    // Check if blob storage is configured
    if (!isBlobStorageConfigured()) {
      console.error('❌ Blob storage not configured - missing BLOB_READ_WRITE_TOKEN');
      
      // Fallback: save to localStorage only (already done in admin page)
      console.log('ℹ️ Falling back to localStorage-only storage');
      
      return NextResponse.json({
        success: true,
        customerId,
        googleSheetUrl,
        blobUrl: null,
        warning: 'Saved to localStorage only - Blob storage not configured'
      });
    }

    // Sla op in blob storage
    const blobName = `${BLOB_STORE_PREFIX}/${customerId}.json`;
    const data = {
      customerId,
      googleSheetUrl,
      updatedAt: new Date().toISOString()
    };

    console.log('💾 Writing to blob storage:');
    console.log('  Blob name:', blobName);
    console.log('  Data:', data);

    // Check if blob already exists and delete it first
    try {
      const existingBlob = await head(blobName);
      if (existingBlob) {
        console.log('📝 Blob already exists, deleting old version...');
        await del(existingBlob.url);
        console.log('✅ Old blob deleted');
      }
    } catch (error) {
      // Blob doesn't exist, that's fine
      console.log('ℹ️ No existing blob found, creating new one');
    }

    const blob = await put(blobName, JSON.stringify(data), {
      access: 'public',
      addRandomSuffix: false,
      contentType: 'application/json'
    });

    console.log('✅ Successfully saved to blob storage!');
    console.log('  Blob URL:', blob.url);
    console.log('  Blob pathname:', blob.pathname);
    console.log(`✅ Saved Google Sheets URL for customer ${customerId}`);

    return NextResponse.json({
      success: true,
      customerId,
      googleSheetUrl,
      blobUrl: blob.url
    });
  } catch (error) {
    console.error('❌ Error in POST /api/customer-sheets:', error);
    console.error('Error details:', error instanceof Error ? error.message : 'Unknown error');
    
    // Return more detailed error
    return NextResponse.json(
      { 
        error: 'Failed to save to blob storage',
        details: error instanceof Error ? error.message : 'Unknown error',
        fallback: 'Data is saved to localStorage'
      },
      { status: 500 }
    );
  }
}

// DELETE: Verwijder een Google Sheets URL voor een klant
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const customerId = searchParams.get('customerId');
    
    if (!customerId) {
      return NextResponse.json(
        { error: 'Customer ID is required' },
        { status: 400 }
      );
    }

    // Verwijder uit blob storage
    const blobName = `${BLOB_STORE_PREFIX}/${customerId}.json`;
    
    try {
      // Delete by uploading null/empty
      await put(blobName, JSON.stringify({ customerId, googleSheetUrl: null, updatedAt: new Date().toISOString() }), {
        access: 'public',
        addRandomSuffix: false,
        contentType: 'application/json'
      });

      console.log(`🗑️ Removed Google Sheets URL for customer ${customerId}`);

      return NextResponse.json({
        success: true,
        message: 'Google Sheets URL removed'
      });
    } catch (error) {
      console.error('Error deleting from blob:', error);
      return NextResponse.json(
        { error: 'Failed to delete Google Sheets URL' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in DELETE /api/customer-sheets:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

