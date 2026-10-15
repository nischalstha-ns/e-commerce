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
    const stripeSubscriptionId = tenantDoc.data()?.stripeSubscriptionId;
    if (!stripeSubscriptionId) {
      return NextResponse.json({ error: "No subscription found" }, { status: 404 });
    }

    const { cancelSubscription } = await import("@/lib/saas/stripe-real");
    await cancelSubscription(stripeSubscriptionId);

    await db.collection("tenants").doc(tenantId).update({
      plan: "free",
      status: "cancelled",
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Cancel subscription error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to cancel subscription" },
      { status: 500 }
    );
  }
}
