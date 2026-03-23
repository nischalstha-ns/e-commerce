import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firestore/firebase';
import { doc, serverTimestamp, updateDoc } from 'firebase/firestore';

export async function POST(request: NextRequest) {
  try {
    if (!db) {
      return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
    }

    const { tenantId } = await request.json();
    if (!tenantId) {
      return NextResponse.json({ error: 'tenantId is required' }, { status: 400 });
    }

    await updateDoc(doc(db, 'tenants', tenantId), {
      status: 'cancelled',
      updatedAt: serverTimestamp(),
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to cancel subscription' }, { status: 500 });
  }
}
