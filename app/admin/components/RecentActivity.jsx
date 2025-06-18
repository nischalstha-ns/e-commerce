"use client";

import { useOrders } from "@/lib/firestore/orders/read";
import { useReviews } from "@/lib/firestore/reviews/read";
import { useProducts } from "@/lib/firestore/products/read";
import { Card, CardBody, CardHeader, CircularProgress, Chip, Avatar } from "@heroui/react";
import { ShoppingCart, Star, Package, User, Calendar } from "lucide-react";

export default function RecentActivity() {
    const { data: orders, isLoading: ordersLoading } = useOrders();
    const { data: reviews, isLoading: reviewsLoading } = useReviews();
    const { data: products, isLoading: productsLoading } = useProducts();

    const recentOrders = orders?.slice(0, 3) || [];
    const recentReviews = reviews?.slice(0, 3) || [];
    const recentProducts = products?.slice(0, 3) || [];

    const formatDate = (timestamp) => {
        if (!timestamp) return "N/A";
        return new Date(timestamp.seconds * 1000).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusColor = (status) => {
        switch (status) {
            case "pending": return "warning";
            case "processing": return "primary";
            case "shipped": return "secondary";
            case "delivered": return "success";
            case "cancelled": return "danger";
            case "approved": return "success";
            case "rejected": return "danger";
            default: return "default";
        }
    };

    if (ordersLoading || reviewsLoading || productsLoading) {
        return (
            <div className="flex justify-center p-8">
                <CircularProgress />
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Orders */}
            <Card className="shadow-sm">
                <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                        <ShoppingCart className="w-5 h-5 text-gray-600" />
                        <h3 className="text-lg font-semibold">Recent Orders</h3>
                    </div>
                </CardHeader>
                <CardBody className="pt-0">
                    <div className="space-y-3">
                        {recentOrders.map((order) => (
                            <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <p className="font-medium text-sm">#{order.id.slice(-8)}</p>
                                        <Chip 
                                            color={getStatusColor(order.status)} 
                                            size="sm" 
                                            className="capitalize"
                                        >
                                            {order.status}
                                        </Chip>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-gray-600">
                                        <Calendar className="w-3 h-3" />
                                        {formatDate(order.timestampCreate)}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-sm">Rs. {order.total?.toFixed(2) || "0.00"}</p>
                                </div>
                            </div>
                        ))}
                        {recentOrders.length === 0 && (
                            <p className="text-gray-500 text-center py-4 text-sm">No recent orders</p>
                        )}
                    </div>
                </CardBody>
            </Card>

            {/* Recent Reviews */}
            <Card className="shadow-sm">
                <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                        <Star className="w-5 h-5 text-gray-600" />
                        <h3 className="text-lg font-semibold">Recent Reviews</h3>
                    </div>
                </CardHeader>
                <CardBody className="pt-0">
                    <div className="space-y-3">
                        {recentReviews.map((review) => (
                            <div key={review.id} className="p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <Avatar size="sm" name={review.userName} className="bg-gray-200" />
                                        <span className="font-medium text-sm">{review.userName}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        {[...Array(5)].map((_, i) => (
                                            <Star
                                                key={i}
                                                size={12}
                                                className={`${
                                                    i < review.rating 
                                                        ? "text-yellow-500 fill-current" 
                                                        : "text-gray-300"
                                                }`}
                                            />
                                        ))}
                                    </div>
                                </div>
                                <p className="text-xs text-gray-600 line-clamp-2">{review.comment}</p>
                                <div className="flex items-center justify-between mt-2">
                                    <Chip 
                                        color={getStatusColor(review.status)} 
                                        size="sm" 
                                        className="capitalize"
                                    >
                                        {review.status}
                                    </Chip>
                                    <span className="text-xs text-gray-500">{formatDate(review.timestampCreate)}</span>
                                </div>
                            </div>
                        ))}
                        {recentReviews.length === 0 && (
                            <p className="text-gray-500 text-center py-4 text-sm">No recent reviews</p>
                        )}
                    </div>
                </CardBody>
            </Card>

            {/* Recent Products */}
            <Card className="shadow-sm">
                <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                        <Package className="w-5 h-5 text-gray-600" />
                        <h3 className="text-lg font-semibold">Recent Products</h3>
                    </div>
                </CardHeader>
                <CardBody className="pt-0">
                    <div className="space-y-3">
                        {recentProducts.map((product) => (
                            <div key={product.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                <img 
                                    src={product.imageURLs?.[0]} 
                                    alt={product.name}
                                    className="w-12 h-12 object-cover rounded-lg"
                                />
                                <div className="flex-1">
                                    <p className="font-medium text-sm line-clamp-1">{product.name}</p>
                                    <div className="flex items-center justify-between mt-1">
                                        <span className="text-sm font-bold text-blue-600">Rs. {product.price}</span>
                                        <Chip 
                                            color={product.stock > 0 ? "success" : "danger"} 
                                            size="sm"
                                        >
                                            {product.stock > 0 ? "In Stock" : "Out"}
                                        </Chip>
                                    </div>
                                    <span className="text-xs text-gray-500">{formatDate(product.timestampCreate)}</span>
                                </div>
                            </div>
                        ))}
                        {recentProducts.length === 0 && (
                            <p className="text-gray-500 text-center py-4 text-sm">No recent products</p>
                        )}
                    </div>
                </CardBody>
            </Card>
        </div>
    );
}