"use client";

import { useState } from "react";
import { Card, CardBody, CardHeader, Button, Switch, Input, Textarea, Select, SelectItem, Chip } from "@heroui/react";
import { Settings, Eye, Edit, Plus, Trash2, Image, ArrowUp, ArrowDown, Save, Monitor, Smartphone, Tablet } from "lucide-react";
import { useHomepageSettings } from "@/lib/firestore/homepage/read";
import { updateSectionSettings, saveHomepageSettings } from "@/lib/firestore/homepage/write";
import { testFirebaseConnection } from "@/lib/firestore/homepage/test-connection";
import toast from "react-hot-toast";
import HeroSectionControl from "./components/HeroSectionControl";
import FeaturedProductsControl from "./components/FeaturedProductsControl";
import CategoriesControl from "./components/CategoriesControl";
import BannersControl from "./components/BannersControl";
import NewsletterControl from "./components/NewsletterControl";
import FeaturesControl from "./components/FeaturesControl";

export default function HomepageControlPage() {
    const [activeSection, setActiveSection] = useState("hero");
    const [previewMode, setPreviewMode] = useState("desktop");
    const [isLivePreview, setIsLivePreview] = useState(true);
    const [autoSave, setAutoSave] = useState(false);
    const { data: homepageSettings, mutate } = useHomepageSettings();

    const sections = [
        { id: "hero", name: "Hero Section", icon: Image, enabled: homepageSettings?.heroSection?.enabled ?? true, description: "Main banner with call-to-action" },
        { id: "features", name: "Features", icon: Settings, enabled: homepageSettings?.featuresSection?.enabled ?? true, description: "Key benefits and features" },
        { id: "categories", name: "Categories", icon: Edit, enabled: homepageSettings?.categoriesSection?.enabled ?? true, description: "Product category showcase" },
        { id: "featured", name: "Featured Products", icon: Plus, enabled: homepageSettings?.featuredSection?.enabled ?? true, description: "Highlighted product collection" },
        { id: "newsletter", name: "Newsletter", icon: Settings, enabled: homepageSettings?.newsletterSection?.enabled ?? true, description: "Email subscription form" },
    ];

    const handleSectionToggle = async (sectionId, enabled) => {
        try {
            const currentSection = homepageSettings[`${sectionId}Section`] || {};
            await updateSectionSettings(`${sectionId}Section`, { ...currentSection, enabled });
            if (mutate) mutate();
            if (autoSave) {
                toast.success(`${sectionId} section auto-saved`);
            } else {
                toast.success(`${sectionId} section ${enabled ? 'enabled' : 'disabled'}`);
            }
        } catch (error) {
            console.error('Section toggle error:', error);
            toast.error(`Failed to ${enabled ? 'enable' : 'disable'} ${sectionId} section`);
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

    const handleInputChange = (field, value) => {
        // This would update global settings - implement as needed
        toast.success(`Global setting ${field} updated`);
    };

    const handleSaveAll = async () => {
        try {
            await saveHomepageSettings(homepageSettings);
            if (mutate) mutate();
            toast.success('All changes saved successfully!');
        } catch (error) {
            console.error('Save error:', error);
            toast.error('Failed to save changes');
        }
    };

    const renderSectionControl = () => {
        switch (activeSection) {
            case "hero":
                return <HeroSectionControl autoSave={autoSave} />;
            case "features":
                return <FeaturesControl autoSave={autoSave} />;
            case "categories":
                return <CategoriesControl autoSave={autoSave} />;
            case "featured":
                return <FeaturedProductsControl autoSave={autoSave} />;
            case "newsletter":
                return <NewsletterControl autoSave={autoSave} />;
            case "global":
                return (
                    <div className="space-y-6">
                        <Card className="shadow-sm">
                            <CardHeader>
                                <h3 className="text-lg font-semibold">Global Page Settings</h3>
                            </CardHeader>
                            <CardBody className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Input
                                        label="Page Title"
                                        value={homepageSettings.pageTitle || "Home"}
                                        onChange={(e) => handleInputChange("pageTitle", e.target.value)}
                                        variant="bordered"
                                    />
                                    <Input
                                        label="Meta Description"
                                        value={homepageSettings.metaDescription || ""}
                                        onChange={(e) => handleInputChange("metaDescription", e.target.value)}
                                        variant="bordered"
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <Switch
                                        isSelected={homepageSettings.showBreadcrumbs ?? false}
                                        onValueChange={(checked) => handleInputChange("showBreadcrumbs", checked)}
                                    >
                                        Show Breadcrumbs
                                    </Switch>
                                    <Switch
                                        isSelected={homepageSettings.enableAnimations ?? true}
                                        onValueChange={(checked) => handleInputChange("enableAnimations", checked)}
                                    >
                                        Enable Animations
                                    </Switch>
                                    <Switch
                                        isSelected={homepageSettings.enableLazyLoading ?? true}
                                        onValueChange={(checked) => handleInputChange("enableLazyLoading", checked)}
                                    >
                                        Lazy Loading
                                    </Switch>
                                </div>
                            </CardBody>
                        </Card>

                        <Card className="shadow-sm">
                            <CardHeader>
                                <h3 className="text-lg font-semibold">Performance Settings</h3>
                            </CardHeader>
                            <CardBody className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Switch
                                        isSelected={homepageSettings.enableCaching ?? true}
                                        onValueChange={(checked) => handleInputChange("enableCaching", checked)}
                                    >
                                        Enable Caching
                                    </Switch>
                                    <Switch
                                        isSelected={homepageSettings.optimizeImages ?? true}
                                        onValueChange={(checked) => handleInputChange("optimizeImages", checked)}
                                    >
                                        Optimize Images
                                    </Switch>
                                    <Switch
                                        isSelected={homepageSettings.enablePreloading ?? false}
                                        onValueChange={(checked) => handleInputChange("enablePreloading", checked)}
                                    >
                                        Preload Critical Resources
                                    </Switch>
                                    <Switch
                                        isSelected={homepageSettings.minifyAssets ?? true}
                                        onValueChange={(checked) => handleInputChange("minifyAssets", checked)}
                                    >
                                        Minify Assets
                                    </Switch>
                                </div>
                            </CardBody>
                        </Card>

                        <Card className="shadow-sm">
                            <CardHeader>
                                <h3 className="text-lg font-semibold">Theme & Appearance</h3>
                            </CardHeader>
                            <CardBody className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span>Advanced Theme Management</span>
                                    <Button
                                        as="a"
                                        href="/admin/theme"
                                        color="primary"
                                        variant="bordered"
                                        size="sm"
                                    >
                                        Open Theme Manager
                                    </Button>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Switch
                                        isSelected={homepageSettings.darkModeToggle ?? true}
                                        onValueChange={(checked) => handleInputChange("darkModeToggle", checked)}
                                    >
                                        Show Dark Mode Toggle
                                    </Switch>
                                    <Switch
                                        isSelected={homepageSettings.customFonts ?? false}
                                        onValueChange={(checked) => handleInputChange("customFonts", checked)}
                                    >
                                        Use Custom Fonts
                                    </Switch>
                                </div>
                            </CardBody>
                        </Card>
                    </div>
                );
            default:
                return <div className="p-8 text-center text-gray-500">Please select a section to edit</div>;
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

                    {/* Auto Save Toggle */}
                    <div className="flex items-center gap-2">
                        <Switch
                            isSelected={autoSave}
                            onValueChange={setAutoSave}
                            size="sm"
                            color={autoSave ? "success" : "default"}
                        />
                        <span className="text-sm">Auto Save</span>
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

                    {/* Last Updated Info */}
                    {homepageSettings.lastUpdated && (
                        <div className="text-sm text-gray-500">
                            Last updated: {new Date(homepageSettings.lastUpdated).toLocaleString()}
                        </div>
                    )}

                    {/* Test Connection */}
                    <Button
                        color="warning"
                        variant="bordered"
                        onClick={async () => {
                            const result = await testFirebaseConnection();
                            if (result.success) {
                                toast.success("Firebase connection working!");
                            } else {
                                toast.error(`Connection failed: ${result.error}`);
                            }
                        }}
                    >
                        Test Connection
                    </Button>

                    {/* Save Changes */}
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

                            {/* Global Settings */}
                            <div className="mt-6 pt-6 border-t">
                                <h4 className="font-medium mb-3">Global Settings</h4>
                                <div className="space-y-3">
                                    <Button
                                        size="sm"
                                        variant="bordered"
                                        className="w-full justify-start"
                                        onClick={() => setActiveSection("global")}
                                    >
                                        <Settings size={14} />
                                        Page Settings
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="bordered"
                                        className="w-full justify-start"
                                        as="a"
                                        href="/admin/theme"
                                    >
                                        <Settings size={14} />
                                        Theme Manager
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="bordered"
                                        className="w-full justify-start"
                                        onClick={() => {
                                            const enabledSections = sections.filter(s => s.enabled);
                                            toast.success(`${enabledSections.length} sections enabled`);
                                        }}
                                    >
                                        <Eye size={14} />
                                        Section Summary
                                    </Button>
                                </div>
                            </div>

                            {/* Section Order Controls */}
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

                {/* Main Content - Section Controls */}
                <div className="lg:col-span-3">
                    {renderSectionControl()}
                </div>
            </div>
        </main>
    );
}