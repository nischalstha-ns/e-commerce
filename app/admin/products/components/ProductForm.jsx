"use client";

import { createNewProduct, updateProduct } from "@/lib/firestore/products/write";
import { useCategories } from "@/lib/firestore/categories/read";
import { useBrands } from "@/lib/firestore/brands/read";
import { Button, Select, SelectItem, Textarea, Chip } from "@heroui/react";
import { useState, useEffect } from "react";
import { X, Plus } from "lucide-react";
import toast from "react-hot-toast";

const predefinedSizes = ["M", "L", "XL", "2XL", "3XL", "4XL", "5XL", "6XL", "16", "18", "20", "22", "24", "26", "28", "30", "32", "34", "36", "38"];
const predefinedColors = ["Red", "Blue", "Green", "Yellow", "Black", "White", "Gray", "Pink", "Purple", "Orange", "Brown", "Navy", "Beige", "Maroon"];

export default function ProductForm({ productToEdit = null, onSuccess }) {
    const [data, setData] = useState(null);
    const [images, setImages] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedSizes, setSelectedSizes] = useState([]);
    const [selectedColors, setSelectedColors] = useState([]);
    const [customSize, setCustomSize] = useState("");
    const [customColor, setCustomColor] = useState("");
    
    const { data: categories } = useCategories();
    const { data: brands } = useBrands();

    useEffect(() => {
        if (productToEdit) {
            setData(productToEdit);
            setSelectedSizes(productToEdit.sizes || []);
            setSelectedColors(productToEdit.colors || []);
        }
    }, [productToEdit]);

    const handleData = (key, value) => {
        setData((preData) => ({
            ...(preData ?? {}),
            [key]: value,
        }));
    };

    const addSize = (size) => {
        if (size && !selectedSizes.includes(size)) {
            setSelectedSizes([...selectedSizes, size]);
        }
    };

    const removeSize = (sizeToRemove) => {
        setSelectedSizes(selectedSizes.filter(size => size !== sizeToRemove));
    };

    const addCustomSize = () => {
        if (customSize.trim() && !selectedSizes.includes(customSize.trim())) {
            setSelectedSizes([...selectedSizes, customSize.trim()]);
            setCustomSize("");
        }
    };

    const addColor = (color) => {
        if (color && !selectedColors.includes(color)) {
            setSelectedColors([...selectedColors, color]);
        }
    };

    const removeColor = (colorToRemove) => {
        setSelectedColors(selectedColors.filter(color => color !== colorToRemove));
    };

    const addCustomColor = () => {
        if (customColor.trim() && !selectedColors.includes(customColor.trim())) {
            setSelectedColors([...selectedColors, customColor.trim()]);
            setCustomColor("");
        }
    };

    const handleSubmit = async () => {
        setIsLoading(true);
        try {
            const productData = {
                ...data,
                sizes: selectedSizes,
                colors: selectedColors
            };

            if (productToEdit) {
                await updateProduct({ 
                    id: productToEdit.id, 
                    data: productData, 
                    newImages: images 
                });
                toast.success("Product updated successfully");
            } else {
                await createNewProduct({ data: productData, images: images });
                toast.success("Product created successfully");
            }

            // Reset form
            setData(null);
            setImages([]);
            setSelectedSizes([]);
            setSelectedColors([]);
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

                {/* Sizes */}
                <div className="flex flex-col gap-2">
                    <label className="text-gray-500 text-sm">Sizes</label>
                    
                    {/* Selected Sizes */}
                    {selectedSizes.length > 0 && (
                        <div className="flex gap-2 flex-wrap mb-2">
                            {selectedSizes.map((size, index) => (
                                <Chip
                                    key={index}
                                    onClose={() => removeSize(size)}
                                    variant="flat"
                                    color="primary"
                                >
                                    {size}
                                </Chip>
                            ))}
                        </div>
                    )}

                    {/* Predefined Sizes */}
                    <div className="flex gap-2 flex-wrap mb-2">
                        {predefinedSizes.map((size) => (
                            <Button
                                key={size}
                                size="sm"
                                variant={selectedSizes.includes(size) ? "solid" : "bordered"}
                                color={selectedSizes.includes(size) ? "primary" : "default"}
                                onClick={() => addSize(size)}
                                type="button"
                            >
                                {size}
                            </Button>
                        ))}
                    </div>

                    {/* Custom Size Input */}
                    <div className="flex gap-2">
                        <input
                            type="text"
                            placeholder="Enter custom size"
                            value={customSize}
                            onChange={(e) => setCustomSize(e.target.value)}
                            className="border px-3 py-2 rounded-lg flex-1 focus:outline-none text-sm"
                            onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    addCustomSize();
                                }
                            }}
                        />
                        <Button
                            size="sm"
                            color="primary"
                            onClick={addCustomSize}
                            type="button"
                            startContent={<Plus size={14} />}
                        >
                            Add
                        </Button>
                    </div>
                </div>

                {/* Colors */}
                <div className="flex flex-col gap-2">
                    <label className="text-gray-500 text-sm">Colors</label>
                    
                    {/* Selected Colors */}
                    {selectedColors.length > 0 && (
                        <div className="flex gap-2 flex-wrap mb-2">
                            {selectedColors.map((color, index) => (
                                <Chip
                                    key={index}
                                    onClose={() => removeColor(color)}
                                    variant="flat"
                                    color="secondary"
                                >
                                    {color}
                                </Chip>
                            ))}
                        </div>
                    )}

                    {/* Predefined Colors */}
                    <div className="flex gap-2 flex-wrap mb-2">
                        {predefinedColors.map((color) => (
                            <Button
                                key={color}
                                size="sm"
                                variant={selectedColors.includes(color) ? "solid" : "bordered"}
                                color={selectedColors.includes(color) ? "secondary" : "default"}
                                onClick={() => addColor(color)}
                                type="button"
                            >
                                {color}
                            </Button>
                        ))}
                    </div>

                    {/* Custom Color Input */}
                    <div className="flex gap-2">
                        <input
                            type="text"
                            placeholder="Enter custom color"
                            value={customColor}
                            onChange={(e) => setCustomColor(e.target.value)}
                            className="border px-3 py-2 rounded-lg flex-1 focus:outline-none text-sm"
                            onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    addCustomColor();
                                }
                            }}
                        />
                        <Button
                            size="sm"
                            color="secondary"
                            onClick={addCustomColor}
                            type="button"
                            startContent={<Plus size={14} />}
                        >
                            Add
                        </Button>
                    </div>
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