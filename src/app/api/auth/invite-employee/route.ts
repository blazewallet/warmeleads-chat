import { NextRequest, NextResponse } from 'next/server';
import { put, list } from '@vercel/blob';
import bcrypt from 'bcryptjs';

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
    const employeeBlobKey = `auth-accounts/${employeeEmail.replace('@', '_at_').replace('.', '_dot_')}.json`;
    
    try {
      const { blobs } = await list({
        prefix: employeeBlobKey,
        token: process.env.BLOB_READ_WRITE_TOKEN
      });

      if (blobs.length > 0) {
        return NextResponse.json(
          { error: 'Er bestaat al een account met dit emailadres' },
          { status: 409 }
        );
      }
    } catch (error) {
      console.log('Employee account check:', error);
    }

    // Add employee to company
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

    // Create temporary password (employee will reset it on first login)
    const tempPassword = Math.random().toString(36).slice(-12) + 'A1!';
    const hashedPassword = await bcrypt.hash(tempPassword, 12);

    // Create employee account data
    const employeeAccountData = {
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

    // Save employee account
    const employeeBlob = await put(employeeBlobKey, JSON.stringify(employeeAccountData, null, 2), {
      access: 'public',
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    console.log('✅ Employee account created:', employeeEmail);

    // TODO: Send invitation email here with tempPassword or setup link
    
    return NextResponse.json({
      success: true,
      message: 'Werknemer is uitgenodigd',
      employee: {
        email: employeeEmail,
        name: employeeName,
        needsPasswordReset: true,
        tempPassword: tempPassword // In production, don't return this - send via email
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

