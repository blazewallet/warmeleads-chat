import { NextRequest, NextResponse } from 'next/server';
import { put, list } from '@vercel/blob';
import bcrypt from 'bcryptjs';

const BLOB_STORE_PREFIX = 'auth-accounts';

export async function POST(request: NextRequest) {
  try {
    const { email, password, name, company, phone } = await request.json();
    
    console.log('📝 POST /api/auth/register - New registration:', email);
    
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Email, password en naam zijn verplicht' },
        { status: 400 }
      );
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Ongeldig emailadres' },
        { status: 400 }
      );
    }
    
    // Check if account already exists
    try {
      const { blobs } = await list({
        prefix: BLOB_STORE_PREFIX,
        token: process.env.BLOB_READ_WRITE_TOKEN
      });
      
      const accountBlob = blobs.find(b => b.pathname.includes(email.replace('@', '_at_').replace('.', '_')));
      
      if (accountBlob) {
        return NextResponse.json(
          { error: 'Dit emailadres is al geregistreerd' },
          { status: 409 }
        );
      }
    } catch (error) {
      console.error('Error checking existing accounts:', error);
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create account data
    const accountData = {
      email,
      password: hashedPassword,
      name,
      company: company || undefined,
      phone: phone || undefined,
      createdAt: new Date().toISOString(),
      isGuest: false,
      role: 'owner', // New accounts are owners by default
      permissions: {
        canViewLeads: true,
        canViewOrders: true,
        canManageEmployees: true,
        canCheckout: true,
      }
    };
    
    // Save to Blob Storage
    const blobName = `${BLOB_STORE_PREFIX}/${email.replace('@', '_at_').replace(/\./g, '_')}.json`;
    
    const blob = await put(blobName, JSON.stringify(accountData), {
      access: 'public',
      addRandomSuffix: false,
      contentType: 'application/json',
      token: process.env.BLOB_READ_WRITE_TOKEN
    });
    
    console.log('✅ Account created in Blob Storage:', email);
    
    // Return user data (without password)
    return NextResponse.json({
      success: true,
      user: {
        email,
        name,
        company,
        phone,
        createdAt: accountData.createdAt,
        isGuest: false
      }
    });
    
  } catch (error) {
    console.error('❌ Error in POST /api/auth/register:', error);
    return NextResponse.json(
      { error: 'Registratie mislukt', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}


