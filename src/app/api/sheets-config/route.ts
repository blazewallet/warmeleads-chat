import { NextRequest, NextResponse } from 'next/server';
import { put, del, list } from '@vercel/blob';

// Blob storage path for sheets configurations
const BLOB_PATH_PREFIX = 'sheets-config/';

// Type definition for sheets configuration
interface SheetsConfig {
  googleSheetUrl: string;
  googleSheetId: string;
  customerName: string;
  configuredAt: string;
}

// Load configuration for a specific email
async function loadConfig(email: string): Promise<SheetsConfig | null> {
  try {
    const blobPath = `${BLOB_PATH_PREFIX}${email}.json`;
    
    // List all blobs with the specific prefix
    const { blobs } = await list({ prefix: blobPath });
    
    if (blobs.length === 0) {
      return null;
    }
    
    // Get the blob content
    const response = await fetch(blobs[0].url);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error loading config from Blob:', error);
    return null;
  }
}

// Save configuration for a specific email
async function saveConfig(email: string, config: SheetsConfig): Promise<boolean> {
  try {
    const blobPath = `${BLOB_PATH_PREFIX}${email}.json`;
    
    // Store the config as JSON in Blob storage
    await put(blobPath, JSON.stringify(config, null, 2), {
      access: 'public',
      contentType: 'application/json',
    });
    
    return true;
  } catch (error) {
    console.error('Error saving config to Blob:', error);
    return false;
  }
}

// Delete configuration for a specific email
async function deleteConfig(email: string): Promise<boolean> {
  try {
    const blobPath = `${BLOB_PATH_PREFIX}${email}.json`;
    
    // List blobs with the specific prefix
    const { blobs } = await list({ prefix: blobPath });
    
    if (blobs.length > 0) {
      // Delete the blob
      await del(blobs[0].url);
    }
    
    return true;
  } catch (error) {
    console.error('Error deleting config from Blob:', error);
    return false;
  }
}

// GET: Retrieve Google Sheets configuration for a customer
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({ 
        success: false, 
        error: 'Email parameter is required' 
      }, { status: 400 });
    }

    const customerConfig = await loadConfig(email);

    if (!customerConfig) {
      return NextResponse.json({ 
        success: false, 
        error: 'No Google Sheets configuration found for this email' 
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      googleSheetUrl: customerConfig.googleSheetUrl,
      googleSheetId: customerConfig.googleSheetId,
      customerName: customerConfig.customerName,
      configuredAt: customerConfig.configuredAt
    });

  } catch (error) {
    console.error('Error retrieving sheets config:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

// POST: Store Google Sheets configuration for a customer
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, googleSheetUrl, customerName } = body;

    if (!email || !googleSheetUrl) {
      return NextResponse.json({ 
        success: false, 
        error: 'Email and Google Sheets URL are required' 
      }, { status: 400 });
    }

    // Validate Google Sheets URL
    if (!googleSheetUrl.includes('docs.google.com/spreadsheets')) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid Google Sheets URL' 
      }, { status: 400 });
    }

    // Extract sheet ID from URL
    const match = googleSheetUrl.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    if (!match) {
      return NextResponse.json({ 
        success: false, 
        error: 'Could not extract sheet ID from URL' 
      }, { status: 400 });
    }

    const googleSheetId = match[1];

    // Create config object
    const config: SheetsConfig = {
      googleSheetUrl,
      googleSheetId,
      customerName: customerName || email,
      configuredAt: new Date().toISOString()
    };

    // Save to Vercel Blob
    const saved = await saveConfig(email, config);

    if (!saved) {
      return NextResponse.json({
        success: false,
        error: 'Failed to save configuration'
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Google Sheets configuration saved successfully',
      googleSheetId
    });

  } catch (error) {
    console.error('Error saving sheets config:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

// DELETE: Remove Google Sheets configuration for a customer
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({ 
        success: false, 
        error: 'Email parameter is required' 
      }, { status: 400 });
    }

    const customerConfig = await loadConfig(email);
    
    if (!customerConfig) {
      return NextResponse.json({ 
        success: false, 
        error: 'No configuration found for this email' 
      }, { status: 404 });
    }

    const deleted = await deleteConfig(email);

    if (!deleted) {
      return NextResponse.json({
        success: false,
        error: 'Failed to delete configuration'
      }, { status: 500 });
    }
      
    return NextResponse.json({
      success: true,
      message: 'Google Sheets configuration removed successfully'
    });

  } catch (error) {
    console.error('Error deleting sheets config:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
