'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/firestore/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { Tenant } from '@/lib/saas/tenant';

export default function SuperAdminPage() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    revenue: 0
  });

  useEffect(() => {
    loadTenants();
  }, []);

  const loadTenants = async () => {
    if (!db) return;
    
    try {
      const q = query(collection(db, 'tenants'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const tenantsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Tenant[];
      
      setTenants(tenantsData);
      
      const active = tenantsData.filter(t => t.status === 'active').length;
      const revenue = tenantsData.reduce((sum, t) => {
        if (t.status === 'active') {
          return sum + (t.plan === 'basic' ? 29 : t.plan === 'pro' ? 99 : 299);
        }
        return sum;
      }, 0);
      
      setStats({
        total: tenantsData.length,
        active,
        revenue
      });
    } catch (error) {
      console.error('Failed to load tenants:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Super Admin Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-gray-500 text-sm font-medium">Total Tenants</h3>
            <p className="text-3xl font-bold mt-2">{stats.total}</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-gray-500 text-sm font-medium">Active Tenants</h3>
            <p className="text-3xl font-bold mt-2">{stats.active}</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-gray-500 text-sm font-medium">Monthly Revenue</h3>
            <p className="text-3xl font-bold mt-2">${stats.revenue}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Business</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subdomain</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Plan</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Usage</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {tenants.map((tenant) => (
                <tr key={tenant.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{tenant.businessName}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <a href={`https://${tenant.subdomain}.yourplatform.com`} className="text-blue-600 hover:underline">
                      {tenant.subdomain}
                    </a>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 capitalize">
                      {tenant.plan}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      tenant.status === 'active' ? 'bg-green-100 text-green-800' :
                      tenant.status === 'suspended' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {tenant.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div>Products: {tenant.usage.products}/{tenant.limits.products === -1 ? '∞' : tenant.limits.products}</div>
                    <div>Orders: {tenant.usage.orders}/{tenant.limits.orders === -1 ? '∞' : tenant.limits.orders}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
