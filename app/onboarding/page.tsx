'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { PLANS } from '@/lib/saas/tenant';

export default function OnboardingPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    businessName: '',
    subdomain: '',
    plan: 'basic'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const response = await fetch('/api/tenants/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessName: formData.businessName,
          subdomain: formData.subdomain,
          ownerId: user.uid,
          plan: formData.plan
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error);
      }

      const { tenant } = await response.json();
      
      const checkoutResponse = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenantId: tenant.id, plan: formData.plan })
      });

      const { url } = await checkoutResponse.json();
      window.location.href = url;
    } catch (error: any) {
      alert(error.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold mb-6">Create Your Store</h1>
        
        {step === 1 && (
          <form onSubmit={(e) => { e.preventDefault(); setStep(2); }} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Business Name</label>
              <input
                type="text"
                required
                value={formData.businessName}
                onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
                placeholder="My Awesome Store"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Subdomain</label>
              <div className="flex items-center">
                <input
                  type="text"
                  required
                  value={formData.subdomain}
                  onChange={(e) => setFormData({ ...formData, subdomain: e.target.value.toLowerCase() })}
                  className="flex-1 px-4 py-2 border rounded-l-lg"
                  placeholder="mystore"
                  pattern="[a-z0-9-]+"
                />
                <span className="px-4 py-2 bg-gray-100 border border-l-0 rounded-r-lg">
                  .yourplatform.com
                </span>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700"
            >
              Continue
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <h2 className="text-2xl font-bold mb-4">Choose Your Plan</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.entries(PLANS).map(([key, plan]) => (
                <div
                  key={key}
                  onClick={() => setFormData({ ...formData, plan: key })}
                  className={`p-6 border-2 rounded-lg cursor-pointer ${
                    formData.plan === key ? 'border-blue-600 bg-blue-50' : 'border-gray-200'
                  }`}
                >
                  <h3 className="text-xl font-bold capitalize mb-2">{key}</h3>
                  <p className="text-3xl font-bold mb-4">${plan.price}<span className="text-sm">/mo</span></p>
                  <ul className="space-y-2 text-sm">
                    <li>✓ {plan.products === -1 ? 'Unlimited' : plan.products} products</li>
                    <li>✓ {plan.orders === -1 ? 'Unlimited' : plan.orders} orders/mo</li>
                    <li>✓ {plan.users === -1 ? 'Unlimited' : plan.users} team members</li>
                  </ul>
                </div>
              ))}
            </div>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create Store'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
