"use client";

import { useState, useEffect } from "react";
import { Card, CardBody, CardHeader, Button, Switch, Input, Textarea, Select, SelectItem, Divider } from "@heroui/react";
import { Image, Upload, Eye, Save, Palette } from "lucide-react";
import { useHomepageSettings } from "@/lib/firestore/homepage/read";
import { updateSectionSettings } from "@/lib/firestore/homepage/write";
import toast from "react-hot-toast";

export default function HeroSectionControl({ autoSave }) {
  const { data: homepageSettings, mutate } = useHomepageSettings();
  const [heroData, setHeroData] = useState({
    enabled: true,
    title: "Nischal Fancy Store",
    subtitle: "Discover our curated collection of premium products at NFS.",
    primaryButtonText: "Shop Collection",
    primaryButtonLink: "/shop",
    secondaryButtonText: "",
    secondaryButtonLink: "",
    featuredImage: "https://images.pexels.com/photos/1926769/pexels-photo-1926769.jpeg",
    backgroundImage: "",
    overlayOpacity: 5,
    textAlignment: "left",
    backgroundColor: "#ffffff",
    textColor: "#1e293b"
  });

  useEffect(() => {
    if (homepageSettings?.heroSection) {
      setHeroData(prev => ({ ...prev, ...homepageSettings.heroSection }));
    }
  }, [homepageSettings]);

  const handleInputChange = (field, value) => {
    setHeroData(prev => ({ ...prev, [field]: value }));
    
    if (autoSave) {
      handleSave({ ...heroData, [field]: value });
    }
  };

  const handleSave = async (dataToSave = heroData) => {
    try {
      await updateSectionSettings('heroSection', dataToSave);
      if (mutate) mutate();
      toast.success('Hero section updated successfully!');
    } catch (error) {
      toast.error('Failed to update hero section');
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex justify-between">
          <div>
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Image size={20} />
              Hero Section Settings
            </h3>
            <p className="text-sm text-gray-600">Configure your main homepage banner</p>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              isSelected={heroData.enabled}
              onValueChange={(enabled) => handleInputChange('enabled', enabled)}
            >
              Enable Section
            </Switch>
            {!autoSave && (
              <Button color="primary" onClick={() => handleSave()} startContent={<Save size={16} />}>
                Save Changes
              </Button>
            )}
          </div>
        </CardHeader>
        
        <CardBody className="space-y-6">
          {/* Content Settings */}
          <div className="space-y-4">
            <h4 className="font-medium">Content</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Main Title"
                value={heroData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                variant="bordered"
                placeholder="Enter hero title"
              />
              <Select
                label="Text Alignment"
                selectedKeys={[heroData.textAlignment]}
                onSelectionChange={(keys) => handleInputChange('textAlignment', Array.from(keys)[0])}
              >
                <SelectItem key="left">Left</SelectItem>
                <SelectItem key="center">Center</SelectItem>
                <SelectItem key="right">Right</SelectItem>
              </Select>
            </div>
            
            <Textarea
              label="Subtitle"
              value={heroData.subtitle}
              onChange={(e) => handleInputChange('subtitle', e.target.value)}
              variant="bordered"
              placeholder="Enter hero subtitle"
              rows={3}
            />
          </div>

          <Divider />

          {/* Button Settings */}
          <div className="space-y-4">
            <h4 className="font-medium">Call-to-Action Buttons</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Primary Button Text"
                value={heroData.primaryButtonText}
                onChange={(e) => handleInputChange('primaryButtonText', e.target.value)}
                variant="bordered"
              />
              <Input
                label="Primary Button Link"
                value={heroData.primaryButtonLink}
                onChange={(e) => handleInputChange('primaryButtonLink', e.target.value)}
                variant="bordered"
                placeholder="/shop"
              />
              <Input
                label="Secondary Button Text (Optional)"
                value={heroData.secondaryButtonText}
                onChange={(e) => handleInputChange('secondaryButtonText', e.target.value)}
                variant="bordered"
              />
              <Input
                label="Secondary Button Link"
                value={heroData.secondaryButtonLink}
                onChange={(e) => handleInputChange('secondaryButtonLink', e.target.value)}
                variant="bordered"
                placeholder="/about"
              />
            </div>
          </div>

          <Divider />

          {/* Visual Settings */}
          <div className="space-y-4">
            <h4 className="font-medium">Visual Design</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Featured Image URL"
                value={heroData.featuredImage}
                onChange={(e) => handleInputChange('featuredImage', e.target.value)}
                variant="bordered"
                placeholder="https://example.com/image.jpg"
              />
              <Input
                label="Background Image URL (Optional)"
                value={heroData.backgroundImage}
                onChange={(e) => handleInputChange('backgroundImage', e.target.value)}
                variant="bordered"
                placeholder="https://example.com/bg.jpg"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Background Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={heroData.backgroundColor}
                    onChange={(e) => handleInputChange('backgroundColor', e.target.value)}
                    className="w-12 h-10 rounded border cursor-pointer"
                  />
                  <Input
                    value={heroData.backgroundColor}
                    onChange={(e) => handleInputChange('backgroundColor', e.target.value)}
                    size="sm"
                    variant="bordered"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Text Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={heroData.textColor}
                    onChange={(e) => handleInputChange('textColor', e.target.value)}
                    className="w-12 h-10 rounded border cursor-pointer"
                  />
                  <Input
                    value={heroData.textColor}
                    onChange={(e) => handleInputChange('textColor', e.target.value)}
                    size="sm"
                    variant="bordered"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Overlay Opacity: {heroData.overlayOpacity}%</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={heroData.overlayOpacity}
                  onChange={(e) => handleInputChange('overlayOpacity', parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>
          </div>

          <Divider />

          {/* Preview */}
          <div className="space-y-4">
            <h4 className="font-medium">Live Preview</h4>
            <div 
              className="relative p-8 rounded-lg border-2 min-h-[300px] flex items-center"
              style={{
                backgroundColor: heroData.backgroundColor,
                backgroundImage: heroData.backgroundImage ? `url(${heroData.backgroundImage})` : 'none',
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            >
              {heroData.backgroundImage && (
                <div 
                  className="absolute inset-0 rounded-lg"
                  style={{ 
                    backgroundColor: 'black',
                    opacity: heroData.overlayOpacity / 100
                  }}
                />
              )}
              
              <div className={`relative z-10 flex-1 ${heroData.textAlignment === 'center' ? 'text-center' : heroData.textAlignment === 'right' ? 'text-right' : 'text-left'}`}>
                <h1 
                  className="text-4xl font-bold mb-4"
                  style={{ color: heroData.textColor }}
                >
                  {heroData.title || "Hero Title"}
                </h1>
                <p 
                  className="text-lg mb-6 opacity-90"
                  style={{ color: heroData.textColor }}
                >
                  {heroData.subtitle || "Hero subtitle goes here"}
                </p>
                <div className="flex gap-4 justify-start">
                  {heroData.primaryButtonText && (
                    <div className="px-6 py-3 bg-blue-600 text-white rounded-lg">
                      {heroData.primaryButtonText}
                    </div>
                  )}
                  {heroData.secondaryButtonText && (
                    <div className="px-6 py-3 border border-gray-300 rounded-lg">
                      {heroData.secondaryButtonText}
                    </div>
                  )}
                </div>
              </div>
              
              {heroData.featuredImage && (
                <div className="relative z-10 ml-8 hidden md:block">
                  <img 
                    src={heroData.featuredImage} 
                    alt="Featured" 
                    className="w-64 h-64 object-cover rounded-lg shadow-lg"
                  />
                </div>
              )}
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}