import { NextRequest, NextResponse } from 'next/server';
import { put, list, del } from '@vercel/blob';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const ownerEmail = searchParams.get('ownerEmail');

    if (!ownerEmail) {
      return NextResponse.json(
        { error: 'Owner email is required' },
        { status: 400 }
      );
    }

    console.log('📋 Getting company data for:', ownerEmail);

    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      console.error('❌ BLOB_READ_WRITE_TOKEN environment variable is not set');
      return NextResponse.json(
        { error: 'Server configuratie fout' },
        { status: 500 }
      );
    }

    const blobKey = `companies/${ownerEmail.replace('@', '_at_').replace(/\./g, '_dot_')}.json`;

    try {
      const { blobs } = await list({
        prefix: blobKey,
        token: process.env.BLOB_READ_WRITE_TOKEN
      });

      if (blobs.length === 0) {
        // Create default company data if it doesn't exist
        const defaultCompany = {
          id: ownerEmail,
          ownerEmail,
          companyName: '', // Will be set when needed
          employees: [],
          createdAt: new Date().toISOString()
        };

        await put(blobKey, JSON.stringify(defaultCompany, null, 2), {
          access: 'public',
          token: process.env.BLOB_READ_WRITE_TOKEN,
        });

        return NextResponse.json({
          success: true,
          company: defaultCompany
        });
      }

      const response = await fetch(blobs[0].url);
      if (!response.ok) {
        throw new Error('Failed to fetch company data');
      }

      const companyData = await response.json();

      return NextResponse.json({
        success: true,
        company: companyData
      });

    } catch (blobError) {
      console.error('❌ Blob Storage error:', blobError);
      return NextResponse.json(
        { error: 'Fout bij het ophalen van bedrijfsgegevens' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('❌ Get company error:', error);
    return NextResponse.json(
      { error: 'Er is een onverwachte fout opgetreden' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { ownerEmail, companyName, employeeEmail, employeeName, permissions } = await request.json();

    if (!ownerEmail) {
      return NextResponse.json(
        { error: 'Owner email is required' },
        { status: 400 }
      );
    }

    console.log('📝 POST /api/auth/company - Adding employee:', { ownerEmail, employeeEmail });

    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      console.error('❌ BLOB_READ_WRITE_TOKEN environment variable is not set');
      return NextResponse.json(
        { error: 'Server configuratie fout' },
        { status: 500 }
      );
    }

    const blobKey = `companies/${ownerEmail.replace('@', '_at_').replace(/\./g, '_dot_')}.json`;

    // Get existing company data
    let companyData;
    try {
      const { blobs } = await list({
        prefix: blobKey,
        token: process.env.BLOB_READ_WRITE_TOKEN
      });

      if (blobs.length > 0) {
        const response = await fetch(blobs[0].url);
        if (response.ok) {
          companyData = await response.json();
        }
      }
    } catch (error) {
      console.log('Creating new company data');
    }

    // If no existing data, create new
    if (!companyData) {
      companyData = {
        id: ownerEmail,
        ownerEmail,
        companyName: companyName || '',
        employees: [],
        createdAt: new Date().toISOString()
      };
    }

    // Add new employee if provided
    if (employeeEmail && employeeName) {
      const newEmployee = {
        email: employeeEmail,
        name: employeeName,
        role: 'employee' as const,
        permissions: permissions || {
          canViewLeads: true,
          canViewOrders: true,
          canManageEmployees: false,
          canCheckout: false,
        },
        invitedAt: new Date().toISOString(),
        isActive: false // Will be activated when they accept
      };

      // Check if employee already exists
      const existingIndex = companyData.employees.findIndex(
        (emp: any) => emp.email === employeeEmail
      );

      if (existingIndex >= 0) {
        companyData.employees[existingIndex] = newEmployee;
      } else {
        companyData.employees.push(newEmployee);
      }

      // Update company name if provided
      if (companyName) {
        companyData.companyName = companyName;
      }
    }

    // Save updated company data
    const blob = await put(blobKey, JSON.stringify(companyData, null, 2), {
      access: 'public',
      token: process.env.BLOB_READ_WRITE_TOKEN,
      allowOverwrite: true,
    });

    console.log('✅ Company data updated:', ownerEmail);

    return NextResponse.json({
      success: true,
      company: companyData
    });

  } catch (error) {
    console.error('❌ Error in POST /api/auth/company:', error);
    return NextResponse.json(
      { error: 'Fout bij het bijwerken van bedrijfsgegevens' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const ownerEmail = searchParams.get('ownerEmail');
    const employeeEmail = searchParams.get('employeeEmail');

    if (!ownerEmail || !employeeEmail) {
      return NextResponse.json(
        { error: 'Owner email and employee email are required' },
        { status: 400 }
      );
    }

    console.log('🗑️ Removing employee:', { ownerEmail, employeeEmail });

    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return NextResponse.json(
        { error: 'Server configuratie fout' },
        { status: 500 }
      );
    }

    const blobKey = `companies/${ownerEmail.replace('@', '_at_').replace(/\./g, '_dot_')}.json`;

    // Get existing company data
    try {
      const { blobs } = await list({
        prefix: blobKey,
        token: process.env.BLOB_READ_WRITE_TOKEN
      });

      if (blobs.length === 0) {
        return NextResponse.json(
          { error: 'Company not found' },
          { status: 404 }
        );
      }

      const response = await fetch(blobs[0].url);
      if (!response.ok) {
        throw new Error('Failed to fetch company data');
      }

      const companyData = await response.json();

      // Remove employee from company data
      companyData.employees = companyData.employees.filter(
        (emp: any) => emp.email !== employeeEmail
      );

      // Save updated company data
      await put(blobKey, JSON.stringify(companyData, null, 2), {
        access: 'public',
        token: process.env.BLOB_READ_WRITE_TOKEN,
        allowOverwrite: true,
      });

      // Also delete the employee account from Blob Storage
      const employeeBlobKey = `auth-accounts/${employeeEmail.replace('@', '_at_').replace(/\./g, '_dot_')}.json`;
      
      try {
        // Check if employee account exists
        const { blobs: employeeBlobs } = await list({
          prefix: employeeBlobKey,
          token: process.env.BLOB_READ_WRITE_TOKEN
        });

        if (employeeBlobs.length > 0) {
          // Delete the employee account blob using the blob name/key
          await del(employeeBlobKey, {
            token: process.env.BLOB_READ_WRITE_TOKEN
          });
          console.log('✅ Employee account deleted from Blob Storage:', employeeEmail);
        } else {
          console.log('ℹ️ Employee account not found in Blob Storage:', employeeEmail);
        }
      } catch (deleteError) {
        console.error('⚠️ Warning: Could not delete employee account from Blob Storage:', deleteError);
        // Don't fail the whole operation if account deletion fails
      }

      console.log('✅ Employee removed from company and account deleted:', employeeEmail);

      return NextResponse.json({
        success: true,
        message: 'Employee removed successfully'
      });

    } catch (blobError) {
      console.error('❌ Blob Storage error:', blobError);
      return NextResponse.json(
        { error: 'Fout bij het verwijderen van werknemer' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('❌ Error in DELETE /api/auth/company:', error);
    return NextResponse.json(
      { error: 'Er is een onverwachte fout opgetreden' },
      { status: 500 }
    );
  }
}
