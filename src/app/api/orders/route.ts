import { NextRequest, NextResponse } from 'next/server';
import { put, list, head, del } from '@vercel/blob';

export interface Order {
  id: string;
  orderNumber: string;
  customerEmail: string;
  customerName: string;
  customerCompany?: string;
  packageId: string;
  packageName: string;
  industry: string;
  leadType: 'exclusive' | 'shared';
  quantity: number;
  pricePerLead: number; // Per lead price EXCLUDING VAT (in cents)
  totalAmount: number; // Total amount EXCLUDING VAT (in cents)
  vatAmount: number; // VAT amount (in cents)
  totalAmountInclVAT: number; // Total amount INCLUDING VAT (in cents)
  vatPercentage: number; // VAT percentage (e.g., 21)
  currency: string;
  status: 'pending' | 'completed' | 'delivered' | 'cancelled';
  paymentMethod: string;
  paymentIntentId?: string;
  sessionId?: string;
  invoiceNumber?: string;
  invoiceUrl?: string;
  createdAt: string;
  deliveredAt?: string;
  leads?: number; // Actual leads delivered
  conversions?: number; // Conversions from leads
}

// GET - Fetch orders for a customer
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const customerEmail = searchParams.get('customerEmail');

    if (!customerEmail) {
      return NextResponse.json(
        { error: 'Customer email is required' },
        { status: 400 }
      );
    }

    console.log('📦 Fetching orders for customer:', customerEmail);

    // List all order blobs for this customer
    const { blobs } = await list({
      prefix: `orders/${customerEmail.replace('@', '_at_').replace(/\./g, '_')}/`,
    });

    if (blobs.length === 0) {
      console.log('📦 No orders found for customer:', customerEmail);
      return NextResponse.json({ orders: [] });
    }

    // Fetch all order data
    const orders: Order[] = [];
    for (const blob of blobs) {
      try {
        const response = await fetch(blob.url);
        const order = await response.json();
        orders.push(order);
      } catch (error) {
        console.error('Error fetching order blob:', blob.pathname, error);
      }
    }

    // Sort by creation date (newest first)
    orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    console.log(`✅ Found ${orders.length} order(s) for customer:`, customerEmail);

    return NextResponse.json({ orders });
  } catch (error) {
    console.error('❌ Error fetching orders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// POST - Create a new order
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { order } = body as { order: Order };

    if (!order || !order.customerEmail) {
      return NextResponse.json(
        { error: 'Order data with customerEmail is required' },
        { status: 400 }
      );
    }

    console.log('📦 Creating new order:', order.orderNumber);

    // Generate unique blob path for this order
    const emailSlug = order.customerEmail.replace('@', '_at_').replace(/\./g, '_');
    const orderPath = `orders/${emailSlug}/${order.orderNumber}.json`;

    // Save order to Blob Storage
    const blob = await put(orderPath, JSON.stringify(order, null, 2), {
      access: 'public',
      contentType: 'application/json',
    });

    console.log('✅ Order saved to Blob Storage:', blob.url);

    return NextResponse.json({
      success: true,
      order,
      blobUrl: blob.url,
    });
  } catch (error) {
    console.error('❌ Error creating order:', error);
    return NextResponse.json(
      { error: 'Failed to create order', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// PUT - Update an existing order
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderNumber, customerEmail, updates } = body;

    if (!orderNumber || !customerEmail) {
      return NextResponse.json(
        { error: 'Order number and customer email are required' },
        { status: 400 }
      );
    }

    console.log('📦 Updating order:', orderNumber);

    // Fetch existing order
    const emailSlug = customerEmail.replace('@', '_at_').replace(/\./g, '_');
    const orderPath = `orders/${emailSlug}/${orderNumber}.json`;

    try {
      const existingBlob = await head(orderPath);
      const response = await fetch(existingBlob.url);
      const existingOrder = await response.json();

      // Merge updates
      const updatedOrder = {
        ...existingOrder,
        ...updates,
      };

      // Save updated order
      const blob = await put(orderPath, JSON.stringify(updatedOrder, null, 2), {
        access: 'public',
        contentType: 'application/json',
      });

      console.log('✅ Order updated:', orderNumber);

      return NextResponse.json({
        success: true,
        order: updatedOrder,
        blobUrl: blob.url,
      });
    } catch (error) {
      console.error('❌ Order not found:', orderNumber);
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error('❌ Error updating order:', error);
    return NextResponse.json(
      { error: 'Failed to update order', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete an order (admin only)
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const orderNumber = searchParams.get('orderNumber');
    const customerEmail = searchParams.get('customerEmail');

    if (!orderNumber || !customerEmail) {
      return NextResponse.json(
        { error: 'Order number and customer email are required' },
        { status: 400 }
      );
    }

    console.log('🗑️ Deleting order:', orderNumber);

    const emailSlug = customerEmail.replace('@', '_at_').replace(/\./g, '_');
    const orderPath = `orders/${emailSlug}/${orderNumber}.json`;

    await del(orderPath);

    console.log('✅ Order deleted:', orderNumber);

    return NextResponse.json({
      success: true,
      message: 'Order deleted successfully',
    });
  } catch (error) {
    console.error('❌ Error deleting order:', error);
    return NextResponse.json(
      { error: 'Failed to delete order', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

