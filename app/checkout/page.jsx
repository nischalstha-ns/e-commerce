"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/lib/firestore/cart/read";
import { useProducts } from "@/lib/firestore/products/read";
import { useUserProfile } from "@/lib/firestore/users/read";
import { useUserOrders } from "@/lib/firestore/orders/read";
import { createOrderFromCart } from "@/lib/firestore/orders/create";
import { Button, Input, Textarea, CircularProgress } from "@heroui/react";
import { ShoppingBag, CreditCard, Truck, MapPin, Navigation } from "lucide-react";
import toast from "react-hot-toast";
import Header from "../components/Header";
import { Providers } from "../providers";

function CheckoutContent() {
    const router = useRouter();
    const { user, tenantId, isLoading: authLoading } = useAuth();
    const { data: cart, isLoading: cartLoading } = useCart(user?.uid);
    const { data: products } = useProducts();
    const { data: userProfile } = useUserProfile(user?.uid);
    const { data: previousOrders } = useUserOrders(user?.uid);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: user?.email || "",
        phone: "",
        address: "",
        city: "",
        state: "",
        country: "Nepal",
        zipCode: "",
        latitude: null,
        longitude: null
    });
    const [loadingLocation, setLoadingLocation] = useState(false);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push("/login");
        }
    }, [user, authLoading, router]);

    useEffect(() => {
        if (user && userProfile) {
            const lastOrder = previousOrders?.[0];
            const lastAddress = lastOrder?.shippingAddress;
            
            setFormData(prev => ({
                ...prev,
                name: userProfile.name || user.displayName || "",
                email: userProfile.email || user.email || "",
                phone: userProfile.phone || user.phoneNumber || "",
                address: lastAddress?.address || "",
                city: lastAddress?.city || "",
                state: lastAddress?.state || "",
                country: lastAddress?.country || "Nepal",
                zipCode: lastAddress?.zipCode || "",
                latitude: lastAddress?.latitude || null,
                longitude: lastAddress?.longitude || null
            }));
        }
    }, [user, userProfile, previousOrders]);

    const cartItems = cart?.items || [];
    const cartWithProducts = cartItems.map(item => {
        const product = products?.find(p => p.id === item.productId);
        return { ...item, product };
    }).filter(item => item.product);

    useEffect(() => {
        if (!cartLoading && cartWithProducts.length === 0) {
            toast.error("Your cart is empty");
            router.push("/cart");
        }
    }, [cartLoading, cartWithProducts.length, router]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.name || !formData.phone || !formData.address || !formData.city) {
            toast.error("Please fill all required fields");
            return;
        }

        setIsSubmitting(true);
        
        try {
            await createOrderFromCart({
                userId: user.uid,
                tenantId: tenantId || "default",
                shippingAddress: {
                    name: formData.name,
                    email: formData.email,
                    phone: formData.phone,
                    address: formData.address,
                    city: formData.city,
                    state: formData.state,
                    country: formData.country,
                    zipCode: formData.zipCode,
                    latitude: formData.latitude,
                    longitude: formData.longitude
                },
                paymentMethod: "cod"
            });

            toast.success("Order placed successfully!");
            router.push("/orders");
        } catch (error) {
            console.error("Checkout error:", error);
            toast.error(error.message || "Failed to place order");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (authLoading || cartLoading) {
        return (
            <div className="min-h-screen bg-white dark:bg-gray-900">
                <Header />
                <div className="flex justify-center items-center min-h-[60vh]">
                    <CircularProgress size="lg" />
                </div>
            </div>
        );
    }

    const totalAmount = cartWithProducts.reduce((sum, item) => {
        const price = item.product.salePrice || item.product.price;
        return sum + (price * item.quantity);
    }, 0);

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
                                    
                                    <div className="space-y-2">
                                        <Textarea
                                            label="Street Address"
                                            placeholder="House/Apartment number, Street name"
                                            value={formData.address}
                                            onChange={(e) => setFormData({...formData, address: e.target.value})}
                                            required
                                            minRows={2}
                                        />
                                        <Button
                                            size="sm"
                                            variant="flat"
                                            startContent={<Navigation className="w-4 h-4" />}
                                            onPress={() => {
                                                setLoadingLocation(true);
                                                if (navigator.geolocation) {
                                                    navigator.geolocation.getCurrentPosition(
                                                        async (position) => {
                                                            const lat = position.coords.latitude;
                                                            const lng = position.coords.longitude;
                                                            
                                                            try {
                                                                const response = await fetch(
                                                                    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
                                                                );
                                                                const data = await response.json();
                                                                
                                                                setFormData(prev => ({
                                                                    ...prev,
                                                                    latitude: lat,
                                                                    longitude: lng,
                                                                    address: data.address?.road || data.display_name?.split(',')[0] || prev.address,
                                                                    city: data.address?.city || data.address?.town || data.address?.village || prev.city,
                                                                    state: data.address?.state || prev.state,
                                                                    country: data.address?.country || prev.country,
                                                                    zipCode: data.address?.postcode || prev.zipCode
                                                                }));
                                                                toast.success("Location and address filled");
                                                            } catch (error) {
                                                                setFormData(prev => ({
                                                                    ...prev,
                                                                    latitude: lat,
                                                                    longitude: lng
                                                                }));
                                                                toast.success("Location captured");
                                                            }
                                                            setLoadingLocation(false);
                                                        },
                                                        () => {
                                                            toast.error("Failed to get location");
                                                            setLoadingLocation(false);
                                                        }
                                                    );
                                                } else {
                                                    toast.error("Geolocation not supported");
                                                    setLoadingLocation(false);
                                                }
                                            }}
                                            isLoading={loadingLocation}
                                        >
                                            {formData.latitude ? "Update Location" : "Use Current Location"}
                                        </Button>
                                        {formData.latitude && formData.longitude && (
                                            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <MapPin className="w-4 h-4 text-blue-600" />
                                                    <span className="text-sm font-medium">Location Captured</span>
                                                </div>
                                                <a
                                                    href={`https://www.google.com/maps?q=${formData.latitude},${formData.longitude}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-sm text-blue-600 hover:underline"
                                                >
                                                    View on Google Maps
                                                </a>
                                            </div>
                                        )}
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-4">
                                        <Input
                                            label="City"
                                            placeholder="City"
                                            value={formData.city}
                                            onChange={(e) => setFormData({...formData, city: e.target.value})}
                                            required
                                        />
                                        <Input
                                            label="State/Province"
                                            placeholder="State"
                                            value={formData.state}
                                            onChange={(e) => setFormData({...formData, state: e.target.value})}
                                        />
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-4">
                                        <Input
                                            label="Country"
                                            placeholder="Country"
                                            value={formData.country}
                                            onChange={(e) => setFormData({...formData, country: e.target.value})}
                                        />
                                        <Input
                                            label="Zip Code"
                                            placeholder="Postal code"
                                            value={formData.zipCode}
                                            onChange={(e) => setFormData({...formData, zipCode: e.target.value})}
                                        />
                                    </div>
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
                                {cartWithProducts.map((item) => {
                                    const price = item.product.salePrice || item.product.price;
                                    return (
                                        <div key={`${item.productId}-${item.selectedSize}-${item.selectedColor}`} className="flex gap-3">
                                            <img 
                                                src={item.product.imageURLs?.[0]} 
                                                alt={item.product.name}
                                                className="w-16 h-16 object-cover rounded"
                                            />
                                            <div className="flex-1">
                                                <p className="font-medium text-sm text-gray-900 dark:text-gray-100">{item.product.name}</p>
                                                <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                                                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                                    Rs. {(price * item.quantity).toLocaleString()}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-2">
                                <div className="flex justify-between text-gray-700 dark:text-gray-300">
                                    <span>Subtotal ({cartWithProducts.length} items)</span>
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

export default function CheckoutPage() {
    return (
        <Providers>
            <CheckoutContent />
        </Providers>
    );
}
