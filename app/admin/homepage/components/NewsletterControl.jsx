"use client";

import { useState, useEffect } from "react";
import { Card, CardBody, CardHeader, Button, Input, Textarea, Switch, Select, SelectItem } from "@heroui/react";
import { Mail, Save, Palette } from "lucide-react";
import { useHomepageSettings } from "@/lib/firestore/homepage/read";
import { updateSectionSettings } from "@/lib/firestore/homepage/write";
import toast from "react-hot-toast";

export default function NewsletterControl() {
  const { data: homepageSettings, mutate } = useHomepageSettings();
  const [newsletterData, setNewsletterData] = useState({
    enabled: true,
    title: "Stay in the Loop",
    subtitle: "Be the first to know about new arrivals",
    buttonText: "Subscribe",
    disclaimer: "No spam, unsubscribe at any time",
    backgroundColor: "dark",
    textColor: "white",
    inputStyle: "modern"
  });
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (homepageSettings.newsletterSection) {
      setNewsletterData(prev => ({ ...prev, ...homepageSettings.newsletterSection }));
    }
  }, [homepageSettings]);

  const handleInputChange = (field, value) => {
    setNewsletterData(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateSectionSettings("newsletterSection", newsletterData);
      mutate();
      setHasChanges(false);
      toast.success("Newsletter section saved successfully!");
    } catch (error) {
      toast.error(error.message || "Failed to save newsletter section");
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
              <Mail className="w-5 h-5 text-gray-600" />
              <h3 className="text-lg font-semibold">Newsletter Section</h3>
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
                isSelected={newsletterData.enabled}
                onValueChange={(checked) => handleInputChange("enabled", checked)}
              />
            </div>
          </div>
        </CardHeader>
      </Card>

      {newsletterData.enabled && (
        <>
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <h4 className="font-semibold">Content</h4>
            </CardHeader>
            <CardBody className="pt-0 space-y-4">
              <Input
                label="Section Title"
                value={newsletterData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                variant="bordered"
              />
              
              <Textarea
                label="Subtitle"
                value={newsletterData.subtitle}
                onChange={(e) => handleInputChange("subtitle", e.target.value)}
                variant="bordered"
                rows={2}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Button Text"
                  value={newsletterData.buttonText}
                  onChange={(e) => handleInputChange("buttonText", e.target.value)}
                  variant="bordered"
                />
                
                <Input
                  label="Disclaimer Text"
                  value={newsletterData.disclaimer}
                  onChange={(e) => handleInputChange("disclaimer", e.target.value)}
                  variant="bordered"
                />
              </div>
            </CardBody>
          </Card>

          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Palette className="w-5 h-5 text-gray-600" />
                <h4 className="font-semibold">Design</h4>
              </div>
            </CardHeader>
            <CardBody className="pt-0 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Select
                  label="Background Style"
                  selectedKeys={[newsletterData.backgroundColor]}
                  onSelectionChange={(keys) => handleInputChange("backgroundColor", Array.from(keys)[0])}
                >
                  <SelectItem key="dark" value="dark">Dark</SelectItem>
                  <SelectItem key="light" value="light">Light</SelectItem>
                  <SelectItem key="gradient" value="gradient">Gradient</SelectItem>
                  <SelectItem key="primary" value="primary">Primary Color</SelectItem>
                </Select>

                <Select
                  label="Text Color"
                  selectedKeys={[newsletterData.textColor]}
                  onSelectionChange={(keys) => handleInputChange("textColor", Array.from(keys)[0])}
                >
                  <SelectItem key="white" value="white">White</SelectItem>
                  <SelectItem key="dark" value="dark">Dark</SelectItem>
                  <SelectItem key="primary" value="primary">Primary</SelectItem>
                </Select>

                <Select
                  label="Input Style"
                  selectedKeys={[newsletterData.inputStyle]}
                  onSelectionChange={(keys) => handleInputChange("inputStyle", Array.from(keys)[0])}
                >
                  <SelectItem key="modern" value="modern">Modern</SelectItem>
                  <SelectItem key="classic" value="classic">Classic</SelectItem>
                  <SelectItem key="minimal" value="minimal">Minimal</SelectItem>
                </Select>
              </div>
            </CardBody>
          </Card>

          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <h4 className="font-semibold">Preview</h4>
            </CardHeader>
            <CardBody className="pt-0">
              <div className={`rounded-lg p-8 text-center ${
                newsletterData.backgroundColor === 'dark' ? 'bg-gray-900 text-white' :
                newsletterData.backgroundColor === 'light' ? 'bg-gray-100 text-gray-900' :
                newsletterData.backgroundColor === 'gradient' ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' :
                'bg-blue-600 text-white'
              }`}>
                <h2 className="text-2xl font-light mb-4">{newsletterData.title}</h2>
                <p className="text-lg opacity-90 mb-6 max-w-2xl mx-auto">{newsletterData.subtitle}</p>
                <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                  <input 
                    type="email" 
                    placeholder="Enter your email" 
                    className="flex-1 px-4 py-3 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:outline-none"
                    disabled
                  />
                  <Button 
                    color="primary"
                    className="px-6 py-3"
                  >
                    {newsletterData.buttonText}
                  </Button>
                </div>
                <p className="text-sm opacity-75 mt-4">{newsletterData.disclaimer}</p>
              </div>
            </CardBody>
          </Card>
        </>
      )}
    </div>
  );
}