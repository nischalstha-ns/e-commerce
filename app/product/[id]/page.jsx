"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useProduct } from "@/lib/firestore/products/read";
import { useAuth } from "@/contexts/AuthContext";
import { useCartStore } from "@/lib/store/cartStore";
import { Button, Chip, Tabs, Tab, Skeleton } from "@heroui/react";
import { ShoppingCart, Heart, Star, ArrowLeft, Plus, Minus, Share2 } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import Header from "../../components/Header";
import { Providers } from "../../providers";
import LoadingSpinner from "../../components/LoadingSpinner";

function ProductContent() {
    const { id } = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const { addItem } = useCartStore();
    const { data: product, isLoading, error } = useProduct(id);
    
    const [selectedImage, setSelectedImage] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [isAdding, setIsAdding] = useState(false);
    const [isLiked, setIsLiked] = useState(false);
    const [imageError, setImageError] = useState(false);
    useEffect(() => {
        if (product?.imageURLs?.length > 0) {
            setSelectedImage(0);
            setImageError(false);
        }
    }, [product]);

    const displayPrice = product?.salePrice || product?.price || 0;
    const hasDiscount = product?.salePrice && product?.salePrice < product?.price;
    const discountPercent = hasDiscount 
        ? Math.round(((product.price - product.salePrice) / product.price) * 100)
        : 0;

    const handleAddToCart = async () => {
        if (!user) {
            toast.error("Please login to add items to cart");
            router.push('/login');
            return;
        }

        if (!product || product.stock < quantity) {
            toast.error("Insufficient stock");
            return;
        }

        setIsAdding(true);
        try {
            addItem({
                id: product.id,
                name: product.name,
                price: displayPrice,
                quantity: quantity,
                imageURL: product.imageURLs?.[0] || "/placeholder-product.jpg"
            });
            toast.success(`Added ${quantity} item(s) to cart!`);
        } catch (error) {
            toast.error("Failed to add to cart");
        } finally {
            setIsAdding(false);
        }
    };

    const handleShare = async () => {
        try {
            await navigator.clipboard.writeText(window.location.href);
            toast.success('Link copied!');
        } catch {
            // Ignore clipboard errors
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-white dark:bg-gray-900">
                <Header />
                <div className="flex justify-center items-center min-h-[60vh]">
                    <LoadingSpinner size="lg" />
                </div>
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="min-h-screen bg-white dark:bg-gray-900">
                <Header />
                <div className="container mx-auto px-4 py-8">
                    <div className="text-center py-16">
                        <div className="text-6xl mb-4">😞</div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                            {error ? 'Error Loading Product' : 'Product Not Found'}
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            {error ? 'Please try again later' : 'This product may have been removed or doesn\'t exist'}
                        </p>
                        <div className="flex gap-4 justify-center">
                            <Button onClick={() => router.back()} variant="bordered">
                                Go Back
                            </Button>
                            <Button as={Link} href="/shop" color="primary">
                                Browse Products
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white dark:bg-gray-900">
            <Header />
            <div className="container mx-auto px-4 py-8">
                <Link href="/shop" className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:underline mb-6">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Shop
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 h-96 flex items-center justify-center relative overflow-hidden">
                            {!imageError ? (
                                <img 
                                    src={product.imageURLs?.[selectedImage] || "/placeholder-product.jpg"} 
                                    alt={product.name}
                                    className="max-h-full max-w-full object-contain transition-opacity duration-300"
                                    onError={() => setImageError(true)}
                                    loading="lazy"
                                />
                            ) : (
                                <div className="text-center text-gray-500">
                                    <div className="text-4xl mb-2">📷</div>
                                    <p>Image not available</p>
                                </div>
                            )}
                            {hasDiscount && (
                                <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                                    -{discountPercent}% OFF
                                </div>
                            )}
                        </div>
                        {product.imageURLs?.length > 1 && (
                            <div className="flex gap-2 overflow-x-auto pb-2">
                                {product.imageURLs.map((url, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setSelectedImage(index)}
                                        className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                                            selectedImage === index 
                                                ? 'border-blue-500 scale-105' 
                                                : 'border-gray-200 dark:border-gray-700 hover:border-gray-400'
                                        }`}
                                    >
                                        <img 
                                            src={url} 
                                            alt="" 
                                            className="w-full h-full object-cover"
                                            loading="lazy"
                                        />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="space-y-6">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">{product.name}</h1>
                            <div className="flex items-center gap-4 mb-4">
                                <div className="flex items-center">
                                    {[...Array(5)].map((_, i) => (
                                        <Star 
                                            key={i} 
                                            className={`w-5 h-5 ${i < (product.rating || 4) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                                        />
                                    ))}
                                    <span className="ml-2 text-gray-600 dark:text-gray-400">({product.reviewCount || 0} reviews)</span>
                                </div>
                                {product.stock > 0 ? (
                                    <Chip color="success" variant="flat">In Stock</Chip>
                                ) : (
                                    <Chip color="danger" variant="flat">Out of Stock</Chip>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <span className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                                Rs. {displayPrice.toLocaleString()}
                            </span>
                            {hasDiscount && (
                                <>
                                    <span className="text-xl text-gray-500 line-through">
                                        Rs. {product.price.toLocaleString()}
                                    </span>
                                    <Chip color="danger" variant="flat">-{discountPercent}% OFF</Chip>
                                </>
                            )}
                        </div>

                        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{product.description}</p>

                        {product.stock > 0 && (
                            <div className="flex items-center gap-4">
                                <span className="font-medium text-gray-900 dark:text-gray-100">Quantity:</span>
                                <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg">
                                    <Button
                                        size="sm"
                                        variant="light"
                                        isIconOnly
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                        disabled={quantity <= 1}
                                    >
                                        <Minus className="w-4 h-4" />
                                    </Button>
                                    <span className="px-4 py-2 font-medium">{quantity}</span>
                                    <Button
                                        size="sm"
                                        variant="light"
                                        isIconOnly
                                        onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                                        disabled={quantity >= product.stock}
                                    >
                                        <Plus className="w-4 h-4" />
                                    </Button>
                                </div>
                                <span className="text-sm text-gray-500">({product.stock} available)</span>
                            </div>
                        )}

                        <div className="flex gap-4">
                            <Button
                                color="primary"
                                size="lg"
                                className="flex-1"
                                startContent={<ShoppingCart className="w-5 h-5" />}
                                onClick={handleAddToCart}
                                isLoading={isAdding}
                                isDisabled={product.stock === 0 || quantity > product.stock}
                            >
                                {product.stock === 0 ? "Out of Stock" : isAdding ? "Adding..." : "Add to Cart"}
                            </Button>
                            <Button
                                variant="bordered"
                                size="lg"
                                isIconOnly
                                onClick={() => setIsLiked(!isLiked)}
                                className="hover:bg-red-50 dark:hover:bg-red-900/20"
                            >
                                <Heart className={`w-5 h-5 transition-colors ${isLiked ? 'text-red-500 fill-current' : 'text-gray-500'}`} />
                            </Button>
                            <Button
                                variant="bordered"
                                size="lg"
                                isIconOnly
                                onClick={handleShare}
                                className="hover:bg-blue-50 dark:hover:bg-blue-900/20"
                            >
                                <Share2 className="w-5 h-5" />
                            </Button>
                        </div>

                        <Tabs aria-label="Product details" className="w-full">
                            <Tab key="details" title="Details">
                                <div className="space-y-3 pt-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">Category</p>
                                            <p className="font-medium">{product.categoryName || 'Uncategorized'}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">Brand</p>
                                            <p className="font-medium">{product.brandName || 'Generic'}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">SKU</p>
                                            <p className="font-medium font-mono text-sm">{product.id}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">Availability</p>
                                            <p className={`font-medium ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                                            </p>
                                        </div>
                                    </div>
                                    {product.features && (
                                        <div>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Features</p>
                                            <ul className="list-disc list-inside space-y-1 text-sm">
                                                {product.features.map((feature, index) => (
                                                    <li key={index}>{feature}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            </Tab>
                            <Tab key="shipping" title="Shipping">
                                <div className="pt-4 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span>Standard Delivery</span>
                                        <span className="text-green-600 font-medium">Free</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span>Express Delivery</span>
                                        <span>Rs. 200</span>
                                    </div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        Orders placed before 2 PM are shipped the same day.
                                    </p>
                                </div>
                            </Tab>
                            <Tab key="reviews" title={`Reviews (${product.reviewCount || 0})`}>
                                <div className="pt-4 text-center">
                                    <p className="text-gray-600 dark:text-gray-400">No reviews yet</p>
                                    <p className="text-sm text-gray-500 mt-2">Be the first to review this product!</p>
                                </div>
                            </Tab>
                        </Tabs>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function ProductPage() {
    return <ProductContent />;
}