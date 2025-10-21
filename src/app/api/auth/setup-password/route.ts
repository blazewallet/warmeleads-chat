import { NextRequest, NextResponse } from 'next/server';
import { put, list } from '@vercel/blob';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const { email, newPassword } = await request.json();

    if (!email || !newPassword) {
      return NextResponse.json(
        { error: 'E-mailadres en nieuw wachtwoord zijn vereist' },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: 'Nieuw wachtwoord moet minimaal 6 karakters bevatten' },
        { status: 400 }
      );
    }

    console.log('🔐 Setting up password for employee:', email);

    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      console.error('❌ BLOB_READ_WRITE_TOKEN environment variable is not set');
      return NextResponse.json(
        { error: 'Server configuratie fout' },
        { status: 500 }
      );
    }

    const blobKey = `auth-accounts/${email.replace('@', '_at_').replace(/\./g, '_dot_')}.json`;
    
    try {
      // Get existing account data
      const { blobs } = await list({
        prefix: blobKey,
        token: process.env.BLOB_READ_WRITE_TOKEN
      });

      if (blobs.length === 0) {
        return NextResponse.json(
          { error: 'Account niet gevonden' },
          { status: 404 }
        );
      }

      const response = await fetch(blobs[0].url);
      if (!response.ok) {
        return NextResponse.json(
          { error: 'Kan account gegevens niet ophalen' },
          { status: 500 }
        );
      }

      const accountData = await response.json();

      // Verify this is an employee account that needs password reset
      if (!accountData.needsPasswordReset) {
        return NextResponse.json(
          { error: 'Dit account heeft geen wachtwoord reset nodig' },
          { status: 400 }
        );
      }

      // Hash new password
      const hashedNewPassword = await bcrypt.hash(newPassword, 12);

      // Update account data with new password and remove needsPasswordReset flag
      const updatedAccountData = {
        ...accountData,
        password: hashedNewPassword,
        needsPasswordReset: false,
        passwordChangedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Remove tempPassword field for security
      delete updatedAccountData.tempPassword;

      // Save updated account to Blob Storage
      await put(blobKey, JSON.stringify(updatedAccountData, null, 2), {
        access: 'public',
        token: process.env.BLOB_READ_WRITE_TOKEN,
        allowOverwrite: true,
      });

      console.log('✅ Password setup successful for employee:', email);

      return NextResponse.json({
        success: true,
        message: 'Wachtwoord succesvol ingesteld. U kunt nu inloggen.',
        user: {
          email: accountData.email,
          name: accountData.name,
          role: accountData.role,
          companyId: accountData.companyId,
          ownerEmail: accountData.ownerEmail,
          permissions: accountData.permissions
        }
      });

    } catch (blobError) {
      console.error('❌ Blob Storage error:', blobError);
      return NextResponse.json(
        { error: 'Fout bij het instellen van wachtwoord' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('❌ Password setup error:', error);
    return NextResponse.json(
      { error: 'Er is een onverwachte fout opgetreden' },
      { status: 500 }
    );
  }
}
