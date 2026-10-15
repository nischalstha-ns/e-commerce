import { NextRequest, NextResponse } from "next/server";
import { getAdminDb, verifyRequestToken } from "@/lib/saas/firebase-admin";

const VALID_PLANS = ["free", "basic", "pro", "enterprise"];

export async function POST(request: NextRequest) {
  try {
    const uid = await verifyRequestToken(request);
    if (!uid) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { businessName, subdomain, plan } = body;

    if (!businessName || typeof businessName !== "string" || businessName.trim().length < 2) {
      return NextResponse.json({ error: "Business name is required" }, { status: 400 });
    }
    const cleanSubdomain = String(subdomain || "")
      .toLowerCase()
      .trim();
    if (!/^[a-z0-9-]{3,32}$/.test(cleanSubdomain)) {
      return NextResponse.json(
        { error: "Subdomain must be 3-32 chars: lowercase letters, numbers, hyphens" },
        { status: 400 }
      );
    }
    if (plan && !VALID_PLANS.includes(plan)) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    const db = await getAdminDb();

    const existing = await db
      .collection("tenants")
      .where("subdomain", "==", cleanSubdomain)
      .limit(1)
      .get();
    if (!existing.empty) {
      return NextResponse.json({ error: "Subdomain is already taken" }, { status: 409 });
    }

    const now = new Date().toISOString();
    const ref = await db.collection("tenants").add({
      name: businessName.trim(),
      subdomain: cleanSubdomain,
      ownerId: uid,
      plan: plan || "free",
      status: "active",
      subscriptionStatus: "none",
      usage: { products: 0, orders: 0, storage: 0 },
      limits: { products: 20, orders: 100, storage: 100 },
      createdAt: now,
      updatedAt: now,
    });

    // Link the tenant to the user so the app can pick it up.
    await db.collection("users").doc(uid).set(
      { tenantId: ref.id, role: "shop", updatedAt: now },
      { merge: true }
    );

    return NextResponse.json({
      tenant: { id: ref.id, name: businessName.trim(), subdomain: cleanSubdomain },
    });
  } catch (error: any) {
    console.error("Tenant create error:", error?.message || error);
    return NextResponse.json({ error: "Failed to create store" }, { status: 500 });
  }
}
