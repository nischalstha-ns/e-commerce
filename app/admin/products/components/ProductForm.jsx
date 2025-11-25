"use client";

import { createNewProduct, updateProduct } from "@/lib/firestore/products/write";
import { useCategories } from "@/lib/firestore/categories/read";
import { useBrands } from "@/lib/firestore/brands/read";
import { Button, Select, SelectItem, Textarea, Chip } from "@heroui/react";
import { useState, useEffect } from "react";
import { X, Plus } from "lucide-react";
import toast from "react-hot-toast";
import QuickAddCategory from "./QuickAddCategory";
import QuickAddBrand from "./QuickAddBrand";

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
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [showBrandModal, setShowBrandModal] = useState(false);
    
    const { data: categories } = useCategories();
    const { data: brands } = useBrands();

    useEffect(() => {
        if (productToEdit) {
            setData(productToEdit);
            setSelectedSizes(productToEdit.sizes || []);
            setSelectedColors(productToEdit.colors || []);
        } else {
            // Set default status for new products
            setData({ status: "active" });
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
        
        // Validate required fields
        if (!data?.name) {
            toast.error("Product name is required");
            setIsLoading(false);
            return;
        }
        if (!data?.price) {
            toast.error("Product price is required");
            setIsLoading(false);
            return;
        }
        if (!data?.categoryId) {
            toast.error("Product category is required");
            setIsLoading(false);
            return;
        }
        if (!productToEdit && (!images || images.length === 0)) {
            toast.error("At least one product image is required");
            setIsLoading(false);
            return;
        }
        
        try {
            const productData = {
                ...data,
                sizes: selectedSizes,
                colors: selectedColors
            };

            console.log('Product data:', productData);
            console.log('Images:', images);

            let result;
            const useLocal = true; // Shop role uses local storage
            
            if (productToEdit) {
                result = await updateProduct({ 
                    id: productToEdit.id, 
                    data: productData, 
                    newImages: images,
                    useLocalStorage: useLocal
                });
                toast.success("Product updated successfully");
            } else {
                result = await createNewProduct({ 
                    data: productData, 
                    images: images,
                    useLocalStorage: useLocal
                });
                toast.success("Product created successfully");
            }

            console.log('Operation result:', result);

            // Reset form
            setData({ status: "active" });
            setImages([]);
            setSelectedSizes([]);
            setSelectedColors([]);
            const fileInput = document.getElementById("product-images");
            if (fileInput) fileInput.value = "";
            
            if (onSuccess) onSuccess();
        } catch (error) {
            console.error('Product operation error:', error);
            toast.error(error?.message || "Failed to save product");
        }
        setIsLoading(false);
    };

    return (
        <div className="flex flex-col gap-6 bg-white rounded-2xl p-8 w-full max-w-4xl shadow-lg">
            <div className="border-b pb-4">
                <h1 className="font-bold text-2xl text-gray-900">
                    {productToEdit ? "Update Product" : "Create New Product"}
                </h1>
                <p className="text-gray-600 mt-1">Fill in the details below to add a new product to your store</p>
            </div>
            
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    handleSubmit();
                }}
                className="flex flex-col gap-6"
            >
                {/* Images */}
                <div className="flex flex-col gap-3">
                    <label className="text-gray-700 font-medium">
                        Product Images <span className="text-red-500">*</span>
                    </label>
                    
                    {/* Current Images from Database */}
                    {productToEdit && (productToEdit.imageURLs?.length > 0 || productToEdit.imageURL) && (
                        <div className="mb-3">
                            <p className="text-sm text-gray-600 mb-2 font-medium">Current Images (from database):</p>
                            <div className="flex gap-3 flex-wrap">
                                {productToEdit.imageURLs?.length > 0 ? (
                                    productToEdit.imageURLs.map((url, index) => (
                                        <div key={index} className="relative group">
                                            <img 
                                                className="h-24 w-24 object-cover rounded-xl border-2 border-green-500" 
                                                src={url} 
                                                alt={`Current ${index + 1}`}
                                                onError={(e) => {
                                                    e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23ddd" width="100" height="100"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999"%3ENo Image%3C/text%3E%3C/svg%3E';
                                                }}
                                            />
                                            <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-medium">
                                                {index + 1}
                                            </div>
                                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 rounded-xl transition-all flex items-center justify-center">
                                                <span className="text-white text-xs opacity-0 group-hover:opacity-100">Current</span>
                                            </div>
                                        </div>
                                    ))
                                ) : productToEdit.imageURL ? (
                                    <div className="relative group">
                                        <img 
                                            className="h-24 w-24 object-cover rounded-xl border-2 border-green-500" 
                                            src={productToEdit.imageURL} 
                                            alt="Current"
                                            onError={(e) => {
                                                e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23ddd" width="100" height="100"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999"%3ENo Image%3C/text%3E%3C/svg%3E';
                                            }}
                                        />
                                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 rounded-xl transition-all flex items-center justify-center">
                                            <span className="text-white text-xs opacity-0 group-hover:opacity-100">Current</span>
                                        </div>
                                    </div>
                                ) : null}
                            </div>
                            <p className="text-xs text-gray-500 mt-1">Upload new images below to replace these</p>
                        </div>
                    )}
                    
                    {/* New Images Preview (from local) */}
                    {images.length > 0 && (
                        <div className="mb-3">
                            <p className="text-sm text-gray-600 mb-2 font-medium">New Images (from local storage):</p>
                            <div className="flex gap-3 flex-wrap">
                                {Array.from(images).map((image, index) => {
                                    const imageUrl = URL.createObjectURL(image);
                                    return (
                                        <div key={index} className="relative group">
                                            <img 
                                                className="h-24 w-24 object-cover rounded-xl border-2 border-blue-500" 
                                                src={imageUrl} 
                                                alt={`Preview ${index + 1}`}
                                                onLoad={() => URL.revokeObjectURL(imageUrl)}
                                            />
                                            <div className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-medium">
                                                {index + 1}
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const newImages = Array.from(images).filter((_, i) => i !== index);
                                                    setImages(newImages);
                                                }}
                                                className="absolute -top-2 -left-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                ×
                                            </button>
                                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 rounded-xl transition-all flex items-center justify-center">
                                                <span className="text-white text-xs opacity-0 group-hover:opacity-100">New</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                    
                    {/* Upload Area */}
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-blue-400 transition-colors">
                        <input
                            onChange={(e) => {
                                if (e.target.files.length > 0) {
                                    const files = Array.from(e.target.files);
                                    setImages(files);
                                }
                            }}
                            id="product-images"
                            name="product-images"
                            type="file"
                            multiple
                            accept="image/*"
                            className="hidden"
                        />
                        <label htmlFor="product-images" className="cursor-pointer">
                            <div className="text-gray-600">
                                <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                <p className="mt-2 text-sm font-medium">{productToEdit ? 'Upload new images to replace' : 'Click to upload images'}</p>
                                <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB each</p>
                            </div>
                        </label>
                    </div>
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
                    <div className="flex items-center justify-between">
                        <label className="text-gray-500 text-sm">
                            Category <span className="text-red-500">*</span>
                        </label>
                        <Button
                            size="sm"
                            variant="light"
                            color="primary"
                            startContent={<Plus size={14} />}
                            onClick={() => setShowCategoryModal(true)}
                        >
                            Add New
                        </Button>
                    </div>
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
                    <div className="flex items-center justify-between">
                        <label className="text-gray-500 text-sm">Brand</label>
                        <Button
                            size="sm"
                            variant="light"
                            color="primary"
                            startContent={<Plus size={14} />}
                            onClick={() => setShowBrandModal(true)}
                        >
                            Add New
                        </Button>
                    </div>
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

                <div className="flex gap-4 pt-6 border-t">
                    <Button 
                        isLoading={isLoading} 
                        isDisabled={isLoading} 
                        type="submit"
                        color="primary"
                        className="flex-1 font-semibold py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                        size="lg"
                    >
                        {isLoading ? "Saving..." : productToEdit ? "Update Product" : "Create Product"}
                    </Button>
                    {onSuccess && (
                        <Button 
                            variant="bordered"
                            onClick={onSuccess}
                            className="px-8"
                            size="lg"
                        >
                            Cancel
                        </Button>
                    )}
                </div>
            </form>
            
            <QuickAddCategory
                isOpen={showCategoryModal}
                onClose={() => setShowCategoryModal(false)}
                onSuccess={(newCategory) => {
                    handleData("categoryId", newCategory.id);
                }}
            />
            
            <QuickAddBrand
                isOpen={showBrandModal}
                onClose={() => setShowBrandModal(false)}
                onSuccess={(newBrand) => {
                    handleData("brandId", newBrand.id);
                }}
            />
        </div>
    );
}