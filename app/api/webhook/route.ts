import { NextRequest, NextResponse } from "next/server";
import { constructWebhookEvent } from "@/lib/saas/stripe-real";
import { getAdminDb } from "@/lib/saas/firebase-admin";

export async function POST(request: NextRequest) {
  const payload = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 });
  }

  let event;
  try {
    event = await constructWebhookEvent(payload, signature);
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err.message);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  // NOTE: webhooks run with no signed-in user, so the client Firestore SDK
  // can never satisfy the security rules here. All writes use the Admin SDK.
  let db;
  try {
    db = await getAdminDb();
  } catch (err: any) {
    console.error("Webhook: Firebase Admin not configured:", err.message);
    return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
  }

  const now = new Date().toISOString();

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as any;
        const { userId, orderId } = session.metadata || {};

        if (orderId) {
          await db.collection("orders").doc(orderId).update({
            paymentStatus: "paid",
            paymentIntentId: session.payment_intent,
            stripeSessionId: session.id,
            status: "accepted",
            updatedAt: now,
          });
        } else {
          // No order was created before checkout (e.g. direct Stripe flow):
          // record the purchase so it isn't lost.
          const lineItems = (session.metadata?.itemCount
            ? []
            : []) as never[];
          await db.collection("orders").add({
            userId: userId || null,
            items: lineItems,
            total: (session.amount_total || 0) / 100,
            totalAmount: (session.amount_total || 0) / 100,
            customerEmail: session.customer_email || "",
            paymentMethod: "stripe",
            paymentStatus: "paid",
            paymentIntentId: session.payment_intent,
            stripeSessionId: session.id,
            status: "accepted",
            timestampCreate: now,
            updatedAt: now,
          });
        }

        if (userId) {
          await db
            .collection("users")
            .doc(userId)
            .collection("notifications")
            .add({
              type: "order_confirmed",
              title: "Order Confirmed",
              message: "Your payment was successful. Your order is being processed.",
              read: false,
              createdAt: now,
            });
        }
        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as any;
        const orderId = paymentIntent.metadata?.orderId;
        if (orderId) {
          await db.collection("orders").doc(orderId).update({
            paymentStatus: "failed",
            updatedAt: now,
          });
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as any;
        const tenantId = subscription.metadata?.tenantId;
        if (tenantId) {
          await db.collection("tenants").doc(tenantId).update({
            subscriptionStatus: subscription.status,
            subscriptionId: subscription.id,
            currentPeriodEnd: new Date(
              subscription.current_period_end * 1000
            ).toISOString(),
            updatedAt: now,
          });
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as any;
        const tenantId = subscription.metadata?.tenantId;
        if (tenantId) {
          await db.collection("tenants").doc(tenantId).update({
            subscriptionStatus: "cancelled",
            plan: "free",
            updatedAt: now,
          });
        }
        break;
      }

      default:
        break;
    }
  } catch (err: any) {
    console.error(`Error handling webhook event ${event.type}:`, err.message);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
