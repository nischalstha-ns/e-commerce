"use client";

import { useState, useEffect } from "react";
import { Tabs, Tab, Card, CardBody, Button, Input, Select, SelectItem, Slider, Switch, Divider } from "@heroui/react";
import { Palette, Eye, Save, Plus, Copy, Trash2, Monitor, Smartphone, RotateCcw } from "lucide-react";
import ThemePreview from "./components/ThemePreview";
import AdminOnly from "../components/AdminOnly";
import { doc, getDoc, setDoc, collection, getDocs, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firestore/firebase";
import { saveTheme as saveThemeToDb, setActiveTheme } from "@/lib/firestore/themes/write";
import toast from "react-hot-toast";

const defaultTheme = {
  id: "default",
  name: "Default Theme",
  active: true,
  colors: {
    primary: "#3b82f6",
    secondary: "#64748b",
    accent: "#8b5cf6",
    background: "#ffffff",
    surface: "#f8fafc",
    text: "#1e293b",
    textSecondary: "#64748b"
  },
  typography: {
    fontFamily: "Inter, sans-serif",
    fontSize: {
      xs: "12px",
      sm: "14px",
      base: "16px",
      lg: "18px",
      xl: "20px",
      "2xl": "24px",
      "3xl": "30px"
    }
  },
  spacing: {
    xs: "4px",
    sm: "8px",
    md: "16px",
    lg: "24px",
    xl: "32px",
    "2xl": "48px"
  },
  borderRadius: {
    sm: "4px",
    md: "8px",
    lg: "12px",
    xl: "16px"
  },
  shadows: {
    sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
    md: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
    lg: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
    xl: "0 20px 25px -5px rgb(0 0 0 / 0.1)"
  },
  components: {
    navbar: {
      background: "#ffffff",
      text: "#1e293b",
      height: "64px"
    },
    footer: {
      background: "#1e293b",
      text: "#ffffff"
    },
    button: {
      borderRadius: "8px",
      padding: "12px 24px"
    },
    card: {
      background: "#ffffff",
      borderRadius: "12px",
      shadow: "md"
    }
  },
  pages: {
    home: { 
      active: true, 
      themeOverride: null,
      sections: {
        hero: { visible: true, background: "gradient", textAlign: "center" },
        featured: { visible: true, background: "surface", textAlign: "left" },
        offers: { visible: true, background: "primary", textAlign: "center" },
        reviews: { visible: true, background: "background", textAlign: "left" }
      }
    },
    shop: { active: true, themeOverride: null, sections: {} },
    product: { active: true, themeOverride: null, sections: {} },
    cart: { active: true, themeOverride: null, sections: {} },
    checkout: { active: true, themeOverride: null, sections: {} },
    profile: { active: true, themeOverride: null, sections: {} },
    admin: { active: true, themeOverride: null, sections: {} }
  },
  version: "1.0.0",
  createdAt: new Date().toISOString()
};

const pageOptions = [
  { key: "home", label: "Homepage" },
  { key: "shop", label: "Shop/Products" },
  { key: "product", label: "Product Detail" },
  { key: "cart", label: "Shopping Cart" },
  { key: "checkout", label: "Checkout" },
  { key: "profile", label: "User Profile" },
  { key: "admin", label: "Admin Panel" }
];

export default function ThemeManager() {
  const [themes, setThemes] = useState([defaultTheme]);
  const [activeTheme, setActiveTheme] = useState(defaultTheme);
  const [selectedPage, setSelectedPage] = useState("home");
  const [previewMode, setPreviewMode] = useState("desktop");
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");

  useEffect(() => {
    loadThemes();
  }, []);

  const loadThemes = async () => {
    try {
      if (!db) {
        console.warn('Database not initialized, using default theme');
        setThemes([defaultTheme]);
        setActiveTheme(defaultTheme);
        return;
      }

      const themesRef = collection(db, "themes");
      const snapshot = await getDocs(themesRef);
      const loadedThemes = [];
      
      snapshot.forEach(doc => {
        loadedThemes.push({ id: doc.id, ...doc.data() });
      });
      
      if (loadedThemes.length === 0) {
        loadedThemes.push(defaultTheme);
        await saveTheme(defaultTheme);
      }
      
      setThemes(loadedThemes);
      const active = loadedThemes.find(t => t.active) || loadedThemes[0];
      setActiveTheme(active);
    } catch (error) {
      console.error("Error loading themes:", error);
      if (error.code === 'permission-denied') {
        console.warn('Permission denied for themes, using default');
        setThemes([defaultTheme]);
        setActiveTheme(defaultTheme);
      } else {
        toast.error("Failed to load themes");
      }
    } finally {
      setLoading(false);
    }
  };

  const saveTheme = async (theme) => {
    const result = await saveThemeToDb(theme);
    if (result.success) {
      toast.success("Theme saved successfully");
    } else {
      toast.error("Failed to save theme");
    }
  };

  const activateTheme = async (themeId) => {
    const newActiveTheme = themes.find(t => t.id === themeId);
    
    const result = await setActiveTheme(newActiveTheme);
    if (result.success) {
      const updatedThemes = themes.map(t => ({
        ...t,
        active: t.id === themeId
      }));
      
      setThemes(updatedThemes);
      setActiveTheme(newActiveTheme);
      applyThemeToDOM(newActiveTheme);
      toast.success(`${newActiveTheme.name} activated`);
    } else {
      toast.error("Failed to activate theme");
    }
  };

  const applyThemeToDOM = (theme) => {
    const root = document.documentElement;
    
    // Apply CSS variables
    Object.entries(theme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value);
    });
    
    Object.entries(theme.spacing).forEach(([key, value]) => {
      root.style.setProperty(`--spacing-${key}`, value);
    });
    
    Object.entries(theme.borderRadius).forEach(([key, value]) => {
      root.style.setProperty(`--radius-${key}`, value);
    });
    
    root.style.setProperty('--font-family', theme.typography.fontFamily);
  };

  const updateThemeProperty = (path, value) => {
    const pathArray = path.split('.');
    const updatedTheme = { ...activeTheme };
    
    let current = updatedTheme;
    for (let i = 0; i < pathArray.length - 1; i++) {
      current = current[pathArray[i]];
    }
    current[pathArray[pathArray.length - 1]] = value;
    
    setActiveTheme(updatedTheme);
    applyThemeToDOM(updatedTheme);
    
    // Auto-save
    saveTheme(updatedTheme);
  };

  const createNewTheme = () => {
    const newTheme = {
      ...defaultTheme,
      id: `theme-${Date.now()}`,
      name: `New Theme ${themes.length + 1}`,
      active: false
    };
    
    setThemes([...themes, newTheme]);
    saveTheme(newTheme);
  };

  const duplicateTheme = (theme) => {
    const duplicated = {
      ...theme,
      id: `theme-${Date.now()}`,
      name: `${theme.name} Copy`,
      active: false
    };
    
    setThemes([...themes, duplicated]);
    saveTheme(duplicated);
  };

  const deleteTheme = async (themeId) => {
    if (themes.length <= 1) {
      toast.error("Cannot delete the last theme");
      return;
    }
    
    try {
      await deleteDoc(doc(db, "themes", themeId));
      const updatedThemes = themes.filter(t => t.id !== themeId);
      setThemes(updatedThemes);
      
      if (activeTheme.id === themeId) {
        const newActive = updatedThemes[0];
        setActiveTheme(newActive);
        activateTheme(newActive.id);
      }
      
      toast.success("Theme deleted");
    } catch (error) {
      toast.error("Failed to delete theme");
    }
  };

  if (loading) {
    return (
      <AdminOnly>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>Loading theme manager...</p>
          </div>
        </div>
      </AdminOnly>
    );
  }

  return (
    <AdminOnly>
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
        {/* Left Panel - Controls */}
        <div className="w-1/2 p-6 overflow-y-auto border-r border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Theme Manager</h1>
              <p className="text-gray-600 dark:text-gray-400">Design your perfect theme</p>
            </div>
            <Button
              startContent={<Plus className="w-4 h-4" />}
              onPress={createNewTheme}
              color="primary"
            >
              New Theme
            </Button>
          </div>

          <Tabs selectedKey={activeTab} onSelectionChange={setActiveTab} className="mb-6">
            <Tab key="dashboard" title="Dashboard">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Available Themes</h3>
                  <div className="text-sm text-gray-500">
                    {themes.length} theme{themes.length !== 1 ? 's' : ''} • Active: {themes.find(t => t.active)?.name}
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  {themes.map((theme) => (
                    <Card key={theme.id} className={`cursor-pointer transition-all ${theme.active ? 'ring-2 ring-blue-500' : ''}`}>
                      <CardBody className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="flex gap-1">
                              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: theme.colors.primary }}></div>
                              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: theme.colors.secondary }}></div>
                              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: theme.colors.accent }}></div>
                            </div>
                            <div>
                              <h4 className="font-semibold">{theme.name}</h4>
                              {theme.active && <span className="text-xs text-green-600">✓ Active</span>}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="flat"
                              onPress={() => duplicateTheme(theme)}
                              startContent={<Copy className="w-3 h-3" />}
                            >
                              Copy
                            </Button>
                            {!theme.active && (
                              <Button
                                size="sm"
                                color="primary"
                                onPress={() => activateTheme(theme.id)}
                              >
                                Activate
                              </Button>
                            )}
                            {themes.length > 1 && (
                              <Button
                                size="sm"
                                color="danger"
                                variant="flat"
                                onPress={() => deleteTheme(theme.id)}
                                startContent={<Trash2 className="w-3 h-3" />}
                              >
                                Delete
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardBody>
                    </Card>
                  ))}
                </div>
              </div>
            </Tab>

            <Tab key="colors" title="Colors">
              <div className="space-y-6">
                <h3 className="text-lg font-semibold">Color Palette</h3>
                {Object.entries(activeTheme.colors).map(([key, value]) => (
                  <div key={key} className="flex items-center gap-4">
                    <label className="w-24 text-sm font-medium capitalize">{key}</label>
                    <input
                      type="color"
                      value={value}
                      onChange={(e) => updateThemeProperty(`colors.${key}`, e.target.value)}
                      className="w-12 h-8 rounded border"
                    />
                    <Input
                      value={value}
                      onChange={(e) => updateThemeProperty(`colors.${key}`, e.target.value)}
                      className="flex-1"
                      size="sm"
                    />
                  </div>
                ))}
              </div>
            </Tab>

            <Tab key="typography" title="Typography">
              <div className="space-y-6">
                <h3 className="text-lg font-semibold">Typography</h3>
                <Input
                  label="Font Family"
                  value={activeTheme.typography.fontFamily}
                  onChange={(e) => updateThemeProperty('typography.fontFamily', e.target.value)}
                />
                
                <div className="space-y-4">
                  <h4 className="font-medium">Font Sizes</h4>
                  {Object.entries(activeTheme.typography.fontSize).map(([key, value]) => (
                    <div key={key} className="flex items-center gap-4">
                      <label className="w-16 text-sm capitalize">{key}</label>
                      <Input
                        value={value}
                        onChange={(e) => updateThemeProperty(`typography.fontSize.${key}`, e.target.value)}
                        size="sm"
                        className="flex-1"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </Tab>

            <Tab key="spacing" title="Spacing">
              <div className="space-y-6">
                <h3 className="text-lg font-semibold">Spacing & Layout</h3>
                
                <div className="space-y-4">
                  <h4 className="font-medium">Spacing Scale</h4>
                  {Object.entries(activeTheme.spacing).map(([key, value]) => (
                    <div key={key} className="flex items-center gap-4">
                      <label className="w-16 text-sm capitalize">{key}</label>
                      <Input
                        value={value}
                        onChange={(e) => updateThemeProperty(`spacing.${key}`, e.target.value)}
                        size="sm"
                        className="flex-1"
                      />
                    </div>
                  ))}
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Border Radius</h4>
                  {Object.entries(activeTheme.borderRadius).map(([key, value]) => (
                    <div key={key} className="flex items-center gap-4">
                      <label className="w-16 text-sm capitalize">{key}</label>
                      <Input
                        value={value}
                        onChange={(e) => updateThemeProperty(`borderRadius.${key}`, e.target.value)}
                        size="sm"
                        className="flex-1"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </Tab>

            <Tab key="pages" title="Page Themes">
              <div className="space-y-6">
                <div className="flex items-center gap-4 mb-6">
                  <Select
                    label="Select Page"
                    selectedKeys={[selectedPage]}
                    onSelectionChange={(keys) => setSelectedPage(Array.from(keys)[0])}
                    className="w-48"
                  >
                    {pageOptions.map((page) => (
                      <SelectItem key={page.key}>{page.label}</SelectItem>
                    ))}
                  </Select>
                  <Button
                    variant="flat"
                    onPress={() => updateThemeProperty(`pages.${selectedPage}.themeOverride`, null)}
                  >
                    Reset to Global
                  </Button>
                </div>
                
                <Card>
                  <CardBody className="p-4">
                    <h4 className="font-medium mb-4">Page-Specific Theme Override</h4>
                    <Switch
                      isSelected={!!activeTheme.pages[selectedPage]?.themeOverride}
                      onValueChange={(checked) => {
                        if (checked) {
                          updateThemeProperty(`pages.${selectedPage}.themeOverride`, {
                            colors: { ...activeTheme.colors },
                            typography: { ...activeTheme.typography }
                          });
                        } else {
                          updateThemeProperty(`pages.${selectedPage}.themeOverride`, null);
                        }
                      }}
                    />
                    <span className="ml-2">Enable page-specific theme</span>
                  </CardBody>
                </Card>

                {activeTheme.pages[selectedPage]?.sections && (
                  <Card>
                    <CardBody className="p-4">
                      <h4 className="font-medium mb-4">Section Controls</h4>
                      <div className="space-y-4">
                        {Object.entries(activeTheme.pages[selectedPage].sections).map(([sectionKey, section]) => (
                          <div key={sectionKey} className="border rounded-lg p-4">
                            <div className="flex items-center justify-between mb-3">
                              <h5 className="font-medium capitalize">{sectionKey} Section</h5>
                              <Switch
                                isSelected={section.visible}
                                onValueChange={(checked) => 
                                  updateThemeProperty(`pages.${selectedPage}.sections.${sectionKey}.visible`, checked)
                                }
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <Select
                                label="Background"
                                selectedKeys={[section.background]}
                                onSelectionChange={(keys) => 
                                  updateThemeProperty(`pages.${selectedPage}.sections.${sectionKey}.background`, Array.from(keys)[0])
                                }
                              >
                                <SelectItem key="background">Default</SelectItem>
                                <SelectItem key="surface">Surface</SelectItem>
                                <SelectItem key="primary">Primary</SelectItem>
                                <SelectItem key="gradient">Gradient</SelectItem>
                              </Select>
                              <Select
                                label="Text Alignment"
                                selectedKeys={[section.textAlign]}
                                onSelectionChange={(keys) => 
                                  updateThemeProperty(`pages.${selectedPage}.sections.${sectionKey}.textAlign`, Array.from(keys)[0])
                                }
                              >
                                <SelectItem key="left">Left</SelectItem>
                                <SelectItem key="center">Center</SelectItem>
                                <SelectItem key="right">Right</SelectItem>
                              </Select>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardBody>
                  </Card>
                )}
              </div>
            </Tab>

            <Tab key="components" title="Components">
              <div className="space-y-6">
                <h3 className="text-lg font-semibold">Component Styles</h3>
                
                {Object.entries(activeTheme.components).map(([component, styles]) => (
                  <Card key={component}>
                    <CardBody className="p-4">
                      <h4 className="font-medium capitalize mb-4">{component}</h4>
                      <div className="space-y-3">
                        {Object.entries(styles).map(([property, value]) => (
                          <div key={property} className="flex items-center gap-4">
                            <label className="w-24 text-sm capitalize">{property}</label>
                            <Input
                              value={value}
                              onChange={(e) => updateThemeProperty(`components.${component}.${property}`, e.target.value)}
                              size="sm"
                              className="flex-1"
                            />
                          </div>
                        ))}
                      </div>
                    </CardBody>
                  </Card>
                ))}
              </div>
            </Tab>
          </Tabs>
        </div>

        {/* Right Panel - Preview */}
        <div className="w-1/2 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Live Preview</h3>
            <div className="flex items-center gap-4">
              <Select
                selectedKeys={[selectedPage]}
                onSelectionChange={(keys) => setSelectedPage(Array.from(keys)[0])}
                className="w-40"
                size="sm"
              >
                {pageOptions.map((page) => (
                  <SelectItem key={page.key}>{page.label}</SelectItem>
                ))}
              </Select>
              
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={previewMode === "desktop" ? "solid" : "flat"}
                  onPress={() => setPreviewMode("desktop")}
                  startContent={<Monitor className="w-4 h-4" />}
                >
                  Desktop
                </Button>
                <Button
                  size="sm"
                  variant={previewMode === "mobile" ? "solid" : "flat"}
                  onPress={() => setPreviewMode("mobile")}
                  startContent={<Smartphone className="w-4 h-4" />}
                >
                  Mobile
                </Button>
              </div>
            </div>
          </div>

          <div className={`bg-white rounded-lg shadow-lg overflow-hidden ${previewMode === "mobile" ? "max-w-sm mx-auto" : ""}`}>
            <div className={`w-full ${previewMode === "mobile" ? "h-[600px]" : "h-[800px]"} overflow-auto`}>
              <ThemePreview theme={activeTheme} page={selectedPage} />
            </div>
          </div>
        </div>
      </div>
    </AdminOnly>
  );
}