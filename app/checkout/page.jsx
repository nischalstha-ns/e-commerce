"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useCartStore } from "@/lib/store/cartStore";
import { createOrder } from "@/lib/firestore/orders/create";
import { Button, Input, Textarea } from "@heroui/react";
import { ShoppingBag, CreditCard, Truck } from "lucide-react";
import toast from "react-hot-toast";
import Header from "../components/Header";

export default function CheckoutPage() {
    const router = useRouter();
    const { user } = useAuth();
    const { items, getTotalPrice, clearCart } = useCartStore();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: user?.email || "",
        phone: "",
        address: "",
        paymentMethod: "cash"
    });

    useEffect(() => {
        if (!user) {
            router.push("/login");
        }
        if (items.length === 0) {
            router.push("/cart");
        }
    }, [user, items, router]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.name || !formData.phone || !formData.address) {
            toast.error("Please fill all required fields");
            return;
        }

        setIsSubmitting(true);
        
        try {
            const orderItems = items.map(item => ({
                productId: item.id,
                name: item.name,
                price: item.price,
                quantity: item.quantity,
                imageURL: item.imageURL
            }));

            const result = await createOrder({
                userId: user.uid,
                items: orderItems,
                total: getTotalPrice(),
                customerInfo: {
                    name: formData.name,
                    email: formData.email,
                    phone: formData.phone,
                    address: formData.address
                }
            });

            if (result.success) {
                clearCart();
                toast.success("Order placed successfully!");
                router.push("/orders");
            }
        } catch (error) {
            console.error("Checkout error:", error);
            toast.error("Failed to place order");
        } finally {
            setIsSubmitting(false);
        }
    };

    const totalAmount = getTotalPrice();

    return (
        <div className="min-h-screen bg-white dark:bg-gray-900">
            <Header />
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-gray-100">Checkout</h1>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
                                <div className="flex items-center gap-2 mb-4">
                                    <Truck className="w-5 h-5 text-blue-600" />
                                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Delivery Information</h2>
                                </div>
                                
                                <div className="space-y-4">
                                    <Input
                                        label="Full Name"
                                        placeholder="Enter your full name"
                                        value={formData.name}
                                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                                        required
                                    />
                                    
                                    <Input
                                        label="Email"
                                        type="email"
                                        placeholder="your@email.com"
                                        value={formData.email}
                                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                                    />
                                    
                                    <Input
                                        label="Phone Number"
                                        placeholder="Enter your phone number"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                        required
                                    />
                                    
                                    <Textarea
                                        label="Delivery Address"
                                        placeholder="Enter your complete delivery address"
                                        value={formData.address}
                                        onChange={(e) => setFormData({...formData, address: e.target.value})}
                                        required
                                        minRows={3}
                                    />
                                </div>
                            </div>

                            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
                                <div className="flex items-center gap-2 mb-4">
                                    <CreditCard className="w-5 h-5 text-blue-600" />
                                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Payment Method</h2>
                                </div>
                                
                                <div className="p-4 border-2 border-green-500 rounded-lg bg-green-50 dark:bg-green-900/20">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white text-xl">
                                            💵
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900 dark:text-gray-100">Cash on Delivery (COD)</p>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">Pay with cash when your order is delivered</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <Button
                                type="submit"
                                color="primary"
                                size="lg"
                                className="w-full"
                                isLoading={isSubmitting}
                            >
                                {isSubmitting ? "Placing Order..." : "Place Order"}
                            </Button>
                        </form>
                    </div>

                    <div className="lg:col-span-1">
                        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm sticky top-6">
                            <div className="flex items-center gap-2 mb-4">
                                <ShoppingBag className="w-5 h-5 text-blue-600" />
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Order Summary</h2>
                            </div>
                            
                            <div className="space-y-3 mb-6">
                                {items.map((item) => (
                                    <div key={item.id} className="flex gap-3">
                                        <img 
                                            src={item.imageURL} 
                                            alt={item.name}
                                            className="w-16 h-16 object-cover rounded"
                                        />
                                        <div className="flex-1">
                                            <p className="font-medium text-sm text-gray-900 dark:text-gray-100">{item.name}</p>
                                            <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                                            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                                Rs. {(item.price * item.quantity).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-2">
                                <div className="flex justify-between text-gray-700 dark:text-gray-300">
                                    <span>Subtotal</span>
                                    <span>Rs. {totalAmount.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-gray-700 dark:text-gray-300">
                                    <span>Delivery</span>
                                    <span className="text-green-600">Free</span>
                                </div>
                                <div className="flex justify-between font-bold text-lg text-gray-900 dark:text-gray-100 pt-2 border-t">
                                    <span>Total</span>
                                    <span>Rs. {totalAmount.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
