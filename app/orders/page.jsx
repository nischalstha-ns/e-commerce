"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useUserOrders } from "@/lib/firestore/users/read";
import { Card, CardBody, CardHeader, CircularProgress, Chip } from "@heroui/react";
import { Package, Calendar, CreditCard, Truck } from "lucide-react";
import Header from "../components/Header";
import { Providers } from "../providers";

function OrdersContent() {
    const { user, isLoading: authLoading } = useAuth();
    const { data: orders, isLoading: ordersLoading } = useUserOrders(user?.uid);
    const [mounted, setMounted] = useState(false);

    // Fix for Next.js workStore error
    useEffect(() => {
        setMounted(true);
    }, []);

    // Don't render until mounted to avoid hydration issues
    if (!mounted) {
        return (
            <div>
                <Header />
                <main className="container mx-auto px-4 py-6">
                    <div className="flex justify-center py-8">
                        <CircularProgress size="lg" />
                    </div>
                </main>
            </div>
        );
    }

    if (authLoading || ordersLoading) {
        return (
            <div>
                <Header />
                <main className="container mx-auto px-4 py-6">
                    <div className="min-h-screen flex items-center justify-center">
                        <CircularProgress size="lg" />
                    </div>
                </main>
            </div>
        );
    }

    if (!user) {
        return (
            <div>
                <Header />
                <main className="container mx-auto px-4 py-6">
                    <div className="min-h-screen flex items-center justify-center">
                        <Card className="max-w-md">
                            <CardBody className="text-center p-8">
                                <h1 className="text-xl font-bold mb-2">Please Login</h1>
                                <p className="text-gray-600">You need to be logged in to view your orders.</p>
                            </CardBody>
                        </Card>
                    </div>
                </main>
            </div>
        );
    }

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

    const getStatusIcon = (status) => {
        switch (status) {
            case "delivered": return Package;
            case "shipped": return Truck;
            case "processing": return Package;
            case "pending": return Calendar;
            case "cancelled": return Package;
            default: return Package;
        }
    };

    const formatDate = (timestamp) => {
        if (!timestamp) return "N/A";
        return new Date(timestamp.seconds * 1000).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div>
            <Header />
            <main className="container mx-auto px-4 py-6">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold mb-2">My Orders</h1>
                    <p className="text-gray-600">Track and manage your orders</p>
                </div>

                {orders?.length === 0 ? (
                    <Card className="shadow-sm">
                        <CardBody className="text-center p-12">
                            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <h2 className="text-xl font-semibold text-gray-900 mb-2">No orders yet</h2>
                            <p className="text-gray-600 mb-6">Start shopping to place your first order</p>
                            <a 
                                href="/shop"
                                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Start Shopping
                            </a>
                        </CardBody>
                    </Card>
                ) : (
                    <div className="space-y-6">
                        {orders.map((order) => {
                            const StatusIcon = getStatusIcon(order.status);
                            
                            return (
                                <Card key={order.id} className="shadow-sm">
                                    <CardHeader className="pb-3">
                                        <div className="flex items-center justify-between w-full">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 rounded-full bg-gray-100">
                                                    <StatusIcon className="w-5 h-5 text-gray-600" />
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold">Order #{order.id.slice(-8)}</h3>
                                                    <p className="text-sm text-gray-600">
                                                        Placed on {formatDate(order.timestampCreate)}
                                                    </p>
                                                </div>
                                            </div>
                                            <Chip 
                                                color={getStatusColor(order.status)} 
                                                className="capitalize"
                                            >
                                                {order.status}
                                            </Chip>
                                        </div>
                                    </CardHeader>
                                    
                                    <CardBody className="pt-0">
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            {/* Order Items */}
                                            <div className="md:col-span-2">
                                                <h4 className="font-medium mb-3">Items ({order.items?.length || 0})</h4>
                                                <div className="space-y-3">
                                                    {order.items?.map((item, index) => (
                                                        <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                                            <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                                                                <Package className="w-6 h-6 text-gray-500" />
                                                            </div>
                                                            <div className="flex-1">
                                                                <p className="font-medium text-sm">{item.name || "Product"}</p>
                                                                <div className="flex gap-2 text-xs text-gray-600">
                                                                    <span>Qty: {item.quantity}</span>
                                                                    {item.selectedSize && <span>Size: {item.selectedSize}</span>}
                                                                    {item.selectedColor && <span>Color: {item.selectedColor}</span>}
                                                                </div>
                                                            </div>
                                                            <div className="text-right">
                                                                <p className="font-medium">Rs. {(item.price * item.quantity).toFixed(2)}</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Order Summary */}
                                            <div>
                                                <h4 className="font-medium mb-3">Order Summary</h4>
                                                <div className="space-y-2 text-sm">
                                                    <div className="flex justify-between">
                                                        <span>Total Amount:</span>
                                                        <span className="font-bold">Rs. {order.total?.toFixed(2) || "0.00"}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span>Payment Method:</span>
                                                        <span className="capitalize">{order.paymentMethod || "N/A"}</span>
                                                    </div>
                                                    {order.trackingNumber && (
                                                        <div className="flex justify-between">
                                                            <span>Tracking:</span>
                                                            <span className="font-mono text-xs">{order.trackingNumber}</span>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Shipping Address */}
                                                {order.shippingAddress && (
                                                    <div className="mt-4">
                                                        <h5 className="font-medium text-sm mb-2">Shipping Address</h5>
                                                        <div className="text-xs text-gray-600 space-y-1">
                                                            <p>{order.shippingAddress.name}</p>
                                                            <p>{order.shippingAddress.address}</p>
                                                            <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}</p>
                                                            <p>{order.shippingAddress.phone}</p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Order Timeline */}
                                        <div className="mt-6 pt-6 border-t">
                                            <h4 className="font-medium mb-3">Order Timeline</h4>
                                            <div className="flex items-center gap-4 text-sm">
                                                <div className={`flex items-center gap-2 ${order.status === "pending" ? "text-blue-600" : "text-gray-400"}`}>
                                                    <div className={`w-3 h-3 rounded-full ${order.status === "pending" ? "bg-blue-600" : "bg-gray-300"}`}></div>
                                                    <span>Pending</span>
                                                </div>
                                                <div className="flex-1 h-px bg-gray-300"></div>
                                                <div className={`flex items-center gap-2 ${order.status === "processing" ? "text-blue-600" : "text-gray-400"}`}>
                                                    <div className={`w-3 h-3 rounded-full ${order.status === "processing" ? "bg-blue-600" : "bg-gray-300"}`}></div>
                                                    <span>Processing</span>
                                                </div>
                                                <div className="flex-1 h-px bg-gray-300"></div>
                                                <div className={`flex items-center gap-2 ${order.status === "shipped" ? "text-blue-600" : "text-gray-400"}`}>
                                                    <div className={`w-3 h-3 rounded-full ${order.status === "shipped" ? "bg-blue-600" : "bg-gray-300"}`}></div>
                                                    <span>Shipped</span>
                                                </div>
                                                <div className="flex-1 h-px bg-gray-300"></div>
                                                <div className={`flex items-center gap-2 ${order.status === "delivered" ? "text-green-600" : "text-gray-400"}`}>
                                                    <div className={`w-3 h-3 rounded-full ${order.status === "delivered" ? "bg-green-600" : "bg-gray-300"}`}></div>
                                                    <span>Delivered</span>
                                                </div>
                                            </div>
                                        </div>
                                    </CardBody>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </main>
        </div>
    );
}

export default function OrdersPage() {
    return (
        <Providers>
            <OrdersContent />
        </Providers>
    );
}