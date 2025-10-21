import { NextRequest, NextResponse } from 'next/server';
import { list } from '@vercel/blob';
import bcrypt from 'bcryptjs';
import { ApiResponseHandler } from '@/lib/apiResponses';
import { safeLog } from '@/lib/logger';

const BLOB_STORE_PREFIX = 'auth-accounts';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    
    safeLog.log('🔐 POST /api/auth/login - Login attempt:', email);
    
    if (!email || !password) {
      return ApiResponseHandler.validationError('Email en wachtwoord zijn verplicht');
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
      
      // Fetch account data with cache-busting to ensure fresh data
      const response = await fetch(accountBlob.url, {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      
      if (!response.ok) {
        console.log('❌ Failed to fetch account blob data:', response.status);
        return NextResponse.json(
          { error: 'Fout bij ophalen account gegevens' },
          { status: 500 }
        );
      }
      
      const accountData = await response.json();
      console.log('🔍 Account data loaded:', { 
        email: accountData.email, 
        isActive: accountData.isActive,
        needsPasswordReset: accountData.needsPasswordReset,
        role: accountData.role
      });
      
      // Verify password
      const isValidPassword = await bcrypt.compare(password, accountData.password);
      
      if (!isValidPassword) {
        return NextResponse.json(
          { error: 'Ongeldig emailadres of wachtwoord' },
          { status: 401 }
        );
      }
      
      // Additional check for employee accounts
      if (accountData.role === 'employee') {
        if (!accountData.isActive) {
          console.log('❌ Employee account not active yet:', email);
          return NextResponse.json(
            { error: 'Account is nog niet geactiveerd. Probeer over een paar minuten opnieuw.' },
            { status: 401 }
          );
        }
        
        if (accountData.needsPasswordReset) {
          console.log('❌ Employee account still needs password reset:', email);
          return NextResponse.json(
            { error: 'Account setup is nog niet voltooid.' },
            { status: 401 }
          );
        }
      }
      
      console.log('✅ Login successful:', email, { 
        role: accountData.role, 
        isActive: accountData.isActive,
        needsPasswordReset: accountData.needsPasswordReset 
      });
      
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


