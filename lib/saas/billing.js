export const createStripePortal = async (customerId) => {
  try {
    const response = await fetch('/api/stripe/portal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ customerId })
    });
    return await response.json();
  } catch (error) {
    console.error('Portal creation failed:', error);
    return { error: error.message };
  }
};

export const cancelSubscription = async (subscriptionId) => {
  try {
    const response = await fetch('/api/stripe/cancel', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subscriptionId })
    });
    return await response.json();
  } catch (error) {
    console.error('Cancellation failed:', error);
    return { error: error.message };
  }
};