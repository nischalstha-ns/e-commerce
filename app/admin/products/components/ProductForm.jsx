"use client";
import { useState, useEffect } from "react";
import { createNewProduct, updateProduct } from "@/lib/firestore/products/write";
import { useCategories } from "@/lib/firestore/categories/read";
import { useBrands } from "@/lib/firestore/brands/read";
import { useAuth } from "@/contexts/AuthContext";
import { Button, Input, Textarea, Select, SelectItem, Card, CardBody, Chip, Progress } from "@heroui/react";
import { Upload, X, Image as ImageIcon, Tag, Palette, Package } from "lucide-react";
import toast from "react-hot-toast";

export default function ProductForm({ productToEdit, onSuccess }) {
    const { tenantId } = useAuth();
    const { data: categories } = useCategories();
    const { data: brands } = useBrands();
    const [isLoading, setIsLoading] = useState(false);
    const [imageFiles, setImageFiles] = useState([]);
    const [imagePreviews, setImagePreviews] = useState([]);
    const [sizeInput, setSizeInput] = useState("");
    const [colorInput, setColorInput] = useState("");
    const [formData, setFormData] = useState({
        name: "",
        sku: "",
        price: "",
        salePrice: "",
        stock: "",
        categoryId: "",
        brandId: "",
        description: "",
        sizes: [],
        colors: []
    });

    useEffect(() => {
        if (productToEdit) {
            setFormData({
                name: productToEdit.name || "",
                sku: productToEdit.sku || "",
                price: productToEdit.price || "",
                salePrice: productToEdit.salePrice || "",
                stock: productToEdit.stock || "",
                categoryId: productToEdit.categoryId || "",
                brandId: productToEdit.brandId || "",
                description: productToEdit.description || "",
                sizes: productToEdit.sizes || [],
                colors: productToEdit.colors || []
            });
            if (productToEdit.imageURLs?.length > 0) {
                setImagePreviews(productToEdit.imageURLs);
            } else if (productToEdit.imageURL) {
                setImagePreviews([productToEdit.imageURL]);
            }
        }
    }, [productToEdit]);

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files).slice(0, 5);
        setImageFiles(files);
        
        const previews = files.map(file => URL.createObjectURL(file));
        setImagePreviews(previews);
    };

    const removeImage = (index) => {
        setImageFiles(prev => prev.filter((_, i) => i !== index));
        setImagePreviews(prev => prev.filter((_, i) => i !== index));
    };

    const addSize = () => {
        if (sizeInput.trim() && !formData.sizes.includes(sizeInput.trim())) {
            setFormData({ ...formData, sizes: [...formData.sizes, sizeInput.trim()] });
            setSizeInput("");
        }
    };

    const removeSize = (size) => {
        setFormData({ ...formData, sizes: formData.sizes.filter(s => s !== size) });
    };

    const addColor = () => {
        if (colorInput.trim() && !formData.colors.includes(colorInput.trim())) {
            setFormData({ ...formData, colors: [...formData.colors, colorInput.trim()] });
            setColorInput("");
        }
    };

    const removeColor = (color) => {
        setFormData({ ...formData, colors: formData.colors.filter(c => c !== color) });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!imageFiles.length && !productToEdit) {
            toast.error("Please upload at least one product image");
            return;
        }
        
        setIsLoading(true);

        try {
            const productData = {
                ...formData,
                price: parseFloat(formData.price),
                salePrice: formData.salePrice ? parseFloat(formData.salePrice) : null,
                stock: parseInt(formData.stock)
            };

            if (productToEdit) {
                await updateProduct({
                    id: productToEdit.id,
                    data: productData,
                    newImages: imageFiles
                });
                toast.success("Product updated successfully");
            } else {
                await createNewProduct({
                    data: productData,
                    images: imageFiles,
                    tenantId: tenantId || 'default'
                });
                toast.success("Product added successfully");
            }

            onSuccess();
        } catch (error) {
            toast.error(error.message || "Failed to save product");
        } finally {
            setIsLoading(false);
        }
    };

    const uploadProgress = imageFiles.length > 0 ? (imageFiles.length / 5) * 100 : 0;

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <Card className="bg-white dark:bg-gray-800">
                <CardBody className="p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                            <Package className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold">{productToEdit ? "Edit Product" : "Add New Product"}</h2>
                            <p className="text-sm text-gray-500">Fill in the product details below</p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        {/* Basic Information */}
                        <div>
                            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                                <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs">1</span>
                                Basic Information
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input
                                    label="Product Name"
                                    placeholder="e.g., Premium Cotton T-Shirt"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    isRequired
                                    variant="bordered"
                                />
                                <Input
                                    label="SKU"
                                    placeholder="e.g., TSH-001"
                                    value={formData.sku}
                                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                                    isRequired
                                    variant="bordered"
                                />
                                <Select
                                    label="Category"
                                    placeholder="Select category"
                                    selectedKeys={formData.categoryId ? [formData.categoryId] : []}
                                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                                    isRequired
                                    variant="bordered"
                                >
                                    {categories?.map((category) => (
                                        <SelectItem key={category.id} value={category.id}>
                                            {category.name}
                                        </SelectItem>
                                    ))}
                                </Select>
                                <Select
                                    label="Brand"
                                    placeholder="Select brand"
                                    selectedKeys={formData.brandId ? [formData.brandId] : []}
                                    onChange={(e) => setFormData({ ...formData, brandId: e.target.value })}
                                    isRequired
                                    variant="bordered"
                                >
                                    {brands?.map((brand) => (
                                        <SelectItem key={brand.id} value={brand.id}>
                                            {brand.name}
                                        </SelectItem>
                                    ))}
                                </Select>
                            </div>
                        </div>

                        {/* Pricing & Inventory */}
                        <div>
                            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                                <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs">2</span>
                                Pricing & Inventory
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <Input
                                    type="number"
                                    label="Regular Price"
                                    placeholder="0.00"
                                    value={formData.price}
                                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                    startContent={<span className="text-gray-500">Rs.</span>}
                                    isRequired
                                    variant="bordered"
                                />
                                <Input
                                    type="number"
                                    label="Sale Price"
                                    placeholder="0.00"
                                    value={formData.salePrice}
                                    onChange={(e) => setFormData({ ...formData, salePrice: e.target.value })}
                                    startContent={<span className="text-gray-500">Rs.</span>}
                                    variant="bordered"
                                    description="Leave empty if no discount"
                                />
                                <Input
                                    type="number"
                                    label="Stock Quantity"
                                    placeholder="0"
                                    value={formData.stock}
                                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                                    isRequired
                                    variant="bordered"
                                />
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                                <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs">3</span>
                                Description
                            </h3>
                            <Textarea
                                label="Product Description"
                                placeholder="Describe your product features, materials, care instructions..."
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                rows={4}
                                variant="bordered"
                            />
                        </div>

                        {/* Variants */}
                        <div>
                            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                                <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs">4</span>
                                Variants
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                                        <Tag className="w-4 h-4" />
                                        Sizes
                                    </label>
                                    <div className="flex flex-wrap gap-2 mb-3">
                                        {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map((size) => (
                                            <button
                                                key={size}
                                                type="button"
                                                onClick={() => {
                                                    if (formData.sizes.includes(size)) {
                                                        removeSize(size);
                                                    } else {
                                                        setFormData({ ...formData, sizes: [...formData.sizes, size] });
                                                    }
                                                }}
                                                className={`px-4 py-2 rounded-lg border-2 transition-all ${
                                                    formData.sizes.includes(size)
                                                        ? 'bg-blue-600 text-white border-blue-600'
                                                        : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:border-blue-500'
                                                }`}
                                            >
                                                {size}
                                            </button>
                                        ))}
                                    </div>
                                    <div className="flex gap-2">
                                        <Input
                                            placeholder="Custom size"
                                            value={sizeInput}
                                            onChange={(e) => setSizeInput(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSize())}
                                            variant="bordered"
                                            size="sm"
                                        />
                                        <Button type="button" onClick={addSize} color="primary" size="sm">
                                            Add
                                        </Button>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                                        <Palette className="w-4 h-4" />
                                        Colors
                                    </label>
                                    <div className="flex flex-wrap gap-2 mb-3">
                                        {[
                                            { name: 'Black', hex: '#000000' },
                                            { name: 'White', hex: '#FFFFFF' },
                                            { name: 'Red', hex: '#EF4444' },
                                            { name: 'Blue', hex: '#3B82F6' },
                                            { name: 'Green', hex: '#10B981' },
                                            { name: 'Yellow', hex: '#F59E0B' },
                                            { name: 'Pink', hex: '#EC4899' },
                                            { name: 'Purple', hex: '#8B5CF6' }
                                        ].map((color) => (
                                            <button
                                                key={color.name}
                                                type="button"
                                                onClick={() => {
                                                    if (formData.colors.includes(color.name)) {
                                                        removeColor(color.name);
                                                    } else {
                                                        setFormData({ ...formData, colors: [...formData.colors, color.name] });
                                                    }
                                                }}
                                                className={`px-4 py-2 rounded-lg border-2 transition-all flex items-center gap-2 ${
                                                    formData.colors.includes(color.name)
                                                        ? 'bg-blue-600 text-white border-blue-600'
                                                        : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:border-blue-500'
                                                }`}
                                            >
                                                <span
                                                    className="w-4 h-4 rounded-full border border-gray-300"
                                                    style={{ backgroundColor: color.hex }}
                                                />
                                                {color.name}
                                            </button>
                                        ))}
                                    </div>
                                    <div className="flex gap-2">
                                        <Input
                                            placeholder="Custom color"
                                            value={colorInput}
                                            onChange={(e) => setColorInput(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addColor())}
                                            variant="bordered"
                                            size="sm"
                                        />
                                        <Button type="button" onClick={addColor} color="secondary" size="sm">
                                            Add
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Product Images */}
                        <div>
                            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                                <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs">5</span>
                                Product Images
                            </h3>
                            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 hover:border-blue-500 transition-colors">
                                <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={handleImageChange}
                                    className="hidden"
                                    id="product-images"
                                />
                                <label
                                    htmlFor="product-images"
                                    className="flex flex-col items-center justify-center cursor-pointer"
                                >
                                    <div className="p-4 bg-blue-100 dark:bg-blue-900 rounded-full mb-3">
                                        <ImageIcon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Click to upload images</span>
                                    <span className="text-xs text-gray-500 mt-1">PNG, JPG up to 5MB (Max 5 images)</span>
                                </label>
                            </div>
                            {imageFiles.length > 0 && (
                                <div className="mt-3">
                                    <Progress value={uploadProgress} color="primary" size="sm" className="mb-2" />
                                    <p className="text-xs text-gray-500">{imageFiles.length} of 5 images selected</p>
                                </div>
                            )}
                            {imagePreviews.length > 0 && (
                                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-4">
                                    {imagePreviews.map((preview, index) => (
                                        <div key={index} className="relative group">
                                            <img
                                                src={preview}
                                                alt={`Preview ${index + 1}`}
                                                className="w-full h-24 object-cover rounded-lg border-2 border-gray-200 dark:border-gray-700"
                                            />
                                            {index === 0 && (
                                                <Chip size="sm" color="success" className="absolute bottom-1 left-1" variant="flat">
                                                    Main
                                                </Chip>
                                            )}
                                            <button
                                                type="button"
                                                onClick={() => removeImage(index)}
                                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                                            >
                                                <X size={12} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </CardBody>
            </Card>

            <div className="flex gap-3 justify-end">
                <Button
                    type="submit"
                    color="primary"
                    size="lg"
                    isLoading={isLoading}
                    isDisabled={isLoading}
                    className="px-8"
                >
                    {isLoading ? "Saving..." : productToEdit ? "Update Product" : "Add Product"}
                </Button>
            </div>
        </form>
    );
}
