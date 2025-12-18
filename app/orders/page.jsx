"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useUserOrders } from "@/lib/firestore/orders/read";
import { Card, CardBody, CardHeader, CircularProgress, Chip } from "@heroui/react";
import { Package, Calendar, CreditCard, Truck, Printer, MapPin } from "lucide-react";
import toast from "react-hot-toast";
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
            case "out_for_delivery": return "secondary";
            case "shipped": return "primary";
            case "processing": return "warning";
            case "confirmed": return "primary";
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

    const handlePrintInvoice = (order) => {
        const printWindow = window.open('about:blank', '_blank');
        if (!printWindow) {
            toast.error("Please allow pop-ups to print invoice");
            return;
        }
        setTimeout(() => {
            printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Invoice - ${order.orderNumber || order.id.slice(-8)}</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
                    .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
                    .header h1 { margin: 0; color: #333; }
                    .section { margin: 20px 0; }
                    .section h2 { font-size: 16px; color: #666; margin-bottom: 10px; border-bottom: 1px solid #ddd; padding-bottom: 5px; }
                    .info-item { margin: 8px 0; }
                    .info-label { font-weight: bold; color: #666; }
                    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                    th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
                    th { background: #f5f5f5; font-weight: bold; }
                    .total-row { font-weight: bold; font-size: 18px; background: #f9f9f9; }
                    .tracking { background: #e3f2fd; padding: 15px; border-radius: 5px; margin: 20px 0; text-align: center; }
                    .tracking-number { font-size: 20px; font-weight: bold; font-family: monospace; color: #1976d2; }
                    @media print { body { padding: 20px; } }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>INVOICE</h1>
                    <p>Order #${order.id.slice(-8)}</p>
                    <p>Date: ${formatDate(order.timestampCreate)}</p>
                </div>
                
                ${order.trackingNumber ? `
                <div class="tracking">
                    <div>Tracking Number</div>
                    <div class="tracking-number">${order.trackingNumber}</div>
                </div>
                ` : ''}
                
                <div class="section">
                    <h2>Shipping Address</h2>
                    <div class="info-item"><span class="info-label">Name:</span> ${order.shippingAddress?.name || 'N/A'}</div>
                    <div class="info-item"><span class="info-label">Phone:</span> ${order.shippingAddress?.phone || 'N/A'}</div>
                    <div class="info-item"><span class="info-label">Address:</span> ${order.shippingAddress?.address || 'N/A'}</div>
                    <div class="info-item">${order.shippingAddress?.city || ''}, ${order.shippingAddress?.state || ''} ${order.shippingAddress?.zipCode || ''}</div>
                </div>
                
                <div class="section">
                    <h2>Order Items</h2>
                    <table>
                        <thead>
                            <tr>
                                <th>Product</th>
                                <th>Quantity</th>
                                <th>Price</th>
                                <th>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${order.items?.map(item => `
                                <tr>
                                    <td>${item.name || 'Product'}</td>
                                    <td>${item.quantity}</td>
                                    <td>Rs. ${item.price.toFixed(2)}</td>
                                    <td>Rs. ${(item.price * item.quantity).toFixed(2)}</td>
                                </tr>
                            `).join('')}
                            <tr class="total-row">
                                <td colspan="3" style="text-align: right;">Total Amount:</td>
                                <td>Rs. ${order.total?.toFixed(2) || '0.00'}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                
                <div class="section">
                    <h2>Payment Information</h2>
                    <div class="info-item"><span class="info-label">Payment Method:</span> ${order.paymentMethod?.toUpperCase() || 'N/A'}</div>
                    <div class="info-item"><span class="info-label">Status:</span> ${order.status?.toUpperCase() || 'N/A'}</div>
                </div>
                
                <script>window.onload = () => { window.print(); };</script>
            </body>
            </html>
            `);
            printWindow.document.close();
        }, 100);
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
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handlePrintInvoice(order)}
                                                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                                    title="Print Invoice"
                                                >
                                                    <Printer className="w-5 h-5 text-gray-600" />
                                                </button>
                                                <Chip 
                                                    color={getStatusColor(order.status)} 
                                                    className="capitalize"
                                                >
                                                    {order.status}
                                                </Chip>
                                            </div>
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
                                                        <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                                                            <p className="font-medium text-gray-900 dark:text-white">{order.shippingAddress.name}</p>
                                                            <p>{order.shippingAddress.phone}</p>
                                                            <p className="mt-2">{order.shippingAddress.address}</p>
                                                            <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}</p>
                                                            <p>{order.shippingAddress.country}</p>
                                                            {order.shippingAddress.latitude && order.shippingAddress.longitude && (
                                                                <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                                                                    <div className="flex items-center justify-between mb-2">
                                                                        <span className="text-xs font-semibold text-blue-700 dark:text-blue-300">📍 Location</span>
                                                                        <a
                                                                            href={`https://www.google.com/maps?q=${order.shippingAddress.latitude},${order.shippingAddress.longitude}`}
                                                                            target="_blank"
                                                                            rel="noopener noreferrer"
                                                                            className="text-xs text-blue-600 hover:underline"
                                                                        >
                                                                            Open Map
                                                                        </a>
                                                                    </div>
                                                                    <iframe
                                                                        width="100%"
                                                                        height="100"
                                                                        frameBorder="0"
                                                                        style={{ border: 0, borderRadius: '4px' }}
                                                                        src={`https://www.google.com/maps?q=${order.shippingAddress.latitude},${order.shippingAddress.longitude}&output=embed`}
                                                                        allowFullScreen
                                                                    />
                                                                    <p className="text-xs text-gray-500 mt-1">
                                                                        {order.shippingAddress.latitude.toFixed(6)}, {order.shippingAddress.longitude.toFixed(6)}
                                                                    </p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Order Timeline */}
                                        {order.trackingNumber && (
                                            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                                <h5 className="font-medium text-sm mb-1">Tracking Number</h5>
                                                <p className="font-mono text-sm text-blue-600 dark:text-blue-400">{order.trackingNumber}</p>
                                            </div>
                                        )}

                                        <div className="mt-6 pt-6 border-t">
                                            <h4 className="font-medium mb-4">Order Timeline</h4>
                                            <div className="space-y-3">
                                                {[
                                                    { key: "pending", label: "Order Placed" },
                                                    { key: "confirmed", label: "Confirmed" },
                                                    { key: "processing", label: "Processing" },
                                                    { key: "shipped", label: "Shipped" },
                                                    { key: "out_for_delivery", label: "Out for Delivery" },
                                                    { key: "delivered", label: "Delivered" }
                                                ].map((step, idx, arr) => {
                                                    const statusOrder = ["pending", "confirmed", "processing", "shipped", "out_for_delivery", "delivered"];
                                                    const currentIndex = statusOrder.indexOf(order.status);
                                                    const stepIndex = statusOrder.indexOf(step.key);
                                                    const isActive = stepIndex <= currentIndex;
                                                    const isCurrent = step.key === order.status;
                                                    
                                                    return (
                                                        <div key={step.key} className="flex items-start gap-3">
                                                            <div className="flex flex-col items-center">
                                                                <div className={`w-4 h-4 rounded-full border-2 ${
                                                                    isActive ? "bg-blue-600 border-blue-600" : "bg-white border-gray-300"
                                                                } ${isCurrent ? "ring-4 ring-blue-200" : ""}`}></div>
                                                                {idx < arr.length - 1 && (
                                                                    <div className={`w-0.5 h-8 ${
                                                                        isActive ? "bg-blue-600" : "bg-gray-300"
                                                                    }`}></div>
                                                                )}
                                                            </div>
                                                            <div className="flex-1 -mt-1">
                                                                <p className={`text-sm font-medium ${
                                                                    isActive ? "text-gray-900 dark:text-white" : "text-gray-400"
                                                                }`}>{step.label}</p>
                                                                {isCurrent && (
                                                                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-0.5">Current Status</p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
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