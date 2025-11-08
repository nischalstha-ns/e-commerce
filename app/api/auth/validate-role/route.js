import { NextResponse } from 'next/server';
import { db } from '@/lib/firestore/firebase';
import { doc, getDoc } from 'firebase/firestore';

async function handler(request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const { uid } = body;

    if (!uid || typeof uid !== 'string') {
      return NextResponse.json(
        { error: 'Invalid user ID' },
        { status: 400 }
      );
    }

    // Check if Firebase is initialized
    if (!db) {
      console.warn('Firebase not initialized, returning default role');
      return NextResponse.json({ role: 'customer' });
    }

    const userRef = doc(db, 'users', uid);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      return NextResponse.json({ role: 'customer' });
    }

    const userData = userDoc.data();
    const role = userData?.role || 'customer';

    // Additional security check for admin role
    if (role === 'admin') {
      const hasValidEmail = userData?.email && userData.email.includes('@');
      
      if (!hasValidEmail) {
        return NextResponse.json({ role: 'customer' });
      }
    }

    return NextResponse.json({ role });

  } catch (error) {
    console.error('Role validation error:', error);
    return NextResponse.json(
      { role: 'customer' },
      { status: 200 }
    );
  }
}

export const POST = handler;