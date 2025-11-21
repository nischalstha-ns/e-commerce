"use client";

import { useOrders } from "@/lib/firestore/orders/read";
import { updateOrderStatus } from "@/lib/firestore/orders/write";
import { Button, CircularProgress, Select, SelectItem, Chip, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@heroui/react";
import { Eye, Package, Clock, Truck, CheckCircle, XCircle, ChevronRight, MapPin, Phone, Mail } from "lucide-react";
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
        <div className="flex flex-col gap-4 bg-white dark:bg-[#1a1a1a] rounded-xl p-3 md:p-6 theme-transition">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                <div>
                    <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">Orders</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{orders?.length || 0} total orders</p>
                </div>
                <Select
                    placeholder="Filter by Status"
                    className="w-full md:w-48"
                    selectedKeys={statusFilter ? [statusFilter] : []}
                    onSelectionChange={(keys) => {
                        const selectedKey = Array.from(keys)[0];
                        setStatusFilter(selectedKey || "");
                    }}
                    classNames={{
                        trigger: "dark:bg-[#242424] dark:border-[#3a3a3a]",
                        value: "dark:text-white"
                    }}
                >
                    <SelectItem key="pending" value="pending">Pending</SelectItem>
                    <SelectItem key="processing" value="processing">Processing</SelectItem>
                    <SelectItem key="shipped" value="shipped">Shipped</SelectItem>
                    <SelectItem key="delivered" value="delivered">Delivered</SelectItem>
                    <SelectItem key="cancelled" value="cancelled">Cancelled</SelectItem>
                </Select>
            </div>

            {/* Mobile Cards View */}
            <div className="md:hidden space-y-3">
                {orders?.map((order) => (
                    <OrderCard key={order.id} order={order} />
                ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
                <table className="w-full border-separate border-spacing-y-2">
                    <thead>
                        <tr className="bg-gray-50 dark:bg-[#242424]">
                            <th className="px-4 py-3 text-left rounded-l-lg dark:text-gray-300">Order ID</th>
                            <th className="px-4 py-3 text-left dark:text-gray-300">Customer</th>
                            <th className="px-4 py-3 text-left dark:text-gray-300">Items</th>
                            <th className="px-4 py-3 text-left dark:text-gray-300">Total</th>
                            <th className="px-4 py-3 text-left dark:text-gray-300">Status</th>
                            <th className="px-4 py-3 text-left dark:text-gray-300">Date</th>
                            <th className="px-4 py-3 text-left rounded-r-lg dark:text-gray-300">Actions</th>
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
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    No orders found
                </div>
            )}
        </div>
    );
}

function OrderCard({ order }) {
    const [isUpdating, setIsUpdating] = useState(false);
    const [showDetails, setShowDetails] = useState(false);

    const handleStatusUpdate = async (newStatus) => {
        setIsUpdating(true);
        try {
            await updateOrderStatus({ id: order.id, status: newStatus });
            toast.success("Order status updated");
        } catch (error) {
            toast.error(error?.message || "Error updating status");
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

    const getStatusIcon = (status) => {
        switch (status) {
            case "pending": return <Clock size={16} />;
            case "processing": return <Package size={16} />;
            case "shipped": return <Truck size={16} />;
            case "delivered": return <CheckCircle size={16} />;
            case "cancelled": return <XCircle size={16} />;
            default: return null;
        }
    };

    const formatDate = (timestamp) => {
        if (!timestamp) return "N/A";
        return new Date(timestamp.seconds * 1000).toLocaleDateString();
    };

    return (
        <>
            <div className="bg-white dark:bg-[#242424] rounded-lg p-4 shadow-sm border border-gray-100 dark:border-[#3a3a3a] theme-transition">
                <div className="flex justify-between items-start mb-3">
                    <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Order ID</p>
                        <p className="font-mono text-sm font-semibold dark:text-white">#{order.id.slice(-8)}</p>
                    </div>
                    <Chip 
                        color={getStatusColor(order.status)} 
                        size="sm" 
                        className="capitalize"
                        startContent={getStatusIcon(order.status)}
                    >
                        {order.status}
                    </Chip>
                </div>

                <div className="space-y-2 mb-3">
                    <div className="flex items-center gap-2 text-sm">
                        <Mail size={14} className="text-gray-400" />
                        <span className="dark:text-gray-300">{order.shippingAddress?.email || "N/A"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                        <Phone size={14} className="text-gray-400" />
                        <span className="dark:text-gray-300">{order.shippingAddress?.phone || "N/A"}</span>
                    </div>
                </div>

                <div className="flex justify-between items-center py-3 border-t border-gray-100 dark:border-[#3a3a3a]">
                    <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Total Amount</p>
                        <p className="text-lg font-bold text-blue-600 dark:text-blue-400">Rs. {order.total?.toFixed(2) || "0.00"}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-gray-500 dark:text-gray-400">Items</p>
                        <p className="text-sm font-semibold dark:text-white">{order.items?.length || 0}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-gray-500 dark:text-gray-400">Date</p>
                        <p className="text-sm font-semibold dark:text-white">{formatDate(order.timestampCreate)}</p>
                    </div>
                </div>

                <div className="flex gap-2 mt-3">
                    <Button
                        onClick={() => setShowDetails(true)}
                        size="sm"
                        variant="flat"
                        className="flex-1"
                        startContent={<Eye size={14} />}
                    >
                        View Details
                    </Button>
                    {order.status === "pending" && (
                        <Button
                            onClick={() => handleStatusUpdate("processing")}
                            isLoading={isUpdating}
                            size="sm"
                            color="primary"
                            className="flex-1"
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
                            className="flex-1"
                            startContent={<Truck size={14} />}
                        >
                            Ship
                        </Button>
                    )}
                    {order.status === "shipped" && (
                        <Button
                            onClick={() => handleStatusUpdate("delivered")}
                            isLoading={isUpdating}
                            size="sm"
                            color="success"
                            className="flex-1"
                        >
                            Deliver
                        </Button>
                    )}
                </div>
            </div>

            {/* Order Details Modal */}
            <Modal 
                isOpen={showDetails} 
                onOpenChange={setShowDetails}
                size="full"
                scrollBehavior="inside"
            >
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1 dark:bg-[#1a1a1a] dark:text-white">
                                <p>Order Details</p>
                                <p className="text-sm font-normal text-gray-500">#{order.id.slice(-8)}</p>
                            </ModalHeader>
                            <ModalBody className="dark:bg-[#1a1a1a]">
                                {/* Customer Info */}
                                <div className="space-y-3">
                                    <h3 className="font-semibold text-gray-900 dark:text-white">Customer Information</h3>
                                    <div className="bg-gray-50 dark:bg-[#242424] rounded-lg p-3 space-y-2">
                                        <p className="text-sm dark:text-gray-300"><span className="font-medium">Name:</span> {order.shippingAddress?.name || "N/A"}</p>
                                        <p className="text-sm dark:text-gray-300"><span className="font-medium">Email:</span> {order.shippingAddress?.email || "N/A"}</p>
                                        <p className="text-sm dark:text-gray-300"><span className="font-medium">Phone:</span> {order.shippingAddress?.phone || "N/A"}</p>
                                    </div>
                                </div>

                                {/* Shipping Address */}
                                <div className="space-y-3">
                                    <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                        <MapPin size={16} />
                                        Shipping Address
                                    </h3>
                                    <div className="bg-gray-50 dark:bg-[#242424] rounded-lg p-3">
                                        <p className="text-sm dark:text-gray-300">{order.shippingAddress?.address || "N/A"}</p>
                                        <p className="text-sm dark:text-gray-300">{order.shippingAddress?.city || ""}, {order.shippingAddress?.state || ""} {order.shippingAddress?.zip || ""}</p>
                                    </div>
                                </div>

                                {/* Order Items */}
                                <div className="space-y-3">
                                    <h3 className="font-semibold text-gray-900 dark:text-white">Order Items ({order.items?.length || 0})</h3>
                                    <div className="space-y-2">
                                        {order.items?.map((item, index) => (
                                            <div key={index} className="flex gap-3 bg-gray-50 dark:bg-[#242424] rounded-lg p-3">
                                                <img 
                                                    src={item.imageURL} 
                                                    alt={item.name}
                                                    className="w-16 h-16 object-cover rounded"
                                                />
                                                <div className="flex-1">
                                                    <p className="font-medium text-sm dark:text-white">{item.name}</p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">Qty: {item.quantity}</p>
                                                    <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">Rs. {item.price}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Order Summary */}
                                <div className="space-y-3">
                                    <h3 className="font-semibold text-gray-900 dark:text-white">Order Summary</h3>
                                    <div className="bg-gray-50 dark:bg-[#242424] rounded-lg p-3 space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="dark:text-gray-300">Subtotal</span>
                                            <span className="font-medium dark:text-white">Rs. {order.subtotal?.toFixed(2) || "0.00"}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="dark:text-gray-300">Shipping</span>
                                            <span className="font-medium dark:text-white">Rs. {order.shipping?.toFixed(2) || "0.00"}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="dark:text-gray-300">Tax</span>
                                            <span className="font-medium dark:text-white">Rs. {order.tax?.toFixed(2) || "0.00"}</span>
                                        </div>
                                        <div className="border-t border-gray-200 dark:border-[#3a3a3a] pt-2 flex justify-between">
                                            <span className="font-semibold dark:text-white">Total</span>
                                            <span className="font-bold text-lg text-blue-600 dark:text-blue-400">Rs. {order.total?.toFixed(2) || "0.00"}</span>
                                        </div>
                                    </div>
                                </div>
                            </ModalBody>
                            <ModalFooter className="dark:bg-[#1a1a1a]">
                                <Button color="danger" variant="light" onPress={onClose}>
                                    Close
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </>
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
        <tr className="bg-white dark:bg-[#242424] shadow-sm theme-transition">
            <td className="px-4 py-3 rounded-l-lg">
                <span className="font-mono text-sm">#{order.id.slice(-8)}</span>
            </td>
            <td className="px-4 py-3">
                <div>
                    <p className="font-medium dark:text-white">{order.shippingAddress?.name || "N/A"}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{order.shippingAddress?.email || "N/A"}</p>
                </div>
            </td>
            <td className="px-4 py-3">
                <span className="text-sm dark:text-gray-300">{order.items?.length || 0} items</span>
            </td>
            <td className="px-4 py-3">
                <span className="font-medium dark:text-white">Rs. {order.total?.toFixed(2) || "0.00"}</span>
            </td>
            <td className="px-4 py-3">
                <Chip color={getStatusColor(order.status)} size="sm" className="capitalize">
                    {order.status}
                </Chip>
            </td>
            <td className="px-4 py-3">
                <span className="text-sm dark:text-gray-300">{formatDate(order.timestampCreate)}</span>
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