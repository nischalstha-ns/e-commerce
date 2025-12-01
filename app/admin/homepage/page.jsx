"use client";

import { useState, useMemo } from "react";
import AdminOnly from "../components/AdminOnly";
import { Card, CardBody, CardHeader, Button, Switch, Input, Textarea, Select, SelectItem, Chip } from "@heroui/react";
import { Settings, Eye, Edit, Plus, Trash2, Image, ArrowUp, ArrowDown, Save, Monitor, Smartphone, Tablet, Trash } from "lucide-react";
import { useHomepageSettings } from "@/lib/firestore/homepage/read";
import { updateSectionSettings, saveHomepageSettings } from "@/lib/firestore/homepage/write";
import toast from "react-hot-toast";
import HeroSectionControl from "./components/HeroSectionControl";
import FeaturedProductsControl from "./components/FeaturedProductsControl";
import CategoriesControl from "./components/CategoriesControl";
import NewsletterControl from "./components/NewsletterControl";
import FeaturesControl from "./components/FeaturesControl";
import EleganceControl from "./components/EleganceControl";

export default function HomepageControlPage() {
    const [activeSection, setActiveSection] = useState("hero");
    const [previewMode, setPreviewMode] = useState("desktop");
    const [isLivePreview, setIsLivePreview] = useState(true);
    const [autoSave, setAutoSave] = useState(false);
    const { data: homepageSettings, mutate } = useHomepageSettings();

    const sections = useMemo(() => [
        { id: "hero", name: "Hero Section", icon: Image, enabled: homepageSettings?.heroSection?.enabled ?? true, description: "Main banner with call-to-action" },
        { id: "elegance", name: "Elegance", icon: Image, enabled: homepageSettings?.eleganceSection?.enabled ?? true, description: "Elegance showcase section" },
        { id: "features", name: "Features", icon: Settings, enabled: homepageSettings?.featuresSection?.enabled ?? true, description: "Key benefits and features" },
        { id: "categories", name: "Categories", icon: Edit, enabled: homepageSettings?.categoriesSection?.enabled ?? true, description: "Product category showcase" },
        { id: "featured", name: "Featured Products", icon: Plus, enabled: homepageSettings?.featuredSection?.enabled ?? true, description: "Highlighted product collection" },
        { id: "newsletter", name: "Newsletter", icon: Settings, enabled: homepageSettings?.newsletterSection?.enabled ?? true, description: "Email subscription form" },
    ], [homepageSettings]);

    const handleSectionToggle = async (sectionId, enabled) => {
        try {
            const currentSection = homepageSettings[`${sectionId}Section`] || {};
            await updateSectionSettings(`${sectionId}Section`, { ...currentSection, enabled });
            if (mutate) mutate();
            toast.success(`${sectionId} section ${enabled ? 'enabled' : 'disabled'}`);
        } catch (error) {
            toast.error(`Failed to toggle ${sectionId} section`);
        }
    };

    const handleSectionReorder = async (dragIndex, dropIndex) => {
        try {
            const newOrder = [...(homepageSettings.sectionOrder || [])];
            const [removed] = newOrder.splice(dragIndex, 1);
            newOrder.splice(dropIndex, 0, removed);
            
            await updateSectionSettings('sectionOrder', newOrder);
            if (mutate) mutate();
            toast.success('Section order updated');
        } catch (error) {
            toast.error('Failed to reorder sections');
        }
    };

    const handleSaveAll = async () => {
        try {
            await saveHomepageSettings(homepageSettings);
            if (mutate) mutate();
            toast.success('All changes saved successfully!');
        } catch (error) {
            toast.error('Failed to save changes');
        }
    };

    const handleClearCache = async () => {
        try {
            if ('caches' in window) {
                const cacheNames = await caches.keys();
                await Promise.all(cacheNames.map(name => caches.delete(name)));
            }
            localStorage.clear();
            sessionStorage.clear();
            toast.success('Cache cleared! Refreshing...');
            setTimeout(() => window.location.reload(true), 500);
        } catch (error) {
            toast.error('Failed to clear cache');
        }
    };

    const renderSectionControl = () => {
        switch (activeSection) {
            case "hero":
                return <HeroSectionControl autoSave={autoSave} />;
            case "elegance":
                return <EleganceControl autoSave={autoSave} />;
            case "features":
                return <FeaturesControl autoSave={autoSave} />;
            case "categories":
                return <CategoriesControl autoSave={autoSave} />;
            case "featured":
                return <FeaturedProductsControl autoSave={autoSave} />;
            case "newsletter":
                return <NewsletterControl autoSave={autoSave} />;
            default:
                return <div className="p-8 text-center text-gray-500">Please select a section to edit</div>;
        }
    };

    return (
        <AdminOnly>
        <main className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold">Homepage Control</h1>
                    <p className="text-gray-600">Manage your homepage content and layout</p>
                </div>
                
                <div className="flex items-center gap-4">
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

                    <div className="flex items-center gap-2">
                        <Switch
                            isSelected={isLivePreview}
                            onValueChange={setIsLivePreview}
                            size="sm"
                        />
                        <span className="text-sm">Live Preview</span>
                    </div>

                    <div className="flex items-center gap-2">
                        <Switch
                            isSelected={autoSave}
                            onValueChange={setAutoSave}
                            size="sm"
                            color={autoSave ? "success" : "default"}
                        />
                        <span className="text-sm">Auto Save</span>
                    </div>

                    <Button
                        as="a"
                        href="/"
                        target="_blank"
                        variant="bordered"
                        startContent={<Eye size={16} />}
                    >
                        Preview Homepage
                    </Button>

                    <Button
                        color="danger"
                        variant="bordered"
                        startContent={<Trash size={16} />}
                        onClick={handleClearCache}
                    >
                        Clear Cache
                    </Button>

                    <Button
                        color="primary"
                        startContent={<Save size={16} />}
                        onClick={handleSaveAll}
                    >
                        Save All Changes
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
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
                                            <div className="flex items-center gap-3 flex-1">
                                                <Icon size={18} className={activeSection === section.id ? "text-blue-600" : "text-gray-600"} />
                                                <div className="flex-1">
                                                    <span className={`font-medium block ${activeSection === section.id ? "text-blue-900" : "text-gray-700"}`}>
                                                        {section.name}
                                                    </span>
                                                    <span className="text-xs text-gray-500">{section.description}</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Switch
                                                    size="sm"
                                                    isSelected={section.enabled}
                                                    onValueChange={(enabled) => handleSectionToggle(section.id, enabled)}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="mt-6 pt-6 border-t">
                                <h4 className="font-medium mb-3">Section Order</h4>
                                <div className="space-y-2">
                                    {sections.filter(s => s.enabled).map((section, index) => (
                                        <div key={section.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                            <span className="text-sm">{section.name}</span>
                                            <div className="flex gap-1">
                                                <Button 
                                                    size="sm" 
                                                    variant="light" 
                                                    isIconOnly
                                                    isDisabled={index === 0}
                                                    onClick={() => handleSectionReorder(index, index - 1)}
                                                >
                                                    <ArrowUp size={14} />
                                                </Button>
                                                <Button 
                                                    size="sm" 
                                                    variant="light" 
                                                    isIconOnly
                                                    isDisabled={index === sections.filter(s => s.enabled).length - 1}
                                                    onClick={() => handleSectionReorder(index, index + 1)}
                                                >
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

                <div className="lg:col-span-3">
                    {renderSectionControl()}
                </div>
            </div>
        </main>
        </AdminOnly>
    );
}
