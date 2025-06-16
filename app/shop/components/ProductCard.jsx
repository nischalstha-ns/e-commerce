"use client";

import { Card, CardBody, Button, Chip } from "@heroui/react";
import { ShoppingCart, Heart } from "lucide-react";

export default function ProductCard({ product }) {
    const displayPrice = product.salePrice || product.price;
    const hasDiscount = product.salePrice && product.salePrice < product.price;
    const discountPercent = hasDiscount 
        ? Math.round(((product.price - product.salePrice) / product.price) * 100)
        : 0;

    return (
        <Card className="shadow-sm hover:shadow-md transition-shadow">
            <CardBody className="p-0">
                <div className="relative">
                    <img 
                        src={product.imageURLs?.[0] || "/placeholder-product.jpg"}
                        alt={product.name}
                        className="w-full h-48 object-cover rounded-t-lg"
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
                    <Button
                        isIconOnly
                        size="sm"
                        variant="light"
                        className="absolute top-2 right-2 bg-white/80"
                    >
                        <Heart size={16} />
                    </Button>
                </div>
                
                <div className="p-4">
                    <h3 className="font-semibold text-lg mb-2 line-clamp-2">{product.name}</h3>
                    
                    {product.description && (
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                            {product.description}
                        </p>
                    )}
                    
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <span className="text-xl font-bold text-blue-600">
                                ${displayPrice}
                            </span>
                            {hasDiscount && (
                                <span className="text-sm text-gray-500 line-through">
                                    ${product.price}
                                </span>
                            )}
                        </div>
                        
                        <Chip 
                            color={product.stock > 0 ? "success" : "danger"} 
                            size="sm"
                        >
                            {product.stock > 0 ? "In Stock" : "Out of Stock"}
                        </Chip>
                    </div>
                    
                    <Button 
                        color="primary" 
                        className="w-full"
                        startContent={<ShoppingCart size={16} />}
                        isDisabled={product.stock === 0}
                    >
                        Add to Cart
                    </Button>
                </div>
            </CardBody>
        </Card>
    );
}