"use client";

import { Button, Chip } from "@heroui/react";
import { ShoppingCart, Heart, Star, Bookmark } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useCartStore } from "@/lib/store/cartStore";
import { useState } from "react";
import toast from "react-hot-toast";
import Link from "next/link";

const Rating = ({ rating, ratingCount }) => {
  const fullStars = Math.floor(rating || 0);
  const emptyStars = 5 - fullStars;

  return (
    <div className="flex items-center">
      <div className="flex items-center text-orange-400">
        {[...Array(fullStars)].map((_, i) => (
          <Star key={`full-${i}`} className="w-4 h-4 fill-current" />
        ))}
        {[...Array(emptyStars)].map((_, i) => (
          <Star key={`empty-${i}`} className="w-4 h-4 text-gray-300 dark:text-gray-600" />
        ))}
      </div>
      <span className="text-sm text-gray-500 dark:text-gray-400 ml-1.5 font-medium">{rating || 0}</span>
      {ratingCount && <span className="text-sm text-gray-400 dark:text-gray-500 ml-1">({ratingCount})</span>}
    </div>
  );
};

export default function ProductCard({ product, variant = "default" }) {
    const { user } = useAuth();
    const { addItem } = useCartStore();
    const [isAdding, setIsAdding] = useState(false);
    const [isLiked, setIsLiked] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [imgError, setImgError] = useState(false);
    
    const displayPrice = product.salePrice || product.price;
    const hasDiscount = product.salePrice && product.salePrice < product.price;
    const discountPercent = hasDiscount 
        ? Math.round(((product.price - product.salePrice) / product.price) * 100)
        : 0;
    
    const getProductImage = () => {
        if (product.imageURLs?.length > 0) return product.imageURLs[0];
        if (product.imageURL) return product.imageURL;
        return null;
    };
    
    const productImage = getProductImage();

    const handleAddToCart = async () => {
        if (!user) {
            toast.error("Please login to add items to cart");
            return;
        }

        if (!product?.id || !product?.name || !displayPrice) {
            toast.error("Invalid product data");
            return;
        }

        setIsAdding(true);
        try {
            addItem({
                id: product.id,
                name: product.name,
                price: displayPrice,
                quantity: 1,
                imageURL: productImage || "/placeholder-product.jpg"
            });
            toast.success("Added to cart!");
        } catch (error) {
            console.error('Add to cart error:', error);
            toast.error("Failed to add to cart");
        } finally {
            setIsAdding(false);
        }
    };

    if (variant === "featured") {
        return (
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200/80 dark:border-gray-700 flex flex-col md:flex-row gap-6 col-span-1 lg:col-span-3 theme-transition">
                <div className="relative flex-shrink-0 md:w-48">
                    <Link href={`/product/${product.id}`}>
                        <div className="bg-[#F7F8FA] dark:bg-gray-700 rounded-lg flex items-center justify-center p-4 h-full cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                            {!imgError && productImage ? (
                                <img 
                                    src={productImage} 
                                    alt={product.name} 
                                    className="max-h-40 object-contain" 
                                    onError={() => setImgError(true)}
                                />
                            ) : (
                                <div className="text-gray-400 text-center">
                                    <div className="text-4xl mb-2">📦</div>
                                    <p className="text-xs">No Image</p>
                                </div>
                            )}
                        </div>
                    </Link>
                    {hasDiscount && <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-md">-{discountPercent}%</span>}
                </div>
                <div className="flex-grow">
                    <Link href={`/product/${product.id}`}>
                        <h3 className="font-bold text-lg mb-1 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer text-gray-900 dark:text-gray-100">{product.name}</h3>
                    </Link>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">{product.description}</p>
                    <div className="flex items-center flex-wrap gap-x-4 gap-y-2 mb-3">
                        <Rating rating={product.rating || 4.5} ratingCount={product.reviewCount} />
                        {product.stock > 0 && <span className="text-green-600 dark:text-green-400 text-sm font-semibold">In Stock</span>}
                    </div>
                    <div className="flex flex-wrap items-center gap-4">
                        <div>
                            <span className="text-xl font-bold mr-2 text-gray-900 dark:text-gray-100">Rs. {Number(displayPrice).toLocaleString()}</span>
                            {hasDiscount && <span className="text-gray-400 line-through">Rs. {Number(product.price).toLocaleString()}</span>}
                        </div>
                        <div className="flex-grow flex flex-wrap gap-2">
                            <button 
                                onClick={handleAddToCart}
                                disabled={product.stock === 0 || isAdding}
                                className="flex items-center bg-blue-600 dark:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-800 text-sm transition-colors disabled:opacity-50"
                            >
                                <ShoppingCart className="w-5 h-5 mr-2" />
                                {isAdding ? "Adding..." : "Add to cart"}
                            </button>
                            <button 
                                onClick={() => setIsSaved(!isSaved)}
                                className="flex items-center border border-gray-300 dark:border-gray-600 px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-sm font-medium transition-colors"
                            >
                                <Bookmark className={`w-5 h-5 mr-2 ${isSaved ? 'fill-current text-blue-600' : 'text-gray-500'}`} />
                                Save for later
                            </button>
                        </div>
                    </div>
                </div>
                <div className="self-start -mr-2 -mt-2">
                    <button 
                        onClick={() => setIsLiked(!isLiked)}
                        className="p-3 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                        <Heart className={`w-6 h-6 ${isLiked ? 'text-red-500 fill-current' : 'text-gray-400'}`} />
                    </button>
                </div>
            </div>
        );
    }

    return (
        <Link href={`/product/${product.id}`}>
            <div className="group cursor-pointer bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-md hover:shadow-2xl dark:shadow-gray-900/30 dark:hover:shadow-gray-900/50 transition-all duration-300 h-full flex flex-col theme-transition">
                <div className="relative aspect-square overflow-hidden bg-gray-100 dark:bg-gray-700">
                    {!imgError && productImage ? (
                        <img 
                            src={productImage} 
                            alt={product.name} 
                            loading="lazy"
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                            onError={() => setImgError(true)}
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <div className="text-center">
                                <div className="text-6xl mb-2">📦</div>
                                <p className="text-sm">No Image</p>
                            </div>
                        </div>
                    )}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300"></div>
                    {hasDiscount && (
                        <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                            -{discountPercent}%
                        </span>
                    )}
                    {product.stock === 0 && (
                        <span className="absolute top-3 right-3 bg-gray-900 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                            Sold Out
                        </span>
                    )}
                    <button 
                        onClick={(e) => { e.preventDefault(); setIsLiked(!isLiked); }}
                        className="absolute top-3 right-3 p-2 bg-white dark:bg-gray-800 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:scale-110"
                    >
                        <Heart className={`w-5 h-5 ${isLiked ? 'text-red-500 fill-current' : 'text-gray-600 dark:text-gray-400'}`} />
                    </button>
                </div>
                <div className="p-4 flex-grow flex flex-col">
                    <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100 mb-1 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {product.name}
                    </h3>
                    {product.brand && <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{product.brand}</p>}
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2 flex-grow">{product.description}</p>
                    <div className="mb-3">
                        <Rating rating={product.rating || 4.5} ratingCount={product.reviewCount} />
                    </div>
                    <div className="flex items-center justify-between mb-3">
                        <div>
                            <span className="text-xl font-bold text-gray-900 dark:text-gray-100">Rs. {Number(displayPrice).toLocaleString()}</span>
                            {hasDiscount && <span className="text-sm text-gray-400 line-through ml-2">Rs. {Number(product.price).toLocaleString()}</span>}
                        </div>
                    </div>
                    <button 
                        onClick={(e) => { e.preventDefault(); handleAddToCart(); }}
                        disabled={product.stock === 0 || isAdding}
                        className="w-full bg-blue-600 dark:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-semibold text-sm hover:bg-blue-700 dark:hover:bg-blue-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        <ShoppingCart className="w-4 h-4" />
                        {isAdding ? "Adding..." : product.stock === 0 ? "Sold Out" : "Add to Cart"}
                    </button>
                </div>
            </div>
        </Link>
    );
}