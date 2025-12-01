"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/lib/firestore/cart/read";
import { useProducts } from "@/lib/firestore/products/read";
import { createOrder } from "@/lib/firestore/orders/write";
import { clearCart } from "@/lib/firestore/cart/write";
import { Card, CardBody, Button, Input, Textarea } from "@heroui/react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Header from "../components/Header";

export default function CheckoutPage() {
    const router = useRouter();
    const { user } = useAuth();
    const { data: cart } = useCart(user?.uid);
    const { data: products } = useProducts();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: user?.email || "",
        phone: "",
        address: "",
        notes: ""
    });

    useEffect(() => {
        if (!user) {
            router.push("/login");
        }
    }, [user, router]);

    const cartItems = cart?.items || [];
    const cartWithProducts = cartItems.map(item => {
        const product = products?.find(p => p.id === item.productId);
        return { ...item, product };
    }).filter(item => item.product);

    const totalAmount = cartWithProducts.reduce((sum, item) => {
        const price = item.product.salePrice || item.product.price;
        return sum + (price * item.quantity);
    }, 0);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const orderData = {
                userId: user.uid,
                customerName: formData.name,
                customerEmail: formData.email,
                customerPhone: formData.phone,
                shippingAddress: formData.address,
                notes: formData.notes,
                paymentMethod: "COD",
                items: cartWithProducts.map(item => ({
                    productId: item.productId,
                    name: item.product.name,
                    price: item.product.salePrice || item.product.price,
                    quantity: item.quantity,
                    imageURL: item.product.imageURLs?.[0],
                    selectedSize: item.selectedSize,
                    selectedColor: item.selectedColor
                })),
                total: totalAmount,
                status: "pending"
            };

            const orderId = await createOrder(orderData);

            // Send email notification
            await fetch("/api/orders/notify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ orderId, orderData })
            });

            await clearCart(user.uid);
            
            toast.success("Order placed successfully!");
            router.push(`/orders?success=true`);
        } catch (error) {
            toast.error("Failed to place order");
        } finally {
            setLoading(false);
        }
    };

    if (!user || cartWithProducts.length === 0) {
        return null;
    }

    return (
        <div className="min-h-screen bg-white dark:bg-gray-900">
            <Header />
            <div className="container mx-auto px-4 py-6">
                <h1 className="text-2xl font-bold mb-6">Checkout</h1>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                        <Card>
                            <CardBody className="p-6">
                                <h2 className="text-xl font-semibold mb-4">Shipping Information</h2>
                                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                                    <p className="text-sm font-medium text-green-800">💵 Cash on Delivery (COD)</p>
                                    <p className="text-xs text-green-600 mt-1">Pay when you receive your order</p>
                                </div>
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <Input
                                        label="Full Name"
                                        value={formData.name}
                                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                                        required
                                    />
                                    <Input
                                        label="Email"
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                                        required
                                    />
                                    <Input
                                        label="Phone"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                        required
                                    />
                                    <Textarea
                                        label="Shipping Address"
                                        value={formData.address}
                                        onChange={(e) => setFormData({...formData, address: e.target.value})}
                                        required
                                    />
                                    <Textarea
                                        label="Order Notes (Optional)"
                                        value={formData.notes}
                                        onChange={(e) => setFormData({...formData, notes: e.target.value})}
                                    />
                                    <Button
                                        type="submit"
                                        color="primary"
                                        size="lg"
                                        className="w-full"
                                        isLoading={loading}
                                    >
                                        Place Order
                                    </Button>
                                </form>
                            </CardBody>
                        </Card>
                    </div>

                    <div className="lg:col-span-1">
                        <Card>
                            <CardBody className="p-6">
                                <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
                                <div className="space-y-3 mb-4">
                                    {cartWithProducts.map((item) => (
                                        <div key={item.productId} className="flex gap-3">
                                            <img src={item.product.imageURLs?.[0]} className="w-16 h-16 object-cover rounded" />
                                            <div className="flex-1">
                                                <p className="font-medium text-sm">{item.product.name}</p>
                                                <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                                            </div>
                                            <p className="font-semibold">Rs. {((item.product.salePrice || item.product.price) * item.quantity).toLocaleString()}</p>
                                        </div>
                                    ))}
                                </div>
                                <div className="border-t pt-3">
                                    <div className="flex justify-between font-bold text-lg">
                                        <span>Total</span>
                                        <span>Rs. {totalAmount.toLocaleString()}</span>
                                    </div>
                                </div>
                            </CardBody>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
