import { db } from '@/lib/firestore/firebase';
import { doc, getDoc } from 'firebase/firestore';

export type PlanName = 'basic' | 'pro' | 'enterprise';

export interface Tenant {
  id: string;
  ownerId: string;
  businessName: string;
  subdomain: string;
  plan: PlanName;
  status: 'active' | 'suspended' | 'cancelled';
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
}

export const PLANS: Record<PlanName, { price: number; products: number; orders: number; users: number }> = {
  basic: { price: 29, products: 100, orders: 500, users: 3 },
  pro: { price: 99, products: 1000, orders: 5000, users: 10 },
  enterprise: { price: 299, products: -1, orders: -1, users: -1 },
};

export async function getTenant(tenantId: string): Promise<Tenant | null> {
  if (!db) throw new Error('Firebase not initialized');
  const snap = await getDoc(doc(db, 'tenants', tenantId));
  if (!snap.exists()) return null;
  return {
    id: snap.id,
    ...snap.data(),
  } as Tenant;
}

export function canPerformAction(tenant: Tenant, feature: 'products' | 'orders' | 'users') {
  if (tenant.status !== 'active') return false;
  const limit = tenant.limits[feature];
  if (limit === -1) return true;
  return tenant.usage[feature] < limit;
}
