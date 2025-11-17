"use client";

import { useState, useEffect } from "react";
import { Card, CardBody, CardHeader, Button, Switch, Input, Select, SelectItem, Divider } from "@heroui/react";
import { Settings, Plus, Trash2, Save, Star } from "lucide-react";
import { useHomepageSettings } from "@/lib/firestore/homepage/read";
import { updateSectionSettings } from "@/lib/firestore/homepage/write";
import toast from "react-hot-toast";

export default function FeaturesControl({ autoSave }) {
  const { data: homepageSettings, mutate } = useHomepageSettings();
  const [featuresData, setFeaturesData] = useState(null);

  useEffect(() => {
    if (homepageSettings?.featuresSection) {
      setFeaturesData(homepageSettings.featuresSection);
    }
  }, [homepageSettings?.featuresSection?.title]);

  if (!featuresData) return null;

  const handleInputChange = (field, value) => {
    const newData = { ...featuresData, [field]: value };
    setFeaturesData(newData);
    
    if (autoSave) {
      handleSave(newData);
    }
  };

  const handleFeatureChange = (index, field, value) => {
    const newFeatures = [...featuresData.features];
    newFeatures[index] = { ...newFeatures[index], [field]: value };
    const newData = { ...featuresData, features: newFeatures };
    setFeaturesData(newData);
    
    if (autoSave) {
      handleSave(newData);
    }
  };

  const addFeature = () => {
    const newFeatures = [...featuresData.features, { icon: "star", title: "New Feature", description: "Feature description" }];
    const newData = { ...featuresData, features: newFeatures };
    setFeaturesData(newData);
  };

  const removeFeature = (index) => {
    const newFeatures = featuresData.features.filter((_, i) => i !== index);
    const newData = { ...featuresData, features: newFeatures };
    setFeaturesData(newData);
  };

  const handleSave = async (dataToSave = featuresData) => {
    try {
      await updateSectionSettings('featuresSection', dataToSave);
      if (mutate) mutate();
      toast.success('Features section updated!');
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
          </div>

          <Divider />

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="font-medium">Features ({featuresData.features?.length || 0})</h4>
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
              {featuresData.features?.map((feature, index) => (
                <Card key={index} className="border">
                  <CardBody className="space-y-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h5 className="font-medium">{feature.title}</h5>
                        <p className="text-sm text-gray-600">{feature.description}</p>
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
                      <Input
                        label="Icon"
                        value={feature.icon}
                        onChange={(e) => handleFeatureChange(index, 'icon', e.target.value)}
                        variant="bordered"
                      />
                      
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
              ))}
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
