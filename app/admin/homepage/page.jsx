"use client";

import { useState } from "react";
import { Card, CardBody, CardHeader, Button, Switch, Input, Textarea, Select, SelectItem, Chip } from "@heroui/react";
import { Settings, Eye, Edit, Plus, Trash2, Image, ArrowUp, ArrowDown, Save, Monitor, Smartphone, Tablet } from "lucide-react";
import HeroSectionControl from "./components/HeroSectionControl";
import FeaturedProductsControl from "./components/FeaturedProductsControl";
import CategoriesControl from "./components/CategoriesControl";
import BannersControl from "./components/BannersControl";
import NewsletterControl from "./components/NewsletterControl";
import FeaturesControl from "./components/FeaturesControl";

export default function HomepageControlPage() {
    const [activeSection, setActiveSection] = useState("hero");
    const [previewMode, setPreviewMode] = useState("desktop");
    const [isLivePreview, setIsLivePreview] = useState(false);

    const sections = [
        { id: "hero", name: "Hero Section", icon: Image, enabled: true },
        { id: "features", name: "Features", icon: Settings, enabled: true },
        { id: "categories", name: "Categories", icon: Edit, enabled: true },
        { id: "featured", name: "Featured Products", icon: Plus, enabled: true },
        { id: "banners", name: "Promotional Banners", icon: Image, enabled: false },
        { id: "newsletter", name: "Newsletter", icon: Settings, enabled: true },
    ];

    const renderSectionControl = () => {
        switch (activeSection) {
            case "hero":
                return <HeroSectionControl />;
            case "features":
                return <FeaturesControl />;
            case "categories":
                return <CategoriesControl />;
            case "featured":
                return <FeaturedProductsControl />;
            case "banners":
                return <BannersControl />;
            case "newsletter":
                return <NewsletterControl />;
            default:
                return <HeroSectionControl />;
        }
    };

    return (
        <main className="p-6 space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold">Homepage Control</h1>
                    <p className="text-gray-600">Manage your homepage content and layout</p>
                </div>
                
                <div className="flex items-center gap-4">
                    {/* Preview Mode Toggle */}
                    <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                        <Button
                            size="sm"
                            variant={previewMode === "desktop" ? "solid" : "light"}
                            onClick={() => setPreviewMode("desktop")}
                            isIconOnly
                        >
                            <Monitor size={16} />
                        </Button>
                        <Button
                            size="sm"
                            variant={previewMode === "tablet" ? "solid" : "light"}
                            onClick={() => setPreviewMode("tablet")}
                            isIconOnly
                        >
                            <Tablet size={16} />
                        </Button>
                        <Button
                            size="sm"
                            variant={previewMode === "mobile" ? "solid" : "light"}
                            onClick={() => setPreviewMode("mobile")}
                            isIconOnly
                        >
                            <Smartphone size={16} />
                        </Button>
                    </div>

                    {/* Live Preview Toggle */}
                    <div className="flex items-center gap-2">
                        <Switch
                            isSelected={isLivePreview}
                            onValueChange={setIsLivePreview}
                            size="sm"
                        />
                        <span className="text-sm">Live Preview</span>
                    </div>

                    {/* Preview Button */}
                    <Button
                        as="a"
                        href="/"
                        target="_blank"
                        variant="bordered"
                        startContent={<Eye size={16} />}
                    >
                        Preview Homepage
                    </Button>

                    {/* Save Changes */}
                    <Button
                        color="primary"
                        startContent={<Save size={16} />}
                    >
                        Save Changes
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Sidebar - Section Navigation */}
                <div className="lg:col-span-1">
                    <Card className="shadow-sm">
                        <CardHeader className="pb-3">
                            <h3 className="text-lg font-semibold">Page Sections</h3>
                        </CardHeader>
                        <CardBody className="pt-0">
                            <div className="space-y-2">
                                {sections.map((section) => {
                                    const Icon = section.icon;
                                    return (
                                        <div
                                            key={section.id}
                                            className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                                                activeSection === section.id
                                                    ? "bg-blue-100 border-2 border-blue-200"
                                                    : "bg-gray-50 hover:bg-gray-100"
                                            }`}
                                            onClick={() => setActiveSection(section.id)}
                                        >
                                            <div className="flex items-center gap-3">
                                                <Icon size={18} className={activeSection === section.id ? "text-blue-600" : "text-gray-600"} />
                                                <span className={`font-medium ${activeSection === section.id ? "text-blue-900" : "text-gray-700"}`}>
                                                    {section.name}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Chip
                                                    color={section.enabled ? "success" : "default"}
                                                    size="sm"
                                                    variant="flat"
                                                >
                                                    {section.enabled ? "ON" : "OFF"}
                                                </Chip>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Section Order Controls */}
                            <div className="mt-6 pt-6 border-t">
                                <h4 className="font-medium mb-3">Section Order</h4>
                                <div className="space-y-2">
                                    {sections.filter(s => s.enabled).map((section, index) => (
                                        <div key={section.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                            <span className="text-sm">{section.name}</span>
                                            <div className="flex gap-1">
                                                <Button size="sm" variant="light" isIconOnly>
                                                    <ArrowUp size={14} />
                                                </Button>
                                                <Button size="sm" variant="light" isIconOnly>
                                                    <ArrowDown size={14} />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </CardBody>
                    </Card>
                </div>

                {/* Main Content - Section Controls */}
                <div className="lg:col-span-3">
                    {renderSectionControl()}
                </div>
            </div>
        </main>
    );
}