"use client";

import { useState } from "react";
import { useCategories } from "@/lib/firestore/categories/read";
import { Card, CardBody, CardHeader, Button, Input, Switch, Select, SelectItem } from "@heroui/react";
import { Tag, Plus, X, Settings, Grid } from "lucide-react";

export default function CategoriesControl() {
    const { data: categories } = useCategories();
    const [sectionData, setSectionData] = useState({
        enabled: true,
        title: "Shop by Category",
        subtitle: "Explore our carefully curated collections designed for every lifestyle",
        displayCount: 6,
        selectionMethod: "manual", // manual, all, featured
        selectedCategories: [],
        layout: "grid", // grid, carousel
        showNames: true,
        showDescriptions: false,
        columns: 3
    });

    const handleInputChange = (field, value) => {
        setSectionData(prev => ({ ...prev, [field]: value }));
    };

    const addCategory = (categoryId) => {
        if (!sectionData.selectedCategories.includes(categoryId)) {
            setSectionData(prev => ({
                ...prev,
                selectedCategories: [...prev.selectedCategories, categoryId]
            }));
        }
    };

    const removeCategory = (categoryId) => {
        setSectionData(prev => ({
            ...prev,
            selectedCategories: prev.selectedCategories.filter(id => id !== categoryId)
        }));
    };

    const selectedCategoriesData = categories?.filter(category => 
        sectionData.selectedCategories.includes(category.id)
    ) || [];

    const availableCategories = categories?.filter(category => 
        !sectionData.selectedCategories.includes(category.id)
    ) || [];

    return (
        <div className="space-y-6">
            {/* Section Header */}
            <Card className="shadow-sm">
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-2">
                            <Tag className="w-5 h-5 text-gray-600" />
                            <h3 className="text-lg font-semibold">Categories Section</h3>
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
                                    max="12"
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
                                    <SelectItem key="all" value="all">All Categories</SelectItem>
                                    <SelectItem key="featured" value="featured">Featured Only</SelectItem>
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
                                    <SelectItem key="6" value="6">6 Columns</SelectItem>
                                </Select>
                            </div>
                        </CardBody>
                    </Card>

                    {/* Display Options */}
                    <Card className="shadow-sm">
                        <CardHeader className="pb-3">
                            <div className="flex items-center gap-2">
                                <Grid className="w-5 h-5 text-gray-600" />
                                <h4 className="font-semibold">Display Options</h4>
                            </div>
                        </CardHeader>
                        <CardBody className="pt-0">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="flex items-center gap-2">
                                    <Switch
                                        isSelected={sectionData.showNames}
                                        onValueChange={(checked) => handleInputChange("showNames", checked)}
                                    />
                                    <span>Show Category Names</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Switch
                                        isSelected={sectionData.showDescriptions}
                                        onValueChange={(checked) => handleInputChange("showDescriptions", checked)}
                                    />
                                    <span>Show Descriptions</span>
                                </div>
                            </div>
                        </CardBody>
                    </Card>

                    {/* Manual Category Selection */}
                    {sectionData.selectionMethod === "manual" && (
                        <Card className="shadow-sm">
                            <CardHeader className="pb-3">
                                <div className="flex items-center gap-2">
                                    <Plus className="w-5 h-5 text-gray-600" />
                                    <h4 className="font-semibold">Category Selection</h4>
                                </div>
                            </CardHeader>
                            <CardBody className="pt-0 space-y-4">
                                {/* Selected Categories */}
                                {selectedCategoriesData.length > 0 && (
                                    <div>
                                        <h5 className="font-medium mb-3">Selected Categories ({selectedCategoriesData.length})</h5>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {selectedCategoriesData.map((category) => (
                                                <div key={category.id} className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                                                    <img 
                                                        src={category.imageURL} 
                                                        alt={category.name}
                                                        className="w-12 h-12 object-cover rounded"
                                                    />
                                                    <div className="flex-1">
                                                        <p className="font-medium text-sm">{category.name}</p>
                                                        <p className="text-xs text-gray-600">{category.slug}</p>
                                                    </div>
                                                    <Button
                                                        size="sm"
                                                        variant="light"
                                                        color="danger"
                                                        isIconOnly
                                                        onClick={() => removeCategory(category.id)}
                                                    >
                                                        <X size={14} />
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Available Categories */}
                                <div>
                                    <h5 className="font-medium mb-3">Available Categories</h5>
                                    <div className="max-h-64 overflow-y-auto space-y-2">
                                        {availableCategories.map((category) => (
                                            <div key={category.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                                <img 
                                                    src={category.imageURL} 
                                                    alt={category.name}
                                                    className="w-10 h-10 object-cover rounded"
                                                />
                                                <div className="flex-1">
                                                    <p className="font-medium text-sm">{category.name}</p>
                                                    <p className="text-xs text-gray-600">{category.slug}</p>
                                                </div>
                                                <Button
                                                    size="sm"
                                                    color="primary"
                                                    variant="flat"
                                                    onClick={() => addCategory(category.id)}
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
                                {(sectionData.selectionMethod === "manual" ? selectedCategoriesData : categories?.slice(0, sectionData.displayCount) || [])
                                    .slice(0, sectionData.displayCount)
                                    .map((category) => (
                                    <div key={category.id} className="bg-white border rounded-lg overflow-hidden">
                                        <img 
                                            src={category.imageURL} 
                                            alt={category.name}
                                            className="w-full h-24 object-cover"
                                        />
                                        {sectionData.showNames && (
                                            <div className="p-3">
                                                <h4 className="font-medium text-sm">{category.name}</h4>
                                            </div>
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