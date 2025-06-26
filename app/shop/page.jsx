"use client";

import { useState, useEffect } from "react";
import { useProducts, useProductSearch } from "@/lib/firestore/products/read";
import { Input, Select, SelectItem, CircularProgress } from "@heroui/react";
import { Search } from "lucide-react";
import ProductCard from "./components/ProductCard";
import ProductFilters from "./components/ProductFilters";
import Header from "../components/Header";
import { Providers } from "../providers";

function ShopContent() {
    const [searchTerm, setSearchTerm] = useState("");
    const [filters, setFilters] = useState({});
    const [sortBy, setSortBy] = useState("newest");
    const [mounted, setMounted] = useState(false);

    // Fix for Next.js workStore error
    useEffect(() => {
        setMounted(true);
    }, []);

    const { data: products, isLoading } = useProducts(filters);
    const { data: searchResults } = useProductSearch(searchTerm);

    // Don't render until mounted to avoid hydration issues
    if (!mounted) {
        return (
            <div>
                <Header />
                <main className="container mx-auto px-4 py-6">
                    <div className="flex justify-center py-8">
                        <CircularProgress size="lg" />
                    </div>
                </main>
            </div>
        );
    }

    const displayProducts = searchTerm ? searchResults : products;

    const filteredProducts = displayProducts?.filter(product => {
        if (filters.availability === "in-stock" && product.stock === 0) return false;
        if (filters.availability === "out-of-stock" && product.stock > 0) return false;
        if (filters.minPrice && product.price < filters.minPrice) return false;
        if (filters.maxPrice && product.price > filters.maxPrice) return false;
        return true;
    }) || [];

    const sortedProducts = [...filteredProducts].sort((a, b) => {
        switch (sortBy) {
            case "price-low":
                return (a.salePrice || a.price) - (b.salePrice || b.price);
            case "price-high":
                return (b.salePrice || b.price) - (a.salePrice || a.price);
            case "name":
                return a.name.localeCompare(b.name);
            case "newest":
            default:
                return new Date(b.timestampCreate?.seconds * 1000) - new Date(a.timestampCreate?.seconds * 1000);
        }
    });

    const handleClearFilters = () => {
        setFilters({});
        setSearchTerm("");
    };

    return (
        <div>
            <Header />
            <main className="container mx-auto px-4 py-6">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold mb-4">Shop</h1>
                    
                    <div className="flex gap-4 mb-4">
                        <Input
                            placeholder="Search products..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            startContent={<Search size={16} />}
                            className="flex-1"
                            size="sm"
                        />
                        <Select
                            placeholder="Sort by"
                            className="w-40"
                            selectedKeys={[sortBy]}
                            onSelectionChange={(keys) => {
                                const selectedKey = Array.from(keys)[0];
                                setSortBy(selectedKey);
                            }}
                            size="sm"
                        >
                            <SelectItem key="newest" value="newest">Newest</SelectItem>
                            <SelectItem key="price-low" value="price-low">Price: Low to High</SelectItem>
                            <SelectItem key="price-high" value="price-high">Price: High to Low</SelectItem>
                            <SelectItem key="name" value="name">Name: A to Z</SelectItem>
                        </Select>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    <div className="lg:col-span-1">
                        <ProductFilters
                            filters={filters}
                            onFiltersChange={setFilters}
                            onClearFilters={handleClearFilters}
                        />
                    </div>

                    <div className="lg:col-span-3">
                        {isLoading ? (
                            <div className="flex justify-center py-8">
                                <CircularProgress size="sm" />
                            </div>
                        ) : sortedProducts.length > 0 ? (
                            <>
                                <div className="mb-4">
                                    <p className="text-gray-600 text-sm">
                                        Showing {sortedProducts.length} products
                                    </p>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {sortedProducts.map((product) => (
                                        <ProductCard key={product.id} product={product} />
                                    ))}
                                </div>
                            </>
                        ) : (
                            <div className="text-center py-8">
                                <p className="text-gray-500">No products found</p>
                                <p className="text-gray-400 text-sm">Try adjusting your search or filters</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}

export default function ShopPage() {
    return (
        <Providers>
            <ShopContent />
        </Providers>
    );
}