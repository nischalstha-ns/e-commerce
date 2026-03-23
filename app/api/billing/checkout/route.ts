import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { tenantId, plan } = await request.json();
    if (!tenantId || !plan) {
      return NextResponse.json({ error: 'tenantId and plan are required' }, { status: 400 });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    return NextResponse.json({ url: `${appUrl}/billing?tenantId=${encodeURIComponent(tenantId)}&plan=${encodeURIComponent(plan)}` });
  } catch {
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 });
  }
}
