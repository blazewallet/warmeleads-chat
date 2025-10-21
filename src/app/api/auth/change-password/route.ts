import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import bcrypt from 'bcryptjs';

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
    const { email, currentPassword, newPassword } = await request.json();

    if (!email || !currentPassword || !newPassword) {
      return NextResponse.json(
        { error: 'E-mailadres, huidig wachtwoord en nieuw wachtwoord zijn vereist' },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: 'Nieuw wachtwoord moet minimaal 6 karakters bevatten' },
        { status: 400 }
      );
    }

    console.log('🔐 Changing password for:', email);

    // Get current account data from Blob Storage
    const blobKey = `auth-accounts/${email.replace('@', '_at_').replace(/\./g, '_dot_')}.json`;
    
    try {
      // Get existing account data
      const existingResponse = await fetch(`https://blob.vercel-storage.com/${blobKey}`, {
        headers: {
          'Authorization': `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}`,
        },
      });

      if (!existingResponse.ok) {
        return NextResponse.json(
          { error: 'Account niet gevonden' },
          { status: 404 }
        );
      }

      const accountData: AccountData = await existingResponse.json();
      console.log('✅ Found existing account data');

      // Verify current password
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, accountData.password);
      if (!isCurrentPasswordValid) {
        return NextResponse.json(
          { error: 'Huidig wachtwoord is onjuist' },
          { status: 400 }
        );
      }

      // Hash new password
      const saltRounds = 12;
      const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

      // Update account data with new password
      const updatedAccountData = {
        ...accountData,
        password: hashedNewPassword,
        passwordChangedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Save updated account to Blob Storage
      const blobResponse = await put(blobKey, JSON.stringify(updatedAccountData, null, 2), {
        access: 'public',
        token: process.env.BLOB_READ_WRITE_TOKEN,
        allowOverwrite: true, // Allow overwriting existing blobs
      });

      console.log('✅ Password changed successfully:', {
        email,
        blobUrl: blobResponse.url,
        passwordChangedAt: updatedAccountData.passwordChangedAt
      });

      return NextResponse.json({
        success: true,
        message: 'Wachtwoord succesvol gewijzigd'
      });

    } catch (blobError) {
      console.error('❌ Blob Storage error:', blobError);
      return NextResponse.json(
        { error: 'Fout bij het wijzigen van wachtwoord' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('❌ Password change error:', error);
    return NextResponse.json(
      { error: 'Er is een onverwachte fout opgetreden' },
      { status: 500 }
    );
  }
}
