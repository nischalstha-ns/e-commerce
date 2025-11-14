"use client";

import { useState } from "react";
import { Card, CardBody, CardHeader, Button, Switch, Input, Select, SelectItem, Slider, Divider, Chip, Tabs, Tab } from "@heroui/react";
import { Palette, Monitor, Sun, Moon, Eye, Save, Download, RotateCcw, Wand2 } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import toast from "react-hot-toast";

export default function ThemeManagement() {
  const { theme, toggleTheme, setLightTheme, setDarkTheme } = useTheme();
  const [customTheme, setCustomTheme] = useState({
    colors: {
      primary: "#3b82f6",
      secondary: "#64748b",
      accent: "#f59e0b",
      background: "#ffffff",
      surface: "#f8fafc",
      text: "#1e293b",
      border: "#e2e8f0"
    },
    typography: {
      fontFamily: "Inter",
      fontSize: "16",
      lineHeight: "1.6",
      fontWeight: "400"
    },
    spacing: {
      containerWidth: "1200",
      sectionPadding: "80",
      elementSpacing: "24"
    },
    effects: {
      borderRadius: "8",
      shadowIntensity: "medium",
      animationSpeed: "300",
      blurEffect: "8"
    }
  });

  const presets = [
    { id: "modern", name: "Modern Blue", colors: { primary: "#3b82f6", secondary: "#64748b", accent: "#f59e0b" } },
    { id: "elegant", name: "Elegant Purple", colors: { primary: "#8b5cf6", secondary: "#64748b", accent: "#f59e0b" } },
    { id: "nature", name: "Nature Green", colors: { primary: "#10b981", secondary: "#64748b", accent: "#f59e0b" } },
    { id: "sunset", name: "Sunset Orange", colors: { primary: "#f97316", secondary: "#64748b", accent: "#f59e0b" } },
    { id: "ocean", name: "Ocean Teal", colors: { primary: "#0891b2", secondary: "#64748b", accent: "#f59e0b" } }
  ];

  const handleColorChange = (colorKey, value) => {
    setCustomTheme(prev => ({
      ...prev,
      colors: { ...prev.colors, [colorKey]: value }
    }));
  };

  const applyPreset = (preset) => {
    setCustomTheme(prev => ({
      ...prev,
      colors: { ...prev.colors, ...preset.colors }
    }));
    toast.success(`Applied ${preset.name} preset`);
  };

  const saveTheme = () => {
    localStorage.setItem('custom-theme', JSON.stringify(customTheme));
    toast.success('Theme saved successfully!');
  };

  return (
    <main className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Theme Management</h1>
          <p className="text-gray-600">Customize your store's appearance and branding</p>
        </div>
        
        <div className="flex items-center gap-4">
          <Button variant="bordered" startContent={<Eye size={16} />} as="a" href="/" target="_blank">
            Preview Changes
          </Button>
          <Button color="primary" startContent={<Save size={16} />} onClick={saveTheme}>
            Save Theme
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Tabs aria-label="Theme options" className="w-full">
            <Tab key="colors" title="Colors">
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Palette size={20} />
                    Color Palette
                  </h3>
                </CardHeader>
                <CardBody className="space-y-6">
                  <div>
                    <h4 className="font-medium mb-3">Quick Presets</h4>
                    <div className="flex flex-wrap gap-2">
                      {presets.map((preset) => (
                        <Button
                          key={preset.id}
                          size="sm"
                          variant="bordered"
                          onClick={() => applyPreset(preset)}
                          className="flex items-center gap-2"
                        >
                          <div 
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: preset.colors.primary }}
                          />
                          {preset.name}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <Divider />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(customTheme.colors).map(([key, value]) => (
                      <div key={key} className="space-y-2">
                        <label className="text-sm font-medium capitalize">{key}</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={value}
                            onChange={(e) => handleColorChange(key, e.target.value)}
                            className="w-12 h-10 rounded border cursor-pointer"
                          />
                          <Input
                            value={value}
                            onChange={(e) => handleColorChange(key, e.target.value)}
                            size="sm"
                            variant="bordered"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardBody>
              </Card>
            </Tab>

            <Tab key="typography" title="Typography">
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold">Typography Settings</h3>
                </CardHeader>
                <CardBody className="space-y-4">
                  <Select
                    label="Font Family"
                    selectedKeys={[customTheme.typography.fontFamily]}
                  >
                    <SelectItem key="Inter">Inter</SelectItem>
                    <SelectItem key="Roboto">Roboto</SelectItem>
                    <SelectItem key="Open Sans">Open Sans</SelectItem>
                    <SelectItem key="Poppins">Poppins</SelectItem>
                  </Select>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Base Font Size: {customTheme.typography.fontSize}px</label>
                    <Slider
                      value={[parseInt(customTheme.typography.fontSize)]}
                      min={12}
                      max={24}
                      step={1}
                    />
                  </div>
                </CardBody>
              </Card>
            </Tab>
          </Tabs>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Monitor size={20} />
                Theme Mode
              </h3>
            </CardHeader>
            <CardBody className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Current Mode</span>
                <Chip color={theme === 'dark' ? 'secondary' : 'warning'} variant="flat">
                  {theme === 'dark' ? 'Dark' : 'Light'}
                </Chip>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant={theme === 'light' ? 'solid' : 'bordered'}
                  onClick={setLightTheme}
                  startContent={<Sun size={16} />}
                  size="sm"
                >
                  Light
                </Button>
                <Button
                  variant={theme === 'dark' ? 'solid' : 'bordered'}
                  onClick={setDarkTheme}
                  startContent={<Moon size={16} />}
                  size="sm"
                >
                  Dark
                </Button>
              </div>

              <Button
                variant="bordered"
                onClick={toggleTheme}
                className="w-full"
                startContent={<Wand2 size={16} />}
              >
                Toggle Theme
              </Button>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Live Preview</h3>
            </CardHeader>
            <CardBody>
              <div 
                className="p-4 rounded-lg border-2 space-y-3"
                style={{
                  backgroundColor: customTheme.colors.background,
                  borderColor: customTheme.colors.border,
                  borderRadius: `${customTheme.effects.borderRadius}px`
                }}
              >
                <div 
                  className="p-3 rounded"
                  style={{
                    backgroundColor: customTheme.colors.primary,
                    color: 'white',
                    borderRadius: `${customTheme.effects.borderRadius}px`
                  }}
                >
                  <h4 style={{ fontFamily: customTheme.typography.fontFamily }}>
                    Primary Button
                  </h4>
                </div>
                
                <div 
                  className="p-3 rounded"
                  style={{
                    backgroundColor: customTheme.colors.surface,
                    color: customTheme.colors.text,
                    borderRadius: `${customTheme.effects.borderRadius}px`
                  }}
                >
                  <p style={{ 
                    fontFamily: customTheme.typography.fontFamily,
                    fontSize: `${customTheme.typography.fontSize}px`,
                    lineHeight: customTheme.typography.lineHeight
                  }}>
                    Sample text content
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </main>
  );
}