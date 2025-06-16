"use client";

import { createNewProduct, updateProduct } from "@/lib/firestore/products/write";
import { useCategories } from "@/lib/firestore/categories/read";
import { useBrands } from "@/lib/firestore/brands/read";
import { Button, Select, SelectItem, Textarea } from "@heroui/react";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";

export default function ProductForm({ productToEdit = null, onSuccess }) {
    const [data, setData] = useState(null);
    const [images, setImages] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    
    const { data: categories } = useCategories();
    const { data: brands } = useBrands();

    useEffect(() => {
        if (productToEdit) {
            setData(productToEdit);
        }
    }, [productToEdit]);

    const handleData = (key, value) => {
        setData((preData) => ({
            ...(preData ?? {}),
            [key]: value,
        }));
    };

    const handleSubmit = async () => {
        setIsLoading(true);
        try {
            if (productToEdit) {
                await updateProduct({ 
                    id: productToEdit.id, 
                    data: data, 
                    newImages: images 
                });
                toast.success("Product updated successfully");
            } else {
                await createNewProduct({ data: data, images: images });
                toast.success("Product created successfully");
            }

            // Reset form
            setData(null);
            setImages([]);
            document.getElementById("product-images").value = null;
            
            if (onSuccess) onSuccess();
        } catch (error) {
            toast.error(error?.message || "An error occurred");
        }
        setIsLoading(false);
    };

    return (
        <div className="flex flex-col gap-4 bg-white rounded-xl p-6 w-full max-w-2xl">
            <h1 className="font-semibold text-xl">
                {productToEdit ? "Update Product" : "Create Product"}
            </h1>
            
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    handleSubmit();
                }}
                className="flex flex-col gap-4"
            >
                {/* Images */}
                <div className="flex flex-col gap-2">
                    <label className="text-gray-500 text-sm">
                        Images <span className="text-red-500">*</span>
                    </label>
                    {images.length > 0 && (
                        <div className="flex gap-2 flex-wrap">
                            {Array.from(images).map((image, index) => (
                                <img 
                                    key={index}
                                    className="h-20 w-20 object-cover rounded-lg" 
                                    src={URL.createObjectURL(image)} 
                                    alt={`Preview ${index + 1}`} 
                                />
                            ))}
                        </div>
                    )}
                    {productToEdit?.imageURLs && (
                        <div className="flex gap-2 flex-wrap">
                            {productToEdit.imageURLs.map((url, index) => (
                                <img 
                                    key={index}
                                    className="h-20 w-20 object-cover rounded-lg" 
                                    src={url} 
                                    alt={`Current ${index + 1}`} 
                                />
                            ))}
                        </div>
                    )}
                    <input
                        onChange={(e) => {
                            if (e.target.files.length > 0) {
                                setImages(Array.from(e.target.files));
                            }
                        }}
                        id="product-images"
                        name="product-images"
                        type="file"
                        multiple
                        accept="image/*"
                        className="border px-4 py-2 rounded-lg w-full focus:outline-none"
                    />
                </div>

                {/* Name */}
                <div className="flex flex-col gap-2">
                    <label className="text-gray-500 text-sm">
                        Name <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        placeholder="Enter Product Name"
                        value={data?.name ?? ""}
                        onChange={(e) => handleData("name", e.target.value)}
                        className="border px-4 py-2 rounded-lg w-full focus:outline-none"
                        required
                    />
                </div>

                {/* Description */}
                <div className="flex flex-col gap-2">
                    <label className="text-gray-500 text-sm">Description</label>
                    <Textarea
                        placeholder="Enter Product Description"
                        value={data?.description ?? ""}
                        onChange={(e) => handleData("description", e.target.value)}
                        className="w-full"
                    />
                </div>

                {/* Category */}
                <div className="flex flex-col gap-2">
                    <label className="text-gray-500 text-sm">
                        Category <span className="text-red-500">*</span>
                    </label>
                    <Select
                        placeholder="Select Category"
                        selectedKeys={data?.categoryId ? [data.categoryId] : []}
                        onSelectionChange={(keys) => {
                            const selectedKey = Array.from(keys)[0];
                            handleData("categoryId", selectedKey);
                        }}
                    >
                        {categories?.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                                {category.name}
                            </SelectItem>
                        ))}
                    </Select>
                </div>

                {/* Brand */}
                <div className="flex flex-col gap-2">
                    <label className="text-gray-500 text-sm">Brand</label>
                    <Select
                        placeholder="Select Brand"
                        selectedKeys={data?.brandId ? [data.brandId] : []}
                        onSelectionChange={(keys) => {
                            const selectedKey = Array.from(keys)[0];
                            handleData("brandId", selectedKey);
                        }}
                    >
                        {brands?.map((brand) => (
                            <SelectItem key={brand.id} value={brand.id}>
                                {brand.name}
                            </SelectItem>
                        ))}
                    </Select>
                </div>

                {/* Price and Sale Price */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                        <label className="text-gray-500 text-sm">
                            Price <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            value={data?.price ?? ""}
                            onChange={(e) => handleData("price", e.target.value)}
                            className="border px-4 py-2 rounded-lg w-full focus:outline-none"
                            required
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-gray-500 text-sm">Sale Price</label>
                        <input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            value={data?.salePrice ?? ""}
                            onChange={(e) => handleData("salePrice", e.target.value)}
                            className="border px-4 py-2 rounded-lg w-full focus:outline-none"
                        />
                    </div>
                </div>

                {/* Stock and Status */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                        <label className="text-gray-500 text-sm">Stock</label>
                        <input
                            type="number"
                            placeholder="0"
                            value={data?.stock ?? ""}
                            onChange={(e) => handleData("stock", e.target.value)}
                            className="border px-4 py-2 rounded-lg w-full focus:outline-none"
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-gray-500 text-sm">Status</label>
                        <Select
                            placeholder="Select Status"
                            selectedKeys={data?.status ? [data.status] : ["active"]}
                            onSelectionChange={(keys) => {
                                const selectedKey = Array.from(keys)[0];
                                handleData("status", selectedKey);
                            }}
                        >
                            <SelectItem key="active" value="active">Active</SelectItem>
                            <SelectItem key="inactive" value="inactive">Inactive</SelectItem>
                            <SelectItem key="draft" value="draft">Draft</SelectItem>
                        </Select>
                    </div>
                </div>

                <Button 
                    isLoading={isLoading} 
                    isDisabled={isLoading} 
                    type="submit"
                    color="primary"
                    className="w-full"
                >
                    {productToEdit ? "Update Product" : "Create Product"}
                </Button>
            </form>
        </div>
    );
}