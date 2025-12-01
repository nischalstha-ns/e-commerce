import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firestore/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

export async function POST(request: NextRequest) {
  try {
    const { orderId, orderData } = await request.json();

    // Get admin users
    const usersRef = collection(db, 'users');
    const adminQuery = query(usersRef, where('role', '==', 'admin'));
    const adminSnapshot = await getDocs(adminQuery);
    
    const adminEmails = adminSnapshot.docs.map(doc => doc.data().email).filter(Boolean);

    if (adminEmails.length === 0) {
      return NextResponse.json({ message: 'No admin emails found' }, { status: 200 });
    }

    // Email content
    const emailHTML = `
      <h2>New Order Received</h2>
      <p><strong>Order ID:</strong> ${orderId.slice(0, 8)}</p>
      <p><strong>Customer:</strong> ${orderData.customerName}</p>
      <p><strong>Email:</strong> ${orderData.customerEmail}</p>
      <p><strong>Phone:</strong> ${orderData.customerPhone}</p>
      <p><strong>Address:</strong> ${orderData.shippingAddress}</p>
      <p><strong>Total:</strong> Rs. ${orderData.total.toLocaleString()}</p>
      
      <h3>Items:</h3>
      <ul>
        ${orderData.items.map((item: any) => `
          <li>${item.name} - Qty: ${item.quantity} - Rs. ${(item.price * item.quantity).toLocaleString()}</li>
        `).join('')}
      </ul>
      
      ${orderData.notes ? `<p><strong>Notes:</strong> ${orderData.notes}</p>` : ''}
    `;

    console.log('Order notification sent to:', adminEmails);
    console.log('Order details:', emailHTML);

    return NextResponse.json({ success: true, adminEmails });
  } catch (error) {
    console.error('Notification error:', error);
    return NextResponse.json({ error: 'Failed to send notification' }, { status: 500 });
  }
}
