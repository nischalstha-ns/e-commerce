'use client';

import { useState } from 'react';
import { updateOrderStatus, updateShippingInfo } from '@/lib/firestore/orders/write';
import { trackShipment, getShippingStatus, formatDeliveryDate } from '@/lib/shipping/prediction';
import CODPayment from './CODPayment';

interface OrderDetailsProps {
  order: any;
  onUpdate: () => void;
}

export default function OrderDetails({ order, onUpdate }: OrderDetailsProps) {
  const [loading, setLoading] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState(order.trackingNumber || '');
  const [carrier, setCarrier] = useState(order.carrier || 'USPS');

  const handleStatusUpdate = async (newStatus: string) => {
    setLoading(true);
    try {
      await updateOrderStatus({ id: order.id, status: newStatus });
      onUpdate();
    } catch (error) {
      alert('Failed to update status');
    } finally {
      setLoading(false);
    }
  };

  const handleShippingUpdate = async () => {
    if (!trackingNumber) return;
    
    setLoading(true);
    try {
      await updateShippingInfo({
        id: order.id,
        trackingNumber,
        carrier,
        estimatedDelivery: order.estimatedDelivery
      });
      onUpdate();
    } catch (error) {
      alert('Failed to update shipping info');
    } finally {
      setLoading(false);
    }
  };

  const shippingStatus = getShippingStatus(order.shippingStatus || 'not_shipped');
  const trackingUrl = order.trackingNumber ? trackShipment(order.trackingNumber, order.carrier || 'USPS') : null;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <CODPayment order={order} onUpdate={onUpdate} />
      
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-2xl font-bold">Order #{order.orderNumber}</h2>
          <p className="text-gray-600">
            {order.timestampCreate?.toDate?.()?.toLocaleDateString() || 'N/A'}
          </p>
        </div>
        <span className={`px-4 py-2 rounded-full font-semibold ${
          order.status === 'delivered' ? 'bg-green-100 text-green-800' :
          order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
          order.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
          order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {order.status}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <h3 className="font-bold mb-2">Customer</h3>
          <p>{order.shippingAddress?.firstName} {order.shippingAddress?.lastName}</p>
          <p className="text-gray-600">{order.shippingAddress?.email}</p>
          <p className="text-gray-600">{order.shippingAddress?.phone}</p>
        </div>

        <div>
          <h3 className="font-bold mb-2">Shipping Address</h3>
          <p>{order.shippingAddress?.address}</p>
          <p>{order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.zip}</p>
          <p>{order.shippingAddress?.country}</p>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="font-bold mb-3">Shipping Status</h3>
        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
          <span className="text-2xl">{shippingStatus.icon}</span>
          <div className="flex-1">
            <p className="font-semibold">{shippingStatus.label}</p>
            {order.estimatedDelivery && (
              <p className="text-sm text-gray-600">
                Estimated delivery: {formatDeliveryDate(new Date(order.estimatedDelivery))}
              </p>
            )}
          </div>
        </div>

        {trackingUrl && (
          <a
            href={trackingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-block text-blue-600 hover:underline"
          >
            Track Package: {order.trackingNumber}
          </a>
        )}
      </div>

      <div className="mb-6">
        <h3 className="font-bold mb-3">Items</h3>
        <div className="space-y-3">
          {order.items?.map((item: any, idx: number) => (
            <div key={idx} className="flex items-center gap-4 p-3 border rounded">
              {item.image && (
                <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded" />
              )}
              <div className="flex-1">
                <p className="font-semibold">{item.name}</p>
                <p className="text-sm text-gray-600">
                  {item.size && `Size: ${item.size}`} {item.color && `Color: ${item.color}`}
                </p>
                <p className="text-sm">Qty: {item.quantity}</p>
              </div>
              <p className="font-bold">${item.total?.toFixed(2)}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-6 p-4 bg-gray-50 rounded">
        <div className="flex justify-between mb-2">
          <span>Subtotal:</span>
          <span>${order.subtotal?.toFixed(2)}</span>
        </div>
        <div className="flex justify-between mb-2">
          <span>Shipping:</span>
          <span>${order.shipping?.toFixed(2)}</span>
        </div>
        <div className="flex justify-between mb-2">
          <span>Tax:</span>
          <span>${order.tax?.toFixed(2)}</span>
        </div>
        <div className="flex justify-between font-bold text-lg pt-2 border-t">
          <span>Total:</span>
          <span>${order.total?.toFixed(2)}</span>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="font-bold mb-3">Update Tracking</h3>
        <div className="flex gap-3">
          <select
            value={carrier}
            onChange={(e) => setCarrier(e.target.value)}
            className="px-4 py-2 border rounded"
          >
            <option value="USPS">USPS</option>
            <option value="FedEx">FedEx</option>
            <option value="UPS">UPS</option>
            <option value="DHL">DHL</option>
            <option value="Canada Post">Canada Post</option>
          </select>
          <input
            type="text"
            placeholder="Tracking Number"
            value={trackingNumber}
            onChange={(e) => setTrackingNumber(e.target.value)}
            className="flex-1 px-4 py-2 border rounded"
          />
          <button
            onClick={handleShippingUpdate}
            disabled={loading || !trackingNumber}
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            Update
          </button>
        </div>
      </div>

      <div>
        <h3 className="font-bold mb-3">Update Status</h3>
        <div className="flex flex-wrap gap-2">
          {['pending', 'processing', 'shipped', 'delivered', 'cancelled'].map((status) => (
            <button
              key={status}
              onClick={() => handleStatusUpdate(status)}
              disabled={loading || order.status === status}
              className={`px-4 py-2 rounded font-semibold ${
                order.status === status
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
