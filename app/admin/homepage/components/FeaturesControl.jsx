"use client";

import { useState, useEffect } from "react";
import { Card, CardBody, CardHeader, Button, Switch, Input, Select, SelectItem, Divider } from "@heroui/react";
import { Settings, Plus, Trash2, Save, Star, Shield, Truck, Headphones } from "lucide-react";
import { useHomepageSettings } from "@/lib/firestore/homepage/read";
import { updateSectionSettings } from "@/lib/firestore/homepage/write";
import toast from "react-hot-toast";

const iconOptions = [
  { key: "truck", label: "Truck (Shipping)", icon: Truck },
  { key: "shield", label: "Shield (Security)", icon: Shield },
  { key: "star", label: "Star (Quality)", icon: Star },
  { key: "headphones", label: "Headphones (Support)", icon: Headphones },
  { key: "settings", label: "Settings (Service)", icon: Settings }
];

export default function FeaturesControl({ autoSave }) {
  const { data: homepageSettings, mutate } = useHomepageSettings();
  const [featuresData, setFeaturesData] = useState({
    enabled: true,
    title: "Why Choose Us",
    subtitle: "Key benefits and features",
    layout: "grid-4",
    features: [
      { icon: "truck", title: "Free Shipping", description: "On orders over Rs. 500" },
      { icon: "shield", title: "Secure Payment", description: "100% secure checkout" },
      { icon: "star", title: "Premium Quality", description: "Carefully curated items" },
      { icon: "headphones", title: "24/7 Support", description: "Always here to help" }
    ]
  });

  useEffect(() => {
    if (homepageSettings?.featuresSection) {
      setFeaturesData(prev => ({ ...prev, ...homepageSettings.featuresSection }));
    }
  }, [homepageSettings]);

  const handleInputChange = (field, value) => {
    setFeaturesData(prev => ({ ...prev, [field]: value }));
    
    if (autoSave) {
      handleSave({ ...featuresData, [field]: value });
    }
  };

  const handleFeatureChange = (index, field, value) => {
    const newFeatures = [...featuresData.features];
    newFeatures[index] = { ...newFeatures[index], [field]: value };
    setFeaturesData(prev => ({ ...prev, features: newFeatures }));
    
    if (autoSave) {
      handleSave({ ...featuresData, features: newFeatures });
    }
  };

  const addFeature = () => {
    const newFeature = { icon: "star", title: "New Feature", description: "Feature description" };
    const newFeatures = [...featuresData.features, newFeature];
    setFeaturesData(prev => ({ ...prev, features: newFeatures }));
  };

  const removeFeature = (index) => {
    const newFeatures = featuresData.features.filter((_, i) => i !== index);
    setFeaturesData(prev => ({ ...prev, features: newFeatures }));
  };

  const handleSave = async (dataToSave = featuresData) => {
    try {
      await updateSectionSettings('featuresSection', dataToSave);
      if (mutate) mutate();
      toast.success('Features section updated successfully!');
    } catch (error) {
      toast.error('Failed to update features section');
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex justify-between">
          <div>
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Settings size={20} />
              Features Section Settings
            </h3>
            <p className="text-sm text-gray-600">Configure key benefits and features</p>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              isSelected={featuresData.enabled}
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
          {/* Section Settings */}
          <div className="space-y-4">
            <h4 className="font-medium">Section Content</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Section Title"
                value={featuresData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                variant="bordered"
              />
              <Input
                label="Section Subtitle"
                value={featuresData.subtitle}
                onChange={(e) => handleInputChange('subtitle', e.target.value)}
                variant="bordered"
              />
            </div>
            
            <Select
              label="Layout Style"
              selectedKeys={[featuresData.layout]}
              onSelectionChange={(keys) => handleInputChange('layout', Array.from(keys)[0])}
            >
              <SelectItem key="grid-2">2 Columns</SelectItem>
              <SelectItem key="grid-3">3 Columns</SelectItem>
              <SelectItem key="grid-4">4 Columns</SelectItem>
              <SelectItem key="list">Vertical List</SelectItem>
            </Select>
          </div>

          <Divider />

          {/* Features Management */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="font-medium">Features ({featuresData.features.length})</h4>
              <Button
                size="sm"
                color="primary"
                variant="bordered"
                startContent={<Plus size={16} />}
                onClick={addFeature}
              >
                Add Feature
              </Button>
            </div>

            <div className="space-y-4">
              {featuresData.features.map((feature, index) => {
                const IconComponent = iconOptions.find(opt => opt.key === feature.icon)?.icon || Star;
                
                return (
                  <Card key={index} className="border">
                    <CardBody className="space-y-4">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                            <IconComponent size={20} className="text-gray-600" />
                          </div>
                          <div>
                            <h5 className="font-medium">{feature.title}</h5>
                            <p className="text-sm text-gray-600">{feature.description}</p>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          color="danger"
                          variant="light"
                          isIconOnly
                          onClick={() => removeFeature(index)}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Select
                          label="Icon"
                          selectedKeys={[feature.icon]}
                          onSelectionChange={(keys) => handleFeatureChange(index, 'icon', Array.from(keys)[0])}
                        >
                          {iconOptions.map((option) => (
                            <SelectItem key={option.key}>{option.label}</SelectItem>
                          ))}
                        </Select>
                        
                        <Input
                          label="Title"
                          value={feature.title}
                          onChange={(e) => handleFeatureChange(index, 'title', e.target.value)}
                          variant="bordered"
                        />
                        
                        <Input
                          label="Description"
                          value={feature.description}
                          onChange={(e) => handleFeatureChange(index, 'description', e.target.value)}
                          variant="bordered"
                        />
                      </div>
                    </CardBody>
                  </Card>
                );
              })}
            </div>
          </div>

          <Divider />

          {/* Preview */}
          <div className="space-y-4">
            <h4 className="font-medium">Live Preview</h4>
            <div className="p-6 bg-gray-50 rounded-lg">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold mb-2">{featuresData.title}</h3>
                <p className="text-gray-600">{featuresData.subtitle}</p>
              </div>
              
              <div className={`grid gap-6 ${
                featuresData.layout === 'grid-2' ? 'grid-cols-2' :
                featuresData.layout === 'grid-3' ? 'grid-cols-3' :
                featuresData.layout === 'grid-4' ? 'grid-cols-4' :
                'grid-cols-1'
              }`}>
                {featuresData.features.map((feature, index) => {
                  const IconComponent = iconOptions.find(opt => opt.key === feature.icon)?.icon || Star;
                  
                  return (
                    <div key={index} className="text-center">
                      <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                        <IconComponent size={24} className="text-blue-600" />
                      </div>
                      <h4 className="font-semibold mb-2">{feature.title}</h4>
                      <p className="text-sm text-gray-600">{feature.description}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}