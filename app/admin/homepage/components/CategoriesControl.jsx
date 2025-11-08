"use client";

import { useState, useEffect } from "react";
import { Card, CardBody, CardHeader, Button, Input, Switch, Select, SelectItem } from "@heroui/react";
import { Grid, Save, Eye } from "lucide-react";
import { useHomepageSettings } from "@/lib/firestore/homepage/read";
import { updateSectionSettings } from "@/lib/firestore/homepage/write";
import toast from "react-hot-toast";

export default function CategoriesControl({ autoSave = false }) {
    const { data: homepageSettings, mutate } = useHomepageSettings();
    const [categoriesData, setCategoriesData] = useState({
        enabled: true,
        title: "Shop by Category",
        subtitle: "Explore our carefully curated collections",
        displayCount: 6,
        layout: "grid",
        showImages: true,
        showProductCount: true
    });
    const [isSaving, setIsSaving] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);

    useEffect(() => {
        if (homepageSettings.categoriesSection) {
            setCategoriesData(prev => ({ ...prev, ...homepageSettings.categoriesSection }));
        }
    }, [homepageSettings]);

    const handleInputChange = async (field, value) => {
        setCategoriesData(prev => ({ ...prev, [field]: value }));
        setHasChanges(true);
        
        if (autoSave) {
            try {
                const newData = { ...categoriesData, [field]: value };
                await updateSectionSettings("categoriesSection", newData);
                if (mutate) mutate();
                setHasChanges(false);
            } catch (error) {
                console.error('Auto-save error:', error);
            }
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await updateSectionSettings("categoriesSection", categoriesData);
            if (mutate) mutate();
            setHasChanges(false);
            toast.success("Categories section saved successfully!");
        } catch (error) {
            console.error('Categories section save error:', error);
            toast.error(error.message || "Failed to save categories section");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-6">
            <Card className="shadow-sm">
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-2">
                            <Grid className="w-5 h-5 text-gray-600" />
                            <h3 className="text-lg font-semibold">Categories Section</h3>
                        </div>
                        <div className="flex items-center gap-2">
                            {!autoSave && (
                                <Button
                                    color={hasChanges ? "warning" : "primary"}
                                    size="sm"
                                    startContent={<Save size={16} />}
                                    onClick={handleSave}
                                    isLoading={isSaving}
                                    variant={hasChanges ? "solid" : "bordered"}
                                >
                                    {hasChanges ? "Save Changes" : "Saved"}
                                </Button>
                            )}
                            {autoSave && (
                                <span className="text-sm text-green-600 font-medium">Auto Save ON</span>
                            )}
                            <Switch
                                isSelected={categoriesData.enabled}
                                onValueChange={(checked) => handleInputChange("enabled", checked)}
                            />
                        </div>
                    </div>
                </CardHeader>
            </Card>

            {categoriesData.enabled && (
                <>
                    <Card className="shadow-sm">
                        <CardHeader className="pb-3">
                            <h4 className="font-semibold">Content Settings</h4>
                        </CardHeader>
                        <CardBody className="pt-0 space-y-4">
                            <Input
                                label="Section Title"
                                value={categoriesData.title}
                                onChange={(e) => handleInputChange("title", e.target.value)}
                                variant="bordered"
                            />
                            
                            <Input
                                label="Subtitle"
                                value={categoriesData.subtitle}
                                onChange={(e) => handleInputChange("subtitle", e.target.value)}
                                variant="bordered"
                            />

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <Input
                                    label="Display Count"
                                    type="number"
                                    value={categoriesData.displayCount}
                                    onChange={(e) => handleInputChange("displayCount", parseInt(e.target.value))}
                                    variant="bordered"
                                    min="1"
                                    max="12"
                                />

                                <Select
                                    label="Layout Style"
                                    selectedKeys={[categoriesData.layout]}
                                    onSelectionChange={(keys) => handleInputChange("layout", Array.from(keys)[0])}
                                >
                                    <SelectItem key="grid" value="grid">Grid</SelectItem>
                                    <SelectItem key="carousel" value="carousel">Carousel</SelectItem>
                                    <SelectItem key="masonry" value="masonry">Masonry</SelectItem>
                                </Select>

                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <Switch
                                            size="sm"
                                            isSelected={categoriesData.showImages}
                                            onValueChange={(checked) => handleInputChange("showImages", checked)}
                                        />
                                        <span className="text-sm">Show Images</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Switch
                                            size="sm"
                                            isSelected={categoriesData.showProductCount}
                                            onValueChange={(checked) => handleInputChange("showProductCount", checked)}
                                        />
                                        <span className="text-sm">Show Product Count</span>
                                    </div>
                                </div>
                            </div>
                        </CardBody>
                    </Card>

                    <Card className="shadow-sm">
                        <CardHeader className="pb-3">
                            <div className="flex items-center gap-2">
                                <Eye className="w-5 h-5 text-gray-600" />
                                <h4 className="font-semibold">Preview</h4>
                            </div>
                        </CardHeader>
                        <CardBody className="pt-0">
                            <div className="bg-gray-100 rounded-lg p-6">
                                <div className="text-center mb-6">
                                    <h3 className="text-xl font-bold mb-2">{categoriesData.title}</h3>
                                    <p className="text-gray-600">{categoriesData.subtitle}</p>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    {Array.from({ length: Math.min(categoriesData.displayCount, 6) }).map((_, i) => (
                                        <div key={i} className="bg-white rounded-lg p-4 text-center">
                                            {categoriesData.showImages && (
                                                <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-2"></div>
                                            )}
                                            <h4 className="font-medium">Category {i + 1}</h4>
                                            {categoriesData.showProductCount && (
                                                <p className="text-sm text-gray-500">{Math.floor(Math.random() * 50) + 10} items</p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </CardBody>
                    </Card>
                </>
            )}
        </div>
    );
}