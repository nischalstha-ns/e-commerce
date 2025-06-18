"use client";

import { useState } from "react";
import { Card, CardBody, CardHeader, Button, Input, Switch, Textarea } from "@heroui/react";
import { Shield, Truck, Star, Headphones, Plus, X, Edit } from "lucide-react";

export default function FeaturesControl() {
    const [sectionData, setSectionData] = useState({
        enabled: true,
        features: [
            {
                id: 1,
                icon: "Truck",
                title: "Free Shipping",
                description: "On orders over Rs. 500",
                enabled: true
            },
            {
                id: 2,
                icon: "Shield",
                title: "Secure Payment",
                description: "100% secure checkout",
                enabled: true
            },
            {
                id: 3,
                icon: "Star",
                title: "Premium Quality",
                description: "Carefully curated items",
                enabled: true
            },
            {
                id: 4,
                icon: "Headphones",
                title: "24/7 Support",
                description: "Always here to help",
                enabled: true
            }
        ]
    });

    const [editingFeature, setEditingFeature] = useState(null);

    const iconOptions = [
        { value: "Truck", label: "Truck (Shipping)" },
        { value: "Shield", label: "Shield (Security)" },
        { value: "Star", label: "Star (Quality)" },
        { value: "Headphones", label: "Headphones (Support)" },
        { value: "Package", label: "Package (Products)" },
        { value: "CreditCard", label: "Credit Card (Payment)" },
        { value: "Clock", label: "Clock (Time)" },
        { value: "Award", label: "Award (Achievement)" }
    ];

    const handleSectionToggle = (enabled) => {
        setSectionData(prev => ({ ...prev, enabled }));
    };

    const handleFeatureToggle = (featureId, enabled) => {
        setSectionData(prev => ({
            ...prev,
            features: prev.features.map(feature =>
                feature.id === featureId ? { ...feature, enabled } : feature
            )
        }));
    };

    const handleFeatureUpdate = (featureId, updates) => {
        setSectionData(prev => ({
            ...prev,
            features: prev.features.map(feature =>
                feature.id === featureId ? { ...feature, ...updates } : feature
            )
        }));
        setEditingFeature(null);
    };

    const addNewFeature = () => {
        const newFeature = {
            id: Date.now(),
            icon: "Star",
            title: "New Feature",
            description: "Feature description",
            enabled: true
        };
        setSectionData(prev => ({
            ...prev,
            features: [...prev.features, newFeature]
        }));
        setEditingFeature(newFeature.id);
    };

    const removeFeature = (featureId) => {
        setSectionData(prev => ({
            ...prev,
            features: prev.features.filter(feature => feature.id !== featureId)
        }));
    };

    const getIconComponent = (iconName) => {
        const icons = { Truck, Shield, Star, Headphones };
        return icons[iconName] || Star;
    };

    return (
        <div className="space-y-6">
            {/* Section Header */}
            <Card className="shadow-sm">
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-2">
                            <Star className="w-5 h-5 text-gray-600" />
                            <h3 className="text-lg font-semibold">Features Section</h3>
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
                    {/* Features Management */}
                    <Card className="shadow-sm">
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between w-full">
                                <h4 className="font-semibold">Manage Features</h4>
                                <Button
                                    color="primary"
                                    size="sm"
                                    startContent={<Plus size={16} />}
                                    onClick={addNewFeature}
                                >
                                    Add Feature
                                </Button>
                            </div>
                        </CardHeader>
                        <CardBody className="pt-0 space-y-4">
                            {sectionData.features.map((feature) => {
                                const IconComponent = getIconComponent(feature.icon);
                                const isEditing = editingFeature === feature.id;

                                return (
                                    <div key={feature.id} className="border rounded-lg p-4">
                                        {isEditing ? (
                                            <div className="space-y-4">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <Input
                                                        label="Title"
                                                        value={feature.title}
                                                        onChange={(e) => handleFeatureUpdate(feature.id, { title: e.target.value })}
                                                        variant="bordered"
                                                    />
                                                    <select
                                                        value={feature.icon}
                                                        onChange={(e) => handleFeatureUpdate(feature.id, { icon: e.target.value })}
                                                        className="border rounded-lg px-3 py-2"
                                                    >
                                                        {iconOptions.map(option => (
                                                            <option key={option.value} value={option.value}>
                                                                {option.label}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <Textarea
                                                    label="Description"
                                                    value={feature.description}
                                                    onChange={(e) => handleFeatureUpdate(feature.id, { description: e.target.value })}
                                                    variant="bordered"
                                                    rows={2}
                                                />
                                                <div className="flex gap-2">
                                                    <Button
                                                        color="primary"
                                                        size="sm"
                                                        onClick={() => setEditingFeature(null)}
                                                    >
                                                        Save
                                                    </Button>
                                                    <Button
                                                        variant="light"
                                                        size="sm"
                                                        onClick={() => setEditingFeature(null)}
                                                    >
                                                        Cancel
                                                    </Button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                                                        <IconComponent className="w-6 h-6 text-gray-600" />
                                                    </div>
                                                    <div>
                                                        <h5 className="font-medium">{feature.title}</h5>
                                                        <p className="text-sm text-gray-600">{feature.description}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Switch
                                                        isSelected={feature.enabled}
                                                        onValueChange={(enabled) => handleFeatureToggle(feature.id, enabled)}
                                                        size="sm"
                                                    />
                                                    <Button
                                                        size="sm"
                                                        variant="light"
                                                        isIconOnly
                                                        onClick={() => setEditingFeature(feature.id)}
                                                    >
                                                        <Edit size={16} />
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="light"
                                                        color="danger"
                                                        isIconOnly
                                                        onClick={() => removeFeature(feature.id)}
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
                            <h4 className="font-semibold">Preview</h4>
                        </CardHeader>
                        <CardBody className="pt-0">
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                                {sectionData.features
                                    .filter(feature => feature.enabled)
                                    .map((feature) => {
                                        const IconComponent = getIconComponent(feature.icon);
                                        return (
                                            <div key={feature.id} className="text-center group">
                                                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-gray-100 transition-colors">
                                                    <IconComponent className="w-8 h-8 text-gray-700" />
                                                </div>
                                                <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
                                                <p className="text-gray-600 text-sm">{feature.description}</p>
                                            </div>
                                        );
                                    })}
                            </div>
                        </CardBody>
                    </Card>
                </>
            )}
        </div>
    );
}