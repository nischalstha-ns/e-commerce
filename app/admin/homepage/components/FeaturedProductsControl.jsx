"use client";

import { useState, useEffect } from "react";
import { Card, CardBody, CardHeader, Button, Input, Switch, Select, SelectItem, Textarea } from "@heroui/react";
import { Star, Save, Eye, Filter } from "lucide-react";
import { useHomepageSettings } from "@/lib/firestore/homepage/read";
import { updateSectionSettings } from "@/lib/firestore/homepage/write";
import toast from "react-hot-toast";

export default function FeaturedProductsControl({ autoSave = false }) {
    const { data: homepageSettings, mutate } = useHomepageSettings();
    const [featuredData, setFeaturedData] = useState({
        enabled: true,
        title: "Featured Products",
        subtitle: "Handpicked favorites",
        displayCount: 8,
        layout: "grid",
        showRating: true,
        showPrice: true,
        showDiscount: true,
        filterBy: "featured",
        sortBy: "popularity",
        showQuickView: true,
        showWishlist: true
    });
    const [isSaving, setIsSaving] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);

    useEffect(() => {
        if (homepageSettings.featuredSection) {
            setFeaturedData(prev => ({ ...prev, ...homepageSettings.featuredSection }));
        }
    }, [homepageSettings]);

    const handleInputChange = async (field, value) => {
        setFeaturedData(prev => ({ ...prev, [field]: value }));
        setHasChanges(true);
        
        if (autoSave) {
            try {
                const newData = { ...featuredData, [field]: value };
                await updateSectionSettings("featuredSection", newData);
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
            await updateSectionSettings("featuredSection", featuredData);
            if (mutate) mutate();
            setHasChanges(false);
            toast.success("Featured products section saved successfully!");
        } catch (error) {
            console.error('Featured products save error:', error);
            toast.error(error.message || "Failed to save featured products section");
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
                            <Star className="w-5 h-5 text-gray-600" />
                            <h3 className="text-lg font-semibold">Featured Products Section</h3>
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
                                isSelected={featuredData.enabled}
                                onValueChange={(checked) => handleInputChange("enabled", checked)}
                            />
                        </div>
                    </div>
                </CardHeader>
            </Card>

            {featuredData.enabled && (
                <>
                    <Card className="shadow-sm">
                        <CardHeader className="pb-3">
                            <h4 className="font-semibold">Content Settings</h4>
                        </CardHeader>
                        <CardBody className="pt-0 space-y-4">
                            <Input
                                label="Section Title"
                                value={featuredData.title}
                                onChange={(e) => handleInputChange("title", e.target.value)}
                                variant="bordered"
                            />
                            
                            <Input
                                label="Subtitle"
                                value={featuredData.subtitle}
                                onChange={(e) => handleInputChange("subtitle", e.target.value)}
                                variant="bordered"
                            />

                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <Input
                                    label="Display Count"
                                    type="number"
                                    value={featuredData.displayCount}
                                    onChange={(e) => handleInputChange("displayCount", parseInt(e.target.value))}
                                    variant="bordered"
                                    min="1"
                                    max="20"
                                />

                                <Select
                                    label="Layout Style"
                                    selectedKeys={[featuredData.layout]}
                                    onSelectionChange={(keys) => handleInputChange("layout", Array.from(keys)[0])}
                                >
                                    <SelectItem key="grid" value="grid">Grid</SelectItem>
                                    <SelectItem key="carousel" value="carousel">Carousel</SelectItem>
                                    <SelectItem key="masonry" value="masonry">Masonry</SelectItem>
                                </Select>

                                <Select
                                    label="Filter By"
                                    selectedKeys={[featuredData.filterBy]}
                                    onSelectionChange={(keys) => handleInputChange("filterBy", Array.from(keys)[0])}
                                >
                                    <SelectItem key="featured" value="featured">Featured</SelectItem>
                                    <SelectItem key="bestseller" value="bestseller">Best Sellers</SelectItem>
                                    <SelectItem key="newest" value="newest">Newest</SelectItem>
                                    <SelectItem key="sale" value="sale">On Sale</SelectItem>
                                </Select>

                                <Select
                                    label="Sort By"
                                    selectedKeys={[featuredData.sortBy]}
                                    onSelectionChange={(keys) => handleInputChange("sortBy", Array.from(keys)[0])}
                                >
                                    <SelectItem key="popularity" value="popularity">Popularity</SelectItem>
                                    <SelectItem key="price_low" value="price_low">Price: Low to High</SelectItem>
                                    <SelectItem key="price_high" value="price_high">Price: High to Low</SelectItem>
                                    <SelectItem key="rating" value="rating">Rating</SelectItem>
                                </Select>
                            </div>
                        </CardBody>
                    </Card>

                    <Card className="shadow-sm">
                        <CardHeader className="pb-3">
                            <h4 className="font-semibold">Display Options</h4>
                        </CardHeader>
                        <CardBody className="pt-0">
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                <div className="flex items-center gap-2">
                                    <Switch
                                        size="sm"
                                        isSelected={featuredData.showRating}
                                        onValueChange={(checked) => handleInputChange("showRating", checked)}
                                    />
                                    <span className="text-sm">Show Rating</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Switch
                                        size="sm"
                                        isSelected={featuredData.showPrice}
                                        onValueChange={(checked) => handleInputChange("showPrice", checked)}
                                    />
                                    <span className="text-sm">Show Price</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Switch
                                        size="sm"
                                        isSelected={featuredData.showDiscount}
                                        onValueChange={(checked) => handleInputChange("showDiscount", checked)}
                                    />
                                    <span className="text-sm">Show Discount</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Switch
                                        size="sm"
                                        isSelected={featuredData.showQuickView}
                                        onValueChange={(checked) => handleInputChange("showQuickView", checked)}
                                    />
                                    <span className="text-sm">Quick View</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Switch
                                        size="sm"
                                        isSelected={featuredData.showWishlist}
                                        onValueChange={(checked) => handleInputChange("showWishlist", checked)}
                                    />
                                    <span className="text-sm">Wishlist Button</span>
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
                                    <h3 className="text-xl font-bold mb-2">{featuredData.title}</h3>
                                    <p className="text-gray-600">{featuredData.subtitle}</p>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {Array.from({ length: Math.min(featuredData.displayCount, 8) }).map((_, i) => (
                                        <div key={i} className="bg-white rounded-lg p-3">
                                            <div className="w-full h-32 bg-gray-200 rounded mb-2"></div>
                                            <h4 className="font-medium text-sm mb-1">Product {i + 1}</h4>
                                            {featuredData.showRating && (
                                                <div className="flex items-center gap-1 mb-1">
                                                    <Star size={12} className="text-yellow-400 fill-current" />
                                                    <span className="text-xs">4.5</span>
                                                </div>
                                            )}
                                            {featuredData.showPrice && (
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-sm">₹{(Math.random() * 1000 + 100).toFixed(0)}</span>
                                                    {featuredData.showDiscount && (
                                                        <span className="text-xs text-gray-500 line-through">₹{(Math.random() * 200 + 1200).toFixed(0)}</span>
                                                    )}
                                                </div>
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