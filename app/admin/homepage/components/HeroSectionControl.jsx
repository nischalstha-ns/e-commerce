"use client";

import { useState } from "react";
import { Card, CardBody, CardHeader, Button, Input, Textarea, Switch, Select, SelectItem } from "@heroui/react";
import { Image, Upload, Eye, Settings, Palette, Type } from "lucide-react";

export default function HeroSectionControl() {
    const [heroData, setHeroData] = useState({
        enabled: true,
        title: "Timeless Elegance",
        subtitle: "Discover our curated collection of premium products crafted with attention to detail and uncompromising quality.",
        primaryButtonText: "Shop Collection",
        primaryButtonLink: "/shop",
        secondaryButtonText: "Our Story",
        secondaryButtonLink: "/about",
        backgroundImage: "https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg",
        featuredImage: "https://images.pexels.com/photos/1926769/pexels-photo-1926769.jpeg",
        overlayOpacity: 5,
        textAlignment: "left",
        showRating: true,
        ratingValue: 4.9,
        ratingCount: "2.5k+",
        backgroundColor: "gradient",
        gradientFrom: "gray-50",
        gradientTo: "white"
    });

    const handleInputChange = (field, value) => {
        setHeroData(prev => ({ ...prev, [field]: value }));
    };

    return (
        <div className="space-y-6">
            {/* Section Header */}
            <Card className="shadow-sm">
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-2">
                            <Image className="w-5 h-5 text-gray-600" />
                            <h3 className="text-lg font-semibold">Hero Section</h3>
                        </div>
                        <Switch
                            isSelected={heroData.enabled}
                            onValueChange={(checked) => handleInputChange("enabled", checked)}
                        />
                    </div>
                </CardHeader>
            </Card>

            {heroData.enabled && (
                <>
                    {/* Content Settings */}
                    <Card className="shadow-sm">
                        <CardHeader className="pb-3">
                            <div className="flex items-center gap-2">
                                <Type className="w-5 h-5 text-gray-600" />
                                <h4 className="font-semibold">Content</h4>
                            </div>
                        </CardHeader>
                        <CardBody className="pt-0 space-y-4">
                            <Input
                                label="Main Title"
                                value={heroData.title}
                                onChange={(e) => handleInputChange("title", e.target.value)}
                                variant="bordered"
                            />
                            
                            <Textarea
                                label="Subtitle"
                                value={heroData.subtitle}
                                onChange={(e) => handleInputChange("subtitle", e.target.value)}
                                variant="bordered"
                                rows={3}
                            />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input
                                    label="Primary Button Text"
                                    value={heroData.primaryButtonText}
                                    onChange={(e) => handleInputChange("primaryButtonText", e.target.value)}
                                    variant="bordered"
                                />
                                <Input
                                    label="Primary Button Link"
                                    value={heroData.primaryButtonLink}
                                    onChange={(e) => handleInputChange("primaryButtonLink", e.target.value)}
                                    variant="bordered"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input
                                    label="Secondary Button Text"
                                    value={heroData.secondaryButtonText}
                                    onChange={(e) => handleInputChange("secondaryButtonText", e.target.value)}
                                    variant="bordered"
                                />
                                <Input
                                    label="Secondary Button Link"
                                    value={heroData.secondaryButtonLink}
                                    onChange={(e) => handleInputChange("secondaryButtonLink", e.target.value)}
                                    variant="bordered"
                                />
                            </div>
                        </CardBody>
                    </Card>

                    {/* Visual Settings */}
                    <Card className="shadow-sm">
                        <CardHeader className="pb-3">
                            <div className="flex items-center gap-2">
                                <Palette className="w-5 h-5 text-gray-600" />
                                <h4 className="font-semibold">Visual Design</h4>
                            </div>
                        </CardHeader>
                        <CardBody className="pt-0 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input
                                    label="Background Image URL"
                                    value={heroData.backgroundImage}
                                    onChange={(e) => handleInputChange("backgroundImage", e.target.value)}
                                    variant="bordered"
                                />
                                <Input
                                    label="Featured Image URL"
                                    value={heroData.featuredImage}
                                    onChange={(e) => handleInputChange("featuredImage", e.target.value)}
                                    variant="bordered"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <Select
                                    label="Text Alignment"
                                    selectedKeys={[heroData.textAlignment]}
                                    onSelectionChange={(keys) => handleInputChange("textAlignment", Array.from(keys)[0])}
                                >
                                    <SelectItem key="left" value="left">Left</SelectItem>
                                    <SelectItem key="center" value="center">Center</SelectItem>
                                    <SelectItem key="right" value="right">Right</SelectItem>
                                </Select>

                                <Input
                                    label="Overlay Opacity (%)"
                                    type="number"
                                    value={heroData.overlayOpacity}
                                    onChange={(e) => handleInputChange("overlayOpacity", e.target.value)}
                                    variant="bordered"
                                    min="0"
                                    max="100"
                                />

                                <Select
                                    label="Background Type"
                                    selectedKeys={[heroData.backgroundColor]}
                                    onSelectionChange={(keys) => handleInputChange("backgroundColor", Array.from(keys)[0])}
                                >
                                    <SelectItem key="gradient" value="gradient">Gradient</SelectItem>
                                    <SelectItem key="solid" value="solid">Solid Color</SelectItem>
                                    <SelectItem key="image" value="image">Image Only</SelectItem>
                                </Select>
                            </div>
                        </CardBody>
                    </Card>

                    {/* Rating Settings */}
                    <Card className="shadow-sm">
                        <CardHeader className="pb-3">
                            <div className="flex items-center gap-2">
                                <Settings className="w-5 h-5 text-gray-600" />
                                <h4 className="font-semibold">Rating Display</h4>
                            </div>
                        </CardHeader>
                        <CardBody className="pt-0 space-y-4">
                            <div className="flex items-center gap-4">
                                <Switch
                                    isSelected={heroData.showRating}
                                    onValueChange={(checked) => handleInputChange("showRating", checked)}
                                />
                                <span>Show Rating Badge</span>
                            </div>

                            {heroData.showRating && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Input
                                        label="Rating Value"
                                        type="number"
                                        value={heroData.ratingValue}
                                        onChange={(e) => handleInputChange("ratingValue", e.target.value)}
                                        variant="bordered"
                                        min="0"
                                        max="5"
                                        step="0.1"
                                    />
                                    <Input
                                        label="Rating Count"
                                        value={heroData.ratingCount}
                                        onChange={(e) => handleInputChange("ratingCount", e.target.value)}
                                        variant="bordered"
                                        placeholder="e.g., 2.5k+"
                                    />
                                </div>
                            )}
                        </CardBody>
                    </Card>

                    {/* Preview */}
                    <Card className="shadow-sm">
                        <CardHeader className="pb-3">
                            <div className="flex items-center gap-2">
                                <Eye className="w-5 h-5 text-gray-600" />
                                <h4 className="font-semibold">Preview</h4>
                            </div>
                        </CardHeader>
                        <CardBody className="pt-0">
                            <div className="bg-gray-100 rounded-lg p-4 min-h-48 flex items-center justify-center">
                                <div className="text-center">
                                    <h3 className="text-xl font-bold mb-2">{heroData.title}</h3>
                                    <p className="text-gray-600 mb-4">{heroData.subtitle}</p>
                                    <div className="flex gap-2 justify-center">
                                        <Button color="primary" size="sm">{heroData.primaryButtonText}</Button>
                                        <Button variant="bordered" size="sm">{heroData.secondaryButtonText}</Button>
                                    </div>
                                </div>
                            </div>
                        </CardBody>
                    </Card>
                </>
            )}
        </div>
    );
}