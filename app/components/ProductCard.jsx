'use client';

import { Card, CardBody, Button, Chip } from '@heroui/react';
import { Heart, ShoppingCart, Star } from 'lucide-react';
import { useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { motion } from 'framer-motion';
import Image from 'next/image';

export default function ProductCard({ product }) {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const { isDark } = useTheme();
  
  const getProductImage = () => {
    if (product.imageURLs?.length > 0) return product.imageURLs[0];
    if (product.imageURL) return product.imageURL;
    return '/placeholder-product.jpg';
  };

  const handleAddToCart = () => {
    // Add to cart logic
    console.log('Added to cart:', product.id);
  };

  const toggleWishlist = () => {
    setIsWishlisted(!isWishlisted);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const discountPercentage = product.salePrice 
    ? Math.round(((product.price - product.salePrice) / product.price) * 100)
    : 0;

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="group"
    >
      <Card className={`
        product-card
        bg-white dark:bg-gray-800
        border border-gray-200 dark:border-gray-700
        shadow-sm dark:shadow-black/20
        hover:shadow-lg dark:hover:shadow-black/30
        transition-all duration-300
        overflow-hidden
        ${isDark ? 'hover:border-gray-600' : 'hover:border-gray-300'}
      `}>
        {/* Image Container */}
        <div className="relative aspect-square overflow-hidden bg-gray-100 dark:bg-gray-700">
          {/* Discount Badge */}
          {discountPercentage > 0 && (
            <Chip
              size="sm"
              className="absolute top-2 left-2 z-10 bg-red-500 text-white font-semibold"
            >
              -{discountPercentage}%
            </Chip>
          )}

          {/* Wishlist Button */}
          <Button
            isIconOnly
            size="sm"
            variant="flat"
            className={`
              absolute top-2 right-2 z-10
              bg-white/90 dark:bg-gray-800/90
              backdrop-blur-sm
              border border-gray-200 dark:border-gray-600
              opacity-0 group-hover:opacity-100
              transition-all duration-300
              hover:scale-110
              ${isWishlisted ? 'text-red-500' : 'text-gray-600 dark:text-gray-400'}
            `}
            onClick={toggleWishlist}
          >
            <Heart 
              size={16} 
              className={isWishlisted ? 'fill-current' : ''} 
            />
          </Button>

          {/* Product Image */}
          <div className="relative w-full h-full">
            {!imageLoaded && !imageError && (
              <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse" />
            )}
            {!imageError ? (
              <img
                src={getProductImage()}
                alt={product.name}
                className={`
                  w-full h-full object-cover transition-all duration-500
                  group-hover:scale-105
                  ${imageLoaded ? 'opacity-100' : 'opacity-0'}
                `}
                onLoad={() => setImageLoaded(true)}
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-700">
                <div className="text-center text-gray-400">
                  <div className="text-5xl mb-2">📦</div>
                  <p className="text-sm">No Image</p>
                </div>
              </div>
            )}
          </div>

          {/* Quick Add to Cart - Overlay */}
          <div className={`
            absolute inset-x-0 bottom-0
            bg-gradient-to-t from-black/60 to-transparent
            p-4
            transform translate-y-full group-hover:translate-y-0
            transition-transform duration-300
          `}>
            <Button
              fullWidth
              size="sm"
              className="bg-white text-gray-900 font-semibold hover:bg-gray-100"
              startContent={<ShoppingCart size={16} />}
              onClick={handleAddToCart}
            >
              Quick Add
            </Button>
          </div>
        </div>

        {/* Product Info */}
        <CardBody className="p-4 space-y-3">
          {/* Product Name */}
          <h3 className={`
            font-semibold text-sm line-clamp-2
            text-gray-900 dark:text-gray-100
            group-hover:text-blue-600 dark:group-hover:text-blue-400
            transition-colors duration-200
          `}>
            {product.name}
          </h3>

          {/* Rating */}
          {product.rating && (
            <div className="flex items-center gap-1">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={12}
                    className={`
                      ${i < Math.floor(product.rating) 
                        ? 'text-yellow-400 fill-current' 
                        : 'text-gray-300 dark:text-gray-600'
                      }
                    `}
                  />
                ))}
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                ({product.reviewCount || 0})
              </span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-center gap-2">
            <span className={`
              font-bold text-lg
              ${product.salePrice 
                ? 'text-red-600 dark:text-red-400' 
                : 'text-gray-900 dark:text-gray-100'
              }
            `}>
              {formatPrice(product.salePrice || product.price)}
            </span>
            {product.salePrice && (
              <span className="text-sm text-gray-500 dark:text-gray-400 line-through">
                {formatPrice(product.price)}
              </span>
            )}
          </div>

          {/* Stock Status */}
          <div className="flex items-center justify-between">
            <Chip
              size="sm"
              variant="flat"
              className={`
                ${product.stock > 0 
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' 
                  : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                }
              `}
            >
              {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
            </Chip>
          </div>

          {/* Add to Cart Button */}
          <Button
            fullWidth
            size="sm"
            className={`
              mt-3
              ${product.stock > 0
                ? 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
              }
              font-semibold transition-all duration-200
            `}
            startContent={<ShoppingCart size={16} />}
            onClick={handleAddToCart}
            isDisabled={product.stock === 0}
          >
            {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
          </Button>
        </CardBody>
      </Card>
    </motion.div>
  );
}