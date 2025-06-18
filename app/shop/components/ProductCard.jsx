"use client";

import { Card, CardBody, Button, Chip } from "@heroui/react";
import { ShoppingCart } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { addToCart } from "@/lib/firestore/cart/write";
import { useState } from "react";
import toast from "react-hot-toast";

export default function ProductCard({ product }) {
    const { user } = useAuth();
    const [isAdding, setIsAdding] = useState(false);
    
    const displayPrice = product.salePrice || product.price;
    const hasDiscount = product.salePrice && product.salePrice < product.price;
    const discountPercent = hasDiscount 
        ? Math.round(((product.price - product.salePrice) / product.price) * 100)
        : 0;

    const handleAddToCart = async () => {
        if (!user) {
            toast.error("Please login to add items to cart");
            return;
        }

        setIsAdding(true);
        try {
            await addToCart({
                userId: user.uid,
                productId: product.id,
                quantity: 1,
                selectedSize: product.sizes?.[0] || null,
                selectedColor: product.colors?.[0] || null
            });
            toast.success("Added to cart!");
        } catch (error) {
            toast.error("Failed to add to cart");
        }
        setIsAdding(false);
    };

    return (
        <Card className="shadow-sm hover:shadow-md transition-shadow">
            <CardBody className="p-0">
                <div className="relative">
                    <img 
                        src={product.imageURLs?.[0] || "/placeholder-product.jpg"}
                        alt={product.name}
                        className="w-full h-40 object-cover rounded-t-lg"
                    />
                    {hasDiscount && (
                        <Chip 
                            color="danger" 
                            size="sm" 
                            className="absolute top-2 left-2"
                        >
                            -{discountPercent}%
                        </Chip>
                    )}
                </div>
                
                <div className="p-3">
                    <h3 className="font-semibold text-sm mb-2 line-clamp-2">{product.name}</h3>
                    
                    {/* Sizes and Colors */}
                    {(product.sizes?.length > 0 || product.colors?.length > 0) && (
                        <div className="mb-2 space-y-1">
                            {product.sizes?.length > 0 && (
                                <div className="flex gap-1 flex-wrap">
                                    <span className="text-xs text-gray-500">Sizes:</span>
                                    {product.sizes.slice(0, 3).map((size, index) => (
                                        <Chip key={index} size="sm" variant="flat" color="primary" className="text-xs">
                                            {size}
                                        </Chip>
                                    ))}
                                    {product.sizes.length > 3 && (
                                        <span className="text-xs text-gray-500">+{product.sizes.length - 3} more</span>
                                    )}
                                </div>
                            )}
                            {product.colors?.length > 0 && (
                                <div className="flex gap-1 flex-wrap">
                                    <span className="text-xs text-gray-500">Colors:</span>
                                    {product.colors.slice(0, 3).map((color, index) => (
                                        <Chip key={index} size="sm" variant="flat" color="secondary" className="text-xs">
                                            {color}
                                        </Chip>
                                    ))}
                                    {product.colors.length > 3 && (
                                        <span className="text-xs text-gray-500">+{product.colors.length - 3} more</span>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                    
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <span className="text-lg font-bold text-blue-600">
                                Rs. {displayPrice}
                            </span>
                            {hasDiscount && (
                                <span className="text-xs text-gray-500 line-through">
                                    Rs. {product.price}
                                </span>
                            )}
                        </div>
                        
                        <Chip 
                            color={product.stock > 0 ? "success" : "danger"} 
                            size="sm"
                            className="text-xs"
                        >
                            {product.stock > 0 ? "In Stock" : "Out"}
                        </Chip>
                    </div>
                    
                    <Button 
                        color="primary" 
                        className="w-full"
                        size="sm"
                        startContent={<ShoppingCart size={14} />}
                        isDisabled={product.stock === 0 || isAdding}
                        isLoading={isAdding}
                        onClick={handleAddToCart}
                    >
                        {isAdding ? "Adding..." : "Add to Cart"}
                    </Button>
                </div>
            </CardBody>
        </Card>
    );
}