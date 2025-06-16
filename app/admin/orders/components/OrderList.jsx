"use client";

import { useOrders } from "@/lib/firestore/orders/read";
import { updateOrderStatus } from "@/lib/firestore/orders/write";
import { Button, CircularProgress, Select, SelectItem, Chip } from "@heroui/react";
import { Eye, Package } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

export default function OrderList() {
    const [statusFilter, setStatusFilter] = useState("");
    const { data: orders, error, isLoading } = useOrders(
        statusFilter ? { status: statusFilter } : {}
    );

    if (isLoading) {
        return (
            <div className="flex justify-center p-8">
                <CircularProgress />
            </div>
        );
    }

    if (error) {
        return <div className="text-red-500 p-4">Error: {error}</div>;
    }

    return (
        <div className="flex flex-col gap-4 bg-white rounded-xl p-6">
            <div className="flex justify-between items-center">
                <h1 className="text-xl font-semibold">Orders</h1>
                <Select
                    placeholder="Filter by Status"
                    className="w-48"
                    selectedKeys={statusFilter ? [statusFilter] : []}
                    onSelectionChange={(keys) => {
                        const selectedKey = Array.from(keys)[0];
                        setStatusFilter(selectedKey || "");
                    }}
                >
                    <SelectItem key="pending" value="pending">Pending</SelectItem>
                    <SelectItem key="processing" value="processing">Processing</SelectItem>
                    <SelectItem key="shipped" value="shipped">Shipped</SelectItem>
                    <SelectItem key="delivered" value="delivered">Delivered</SelectItem>
                    <SelectItem key="cancelled" value="cancelled">Cancelled</SelectItem>
                </Select>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full border-separate border-spacing-y-2">
                    <thead>
                        <tr className="bg-gray-50">
                            <th className="px-4 py-3 text-left rounded-l-lg">Order ID</th>
                            <th className="px-4 py-3 text-left">Customer</th>
                            <th className="px-4 py-3 text-left">Items</th>
                            <th className="px-4 py-3 text-left">Total</th>
                            <th className="px-4 py-3 text-left">Status</th>
                            <th className="px-4 py-3 text-left">Date</th>
                            <th className="px-4 py-3 text-left rounded-r-lg">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders?.map((order) => (
                            <OrderRow key={order.id} order={order} />
                        ))}
                    </tbody>
                </table>
            </div>

            {orders?.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                    No orders found
                </div>
            )}
        </div>
    );
}

function OrderRow({ order }) {
    const [isUpdating, setIsUpdating] = useState(false);

    const handleStatusUpdate = async (newStatus) => {
        setIsUpdating(true);
        try {
            await updateOrderStatus({ id: order.id, status: newStatus });
            toast.success("Order status updated successfully");
        } catch (error) {
            toast.error(error?.message || "Error updating order status");
        }
        setIsUpdating(false);
    };

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
        <tr className="bg-white shadow-sm">
            <td className="px-4 py-3 rounded-l-lg">
                <span className="font-mono text-sm">#{order.id.slice(-8)}</span>
            </td>
            <td className="px-4 py-3">
                <div>
                    <p className="font-medium">{order.shippingAddress?.name || "N/A"}</p>
                    <p className="text-sm text-gray-500">{order.shippingAddress?.email || "N/A"}</p>
                </div>
            </td>
            <td className="px-4 py-3">
                <span className="text-sm">{order.items?.length || 0} items</span>
            </td>
            <td className="px-4 py-3">
                <span className="font-medium">${order.total?.toFixed(2) || "0.00"}</span>
            </td>
            <td className="px-4 py-3">
                <Chip color={getStatusColor(order.status)} size="sm" className="capitalize">
                    {order.status}
                </Chip>
            </td>
            <td className="px-4 py-3">
                <span className="text-sm">{formatDate(order.timestampCreate)}</span>
            </td>
            <td className="px-4 py-3 rounded-r-lg">
                <div className="flex gap-2">
                    <Button isIconOnly size="sm" variant="light">
                        <Eye size={16} />
                    </Button>
                    {order.status === "pending" && (
                        <Button
                            onClick={() => handleStatusUpdate("processing")}
                            isLoading={isUpdating}
                            size="sm"
                            color="primary"
                            variant="light"
                        >
                            Process
                        </Button>
                    )}
                    {order.status === "processing" && (
                        <Button
                            onClick={() => handleStatusUpdate("shipped")}
                            isLoading={isUpdating}
                            size="sm"
                            color="secondary"
                            variant="light"
                            startContent={<Package size={14} />}
                        >
                            Ship
                        </Button>
                    )}
                </div>
            </td>
        </tr>
    );
}