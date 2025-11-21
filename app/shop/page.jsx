"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useProducts, useProductSearch } from "@/lib/firestore/products/read";
import { useCategories } from "@/lib/firestore/categories/read";
import { useBrands } from "@/lib/firestore/brands/read";
import LoadingSpinner from "../components/LoadingSpinner";
import { Search, RefreshCw } from "lucide-react";
import { debounce } from "@/lib/utils/debounce";
import { useErrorHandler } from "@/lib/hooks/useErrorHandler";
import ProductCard from "./components/ProductCard";
import ShopHeader from "./components/ShopHeader";
import ShopSidebar from "./components/ShopSidebar";
import ProductReviews from "./components/ProductReviews";
import { clearProductsCache } from "@/lib/utils/cache";

import Header from "../components/Header.jsx";
import { Providers } from "../providers";

function ShopContent() {
    const { userRole, isLoading: authLoading } = useAuth();
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
    const [filters, setFilters] = useState({
        category: null,
        brand: null,
        priceRange: [0, 100000],
        availability: null
    });
    const [sortBy, setSortBy] = useState("newest");
    const [mounted, setMounted] = useState(false);
    const [viewMode, setViewMode] = useState("grid");

    const { data: products, isLoading, error: productsError, refresh } = useProducts() || {};
    const { data: searchResults, error: searchError } = useProductSearch(debouncedSearchTerm) || {};
    const { data: categories } = useCategories() || {};
    const { data: brands } = useBrands() || {};
    const { handleError } = useErrorHandler();

    const handleRefresh = useCallback(() => {
        clearProductsCache();
        if (refresh) refresh();
    }, [refresh]);

    const handleClearFilters = useCallback(() => {
        setFilters({
            category: null,
            brand: null,
            priceRange: [0, 100000],
            availability: null
        });
        setSearchTerm("");
    }, []);

    const handleSearch = useCallback((term) => {
        setSearchTerm(term);
    }, []);

    const handleFilterChange = useCallback((newFilters) => {
        setFilters(prev => ({ ...prev, ...newFilters }));
    }, []);

    const debouncedSearch = useMemo(
        () => debounce((term) => setDebouncedSearchTerm(term), 300),
        []
    );

    const filteredAndSortedProducts = useMemo(() => {
        const displayProducts = debouncedSearchTerm ? searchResults : products;
        
        if (!displayProducts || displayProducts.length === 0) {
            return [];
        }
        
        const filteredProducts = displayProducts.filter(product => {
            if (!product) return false;
            
            // Category filter
            if (filters.category && product.categoryId !== filters.category) return false;
            
            // Brand filter  
            if (filters.brand && product.brandId !== filters.brand) return false;
            
            // Availability filter
            if (filters.availability === "in-stock" && (!product.stock || product.stock === 0)) return false;
            if (filters.availability === "out-of-stock" && product.stock > 0) return false;
            
            // Price filter
            const price = product.salePrice || product.price || 0;
            if (price < filters.priceRange[0] || price > filters.priceRange[1]) return false;
            
            return true;
        });

        return [...filteredProducts].sort((a, b) => {
            switch (sortBy) {
                case "price-low":
                    return (a.salePrice || a.price || 0) - (b.salePrice || b.price || 0);
                case "price-high":
                    return (b.salePrice || b.price || 0) - (a.salePrice || a.price || 0);
                case "name":
                    return (a.name || '').localeCompare(b.name || '');
                case "rating":
                    return (b.rating || 0) - (a.rating || 0);
                case "newest":
                default:
                    const aTime = a.timestampCreate?.seconds ? new Date(a.timestampCreate.seconds * 1000) : new Date(0);
                    const bTime = b.timestampCreate?.seconds ? new Date(b.timestampCreate.seconds * 1000) : new Date(0);
                    return bTime - aTime;
            }
        });
    }, [debouncedSearchTerm, searchResults, products, filters, sortBy]);

    useEffect(() => {
        try {
            if (productsError) handleError(productsError, 'loading products');
            if (searchError) handleError(searchError, 'searching products');
        } catch (error) {
            console.error('Error handling failed:', error);
        }
    }, [productsError, searchError, handleError]);

    useEffect(() => {
        debouncedSearch(searchTerm);
    }, [searchTerm, debouncedSearch]);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!authLoading && userRole === 'shop') {
            router.replace('/admin/products');
        }
    }, [userRole, authLoading, router]);

    if (!mounted || authLoading) {
        return (
            <div className="bg-white dark:bg-gray-900 min-h-screen theme-transition">
                <Header />
                <main className="container mx-auto px-4 py-6">
                    <LoadingSpinner size="lg" label="Loading shop..." />
                </main>
            </div>
        );
    }

    if (userRole === 'shop') {
        return <LoadingSpinner size="lg" label="Redirecting..." />;
    }

    return (
        <div className="min-h-screen bg-[#F7F8FA] dark:bg-gray-900 theme-transition">
            <Header />
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex items-center justify-between mb-4">
                    <ShopHeader 
                        searchTerm={searchTerm}
                        onSearch={handleSearch}
                        sortBy={sortBy}
                        onSortChange={setSortBy}
                        categories={categories}
                        brands={brands}
                        filters={filters}
                        onFilterChange={handleFilterChange}
                    />
                    <button
                        onClick={handleRefresh}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                        title="Refresh products"
                    >
                        <RefreshCw className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </button>
                </div>
                
                <main className="mt-8 grid grid-cols-1 lg:grid-cols-4 gap-6">
                    <aside className="lg:col-span-1">
                        <ShopSidebar 
                            filters={filters}
                            onFilterChange={handleFilterChange}
                            onClearFilters={handleClearFilters}
                            categories={categories}
                            brands={brands}
                        />
                    </aside>
                    
                    <section className="lg:col-span-3">
                        {isLoading ? (
                            <div className="flex justify-center py-12">
                                <LoadingSpinner size="lg" label="Loading products..." />
                            </div>
                        ) : filteredAndSortedProducts.length > 0 ? (
                            <>
                                <div className="mb-6 flex items-center justify-between">
                                    <p className="text-gray-600 dark:text-gray-400 text-sm theme-transition">
                                        Showing {filteredAndSortedProducts.length} products
                                    </p>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {filteredAndSortedProducts.slice(0, 2).map((product) => (
                                        <ProductCard key={product.id} product={product} variant="featured" />
                                    ))}
                                    
                                    {filteredAndSortedProducts.slice(2).map((product) => (
                                        <ProductCard key={product.id} product={product} />
                                    ))}
                                    
                                    {filteredAndSortedProducts.length > 6 && (
                                        <div className="lg:col-span-3 mt-8">
                                            <ProductReviews />
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <div className="bg-white dark:bg-gray-800 rounded-xl p-12 text-center theme-transition">
                                <div className="max-w-md mx-auto">
                                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Search className="w-8 h-8 text-gray-400" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">No products found</h3>
                                    <p className="text-gray-500 dark:text-gray-400 mb-4">
                                        {products?.length === 0 ? 
                                            "No products available. Add some products in the admin panel." :
                                            "Try adjusting your search or filters to find what you're looking for."
                                        }
                                    </p>
                                    <button 
                                        onClick={handleClearFilters}
                                        className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                                    >
                                        Clear all filters
                                    </button>
                                </div>
                            </div>
                        )}
                    </section>
                </main>
            </div>
        </div>
    );
}

export default function ShopPage() {
    return (
        <div suppressHydrationWarning>
            <ShopContent />
        </div>
    );
}