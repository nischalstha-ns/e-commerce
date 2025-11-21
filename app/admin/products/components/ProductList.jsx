"use client";

import { deleteProduct } from "@/lib/firestore/products/write";
import { useProducts } from "@/lib/firestore/products/read";
import { useCategories } from "@/lib/firestore/categories/read";
import { useBrands } from "@/lib/firestore/brands/read";
import { Button, CircularProgress, Select, SelectItem, Input, Chip } from "@heroui/react";
import { Edit2, Trash2, Search } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

export default function ProductList({ onEdit }) {
    const [filters, setFilters] = useState({});
    const [searchTerm, setSearchTerm] = useState("");
    
    const { data: products, error, isLoading } = useProducts(filters);
    
    console.log('ProductList Debug:', {
        products: products?.length || 0,
        error,
        isLoading,
        filters
    });
    const { data: categories } = useCategories();
    const { data: brands } = useBrands();

    // Filter products by search term
    const filteredProducts = products?.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

    if (isLoading) {
        return (
            <div className="flex justify-center p-8">
                <CircularProgress />
            </div>
        );
    }

    if (error) {
        return <div className="text-red-500 p-4">Error: {error}</div>;
    }

    return (
        <div className="flex flex-col gap-4 bg-white dark:bg-[#1a1a1a] rounded-xl p-3 md:p-6 theme-transition">
            {/* Search */}
            <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                startContent={<Search size={16} />}
                className="w-full"
                classNames={{
                    input: "dark:text-white",
                    inputWrapper: "dark:bg-[#242424] dark:border-[#3a3a3a]"
                }}
            />

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-4">
                <Select
                    placeholder="All Categories"
                    className="w-full"
                    selectedKeys={filters.category ? [filters.category] : []}
                    onSelectionChange={(keys) => {
                        const selectedKey = Array.from(keys)[0];
                        setFilters(prev => ({ ...prev, category: selectedKey || undefined }));
                    }}
                    classNames={{
                        trigger: "dark:bg-[#242424] dark:border-[#3a3a3a]",
                        value: "dark:text-white"
                    }}
                >
                    {categories?.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                            {category.name}
                        </SelectItem>
                    ))}
                </Select>

                <Select
                    placeholder="All Brands"
                    className="w-full"
                    selectedKeys={filters.brand ? [filters.brand] : []}
                    onSelectionChange={(keys) => {
                        const selectedKey = Array.from(keys)[0];
                        setFilters(prev => ({ ...prev, brand: selectedKey || undefined }));
                    }}
                    classNames={{
                        trigger: "dark:bg-[#242424] dark:border-[#3a3a3a]",
                        value: "dark:text-white"
                    }}
                >
                    {brands?.map((brand) => (
                        <SelectItem key={brand.id} value={brand.id}>
                            {brand.name}
                        </SelectItem>
                    ))}
                </Select>

                <Select
                    placeholder="All Status"
                    className="w-full"
                    selectedKeys={filters.status ? [filters.status] : []}
                    onSelectionChange={(keys) => {
                        const selectedKey = Array.from(keys)[0];
                        setFilters(prev => ({ ...prev, status: selectedKey || undefined }));
                    }}
                    classNames={{
                        trigger: "dark:bg-[#242424] dark:border-[#3a3a3a]",
                        value: "dark:text-white"
                    }}
                >
                    <SelectItem key="active" value="active">Active</SelectItem>
                    <SelectItem key="inactive" value="inactive">Inactive</SelectItem>
                    <SelectItem key="draft" value="draft">Draft</SelectItem>
                </Select>
            </div>

            {/* Mobile Cards View */}
            <div className="md:hidden space-y-3">
                {filteredProducts.map((product) => (
                    <ProductCard 
                        key={product.id} 
                        product={product} 
                        categories={categories}
                        onEdit={onEdit}
                    />
                ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
                <table className="w-full border-separate border-spacing-y-2">
                    <thead>
                        <tr className="bg-gray-50 dark:bg-[#242424]">
                            <th className="px-4 py-3 text-left rounded-l-lg dark:text-gray-300">Image</th>
                            <th className="px-4 py-3 text-left dark:text-gray-300">Name</th>
                            <th className="px-4 py-3 text-left dark:text-gray-300">Category</th>
                            <th className="px-4 py-3 text-left dark:text-gray-300">Price</th>
                            <th className="px-4 py-3 text-left dark:text-gray-300">Stock</th>
                            <th className="px-4 py-3 text-left dark:text-gray-300">Sizes</th>
                            <th className="px-4 py-3 text-left dark:text-gray-300">Colors</th>
                            <th className="px-4 py-3 text-left dark:text-gray-300">Status</th>
                            <th className="px-4 py-3 text-left rounded-r-lg dark:text-gray-300">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredProducts.map((product) => (
                            <ProductRow 
                                key={product.id} 
                                product={product} 
                                categories={categories}
                                onEdit={onEdit}
                            />
                        ))}
                    </tbody>
                </table>
            </div>

            {filteredProducts.length === 0 && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    {products?.length === 0 ? 
                        "No products available. Create your first product." :
                        "No products match your search criteria."
                    }
                    <div className="text-xs text-gray-400 mt-2">
                        Total products: {products?.length || 0}
                    </div>
                </div>
            )}
        </div>
    );
}

function ProductCard({ product, categories, onEdit }) {
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        if (!confirm("Delete this product?")) return;
        
        setIsDeleting(true);
        try {
            await deleteProduct({ id: product.id });
            toast.success("Product deleted");
        } catch (error) {
            toast.error(error?.message || "Error deleting product");
        }
        setIsDeleting(false);
    };

    const category = categories?.find(c => c.id === product.categoryId);
    const displayPrice = product.salePrice ? product.salePrice : product.price;
    const hasDiscount = product.salePrice && product.salePrice < product.price;

    return (
        <div className="bg-white dark:bg-[#242424] rounded-lg p-3 shadow-sm border border-gray-100 dark:border-[#3a3a3a] theme-transition">
            <div className="flex gap-3">
                <img 
                    src={product.imageURLs?.[0]} 
                    alt={product.name}
                    className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 dark:text-white truncate">{product.name}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{category?.name || "N/A"}</p>
                    
                    <div className="flex items-center gap-2 mb-2">
                        <span className="font-bold text-blue-600 dark:text-blue-400">Rs. {displayPrice}</span>
                        {hasDiscount && (
                            <span className="text-xs text-gray-500 line-through">Rs. {product.price}</span>
                        )}
                    </div>
                    
                    <div className="flex items-center gap-2 flex-wrap">
                        <Chip 
                            size="sm" 
                            className={`${
                                product.stock > 10 ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                                product.stock > 0 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                                'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                            }`}
                        >
                            Stock: {product.stock || 0}
                        </Chip>
                        <Chip 
                            size="sm" 
                            className={`capitalize ${
                                product.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                                product.status === 'inactive' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                                'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                            }`}
                        >
                            {product.status}
                        </Chip>
                    </div>
                </div>
            </div>
            
            {(product.sizes?.length > 0 || product.colors?.length > 0) && (
                <div className="mt-3 pt-3 border-t border-gray-100 dark:border-[#3a3a3a] space-y-2">
                    {product.sizes?.length > 0 && (
                        <div className="flex gap-1 flex-wrap">
                            <span className="text-xs text-gray-500 dark:text-gray-400 mr-1">Sizes:</span>
                            {product.sizes.slice(0, 4).map((size, index) => (
                                <Chip key={index} size="sm" variant="flat" color="primary">
                                    {size}
                                </Chip>
                            ))}
                            {product.sizes.length > 4 && (
                                <Chip size="sm" variant="flat">+{product.sizes.length - 4}</Chip>
                            )}
                        </div>
                    )}
                    {product.colors?.length > 0 && (
                        <div className="flex gap-1 flex-wrap">
                            <span className="text-xs text-gray-500 dark:text-gray-400 mr-1">Colors:</span>
                            {product.colors.slice(0, 4).map((color, index) => (
                                <Chip key={index} size="sm" variant="flat" color="secondary">
                                    {color}
                                </Chip>
                            ))}
                            {product.colors.length > 4 && (
                                <Chip size="sm" variant="flat">+{product.colors.length - 4}</Chip>
                            )}
                        </div>
                    )}
                </div>
            )}
            
            <div className="flex gap-2 mt-3">
                <Button
                    onClick={() => onEdit(product)}
                    size="sm"
                    className="flex-1 bg-blue-600 text-white hover:bg-blue-700"
                    startContent={<Edit2 size={14} />}
                >
                    Edit
                </Button>
                <Button
                    onClick={handleDelete}
                    isLoading={isDeleting}
                    isDisabled={isDeleting}
                    size="sm"
                    color="danger"
                    variant="flat"
                    isIconOnly
                >
                    <Trash2 size={14} />
                </Button>
            </div>
        </div>
    );
}

function ProductRow({ product, categories, onEdit }) {
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this product?")) return;
        
        setIsDeleting(true);
        try {
            await deleteProduct({ id: product.id });
            toast.success("Product deleted successfully");
        } catch (error) {
            toast.error(error?.message || "Error deleting product");
        }
        setIsDeleting(false);
    };

    const category = categories?.find(c => c.id === product.categoryId);
    const displayPrice = product.salePrice ? product.salePrice : product.price;
    const hasDiscount = product.salePrice && product.salePrice < product.price;

    return (
        <tr className="bg-white dark:bg-[#242424] shadow-sm theme-transition">
            <td className="px-4 py-3 rounded-l-lg">
                <img 
                    src={product.imageURLs?.[0]} 
                    alt={product.name}
                    className="w-12 h-12 object-cover rounded-lg"
                />
            </td>
            <td className="px-4 py-3">
                <div>
                    <p className="font-medium dark:text-white">{product.name}</p>
                    {product.description && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">
                            {product.description}
                        </p>
                    )}
                </div>
            </td>
            <td className="px-4 py-3 dark:text-gray-300">{category?.name || "N/A"}</td>
            <td className="px-4 py-3">
                <div className="flex flex-col">
                    <span className="font-medium">Rs. {displayPrice}</span>
                    {hasDiscount && (
                        <span className="text-sm text-gray-500 line-through">
                            Rs. {product.price}
                        </span>
                    )}
                </div>
            </td>
            <td className="px-4 py-3">
                <span className={`px-2 py-1 rounded-full text-xs ${
                    product.stock > 10 ? 'bg-green-100 text-green-800' :
                    product.stock > 0 ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                }`}>
                    {product.stock || 0}
                </span>
            </td>
            <td className="px-4 py-3">
                <div className="flex gap-1 flex-wrap max-w-32">
                    {product.sizes?.slice(0, 3).map((size, index) => (
                        <Chip key={index} size="sm" variant="flat" color="primary">
                            {size}
                        </Chip>
                    ))}
                    {product.sizes?.length > 3 && (
                        <Chip size="sm" variant="flat" color="default">
                            +{product.sizes.length - 3}
                        </Chip>
                    )}
                </div>
            </td>
            <td className="px-4 py-3">
                <div className="flex gap-1 flex-wrap max-w-32">
                    {product.colors?.slice(0, 3).map((color, index) => (
                        <Chip key={index} size="sm" variant="flat" color="secondary">
                            {color}
                        </Chip>
                    ))}
                    {product.colors?.length > 3 && (
                        <Chip size="sm" variant="flat" color="default">
                            +{product.colors.length - 3}
                        </Chip>
                    )}
                </div>
            </td>
            <td className="px-4 py-3">
                <span className={`px-2 py-1 rounded-full text-xs capitalize ${
                    product.status === 'active' ? 'bg-green-100 text-green-800' :
                    product.status === 'inactive' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                }`}>
                    {product.status}
                </span>
            </td>
            <td className="px-4 py-3 rounded-r-lg">
                <div className="flex gap-2">
                    <Button
                        onClick={() => onEdit(product)}
                        isIconOnly
                        size="sm"
                        variant="light"
                    >
                        <Edit2 size={16} />
                    </Button>
                    <Button
                        onClick={handleDelete}
                        isLoading={isDeleting}
                        isDisabled={isDeleting}
                        isIconOnly
                        size="sm"
                        color="danger"
                        variant="light"
                    >
                        <Trash2 size={16} />
                    </Button>
                </div>
            </td>
        </tr>
    );
}