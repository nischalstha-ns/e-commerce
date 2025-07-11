"use client";

import { Card, CardBody, Button, Chip } from "@heroui/react";
import { ShoppingCart, Heart } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { addToCart } from "@/lib/firestore/cart/write";
import { useState } from "react";
import toast from "react-hot-toast";

export default function ProductCard({ product }) {
    const { user } = useAuth();
    const [isAdding, setIsAdding] = useState(false);
    const [isLiked, setIsLiked] = useState(false);
    
    const displayPrice = product.sale_price || product.price;
    const hasDiscount = product.sale_price && product.sale_price < product.price;
    const discountPercent = hasDiscount 
        ? Math.round(((product.price - product.sale_price) / product.price) * 100)
        : 0;

    const handleAddToCart = async () => {
        if (!user) {
            toast.error("Please login to add items to cart");
            return;
        }

        setIsAdding(true);
        try {
            await addToCart({
                userId: user.id,
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
        <Card className="group border-0 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden bg-white">
            <CardBody className="p-0">
                <div className="relative aspect-[3/4] overflow-hidden bg-gray-50">
                    <img 
                        src={product.image_urls?.[0] || "/placeholder-product.jpg"}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    
                    {/* Discount Badge */}
                    {hasDiscount && (
                        <div className="absolute top-3 left-3">
                            <Chip 
                                color="danger" 
                                size="sm" 
                                className="bg-red-500 text-white font-medium"
                            >
                                -{discountPercent}%
                            </Chip>
                        </div>
                    )}
                    
                    {/* Stock Status */}
                    {product.stock === 0 && (
                        <div className="absolute top-3 right-3">
                            <Chip 
                                color="default" 
                                size="sm" 
                                className="bg-gray-900 text-white"
                            >
                                Sold Out
                            </Chip>
                        </div>
                    )}
                    
                    {/* Wishlist Button */}
                    <button
                        onClick={() => setIsLiked(!isLiked)}
                        className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110"
                    >
                        <Heart 
                            size={16} 
                            className={`${isLiked ? 'text-red-500 fill-current' : 'text-gray-600'} transition-colors`} 
                        />
                    </button>
                    
                    {/* Quick Add Button */}
                    <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                        <Button 
                            color="primary" 
                            className="w-full bg-black text-white hover:bg-gray-800 font-medium"
                            size="sm"
                            startContent={<ShoppingCart size={14} />}
                            isDisabled={product.stock === 0 || isAdding}
                            isLoading={isAdding}
                            onClick={handleAddToCart}
                        >
                            {isAdding ? "Adding..." : product.stock === 0 ? "Sold Out" : "Quick Add"}
                        </Button>
                    </div>
                </div>
                
                <div className="p-4 space-y-3">
                    <div>
                        <h3 className="font-medium text-gray-900 text-sm leading-tight line-clamp-2 mb-1">
                            {product.name}
                        </h3>
                        {product.description && (
                            <p className="text-xs text-gray-500 line-clamp-1">
                                {product.description}
                            </p>
                        )}
                    </div>
                    
                    {/* Sizes and Colors */}
                    {(product.sizes?.length > 0 || product.colors?.length > 0) && (
                        <div className="space-y-2">
                            {product.sizes?.length > 0 && (
                                <div className="flex gap-1 flex-wrap">
                                    {product.sizes.slice(0, 4).map((size, index) => (
                                        <span key={index} className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">
                                            {size}
                                        </span>
                                    ))}
                                    {product.sizes.length > 4 && (
                                        <span className="text-xs text-gray-500">+{product.sizes.length - 4}</span>
                                    )}
                                </div>
                            )}
                            {product.colors?.length > 0 && (
                                <div className="flex gap-1 flex-wrap">
                                    {product.colors.slice(0, 4).map((color, index) => (
                                        <span key={index} className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">
                                            {color}
                                        </span>
                                    ))}
                                    {product.colors.length > 4 && (
                                        <span className="text-xs text-gray-500">+{product.colors.length - 4}</span>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                    
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <span className="text-lg font-bold text-gray-900">
                                    Rs. {displayPrice}
                                </span>
                                {hasDiscount && (
                                    <span className="text-sm text-gray-500 line-through">
                                        Rs. {product.price}
                                    </span>
                                )}
                            </div>
                            {product.stock > 0 && product.stock <= 5 && (
                                <p className="text-xs text-orange-600 font-medium">
                                    Only {product.stock} left
                                </p>
                            )}
                        </div>
                        
                        <div className="text-right">
                            <div className={`w-2 h-2 rounded-full ${
                                product.stock > 10 ? 'bg-green-500' :
                                product.stock > 0 ? 'bg-yellow-500' :
                                'bg-red-500'
                            }`}></div>
                        </div>
                    </div>
                </div>
            </CardBody>
        </Card>
    );
}