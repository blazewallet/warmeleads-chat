import { NextRequest, NextResponse } from 'next/server';
import { list } from '@vercel/blob';
import bcrypt from 'bcryptjs';

const BLOB_STORE_PREFIX = 'auth-accounts';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    
    console.log('🔐 POST /api/auth/login - Login attempt:', email);
    
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email en wachtwoord zijn verplicht' },
        { status: 400 }
      );
    }
    
    // Find account in Blob Storage
    try {
      const { blobs } = await list({
        prefix: BLOB_STORE_PREFIX,
        token: process.env.BLOB_READ_WRITE_TOKEN
      });
      
      const expectedBlobPath = `auth-accounts/${email.replace('@', '_at_').replace(/\./g, '_dot_')}.json`;
      console.log('🔍 Looking for account blob:', expectedBlobPath);
      console.log('📋 Available blobs:', blobs.map(b => b.pathname));
      
      const accountBlob = blobs.find(b => b.pathname === expectedBlobPath);
      
      if (!accountBlob) {
        console.log('❌ Account blob not found for:', email);
        console.log('🔍 Expected path:', expectedBlobPath);
        return NextResponse.json(
          { error: 'Ongeldig emailadres of wachtwoord' },
          { status: 401 }
        );
      }
      
      console.log('✅ Found account blob:', accountBlob.pathname);
      
      // Fetch account data
      const response = await fetch(accountBlob.url);
      const accountData = await response.json();
      
      // Verify password
      const isValidPassword = await bcrypt.compare(password, accountData.password);
      
      if (!isValidPassword) {
        return NextResponse.json(
          { error: 'Ongeldig emailadres of wachtwoord' },
          { status: 401 }
        );
      }
      
      console.log('✅ Login successful:', email);
      
      // Return user data (without password) including employee/role info
      return NextResponse.json({
        success: true,
        user: {
          email: accountData.email,
          name: accountData.name,
          company: accountData.company,
          phone: accountData.phone,
          createdAt: accountData.createdAt,
          isGuest: false,
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
      
    } catch (error) {
      console.error('Error fetching account:', error);
      return NextResponse.json(
        { error: 'Login mislukt' },
        { status: 500 }
      );
    }
    
  } catch (error) {
    console.error('❌ Error in POST /api/auth/login:', error);
    return NextResponse.json(
      { error: 'Login mislukt', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}


