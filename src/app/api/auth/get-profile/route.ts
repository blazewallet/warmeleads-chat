import { NextRequest, NextResponse } from 'next/server';
import { head } from '@vercel/blob';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { error: 'E-mailadres is vereist' },
        { status: 400 }
      );
    }

    console.log('📋 Getting profile data for:', email);

    // Check if BLOB_READ_WRITE_TOKEN is available
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      console.error('❌ BLOB_READ_WRITE_TOKEN environment variable is not set');
      return NextResponse.json(
        { error: 'Server configuratie fout' },
        { status: 500 }
      );
    }

    // Get profile data from Blob Storage
    const blobKey = `auth-accounts/${email.replace('@', '_at_').replace('.', '_dot_')}.json`;
    
    try {
      // Check if blob exists
      const blobExists = await head(blobKey, {
        token: process.env.BLOB_READ_WRITE_TOKEN,
      });
      
      if (blobExists) {
        console.log('✅ Blob exists, fetching profile data...');
        const response = await fetch(blobExists.url);
        if (response.ok) {
          const accountData = await response.json();
          console.log('✅ Profile data retrieved successfully');
          
          return NextResponse.json({
            success: true,
            user: {
              email: accountData.email,
              name: accountData.name,
              company: accountData.company,
              phone: accountData.phone,
              updatedAt: accountData.updatedAt,
              role: accountData.role || 'owner',
              companyId: accountData.companyId,
              ownerEmail: accountData.ownerEmail,
              permissions: accountData.permissions || {
                canViewLeads: true,
                canViewOrders: true,
                canManageEmployees: accountData.role !== 'employee',
                canCheckout: accountData.role !== 'employee',
              }
            }
          });
        } else {
          throw new Error('Failed to fetch profile data');
        }
      } else {
        console.log('ℹ️ No profile data found in Blob Storage');
        return NextResponse.json(
          { error: 'Profiel niet gevonden' },
          { status: 404 }
        );
      }
    } catch (blobError) {
      console.error('❌ Blob Storage error:', blobError);
      return NextResponse.json(
        { 
          error: 'Fout bij het ophalen van profiel data',
          details: blobError instanceof Error ? blobError.message : 'Unknown error'
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('❌ Get profile error:', error);
    return NextResponse.json(
      { error: 'Er is een onverwachte fout opgetreden' },
      { status: 500 }
    );
  }
}

