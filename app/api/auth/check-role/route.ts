import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firestore/firebase';
import { doc, getDoc } from 'firebase/firestore';

export async function POST(request: NextRequest) {
  try {
    const { uid } = await request.json();
    
    if (!uid) {
      return NextResponse.json({ error: 'UID required' }, { status: 400 });
    }

    if (!db) {
      return NextResponse.json({ role: 'customer' });
    }

    const userRef = doc(db, 'users', uid);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      return NextResponse.json({ role: 'customer' });
    }
    
    const userData = userDoc.data();
    return NextResponse.json({ role: userData.role || 'customer' });
    
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Role check error:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
    }
    return NextResponse.json({ error: 'Failed to check role' }, { status: 500 });
  }
}