import { NextResponse } from 'next/server';
import { verifyRequestToken, getUserRole } from '@/lib/saas/firebase-admin';

export async function POST(request) {
  try {
    // The uid comes from the verified ID token — never from the request body.
    // (The old version accepted any uid with any Bearer header.)
    const uid = await verifyRequestToken(request);
    if (!uid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const role = await getUserRole(uid);
    return NextResponse.json({ role, uid });
  } catch (error) {
    console.error('Role validation error:', error);
    return NextResponse.json({ error: 'Failed to validate role' }, { status: 500 });
  }
}
