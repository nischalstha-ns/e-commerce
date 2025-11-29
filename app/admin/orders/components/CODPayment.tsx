'use client';

import { useState } from 'react';
import { markCODPaid, markCODFailed } from '@/lib/firestore/orders/cod';

interface CODPaymentProps {
  order: any;
  onUpdate: () => void;
}

export default function CODPayment({ order, onUpdate }: CODPaymentProps) {
  const [loading, setLoading] = useState(false);
  const [collectedBy, setCollectedBy] = useState('');

  if (order.paymentMethod !== 'cod') return null;

  const handleMarkPaid = async () => {
    if (!collectedBy) {
      alert('Please enter who collected the payment');
      return;
    }

    setLoading(true);
    try {
      await markCODPaid({
        id: order.id,
        paidAmount: order.codAmount || order.total,
        collectedBy
      });
      onUpdate();
    } catch (error) {
      alert('Failed to mark as paid');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkFailed = async () => {
    const reason = prompt('Reason for COD failure:');
    if (!reason) return;

    setLoading(true);
    try {
      await markCODFailed({ id: order.id, reason });
      onUpdate();
    } catch (error) {
      alert('Failed to mark as failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl">💵</span>
        <div>
          <h3 className="font-bold text-lg">Cash on Delivery</h3>
          <p className="text-sm text-gray-600">
            Amount to collect: <span className="font-bold">${order.codAmount?.toFixed(2) || order.total?.toFixed(2)}</span>
          </p>
        </div>
      </div>

      {order.paymentStatus === 'cod' && (
        <div className="space-y-3">
          <input
            type="text"
            placeholder="Collected by (driver name/ID)"
            value={collectedBy}
            onChange={(e) => setCollectedBy(e.target.value)}
            className="w-full px-4 py-2 border rounded"
          />
          
          <div className="flex gap-3">
            <button
              onClick={handleMarkPaid}
              disabled={loading}
              className="flex-1 bg-green-600 text-white py-2 rounded font-semibold hover:bg-green-700 disabled:opacity-50"
            >
              ✓ Mark as Paid
            </button>
            
            <button
              onClick={handleMarkFailed}
              disabled={loading}
              className="flex-1 bg-red-600 text-white py-2 rounded font-semibold hover:bg-red-700 disabled:opacity-50"
            >
              ✗ Payment Failed
            </button>
          </div>
        </div>
      )}

      {order.paymentStatus === 'paid' && (
        <div className="bg-green-100 border border-green-300 rounded p-3">
          <p className="font-semibold text-green-800">✓ Payment Collected</p>
          <p className="text-sm text-green-700">
            Collected by: {order.codCollectedBy}
          </p>
          <p className="text-sm text-green-700">
            Amount: ${order.codPaidAmount?.toFixed(2)}
          </p>
        </div>
      )}

      {order.paymentStatus === 'failed' && (
        <div className="bg-red-100 border border-red-300 rounded p-3">
          <p className="font-semibold text-red-800">✗ Payment Failed</p>
          <p className="text-sm text-red-700">
            Reason: {order.codFailReason}
          </p>
        </div>
      )}
    </div>
  );
}
