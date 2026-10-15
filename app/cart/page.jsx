"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/lib/store/cartStore";
import { Card, CardBody, Button, Chip } from "@heroui/react";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import toast from "react-hot-toast";
import { Providers } from "../providers.jsx";
import Header from "../components/Header.jsx";

function priceOf(item) {
  const p = Number(item.salePrice) > 0 && Number(item.salePrice) < Number(item.price)
    ? Number(item.salePrice)
    : Number(item.price) || 0;
  return p;
}

function CartContent() {
  const router = useRouter();
  const { items, updateQuantity, removeItem, clearCart } = useCartStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900">
        <Header />
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-gray-500">Loading cart...</p>
        </div>
      </div>
    );
  }

  const totalAmount = items.reduce(
    (sum, item) => sum + priceOf(item) * (Number(item.quantity) || 0),
    0
  );

  const handleUpdateQuantity = (item, newQuantity) => {
    if (newQuantity < 1) return;
    updateQuantity(item.id, newQuantity);
  };

  const handleRemoveItem = (item) => {
    removeItem(item.id);
    toast.success("Item removed from cart");
  };

  const handleClearCart = () => {
    if (!confirm("Are you sure you want to clear your cart?")) return;
    clearCart();
    toast.success("Cart cleared");
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 theme-transition">
      <Header />
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2 text-gray-900 dark:text-gray-100 theme-transition">
            Shopping Cart
          </h1>
          <p className="text-gray-600 dark:text-gray-400 theme-transition">
            {items.length} items in your cart
          </p>
        </div>

        {items.length === 0 ? (
          <Card className="shadow-sm bg-white dark:bg-gray-800 theme-transition">
            <CardBody className="text-center p-12">
              <ShoppingBag className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4 theme-transition" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2 theme-transition">
                Your cart is empty
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6 theme-transition">
                Start shopping to add items to your cart
              </p>
              <Button
                as="a"
                href="/shop"
                color="primary"
                size="lg"
                className="glow-hover"
              >
                Continue Shopping
              </Button>
            </CardBody>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => {
                const price = priceOf(item);
                const itemTotal = price * (Number(item.quantity) || 0);
                return (
                  <Card
                    key={item.id}
                    className="shadow-sm bg-white dark:bg-gray-800 card-hover theme-transition"
                  >
                    <CardBody className="p-4">
                      <div className="flex gap-4">
                        <img
                          src={item.imageURL || "https://placehold.co/400x300?text=No+Image"}
                          alt={item.name}
                          className="w-20 h-20 object-cover rounded-lg"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "https://placehold.co/400x300?text=No+Image";
                          }}
                        />

                        <div className="flex-1">
                          <h3 className="font-semibold text-lg mb-1 text-gray-900 dark:text-gray-100 theme-transition">
                            {item.name}
                          </h3>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="bordered"
                                isIconOnly
                                onClick={() =>
                                  handleUpdateQuantity(item, item.quantity - 1)
                                }
                                isDisabled={item.quantity <= 1}
                                aria-label="Decrease quantity"
                                className="border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 theme-transition"
                              >
                                <Minus size={14} />
                              </Button>

                              <span className="w-8 text-center font-medium text-gray-900 dark:text-gray-100 theme-transition">
                                {item.quantity}
                              </span>

                              <Button
                                size="sm"
                                variant="bordered"
                                isIconOnly
                                onClick={() =>
                                  handleUpdateQuantity(item, item.quantity + 1)
                                }
                                aria-label="Increase quantity"
                                className="border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 theme-transition"
                              >
                                <Plus size={14} />
                              </Button>
                            </div>

                            <div className="text-right">
                              <p className="font-bold text-lg text-gray-900 dark:text-gray-100 theme-transition">
                                Rs. {itemTotal.toLocaleString()}
                              </p>
                              <p className="text-sm text-gray-600 dark:text-gray-400 theme-transition">
                                Rs. {price.toLocaleString()} each
                              </p>
                            </div>
                          </div>
                        </div>

                        <Button
                          size="sm"
                          color="danger"
                          variant="light"
                          isIconOnly
                          onClick={() => handleRemoveItem(item)}
                          aria-label="Remove item"
                          className="hover:bg-red-50 dark:hover:bg-red-900/20 theme-transition"
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
                  className="hover:bg-red-50 dark:hover:bg-red-900/20 theme-transition"
                >
                  Clear Cart
                </Button>
              </div>
            </div>

            <div className="lg:col-span-1">
              <Card className="shadow-sm sticky top-6 bg-white dark:bg-gray-800 theme-transition">
                <CardBody className="p-6">
                  <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100 theme-transition">
                    Order Summary
                  </h3>

                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-gray-700 dark:text-gray-300 theme-transition">
                      <span>Subtotal ({items.length} items)</span>
                      <span>Rs. {totalAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-gray-700 dark:text-gray-300 theme-transition">
                      <span>Shipping</span>
                      <span className="text-green-600 dark:text-green-400">Free</span>
                    </div>
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-3 theme-transition">
                      <div className="flex justify-between font-bold text-lg text-gray-900 dark:text-gray-100 theme-transition">
                        <span>Total</span>
                        <span>Rs. {totalAmount.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <Button
                    color="primary"
                    size="lg"
                    className="w-full glow-hover"
                    onClick={() => router.push("/checkout")}
                  >
                    Proceed to Checkout
                  </Button>

                  <Button
                    as="a"
                    href="/shop"
                    variant="light"
                    className="w-full mt-3 hover:bg-gray-50 dark:hover:bg-gray-700 theme-transition"
                  >
                    Continue Shopping
                  </Button>
                </CardBody>
              </Card>
            </div>
          </div>
        )}
      </div>
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
