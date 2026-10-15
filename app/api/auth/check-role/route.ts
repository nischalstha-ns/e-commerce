import { NextRequest, NextResponse } from 'next/server';
import { verifyRequestToken, getUserRole } from '@/lib/saas/firebase-admin';

export async function POST(request: NextRequest) {
  try {
    // The uid comes from the verified ID token — never from the request body.
    const uid = await verifyRequestToken(request);
    if (!uid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const role = await getUserRole(uid);
    return NextResponse.json({ role, uid });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Role check error:', error instanceof Error ? error.message : 'Unknown error');
    }
    return NextResponse.json({ error: 'Failed to check role' }, { status: 500 });
  }
}
