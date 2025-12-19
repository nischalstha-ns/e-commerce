"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useProducts } from "@/lib/firestore/products/read";
import { useCategories } from "@/lib/firestore/categories/read";
import { useBrands } from "@/lib/firestore/brands/read";
import { Button, Input, Select, SelectItem, Slider, Chip, Card, CardBody, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure, Breadcrumbs, BreadcrumbItem } from "@heroui/react";
import { Search, SlidersHorizontal, Grid3x3, List, Star, ShoppingCart, Eye } from "lucide-react";
import Header from "../components/Header";
import ProductCard from "../components/ProductCard";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import toast from "react-hot-toast";
import { addToCart } from "@/lib/firestore/cart/write";

export default function ShopPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, userRole, isLoading: authLoading } = useAuth();
  const { data: products, isLoading: productsLoading } = useProducts();
  const { data: categories } = useCategories();
  const { data: brands } = useBrands();

  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || "");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [priceRange, setPriceRange] = useState([0, 100000]);
  const [minRating, setMinRating] = useState(0);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState("newest");
  const [viewMode, setViewMode] = useState("grid");
  const [currentPage, setCurrentPage] = useState(1);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(true);
  const [isFiltering, setIsFiltering] = useState(false);

  const itemsPerPage = 12;
  const maxPrice = useMemo(() => Math.max(...(products?.map(p => p.price || 0) || [100000])), [products]);

  useEffect(() => {
    if (!authLoading && userRole === 'shop') {
      router.replace('/admin/products');
    }
  }, [userRole, authLoading, router]);

  useEffect(() => {
    setIsFiltering(true);
    const timer = setTimeout(() => setIsFiltering(false), 300);
    return () => clearTimeout(timer);
  }, [selectedCategories, selectedBrands, priceRange, minRating, inStockOnly, sortBy, searchTerm]);

  const filteredProducts = useMemo(() => {
    if (!products) return [];
    return products.filter(product => {
      if (searchTerm && !product.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      if (selectedCategories.length > 0 && !selectedCategories.includes(product.categoryId)) return false;
      if (selectedBrands.length > 0 && !selectedBrands.includes(product.brandId)) return false;
      const price = product.salePrice || product.price || 0;
      if (price < priceRange[0] || price > priceRange[1]) return false;
      if (minRating > 0 && (product.rating || 0) < minRating) return false;
      if (inStockOnly && product.stock === 0) return false;
      return true;
    });
  }, [products, searchTerm, selectedCategories, selectedBrands, priceRange, minRating, inStockOnly]);

  const sortedProducts = useMemo(() => {
    const sorted = [...filteredProducts];
    switch (sortBy) {
      case "price-low": return sorted.sort((a, b) => (a.salePrice || a.price) - (b.salePrice || b.price));
      case "price-high": return sorted.sort((a, b) => (b.salePrice || b.price) - (a.salePrice || a.price));
      case "rating": return sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      case "name": return sorted.sort((a, b) => a.name.localeCompare(b.name));
      default: return sorted.sort((a, b) => (b.timestampCreate?.seconds || 0) - (a.timestampCreate?.seconds || 0));
    }
  }, [filteredProducts, sortBy]);

  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sortedProducts.slice(start, start + itemsPerPage);
  }, [sortedProducts, currentPage]);

  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage);
  const activeFiltersCount = selectedCategories.length + selectedBrands.length + (minRating > 0 ? 1 : 0) + (inStockOnly ? 1 : 0);

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategories([]);
    setSelectedBrands([]);
    setPriceRange([0, maxPrice]);
    setMinRating(0);
    setInStockOnly(false);
    setCurrentPage(1);
  };

  const handleQuickAddToCart = async (productId) => {
    if (!user) {
      toast.error("Please login to add items to cart");
      return;
    }
    try {
      await addToCart({ userId: user.uid, productId, quantity: 1 });
      toast.success("Added to cart!");
    } catch {
      toast.error("Failed to add to cart");
    }
  };

  if (authLoading || productsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        <div className="container mx-auto px-4 py-20 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading products...</p>
        </div>
      </div>
    );
  }

  const FilterSection = () => (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold text-lg mb-4 flex items-center justify-between">
          Filters
          {activeFiltersCount > 0 && (
            <Button size="sm" variant="light" color="danger" onClick={clearFilters}>Clear All</Button>
          )}
        </h3>
      </div>

      <div>
        <h4 className="font-semibold mb-3 text-sm uppercase text-gray-700 dark:text-gray-300">Categories</h4>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {categories?.map(cat => {
            const count = products?.filter(p => p.categoryId === cat.id).length || 0;
            return (
              <label key={cat.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer transition-colors">
                <div className="flex items-center gap-2">
                  <input type="checkbox" checked={selectedCategories.includes(cat.id)} onChange={(e) => {
                    setSelectedCategories(prev => e.target.checked ? [...prev, cat.id] : prev.filter(id => id !== cat.id));
                    setCurrentPage(1);
                  }} className="w-4 h-4 text-blue-600 rounded" />
                  <span className="text-sm">{cat.name}</span>
                </div>
                <span className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">{count}</span>
              </label>
            );
          })}
        </div>
      </div>

      <div>
        <h4 className="font-semibold mb-3 text-sm uppercase text-gray-700 dark:text-gray-300">Brands</h4>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {brands?.map(brand => {
            const count = products?.filter(p => p.brandId === brand.id).length || 0;
            return (
              <label key={brand.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer transition-colors">
                <div className="flex items-center gap-2">
                  <input type="checkbox" checked={selectedBrands.includes(brand.id)} onChange={(e) => {
                    setSelectedBrands(prev => e.target.checked ? [...prev, brand.id] : prev.filter(id => id !== brand.id));
                    setCurrentPage(1);
                  }} className="w-4 h-4 text-blue-600 rounded" />
                  <span className="text-sm">{brand.name}</span>
                </div>
                <span className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">{count}</span>
              </label>
            );
          })}
        </div>
      </div>

      <div>
        <h4 className="font-semibold mb-3 text-sm uppercase text-gray-700 dark:text-gray-300">Price Range</h4>
        <div className="px-2">
          <Slider step={1000} minValue={0} maxValue={maxPrice} value={priceRange} onChange={(value) => {
            setPriceRange(value);
            setCurrentPage(1);
          }} className="max-w-md" color="primary" />
          <div className="flex justify-between text-sm font-medium text-gray-900 dark:text-white mt-3">
            <span>Rs. {priceRange[0].toLocaleString()}</span>
            <span>Rs. {priceRange[1].toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div>
        <h4 className="font-semibold mb-3 text-sm uppercase text-gray-700 dark:text-gray-300">Rating</h4>
        <div className="space-y-1">
          {[5, 4, 3, 2, 1].map(rating => {
            const count = products?.filter(p => (p.rating || 0) >= rating).length || 0;
            return (
              <button key={rating} onClick={() => {
                setMinRating(minRating === rating ? 0 : rating);
                setCurrentPage(1);
              }} className={`flex items-center justify-between w-full p-2.5 rounded-lg transition-all ${minRating === rating ? 'bg-blue-600 text-white shadow-md' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
                <div className="flex items-center gap-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={14} className={`${i < rating ? minRating === rating ? 'text-yellow-300 fill-current' : 'text-yellow-400 fill-current' : minRating === rating ? 'text-gray-300' : 'text-gray-300'}`} />
                  ))}
                  <span className="text-sm font-medium">& Up</span>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${minRating === rating ? 'bg-white/20' : 'bg-gray-100 dark:bg-gray-700'}`}>{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
        <label className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer transition-colors">
          <span className="font-medium text-sm">In Stock Only</span>
          <input type="checkbox" checked={inStockOnly} onChange={(e) => {
            setInStockOnly(e.target.checked);
            setCurrentPage(1);
          }} className="w-5 h-5 text-blue-600 rounded" />
        </label>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />

      <div className="container mx-auto px-4 py-6">
        <Breadcrumbs className="mb-6">
          <BreadcrumbItem><Link href="/">Home</Link></BreadcrumbItem>
          <BreadcrumbItem>Shop</BreadcrumbItem>
        </Breadcrumbs>

        <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-sm p-4 sm:p-6 mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-1">Discover Products</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <span className="font-semibold text-blue-600 dark:text-blue-400">{sortedProducts.length}</span> {sortedProducts.length === 1 ? 'product' : 'products'} available
              </p>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Input placeholder="Search by name, brand, category..." value={searchTerm} onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }} startContent={<Search size={18} />} className="w-full sm:w-96" isClearable onClear={() => setSearchTerm("")} size="lg" classNames={{ input: "text-sm", inputWrapper: "bg-white dark:bg-gray-800 shadow-sm" }} />
              
              <Button isIconOnly variant="solid" color="primary" size="lg" className="lg:hidden relative shadow-md" onClick={() => setMobileFiltersOpen(true)}>
                <SlidersHorizontal size={20} />
                {activeFiltersCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold shadow-lg">{activeFiltersCount}</span>
                )}
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 whitespace-nowrap">Quick:</span>
            <Button size="sm" variant={inStockOnly ? "solid" : "flat"} color={inStockOnly ? "success" : "default"} onClick={() => {
              setInStockOnly(!inStockOnly);
              setCurrentPage(1);
            }} className="whitespace-nowrap">In Stock</Button>
            <Button size="sm" variant={minRating === 4 ? "solid" : "flat"} color={minRating === 4 ? "warning" : "default"} onClick={() => {
              setMinRating(minRating === 4 ? 0 : 4);
              setCurrentPage(1);
            }} startContent={<Star size={14} className={minRating === 4 ? "fill-current" : ""} />} className="whitespace-nowrap">4★ & Up</Button>
            <Button size="sm" variant={priceRange[1] <= 5000 ? "solid" : "flat"} color={priceRange[1] <= 5000 ? "secondary" : "default"} onClick={() => {
              setPriceRange(priceRange[1] <= 5000 ? [0, maxPrice] : [0, 5000]);
              setCurrentPage(1);
            }} className="whitespace-nowrap">Under Rs. 5000</Button>
            {categories?.slice(0, 3).map(cat => (
              <Button key={cat.id} size="sm" variant={selectedCategories.includes(cat.id) ? "solid" : "flat"} color={selectedCategories.includes(cat.id) ? "primary" : "default"} onClick={() => {
                setSelectedCategories(prev => prev.includes(cat.id) ? prev.filter(id => id !== cat.id) : [...prev, cat.id]);
                setCurrentPage(1);
              }} className="whitespace-nowrap">{cat.name}</Button>
            ))}
          </div>
        </div>

        {activeFiltersCount > 0 && (
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Active:</span>
            {selectedCategories.map(catId => {
              const cat = categories?.find(c => c.id === catId);
              return cat ? <Chip key={catId} onClose={() => setSelectedCategories(prev => prev.filter(id => id !== catId))} color="primary" variant="flat" size="sm">{cat.name}</Chip> : null;
            })}
            {selectedBrands.map(brandId => {
              const brand = brands?.find(b => b.id === brandId);
              return brand ? <Chip key={brandId} onClose={() => setSelectedBrands(prev => prev.filter(id => id !== brandId))} color="secondary" variant="flat" size="sm">{brand.name}</Chip> : null;
            })}
            {minRating > 0 && <Chip onClose={() => setMinRating(0)} color="warning" variant="flat" size="sm">{minRating}★ & Up</Chip>}
            {inStockOnly && <Chip onClose={() => setInStockOnly(false)} color="success" variant="flat" size="sm">In Stock</Chip>}
            <Button size="sm" variant="light" color="danger" onClick={clearFilters} className="ml-2">Clear All</Button>
          </div>
        )}

        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <Button variant="flat" size="sm" startContent={<SlidersHorizontal size={16} />} onClick={() => setShowFilters(!showFilters)} className="hidden lg:flex">{showFilters ? 'Hide' : 'Show'} Filters</Button>
            <div className="hidden sm:flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
              <Button isIconOnly variant={viewMode === "grid" ? "solid" : "light"} onClick={() => setViewMode("grid")} size="sm" color={viewMode === "grid" ? "primary" : "default"}><Grid3x3 size={16} /></Button>
              <Button isIconOnly variant={viewMode === "list" ? "solid" : "light"} onClick={() => setViewMode("list")} size="sm" color={viewMode === "list" ? "primary" : "default"}><List size={16} /></Button>
            </div>
          </div>

          <Select selectedKeys={[sortBy]} onChange={(e) => setSortBy(e.target.value)} className="w-48" size="sm" variant="bordered">
            <SelectItem key="newest">Newest First</SelectItem>
            <SelectItem key="price-low">Price: Low to High</SelectItem>
            <SelectItem key="price-high">Price: High to Low</SelectItem>
            <SelectItem key="rating">Top Rated</SelectItem>
            <SelectItem key="name">A to Z</SelectItem>
          </Select>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {showFilters && (
            <motion.aside initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="hidden lg:block">
              <div className="sticky top-6">
                <Card className="shadow-md"><CardBody className="p-6"><FilterSection /></CardBody></Card>
              </div>
            </motion.aside>
          )}

          <main className={showFilters ? "lg:col-span-3" : "lg:col-span-4"}>
            {isFiltering ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="shadow-md">
                    <CardBody className="p-0">
                      <div className="aspect-square bg-gray-200 dark:bg-gray-700 animate-pulse" />
                      <div className="p-4 space-y-3">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3 animate-pulse" />
                        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2 animate-pulse" />
                      </div>
                    </CardBody>
                  </Card>
                ))}
              </div>
            ) : paginatedProducts.length > 0 ? (
              <>
                <motion.div layout className={viewMode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
                  <AnimatePresence mode="popLayout">
                    {paginatedProducts.map((product, index) => (
                      <motion.div key={product.id} layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3, delay: index * 0.05 }}>
                        <ProductCard product={product} />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </motion.div>

                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-2 mt-12">
                    <Button variant="bordered" isDisabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)}>Previous</Button>
                    <div className="flex gap-1">
                      {[...Array(Math.min(totalPages, 5))].map((_, i) => {
                        let pageNum = totalPages <= 5 ? i + 1 : currentPage <= 3 ? i + 1 : currentPage >= totalPages - 2 ? totalPages - 4 + i : currentPage - 2 + i;
                        return <Button key={i} variant={currentPage === pageNum ? "solid" : "flat"} color={currentPage === pageNum ? "primary" : "default"} onClick={() => setCurrentPage(pageNum)} className="min-w-10">{pageNum}</Button>;
                      })}
                    </div>
                    <Button variant="bordered" isDisabled={currentPage === totalPages} onClick={() => setCurrentPage(currentPage + 1)}>Next</Button>
                  </div>
                )}
              </>
            ) : (
              <Card className="shadow-md">
                <CardBody className="p-12 text-center">
                  <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search size={40} className="text-gray-400" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">No products found</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">We couldn't find any products matching your criteria. Try adjusting your filters or search terms.</p>
                  <div className="flex gap-3 justify-center">
                    <Button color="primary" onClick={clearFilters} size="lg">Clear All Filters</Button>
                    <Button variant="bordered" onClick={() => setSearchTerm("")} size="lg">Clear Search</Button>
                  </div>
                </CardBody>
              </Card>
            )}
          </main>
        </div>
      </div>

      <Modal isOpen={mobileFiltersOpen} onClose={() => setMobileFiltersOpen(false)} size="full" scrollBehavior="inside">
        <ModalContent>
          <ModalHeader className="flex items-center justify-between">
            <span>Filters</span>
            {activeFiltersCount > 0 && <Chip size="sm" color="primary">{activeFiltersCount} active</Chip>}
          </ModalHeader>
          <ModalBody><FilterSection /></ModalBody>
          <ModalFooter className="flex justify-between">
            <Button variant="light" color="danger" onClick={clearFilters}>Clear All</Button>
            <div className="flex gap-2">
              <Button variant="light" onClick={() => setMobileFiltersOpen(false)}>Cancel</Button>
              <Button color="primary" onClick={() => setMobileFiltersOpen(false)}>Show {sortedProducts.length} Products</Button>
            </div>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal isOpen={isOpen} onClose={onClose} size="3xl" backdrop="blur">
        <ModalContent>
          {quickViewProduct && (
            <>
              <ModalHeader className="flex flex-col gap-1">
                <h3 className="text-xl font-bold">{quickViewProduct.name}</h3>
                <p className="text-sm text-gray-500 font-normal">{quickViewProduct.brandName || 'Generic'}</p>
              </ModalHeader>
              <ModalBody>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800">
                    <img src={quickViewProduct.imageURLs?.[0] || quickViewProduct.imageURL} alt={quickViewProduct.name} className="w-full h-full object-contain" />
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      {[...Array(5)].map((_, i) => <Star key={i} size={18} className={i < (quickViewProduct.rating || 0) ? 'text-yellow-400 fill-current' : 'text-gray-300'} />)}
                      <span className="text-sm font-medium">({quickViewProduct.reviewCount || 0})</span>
                    </div>
                    <div>
                      <span className="text-3xl font-bold">Rs. {(quickViewProduct.salePrice || quickViewProduct.price).toLocaleString()}</span>
                      {quickViewProduct.salePrice && <span className="text-lg text-gray-500 line-through ml-2">Rs. {quickViewProduct.price.toLocaleString()}</span>}
                    </div>
                    <p className="text-gray-600 dark:text-gray-400">{quickViewProduct.description}</p>
                  </div>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onClick={onClose}>Close</Button>
                <Button as={Link} href={`/product/${quickViewProduct.id}`} variant="bordered" startContent={<Eye size={16} />} onClick={onClose}>Full Details</Button>
                <Button color="primary" startContent={<ShoppingCart size={16} />} onClick={() => { handleQuickAddToCart(quickViewProduct.id); onClose(); }} isDisabled={quickViewProduct.stock === 0}>Add to Cart</Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
