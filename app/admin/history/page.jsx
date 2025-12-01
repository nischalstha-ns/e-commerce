"use client";

import { useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useOrders } from "@/lib/firestore/orders/read";
import { useReviews } from "@/lib/firestore/reviews/read";
import { useProducts } from "@/lib/firestore/products/read";
import { useRecentSales } from "@/lib/firestore/sales/read";
import { useHistoryStore } from "@/lib/store/historyStore";
import { Calendar, ShoppingCart, Star, Package, Filter, X, DollarSign, Activity, User } from "lucide-react";
import LoadingSpinner from "@/app/components/LoadingSpinner";

export default function HistoryPage() {
  const searchParams = useSearchParams();
  const type = searchParams.get("type");
  const id = searchParams.get("id");
  const { userRole } = useAuth();
  
  const { data: orders = [], isLoading: ordersLoading } = useOrders();
  const { data: reviews = [], isLoading: reviewsLoading } = useReviews();
  const { data: products = [], isLoading: productsLoading } = useProducts();
  const { data: sales = [], isLoading: salesLoading } = useRecentSales();
  const historyItems = useHistoryStore((state) => state.history);
  
  const [selectedDate, setSelectedDate] = useState("");
  const [filterType, setFilterType] = useState(type || "all");

  const allActivities = useMemo(() => {
    const activities = [];
    
    orders.forEach(order => {
      activities.push({
        id: order.id,
        type: "order",
        title: `Order #${order.id.slice(-8)}`,
        description: `${order.items?.length || 0} items - Rs. ${order.total?.toFixed(2)}`,
        status: order.status,
        timestamp: order.timestampCreate,
        data: order
      });
    });
    
    reviews.forEach(review => {
      activities.push({
        id: review.id,
        type: "review",
        title: `Review by ${review.userName}`,
        description: review.comment,
        status: review.status,
        timestamp: review.timestampCreate,
        data: review
      });
    });
    
    if (userRole === 'admin') {
      products.forEach(product => {
        activities.push({
          id: product.id,
          type: "product",
          title: product.name,
          description: `Rs. ${product.price} - Stock: ${product.stock}`,
          status: product.stock > 0 ? "active" : "out-of-stock",
          timestamp: product.timestampCreate,
          image: product.imageURLs?.[0] || product.imageURL,
          data: product
        });
      });
      
      sales.forEach(sale => {
        activities.push({
          id: sale.id,
          type: "sale",
          title: `POS Sale #${sale.id?.slice(-8)}`,
          description: `${sale.items?.length || 0} items - Rs. ${sale.total?.toFixed(2)} (${sale.paymentMethod})`,
          status: sale.status || "completed",
          timestamp: sale.timestamp,
          data: sale
        });
      });
    }
    
    historyItems.forEach((item, idx) => {
      activities.push({
        id: `history-${idx}`,
        type: item.type || "activity",
        title: item.description || "Activity",
        description: item.data ? JSON.stringify(item.data).slice(0, 100) : "",
        status: "completed",
        timestamp: { seconds: new Date(item.timestamp).getTime() / 1000 },
        data: item
      });
    });
    
    return activities.sort((a, b) => {
      const aTime = a.timestamp?.seconds || 0;
      const bTime = b.timestamp?.seconds || 0;
      return bTime - aTime;
    });
  }, [orders, reviews, products, sales, historyItems, userRole]);

  const filteredActivities = useMemo(() => {
    let filtered = allActivities;
    
    if (filterType !== "all") {
      filtered = filtered.filter(a => a.type === filterType);
    }
    
    if (selectedDate) {
      filtered = filtered.filter(a => {
        if (!a.timestamp?.seconds) return false;
        const activityDate = new Date(a.timestamp.seconds * 1000).toISOString().split('T')[0];
        return activityDate === selectedDate;
      });
    }
    
    return filtered;
  }, [allActivities, filterType, selectedDate]);

  const groupedByDate = useMemo(() => {
    const grouped = {};
    filteredActivities.forEach(activity => {
      if (!activity.timestamp?.seconds) return;
      const date = new Date(activity.timestamp.seconds * 1000).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      if (!grouped[date]) grouped[date] = [];
      grouped[date].push(activity);
    });
    return grouped;
  }, [filteredActivities]);

  const selectedActivity = useMemo(() => {
    if (!id) return null;
    return allActivities.find(a => a.id === id);
  }, [id, allActivities]);

  if (ordersLoading || reviewsLoading || productsLoading || salesLoading) {
    return <LoadingSpinner size="lg" label="Loading history..." />;
  }

  const getIcon = (type) => {
    switch (type) {
      case "order": return <ShoppingCart className="w-5 h-5" />;
      case "review": return <Star className="w-5 h-5" />;
      case "product": return <Package className="w-5 h-5" />;
      case "sale": return <DollarSign className="w-5 h-5" />;
      case "activity": return <Activity className="w-5 h-5" />;
      default: return <Calendar className="w-5 h-5" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "processing": return "bg-blue-100 text-blue-800";
      case "completed": return "bg-green-100 text-green-800";
      case "approved": return "bg-green-100 text-green-800";
      case "rejected": return "bg-red-100 text-red-800";
      case "active": return "bg-green-100 text-green-800";
      case "out-of-stock": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Activity History</h1>
          <p className="text-gray-600 dark:text-gray-400">View all activities and transactions</p>
        </div>
        <div className="flex gap-3">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600"
          />
          {selectedDate && (
            <button onClick={() => setSelectedDate("")} className="px-3 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      <div className="flex gap-3 flex-wrap">
        {(userRole === 'admin' 
          ? ["all", "order", "review", "product", "sale", "activity"]
          : ["all", "order", "review", "activity"]
        ).map(t => (
          <button
            key={t}
            onClick={() => setFilterType(t)}
            className={`px-4 py-2 rounded-lg font-medium capitalize ${
              filterType === t 
                ? "bg-blue-600 text-white" 
                : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {selectedActivity && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/40 rounded-lg">
              {getIcon(selectedActivity.type)}
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{selectedActivity.title}</h3>
              <p className="text-gray-600 dark:text-gray-400 mt-1">{selectedActivity.description}</p>
              <div className="flex items-center gap-3 mt-3">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedActivity.status)}`}>
                  {selectedActivity.status}
                </span>
                <span className="text-sm text-gray-500">
                  {new Date(selectedActivity.timestamp?.seconds * 1000).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {Object.entries(groupedByDate).map(([date, activities]) => (
          <div key={date} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              {date}
            </h2>
            <div className="space-y-3">
              {activities.map(activity => (
                <a
                  key={activity.id}
                  href={`/admin/history?type=${activity.type}&id=${activity.id}`}
                  className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                >
                  {activity.image ? (
                    <img src={activity.image} alt={activity.title} className="w-12 h-12 object-cover rounded-lg" />
                  ) : (
                    <div className="p-2 bg-white dark:bg-gray-800 rounded-lg">
                      {getIcon(activity.type)}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 dark:text-white truncate">{activity.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{activity.description}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(activity.status)}`}>
                        {activity.status}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(activity.timestamp?.seconds * 1000).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        ))}
        {Object.keys(groupedByDate).length === 0 && (
          <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl">
            <Calendar className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">No activities found</h3>
            <p className="text-gray-500 mt-2">Try adjusting your filters</p>
          </div>
        )}
      </div>
    </div>
  );
}
