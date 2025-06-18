"use client";

import { useState } from "react";
import { Card, CardBody, CardHeader, Button, Input, Switch, Select, SelectItem } from "@heroui/react";
import { Image, Plus, X, Edit, Eye } from "lucide-react";

export default function BannersControl() {
    const [sectionData, setSectionData] = useState({
        enabled: false,
        banners: [
            {
                id: 1,
                title: "Mid Month Sale",
                subtitle: "Up to 50% off on selected items",
                buttonText: "Shop Now",
                buttonLink: "/sale",
                imageUrl: "",
                backgroundColor: "#ff6b35",
                textColor: "#ffffff",
                position: "center",
                enabled: true
            }
        ]
    });

    const [editingBanner, setEditingBanner] = useState(null);

    const handleSectionToggle = (enabled) => {
        setSectionData(prev => ({ ...prev, enabled }));
    };

    const addNewBanner = () => {
        const newBanner = {
            id: Date.now(),
            title: "New Banner",
            subtitle: "Banner description",
            buttonText: "Learn More",
            buttonLink: "/",
            imageUrl: "",
            backgroundColor: "#3b82f6",
            textColor: "#ffffff",
            position: "center",
            enabled: true
        };
        setSectionData(prev => ({
            ...prev,
            banners: [...prev.banners, newBanner]
        }));
        setEditingBanner(newBanner.id);
    };

    const updateBanner = (bannerId, updates) => {
        setSectionData(prev => ({
            ...prev,
            banners: prev.banners.map(banner =>
                banner.id === bannerId ? { ...banner, ...updates } : banner
            )
        }));
    };

    const removeBanner = (bannerId) => {
        setSectionData(prev => ({
            ...prev,
            banners: prev.banners.filter(banner => banner.id !== bannerId)
        }));
    };

    return (
        <div className="space-y-6">
            {/* Section Header */}
            <Card className="shadow-sm">
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-2">
                            <Image className="w-5 h-5 text-gray-600" />
                            <h3 className="text-lg font-semibold">Promotional Banners</h3>
                        </div>
                        <Switch
                            isSelected={sectionData.enabled}
                            onValueChange={handleSectionToggle}
                        />
                    </div>
                </CardHeader>
            </Card>

            {sectionData.enabled && (
                <>
                    {/* Banners Management */}
                    <Card className="shadow-sm">
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between w-full">
                                <h4 className="font-semibold">Manage Banners</h4>
                                <Button
                                    color="primary"
                                    size="sm"
                                    startContent={<Plus size={16} />}
                                    onClick={addNewBanner}
                                >
                                    Add Banner
                                </Button>
                            </div>
                        </CardHeader>
                        <CardBody className="pt-0 space-y-4">
                            {sectionData.banners.map((banner) => {
                                const isEditing = editingBanner === banner.id;

                                return (
                                    <div key={banner.id} className="border rounded-lg p-4">
                                        {isEditing ? (
                                            <div className="space-y-4">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <Input
                                                        label="Title"
                                                        value={banner.title}
                                                        onChange={(e) => updateBanner(banner.id, { title: e.target.value })}
                                                        variant="bordered"
                                                    />
                                                    <Input
                                                        label="Subtitle"
                                                        value={banner.subtitle}
                                                        onChange={(e) => updateBanner(banner.id, { subtitle: e.target.value })}
                                                        variant="bordered"
                                                    />
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <Input
                                                        label="Button Text"
                                                        value={banner.buttonText}
                                                        onChange={(e) => updateBanner(banner.id, { buttonText: e.target.value })}
                                                        variant="bordered"
                                                    />
                                                    <Input
                                                        label="Button Link"
                                                        value={banner.buttonLink}
                                                        onChange={(e) => updateBanner(banner.id, { buttonLink: e.target.value })}
                                                        variant="bordered"
                                                    />
                                                </div>
                                                <Input
                                                    label="Image URL"
                                                    value={banner.imageUrl}
                                                    onChange={(e) => updateBanner(banner.id, { imageUrl: e.target.value })}
                                                    variant="bordered"
                                                />
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                    <Input
                                                        label="Background Color"
                                                        type="color"
                                                        value={banner.backgroundColor}
                                                        onChange={(e) => updateBanner(banner.id, { backgroundColor: e.target.value })}
                                                        variant="bordered"
                                                    />
                                                    <Input
                                                        label="Text Color"
                                                        type="color"
                                                        value={banner.textColor}
                                                        onChange={(e) => updateBanner(banner.id, { textColor: e.target.value })}
                                                        variant="bordered"
                                                    />
                                                    <Select
                                                        label="Text Position"
                                                        selectedKeys={[banner.position]}
                                                        onSelectionChange={(keys) => updateBanner(banner.id, { position: Array.from(keys)[0] })}
                                                    >
                                                        <SelectItem key="left" value="left">Left</SelectItem>
                                                        <SelectItem key="center" value="center">Center</SelectItem>
                                                        <SelectItem key="right" value="right">Right</SelectItem>
                                                    </Select>
                                                </div>
                                                <div className="flex gap-2">
                                                    <Button
                                                        color="primary"
                                                        size="sm"
                                                        onClick={() => setEditingBanner(null)}
                                                    >
                                                        Save
                                                    </Button>
                                                    <Button
                                                        variant="light"
                                                        size="sm"
                                                        onClick={() => setEditingBanner(null)}
                                                    >
                                                        Cancel
                                                    </Button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <div 
                                                        className="w-16 h-10 rounded border"
                                                        style={{ backgroundColor: banner.backgroundColor }}
                                                    ></div>
                                                    <div>
                                                        <h5 className="font-medium">{banner.title}</h5>
                                                        <p className="text-sm text-gray-600">{banner.subtitle}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Switch
                                                        isSelected={banner.enabled}
                                                        onValueChange={(enabled) => updateBanner(banner.id, { enabled })}
                                                        size="sm"
                                                    />
                                                    <Button
                                                        size="sm"
                                                        variant="light"
                                                        isIconOnly
                                                        onClick={() => setEditingBanner(banner.id)}
                                                    >
                                                        <Edit size={16} />
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="light"
                                                        color="danger"
                                                        isIconOnly
                                                        onClick={() => removeBanner(banner.id)}
                                                    >
                                                        <X size={16} />
                                                    </Button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
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
                        <CardBody className="pt-0 space-y-4">
                            {sectionData.banners
                                .filter(banner => banner.enabled)
                                .map((banner) => (
                                <div 
                                    key={banner.id}
                                    className="rounded-lg p-8 min-h-32 flex items-center"
                                    style={{ 
                                        backgroundColor: banner.backgroundColor,
                                        color: banner.textColor,
                                        textAlign: banner.position
                                    }}
                                >
                                    <div className="w-full">
                                        <h3 className="text-2xl font-bold mb-2">{banner.title}</h3>
                                        <p className="mb-4">{banner.subtitle}</p>
                                        <Button
                                            size="sm"
                                            style={{ 
                                                backgroundColor: banner.textColor,
                                                color: banner.backgroundColor
                                            }}
                                        >
                                            {banner.buttonText}
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </CardBody>
                    </Card>
                </>
            )}
        </div>
    );
}