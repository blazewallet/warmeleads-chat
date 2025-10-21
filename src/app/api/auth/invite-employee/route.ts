import { NextRequest, NextResponse } from 'next/server';
import { put, list } from '@vercel/blob';
import bcrypt from 'bcryptjs';
import { sendEmployeeInvitationEmail } from '@/lib/emailService';

export async function POST(request: NextRequest) {
  try {
    const { ownerEmail, employeeEmail, employeeName, permissions } = await request.json();

    if (!ownerEmail || !employeeEmail || !employeeName) {
      return NextResponse.json(
        { error: 'Owner email, employee email en employee name zijn verplicht' },
        { status: 400 }
      );
    }

    console.log('📧 POST /api/auth/invite-employee - Inviting:', { ownerEmail, employeeEmail });

    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      console.error('❌ BLOB_READ_WRITE_TOKEN environment variable is not set');
      return NextResponse.json(
        { error: 'Server configuratie fout' },
        { status: 500 }
      );
    }

    // Check if employee account already exists
    const employeeBlobKey = `auth-accounts/${employeeEmail.replace('@', '_at_').replace(/\./g, '_dot_')}.json`;
    let employeeExists = false;
    let existingEmployeeData = null;
    
    try {
      const { blobs } = await list({
        prefix: employeeBlobKey,
        token: process.env.BLOB_READ_WRITE_TOKEN
      });

      if (blobs.length > 0) {
        employeeExists = true;
        // Get existing employee data to retrieve current info
        const response = await fetch(blobs[0].url);
        if (response.ok) {
          existingEmployeeData = await response.json();
        }
        console.log('📋 Employee account already exists:', employeeEmail);
      }
    } catch (error) {
      console.log('Employee account check:', error);
    }

    // Add employee to company (this will update or add to company list regardless)
    const companyResponse = await fetch(`${request.nextUrl.origin}/api/auth/company`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ownerEmail,
        employeeEmail,
        employeeName,
        permissions: permissions || {
          canViewLeads: true,
          canViewOrders: true,
          canManageEmployees: false,
          canCheckout: false,
        }
      })
    });

    if (!companyResponse.ok) {
      const error = await companyResponse.json();
      return NextResponse.json(
        { error: error.error || 'Fout bij het toevoegen aan bedrijf' },
        { status: 500 }
      );
    }

    let employeeAccountData;
    
    if (employeeExists && existingEmployeeData) {
      // Update existing employee account
      employeeAccountData = {
        ...existingEmployeeData,
        name: employeeName,
        companyId: ownerEmail,
        ownerEmail: ownerEmail,
        permissions: permissions || existingEmployeeData.permissions || {
          canViewLeads: true,
          canViewOrders: true,
          canManageEmployees: false,
          canCheckout: false,
        },
        updatedAt: new Date().toISOString()
      };
      console.log('📝 Updating existing employee account:', employeeEmail);
    } else {
      // Create new employee account
      const tempPassword = Math.random().toString(36).slice(-12) + 'A1!';
      const hashedPassword = await bcrypt.hash(tempPassword, 12);

      employeeAccountData = {
        email: employeeEmail,
        password: hashedPassword,
        name: employeeName,
        company: '', // Will be set from company data
        phone: '',
        createdAt: new Date().toISOString(),
        isGuest: false,
        role: 'employee',
        companyId: ownerEmail,
        ownerEmail: ownerEmail,
        permissions: permissions || {
          canViewLeads: true,
          canViewOrders: true,
          canManageEmployees: false,
          canCheckout: false,
        },
        needsPasswordReset: true, // Employee must set password on first login
        tempPassword: tempPassword // For email invitation
      };
      console.log('✅ Creating new employee account:', employeeEmail);
    }

    // Save employee account
    await put(employeeBlobKey, JSON.stringify(employeeAccountData, null, 2), {
      access: 'public',
      token: process.env.BLOB_READ_WRITE_TOKEN,
      allowOverwrite: true,
    });

    // Get owner info for email
    let ownerName = 'Eigenaar';
    try {
      const ownerBlobKey = `auth-accounts/${ownerEmail.replace('@', '_at_').replace(/\./g, '_dot_')}.json`;
      const { blobs } = await list({
        prefix: ownerBlobKey,
        token: process.env.BLOB_READ_WRITE_TOKEN
      });
      
      if (blobs.length > 0) {
        const ownerResponse = await fetch(blobs[0].url);
        if (ownerResponse.ok) {
          const ownerData = await ownerResponse.json();
          ownerName = ownerData.name || ownerEmail;
        }
      }
    } catch (error) {
      console.log('Could not fetch owner name:', error);
    }

    // Send invitation email
    const loginUrl = `${request.nextUrl.origin}/portal`;
    const emailSent = await sendEmployeeInvitationEmail({
      employeeName,
      employeeEmail,
      ownerName,
      ownerEmail,
      loginUrl
    });

    if (!emailSent) {
      console.warn('⚠️ Failed to send invitation email, but employee account was created');
    }
    
    const actionMessage = employeeExists ? 'Werknemer is toegevoegd' : 'Werknemer is uitgenodigd';
    
    return NextResponse.json({
      success: true,
      message: `${actionMessage}${emailSent ? ' en email is verzonden' : ' (email kon niet worden verzonden)'}`,
      employee: {
        email: employeeEmail,
        name: employeeName,
        needsPasswordReset: !employeeExists, // Only new employees need password reset
        existingAccount: employeeExists
      }
    });

  } catch (error) {
    console.error('❌ Error in POST /api/auth/invite-employee:', error);
    return NextResponse.json(
      { error: 'Fout bij het uitnodigen van werknemer' },
      { status: 500 }
    );
  }
}

