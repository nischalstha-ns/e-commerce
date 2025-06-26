"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/lib/firestore/cart/read";
import { updateCartItem, removeFromCart, clearCart } from "@/lib/firestore/cart/write";
import { useProducts } from "@/lib/firestore/products/read";
import { Card, CardBody, Button, CircularProgress, Chip } from "@heroui/react";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import toast from "react-hot-toast";
import Header from "../components/Header";
import { Providers } from "../providers";

function CartContent() {
    const { user, isLoading: authLoading } = useAuth();
    const { data: cart, isLoading: cartLoading } = useCart(user?.uid);
    const { data: products } = useProducts();
    const [updatingItems, setUpdatingItems] = useState({});
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

    if (authLoading || cartLoading) {
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
                                <p className="text-gray-600">You need to be logged in to view your cart.</p>
                            </CardBody>
                        </Card>
                    </div>
                </main>
            </div>
        );
    }

    const cartItems = cart?.items || [];
    
    // Get product details for cart items
    const cartWithProducts = cartItems.map(item => {
        const product = products?.find(p => p.id === item.productId);
        return { ...item, product };
    }).filter(item => item.product); // Filter out items where product wasn't found

    const totalAmount = cartWithProducts.reduce((sum, item) => {
        const price = item.product.salePrice || item.product.price;
        return sum + (price * item.quantity);
    }, 0);

    const handleUpdateQuantity = async (item, newQuantity) => {
        const itemKey = `${item.productId}-${item.selectedSize}-${item.selectedColor}`;
        setUpdatingItems(prev => ({ ...prev, [itemKey]: true }));
        
        try {
            await updateCartItem({
                userId: user.uid,
                productId: item.productId,
                quantity: newQuantity,
                selectedSize: item.selectedSize,
                selectedColor: item.selectedColor
            });
            toast.success("Cart updated");
        } catch (error) {
            toast.error("Failed to update cart");
        }
        
        setUpdatingItems(prev => ({ ...prev, [itemKey]: false }));
    };

    const handleRemoveItem = async (item) => {
        const itemKey = `${item.productId}-${item.selectedSize}-${item.selectedColor}`;
        setUpdatingItems(prev => ({ ...prev, [itemKey]: true }));
        
        try {
            await removeFromCart({
                userId: user.uid,
                productId: item.productId,
                selectedSize: item.selectedSize,
                selectedColor: item.selectedColor
            });
            toast.success("Item removed from cart");
        } catch (error) {
            toast.error("Failed to remove item");
        }
        
        setUpdatingItems(prev => ({ ...prev, [itemKey]: false }));
    };

    const handleClearCart = async () => {
        if (!confirm("Are you sure you want to clear your cart?")) return;
        
        try {
            await clearCart({ userId: user.uid });
            toast.success("Cart cleared");
        } catch (error) {
            toast.error("Failed to clear cart");
        }
    };

    return (
        <div>
            <Header />
            <main className="container mx-auto px-4 py-6">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold mb-2">Shopping Cart</h1>
                    <p className="text-gray-600">{cartWithProducts.length} items in your cart</p>
                </div>

                {cartWithProducts.length === 0 ? (
                    <Card className="shadow-sm">
                        <CardBody className="text-center p-12">
                            <ShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <h2 className="text-xl font-semibold text-gray-900 mb-2">Your cart is empty</h2>
                            <p className="text-gray-600 mb-6">Start shopping to add items to your cart</p>
                            <Button
                                as="a"
                                href="/shop"
                                color="primary"
                                size="lg"
                            >
                                Continue Shopping
                            </Button>
                        </CardBody>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Cart Items */}
                        <div className="lg:col-span-2 space-y-4">
                            {cartWithProducts.map((item) => {
                                const itemKey = `${item.productId}-${item.selectedSize}-${item.selectedColor}`;
                                const isUpdating = updatingItems[itemKey];
                                const price = item.product.salePrice || item.product.price;
                                const itemTotal = price * item.quantity;

                                return (
                                    <Card key={itemKey} className="shadow-sm">
                                        <CardBody className="p-4">
                                            <div className="flex gap-4">
                                                <img 
                                                    src={item.product.imageURLs?.[0]} 
                                                    alt={item.product.name}
                                                    className="w-20 h-20 object-cover rounded-lg"
                                                />
                                                
                                                <div className="flex-1">
                                                    <h3 className="font-semibold text-lg mb-1">{item.product.name}</h3>
                                                    
                                                    <div className="flex gap-2 mb-2">
                                                        {item.selectedSize && (
                                                            <Chip size="sm" variant="flat" color="primary">
                                                                Size: {item.selectedSize}
                                                            </Chip>
                                                        )}
                                                        {item.selectedColor && (
                                                            <Chip size="sm" variant="flat" color="secondary">
                                                                Color: {item.selectedColor}
                                                            </Chip>
                                                        )}
                                                    </div>
                                                    
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-2">
                                                            <Button
                                                                size="sm"
                                                                variant="bordered"
                                                                isIconOnly
                                                                onClick={() => handleUpdateQuantity(item, item.quantity - 1)}
                                                                isDisabled={isUpdating || item.quantity <= 1}
                                                            >
                                                                <Minus size={14} />
                                                            </Button>
                                                            
                                                            <span className="w-8 text-center font-medium">
                                                                {item.quantity}
                                                            </span>
                                                            
                                                            <Button
                                                                size="sm"
                                                                variant="bordered"
                                                                isIconOnly
                                                                onClick={() => handleUpdateQuantity(item, item.quantity + 1)}
                                                                isDisabled={isUpdating}
                                                            >
                                                                <Plus size={14} />
                                                            </Button>
                                                        </div>
                                                        
                                                        <div className="text-right">
                                                            <p className="font-bold text-lg">Rs. {itemTotal.toFixed(2)}</p>
                                                            <p className="text-sm text-gray-600">Rs. {price} each</p>
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                <Button
                                                    size="sm"
                                                    color="danger"
                                                    variant="light"
                                                    isIconOnly
                                                    onClick={() => handleRemoveItem(item)}
                                                    isDisabled={isUpdating}
                                                >
                                                    <Trash2 size={16} />
                                                </Button>
                                            </div>
                                        </CardBody>
                                    </Card>
                                );
                            })}
                            
                            <div className="flex justify-end">
                                <Button
                                    variant="light"
                                    color="danger"
                                    onClick={handleClearCart}
                                >
                                    Clear Cart
                                </Button>
                            </div>
                        </div>

                        {/* Order Summary */}
                        <div className="lg:col-span-1">
                            <Card className="shadow-sm sticky top-6">
                                <CardBody className="p-6">
                                    <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
                                    
                                    <div className="space-y-3 mb-6">
                                        <div className="flex justify-between">
                                            <span>Subtotal ({cartWithProducts.length} items)</span>
                                            <span>Rs. {totalAmount.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Shipping</span>
                                            <span className="text-green-600">Free</span>
                                        </div>
                                        <div className="border-t pt-3">
                                            <div className="flex justify-between font-bold text-lg">
                                                <span>Total</span>
                                                <span>Rs. {totalAmount.toFixed(2)}</span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <Button
                                        color="primary"
                                        size="lg"
                                        className="w-full"
                                        onClick={() => {
                                            // Navigate to checkout
                                            window.location.href = "/checkout";
                                        }}
                                    >
                                        Proceed to Checkout
                                    </Button>
                                    
                                    <Button
                                        as="a"
                                        href="/shop"
                                        variant="light"
                                        className="w-full mt-3"
                                    >
                                        Continue Shopping
                                    </Button>
                                </CardBody>
                            </Card>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

export default function CartPage() {
    return (
        <Providers>
            <CartContent />
        </Providers>
    );
}