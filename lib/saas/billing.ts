import { db } from '@/lib/firestore/firebase';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { PLANS } from './tenant';

export async function createStripeCheckout(tenantId: string, plan: keyof typeof PLANS) {
  const response = await fetch('/api/billing/checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tenantId, plan })
  });
  
  if (!response.ok) throw new Error('Checkout failed');
  return response.json();
}

export async function createStripePortal(tenantId: string) {
  const response = await fetch('/api/billing/portal', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tenantId })
  });
  
  if (!response.ok) throw new Error('Portal creation failed');
  return response.json();
}

export async function updateSubscription(tenantId: string, data: {
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  plan?: keyof typeof PLANS;
  status?: 'active' | 'suspended' | 'cancelled';
}) {
  if (!db) throw new Error('Firebase not initialized');
  
  const updates: any = { updatedAt: serverTimestamp() };
  
  if (data.stripeCustomerId) updates.stripeCustomerId = data.stripeCustomerId;
  if (data.stripeSubscriptionId) updates.stripeSubscriptionId = data.stripeSubscriptionId;
  if (data.status) updates.status = data.status;
  
  if (data.plan) {
    updates.plan = data.plan;
    const planLimits = PLANS[data.plan];
    updates['limits.products'] = planLimits.products;
    updates['limits.orders'] = planLimits.orders;
    updates['limits.users'] = planLimits.users;
  }
  
  await updateDoc(doc(db, 'tenants', tenantId), updates);
}

export async function cancelSubscription(tenantId: string) {
  const response = await fetch('/api/billing/cancel', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tenantId })
  });
  
  if (!response.ok) throw new Error('Cancellation failed');
  return response.json();
}
