"use client";

import { useState, useEffect } from "react";
import { Card, CardBody, CardHeader, Button, Input, Textarea, Switch } from "@heroui/react";
import { Save, Upload } from "lucide-react";
import { useHomepageSettings } from "@/lib/firestore/homepage/read";
import { updateSectionSettings } from "@/lib/firestore/homepage/write";
import toast from "react-hot-toast";

export default function EleganceControl({ autoSave }) {
  const { data: homepageSettings, mutate } = useHomepageSettings();
  const [eleganceData, setEleganceData] = useState({
    enabled: true,
    title: "Elegance",
    subtitle: "Discover timeless elegance",
    primaryButtonText: "Shop Collection",
    primaryButtonLink: "/shop",
    secondaryButtonText: "Learn More",
    secondaryButtonLink: "/about",
    featuredImage: "",
    backgroundImage: "",
    overlayOpacity: 5
  });

  useEffect(() => {
    if (homepageSettings?.eleganceSection) {
      setEleganceData(homepageSettings.eleganceSection);
    }
  }, [homepageSettings]);

  const handleChange = (field, value) => {
    setEleganceData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      await updateSectionSettings("eleganceSection", eleganceData);
      if (mutate) mutate();
      toast.success("Elegance section saved successfully!");
    } catch (error) {
      console.error("Save error:", error);
      toast.error("Failed to save Elegance section");
    }
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-sm">
        <CardHeader>
          <h3 className="text-lg font-semibold">Elegance Section</h3>
        </CardHeader>
        <CardBody className="space-y-4">
          <div className="flex items-center gap-4">
            <Switch
              isSelected={eleganceData.enabled}
              onValueChange={(enabled) => handleChange("enabled", enabled)}
            >
              Enable Elegance Section
            </Switch>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Section Title"
              value={eleganceData.title}
              onChange={(e) => handleChange("title", e.target.value)}
              variant="bordered"
              placeholder="e.g., Elegance"
            />
            <Input
              label="Overlay Opacity (%)"
              type="number"
              min="0"
              max="100"
              value={eleganceData.overlayOpacity?.toString()}
              onChange={(e) => handleChange("overlayOpacity", parseInt(e.target.value))}
              variant="bordered"
            />
          </div>

          <Textarea
            label="Subtitle"
            value={eleganceData.subtitle}
            onChange={(e) => handleChange("subtitle", e.target.value)}
            variant="bordered"
            placeholder="Enter section subtitle"
            minRows={2}
          />

          <div className="border-t pt-4">
            <h4 className="font-semibold mb-4">Images</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Featured Image URL"
                value={eleganceData.featuredImage}
                onChange={(e) => handleChange("featuredImage", e.target.value)}
                variant="bordered"
                placeholder="https://..."
              />
              <Input
                label="Background Image URL"
                value={eleganceData.backgroundImage}
                onChange={(e) => handleChange("backgroundImage", e.target.value)}
                variant="bordered"
                placeholder="https://..."
              />
            </div>
          </div>

          <div className="border-t pt-4">
            <h4 className="font-semibold mb-4">Buttons</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Primary Button Text"
                value={eleganceData.primaryButtonText}
                onChange={(e) => handleChange("primaryButtonText", e.target.value)}
                variant="bordered"
              />
              <Input
                label="Primary Button Link"
                value={eleganceData.primaryButtonLink}
                onChange={(e) => handleChange("primaryButtonLink", e.target.value)}
                variant="bordered"
                placeholder="/shop"
              />
              <Input
                label="Secondary Button Text"
                value={eleganceData.secondaryButtonText}
                onChange={(e) => handleChange("secondaryButtonText", e.target.value)}
                variant="bordered"
              />
              <Input
                label="Secondary Button Link"
                value={eleganceData.secondaryButtonLink}
                onChange={(e) => handleChange("secondaryButtonLink", e.target.value)}
                variant="bordered"
                placeholder="/about"
              />
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              color="primary"
              startContent={<Save size={16} />}
              onClick={handleSave}
            >
              Save Changes
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
