"use client";

import { useState, useMemo } from "react";
import { useOrders } from "@/lib/firestore/orders/read";
import { updateOrderStatus, updateOrderTracking } from "@/lib/firestore/orders/write";
import { deleteDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firestore/firebase";
import { Card, Button, Chip, Input, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure, Tabs, Tab } from "@heroui/react";
import { Package, Search, Clock, CheckCircle, XCircle, Truck, MapPin, Phone, Mail, Calendar, Hash, Printer, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import AdminOnly from "../components/AdminOnly";

const ORDER_STATUSES = [
  { value: "pending", label: "Pending", color: "warning", icon: Clock },
  { value: "confirmed", label: "Confirmed", color: "primary", icon: CheckCircle },
  { value: "processing", label: "Processing", color: "secondary", icon: Package },
  { value: "shipped", label: "Shipped", color: "primary", icon: Truck },
  { value: "out_for_delivery", label: "Out for Delivery", color: "secondary", icon: MapPin },
  { value: "delivered", label: "Delivered", color: "success", icon: CheckCircle },
  { value: "cancelled", label: "Cancelled", color: "danger", icon: XCircle }
];

export default function OrdersPage() {
  const { data: orders = [], isLoading } = useOrders();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [trackingNumber, setTrackingNumber] = useState("");

  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const matchesStatus = statusFilter === "all" || order.status === statusFilter;
      const matchesSearch = !searchTerm || 
        order.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.shippingAddress?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.shippingAddress?.phone?.includes(searchTerm);
      return matchesStatus && matchesSearch;
    });
  }, [orders, statusFilter, searchTerm]);

  const statusCounts = useMemo(() => {
    const counts = { all: orders.length };
    ORDER_STATUSES.forEach(status => {
      counts[status.value] = orders.filter(o => o.status === status.value).length;
    });
    return counts;
  }, [orders]);

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await updateOrderStatus({ id: orderId, status: newStatus });
      toast.success(`Order status updated to ${newStatus}`);
    } catch (error) {
      toast.error("Failed to update order status");
    }
  };

  const handleTrackingUpdate = async () => {
    if (!trackingNumber.trim()) {
      toast.error("Please enter tracking number");
      return;
    }
    try {
      await updateOrderTracking({ id: selectedOrder.id, trackingNumber: trackingNumber.trim() });
      toast.success("Tracking number updated");
      setTrackingNumber("");
      onClose();
    } catch (error) {
      toast.error("Failed to update tracking");
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (!confirm("Are you sure you want to delete this order? This action cannot be undone.")) return;
    try {
      await deleteDoc(doc(db, "orders", orderId));
      toast.success("Order deleted successfully");
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete order");
    }
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
        <title>Invoice - ${order.orderNumber}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
          .header h1 { margin: 0; color: #333; }
          .section { margin: 20px 0; }
          .section h2 { font-size: 16px; color: #666; margin-bottom: 10px; border-bottom: 1px solid #ddd; padding-bottom: 5px; }
          .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
          .info-item { margin: 5px 0; }
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
          <p>Order Number: <strong>${order.orderNumber}</strong></p>
          <p>Date: ${formatDate(order.timestampCreate)}</p>
        </div>
        
        ${order.trackingNumber ? `
        <div class="tracking">
          <div>Tracking Number</div>
          <div class="tracking-number">${order.trackingNumber}</div>
        </div>
        ` : ''}
        
        <div class="info-grid">
          <div class="section">
            <h2>Customer Information</h2>
            <div class="info-item"><span class="info-label">Name:</span> ${order.shippingAddress?.name || 'N/A'}</div>
            <div class="info-item"><span class="info-label">Phone:</span> ${order.shippingAddress?.phone || 'N/A'}</div>
            <div class="info-item"><span class="info-label">Email:</span> ${order.shippingAddress?.email || 'N/A'}</div>
          </div>
          
          <div class="section">
            <h2>Shipping Address</h2>
            <div class="info-item">${order.shippingAddress?.address || 'N/A'}</div>
            <div class="info-item">${order.shippingAddress?.city || ''}, ${order.shippingAddress?.state || ''}</div>
            <div class="info-item">${order.shippingAddress?.country || ''} ${order.shippingAddress?.zipCode || ''}</div>
          </div>
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
                  <td>${item.name}</td>
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
          <div class="info-item"><span class="info-label">Payment Status:</span> ${order.paymentStatus || 'Pending'}</div>
          <div class="info-item"><span class="info-label">Order Status:</span> ${order.status?.toUpperCase() || 'N/A'}</div>
        </div>
        
        <script>
          window.onload = () => { window.print(); };
        </script>
      </body>
      </html>
      `);
      printWindow.document.close();
    }, 100);
  };

  const getStatusConfig = (status) => ORDER_STATUSES.find(s => s.value === status) || ORDER_STATUSES[0];

  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A";
    const date = timestamp.seconds ? new Date(timestamp.seconds * 1000) : new Date(timestamp);
    return date.toLocaleString();
  };

  if (isLoading) {
    return (
      <AdminOnly>
        <div className="p-6 flex justify-center items-center min-h-[60vh]">
          <div className="text-center">
            <Package className="w-12 h-12 animate-pulse mx-auto mb-4 text-gray-400" />
            <p>Loading orders...</p>
          </div>
        </div>
      </AdminOnly>
    );
  }

  return (
    <AdminOnly>
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Orders Management</h1>
          <p className="text-gray-600 dark:text-gray-400">Track and manage all customer orders</p>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              placeholder="Search by order number, name, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <Tabs selectedKey={statusFilter} onSelectionChange={setStatusFilter}>
          <Tab key="all" title={<div className="flex items-center gap-2"><Package className="w-4 h-4" />All ({statusCounts.all})</div>} />
          {ORDER_STATUSES.map(status => {
            const Icon = status.icon;
            return (
              <Tab 
                key={status.value} 
                title={<div className="flex items-center gap-2"><Icon className="w-4 h-4" />{status.label} ({statusCounts[status.value] || 0})</div>}
              />
            );
          })}
        </Tabs>

        {filteredOrders.length === 0 ? (
          <Card className="p-12">
            <div className="text-center">
              <Package className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-xl font-semibold mb-2">No orders found</h3>
              <p className="text-gray-600 dark:text-gray-400">
                {searchTerm ? "Try adjusting your search" : "Orders will appear here"}
              </p>
            </div>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredOrders.map((order) => {
              const statusConfig = getStatusConfig(order.status);
              const StatusIcon = statusConfig.icon;
              
              return (
                <Card key={order.id} className="p-6">
                  <div className="flex flex-col lg:flex-row gap-6">
                    <div className="flex-1 space-y-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-bold">{order.orderNumber}</h3>
                            <Chip color={statusConfig.color} variant="flat" startContent={<StatusIcon className="w-4 h-4" />}>
                              {statusConfig.label}
                            </Chip>
                          </div>
                          <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {formatDate(order.timestampCreate)}
                            </div>
                            <div className="flex items-center gap-1">
                              <Package className="w-4 h-4" />
                              {order.items?.length || 0} items
                            </div>
                            <div className="flex items-center gap-1 font-semibold text-gray-900 dark:text-gray-100">
                              Rs. {order.total?.toFixed(2) || "0.00"}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <h4 className="font-semibold text-sm">Customer Details</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2">
                              <Mail className="w-4 h-4 text-gray-400" />
                              <span className="font-medium">{order.shippingAddress?.name || "N/A"}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Phone className="w-4 h-4 text-gray-400" />
                              <span>{order.shippingAddress?.phone || "N/A"}</span>
                            </div>
                            <div className="flex items-start gap-2">
                              <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                              <div className="flex-1">
                                <p>{order.shippingAddress?.address}</p>
                                <p className="text-gray-500">{order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.zipCode}</p>
                                <p className="text-gray-500">{order.shippingAddress?.country}</p>
                              </div>
                            </div>
                            {order.shippingAddress?.latitude && order.shippingAddress?.longitude && (
                              <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-xs font-semibold text-blue-700 dark:text-blue-300">📍 Delivery Location</span>
                                  <a
                                    href={`https://www.google.com/maps?q=${order.shippingAddress.latitude},${order.shippingAddress.longitude}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-blue-600 hover:underline"
                                  >
                                    Open in Maps
                                  </a>
                                </div>
                                <iframe
                                  width="100%"
                                  height="120"
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

                        <div className="space-y-2">
                          <h4 className="font-semibold text-sm">Tracking Info</h4>
                          {order.trackingNumber ? (
                            <div className="flex items-center gap-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                              <Hash className="w-4 h-4 text-blue-600" />
                              <span className="font-mono text-sm">{order.trackingNumber}</span>
                            </div>
                          ) : (
                            <p className="text-sm text-gray-500">No tracking number</p>
                          )}
                          <p className="text-xs text-gray-500">
                            Payment: <span className="font-medium uppercase">{order.paymentMethod}</span>
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {order.status === "pending" && (
                          <>
                            <Button size="sm" color="primary" onPress={() => handleStatusUpdate(order.id, "confirmed")}>
                              Confirm Order
                            </Button>
                            <Button size="sm" color="danger" variant="flat" onPress={() => handleStatusUpdate(order.id, "cancelled")}>
                              Cancel
                            </Button>
                          </>
                        )}
                        {order.status === "confirmed" && (
                          <Button size="sm" color="primary" onPress={() => handleStatusUpdate(order.id, "processing")}>
                            Start Processing
                          </Button>
                        )}
                        {order.status === "processing" && (
                          <Button size="sm" color="primary" onPress={() => handleStatusUpdate(order.id, "shipped")}>
                            Mark as Shipped
                          </Button>
                        )}
                        {order.status === "shipped" && (
                          <Button size="sm" color="primary" onPress={() => handleStatusUpdate(order.id, "out_for_delivery")}>
                            Out for Delivery
                          </Button>
                        )}
                        {order.status === "out_for_delivery" && (
                          <Button size="sm" color="success" onPress={() => handleStatusUpdate(order.id, "delivered")}>
                            Mark as Delivered
                          </Button>
                        )}
                        <Button 
                          size="sm" 
                          variant="flat" 
                          onPress={() => {
                            setSelectedOrder(order);
                            setTrackingNumber(order.trackingNumber || "");
                            onOpen();
                          }}
                        >
                          {order.trackingNumber ? "Update" : "Add"} Tracking
                        </Button>
                        <Button 
                          size="sm" 
                          variant="flat"
                          color="secondary"
                          startContent={<Printer className="w-4 h-4" />}
                          onPress={() => handlePrintInvoice(order)}
                        >
                          Print Invoice
                        </Button>
                        <Button 
                          size="sm" 
                          variant="flat"
                          color="danger"
                          startContent={<Trash2 className="w-4 h-4" />}
                          onPress={() => handleDeleteOrder(order.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>

                    <div className="lg:w-64 space-y-3">
                      <h4 className="font-semibold text-sm">Order Items</h4>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {order.items?.map((item, idx) => (
                          <div key={idx} className="flex gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded text-sm">
                            <div className="flex-1">
                              <p className="font-medium">{item.name}</p>
                              <p className="text-xs text-gray-500">Qty: {item.quantity} × Rs. {item.price}</p>
                            </div>
                            <p className="font-semibold">Rs. {(item.price * item.quantity).toFixed(2)}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        <Modal isOpen={isOpen} onClose={onClose}>
          <ModalContent>
            <ModalHeader>Update Tracking Number</ModalHeader>
            <ModalBody>
              <Input
                label="Tracking Number"
                placeholder="Enter tracking number"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
              />
            </ModalBody>
            <ModalFooter>
              <Button variant="light" onPress={onClose}>Cancel</Button>
              <Button color="primary" onPress={handleTrackingUpdate}>Save</Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </div>
    </AdminOnly>
  );
}
