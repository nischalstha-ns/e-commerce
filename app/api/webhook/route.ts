import { NextRequest, NextResponse } from "next/server";
import { constructWebhookEvent } from "@/lib/saas/stripe-real";
import { db } from "@/lib/firestore/firebase";
import { doc, updateDoc, serverTimestamp, collection, addDoc } from "firebase/firestore";

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

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as any;
        const { userId, orderId } = session.metadata || {};

        if (orderId && db) {
          await updateDoc(doc(db, "orders", orderId), {
            paymentStatus: "paid",
            paymentIntentId: session.payment_intent,
            stripeSessionId: session.id,
            status: "accepted",
            updatedAt: serverTimestamp(),
          });
        }

        if (userId && db) {
          await addDoc(collection(db, "users", userId, "notifications"), {
            type: "order_confirmed",
            title: "Order Confirmed",
            message: "Your payment was successful. Your order is being processed.",
            read: false,
            createdAt: serverTimestamp(),
          });
        }
        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as any;
        const orderId = paymentIntent.metadata?.orderId;
        if (orderId && db) {
          await updateDoc(doc(db, "orders", orderId), {
            paymentStatus: "failed",
            updatedAt: serverTimestamp(),
          });
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as any;
        const tenantId = subscription.metadata?.tenantId;
        if (tenantId && db) {
          await updateDoc(doc(db, "tenants", tenantId), {
            subscriptionStatus: subscription.status,
            subscriptionId: subscription.id,
            currentPeriodEnd: new Date(subscription.current_period_end * 1000).toISOString(),
            updatedAt: serverTimestamp(),
          });
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as any;
        const tenantId = subscription.metadata?.tenantId;
        if (tenantId && db) {
          await updateDoc(doc(db, "tenants", tenantId), {
            subscriptionStatus: "cancelled",
            plan: "free",
            updatedAt: serverTimestamp(),
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
