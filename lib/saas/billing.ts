interface BillingPortalResponse {
  url: string;
}

export async function createStripePortal(tenantId: string): Promise<BillingPortalResponse> {
  const response = await fetch('/api/billing/portal', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tenantId }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to create billing portal session' }));
    throw new Error(error.error || 'Failed to create billing portal session');
  }

  return response.json();
}

export async function cancelSubscription(tenantId: string): Promise<void> {
  const response = await fetch('/api/billing/cancel', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tenantId }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to cancel subscription' }));
    throw new Error(error.error || 'Failed to cancel subscription');
  }
}
