export const PLANS = {
  FREE: {
    id: 'free',
    name: 'Free',
    price: 0,
    features: ['Basic features', '100 products', 'Email support']
  },
  PRO: {
    id: 'pro',
    name: 'Pro',
    price: 29,
    features: ['All features', 'Unlimited products', 'Priority support']
  },
  ENTERPRISE: {
    id: 'enterprise',
    name: 'Enterprise',
    price: 99,
    features: ['Custom features', 'White label', '24/7 support']
  }
};

export const getTenant = async (tenantId) => {
  try {
    return {
      id: tenantId,
      name: 'Default Tenant',
      plan: PLANS.FREE,
      subscription: { status: 'active' }
    };
  } catch (error) {
    console.error('Get tenant failed:', error);
    return null;
  }
};

export class Tenant {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.plan = data.plan;
    this.subscription = data.subscription;
  }
}