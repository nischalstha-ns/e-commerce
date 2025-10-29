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
        <Card className="group border-0 shadow-md hover:shadow-2xl dark:shadow-gray-900/20 dark:hover:shadow-gray-900/40 transition-all duration-500 overflow-hidden bg-white dark:bg-gray-800 rounded-2xl card-hover theme-transition">
            <CardBody className="p-0">
                <div className="relative aspect-[4/5] overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 theme-transition">
                    <img 
                        src={product.imageURLs?.[0] || "/placeholder-product.jpg"}
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
                        className="absolute top-4 right-4 w-10 h-10 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 hover:bg-white dark:hover:bg-gray-800 theme-transition"
                    >
                        <Heart 
                            size={18} 
                            className={`${isLiked ? 'text-red-500 fill-current' : 'text-gray-700 dark:text-gray-300'} transition-colors`} 
                        />
                    </button>
                    
                    {/* Quick Add Button */}
                    <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-3 group-hover:translate-y-0">
                        <Button 
                            color="primary" 
                            className="w-full bg-gradient-to-r from-gray-900 to-black dark:from-blue-600 dark:to-blue-700 text-white hover:from-black hover:to-gray-800 dark:hover:from-blue-700 dark:hover:to-blue-800 font-semibold shadow-lg glow-hover theme-transition"
                            size="md"
                            startContent={<ShoppingCart size={16} />}
                            isDisabled={product.stock === 0 || isAdding}
                            isLoading={isAdding}
                            onClick={handleAddToCart}
                        >
                            {isAdding ? "Adding..." : product.stock === 0 ? "Sold Out" : "Add to Cart"}
                        </Button>
                    </div>
                </div>
                
                <div className="p-5 space-y-4">
                    <div>
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-base leading-tight line-clamp-2 mb-2 theme-transition">
                            {product.name}
                        </h3>
                        {product.description && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed theme-transition">
                                {product.description}
                            </p>
                        )}
                    </div>
                    
                    {/* Sizes and Colors */}
                    {(product.sizes?.length > 0 || product.colors?.length > 0) && (
                        <div className="space-y-2">
                            {product.sizes?.length > 0 && (
                                <div className="flex gap-1.5 flex-wrap">
                                    {product.sizes.slice(0, 3).map((size, index) => (
                                        <span key={index} className="text-xs px-2.5 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full font-medium theme-transition">
                                            {size}
                                        </span>
                                    ))}
                                    {product.sizes.length > 3 && (
                                        <span className="text-xs text-gray-500 dark:text-gray-400 px-1 theme-transition">+{product.sizes.length - 3}</span>
                                    )}
                                </div>
                            )}
                            {product.colors?.length > 0 && (
                                <div className="flex gap-1.5 flex-wrap">
                                    {product.colors.slice(0, 3).map((color, index) => (
                                        <span key={index} className="text-xs px-2.5 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full font-medium theme-transition">
                                            {color}
                                        </span>
                                    ))}
                                    {product.colors.length > 3 && (
                                        <span className="text-xs text-gray-500 dark:text-gray-400 px-1 theme-transition">+{product.colors.length - 3}</span>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                    
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <div className="flex items-baseline gap-2">
                                <span className="text-xl font-bold text-gray-900 dark:text-gray-100 theme-transition">
                                    Rs. {Number(displayPrice).toLocaleString()}
                                </span>
                                {hasDiscount && (
                                    <span className="text-sm text-gray-500 dark:text-gray-400 line-through theme-transition">
                                        Rs. {Number(product.price).toLocaleString()}
                                    </span>
                                )}
                            </div>
                            {product.stock > 0 && product.stock <= 5 && (
                                <p className="text-xs text-orange-600 dark:text-orange-400 font-medium theme-transition">
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