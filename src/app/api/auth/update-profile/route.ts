import { NextRequest, NextResponse } from 'next/server';
import { put, head } from '@vercel/blob';
import bcrypt from 'bcryptjs';
import { ADMIN_CONFIG } from '@/config/admin';

interface AccountData {
  email: string;
  name?: string;
  company?: string;
  phone?: string;
  password: string;
  createdAt?: string;
  lastLogin?: string;
  isGuest?: boolean;
  updatedAt?: string;
}

export async function POST(request: NextRequest) {
  try {
    const { email, updates } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'E-mailadres is vereist' },
        { status: 400 }
      );
    }

    if (!updates || typeof updates !== 'object') {
      return NextResponse.json(
        { error: 'Ongeldige update gegevens' },
        { status: 400 }
      );
    }

    console.log('📝 Updating profile for:', email);

    // Check if BLOB_READ_WRITE_TOKEN is available
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      console.error('❌ BLOB_READ_WRITE_TOKEN environment variable is not set');
      return NextResponse.json(
        { error: 'Server configuratie fout' },
        { status: 500 }
      );
    }

    // Get current account data from Blob Storage
    const blobKey = `auth-accounts/${email.replace('@', '_at_').replace('.', '_dot_')}.json`;
    
    console.log('🔍 Looking for account data with key:', blobKey);
    
    try {
      // Check if blob exists first
      let accountData: AccountData;
      
      try {
        const blobExists = await head(blobKey, {
          token: process.env.BLOB_READ_WRITE_TOKEN,
        });
        
        if (blobExists) {
          console.log('✅ Blob exists, fetching data...');
          const existingResponse = await fetch(blobExists.url);
          if (existingResponse.ok) {
            accountData = await existingResponse.json();
            console.log('✅ Found existing account data');
          } else {
            throw new Error('Failed to fetch existing data');
          }
        } else {
          throw new Error('Blob does not exist');
        }
      } catch (fetchError) {
        console.log('ℹ️ No existing account data found, creating new:', fetchError);
        
        // Check if this is a demo account or admin account
        const isDemoAccount = ADMIN_CONFIG.demoAccount?.email === email;
        const isAdminAccount = ADMIN_CONFIG.adminEmails.includes(email);
        
        if (isDemoAccount || isAdminAccount) {
          console.log('ℹ️ This is a demo/admin account, using mock data');
          accountData = {
            email,
            name: isDemoAccount ? ADMIN_CONFIG.demoAccount.name : email.split('@')[0],
            company: isDemoAccount ? ADMIN_CONFIG.demoAccount.company : 'WarmeLeads BV',
            phone: '+31 85 047 7067',
            password: 'hashed_password_placeholder', // Demo accounts don't need real passwords
            createdAt: new Date().toISOString(),
            isGuest: false
          };
        } else {
          // Regular user - create minimal account
          accountData = {
            email,
            name: '',
            company: '',
            phone: '',
            password: '',
            createdAt: new Date().toISOString(),
            isGuest: false
          };
        }
      }

      // Update profile data
      const updatedAccountData = {
        ...accountData,
        email,
        name: updates.name || accountData.name || '',
        company: updates.company || accountData.company || '',
        phone: updates.phone || accountData.phone || '',
        updatedAt: new Date().toISOString(),
        // Keep existing fields like password, createdAt, etc.
        password: accountData.password,
        createdAt: accountData.createdAt || new Date().toISOString(),
        lastLogin: accountData.lastLogin,
        isGuest: accountData.isGuest || false
      };

      // Save updated account to Blob Storage
      const blobResponse = await put(blobKey, JSON.stringify(updatedAccountData, null, 2), {
        access: 'public',
        token: process.env.BLOB_READ_WRITE_TOKEN,
        allowOverwrite: true, // Allow overwriting existing blobs
      });

      console.log('✅ Profile updated successfully:', {
        email,
        updatedFields: Object.keys(updates),
        blobUrl: blobResponse.url
      });

      return NextResponse.json({
        success: true,
        message: 'Profiel succesvol bijgewerkt',
        updatedFields: Object.keys(updates)
      });

    } catch (blobError) {
      console.error('❌ Blob Storage error:', {
        error: blobError,
        message: blobError instanceof Error ? blobError.message : 'Unknown error',
        stack: blobError instanceof Error ? blobError.stack : undefined,
        blobKey,
        email
      });
      return NextResponse.json(
        { 
          error: 'Fout bij het opslaan van profiel wijzigingen',
          details: blobError instanceof Error ? blobError.message : 'Unknown error'
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('❌ Profile update error:', error);
    return NextResponse.json(
      { error: 'Er is een onverwachte fout opgetreden' },
      { status: 500 }
    );
  }
}
