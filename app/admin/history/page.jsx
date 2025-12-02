"use client";

import { useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useOrders } from "@/lib/firestore/orders/read";
import { useReviews } from "@/lib/firestore/reviews/read";
import { useProducts } from "@/lib/firestore/products/read";
import { useRecentSales } from "@/lib/firestore/sales/read";
import { useUsers } from "@/lib/firestore/users/read";
import { useHistoryStore } from "@/lib/store/historyStore";
import { Calendar, ShoppingCart, Star, Package, Filter, X, DollarSign, Activity, User, Mail, Phone } from "lucide-react";
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
  const { data: users = [], isLoading: usersLoading } = useUsers();
  const historyItems = useHistoryStore((state) => state.history);

  const getUserById = (userId) => users.find(u => u.id === userId);
  const getProductById = (productId) => products.find(p => p.id === productId);
  
  const [selectedDate, setSelectedDate] = useState("");
  const [filterType, setFilterType] = useState(type || "all");

  const allActivities = useMemo(() => {
    const activities = [];
    
    orders.forEach(order => {
      const buyer = getUserById(order.userId);
      const orderProducts = order.items?.map(item => getProductById(item.productId)).filter(Boolean) || [];
      
      activities.push({
        id: order.id,
        type: "order",
        title: `Order #${order.id.slice(-8)}`,
        description: `${order.items?.length || 0} items - Rs. ${order.total?.toFixed(2)}`,
        status: order.status,
        timestamp: order.timestampCreate,
        buyer: buyer,
        products: orderProducts,
        image: orderProducts[0]?.imageURLs?.[0] || orderProducts[0]?.imageURL,
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
      const product = item.product || (item.data?.id ? getProductById(item.data.id) : null);
      const seller = item.seller || (item.data?.sellerId ? getUserById(item.data.sellerId) : null);
      const buyer = item.buyer || (item.data?.userId ? getUserById(item.data.userId) : null);
      
      activities.push({
        id: `history-${idx}`,
        type: item.action || item.type || "activity",
        title: item.description || "Activity",
        description: item.data?.name || item.data?.title || "",
        status: "completed",
        timestamp: { seconds: new Date(item.timestamp).getTime() / 1000 },
        product: product,
        seller: seller,
        buyer: buyer,
        image: product?.imageURLs?.[0] || product?.imageURL,
        data: item
      });
    });
    
    return activities.sort((a, b) => {
      const aTime = a.timestamp?.seconds || 0;
      const bTime = b.timestamp?.seconds || 0;
      return bTime - aTime;
    });
  }, [orders, reviews, products, sales, historyItems, users, userRole]);

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

  if (ordersLoading || reviewsLoading || productsLoading || salesLoading || usersLoading) {
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
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Activity History</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">View all activities and transactions</p>
        </div>
        <div className="flex gap-2">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="flex-1 sm:flex-initial px-3 py-2 text-sm border rounded-lg dark:bg-gray-800 dark:border-gray-600 focus:ring-2 focus:ring-blue-500"
          />
          {selectedDate && (
            <button onClick={() => setSelectedDate("")} className="px-3 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {(userRole === 'admin' 
          ? ["all", "order", "review", "product", "sale", "activity"]
          : ["all", "order", "review", "activity"]
        ).map(t => (
          <button
            key={t}
            onClick={() => setFilterType(t)}
            className={`px-3 sm:px-4 py-2 rounded-lg text-sm font-medium capitalize whitespace-nowrap transition-colors ${
              filterType === t 
                ? "bg-blue-600 text-white shadow-md" 
                : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {selectedActivity && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
            {selectedActivity.image && (
              <img src={selectedActivity.image} alt="Product" className="w-full sm:w-32 h-48 sm:h-32 object-cover rounded-lg" />
            )}
            <div className="flex-1 w-full space-y-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">{selectedActivity.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 mt-1">{selectedActivity.description}</p>
                <div className="flex items-center gap-3 mt-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedActivity.status)}`}>
                    {selectedActivity.status}
                  </span>
                  <span className="text-sm text-gray-500">
                    {new Date(selectedActivity.timestamp?.seconds * 1000).toLocaleString()}
                  </span>
                </div>
              </div>

              {selectedActivity.product && (
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 sm:p-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3 text-sm sm:text-base">Product Details</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 text-xs sm:text-sm">
                    <div className="flex justify-between sm:block"><span className="text-gray-500">Name:</span> <span className="font-medium text-gray-900 dark:text-white">{selectedActivity.product.name}</span></div>
                    <div className="flex justify-between sm:block"><span className="text-gray-500">SKU:</span> <span className="font-medium text-gray-900 dark:text-white">{selectedActivity.product.sku}</span></div>
                    <div className="flex justify-between sm:block"><span className="text-gray-500">Price:</span> <span className="font-medium text-gray-900 dark:text-white">Rs. {selectedActivity.product.price}</span></div>
                    <div className="flex justify-between sm:block"><span className="text-gray-500">Stock:</span> <span className="font-medium text-gray-900 dark:text-white">{selectedActivity.product.stock}</span></div>
                    <div className="flex justify-between sm:block"><span className="text-gray-500">Category:</span> <span className="font-medium text-gray-900 dark:text-white">{selectedActivity.product.categoryName}</span></div>
                    <div className="flex justify-between sm:block"><span className="text-gray-500">Brand:</span> <span className="font-medium text-gray-900 dark:text-white">{selectedActivity.product.brandName}</span></div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                {selectedActivity.seller && (
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 sm:p-4">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2 text-sm sm:text-base">
                      <User className="w-4 h-4" /> Seller
                    </h4>
                    <div className="space-y-1 text-xs sm:text-sm">
                      <p className="font-medium text-gray-900 dark:text-white break-words">{selectedActivity.seller.displayName || selectedActivity.seller.email}</p>
                      {selectedActivity.seller.email && (
                        <p className="text-gray-600 dark:text-gray-400 flex items-center gap-1 break-all">
                          <Mail className="w-3 h-3 flex-shrink-0" /> <span className="break-all">{selectedActivity.seller.email}</span>
                        </p>
                      )}
                      {selectedActivity.seller.phone && (
                        <p className="text-gray-600 dark:text-gray-400 flex items-center gap-1">
                          <Phone className="w-3 h-3 flex-shrink-0" /> {selectedActivity.seller.phone}
                        </p>
                      )}
                      <p className="text-xs text-gray-500 capitalize">Role: {selectedActivity.seller.role}</p>
                    </div>
                  </div>
                )}

                {selectedActivity.buyer && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 sm:p-4">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2 text-sm sm:text-base">
                      <User className="w-4 h-4" /> Buyer
                    </h4>
                    <div className="space-y-1 text-xs sm:text-sm">
                      <p className="font-medium text-gray-900 dark:text-white break-words">{selectedActivity.buyer.displayName || selectedActivity.buyer.email}</p>
                      {selectedActivity.buyer.email && (
                        <p className="text-gray-600 dark:text-gray-400 flex items-center gap-1 break-all">
                          <Mail className="w-3 h-3 flex-shrink-0" /> <span className="break-all">{selectedActivity.buyer.email}</span>
                        </p>
                      )}
                      {selectedActivity.buyer.phone && (
                        <p className="text-gray-600 dark:text-gray-400 flex items-center gap-1">
                          <Phone className="w-3 h-3 flex-shrink-0" /> {selectedActivity.buyer.phone}
                        </p>
                      )}
                      {selectedActivity.buyer.address && (
                        <p className="text-xs text-gray-500 line-clamp-2">{selectedActivity.buyer.address}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {selectedActivity.products && selectedActivity.products.length > 0 && (
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 sm:p-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3 text-sm sm:text-base">Order Products ({selectedActivity.products.length})</h4>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {selectedActivity.products.map((product, idx) => (
                      <div key={idx} className="flex items-center gap-3 bg-white dark:bg-gray-800 rounded-lg p-2 sm:p-3">
                        <img src={product.imageURLs?.[0] || product.imageURL || 'https://via.placeholder.com/50'} alt={product.name} className="w-10 h-10 sm:w-12 sm:h-12 object-cover rounded flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 dark:text-white text-xs sm:text-sm truncate">{product.name}</p>
                          <p className="text-xs text-gray-500">Rs. {product.price} • {product.categoryName}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {Object.entries(groupedByDate).map(([date, activities]) => (
          <div key={date} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-3 sm:p-6">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4 flex items-center gap-2">
              <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
              {date}
            </h2>
            <div className="space-y-2 sm:space-y-3">
              {activities.map(activity => (
                <a
                  key={activity.id}
                  href={`/admin/history?type=${activity.type}&id=${activity.id}`}
                  className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors active:scale-[0.98]"
                >
                  {activity.image ? (
                    <img src={activity.image} alt={activity.title} className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded-lg flex-shrink-0" />
                  ) : (
                    <div className="p-2 sm:p-3 bg-white dark:bg-gray-800 rounded-lg flex-shrink-0">
                      {getIcon(activity.type)}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white truncate">{activity.title}</h3>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 line-clamp-1 mt-0.5">{activity.description}</p>
                    
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-2 text-xs">
                      {activity.buyer && (
                        <span className="text-gray-600 dark:text-gray-400 flex items-center gap-1 truncate max-w-[150px] sm:max-w-none">
                          <User className="w-3 h-3 flex-shrink-0" /> <span className="truncate">{activity.buyer.displayName || activity.buyer.email?.split('@')[0]}</span>
                        </span>
                      )}
                      {activity.seller && (
                        <span className="text-gray-600 dark:text-gray-400 flex items-center gap-1 truncate max-w-[150px] sm:max-w-none">
                          <User className="w-3 h-3 flex-shrink-0" /> <span className="truncate">Seller: {activity.seller.displayName || activity.seller.email?.split('@')[0]}</span>
                        </span>
                      )}
                      {activity.product && (
                        <span className="text-gray-600 dark:text-gray-400 flex items-center gap-1 truncate max-w-[150px] sm:max-w-none">
                          <Package className="w-3 h-3 flex-shrink-0" /> <span className="truncate">{activity.product.name}</span>
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 sm:gap-3 mt-2 flex-wrap">
                      <span className={`px-2 py-0.5 sm:py-1 rounded-full text-xs font-medium ${getStatusColor(activity.status)}`}>
                        {activity.status}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(activity.timestamp?.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        ))}
        {Object.keys(groupedByDate).length === 0 && (
          <div className="text-center py-12 sm:py-16 bg-white dark:bg-gray-800 rounded-xl">
            <Calendar className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-gray-400" />
            <h3 className="mt-4 text-base sm:text-lg font-semibold text-gray-900 dark:text-white">No activities found</h3>
            <p className="text-sm text-gray-500 mt-2 px-4">Try adjusting your filters</p>
          </div>
        )}
      </div>
    </div>
  );
}
