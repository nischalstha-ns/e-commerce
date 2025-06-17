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
        <div className="flex flex-col gap-4 bg-white rounded-xl p-6">
            <div className="flex justify-between items-center">
                <h1 className="text-xl font-semibold">Products</h1>
                <div className="flex gap-2">
                    <Input
                        placeholder="Search products..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        startContent={<Search size={16} />}
                        className="w-64"
                    />
                </div>
            </div>

            {/* Filters */}
            <div className="flex gap-4 flex-wrap">
                <Select
                    placeholder="All Categories"
                    className="w-48"
                    selectedKeys={filters.category ? [filters.category] : []}
                    onSelectionChange={(keys) => {
                        const selectedKey = Array.from(keys)[0];
                        setFilters(prev => ({ ...prev, category: selectedKey || undefined }));
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
                    className="w-48"
                    selectedKeys={filters.brand ? [filters.brand] : []}
                    onSelectionChange={(keys) => {
                        const selectedKey = Array.from(keys)[0];
                        setFilters(prev => ({ ...prev, brand: selectedKey || undefined }));
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
                    className="w-48"
                    selectedKeys={filters.status ? [filters.status] : []}
                    onSelectionChange={(keys) => {
                        const selectedKey = Array.from(keys)[0];
                        setFilters(prev => ({ ...prev, status: selectedKey || undefined }));
                    }}
                >
                    <SelectItem key="active" value="active">Active</SelectItem>
                    <SelectItem key="inactive" value="inactive">Inactive</SelectItem>
                    <SelectItem key="draft" value="draft">Draft</SelectItem>
                </Select>
            </div>

            {/* Products Table */}
            <div className="overflow-x-auto">
                <table className="w-full border-separate border-spacing-y-2">
                    <thead>
                        <tr className="bg-gray-50">
                            <th className="px-4 py-3 text-left rounded-l-lg">Image</th>
                            <th className="px-4 py-3 text-left">Name</th>
                            <th className="px-4 py-3 text-left">Category</th>
                            <th className="px-4 py-3 text-left">Price</th>
                            <th className="px-4 py-3 text-left">Stock</th>
                            <th className="px-4 py-3 text-left">Sizes</th>
                            <th className="px-4 py-3 text-left">Colors</th>
                            <th className="px-4 py-3 text-left">Status</th>
                            <th className="px-4 py-3 text-left rounded-r-lg">Actions</th>
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
                <div className="text-center py-8 text-gray-500">
                    No products found
                </div>
            )}
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
        <tr className="bg-white shadow-sm">
            <td className="px-4 py-3 rounded-l-lg">
                <img 
                    src={product.imageURLs?.[0]} 
                    alt={product.name}
                    className="w-12 h-12 object-cover rounded-lg"
                />
            </td>
            <td className="px-4 py-3">
                <div>
                    <p className="font-medium">{product.name}</p>
                    {product.description && (
                        <p className="text-sm text-gray-500 truncate max-w-xs">
                            {product.description}
                        </p>
                    )}
                </div>
            </td>
            <td className="px-4 py-3">{category?.name || "N/A"}</td>
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