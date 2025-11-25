export async function sendWelcomeEmail(email: string, businessName: string, subdomain: string) {
  await fetch('/api/email/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      to: email,
      subject: `Welcome to ${businessName}!`,
      template: 'welcome',
      data: { businessName, subdomain, loginUrl: `https://${subdomain}.yourplatform.com` }
    })
  });
}

export async function sendLimitWarning(email: string, feature: string, usage: number, limit: number) {
  await fetch('/api/email/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      to: email,
      subject: `${feature} limit warning`,
      template: 'limit-warning',
      data: { feature, usage, limit, percentage: (usage / limit) * 100 }
    })
  });
}

export async function sendPaymentFailed(email: string, amount: number) {
  await fetch('/api/email/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      to: email,
      subject: 'Payment Failed',
      template: 'payment-failed',
      data: { amount }
    })
  });
}

export async function sendInvoice(email: string, invoiceUrl: string) {
  await fetch('/api/email/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      to: email,
      subject: 'Your Invoice',
      template: 'invoice',
      data: { invoiceUrl }
    })
  });
}
