import Stripe from 'stripe';

function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error('STRIPE_SECRET_KEY is not configured');
  return new Stripe(key, { apiVersion: '2026-03-25.dahlia' });
}

export const STRIPE_PRICES = {
  basic: process.env.STRIPE_PRICE_BASIC || 'price_basic_monthly',
  pro: process.env.STRIPE_PRICE_PRO || 'price_pro_monthly',
  enterprise: process.env.STRIPE_PRICE_ENTERPRISE || 'price_enterprise_monthly',
};

export interface CartLineItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  imageURL?: string;
}

export async function createStripeCustomer(email: string, name: string): Promise<string> {
  const stripe = getStripe();
  const customer = await stripe.customers.create({ email, name });
  return customer.id;
}

export async function createOrderCheckoutSession(
  items: CartLineItem[],
  customerEmail: string,
  metadata: Record<string, string> = {}
): Promise<string> {
  const stripe = getStripe();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  const lineItems = items.map((item) => ({
    price_data: {
      currency: 'usd',
      product_data: {
        name: item.name,
        ...(item.imageURL && { images: [item.imageURL] }),
      },
      unit_amount: Math.round(item.price * 100),
    },
    quantity: item.quantity,
  }));

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: lineItems,
    mode: 'payment',
    customer_email: customerEmail,
    success_url: `${appUrl}/checkout/complete?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${appUrl}/checkout?canceled=true`,
    metadata,
    shipping_address_collection: { allowed_countries: ['US', 'GB', 'AU', 'CA', 'NP', 'IN'] },
  });

  if (!session.url) throw new Error('Failed to create Stripe checkout session');
  return session.url;
}

export async function createSubscriptionCheckoutSession(
  customerId: string,
  priceId: string,
  tenantId: string
): Promise<string> {
  const stripe = getStripe();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    mode: 'subscription',
    success_url: `${appUrl}/billing?success=true`,
    cancel_url: `${appUrl}/billing?canceled=true`,
    metadata: { tenantId },
  });

  if (!session.url) throw new Error('Failed to create Stripe subscription session');
  return session.url;
}

export async function createPortalSession(customerId: string): Promise<string> {
  const stripe = getStripe();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${appUrl}/billing`,
  });

  return session.url;
}

export async function retrieveCheckoutSession(sessionId: string): Promise<Stripe.Checkout.Session> {
  const stripe = getStripe();
  return stripe.checkout.sessions.retrieve(sessionId, {
    expand: ['line_items', 'payment_intent'],
  });
}

export async function cancelSubscription(subscriptionId: string): Promise<boolean> {
  const stripe = getStripe();
  await stripe.subscriptions.cancel(subscriptionId);
  return true;
}

export async function constructWebhookEvent(payload: string, signature: string): Promise<Stripe.Event> {
  const stripe = getStripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) throw new Error('STRIPE_WEBHOOK_SECRET is not configured');
  return stripe.webhooks.constructEvent(payload, signature, secret);
}
