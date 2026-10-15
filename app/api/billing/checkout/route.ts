import { NextRequest, NextResponse } from "next/server";
import { getAdminDb, verifyRequestToken } from "@/lib/saas/firebase-admin";
import {
  createSubscriptionCheckoutSession,
  createStripeCustomer,
  STRIPE_PRICES,
} from "@/lib/saas/stripe-real";

const PLAN_TO_PRICE: Record<string, string> = {
  basic: STRIPE_PRICES.basic,
  pro: STRIPE_PRICES.pro,
  enterprise: STRIPE_PRICES.enterprise,
};

export async function POST(request: NextRequest) {
  try {
    const uid = await verifyRequestToken(request);
    if (!uid) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { tenantId, plan } = body;

    if (!tenantId || typeof tenantId !== "string") {
      return NextResponse.json({ error: "Tenant ID is required" }, { status: 400 });
    }

    // Free plan needs no checkout — just confirm it.
    if (!plan || plan === "free") {
      return NextResponse.json({ url: "/dashboard?plan=free" });
    }
    const priceId = PLAN_TO_PRICE[plan];
    if (!priceId) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    const db = await getAdminDb();
    const tenantSnap = await db.collection("tenants").doc(tenantId).get();
    if (!tenantSnap.exists) {
      return NextResponse.json({ error: "Store not found" }, { status: 404 });
    }
    const tenant = tenantSnap.data()!;
    if (tenant.ownerId !== uid) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    let customerId = tenant.stripeCustomerId;
    if (!customerId) {
      const userSnap = await db.collection("users").doc(uid).get();
      const email = userSnap.data()?.email || "";
      customerId = await createStripeCustomer(email, tenant.name || "Store owner");
      await db.collection("tenants").doc(tenantId).update({
        stripeCustomerId: customerId,
        updatedAt: new Date().toISOString(),
      });
    }

    const url = await createSubscriptionCheckoutSession(customerId, priceId, tenantId);
    return NextResponse.json({ url });
  } catch (error: any) {
    console.error("Billing checkout error:", error?.message || error);
    return NextResponse.json(
      { error: "Failed to create billing checkout" },
      { status: 500 }
    );
  }
}
