import { NextRequest, NextResponse } from 'next/server';
import { put, list } from '@vercel/blob';
import { DEFAULT_PRICING, type BranchPricingConfig } from '@/lib/pricing';
import { ADMIN_CONFIG } from '@/config/admin';

const PRICING_BLOB_NAME = 'pricing-config.json';

/**
 * GET /api/pricing
 * Fetch current pricing configuration
 */
export async function GET(request: NextRequest) {
  try {
    console.log('📊 GET /api/pricing - Fetching pricing configuration');

    // Try to fetch from Blob Storage
    try {
      const { blobs } = await list({ prefix: PRICING_BLOB_NAME });
      
      if (blobs.length > 0) {
        const blob = blobs[0];
        const response = await fetch(blob.url);
        const pricingData: BranchPricingConfig[] = await response.json();
        
        console.log('✅ Pricing loaded from Blob Storage');
        return NextResponse.json(pricingData);
      }
    } catch (blobError) {
      console.warn('⚠️ Blob Storage not available, using defaults:', blobError);
    }

    // Return default pricing if no custom pricing found
    console.log('📋 Using default pricing configuration');
    return NextResponse.json(DEFAULT_PRICING);

  } catch (error) {
    console.error('❌ Error in GET /api/pricing:', error);
    return NextResponse.json(DEFAULT_PRICING);
  }
}

/**
 * POST /api/pricing
 * Update pricing configuration (Admin only)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { adminEmail, pricing } = body;

    // Validate admin access
    if (!adminEmail || !ADMIN_CONFIG.adminEmails.includes(adminEmail)) {
      console.error('❌ Unauthorized pricing update attempt:', adminEmail);
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    if (!pricing || !Array.isArray(pricing)) {
      return NextResponse.json(
        { error: 'Invalid pricing data' },
        { status: 400 }
      );
    }

    console.log('📊 Updating pricing configuration:', {
      admin: adminEmail,
      branches: pricing.length
    });

    // Save to Blob Storage
    const blob = await put(PRICING_BLOB_NAME, JSON.stringify(pricing, null, 2), {
      access: 'public',
      addRandomSuffix: false,
      contentType: 'application/json',
    });

    console.log('✅ Pricing configuration updated successfully');

    return NextResponse.json({
      success: true,
      message: 'Pricing updated successfully',
      blobUrl: blob.url,
      branches: pricing.length
    });

  } catch (error) {
    console.error('❌ Error updating pricing:', error);
    return NextResponse.json(
      { error: 'Failed to update pricing', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/pricing
 * Update single branch pricing (Admin only)
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { adminEmail, branchId, branchPricing } = body;

    // Validate admin access
    if (!adminEmail || !ADMIN_CONFIG.adminEmails.includes(adminEmail)) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    if (!branchId || !branchPricing) {
      return NextResponse.json(
        { error: 'Missing branchId or branchPricing' },
        { status: 400 }
      );
    }

    console.log('📊 Updating pricing for branch:', branchId);

    // Fetch current pricing
    let currentPricing: BranchPricingConfig[] = DEFAULT_PRICING;
    
    try {
      const { blobs } = await list({ prefix: PRICING_BLOB_NAME });
      if (blobs.length > 0) {
        const response = await fetch(blobs[0].url);
        currentPricing = await response.json();
      }
    } catch (error) {
      console.warn('Using default pricing as base');
    }

    // Update specific branch
    const updatedPricing = currentPricing.map(p => 
      p.branchId === branchId ? { ...p, ...branchPricing } : p
    );

    // If branch doesn't exist, add it
    if (!updatedPricing.find(p => p.branchId === branchId)) {
      updatedPricing.push(branchPricing);
    }

    // Save to Blob Storage
    const blob = await put(PRICING_BLOB_NAME, JSON.stringify(updatedPricing, null, 2), {
      access: 'public',
      addRandomSuffix: false,
      contentType: 'application/json',
    });

    console.log('✅ Branch pricing updated successfully:', branchId);

    return NextResponse.json({
      success: true,
      message: `Pricing updated for ${branchId}`,
      blobUrl: blob.url
    });

  } catch (error) {
    console.error('❌ Error updating branch pricing:', error);
    return NextResponse.json(
      { error: 'Failed to update branch pricing', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
