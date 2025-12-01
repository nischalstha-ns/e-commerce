"use client";

import { Button, Chip } from "@heroui/react";
import { ShoppingCart, Heart, Star, Bookmark } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { addToCart } from "@/lib/utils/addToCart";
import { useState } from "react";
import { useRouter } from "next/navigation";
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
    const router = useRouter();
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
        setIsAdding(true);
        await addToCart(user, product, 1, {}, router);
        setIsAdding(false);
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
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200/80 dark:border-gray-700 flex flex-col justify-between h-full group hover:shadow-lg transition-all duration-300 theme-transition">
            <div>
                <Link href={`/product/${product.id}`}>
                    <div className="bg-[#F7F8FA] dark:bg-gray-700 rounded-lg mb-4 flex items-center justify-center p-4 h-48 relative overflow-hidden cursor-pointer">
                        {!imgError && productImage ? (
                            <img 
                                src={productImage} 
                                alt={product.name} 
                                className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300" 
                                onError={() => setImgError(true)}
                            />
                        ) : (
                            <div className="text-gray-400 text-center">
                                <div className="text-5xl mb-2">📦</div>
                                <p className="text-sm">No Image</p>
                            </div>
                        )}
                    {hasDiscount && (
                        <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-md">
                            -{discountPercent}%
                        </span>
                    )}
                    {product.stock === 0 && (
                        <span className="absolute top-2 right-2 bg-gray-900 text-white text-xs font-bold px-2 py-1 rounded-md">
                            Sold Out
                        </span>
                    )}
                    </div>
                </Link>
                <Link href={`/product/${product.id}`}>
                    <h4 className="font-bold text-base leading-tight mb-1 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer text-gray-900 dark:text-gray-100 theme-transition">{product.name}</h4>
                </Link>
                {product.brand && <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{product.brand}</p>}
                <div className="flex items-center mb-2">
                    <span className="text-lg font-bold text-gray-800 dark:text-gray-200 mr-2">Rs. {Number(displayPrice).toLocaleString()}</span>
                    {hasDiscount && <span className="text-gray-400 line-through">Rs. {Number(product.price).toLocaleString()}</span>}
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2 line-clamp-2">{product.description}</p>
                <Rating rating={product.rating || 4.5} ratingCount={product.reviewCount} />
            </div>
            <div className="mt-4">
                <div className="flex items-center justify-between">
                    <button 
                        onClick={handleAddToCart}
                        disabled={product.stock === 0 || isAdding}
                        className="bg-blue-600 dark:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold text-sm hover:bg-blue-700 dark:hover:bg-blue-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isAdding ? "Adding..." : product.stock === 0 ? "Sold Out" : "Add to cart"}
                    </button>
                    <button 
                        onClick={() => setIsLiked(!isLiked)}
                        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                        <Heart className={`w-5 h-5 ${isLiked ? 'text-red-500 fill-current' : 'text-gray-500 dark:text-gray-400'}`} />
                    </button>
                </div>
            </div>
        </div>
    );
}