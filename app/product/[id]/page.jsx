"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useProduct } from "@/lib/firestore/products/read";
import { useProducts } from "@/lib/firestore/products/read";
import { useAuth } from "@/contexts/AuthContext";
import { addToCart } from "@/lib/firestore/cart/write";
import { Button, Chip, Tabs, Tab, Card, CardBody, Input, Textarea, Avatar, Progress } from "@heroui/react";
import { ShoppingCart, Heart, Star, ArrowLeft, Plus, Minus, Share2, Truck, Shield, RefreshCw, ChevronLeft, ChevronRight, ZoomIn, Package, MessageCircle, ThumbsUp } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import Header from "../../components/Header";
import ProductCard from "../../components/ProductCard";
import { motion, AnimatePresence } from "framer-motion";

export default function ProductPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { data: product, isLoading } = useProduct(id);
  const { data: allProducts } = useProducts();
  
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState({});
  const [reviewText, setReviewText] = useState("");
  const [rating, setRating] = useState(5);
  const [questionText, setQuestionText] = useState("");

  const images = useMemo(() => 
    product?.imageURLs?.length > 0 ? product.imageURLs : product?.imageURL ? [product.imageURL] : [],
    [product]
  );

  const relatedProducts = useMemo(() => 
    allProducts?.filter(p => p.id !== id && p.categoryId === product?.categoryId && p.stock > 0).slice(0, 4) || [],
    [allProducts, id, product]
  );

  const displayPrice = selectedVariant.price || product?.salePrice || product?.price || 0;
  const originalPrice = product?.price || 0;
  const hasDiscount = displayPrice < originalPrice;
  const discountPercent = hasDiscount ? Math.round(((originalPrice - displayPrice) / originalPrice) * 100) : 0;
  const currentStock = selectedVariant.stock ?? product?.stock ?? 0;

  const ratingDistribution = useMemo(() => {
    const dist = { 5: 45, 4: 30, 3: 15, 2: 7, 1: 3 };
    const total = Object.values(dist).reduce((a, b) => a + b, 0);
    return Object.entries(dist).map(([stars, count]) => ({
      stars: parseInt(stars),
      count,
      percentage: (count / total) * 100
    })).reverse();
  }, []);

  const handleAddToCart = async () => {
    if (!user) {
      toast.error("Please login to add items to cart");
      router.push('/login');
      return;
    }

    if (currentStock < quantity) {
      toast.error("Insufficient stock");
      return;
    }

    setIsAdding(true);
    try {
      await addToCart({ userId: user.uid, productId: id, quantity });
      toast.success(`Added ${quantity} item(s) to cart!`);
    } catch (error) {
      toast.error("Failed to add to cart");
    } finally {
      setIsAdding(false);
    }
  };

  const handleBuyNow = async () => {
    await handleAddToCart();
    if (currentStock >= quantity) {
      router.push('/cart');
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: product?.name, url: window.location.href });
      } catch {}
    } else {
      await navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied!');
    }
  };

  const handleSubmitReview = () => {
    if (!user) {
      toast.error("Please login to submit a review");
      return;
    }
    toast.success("Review submitted!");
    setReviewText("");
    setRating(5);
  };

  const handleSubmitQuestion = () => {
    if (!user) {
      toast.error("Please login to ask a question");
      return;
    }
    toast.success("Question submitted!");
    setQuestionText("");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="bg-gray-200 dark:bg-gray-800 rounded-2xl h-96 sm:h-[500px] animate-pulse" />
              <div className="flex gap-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="w-20 h-20 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse" />
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded animate-pulse w-3/4" />
              <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded animate-pulse w-1/2" />
              <div className="h-20 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="text-6xl mb-4">😞</div>
          <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
          <Button as={Link} href="/shop" color="primary">Browse Products</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      
      <div className="container mx-auto px-4 py-6 sm:py-8">
        <button onClick={() => router.back()} className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:underline mb-6">
          <ArrowLeft size={16} className="mr-2" />
          Back
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12 mb-12">
          {/* Image Gallery */}
          <div className="space-y-4">
            <motion.div 
              className="relative bg-white dark:bg-gray-800 rounded-2xl p-4 sm:p-8 h-80 sm:h-[500px] flex items-center justify-center group overflow-hidden shadow-lg"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              {images.length > 0 ? (
                <>
                  <img 
                    src={images[selectedImage]} 
                    alt={product.name}
                    className="max-h-full max-w-full object-contain cursor-zoom-in"
                    onClick={() => setIsZoomed(true)}
                  />
                  <button 
                    onClick={() => setIsZoomed(true)}
                    className="absolute bottom-4 right-4 bg-black/60 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <ZoomIn size={20} />
                  </button>
                  {hasDiscount && (
                    <div className="absolute top-4 left-4 bg-red-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                      -{discountPercent}% OFF
                    </div>
                  )}
                  {images.length > 1 && (
                    <>
                      <button 
                        onClick={() => setSelectedImage((selectedImage - 1 + images.length) % images.length)}
                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 dark:bg-gray-800/90 p-2 rounded-full shadow-lg hover:scale-110 transition-transform"
                      >
                        <ChevronLeft size={20} />
                      </button>
                      <button 
                        onClick={() => setSelectedImage((selectedImage + 1) % images.length)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 dark:bg-gray-800/90 p-2 rounded-full shadow-lg hover:scale-110 transition-transform"
                      >
                        <ChevronRight size={20} />
                      </button>
                    </>
                  )}
                </>
              ) : (
                <div className="text-center text-gray-400">
                  <Package size={64} className="mx-auto mb-4" />
                  <p>No Image Available</p>
                </div>
              )}
            </motion.div>

            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {images.map((url, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImage === index ? 'border-blue-500 scale-105 shadow-lg' : 'border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    <img src={url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <div className="flex items-start justify-between mb-2">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white leading-tight">
                  {product.name}
                </h1>
                <button onClick={handleShare} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                  <Share2 size={20} />
                </button>
              </div>
              
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={18} className={`${i < (product.rating || 4) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                  ))}
                  <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                    {product.rating || 4.0} ({product.reviewCount || 0} reviews)
                  </span>
                </div>
                <Chip size="sm" color={currentStock > 0 ? "success" : "danger"} variant="flat">
                  {currentStock > 0 ? `${currentStock} in stock` : 'Out of stock'}
                </Chip>
              </div>

              <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <p>Brand: <span className="font-medium text-gray-900 dark:text-white">{product.brandName || 'Generic'}</span></p>
                <p>SKU: <span className="font-mono text-xs">{product.id}</span></p>
              </div>
            </div>

            <div className="flex flex-wrap items-baseline gap-3">
              <span className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
                Rs. {displayPrice.toLocaleString()}
              </span>
              {hasDiscount && (
                <>
                  <span className="text-xl text-gray-500 line-through">
                    Rs. {originalPrice.toLocaleString()}
                  </span>
                  <Chip color="danger" size="sm">Save Rs. {(originalPrice - displayPrice).toLocaleString()}</Chip>
                </>
              )}
            </div>

            <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm sm:text-base">
              {product.description}
            </p>

            {product.variants && product.variants.length > 0 && (
              <div className="space-y-3">
                <p className="font-semibold text-gray-900 dark:text-white">Select Variant:</p>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((variant, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedVariant(variant)}
                      className={`px-4 py-2 rounded-lg border-2 transition-all ${
                        selectedVariant.name === variant.name
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                      }`}
                    >
                      {variant.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {currentStock > 0 && (
              <div className="flex items-center gap-4">
                <span className="font-semibold text-gray-900 dark:text-white">Quantity:</span>
                <div className="flex items-center border-2 border-gray-300 dark:border-gray-600 rounded-lg">
                  <Button size="sm" variant="light" isIconOnly onClick={() => setQuantity(Math.max(1, quantity - 1))}>
                    <Minus size={16} />
                  </Button>
                  <span className="px-6 py-2 font-semibold min-w-[60px] text-center">{quantity}</span>
                  <Button size="sm" variant="light" isIconOnly onClick={() => setQuantity(Math.min(currentStock, quantity + 1))}>
                    <Plus size={16} />
                  </Button>
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                color="primary"
                size="lg"
                className="flex-1 font-semibold"
                startContent={<ShoppingCart size={20} />}
                onClick={handleAddToCart}
                isLoading={isAdding}
                isDisabled={currentStock === 0}
              >
                Add to Cart
              </Button>
              <Button
                size="lg"
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-semibold"
                onClick={handleBuyNow}
                isDisabled={currentStock === 0}
              >
                Buy Now
              </Button>
              <Button
                variant="bordered"
                size="lg"
                isIconOnly
                onClick={() => setIsWishlisted(!isWishlisted)}
              >
                <Heart size={20} className={isWishlisted ? 'text-red-500 fill-current' : ''} />
              </Button>
            </div>

            <Card className="bg-blue-50 dark:bg-blue-900/20 border-0">
              <CardBody className="p-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center gap-3">
                    <Truck className="text-blue-600 dark:text-blue-400" size={24} />
                    <div>
                      <p className="font-semibold">Free Delivery</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">On orders over Rs. 2000</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Shield className="text-green-600 dark:text-green-400" size={24} />
                    <div>
                      <p className="font-semibold">Secure Payment</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">100% protected</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <RefreshCw className="text-purple-600 dark:text-purple-400" size={24} />
                    <div>
                      <p className="font-semibold">Easy Returns</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">30-day policy</p>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>
        </div>

        {/* Tabs Section */}
        <Card className="mb-12">
          <CardBody className="p-4 sm:p-6">
            <Tabs aria-label="Product information" size="lg" className="w-full">
              <Tab key="description" title="Description">
                <div className="py-4 space-y-4">
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{product.description}</p>
                  {product.features && (
                    <div>
                      <h3 className="font-semibold text-lg mb-3">Key Features:</h3>
                      <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300">
                        {product.features.map((feature, idx) => (
                          <li key={idx}>{feature}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </Tab>

              <Tab key="specifications" title="Specifications">
                <div className="py-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex justify-between py-3 border-b border-gray-200 dark:border-gray-700">
                      <span className="text-gray-600 dark:text-gray-400">Category</span>
                      <span className="font-semibold">{product.categoryName || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between py-3 border-b border-gray-200 dark:border-gray-700">
                      <span className="text-gray-600 dark:text-gray-400">Brand</span>
                      <span className="font-semibold">{product.brandName || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between py-3 border-b border-gray-200 dark:border-gray-700">
                      <span className="text-gray-600 dark:text-gray-400">Stock</span>
                      <span className="font-semibold">{currentStock}</span>
                    </div>
                    <div className="flex justify-between py-3 border-b border-gray-200 dark:border-gray-700">
                      <span className="text-gray-600 dark:text-gray-400">SKU</span>
                      <span className="font-mono text-sm">{product.id}</span>
                    </div>
                  </div>
                </div>
              </Tab>

              <Tab key="reviews" title={`Reviews (${product.reviewCount || 0})`}>
                <div className="py-4 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="text-5xl font-bold mb-2">{product.rating || 4.0}</div>
                      <div className="flex justify-center mb-2">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={20} className={`${i < (product.rating || 4) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                        ))}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{product.reviewCount || 0} reviews</p>
                    </div>

                    <div className="md:col-span-2 space-y-2">
                      {ratingDistribution.map(({ stars, count, percentage }) => (
                        <div key={stars} className="flex items-center gap-3">
                          <span className="text-sm w-12">{stars} star</span>
                          <Progress value={percentage} className="flex-1" color="warning" size="sm" />
                          <span className="text-sm w-12 text-right">{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {user && (
                    <Card>
                      <CardBody className="p-4">
                        <h3 className="font-semibold mb-4">Write a Review</h3>
                        <div className="space-y-4">
                          <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button key={star} onClick={() => setRating(star)}>
                                <Star size={24} className={`${star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                              </button>
                            ))}
                          </div>
                          <Textarea
                            placeholder="Share your experience..."
                            value={reviewText}
                            onChange={(e) => setReviewText(e.target.value)}
                            minRows={3}
                          />
                          <Button color="primary" onClick={handleSubmitReview}>Submit Review</Button>
                        </div>
                      </CardBody>
                    </Card>
                  )}

                  <div className="text-center text-gray-500 py-8">
                    <p>No reviews yet. Be the first to review!</p>
                  </div>
                </div>
              </Tab>

              <Tab key="qa" title="Q&A">
                <div className="py-4 space-y-6">
                  {user && (
                    <Card>
                      <CardBody className="p-4">
                        <h3 className="font-semibold mb-4">Ask a Question</h3>
                        <div className="space-y-4">
                          <Textarea
                            placeholder="What would you like to know?"
                            value={questionText}
                            onChange={(e) => setQuestionText(e.target.value)}
                            minRows={2}
                          />
                          <Button color="primary" startContent={<MessageCircle size={16} />} onClick={handleSubmitQuestion}>
                            Submit Question
                          </Button>
                        </div>
                      </CardBody>
                    </Card>
                  )}

                  <div className="text-center text-gray-500 py-8">
                    <MessageCircle size={48} className="mx-auto mb-4 text-gray-400" />
                    <p>No questions yet. Be the first to ask!</p>
                  </div>
                </div>
              </Tab>
            </Tabs>
          </CardBody>
        </Card>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Related Products</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Zoom Modal */}
      <AnimatePresence>
        {isZoomed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
            onClick={() => setIsZoomed(false)}
          >
            <button className="absolute top-4 right-4 text-white text-4xl hover:text-gray-300 z-10" onClick={() => setIsZoomed(false)}>
              ×
            </button>
            <img src={images[selectedImage]} alt={product.name} className="max-h-full max-w-full object-contain" onClick={(e) => e.stopPropagation()} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
