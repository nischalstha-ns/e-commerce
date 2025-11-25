import { db } from '@/lib/firestore/firebase';
import { collection, doc, getDoc, setDoc, updateDoc, query, where, getDocs, serverTimestamp } from 'firebase/firestore';

export interface Tenant {
  id: string;
  businessName: string;
  subdomain: string;
  customDomain?: string;
  plan: 'basic' | 'pro' | 'enterprise';
  status: 'active' | 'suspended' | 'cancelled';
  ownerId: string;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  limits: {
    products: number;
    orders: number;
    users: number;
  };
  usage: {
    products: number;
    orders: number;
    users: number;
  };
  createdAt: any;
  updatedAt: any;
}

export const PLANS = {
  basic: { price: 29, products: 100, orders: 500, users: 3 },
  pro: { price: 99, products: 1000, orders: -1, users: 10 },
  enterprise: { price: 299, products: -1, orders: -1, users: -1 }
};

export async function createTenant(data: {
  businessName: string;
  subdomain: string;
  ownerId: string;
  plan: keyof typeof PLANS;
}) {
  if (!db) throw new Error('Firebase not initialized');

  const subdomainExists = await checkSubdomainExists(data.subdomain);
  if (subdomainExists) throw new Error('Subdomain already taken');

  const tenantId = `tenant_${Date.now()}`;
  const planLimits = PLANS[data.plan];

  const tenant: Tenant = {
    id: tenantId,
    businessName: data.businessName,
    subdomain: data.subdomain,
    plan: data.plan,
    status: 'active',
    ownerId: data.ownerId,
    limits: {
      products: planLimits.products,
      orders: planLimits.orders,
      users: planLimits.users
    },
    usage: { products: 0, orders: 0, users: 1 },
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };

  await setDoc(doc(db, 'tenants', tenantId), tenant);
  return tenant;
}

export async function getTenant(tenantId: string): Promise<Tenant | null> {
  if (!db) return null;
  const docSnap = await getDoc(doc(db, 'tenants', tenantId));
  return docSnap.exists() ? docSnap.data() as Tenant : null;
}

export async function getTenantBySubdomain(subdomain: string): Promise<Tenant | null> {
  if (!db) return null;
  const q = query(collection(db, 'tenants'), where('subdomain', '==', subdomain));
  const snapshot = await getDocs(q);
  return snapshot.empty ? null : snapshot.docs[0].data() as Tenant;
}

async function checkSubdomainExists(subdomain: string): Promise<boolean> {
  const tenant = await getTenantBySubdomain(subdomain);
  return tenant !== null;
}

export async function updateTenantUsage(tenantId: string, type: 'products' | 'orders' | 'users', increment: number = 1) {
  if (!db) return;
  const tenant = await getTenant(tenantId);
  if (!tenant) return;

  const newUsage = tenant.usage[type] + increment;
  await updateDoc(doc(db, 'tenants', tenantId), {
    [`usage.${type}`]: newUsage,
    updatedAt: serverTimestamp()
  });
}

export function canPerformAction(tenant: Tenant, type: 'products' | 'orders' | 'users'): boolean {
  if (tenant.status !== 'active') return false;
  const limit = tenant.limits[type];
  if (limit === -1) return true;
  return tenant.usage[type] < limit;
}
