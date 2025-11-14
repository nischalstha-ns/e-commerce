"use client";

import { useState, useEffect } from "react";
import { Card, CardBody, CardHeader, Button, Switch, Input, Textarea, Select, SelectItem, Divider } from "@heroui/react";
import { Settings, Save, Mail } from "lucide-react";
import { useHomepageSettings } from "@/lib/firestore/homepage/read";
import { updateSectionSettings } from "@/lib/firestore/homepage/write";
import toast from "react-hot-toast";

export default function NewsletterControl({ autoSave }) {
  const { data: homepageSettings, mutate } = useHomepageSettings();
  const [newsletterData, setNewsletterData] = useState({
    enabled: true,
    title: "Stay in the Loop",
    subtitle: "Be the first to know about new arrivals",
    buttonText: "Subscribe",
    disclaimer: "No spam, unsubscribe at any time",
    backgroundColor: "#1f2937",
    textColor: "#ffffff",
    inputStyle: "rounded",
    layout: "centered"
  });

  useEffect(() => {
    if (homepageSettings?.newsletterSection) {
      setNewsletterData(prev => ({ ...prev, ...homepageSettings.newsletterSection }));
    }
  }, [homepageSettings]);

  const handleInputChange = (field, value) => {
    setNewsletterData(prev => ({ ...prev, [field]: value }));
    
    if (autoSave) {
      handleSave({ ...newsletterData, [field]: value });
    }
  };

  const handleSave = async (dataToSave = newsletterData) => {
    try {
      await updateSectionSettings('newsletterSection', dataToSave);
      if (mutate) mutate();
      toast.success('Newsletter section updated successfully!');
    } catch (error) {
      toast.error('Failed to update newsletter section');
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex justify-between">
          <div>
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Mail size={20} />
              Newsletter Section Settings
            </h3>
            <p className="text-sm text-gray-600">Configure email subscription form</p>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              isSelected={newsletterData.enabled}
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
                label="Section Title"
                value={newsletterData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                variant="bordered"
              />
              <Input
                label="Button Text"
                value={newsletterData.buttonText}
                onChange={(e) => handleInputChange('buttonText', e.target.value)}
                variant="bordered"
              />
            </div>
            
            <Textarea
              label="Subtitle"
              value={newsletterData.subtitle}
              onChange={(e) => handleInputChange('subtitle', e.target.value)}
              variant="bordered"
              rows={2}
            />
          </div>

          <Divider />

          <div className="space-y-4">
            <h4 className="font-medium">Design & Layout</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Background Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={newsletterData.backgroundColor}
                    onChange={(e) => handleInputChange('backgroundColor', e.target.value)}
                    className="w-12 h-10 rounded border cursor-pointer"
                  />
                  <Input
                    value={newsletterData.backgroundColor}
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
                    value={newsletterData.textColor}
                    onChange={(e) => handleInputChange('textColor', e.target.value)}
                    className="w-12 h-10 rounded border cursor-pointer"
                  />
                  <Input
                    value={newsletterData.textColor}
                    onChange={(e) => handleInputChange('textColor', e.target.value)}
                    size="sm"
                    variant="bordered"
                  />
                </div>
              </div>
            </div>
          </div>

          <Divider />

          <div className="space-y-4">
            <h4 className="font-medium">Live Preview</h4>
            <div 
              className="p-8 rounded-lg text-center"
              style={{
                backgroundColor: newsletterData.backgroundColor,
                color: newsletterData.textColor
              }}
            >
              <h2 className="text-4xl font-light mb-6">
                {newsletterData.title}
              </h2>
              <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
                {newsletterData.subtitle}
              </p>
              
              <div className="flex gap-4 max-w-md mx-auto flex-col sm:flex-row">
                <input 
                  type="email" 
                  placeholder="Enter your email" 
                  className="flex-1 px-6 py-4 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:outline-none"
                />
                <div className="bg-white text-gray-900 px-8 py-4 font-medium cursor-pointer hover:bg-gray-100 transition-colors rounded-lg">
                  {newsletterData.buttonText}
                </div>
              </div>
              
              <p className="text-sm opacity-75 mt-4">
                {newsletterData.disclaimer}
              </p>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}