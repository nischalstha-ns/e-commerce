import { NextRequest } from 'next/server';
import { auth } from '@/lib/firestore/firebase';

export async function authenticateRequest(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader?.startsWith('Bearer ')) {
    throw new Error('Unauthorized');
  }
  
  const token = authHeader.substring(7);
  
  // Verify Firebase token
  // const decodedToken = await auth.verifyIdToken(token);
  // return decodedToken.uid;
  
  return 'user_id_placeholder';
}

export async function getTenantFromRequest(request: NextRequest) {
  const subdomain = request.headers.get('x-tenant-subdomain');
  
  if (!subdomain) {
    throw new Error('Tenant not found');
  }
  
  return subdomain;
}

export async function checkRateLimit(tenantId: string, endpoint: string) {
  // Implement rate limiting per tenant
  // Redis or in-memory cache
  return true;
}

export function createAPIResponse(data: any, status: number = 200) {
  return Response.json(data, { 
    status,
    headers: {
      'Content-Type': 'application/json',
      'X-RateLimit-Limit': '1000',
      'X-RateLimit-Remaining': '999'
    }
  });
}
