"use client";
import { deleteProduct } from "@/lib/firestore/products/write";
import { useProducts } from "@/lib/firestore/products/read";
import { useCategories } from "@/lib/firestore/categories/read";
import { useBrands } from "@/lib/firestore/brands/read";
import { Button, CircularProgress, Chip } from "@heroui/react";
import { Edit2, Trash2, Package } from "lucide-react";
import { useState, useMemo } from "react";
import toast from "react-hot-toast";

export default function ProductListView({ onEdit }) {
    const { data: products, error, isLoading } = useProducts();
    const { data: categories } = useCategories();
    const { data: brands } = useBrands();

    const productsWithDetails = useMemo(() => {
        if (!products) return [];
        return products.map(product => ({
            ...product,
            categoryName: categories?.find(c => c.id === product.categoryId)?.name || 'N/A',
            brandName: brands?.find(b => b.id === product.brandId)?.name || 'N/A'
        }));
    }, [products, categories, brands]);

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
        <div className="flex-1 flex flex-col gap-3 px-5 rounded-xl">
            <h1 className="text-xl">Products</h1>
            <div className="overflow-x-auto">
                <table className="w-full border-separate border-spacing-y-3">
                    <thead>
                        <tr>
                            <th className="font-semibold border-y bg-white dark:bg-gray-800 px-3 py-2 border-r rounded-l-lg">SN</th>
                            <th className="font-semibold border-y bg-white dark:bg-gray-800 px-3 py-2">Image</th>
                            <th className="font-semibold border-y bg-white dark:bg-gray-800 px-3 py-2 text-left">Name</th>
                            <th className="font-semibold border-y bg-white dark:bg-gray-800 px-3 py-2 text-left">Category</th>
                            <th className="font-semibold border-y bg-white dark:bg-gray-800 px-3 py-2 text-left">Brand</th>
                            <th className="font-semibold border-y bg-white dark:bg-gray-800 px-3 py-2 text-right">Price</th>
                            <th className="font-semibold border-y bg-white dark:bg-gray-800 px-3 py-2 text-center">Stock</th>
                            <th className="font-semibold border-y bg-white dark:bg-gray-800 px-3 py-2 border-r rounded-r-lg">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {productsWithDetails?.map((item, index) => (
                            <Row index={index} item={item} key={item.id} onEdit={onEdit} />
                        ))}
                    </tbody>
                </table>
            </div>
            
            {productsWithDetails?.length === 0 && (
                <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl">
                    <Package className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                    <p className="text-gray-500">No products found</p>
                </div>
            )}
        </div>
    );
}

function Row({ item, index, onEdit }) {
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this product?")) return;
        setIsDeleting(true);

        try {
            await deleteProduct({ id: item?.id });
            toast.success("Product deleted successfully");
        } catch (error) {
            toast.error(error?.message || "Error deleting product");
        }

        setIsDeleting(false);
    };

    const getStockStatus = () => {
        if (item.stock === 0) return { color: "danger", text: "Out of Stock" };
        if (item.stock <= 10) return { color: "warning", text: "Low Stock" };
        return { color: "success", text: "In Stock" };
    };

    const stockStatus = getStockStatus();

    return (
        <tr>
            <td className="border-y bg-white dark:bg-gray-800 px-3 py-2 border-r rounded-l-lg text-center">
                {index + 1}
            </td>
            <td className="border-y bg-white dark:bg-gray-800 px-3 py-2">
                <div className="flex justify-center">
                    <img 
                        className="h-12 w-12 object-cover rounded-lg" 
                        src={item?.imageURLs?.[0] || item?.imageURL || 'https://via.placeholder.com/100'} 
                        alt={item?.name}
                        onError={(e) => { e.target.src = 'https://via.placeholder.com/100'; }}
                    />
                </div>
            </td>
            <td className="border-y bg-white dark:bg-gray-800 px-3 py-2 font-medium">{item?.name}</td>
            <td className="border-y bg-white dark:bg-gray-800 px-3 py-2">
                <Chip size="sm" variant="flat">{item?.categoryName}</Chip>
            </td>
            <td className="border-y bg-white dark:bg-gray-800 px-3 py-2">
                <Chip size="sm" variant="flat">{item?.brandName}</Chip>
            </td>
            <td className="border-y bg-white dark:bg-gray-800 px-3 py-2 text-right font-semibold">
                Rs. {item?.price?.toFixed(2) || '0.00'}
            </td>
            <td className="border-y bg-white dark:bg-gray-800 px-3 py-2 text-center">
                <Chip size="sm" color={stockStatus.color} variant="flat">
                    {item?.stock || 0}
                </Chip>
            </td>
            <td className="border-y bg-white dark:bg-gray-800 px-3 py-2 border-r rounded-r-lg">
                <div className="flex gap-2 items-center">
                    <Button
                        onClick={handleDelete}
                        isLoading={isDeleting}
                        isDisabled={isDeleting}
                        isIconOnly
                        size="sm"
                        color="danger"
                    >
                        <Trash2 size={13} />
                    </Button>

                    <Button 
                        onClick={() => onEdit(item)}
                        isIconOnly 
                        size="sm"
                        color="primary"
                    >
                        <Edit2 size={13} />
                    </Button>
                </div>
            </td>
        </tr>
    );
}
