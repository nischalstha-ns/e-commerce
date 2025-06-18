"use client";

import { useState } from "react";
import { Card, CardBody, CardHeader, Button, Input, Textarea, Switch, Select, SelectItem } from "@heroui/react";
import { Mail, Settings, Palette, Eye } from "lucide-react";

export default function NewsletterControl() {
    const [sectionData, setSectionData] = useState({
        enabled: true,
        title: "Stay in the Loop",
        subtitle: "Be the first to know about new arrivals, exclusive offers, and behind-the-scenes stories",
        buttonText: "Subscribe",
        placeholderText: "Enter your email",
        disclaimerText: "No spam, unsubscribe at any time",
        backgroundColor: "gray-900",
        textColor: "white",
        layout: "center", // center, left, right
        showDisclaimer: true
    });

    const handleInputChange = (field, value) => {
        setSectionData(prev => ({ ...prev, [field]: value }));
    };

    const backgroundOptions = [
        { value: "gray-900", label: "Dark Gray" },
        { value: "blue-600", label: "Blue" },
        { value: "purple-600", label: "Purple" },
        { value: "green-600", label: "Green" },
        { value: "red-600", label: "Red" },
        { value: "white", label: "White" }
    ];

    const textColorOptions = [
        { value: "white", label: "White" },
        { value: "black", label: "Black" },
        { value: "gray-600", label: "Gray" }
    ];

    return (
        <div className="space-y-6">
            {/* Section Header */}
            <Card className="shadow-sm">
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-2">
                            <Mail className="w-5 h-5 text-gray-600" />
                            <h3 className="text-lg font-semibold">Newsletter Section</h3>
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
                                <h4 className="font-semibold">Content Settings</h4>
                            </div>
                        </CardHeader>
                        <CardBody className="pt-0 space-y-4">
                            <Input
                                label="Section Title"
                                value={sectionData.title}
                                onChange={(e) => handleInputChange("title", e.target.value)}
                                variant="bordered"
                            />

                            <Textarea
                                label="Subtitle"
                                value={sectionData.subtitle}
                                onChange={(e) => handleInputChange("subtitle", e.target.value)}
                                variant="bordered"
                                rows={3}
                            />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input
                                    label="Button Text"
                                    value={sectionData.buttonText}
                                    onChange={(e) => handleInputChange("buttonText", e.target.value)}
                                    variant="bordered"
                                />
                                <Input
                                    label="Email Placeholder"
                                    value={sectionData.placeholderText}
                                    onChange={(e) => handleInputChange("placeholderText", e.target.value)}
                                    variant="bordered"
                                />
                            </div>

                            <div className="flex items-center gap-4">
                                <Switch
                                    isSelected={sectionData.showDisclaimer}
                                    onValueChange={(checked) => handleInputChange("showDisclaimer", checked)}
                                />
                                <span>Show Disclaimer</span>
                            </div>

                            {sectionData.showDisclaimer && (
                                <Input
                                    label="Disclaimer Text"
                                    value={sectionData.disclaimerText}
                                    onChange={(e) => handleInputChange("disclaimerText", e.target.value)}
                                    variant="bordered"
                                />
                            )}
                        </CardBody>
                    </Card>

                    {/* Design Settings */}
                    <Card className="shadow-sm">
                        <CardHeader className="pb-3">
                            <div className="flex items-center gap-2">
                                <Palette className="w-5 h-5 text-gray-600" />
                                <h4 className="font-semibold">Design Settings</h4>
                            </div>
                        </CardHeader>
                        <CardBody className="pt-0 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <Select
                                    label="Background Color"
                                    selectedKeys={[sectionData.backgroundColor]}
                                    onSelectionChange={(keys) => handleInputChange("backgroundColor", Array.from(keys)[0])}
                                >
                                    {backgroundOptions.map(option => (
                                        <SelectItem key={option.value} value={option.value}>
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </Select>

                                <Select
                                    label="Text Color"
                                    selectedKeys={[sectionData.textColor]}
                                    onSelectionChange={(keys) => handleInputChange("textColor", Array.from(keys)[0])}
                                >
                                    {textColorOptions.map(option => (
                                        <SelectItem key={option.value} value={option.value}>
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </Select>

                                <Select
                                    label="Layout"
                                    selectedKeys={[sectionData.layout]}
                                    onSelectionChange={(keys) => handleInputChange("layout", Array.from(keys)[0])}
                                >
                                    <SelectItem key="center" value="center">Center</SelectItem>
                                    <SelectItem key="left" value="left">Left Aligned</SelectItem>
                                    <SelectItem key="right" value="right">Right Aligned</SelectItem>
                                </Select>
                            </div>
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
                            <div 
                                className={`py-16 px-6 rounded-lg bg-${sectionData.backgroundColor} text-${sectionData.textColor}`}
                                style={{ textAlign: sectionData.layout }}
                            >
                                <div className="max-w-4xl mx-auto">
                                    <h2 className="text-3xl font-light mb-6">{sectionData.title}</h2>
                                    <p className="text-lg mb-8 max-w-2xl mx-auto opacity-90">
                                        {sectionData.subtitle}
                                    </p>
                                    <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                                        <input
                                            type="email"
                                            placeholder={sectionData.placeholderText}
                                            className="flex-1 px-6 py-3 rounded-lg bg-white text-gray-900 placeholder-gray-500"
                                            readOnly
                                        />
                                        <Button
                                            size="lg"
                                            className="bg-white text-gray-900 hover:bg-gray-100 px-8 py-3 font-medium"
                                        >
                                            {sectionData.buttonText}
                                        </Button>
                                    </div>
                                    {sectionData.showDisclaimer && (
                                        <p className="text-sm opacity-70 mt-4">
                                            {sectionData.disclaimerText}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </CardBody>
                    </Card>
                </>
            )}
        </div>
    );
}