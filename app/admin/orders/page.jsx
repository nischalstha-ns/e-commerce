"use client";

import { useState, useMemo } from "react";
import { useOrders } from "@/lib/firestore/orders/read";
import { updateOrderStatus } from "@/lib/firestore/orders/write";
import { useHistoryStore } from "@/lib/store/historyStore";
import { useTranslation } from "@/lib/hooks/useTranslation";
import { ShoppingBag, Search, CheckCircle, XCircle, Truck, Eye, X } from "lucide-react";
import LoadingSpinner from "@/app/components/LoadingSpinner";
import toast from "react-hot-toast";

export default function OrdersPage() {
  const t = useTranslation();
  const { data: orders = [], isLoading } = useOrders();
  const addHistory = useHistoryStore((state) => state.addHistory);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState(null);

  const filteredOrders = useMemo(() => {
    let filtered = orders;
    if (statusFilter !== "all") {
      filtered = filtered.filter(o => o.status === statusFilter);
    }
    if (searchTerm) {
      filtered = filtered.filter(o => 
        o.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.customerEmail?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return filtered;
  }, [orders, statusFilter, searchTerm]);

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await updateOrderStatus({ id: orderId, status: newStatus });
      addHistory({ 
        type: 'order-update', 
        description: `Order ${orderId.slice(0, 8)} ${newStatus}`, 
        data: { orderId, status: newStatus } 
      });
      toast.success(`${t.orderStatus}: ${t[newStatus]}`);
    } catch (error) {
      toast.error(t.failedToSave);
    }
  };

  if (isLoading) return <LoadingSpinner size="lg" label={t.loading} />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{t.orders}</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">{filteredOrders.length} {t.orders}</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search orders..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Status</option>
          <option value="pending">{t.pending}</option>
          <option value="accepted">{t.accepted}</option>
          <option value="shipped">{t.shipped}</option>
          <option value="delivered">{t.delivered}</option>
          <option value="rejected">{t.rejected}</option>
        </select>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl">
          <ShoppingBag className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-xl font-semibold text-gray-900 dark:text-white">No orders found</h3>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredOrders.map((order) => (
            <div key={order.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Order #{order.id?.slice(0, 8)}</h3>
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                      order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      order.status === 'accepted' ? 'bg-blue-100 text-blue-800' :
                      order.status === 'shipped' ? 'bg-purple-100 text-purple-800' :
                      order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {t[order.status] || order.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{order.items?.length || 0} {t.items} • Rs. {order.total?.toFixed(2) || "0.00"}</p>
                  <p className="text-sm text-gray-500 mt-1">{order.timestampCreate?.toDate?.()?.toLocaleString() || "N/A"}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => setSelectedOrder(order)} className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                    <Eye className="w-4 h-4" />
                  </button>
                  {order.status === 'pending' && (
                    <>
                      <button onClick={() => handleUpdateStatus(order.id, 'accepted')} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                        <CheckCircle className="w-4 h-4" />
                        <span className="hidden sm:inline">{t.acceptOrder}</span>
                      </button>
                      <button onClick={() => handleUpdateStatus(order.id, 'rejected')} className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                        <XCircle className="w-4 h-4" />
                        <span className="hidden sm:inline">{t.rejectOrder}</span>
                      </button>
                    </>
                  )}
                  {order.status === 'accepted' && (
                    <button onClick={() => handleUpdateStatus(order.id, 'shipped')} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                      <Truck className="w-4 h-4" />
                      <span className="hidden sm:inline">{t.markShipped}</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedOrder && (
        <OrderDetailModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />
      )}
    </div>
  );
}

function OrderDetailModal({ order, onClose }) {
  const t = useTranslation();
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onClose}>
      <div className="relative w-full max-w-2xl bg-white dark:bg-gray-800 rounded-lg shadow-2xl m-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b dark:border-gray-700">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{t.orderDetails}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="p-6 space-y-6">
          <div>
            <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">{t.orderStatus}</h4>
            <span className={`inline-block px-3 py-1 text-sm font-medium rounded-full ${
              order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
              order.status === 'accepted' ? 'bg-blue-100 text-blue-800' :
              order.status === 'shipped' ? 'bg-purple-100 text-purple-800' :
              order.status === 'delivered' ? 'bg-green-100 text-green-800' :
              'bg-red-100 text-red-800'
            }`}>
              {t[order.status] || order.status}
            </span>
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">{t.items}</h4>
            <div className="space-y-2">
              {order.items?.map((item, idx) => (
                <div key={idx} className="flex justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{item.name}</p>
                    <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                  </div>
                  <p className="font-semibold text-gray-900 dark:text-white">Rs. {(item.price * item.quantity).toFixed(2)}</p>
                </div>
              ))}
            </div>
          </div>
          
          <div className="pt-4 border-t dark:border-gray-700">
            <div className="flex justify-between text-lg font-bold">
              <span>{t.total}</span>
              <span className="text-blue-600">Rs. {order.total?.toFixed(2) || "0.00"}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
