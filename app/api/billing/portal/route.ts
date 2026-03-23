import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { tenantId } = await request.json();
    if (!tenantId) {
      return NextResponse.json({ error: 'tenantId is required' }, { status: 400 });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    return NextResponse.json({ url: `${appUrl}/billing?tenantId=${encodeURIComponent(tenantId)}` });
  } catch {
    return NextResponse.json({ error: 'Failed to create portal session' }, { status: 500 });
  }
}
