import { NextRequest, NextResponse } from "next/server";
import { createOrderCheckoutSession } from "@/lib/saas/stripe-real";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { items, customerEmail, metadata } = body;

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "No items provided" }, { status: 400 });
    }

    if (!customerEmail) {
      return NextResponse.json({ error: "Customer email is required" }, { status: 400 });
    }

    const url = await createOrderCheckoutSession(items, customerEmail, metadata || {});
    return NextResponse.json({ url });
  } catch (error: any) {
    console.error("Stripe checkout error:", error.message);
    return NextResponse.json(
      { error: error.message || "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
