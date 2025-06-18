"use client";

import { useProducts } from "@/lib/firestore/products/read";
import { useOrderStats } from "@/lib/firestore/orders/read";
import { useReviewStats } from "@/lib/firestore/reviews/read";
import { Card, CardBody, CardHeader, CircularProgress } from "@heroui/react";
import { TrendingUp, DollarSign, ShoppingCart, Star, Package, Users } from "lucide-react";

export default function AnalyticsPage() {
    const { data: products, isLoading: productsLoading } = useProducts();
    const { data: orderStats, isLoading: ordersLoading } = useOrderStats();
    const { data: reviewStats, isLoading: reviewsLoading } = useReviewStats();

    if (productsLoading || ordersLoading || reviewsLoading) {
        return (
            <div className="flex justify-center items-center min-h-96">
                <CircularProgress size="lg" />
            </div>
        );
    }

    // Calculate analytics data
    const topProducts = products?.slice(0, 5) || [];
    const lowStockProducts = products?.filter(product => product.stock <= 5) || [];
    
    return (
        <main className="p-6 space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Analytics & Reports</h1>
                <p className="text-gray-600">Insights and performance metrics for your store</p>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="shadow-sm">
                    <CardBody className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
                                <p className="text-2xl font-bold text-green-600">
                                    Rs. {orderStats?.totalRevenue?.toFixed(2) || "0.00"}
                                </p>
                            </div>
                            <div className="p-3 rounded-full bg-green-100">
                                <DollarSign className="w-6 h-6 text-green-600" />
                            </div>
                        </div>
                    </CardBody>
                </Card>

                <Card className="shadow-sm">
                    <CardBody className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Total Orders</p>
                                <p className="text-2xl font-bold text-blue-600">{orderStats?.total || 0}</p>
                            </div>
                            <div className="p-3 rounded-full bg-blue-100">
                                <ShoppingCart className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                    </CardBody>
                </Card>

                <Card className="shadow-sm">
                    <CardBody className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Average Rating</p>
                                <p className="text-2xl font-bold text-yellow-600">
                                    {reviewStats?.averageRating || "0.0"}
                                </p>
                            </div>
                            <div className="p-3 rounded-full bg-yellow-100">
                                <Star className="w-6 h-6 text-yellow-600" />
                            </div>
                        </div>
                    </CardBody>
                </Card>

                <Card className="shadow-sm">
                    <CardBody className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Conversion Rate</p>
                                <p className="text-2xl font-bold text-purple-600">
                                    {orderStats?.total > 0 ? ((orderStats.delivered / orderStats.total) * 100).toFixed(1) : "0.0"}%
                                </p>
                            </div>
                            <div className="p-3 rounded-full bg-purple-100">
                                <TrendingUp className="w-6 h-6 text-purple-600" />
                            </div>
                        </div>
                    </CardBody>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Products */}
                <Card className="shadow-sm">
                    <CardHeader className="pb-3">
                        <div className="flex items-center gap-2">
                            <Package className="w-5 h-5 text-gray-600" />
                            <h3 className="text-lg font-semibold">Top Products</h3>
                        </div>
                    </CardHeader>
                    <CardBody className="pt-0">
                        <div className="space-y-3">
                            {topProducts.map((product, index) => (
                                <div key={product.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                        <span className="text-sm font-bold text-blue-600">#{index + 1}</span>
                                    </div>
                                    <img 
                                        src={product.imageURLs?.[0]} 
                                        alt={product.name}
                                        className="w-12 h-12 object-cover rounded-lg"
                                    />
                                    <div className="flex-1">
                                        <p className="font-medium text-sm">{product.name}</p>
                                        <p className="text-xs text-gray-600">Stock: {product.stock}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-sm">Rs. {product.price}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardBody>
                </Card>

                {/* Low Stock Alert */}
                <Card className="shadow-sm">
                    <CardHeader className="pb-3">
                        <div className="flex items-center gap-2">
                            <Package className="w-5 h-5 text-red-600" />
                            <h3 className="text-lg font-semibold">Low Stock Alert</h3>
                        </div>
                    </CardHeader>
                    <CardBody className="pt-0">
                        <div className="space-y-3">
                            {lowStockProducts.length > 0 ? (
                                lowStockProducts.slice(0, 5).map((product) => (
                                    <div key={product.id} className="flex items-center gap-3 p-3 bg-red-50 rounded-lg">
                                        <img 
                                            src={product.imageURLs?.[0]} 
                                            alt={product.name}
                                            className="w-12 h-12 object-cover rounded-lg"
                                        />
                                        <div className="flex-1">
                                            <p className="font-medium text-sm">{product.name}</p>
                                            <p className="text-xs text-red-600 font-medium">
                                                Only {product.stock} left in stock
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-sm">Rs. {product.price}</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-500 text-center py-4">All products are well stocked!</p>
                            )}
                        </div>
                    </CardBody>
                </Card>
            </div>

            {/* Order Status Distribution */}
            <Card className="shadow-sm">
                <CardHeader className="pb-3">
                    <h3 className="text-lg font-semibold">Order Status Distribution</h3>
                </CardHeader>
                <CardBody className="pt-0">
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        {[
                            { label: "Pending", value: orderStats?.pending || 0, color: "bg-yellow-500" },
                            { label: "Processing", value: orderStats?.processing || 0, color: "bg-blue-500" },
                            { label: "Shipped", value: orderStats?.shipped || 0, color: "bg-purple-500" },
                            { label: "Delivered", value: orderStats?.delivered || 0, color: "bg-green-500" },
                            { label: "Cancelled", value: orderStats?.cancelled || 0, color: "bg-red-500" },
                        ].map((status) => (
                            <div key={status.label} className="text-center p-4 bg-gray-50 rounded-lg">
                                <div className={`w-12 h-12 ${status.color} rounded-full mx-auto mb-2 flex items-center justify-center`}>
                                    <span className="text-white font-bold">{status.value}</span>
                                </div>
                                <p className="text-sm font-medium">{status.label}</p>
                            </div>
                        ))}
                    </div>
                </CardBody>
            </Card>
        </main>
    );
}