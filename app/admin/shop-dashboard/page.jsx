"use client";

import { useMemo } from "react";
import { useProducts } from "@/lib/firestore/products/read";
import { useOrders } from "@/lib/firestore/orders/read";
import { useTodaySales, useRecentSales } from "@/lib/firestore/sales/read";
import { useUndoRedoStore } from "@/lib/store/undoRedoStore";
import { useHistoryStore } from "@/lib/store/historyStore";
import { useTranslation } from "@/lib/hooks/useTranslation";
import { TrendingUp, Package, AlertTriangle, ShoppingCart, Undo2, Redo2, Clock, CheckCircle, XCircle } from "lucide-react";
import LoadingSpinner from "@/app/components/LoadingSpinner";
import { updateProduct, createNewProduct } from "@/lib/firestore/products/write";
import toast from "react-hot-toast";
import Link from "next/link";

export default function ShopDashboard() {
  const t = useTranslation();
  const { data: products = [], isLoading: productsLoading } = useProducts();
  const { data: orders = [] } = useOrders();
  const { data: todaySales, isLoading: salesLoading } = useTodaySales();
  const { data: recentSales = [] } = useRecentSales(5);
  const { undo, redo, canUndo, canRedo } = useUndoRedoStore();
  const history = useHistoryStore((state) => state.getRecentHistory(10));

  const stats = useMemo(() => {
    const active = products.filter(p => p.status === 'active').length;
    const inactive = products.filter(p => p.status === 'inactive' || p.status === 'archived').length;
    const lowStock = products.filter(p => p.stock > 0 && p.stock <= 10);
    const pending = orders.filter(o => o.status === 'pending').length;
    return { total: products.length, active, inactive, lowStock, pending };
  }, [products, orders]);

  const handleUndo = async () => {
    const action = undo();
    if (!action) {
      toast.error(t.cannotUndo);
      return;
    }
    
    try {
      if (action.type === 'delete' && action.data) {
        await createNewProduct({ data: action.data, images: [] });
      } else if (action.type === 'update' && action.previousData) {
        await updateProduct({ id: action.data.id, data: action.previousData });
      }
      toast.success(t.actionUndone);
    } catch (error) {
      toast.error(t.failedToSave);
    }
  };

  const handleRedo = async () => {
    const action = redo();
    if (!action) {
      toast.error(t.cannotRedo);
      return;
    }
    
    try {
      if (action.type === 'create' && action.data) {
        await createNewProduct({ data: action.data, images: [] });
      } else if (action.type === 'update' && action.data) {
        await updateProduct({ id: action.data.id, data: action.data });
      }
      toast.success(t.actionRedone);
    } catch (error) {
      toast.error(t.failedToSave);
    }
  };

  if (productsLoading || salesLoading) {
    return <LoadingSpinner size="lg" label={t.loading} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{t.dashboard}</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">{t.todaySales} & {t.lowStockAlert}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleUndo} disabled={!canUndo()} className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
            <Undo2 className="w-4 h-4" />
            <span className="hidden sm:inline">{t.undoAction}</span>
          </button>
          <button onClick={handleRedo} disabled={!canRedo()} className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
            <Redo2 className="w-4 h-4" />
            <span className="hidden sm:inline">{t.redoAction}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border-l-4 border-purple-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t.totalProducts}</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{stats.total}</p>
            </div>
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <Package className="w-8 h-8 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border-l-4 border-green-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t.activeProducts}</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{stats.active}</p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border-l-4 border-red-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t.pendingOrdersCount}</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{stats.pending}</p>
            </div>
            <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <Clock className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border-l-4 border-blue-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t.todaySales}</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{todaySales?.count || 0}</p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <ShoppingCart className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border-l-4 border-green-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t.totalRevenue}</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">Rs. {todaySales?.total?.toFixed(2) || "0.00"}</p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <TrendingUp className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border-l-4 border-yellow-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t.lowStockAlert}</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{lowStockProducts.length}</p>
            </div>
            <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
              <AlertTriangle className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
          <div className="p-4 border-b dark:border-gray-700 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t.lowStockAlert}</h3>
            <Link href="/admin/products" className="text-sm text-blue-600 hover:underline">{t.viewAll}</Link>
          </div>
          <div className="p-4">
            {stats.lowStock.length === 0 ? (
              <div className="text-center py-8">
                <Package className="mx-auto h-12 w-12 text-gray-400" />
                <p className="text-gray-500 dark:text-gray-400 mt-2">All products have sufficient stock</p>
              </div>
            ) : (
              <div className="space-y-3">
                {stats.lowStock.slice(0, 5).map((product) => (
                  <div key={product.id} className="flex items-center gap-3 p-3 bg-yellow-50 dark:bg-yellow-900/10 rounded-lg border border-yellow-200 dark:border-yellow-800">
                    <img src={product.imageURLs?.[0] || product.imageURL || "https://via.placeholder.com/50"} alt={product.name} className="w-12 h-12 object-cover rounded" loading="lazy" onError={(e) => { e.target.onerror = null; e.target.src = "https://via.placeholder.com/50"; }} />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 dark:text-white truncate">{product.name}</p>
                      <p className="text-sm text-gray-500">SKU: {product.sku}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-yellow-600">{product.stock}</p>
                      <p className="text-xs text-gray-500">{t.stock}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
          <div className="p-4 border-b dark:border-gray-700 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t.recentSales}</h3>
            <Link href="/admin/orders" className="text-sm text-blue-600 hover:underline">{t.viewAll}</Link>
          </div>
          <div className="p-4">
            {recentSales.length === 0 ? (
              <div className="text-center py-8">
                <ShoppingCart className="mx-auto h-12 w-12 text-gray-400" />
                <p className="text-gray-500 dark:text-gray-400 mt-2">No sales yet today</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentSales.map((sale) => (
                  <div key={sale.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-white">{sale.items?.length || 0} {t.items}</p>
                      <p className="text-sm text-gray-500">{sale.timestampCreate?.toDate?.()?.toLocaleTimeString() || "N/A"}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-green-600">Rs. {sale.total?.toFixed(2) || "0.00"}</p>
                      <p className="text-xs text-gray-500 uppercase">{sale.paymentMethod || "cash"}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
          <div className="p-4 border-b dark:border-gray-700 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t.activityLog}</h3>
          </div>
          <div className="p-4">
            {history.length === 0 ? (
              <div className="text-center py-8">
                <Clock className="mx-auto h-12 w-12 text-gray-400" />
                <p className="text-gray-500 dark:text-gray-400 mt-2">{t.noHistory}</p>
              </div>
            ) : (
              <div className="space-y-2">
                {history.map((item) => (
                  <div key={item.id} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-start gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{item.description}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {new Date(item.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
