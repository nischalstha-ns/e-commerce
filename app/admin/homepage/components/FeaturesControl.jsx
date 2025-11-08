"use client";

import { useState, useEffect } from "react";
import { Card, CardBody, CardHeader, Button, Input, Textarea, Switch, Select, SelectItem } from "@heroui/react";
import { Settings, Save, Plus, Trash2, GripVertical } from "lucide-react";
import { useHomepageSettings } from "@/lib/firestore/homepage/read";
import { updateSectionSettings } from "@/lib/firestore/homepage/write";
import toast from "react-hot-toast";

const iconOptions = [
  { value: "truck", label: "Truck (Shipping)" },
  { value: "shield", label: "Shield (Security)" },
  { value: "star", label: "Star (Quality)" },
  { value: "headphones", label: "Headphones (Support)" },
  { value: "clock", label: "Clock (Fast)" },
  { value: "award", label: "Award (Premium)" },
  { value: "heart", label: "Heart (Care)" },
  { value: "globe", label: "Globe (Worldwide)" }
];

export default function FeaturesControl() {
  const { data: homepageSettings, mutate } = useHomepageSettings();
  const [featuresData, setFeaturesData] = useState({
    enabled: true,
    title: "Why Choose Us",
    features: [
      { icon: "truck", title: "Free Shipping", description: "On orders over Rs. 500" },
      { icon: "shield", title: "Secure Payment", description: "100% secure checkout" },
      { icon: "star", title: "Premium Quality", description: "Carefully curated items" },
      { icon: "headphones", title: "24/7 Support", description: "Always here to help" }
    ]
  });
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (homepageSettings.featuresSection) {
      setFeaturesData(prev => ({ ...prev, ...homepageSettings.featuresSection }));
    }
  }, [homepageSettings]);

  const handleInputChange = (field, value) => {
    setFeaturesData(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleFeatureChange = (index, field, value) => {
    const newFeatures = [...featuresData.features];
    newFeatures[index] = { ...newFeatures[index], [field]: value };
    setFeaturesData(prev => ({ ...prev, features: newFeatures }));
    setHasChanges(true);
  };

  const addFeature = () => {
    const newFeature = { icon: "star", title: "New Feature", description: "Feature description" };
    setFeaturesData(prev => ({
      ...prev,
      features: [...prev.features, newFeature]
    }));
    setHasChanges(true);
  };

  const removeFeature = (index) => {
    const newFeatures = featuresData.features.filter((_, i) => i !== index);
    setFeaturesData(prev => ({ ...prev, features: newFeatures }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateSectionSettings("featuresSection", featuresData);
      mutate();
      setHasChanges(false);
      toast.success("Features section saved successfully!");
    } catch (error) {
      toast.error(error.message || "Failed to save features section");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-gray-600" />
              <h3 className="text-lg font-semibold">Features Section</h3>
            </div>
            <div className="flex items-center gap-2">
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
              <Switch
                isSelected={featuresData.enabled}
                onValueChange={(checked) => handleInputChange("enabled", checked)}
              />
            </div>
          </div>
        </CardHeader>
      </Card>

      {featuresData.enabled && (
        <>
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <h4 className="font-semibold">Section Settings</h4>
            </CardHeader>
            <CardBody className="pt-0 space-y-4">
              <Input
                label="Section Title"
                value={featuresData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                variant="bordered"
              />
            </CardBody>
          </Card>

          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between w-full">
                <h4 className="font-semibold">Features</h4>
                <Button
                  size="sm"
                  color="primary"
                  startContent={<Plus size={16} />}
                  onClick={addFeature}
                >
                  Add Feature
                </Button>
              </div>
            </CardHeader>
            <CardBody className="pt-0 space-y-4">
              {featuresData.features.map((feature, index) => (
                <div key={index} className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <GripVertical size={16} className="text-gray-400" />
                      <span className="font-medium">Feature {index + 1}</span>
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
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <Select
                      label="Icon"
                      selectedKeys={[feature.icon]}
                      onSelectionChange={(keys) => handleFeatureChange(index, "icon", Array.from(keys)[0])}
                    >
                      {iconOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </Select>
                    
                    <Input
                      label="Title"
                      value={feature.title}
                      onChange={(e) => handleFeatureChange(index, "title", e.target.value)}
                      variant="bordered"
                    />
                    
                    <Input
                      label="Description"
                      value={feature.description}
                      onChange={(e) => handleFeatureChange(index, "description", e.target.value)}
                      variant="bordered"
                    />
                  </div>
                </div>
              ))}
            </CardBody>
          </Card>

          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <h4 className="font-semibold">Preview</h4>
            </CardHeader>
            <CardBody className="pt-0">
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-center mb-6">{featuresData.title}</h3>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {featuresData.features.map((feature, index) => (
                    <div key={index} className="text-center">
                      <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
                        <span className="text-xs">{feature.icon}</span>
                      </div>
                      <h4 className="font-semibold text-sm mb-1">{feature.title}</h4>
                      <p className="text-xs text-gray-600">{feature.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </CardBody>
          </Card>
        </>
      )}
    </div>
  );
}