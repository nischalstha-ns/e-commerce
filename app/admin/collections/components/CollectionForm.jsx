"use client";

import { createNewCollection, updateCollection } from "@/lib/firestore/collections/write";
import { useProducts } from "@/lib/firestore/products/read";
import { Button, Select, SelectItem, Textarea, Checkbox, Chip } from "@heroui/react";
import { useState, useEffect } from "react";
import { X, Plus } from "lucide-react";
import toast from "react-hot-toast";

export default function CollectionForm({ collectionToEdit = null, onSuccess }) {
    const [data, setData] = useState(null);
    const [image, setImage] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [productSearch, setProductSearch] = useState("");
    
    const { data: products } = useProducts();

    useEffect(() => {
        if (collectionToEdit) {
            setData(collectionToEdit);
            setSelectedProducts(collectionToEdit.productIds || []);
        }
    }, [collectionToEdit]);

    const handleData = (key, value) => {
        setData((preData) => ({
            ...(preData ?? {}),
            [key]: value,
        }));
    };

    const addProduct = (productId) => {
        if (!selectedProducts.includes(productId)) {
            setSelectedProducts([...selectedProducts, productId]);
        }
    };

    const removeProduct = (productId) => {
        setSelectedProducts(selectedProducts.filter(id => id !== productId));
    };

    const filteredProducts = products?.filter(product =>
        product.name.toLowerCase().includes(productSearch.toLowerCase()) &&
        !selectedProducts.includes(product.id)
    ) || [];

    const selectedProductsData = products?.filter(product =>
        selectedProducts.includes(product.id)
    ) || [];

    const handleSubmit = async () => {
        setIsLoading(true);
        try {
            const collectionData = {
                ...data,
                productIds: selectedProducts
            };

            if (collectionToEdit) {
                await updateCollection({ 
                    id: collectionToEdit.id, 
                    data: collectionData, 
                    newImage: image 
                });
                toast.success("Collection updated successfully");
            } else {
                await createNewCollection({ data: collectionData, image: image });
                toast.success("Collection created successfully");
            }

            // Reset form
            setData(null);
            setImage(null);
            setSelectedProducts([]);
            document.getElementById("collection-image").value = null;
            
            if (onSuccess) onSuccess();
        } catch (error) {
            toast.error(error?.message || "An error occurred");
        }
        setIsLoading(false);
    };

    return (
        <div className="flex flex-col gap-4 bg-white rounded-xl p-6 w-full max-w-2xl">
            <h1 className="font-semibold text-xl">
                {collectionToEdit ? "Update Collection" : "Create Collection"}
            </h1>
            
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    handleSubmit();
                }}
                className="flex flex-col gap-4"
            >
                {/* Image */}
                <div className="flex flex-col gap-2">
                    <label className="text-gray-500 text-sm">
                        Cover Image
                    </label>
                    {image && (
                        <div className="flex justify-center items-center p-3">
                            <img className="h-32 w-48 object-cover rounded-lg" src={URL.createObjectURL(image)} alt="Collection Preview" />
                        </div>
                    )}
                    {collectionToEdit?.imageURL && !image && (
                        <div className="flex justify-center items-center p-3">
                            <img className="h-32 w-48 object-cover rounded-lg" src={collectionToEdit.imageURL} alt="Current Collection" />
                        </div>
                    )}
                    <input
                        onChange={(e) => {
                            if (e.target.files.length > 0) {
                                setImage(e.target.files[0]);
                            }
                        }}
                        id="collection-image"
                        name="collection-image"
                        type="file"
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
                        placeholder="Enter Collection Name"
                        value={data?.name ?? ""}
                        onChange={(e) => handleData("name", e.target.value)}
                        className="border px-4 py-2 rounded-lg w-full focus:outline-none"
                        required
                    />
                </div>

                {/* Slug */}
                <div className="flex flex-col gap-2">
                    <label className="text-gray-500 text-sm">
                        Slug <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        placeholder="Enter URL Slug"
                        value={data?.slug ?? ""}
                        onChange={(e) => handleData("slug", e.target.value)}
                        className="border px-4 py-2 rounded-lg w-full focus:outline-none"
                        required
                    />
                </div>

                {/* Description */}
                <div className="flex flex-col gap-2">
                    <label className="text-gray-500 text-sm">Description</label>
                    <Textarea
                        placeholder="Enter Collection Description"
                        value={data?.description ?? ""}
                        onChange={(e) => handleData("description", e.target.value)}
                        className="w-full"
                    />
                </div>

                {/* Status and Featured */}
                <div className="grid grid-cols-2 gap-4">
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
                        </Select>
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-gray-500 text-sm">Options</label>
                        <Checkbox
                            isSelected={data?.featured || false}
                            onValueChange={(checked) => handleData("featured", checked)}
                        >
                            Featured Collection
                        </Checkbox>
                    </div>
                </div>

                {/* Product Selection */}
                <div className="flex flex-col gap-2">
                    <label className="text-gray-500 text-sm">Products</label>
                    
                    {/* Selected Products */}
                    {selectedProductsData.length > 0 && (
                        <div className="mb-3">
                            <p className="text-sm text-gray-600 mb-2">Selected Products ({selectedProductsData.length})</p>
                            <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto border rounded-lg p-2">
                                {selectedProductsData.map((product) => (
                                    <div key={product.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                        <div className="flex items-center gap-2">
                                            <img 
                                                src={product.imageURLs?.[0]} 
                                                alt={product.name}
                                                className="w-8 h-8 object-cover rounded"
                                            />
                                            <span className="text-sm">{product.name}</span>
                                        </div>
                                        <Button
                                            size="sm"
                                            variant="light"
                                            color="danger"
                                            onClick={() => removeProduct(product.id)}
                                            isIconOnly
                                        >
                                            <X size={14} />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Product Search */}
                    <input
                        type="text"
                        placeholder="Search products to add..."
                        value={productSearch}
                        onChange={(e) => setProductSearch(e.target.value)}
                        className="border px-4 py-2 rounded-lg w-full focus:outline-none text-sm"
                    />

                    {/* Available Products */}
                    {productSearch && filteredProducts.length > 0 && (
                        <div className="border rounded-lg max-h-48 overflow-y-auto">
                            {filteredProducts.slice(0, 10).map((product) => (
                                <div 
                                    key={product.id} 
                                    className="flex items-center justify-between p-2 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                                    onClick={() => addProduct(product.id)}
                                >
                                    <div className="flex items-center gap-2">
                                        <img 
                                            src={product.imageURLs?.[0]} 
                                            alt={product.name}
                                            className="w-8 h-8 object-cover rounded"
                                        />
                                        <div>
                                            <p className="text-sm font-medium">{product.name}</p>
                                            <p className="text-xs text-gray-500">Rs. {product.price}</p>
                                        </div>
                                    </div>
                                    <Button
                                        size="sm"
                                        variant="light"
                                        color="primary"
                                        isIconOnly
                                    >
                                        <Plus size={14} />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* ID Display (for updates only) */}
                {collectionToEdit && (
                    <div className="flex flex-col gap-2">
                        <label className="text-gray-500 text-sm">ID</label>
                        <input
                            type="text"
                            value={collectionToEdit.id}
                            disabled
                            className="border px-4 py-2 rounded-lg w-full bg-gray-100 text-gray-500"
                        />
                    </div>
                )}

                <Button 
                    isLoading={isLoading} 
                    isDisabled={isLoading} 
                    type="submit"
                    color="primary"
                    className="w-full font-bold"
                >
                    {collectionToEdit ? "Update Collection" : "Create Collection"}
                </Button>
            </form>
        </div>
    );
}