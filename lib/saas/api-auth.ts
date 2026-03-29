import { NextRequest } from 'next/server';

let adminAuth: any = null;

async function getAdminAuth() {
  if (adminAuth) return adminAuth;
  try {
    const { getApps, initializeApp, cert } = await import('firebase-admin/app');
    const { getAuth } = await import('firebase-admin/auth');

    const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n');
    const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

    if (!privateKey || !clientEmail || !projectId) {
      return null;
    }

    const apps = getApps();
    const app =
      apps.find((a) => a.name === 'admin') ||
      initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) }, 'admin');

    adminAuth = getAuth(app);
    return adminAuth;
  } catch {
    return null;
  }
}

export async function authenticateRequest(request: NextRequest): Promise<string | null> {
  const authHeader = request.headers.get('authorization');

  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);
  if (!token) return null;

  try {
    const auth = await getAdminAuth();
    if (!auth) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('Firebase Admin not configured — token verification skipped');
      }
      return null;
    }
    const decoded = await auth.verifyIdToken(token);
    return decoded.uid;
  } catch {
    return null;
  }
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
