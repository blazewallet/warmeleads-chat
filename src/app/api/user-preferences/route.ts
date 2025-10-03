/**
 * USER PREFERENCES API
 * 
 * Slaat gebruikersvoorkeuren op in Vercel Blob Storage
 * - View mode (list/pipeline)
 * - Andere UI voorkeuren
 */

import { NextRequest, NextResponse } from 'next/server';
import { put, del } from '@vercel/blob';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const customerId = searchParams.get('customerId');

  if (!customerId) {
    return NextResponse.json({ error: 'Customer ID is required' }, { status: 400 });
  }

    try {
      const blobName = `user-preferences/${customerId}.json`;
      
      try {
        // Try to fetch the blob using fetch instead of get
        const response = await fetch(`https://blob.vercel-storage.com/${blobName}`);
        if (response.ok) {
          const preferences = await response.json();
          return NextResponse.json({ preferences });
        } else {
          throw new Error('Blob not found');
        }
      } catch (error) {
        // No preferences found, return defaults
        return NextResponse.json({ 
          preferences: {
            viewMode: 'list', // Default to list view
            theme: 'dark',
            notifications: true
          }
        });
      }
  } catch (error) {
    console.error('Error fetching user preferences:', error);
    return NextResponse.json({ error: 'Failed to fetch preferences' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { customerId, preferences } = await request.json();

    if (!customerId) {
      return NextResponse.json({ error: 'Customer ID is required' }, { status: 400 });
    }

    const blobName = `user-preferences/${customerId}.json`;
    
    // Save preferences to blob storage
    await put(blobName, JSON.stringify(preferences), { access: 'public' });
    
    console.log(`✅ User preferences saved for customer ${customerId}:`, preferences);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Preferences saved successfully' 
    });
  } catch (error) {
    console.error('Error saving user preferences:', error);
    return NextResponse.json({ error: 'Failed to save preferences' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const customerId = searchParams.get('customerId');

  if (!customerId) {
    return NextResponse.json({ error: 'Customer ID is required' }, { status: 400 });
  }

  try {
    const blobName = `user-preferences/${customerId}.json`;
    await del(blobName);
    
    console.log(`✅ User preferences deleted for customer ${customerId}`);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Preferences deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting user preferences:', error);
    return NextResponse.json({ error: 'Failed to delete preferences' }, { status: 500 });
  }
}
