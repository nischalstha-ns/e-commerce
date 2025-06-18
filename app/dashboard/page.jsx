"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useUserOrders, useUserReviews, useUserProfile } from "@/lib/firestore/users/read";
import { Card, CardBody, CardHeader, CircularProgress, Chip } from "@heroui/react";
import { DollarSign, ShoppingCart, TrendingUp, Package, Calendar, CreditCard, Star, User } from "lucide-react";
import Header from "../components/Header";
import { Providers } from "../providers";

function DashboardContent() {
    const { user, isLoading } = useAuth();
    const { data: userProfile } = useUserProfile(user?.uid);
    const { data: userOrders, isLoading: ordersLoading } = useUserOrders(user?.uid);
    const { data: userReviews, isLoading: reviewsLoading } = useUserReviews(user?.uid);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <CircularProgress size="lg" />
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Card className="max-w-md">
                    <CardBody className="text-center p-8">
                        <h1 className="text-xl font-bold mb-2">Please Login</h1>
                        <p className="text-gray-600">You need to be logged in to view your dashboard.</p>
                    </CardBody>
                </Card>
            </div>
        );
    }

    // Calculate user statistics from their actual data
    const totalOrders = userOrders?.length || 0;
    const totalSpent = userOrders?.reduce((sum, order) => sum + (order.total || 0), 0) || 0;
    const averageOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0;
    const completedOrders = userOrders?.filter(order => order.status === "delivered").length || 0;
    const pendingOrders = userOrders?.filter(order => order.status === "pending").length || 0;
    const totalReviews = userReviews?.length || 0;
    const averageRating = userReviews?.length > 0 
        ? userReviews.reduce((sum, review) => sum + review.rating, 0) / userReviews.length 
        : 0;

    const recentOrders = userOrders?.slice(0, 5) || [];
    const recentReviews = userReviews?.slice(0, 3) || [];

    const getStatusColor = (status) => {
        switch (status) {
            case "delivered": return "success";
            case "shipped": return "primary";
            case "processing": return "warning";
            case "pending": return "default";
            case "cancelled": return "danger";
            default: return "default";
        }
    };

    const formatDate = (timestamp) => {
        if (!timestamp) return "N/A";
        return new Date(timestamp.seconds * 1000).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    return (
        <div>
            <Header />
            <main className="container mx-auto px-4 py-6">
                {/* Welcome Section */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Welcome back, {user.displayName || user.email}!
                    </h1>
                    <p className="text-gray-600">Here's your personal shopping overview and account activity.</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <Card className="shadow-sm">
                        <CardBody className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Total Spent</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        Rs. {totalSpent.toFixed(2)}
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
                                    <p className="text-2xl font-bold text-gray-900">{totalOrders}</p>
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
                                    <p className="text-sm text-gray-600 mb-1">Average Order</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        Rs. {averageOrderValue.toFixed(2)}
                                    </p>
                                </div>
                                <div className="p-3 rounded-full bg-purple-100">
                                    <TrendingUp className="w-6 h-6 text-purple-600" />
                                </div>
                            </div>
                        </CardBody>
                    </Card>

                    <Card className="shadow-sm">
                        <CardBody className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Reviews Given</p>
                                    <p className="text-2xl font-bold text-gray-900">{totalReviews}</p>
                                </div>
                                <div className="p-3 rounded-full bg-orange-100">
                                    <Star className="w-6 h-6 text-orange-600" />
                                </div>
                            </div>
                        </CardBody>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Recent Orders */}
                    <Card className="shadow-sm">
                        <CardHeader className="pb-3">
                            <div className="flex items-center gap-2">
                                <ShoppingCart className="w-5 h-5 text-gray-600" />
                                <h3 className="text-lg font-semibold">My Recent Orders</h3>
                            </div>
                        </CardHeader>
                        <CardBody className="pt-0">
                            {ordersLoading ? (
                                <div className="flex justify-center py-4">
                                    <CircularProgress size="sm" />
                                </div>
                            ) : recentOrders.length > 0 ? (
                                <div className="space-y-4">
                                    {recentOrders.map((order) => (
                                        <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <p className="font-medium text-sm">Order #{order.id.slice(-8)}</p>
                                                    <Chip 
                                                        color={getStatusColor(order.status)} 
                                                        size="sm" 
                                                        className="capitalize"
                                                    >
                                                        {order.status}
                                                    </Chip>
                                                </div>
                                                <div className="flex items-center gap-4 text-xs text-gray-600">
                                                    <span className="flex items-center gap-1">
                                                        <Calendar className="w-3 h-3" />
                                                        {formatDate(order.timestampCreate)}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Package className="w-3 h-3" />
                                                        {order.items?.length || 0} items
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold text-sm">Rs. {order.total?.toFixed(2) || "0.00"}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500 text-center py-4">No orders yet</p>
                            )}
                        </CardBody>
                    </Card>

                    {/* Recent Reviews */}
                    <Card className="shadow-sm">
                        <CardHeader className="pb-3">
                            <div className="flex items-center gap-2">
                                <Star className="w-5 h-5 text-gray-600" />
                                <h3 className="text-lg font-semibold">My Recent Reviews</h3>
                            </div>
                        </CardHeader>
                        <CardBody className="pt-0">
                            {reviewsLoading ? (
                                <div className="flex justify-center py-4">
                                    <CircularProgress size="sm" />
                                </div>
                            ) : recentReviews.length > 0 ? (
                                <div className="space-y-4">
                                    {recentReviews.map((review) => (
                                        <div key={review.id} className="p-3 bg-gray-50 rounded-lg">
                                            <div className="flex items-center justify-between mb-2">
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
                                                <Chip 
                                                    color={review.status === "approved" ? "success" : review.status === "pending" ? "warning" : "danger"} 
                                                    size="sm" 
                                                    className="capitalize"
                                                >
                                                    {review.status}
                                                </Chip>
                                            </div>
                                            <p className="text-xs text-gray-600 line-clamp-2 mb-2">{review.comment}</p>
                                            <span className="text-xs text-gray-500">{formatDate(review.timestampCreate)}</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500 text-center py-4">No reviews yet</p>
                            )}
                        </CardBody>
                    </Card>
                </div>

                {/* Account Summary */}
                <div className="mt-8">
                    <Card className="shadow-sm">
                        <CardHeader className="pb-3">
                            <div className="flex items-center gap-2">
                                <User className="w-5 h-5 text-gray-600" />
                                <h3 className="text-lg font-semibold">Account Summary</h3>
                            </div>
                        </CardHeader>
                        <CardBody className="pt-0">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="text-center p-4 bg-blue-50 rounded-lg">
                                    <div className="text-2xl font-bold text-blue-600 mb-1">{completedOrders}</div>
                                    <div className="text-sm text-blue-800">Completed Orders</div>
                                </div>
                                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                                    <div className="text-2xl font-bold text-yellow-600 mb-1">{pendingOrders}</div>
                                    <div className="text-sm text-yellow-800">Pending Orders</div>
                                </div>
                                <div className="text-center p-4 bg-purple-50 rounded-lg">
                                    <div className="text-2xl font-bold text-purple-600 mb-1">{averageRating.toFixed(1)}</div>
                                    <div className="text-sm text-purple-800">Average Rating Given</div>
                                </div>
                            </div>
                        </CardBody>
                    </Card>
                </div>

                {/* Quick Actions */}
                <div className="mt-8">
                    <Card className="shadow-sm">
                        <CardHeader className="pb-3">
                            <h3 className="text-lg font-semibold">Quick Actions</h3>
                        </CardHeader>
                        <CardBody className="pt-0">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <a 
                                    href="/shop" 
                                    className="block p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <ShoppingCart className="w-6 h-6 text-blue-600" />
                                        <div>
                                            <p className="font-medium text-blue-900">Continue Shopping</p>
                                            <p className="text-sm text-blue-700">Browse our latest products</p>
                                        </div>
                                    </div>
                                </a>
                                
                                <a 
                                    href="/orders" 
                                    className="block p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <Package className="w-6 h-6 text-green-600" />
                                        <div>
                                            <p className="font-medium text-green-900">View All Orders</p>
                                            <p className="text-sm text-green-700">Track your order status</p>
                                        </div>
                                    </div>
                                </a>
                                
                                <a 
                                    href="/profile" 
                                    className="block p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <User className="w-6 h-6 text-purple-600" />
                                        <div>
                                            <p className="font-medium text-purple-900">Account Settings</p>
                                            <p className="text-sm text-purple-700">Manage your profile</p>
                                        </div>
                                    </div>
                                </a>
                            </div>
                        </CardBody>
                    </Card>
                </div>
            </main>
        </div>
    );
}

export default function DashboardPage() {
    return (
        <Providers>
            <DashboardContent />
        </Providers>
    );
}