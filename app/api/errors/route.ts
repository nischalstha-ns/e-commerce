import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = (forwarded ? forwarded.split(',')[0].trim() : null)
      || request.headers.get('x-real-ip')
      || 'unknown';

    console.error('Error Tracked:', {
      timestamp: new Date().toISOString(),
      ...body,
      ip,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to log error' }, { status: 500 });
  }
}