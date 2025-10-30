import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.error('Error Tracked:', {
      timestamp: new Date().toISOString(),
      ...body,
      ip: request.ip || 'unknown',
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to log error' }, { status: 500 });
  }
}