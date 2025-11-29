'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { createOrderFromCart } from '@/lib/firestore/orders/create';
import { calculateShippingOptions } from '@/lib/shipping/prediction';

export default function CheckoutPage() {
  const { user, tenantId } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [shippingOptions, setShippingOptions] = useState([]);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    country: 'US',
    shippingMethod: '',
    paymentMethod: 'card'
  });

  useEffect(() => {
    const options = calculateShippingOptions({ country: 'US' }, 100);
    setShippingOptions(options as any);
  }, []);

  const handleCountryChange = (country: string) => {
    setFormData({ ...formData, country });
    const options = calculateShippingOptions({ country, state: formData.state }, 100);
    setShippingOptions(options as any);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !tenantId) return;

    setLoading(true);
    try {
      const shippingAddress = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        zip: formData.zip,
        country: formData.country
      };

      const order = await createOrderFromCart({
        userId: user.uid,
        shippingAddress,
        paymentMethod: formData.paymentMethod,
        tenantId
      });

      router.push(`/orders?success=true&orderId=${order.id}`);
    } catch (error: any) {
      alert(error.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">Checkout</h1>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">Shipping Information</h2>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <input
                type="text"
                required
                placeholder="First Name"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="px-4 py-2 border rounded"
              />
              <input
                type="text"
                required
                placeholder="Last Name"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="px-4 py-2 border rounded"
              />
            </div>

            <input
              type="email"
              required
              placeholder="Email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-2 border rounded mb-4"
            />

            <input
              type="tel"
              required
              placeholder="Phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-4 py-2 border rounded mb-4"
            />

            <input
              type="text"
              required
              placeholder="Address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-4 py-2 border rounded mb-4"
            />

            <div className="grid grid-cols-2 gap-4 mb-4">
              <input
                type="text"
                required
                placeholder="City"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="px-4 py-2 border rounded"
              />
              <input
                type="text"
                placeholder="State"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                className="px-4 py-2 border rounded"
              />
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <input
                type="text"
                required
                placeholder="ZIP Code"
                value={formData.zip}
                onChange={(e) => setFormData({ ...formData, zip: e.target.value })}
                className="px-4 py-2 border rounded"
              />
              <select
                value={formData.country}
                onChange={(e) => handleCountryChange(e.target.value)}
                className="px-4 py-2 border rounded"
              >
                <option value="US">United States</option>
                <option value="CA">Canada</option>
                <option value="UK">United Kingdom</option>
                <option value="AU">Australia</option>
              </select>
            </div>

            {shippingOptions.length > 0 && (
              <div className="mt-6">
                <h3 className="font-bold mb-3">Shipping Method</h3>
                {shippingOptions.map((option: any, idx: number) => (
                  <label key={idx} className="flex items-center justify-between p-3 border rounded mb-2 cursor-pointer hover:bg-gray-50">
                    <div className="flex items-center">
                      <input
                        type="radio"
                        name="shipping"
                        required
                        value={option.service}
                        onChange={(e) => setFormData({ ...formData, shippingMethod: e.target.value })}
                        className="mr-3"
                      />
                      <div>
                        <div className="font-semibold">{option.carrier} - {option.service}</div>
                        <div className="text-sm text-gray-600">{option.estimatedDays} business days</div>
                      </div>
                    </div>
                    <div className="font-bold">${option.cost.toFixed(2)}</div>
                  </label>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">Payment Method</h2>
            
            <div className="space-y-3 mb-6">
              <label className="flex items-center p-3 border rounded cursor-pointer">
                <input
                  type="radio"
                  name="payment"
                  value="card"
                  checked={formData.paymentMethod === 'card'}
                  onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                  className="mr-3"
                />
                <span>💳 Credit/Debit Card</span>
              </label>
              
              <label className="flex items-center p-3 border rounded cursor-pointer">
                <input
                  type="radio"
                  name="payment"
                  value="paypal"
                  checked={formData.paymentMethod === 'paypal'}
                  onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                  className="mr-3"
                />
                <span>💰 PayPal</span>
              </label>
              
              <label className="flex items-center p-3 border rounded cursor-pointer">
                <input
                  type="radio"
                  name="payment"
                  value="cod"
                  checked={formData.paymentMethod === 'cod'}
                  onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                  className="mr-3"
                />
                <span>💵 Cash on Delivery</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Place Order'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
