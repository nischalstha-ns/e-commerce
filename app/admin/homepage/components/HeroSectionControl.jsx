"use client";

import { useState, useEffect } from "react";
import { Card, CardBody, CardHeader, Button, Switch, Input, Textarea, Select, SelectItem, Divider } from "@heroui/react";
import { Image, Save } from "lucide-react";
import { useHomepageSettings } from "@/lib/firestore/homepage/read";
import { updateSectionSettings } from "@/lib/firestore/homepage/write";
import toast from "react-hot-toast";

export default function HeroSectionControl({ autoSave }) {
  const { data: homepageSettings, mutate } = useHomepageSettings();
  const [heroData, setHeroData] = useState(null);

  useEffect(() => {
    if (homepageSettings?.heroSection) {
      setHeroData(homepageSettings.heroSection);
    }
  }, [homepageSettings?.heroSection?.title]);

  if (!heroData) return null;

  const handleInputChange = (field, value) => {
    const newData = { ...heroData, [field]: value };
    setHeroData(newData);
    
    if (autoSave) {
      handleSave(newData);
    }
  };

  const handleSave = async (dataToSave = heroData) => {
    try {
      await updateSectionSettings('heroSection', dataToSave);
      if (mutate) mutate();
      toast.success('Hero section updated!');
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
          <div className="space-y-4">
            <h4 className="font-medium">Content</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Main Title"
                value={heroData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                variant="bordered"
              />
              <Select
                label="Text Alignment"
                selectedKeys={[heroData.textAlignment || 'left']}
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
              rows={3}
            />
          </div>

          <Divider />

          <div className="space-y-4">
            <h4 className="font-medium">Buttons</h4>
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
              />
              <Input
                label="Secondary Button Text"
                value={heroData.secondaryButtonText || ''}
                onChange={(e) => handleInputChange('secondaryButtonText', e.target.value)}
                variant="bordered"
              />
              <Input
                label="Secondary Button Link"
                value={heroData.secondaryButtonLink || ''}
                onChange={(e) => handleInputChange('secondaryButtonLink', e.target.value)}
                variant="bordered"
              />
            </div>
          </div>

          <Divider />

          <div className="space-y-4">
            <h4 className="font-medium">Images</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Featured Image URL"
                value={heroData.featuredImage}
                onChange={(e) => handleInputChange('featuredImage', e.target.value)}
                variant="bordered"
              />
              <Input
                label="Background Image URL"
                value={heroData.backgroundImage || ''}
                onChange={(e) => handleInputChange('backgroundImage', e.target.value)}
                variant="bordered"
              />
            </div>
          </div>

          <Divider />

          <div className="space-y-4">
            <h4 className="font-medium">Design</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Background Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={heroData.backgroundColor || '#ffffff'}
                    onChange={(e) => handleInputChange('backgroundColor', e.target.value)}
                    className="w-12 h-10 rounded border cursor-pointer"
                  />
                  <Input
                    value={heroData.backgroundColor || '#ffffff'}
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
                    value={heroData.textColor || '#1e293b'}
                    onChange={(e) => handleInputChange('textColor', e.target.value)}
                    className="w-12 h-10 rounded border cursor-pointer"
                  />
                  <Input
                    value={heroData.textColor || '#1e293b'}
                    onChange={(e) => handleInputChange('textColor', e.target.value)}
                    size="sm"
                    variant="bordered"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Overlay Opacity: {heroData.overlayOpacity || 5}%</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={heroData.overlayOpacity || 5}
                  onChange={(e) => handleInputChange('overlayOpacity', parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
