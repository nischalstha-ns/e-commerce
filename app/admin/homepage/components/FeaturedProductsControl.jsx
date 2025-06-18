"use client";

import { useState } from "react";
import { useProducts } from "@/lib/firestore/products/read";
import { Card, CardBody, CardHeader, Button, Input, Switch, Select, SelectItem, Chip } from "@heroui/react";
import { Package, Plus, X, Settings, Filter } from "lucide-react";

export default function FeaturedProductsControl() {
    const { data: products } = useProducts();
    const [sectionData, setSectionData] = useState({
        enabled: true,
        title: "Featured Products",
        subtitle: "Handpicked favorites that embody our commitment to quality and style",
        displayCount: 8,
        selectionMethod: "manual", // manual, latest, bestselling, random
        selectedProducts: [],
        showPrices: true,
        showDiscounts: true,
        showRatings: false,
        layout: "grid", // grid, carousel
        columns: 4
    });

    const handleInputChange = (field, value) => {
        setSectionData(prev => ({ ...prev, [field]: value }));
    };

    const addProduct = (productId) => {
        if (!sectionData.selectedProducts.includes(productId)) {
            setSectionData(prev => ({
                ...prev,
                selectedProducts: [...prev.selectedProducts, productId]
            }));
        }
    };

    const removeProduct = (productId) => {
        setSectionData(prev => ({
            ...prev,
            selectedProducts: prev.selectedProducts.filter(id => id !== productId)
        }));
    };

    const selectedProductsData = products?.filter(product => 
        sectionData.selectedProducts.includes(product.id)
    ) || [];

    const availableProducts = products?.filter(product => 
        !sectionData.selectedProducts.includes(product.id)
    ) || [];

    return (
        <div className="space-y-6">
            {/* Section Header */}
            <Card className="shadow-sm">
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-2">
                            <Package className="w-5 h-5 text-gray-600" />
                            <h3 className="text-lg font-semibold">Featured Products Section</h3>
                        </div>
                        <Switch
                            isSelected={sectionData.enabled}
                            onValueChange={(checked) => handleInputChange("enabled", checked)}
                        />
                    </div>
                </CardHeader>
            </Card>

            {sectionData.enabled && (
                <>
                    {/* Content Settings */}
                    <Card className="shadow-sm">
                        <CardHeader className="pb-3">
                            <div className="flex items-center gap-2">
                                <Settings className="w-5 h-5 text-gray-600" />
                                <h4 className="font-semibold">Section Content</h4>
                            </div>
                        </CardHeader>
                        <CardBody className="pt-0 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input
                                    label="Section Title"
                                    value={sectionData.title}
                                    onChange={(e) => handleInputChange("title", e.target.value)}
                                    variant="bordered"
                                />
                                <Input
                                    label="Display Count"
                                    type="number"
                                    value={sectionData.displayCount}
                                    onChange={(e) => handleInputChange("displayCount", parseInt(e.target.value))}
                                    variant="bordered"
                                    min="1"
                                    max="20"
                                />
                            </div>

                            <Input
                                label="Section Subtitle"
                                value={sectionData.subtitle}
                                onChange={(e) => handleInputChange("subtitle", e.target.value)}
                                variant="bordered"
                            />

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <Select
                                    label="Selection Method"
                                    selectedKeys={[sectionData.selectionMethod]}
                                    onSelectionChange={(keys) => handleInputChange("selectionMethod", Array.from(keys)[0])}
                                >
                                    <SelectItem key="manual" value="manual">Manual Selection</SelectItem>
                                    <SelectItem key="latest" value="latest">Latest Products</SelectItem>
                                    <SelectItem key="bestselling" value="bestselling">Best Selling</SelectItem>
                                    <SelectItem key="random" value="random">Random</SelectItem>
                                </Select>

                                <Select
                                    label="Layout"
                                    selectedKeys={[sectionData.layout]}
                                    onSelectionChange={(keys) => handleInputChange("layout", Array.from(keys)[0])}
                                >
                                    <SelectItem key="grid" value="grid">Grid</SelectItem>
                                    <SelectItem key="carousel" value="carousel">Carousel</SelectItem>
                                </Select>

                                <Select
                                    label="Columns"
                                    selectedKeys={[sectionData.columns.toString()]}
                                    onSelectionChange={(keys) => handleInputChange("columns", parseInt(Array.from(keys)[0]))}
                                >
                                    <SelectItem key="2" value="2">2 Columns</SelectItem>
                                    <SelectItem key="3" value="3">3 Columns</SelectItem>
                                    <SelectItem key="4" value="4">4 Columns</SelectItem>
                                    <SelectItem key="5" value="5">5 Columns</SelectItem>
                                </Select>
                            </div>
                        </CardBody>
                    </Card>

                    {/* Display Options */}
                    <Card className="shadow-sm">
                        <CardHeader className="pb-3">
                            <div className="flex items-center gap-2">
                                <Filter className="w-5 h-5 text-gray-600" />
                                <h4 className="font-semibold">Display Options</h4>
                            </div>
                        </CardHeader>
                        <CardBody className="pt-0">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="flex items-center gap-2">
                                    <Switch
                                        isSelected={sectionData.showPrices}
                                        onValueChange={(checked) => handleInputChange("showPrices", checked)}
                                    />
                                    <span>Show Prices</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Switch
                                        isSelected={sectionData.showDiscounts}
                                        onValueChange={(checked) => handleInputChange("showDiscounts", checked)}
                                    />
                                    <span>Show Discounts</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Switch
                                        isSelected={sectionData.showRatings}
                                        onValueChange={(checked) => handleInputChange("showRatings", checked)}
                                    />
                                    <span>Show Ratings</span>
                                </div>
                            </div>
                        </CardBody>
                    </Card>

                    {/* Manual Product Selection */}
                    {sectionData.selectionMethod === "manual" && (
                        <Card className="shadow-sm">
                            <CardHeader className="pb-3">
                                <div className="flex items-center gap-2">
                                    <Plus className="w-5 h-5 text-gray-600" />
                                    <h4 className="font-semibold">Product Selection</h4>
                                </div>
                            </CardHeader>
                            <CardBody className="pt-0 space-y-4">
                                {/* Selected Products */}
                                {selectedProductsData.length > 0 && (
                                    <div>
                                        <h5 className="font-medium mb-3">Selected Products ({selectedProductsData.length})</h5>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {selectedProductsData.map((product) => (
                                                <div key={product.id} className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                                                    <img 
                                                        src={product.imageURLs?.[0]} 
                                                        alt={product.name}
                                                        className="w-12 h-12 object-cover rounded"
                                                    />
                                                    <div className="flex-1">
                                                        <p className="font-medium text-sm">{product.name}</p>
                                                        <p className="text-xs text-gray-600">Rs. {product.price}</p>
                                                    </div>
                                                    <Button
                                                        size="sm"
                                                        variant="light"
                                                        color="danger"
                                                        isIconOnly
                                                        onClick={() => removeProduct(product.id)}
                                                    >
                                                        <X size={14} />
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Available Products */}
                                <div>
                                    <h5 className="font-medium mb-3">Available Products</h5>
                                    <div className="max-h-64 overflow-y-auto space-y-2">
                                        {availableProducts.slice(0, 10).map((product) => (
                                            <div key={product.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                                <img 
                                                    src={product.imageURLs?.[0]} 
                                                    alt={product.name}
                                                    className="w-10 h-10 object-cover rounded"
                                                />
                                                <div className="flex-1">
                                                    <p className="font-medium text-sm">{product.name}</p>
                                                    <div className="flex items-center gap-2">
                                                        <p className="text-xs text-gray-600">Rs. {product.price}</p>
                                                        <Chip size="sm" color={product.stock > 0 ? "success" : "danger"}>
                                                            {product.stock > 0 ? "In Stock" : "Out"}
                                                        </Chip>
                                                    </div>
                                                </div>
                                                <Button
                                                    size="sm"
                                                    color="primary"
                                                    variant="flat"
                                                    onClick={() => addProduct(product.id)}
                                                    startContent={<Plus size={14} />}
                                                >
                                                    Add
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </CardBody>
                        </Card>
                    )}

                    {/* Preview */}
                    <Card className="shadow-sm">
                        <CardHeader className="pb-3">
                            <h4 className="font-semibold">Preview</h4>
                        </CardHeader>
                        <CardBody className="pt-0">
                            <div className="text-center mb-6">
                                <h3 className="text-2xl font-bold mb-2">{sectionData.title}</h3>
                                <p className="text-gray-600">{sectionData.subtitle}</p>
                            </div>
                            <div className={`grid grid-cols-${Math.min(sectionData.columns, 4)} gap-4`}>
                                {(sectionData.selectionMethod === "manual" ? selectedProductsData : products?.slice(0, sectionData.displayCount) || [])
                                    .slice(0, sectionData.displayCount)
                                    .map((product) => (
                                    <div key={product.id} className="bg-white border rounded-lg p-3">
                                        <img 
                                            src={product.imageURLs?.[0]} 
                                            alt={product.name}
                                            className="w-full h-24 object-cover rounded mb-2"
                                        />
                                        <h4 className="font-medium text-sm mb-1">{product.name}</h4>
                                        {sectionData.showPrices && (
                                            <p className="text-blue-600 font-bold text-sm">Rs. {product.price}</p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </CardBody>
                    </Card>
                </>
            )}
        </div>
    );
}