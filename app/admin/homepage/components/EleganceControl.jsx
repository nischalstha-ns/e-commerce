"use client";

import { useState, useEffect } from "react";
import { Card, CardBody, CardHeader, Button, Switch, Input, Textarea, Select, SelectItem, Divider } from "@heroui/react";
import { Image, Save } from "lucide-react";
import { useHomepageSettings } from "@/lib/firestore/homepage/read";
import { updateSectionSettings } from "@/lib/firestore/homepage/write";
import toast from "react-hot-toast";

export default function EleganceControl({ autoSave }) {
  const { data: homepageSettings, mutate } = useHomepageSettings();
  const [eleganceData, setEleganceData] = useState(null);

  useEffect(() => {
    if (homepageSettings?.eleganceSection) {
      setEleganceData(homepageSettings.eleganceSection);
    }
  }, [homepageSettings?.eleganceSection?.title]);

  if (!eleganceData) return null;

  const handleInputChange = (field, value) => {
    const newData = { ...eleganceData, [field]: value };
    setEleganceData(newData);
    
    if (autoSave) {
      handleSave(newData);
    }
  };

  const handleSave = async (dataToSave = eleganceData) => {
    try {
      await updateSectionSettings('eleganceSection', dataToSave);
      if (mutate) mutate();
      toast.success('Elegance section updated!');
    } catch (error) {
      toast.error('Failed to update elegance section');
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex justify-between">
          <div>
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Image size={20} />
              Elegance Section Settings
            </h3>
            <p className="text-sm text-gray-600">Configure elegance showcase section</p>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              isSelected={eleganceData.enabled}
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
                value={eleganceData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                variant="bordered"
              />
              <Select
                label="Text Alignment"
                selectedKeys={[eleganceData.textAlignment || 'left']}
                onSelectionChange={(keys) => handleInputChange('textAlignment', Array.from(keys)[0])}
              >
                <SelectItem key="left">Left</SelectItem>
                <SelectItem key="center">Center</SelectItem>
                <SelectItem key="right">Right</SelectItem>
              </Select>
            </div>
            
            <Textarea
              label="Subtitle"
              value={eleganceData.subtitle}
              onChange={(e) => handleInputChange('subtitle', e.target.value)}
              variant="bordered"
              rows={3}
            />
          </div>

          <Divider />

          <div className="space-y-4">
            <h4 className="font-medium">Button</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Button Text"
                value={eleganceData.primaryButtonText}
                onChange={(e) => handleInputChange('primaryButtonText', e.target.value)}
                variant="bordered"
              />
              <Input
                label="Button Link"
                value={eleganceData.primaryButtonLink}
                onChange={(e) => handleInputChange('primaryButtonLink', e.target.value)}
                variant="bordered"
              />
            </div>
          </div>

          <Divider />

          <div className="space-y-4">
            <h4 className="font-medium">Featured Image</h4>
            <Input
              label="Image URL"
              value={eleganceData.featuredImage}
              onChange={(e) => handleInputChange('featuredImage', e.target.value)}
              variant="bordered"
              placeholder="https://example.com/image.jpg"
            />
            {eleganceData.featuredImage && (
              <div className="mt-4">
                <p className="text-sm text-gray-600 mb-2">Preview:</p>
                <img src={eleganceData.featuredImage} alt="Preview" className="w-full max-w-md rounded-lg" />
              </div>
            )}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
