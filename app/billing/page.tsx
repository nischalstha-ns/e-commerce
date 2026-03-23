'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getTenant, PLANS, Tenant } from '@/lib/saas/tenant';
import { createStripePortal, cancelSubscription } from '@/lib/saas/billing';

export default function BillingPage() {
  const { tenantId } = useAuth() as { tenantId: string | null };
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (tenantId) {
      loadTenant();
    }
  }, [tenantId]);

  const loadTenant = async () => {
    if (!tenantId) return;
    
    try {
      const data = await getTenant(tenantId);
      setTenant(data);
    } catch (error) {
      console.error('Failed to load tenant:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleManageBilling = async () => {
    if (!tenantId) return;
    
    try {
      const { url } = await createStripePortal(tenantId);
      window.location.href = url;
    } catch (error) {
      alert('Failed to open billing portal');
    }
  };

  const handleCancelSubscription = async () => {
    if (!tenantId || !confirm('Are you sure you want to cancel your subscription?')) return;
    
    try {
      await cancelSubscription(tenantId);
      alert('Subscription cancelled successfully');
      loadTenant();
    } catch (error) {
      alert('Failed to cancel subscription');
    }
  };

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  if (!tenant) {
    return <div className="p-8">Tenant not found</div>;
  }

  const currentPlan = PLANS[tenant.plan];

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Billing & Subscription</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Current Plan</h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold capitalize">{tenant.plan}</p>
              <p className="text-gray-600">${currentPlan.price}/month</p>
            </div>
            <span className={`px-4 py-2 rounded-full font-semibold ${
              tenant.status === 'active' ? 'bg-green-100 text-green-800' :
              tenant.status === 'suspended' ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              {tenant.status}
            </span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Usage</h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span>Products</span>
                <span>{tenant.usage.products} / {tenant.limits.products === -1 ? 'Unlimited' : tenant.limits.products}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full" 
                  style={{ width: tenant.limits.products === -1 ? '0%' : `${(tenant.usage.products / tenant.limits.products) * 100}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <span>Orders</span>
                <span>{tenant.usage.orders} / {tenant.limits.orders === -1 ? 'Unlimited' : tenant.limits.orders}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full" 
                  style={{ width: tenant.limits.orders === -1 ? '0%' : `${(tenant.usage.orders / tenant.limits.orders) * 100}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <span>Team Members</span>
                <span>{tenant.usage.users} / {tenant.limits.users === -1 ? 'Unlimited' : tenant.limits.users}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full" 
                  style={{ width: tenant.limits.users === -1 ? '0%' : `${(tenant.usage.users / tenant.limits.users) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">Actions</h2>
          <div className="space-y-3">
            <button
              onClick={handleManageBilling}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700"
            >
              Manage Billing
            </button>
            
            {tenant.status === 'active' && (
              <button
                onClick={handleCancelSubscription}
                className="w-full bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700"
              >
                Cancel Subscription
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
