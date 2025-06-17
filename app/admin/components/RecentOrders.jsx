"use client";

import { useOrders } from "@/lib/firestore/orders/read";
import { Card, CardBody, CardHeader, CircularProgress, Chip } from "@heroui/react";

export default function RecentOrders() {
    const { data: orders, isLoading } = useOrders();

    const recentOrders = orders?.slice(0, 5) || [];

    const getStatusColor = (status) => {
        switch (status) {
            case "pending": return "warning";
            case "processing": return "primary";
            case "shipped": return "secondary";
            case "delivered": return "success";
            case "cancelled": return "danger";
            default: return "default";
        }
    };

    const formatDate = (timestamp) => {
        if (!timestamp) return "N/A";
        return new Date(timestamp.seconds * 1000).toLocaleDateString();
    };

    return (
        <Card className="shadow-sm">
            <CardHeader className="pb-3">
                <h3 className="text-lg font-semibold">Recent Orders</h3>
            </CardHeader>
            <CardBody className="pt-0">
                {isLoading ? (
                    <div className="flex justify-center py-4">
                        <CircularProgress size="sm" />
                    </div>
                ) : recentOrders.length > 0 ? (
                    <div className="space-y-4">
                        {recentOrders.map((order) => (
                            <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div>
                                    <p className="font-medium text-sm">#{order.id.slice(-8)}</p>
                                    <p className="text-xs text-gray-600">{order.shippingAddress?.name || "N/A"}</p>
                                    <p className="text-xs text-gray-500">{formatDate(order.timestampCreate)}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-medium text-sm">Rs. {order.total?.toFixed(2) || "0.00"}</p>
                                    <Chip color={getStatusColor(order.status)} size="sm" className="capitalize">
                                        {order.status}
                                    </Chip>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-500 text-center py-4">No orders yet</p>
                )}
            </CardBody>
        </Card>
    );
}