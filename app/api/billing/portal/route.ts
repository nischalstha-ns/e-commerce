import { NextRequest, NextResponse } from "next/server";
import { verifyRequestToken, getAdminDb } from "@/lib/saas/firebase-admin";

export async function POST(request: NextRequest) {
  const uid = await verifyRequestToken(request);
  if (!uid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const db = await getAdminDb();
    const userDoc = await db.collection("users").doc(uid).get();
    const tenantId = userDoc.data()?.tenantId;
    if (!tenantId) {
      return NextResponse.json({ error: "No tenant found" }, { status: 404 });
    }

    const tenantDoc = await db.collection("tenants").doc(tenantId).get();
    const stripeCustomerId = tenantDoc.data()?.stripeCustomerId;
    if (!stripeCustomerId) {
      return NextResponse.json({ error: "No Stripe customer found" }, { status: 404 });
    }

    const { createPortalSession } = await import("@/lib/saas/stripe-real");
    const url = await createPortalSession(stripeCustomerId);
    return NextResponse.json({ url });
  } catch (error: any) {
    console.error("Billing portal error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create portal session" },
      { status: 500 }
    );
  }
}
