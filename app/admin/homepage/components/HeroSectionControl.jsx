"use client";

import { useState, useEffect } from "react";
import { Card, CardBody, CardHeader, Button, Input, Textarea, Switch, Select, SelectItem } from "@heroui/react";
import { Image, Upload, Eye, Settings, Palette, Type, Save } from "lucide-react";
import { useHomepageSettings } from "@/lib/firestore/homepage/read";
import { updateSectionSettings } from "@/lib/firestore/homepage/write";
import toast from "react-hot-toast";

export default function HeroSectionControl({ autoSave = false }) {
    const { data: homepageSettings, mutate } = useHomepageSettings();
    const [heroData, setHeroData] = useState({
        enabled: true,
        title: "Nischal Fancy Store",
        subtitle: "Discover our curated collection of premium products at NFS.",
        primaryButtonText: "Shop Collection",
        primaryButtonLink: "/shop",
        secondaryButtonText: "Our Story",
        secondaryButtonLink: "/about",
        backgroundImage: "https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg",
        featuredImage: "https://images.pexels.com/photos/1926769/pexels-photo-1926769.jpeg",
        overlayOpacity: 5,
        textAlignment: "left",
        showRating: false,
        ratingValue: 4.9,
        ratingCount: "2.5k+",
        backgroundColor: "gradient",
        gradientFrom: "gray-50",
        gradientTo: "white"
    });
    const [isSaving, setIsSaving] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);
    const [previewDevice, setPreviewDevice] = useState('desktop');
    const [showGrid, setShowGrid] = useState(false);
    const [showRuler, setShowRuler] = useState(false);

    useEffect(() => {
        if (homepageSettings.heroSection) {
            setHeroData(prev => ({ ...prev, ...homepageSettings.heroSection }));
        }
    }, [homepageSettings]);

    const handleInputChange = async (field, value) => {
        setHeroData(prev => ({ ...prev, [field]: value }));
        setHasChanges(true);
        
        if (autoSave) {
            try {
                const newData = { ...heroData, [field]: value };
                await updateSectionSettings("heroSection", newData);
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
            await updateSectionSettings("heroSection", heroData);
            if (mutate) mutate();
            setHasChanges(false);
            toast.success("Hero section saved successfully!");
        } catch (error) {
            console.error('Hero section save error:', error);
            toast.error(error.message || "Failed to save hero section");
        } finally {
            setIsSaving(false);
        }
    };

    const handleImageUpload = async (file, field) => {
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('folder', 'homepage');
            
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            });
            
            if (!response.ok) throw new Error('Upload failed');
            
            const result = await response.json();
            handleInputChange(field, result.url);
            toast.success('Image uploaded successfully!');
        } catch (error) {
            toast.error('Failed to upload image');
        }
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
                                isSelected={heroData.enabled}
                                onValueChange={(checked) => handleInputChange("enabled", checked)}
                            />
                        </div>
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
                                <div className="space-y-2">
                                    <Input
                                        label="Background Image URL"
                                        value={heroData.backgroundImage}
                                        onChange={(e) => handleInputChange("backgroundImage", e.target.value)}
                                        variant="bordered"
                                    />
                                    <div className="flex gap-2">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => e.target.files[0] && handleImageUpload(e.target.files[0], "backgroundImage")}
                                            className="hidden"
                                            id="bg-image-upload"
                                        />
                                        <Button
                                            size="sm"
                                            variant="bordered"
                                            onClick={() => document.getElementById('bg-image-upload').click()}
                                            startContent={<Upload size={14} />}
                                        >
                                            Upload
                                        </Button>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Input
                                        label="Featured Image URL"
                                        value={heroData.featuredImage}
                                        onChange={(e) => handleInputChange("featuredImage", e.target.value)}
                                        variant="bordered"
                                    />
                                    <div className="flex gap-2">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => e.target.files[0] && handleImageUpload(e.target.files[0], "featuredImage")}
                                            className="hidden"
                                            id="featured-image-upload"
                                        />
                                        <Button
                                            size="sm"
                                            variant="bordered"
                                            onClick={() => document.getElementById('featured-image-upload').click()}
                                            startContent={<Upload size={14} />}
                                        >
                                            Upload
                                        </Button>
                                    </div>
                                </div>
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
                            <div className="flex items-center justify-between w-full">
                                <div className="flex items-center gap-2">
                                    <Eye className="w-5 h-5 text-gray-600" />
                                    <h4 className="font-semibold">Live Preview</h4>
                                </div>
                                <Button
                                    size="sm"
                                    variant="bordered"
                                    onClick={() => {
                                        const url = `/admin/homepage/preview?data=${encodeURIComponent(JSON.stringify(heroData))}`;
                                        window.open(url, '_blank', 'width=1200,height=800');
                                    }}
                                >
                                    Full Screen Preview
                                </Button>
                            </div>
                        </CardHeader>
                        <CardBody className="pt-0">
                            <div className="space-y-4">
                                {/* Preview Controls */}
                                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div className="flex items-center gap-4">
                                        <Select
                                            size="sm"
                                            label="Screen Size"
                                            selectedKeys={[previewDevice]}
                                            onSelectionChange={(keys) => setPreviewDevice(Array.from(keys)[0])}
                                            className="w-40"
                                        >
                                            <SelectItem key="4k" value="4k">4K (3840px)</SelectItem>
                                            <SelectItem key="desktop" value="desktop">Desktop (1920px)</SelectItem>
                                            <SelectItem key="laptop" value="laptop">Laptop (1366px)</SelectItem>
                                            <SelectItem key="tablet" value="tablet">Tablet (768px)</SelectItem>
                                            <SelectItem key="mobile" value="mobile">Mobile (375px)</SelectItem>
                                            <SelectItem key="small" value="small">Small (320px)</SelectItem>
                                        </Select>
                                        
                                        <Switch
                                            size="sm"
                                            isSelected={showGrid}
                                            onValueChange={setShowGrid}
                                        >
                                            Grid
                                        </Switch>
                                        
                                        <Switch
                                            size="sm"
                                            isSelected={showRuler}
                                            onValueChange={setShowRuler}
                                        >
                                            Ruler
                                        </Switch>
                                    </div>
                                    
                                    <div className="text-sm text-gray-600">
                                        {previewDevice === '4k' && '3840px'}
                                        {previewDevice === 'desktop' && '1920px'}
                                        {previewDevice === 'laptop' && '1366px'}
                                        {previewDevice === 'tablet' && '768px'}
                                        {previewDevice === 'mobile' && '375px'}
                                        {previewDevice === 'small' && '320px'}
                                    </div>
                                </div>

                                {/* Live Preview */}
                                <div className="relative border rounded-lg overflow-hidden bg-white">
                                    {showRuler && (
                                        <div className="absolute top-0 left-0 right-0 h-4 bg-gray-200 border-b flex items-center justify-center text-xs text-gray-600 z-20">
                                            {previewDevice === '4k' && '3840px × 600px'}
                                            {previewDevice === 'desktop' && '1920px × 600px'}
                                            {previewDevice === 'laptop' && '1366px × 600px'}
                                            {previewDevice === 'tablet' && '768px × 600px'}
                                            {previewDevice === 'mobile' && '375px × 600px'}
                                            {previewDevice === 'small' && '320px × 600px'}
                                        </div>
                                    )}
                                    
                                    <div 
                                        className={`relative transition-all duration-300 mx-auto ${
                                            previewDevice === '4k' ? 'w-full' :
                                            previewDevice === 'desktop' ? 'w-full max-w-7xl' :
                                            previewDevice === 'laptop' ? 'w-full max-w-5xl' :
                                            previewDevice === 'tablet' ? 'w-full max-w-3xl' :
                                            previewDevice === 'mobile' ? 'w-full max-w-sm' :
                                            'w-full max-w-xs'
                                        } ${showRuler ? 'mt-4' : ''}`}
                                        style={{ minHeight: '400px' }}
                                    >
                                        <div 
                                            className="relative w-full h-full flex items-center justify-center overflow-hidden rounded-lg"
                                            style={{
                                                backgroundImage: heroData.backgroundImage ? `url('${heroData.backgroundImage}')` : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                backgroundSize: 'cover',
                                                backgroundPosition: 'center',
                                                minHeight: '400px'
                                            }}
                                            suppressHydrationWarning
                                        >
                                            {showGrid && (
                                                <div className="absolute inset-0 opacity-20 z-10" style={{
                                                    backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
                                                    backgroundSize: '20px 20px'
                                                }}></div>
                                            )}
                                            
                                            <div 
                                                className="absolute inset-0 bg-black transition-opacity duration-300"
                                                style={{ opacity: heroData.overlayOpacity / 100 }}
                                            ></div>
                                            
                                            <div className={`relative z-10 text-white px-6 max-w-4xl transition-all duration-300 ${
                                                heroData.textAlignment === 'center' ? 'text-center' :
                                                heroData.textAlignment === 'right' ? 'text-right' : 'text-left'
                                            }`}>
                                                <h1 className={`font-bold mb-4 transition-all duration-300 ${
                                                    previewDevice === '4k' ? 'text-6xl md:text-8xl' :
                                                    previewDevice === 'desktop' ? 'text-4xl md:text-6xl' :
                                                    previewDevice === 'laptop' ? 'text-3xl md:text-5xl' :
                                                    previewDevice === 'tablet' ? 'text-2xl md:text-4xl' :
                                                    previewDevice === 'mobile' ? 'text-xl md:text-2xl' :
                                                    'text-lg md:text-xl'
                                                }`}>
                                                    {heroData.title || 'Your Title Here'}
                                                </h1>
                                                
                                                <p className={`opacity-90 mb-6 transition-all duration-300 ${
                                                    previewDevice === '4k' ? 'text-xl md:text-2xl' :
                                                    previewDevice === 'desktop' ? 'text-lg md:text-xl' :
                                                    previewDevice === 'laptop' ? 'text-base md:text-lg' :
                                                    previewDevice === 'tablet' ? 'text-sm md:text-base' :
                                                    previewDevice === 'mobile' ? 'text-xs md:text-sm' :
                                                    'text-xs'
                                                }`}>
                                                    {heroData.subtitle || 'Your subtitle description goes here'}
                                                </p>
                                                
                                                <div className={`flex gap-3 mb-6 transition-all duration-300 ${
                                                    previewDevice === 'mobile' || previewDevice === 'small' ? 'flex-col' : 'flex-row'
                                                } ${
                                                    heroData.textAlignment === 'center' ? 'justify-center' :
                                                    heroData.textAlignment === 'right' ? 'justify-end' : 'justify-start'
                                                }`}>
                                                    <button className={`bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors ${
                                                        previewDevice === '4k' ? 'px-12 py-4 text-xl' :
                                                        previewDevice === 'desktop' ? 'px-8 py-3 text-base' :
                                                        previewDevice === 'laptop' ? 'px-6 py-3 text-base' :
                                                        previewDevice === 'tablet' ? 'px-6 py-2 text-sm' :
                                                        previewDevice === 'mobile' ? 'px-4 py-2 text-sm w-full' :
                                                        'px-3 py-1 text-xs w-full'
                                                    }`}>
                                                        {heroData.primaryButtonText || 'Primary Button'}
                                                    </button>
                                                    
                                                    <button className={`border-2 border-white text-white hover:bg-white hover:text-black rounded-lg font-semibold transition-colors ${
                                                        previewDevice === '4k' ? 'px-12 py-4 text-xl' :
                                                        previewDevice === 'desktop' ? 'px-8 py-3 text-base' :
                                                        previewDevice === 'laptop' ? 'px-6 py-3 text-base' :
                                                        previewDevice === 'tablet' ? 'px-6 py-2 text-sm' :
                                                        previewDevice === 'mobile' ? 'px-4 py-2 text-sm w-full' :
                                                        'px-3 py-1 text-xs w-full'
                                                    }`}>
                                                        {heroData.secondaryButtonText || 'Secondary Button'}
                                                    </button>
                                                </div>

                                                {heroData.showRating && (
                                                    <div className={`flex items-center gap-3 transition-all duration-300 ${
                                                        heroData.textAlignment === 'center' ? 'justify-center' :
                                                        heroData.textAlignment === 'right' ? 'justify-end' : 'justify-start'
                                                    }`}>
                                                        <div className="flex text-yellow-400 text-lg">
                                                            {'★'.repeat(Math.floor(heroData.ratingValue || 5))}{'☆'.repeat(5 - Math.floor(heroData.ratingValue || 5))}
                                                        </div>
                                                        <span className="font-semibold">{heroData.ratingValue || '5.0'}</span>
                                                        <span className="opacity-75">({heroData.ratingCount || '1k+'} reviews)</span>
                                                    </div>
                                                )}
                                            </div>

                                            {heroData.featuredImage && previewDevice !== 'mobile' && previewDevice !== 'small' && (
                                                <div className={`absolute top-1/2 transform -translate-y-1/2 transition-all duration-300 ${
                                                    previewDevice === '4k' ? 'right-12 w-96 h-96' :
                                                    previewDevice === 'desktop' ? 'right-8 w-80 h-80' :
                                                    previewDevice === 'laptop' ? 'right-6 w-64 h-64' :
                                                    'right-4 w-48 h-48'
                                                }`}>
                                                    <img 
                                                        src={heroData.featuredImage} 
                                                        alt="Featured" 
                                                        className="w-full h-full object-cover rounded-xl shadow-2xl" 
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Preview Info */}
                                <div className="grid grid-cols-3 gap-4 text-center">
                                    <div className="p-3 bg-blue-50 rounded-lg">
                                        <div className="text-sm font-medium text-blue-900">Background</div>
                                        <div className="text-xs text-blue-600">{heroData.backgroundImage ? 'Custom Image' : 'Gradient'}</div>
                                    </div>
                                    <div className="p-3 bg-green-50 rounded-lg">
                                        <div className="text-sm font-medium text-green-900">Overlay</div>
                                        <div className="text-xs text-green-600">{heroData.overlayOpacity}% Opacity</div>
                                    </div>
                                    <div className="p-3 bg-purple-50 rounded-lg">
                                        <div className="text-sm font-medium text-purple-900">Alignment</div>
                                        <div className="text-xs text-purple-600 capitalize">{heroData.textAlignment}</div>
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