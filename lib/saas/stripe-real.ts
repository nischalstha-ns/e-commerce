// Install: npm install stripe
// import Stripe from 'stripe';

// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-11-20.acacia' });

export const STRIPE_PRICES = {
  basic: 'price_basic_monthly',
  pro: 'price_pro_monthly',
  enterprise: 'price_enterprise_monthly'
};

export async function createStripeCustomer(email: string, name: string) {
  // const customer = await stripe.customers.create({ email, name });
  // return customer.id;
  return 'cus_placeholder';
}

export async function createCheckoutSession(customerId: string, priceId: string, tenantId: string) {
  // const session = await stripe.checkout.sessions.create({
  //   customer: customerId,
  //   line_items: [{ price: priceId, quantity: 1 }],
  //   mode: 'subscription',
  //   success_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing?success=true`,
  //   cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing?canceled=true`,
  //   metadata: { tenantId }
  // });
  // return session.url;
  return `${process.env.NEXT_PUBLIC_APP_URL}/billing`;
}

export async function createPortalSession(customerId: string) {
  // const session = await stripe.billingPortal.sessions.create({
  //   customer: customerId,
  //   return_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing`
  // });
  // return session.url;
  return `${process.env.NEXT_PUBLIC_APP_URL}/billing`;
}

export async function cancelSubscription(subscriptionId: string) {
  // await stripe.subscriptions.cancel(subscriptionId);
  return true;
}

export async function handleWebhook(payload: string, signature: string) {
  // const event = stripe.webhooks.constructEvent(
  //   payload,
  //   signature,
  //   process.env.STRIPE_WEBHOOK_SECRET!
  // );
  
  // switch (event.type) {
  //   case 'checkout.session.completed':
  //     // Handle successful checkout
  //     break;
  //   case 'customer.subscription.updated':
  //     // Handle subscription update
  //     break;
  //   case 'customer.subscription.deleted':
  //     // Handle cancellation
  //     break;
  //   case 'invoice.payment_failed':
  //     // Handle failed payment
  //     break;
  // }
}
