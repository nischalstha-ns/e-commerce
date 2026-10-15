import { getAdminDb } from "./firebase-admin";
import { createPortalSession, cancelSubscription as cancelStripeSubscription } from "./stripe-real";

/** Open the Stripe billing portal for a tenant's customer. */
export async function createStripePortal(
  tenantId: string
): Promise<{ url: string }> {
  const db = await getAdminDb();
  const snap = await db.collection("tenants").doc(tenantId).get();
  const customerId = snap.data()?.stripeCustomerId;
  if (!customerId) {
    throw new Error("No Stripe customer linked to this tenant");
  }
  const url = await createPortalSession(customerId);
  return { url };
}

/** Cancel the tenant's Stripe subscription. */
export async function cancelSubscription(tenantId: string): Promise<{ success: boolean }> {
  const db = await getAdminDb();
  const snap = await db.collection("tenants").doc(tenantId).get();
  const subscriptionId = snap.data()?.subscriptionId;
  if (!subscriptionId) {
    throw new Error("No active subscription for this tenant");
  }
  await cancelStripeSubscription(subscriptionId);
  await db.collection("tenants").doc(tenantId).update({
    subscriptionStatus: "cancelled",
    plan: "free",
    updatedAt: new Date().toISOString(),
  });
  return { success: true };
}
