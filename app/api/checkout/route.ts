import { NextRequest, NextResponse } from "next/server";
import { createOrderCheckoutSession } from "@/lib/saas/stripe-real";
import { getAdminDb, verifyRequestToken } from "@/lib/saas/firebase-admin";

interface ClientItem {
  productId: string;
  quantity: number;
  // NOTE: client-supplied name/price/image are ignored — prices are
  // always re-read from the database so shoppers can't set their own.
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { items, customerEmail, metadata } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "No items provided" }, { status: 400 });
    }
    if (items.length > 50) {
      return NextResponse.json({ error: "Too many items" }, { status: 400 });
    }
    if (!customerEmail || typeof customerEmail !== "string") {
      return NextResponse.json(
        { error: "Customer email is required" },
        { status: 400 }
      );
    }

    // Optional: tie the checkout to the signed-in user when a token is sent.
    const uid = await verifyRequestToken(request).catch(() => null);

    const db = await getAdminDb();
    const pricedItems: {
      productId: string;
      name: string;
      price: number;
      quantity: number;
      imageURL?: string;
    }[] = [];

    for (const raw of items as ClientItem[]) {
      const productId =
        typeof raw?.productId === "string" ? raw.productId.trim() : "";
      const quantity = Math.floor(Number(raw?.quantity));
      if (!productId || !Number.isFinite(quantity) || quantity < 1 || quantity > 99) {
        return NextResponse.json(
          { error: "Invalid item in cart" },
          { status: 400 }
        );
      }

      const snap = await db.collection("products").doc(productId).get();
      if (!snap.exists) {
        return NextResponse.json(
          { error: "A product in your cart is no longer available" },
          { status: 400 }
        );
      }
      const p = snap.data()!;
      if (p.status && p.status !== "active") {
        return NextResponse.json(
          { error: `Product "${p.name || productId}" is not available` },
          { status: 400 }
        );
      }

      // Server-side price: sale price wins only when it is a real discount.
      const price = Number(p.price);
      const sale = Number(p.salePrice);
      const unit =
        Number.isFinite(sale) && sale > 0 && sale < price ? sale : price;
      if (!Number.isFinite(unit) || unit <= 0) {
        return NextResponse.json(
          { error: "A product in your cart has an invalid price" },
          { status: 400 }
        );
      }

      pricedItems.push({
        productId,
        name: String(p.name || "Product"),
        price: unit,
        quantity,
        ...(p.imageURL || p.imageURLs?.[0]
          ? { imageURL: String(p.imageURL || p.imageURLs[0]) }
          : {}),
      });
    }

    const url = await createOrderCheckoutSession(pricedItems, customerEmail, {
      ...(metadata || {}),
      ...(uid ? { userId: uid } : {}),
      itemCount: String(pricedItems.length),
    });
    return NextResponse.json({ url });
  } catch (error: any) {
    console.error("Stripe checkout error:", error?.message || error);
    // Don't leak internal details (e.g. Stripe keys) to the client.
    const safe =
      error?.message === "STRIPE_SECRET_KEY is not configured"
        ? "Payment is not configured"
        : "Failed to create checkout session";
    return NextResponse.json({ error: safe }, { status: 500 });
  }
}
