"use client";

import { useState, useEffect } from "react";
import { Tabs, Tab, Button, Card, CardBody, Input, Textarea, Switch, Select, SelectItem, Slider, Image } from "@heroui/react";
import { Save, Eye, RotateCcw, Upload, Trash2, Plus, GripVertical, Settings, Palette, Type, Image as ImageIcon } from "lucide-react";
import AdminOnly from "../components/AdminOnly";
import { doc, getDoc, setDoc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firestore/firebase";
import toast from "react-hot-toast";

const defaultSettings = {
  heroSection: {
    enabled: true,
    title: "Discover Amazing Products",
    subtitle: "Shop the latest trends with unbeatable prices and quality",
    primaryButtonText: "Shop Now",
    primaryButtonLink: "/shop",
    secondaryButtonText: "Learn More",
    secondaryButtonLink: "/about",
    featuredImage: "https://images.pexels.com/photos/1082529/pexels-photo-1082529.jpeg",
    backgroundImage: "",
    overlayOpacity: 20
  },
  featuresSection: {
    enabled: true,
    features: [
      { icon: "truck", title: "Free Shipping", description: "On orders over $50" },
      { icon: "shield", title: "Secure Payment", description: "100% secure checkout" },
      { icon: "refresh", title: "Easy Returns", description: "30-day return policy" },
      { icon: "credit-card", title: "Best Prices", description: "Competitive pricing" }
    ]
  },
  categoriesSection: {
    enabled: true,
    title: "Shop by Category",
    subtitle: "Explore our wide range of product categories",
    displayCount: 6
  },
  featuredSection: {
    enabled: true,
    title: "Featured Products",
    subtitle: "Handpicked items just for you",
    displayCount: 8
  },
  eleganceSection: {
    enabled: true,
    title: "Elegance Redefined",
    subtitle: "Experience luxury and style with our premium collection",
    primaryButtonText: "Explore Collection",
    primaryButtonLink: "/shop",
    featuredImage: "https://images.pexels.com/photos/1082529/pexels-photo-1082529.jpeg"
  },
  newsletterSection: {
    enabled: true,
    title: "Stay Updated",
    subtitle: "Get the latest news and exclusive offers",
    buttonText: "Subscribe",
    disclaimer: "We respect your privacy. Unsubscribe at any time."
  },
  sectionOrder: ["hero", "features", "categories", "featured", "elegance", "newsletter"]
};

export default function HomePageControl() {
  const [activeTab, setActiveTab] = useState("overview");
  const [settings, setSettings] = useState(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [autoSave, setAutoSave] = useState(true);

  useEffect(() => {
    const docRef = doc(db, "settings", "homepage");
    const unsubscribe = onSnapshot(docRef, (doc) => {
      if (doc.exists()) {
        setSettings({ ...defaultSettings, ...doc.data() });
      } else {
        setSettings(defaultSettings);
      }
      setLoading(false);
    }, (error) => {
      console.error("Error listening to settings:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loadSettings = async () => {
    try {
      const docRef = doc(db, "settings", "homepage");
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setSettings({ ...defaultSettings, ...docSnap.data() });
      }
    } catch (error) {
      console.error("Error loading settings:", error);
      toast.error("Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, "settings", "homepage"), {
        ...settings,
        lastUpdated: new Date().toISOString()
      });
      toast.success("Settings saved successfully!");
    } catch (error) {
      toast.error("Failed to save settings");
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const updateSection = async (sectionKey, data) => {
    const newSettings = {
      ...settings,
      [sectionKey]: { ...settings[sectionKey], ...data }
    };
    setSettings(newSettings);
    
    if (autoSave) {
      try {
        await setDoc(doc(db, "settings", "homepage"), {
          ...newSettings,
          lastUpdated: new Date().toISOString()
        });
      } catch (error) {
        console.error("Auto-save failed:", error);
      }
    }
  };

  const toggleSection = async (sectionKey) => {
    await updateSection(sectionKey, { enabled: !settings[sectionKey]?.enabled });
  };

  const handlePreview = () => {
    window.open("/", "_blank");
  };

  if (loading) {
    return (
      <AdminOnly>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>Loading homepage settings...</p>
          </div>
        </div>
      </AdminOnly>
    );
  }

  return (
    <AdminOnly>
      <div className="p-6 max-w-7xl mx-auto bg-gray-50 dark:bg-gray-900 min-h-screen">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Homepage Control Center</h1>
            <p className="text-gray-600 dark:text-gray-400">Complete control over your homepage design and content</p>
          </div>
          <div className="flex gap-3 items-center">
            <div className="flex items-center gap-2 px-3 py-1 bg-green-100 dark:bg-green-900/30 rounded-full">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-green-700 dark:text-green-400 font-medium">Live Updates</span>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                isSelected={autoSave}
                onValueChange={setAutoSave}
                size="sm"
                color="success"
              />
              <span className="text-sm text-gray-600 dark:text-gray-400">Auto-save</span>
            </div>
            <Button
              color="primary"
              variant="bordered"
              startContent={<Eye className="w-4 h-4" />}
              onPress={handlePreview}
            >
              Preview Site
            </Button>
            {!autoSave && (
              <Button
                color="success"
                startContent={<Save className="w-4 h-4" />}
                onPress={saveSettings}
                isLoading={saving}
              >
                Save Changes
              </Button>
            )}
          </div>
        </div>

        <Tabs
          selectedKey={activeTab}
          onSelectionChange={setActiveTab}
          size="lg"
          className="mb-6"
          classNames={{
            tabList: "bg-white dark:bg-gray-800 shadow-sm",
            tab: "px-6 py-3",
            tabContent: "font-medium"
          }}
        >
          <Tab key="overview" title="Overview">
            <Card>
              <CardBody className="p-6">
                <h3 className="text-xl font-semibold mb-6">Section Management</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(settings).filter(([key]) => key.endsWith('Section')).map(([key, section]) => {
                    const sectionName = key.replace('Section', '');
                    const sectionTitles = {
                      hero: 'Hero Banner',
                      features: 'Features',
                      categories: 'Categories',
                      featured: 'Featured Products',
                      elegance: 'Elegance Section',
                      newsletter: 'Newsletter'
                    };
                    
                    return (
                      <Card key={key} className={`border-2 ${section.enabled ? 'border-green-200 bg-green-50 dark:bg-green-900/20' : 'border-gray-200 bg-gray-50 dark:bg-gray-800'}`}>
                        <CardBody className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-semibold">{sectionTitles[sectionName]}</h4>
                            <Switch
                              isSelected={section.enabled}
                              onValueChange={() => toggleSection(key)}
                              color="success"
                              size="sm"
                            />
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                            {section.enabled ? 'Currently visible on homepage' : 'Hidden from homepage'}
                          </p>
                          <Button
                            size="sm"
                            variant="flat"
                            onPress={() => setActiveTab(sectionName)}
                            className="w-full"
                          >
                            Configure
                          </Button>
                        </CardBody>
                      </Card>
                    );
                  })}
                </div>
              </CardBody>
            </Card>
          </Tab>

          <Tab key="hero" title="Hero Section">
            <Card>
              <CardBody className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold">Hero Section Settings</h3>
                  <Switch
                    isSelected={settings.heroSection.enabled}
                    onValueChange={() => toggleSection('heroSection')}
                    color="success"
                  />
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <Input
                      label="Main Title"
                      value={settings.heroSection.title}
                      onChange={(e) => updateSection('heroSection', { title: e.target.value })}
                      placeholder="Enter hero title"
                    />
                    
                    <Textarea
                      label="Subtitle"
                      value={settings.heroSection.subtitle}
                      onChange={(e) => updateSection('heroSection', { subtitle: e.target.value })}
                      placeholder="Enter hero subtitle"
                      rows={3}
                    />
                    
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        label="Primary Button Text"
                        value={settings.heroSection.primaryButtonText}
                        onChange={(e) => updateSection('heroSection', { primaryButtonText: e.target.value })}
                      />
                      <Input
                        label="Primary Button Link"
                        value={settings.heroSection.primaryButtonLink}
                        onChange={(e) => updateSection('heroSection', { primaryButtonLink: e.target.value })}
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        label="Secondary Button Text"
                        value={settings.heroSection.secondaryButtonText}
                        onChange={(e) => updateSection('heroSection', { secondaryButtonText: e.target.value })}
                      />
                      <Input
                        label="Secondary Button Link"
                        value={settings.heroSection.secondaryButtonLink}
                        onChange={(e) => updateSection('heroSection', { secondaryButtonLink: e.target.value })}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <Input
                      label="Featured Image URL"
                      value={settings.heroSection.featuredImage}
                      onChange={(e) => updateSection('heroSection', { featuredImage: e.target.value })}
                      placeholder="https://example.com/image.jpg"
                    />
                    
                    <Input
                      label="Background Image URL (Optional)"
                      value={settings.heroSection.backgroundImage}
                      onChange={(e) => updateSection('heroSection', { backgroundImage: e.target.value })}
                      placeholder="https://example.com/background.jpg"
                    />
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Background Overlay Opacity</label>
                      <Slider
                        value={settings.heroSection.overlayOpacity}
                        onChange={(value) => updateSection('heroSection', { overlayOpacity: value })}
                        minValue={0}
                        maxValue={100}
                        step={5}
                        className="w-full"
                      />
                      <p className="text-sm text-gray-500 mt-1">{settings.heroSection.overlayOpacity}%</p>
                    </div>
                    
                    {settings.heroSection.featuredImage && (
                      <div>
                        <label className="block text-sm font-medium mb-2">Preview</label>
                        <Image
                          src={settings.heroSection.featuredImage}
                          alt="Hero preview"
                          className="w-full h-32 object-cover rounded-lg"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </CardBody>
            </Card>
          </Tab>

          <Tab key="categories" title="Categories">
            <Card>
              <CardBody className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold">Categories Section</h3>
                  <Switch
                    isSelected={settings.categoriesSection.enabled}
                    onValueChange={() => toggleSection('categoriesSection')}
                    color="success"
                  />
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Input
                    label="Section Title"
                    value={settings.categoriesSection.title}
                    onChange={(e) => updateSection('categoriesSection', { title: e.target.value })}
                  />
                  <Input
                    label="Section Subtitle"
                    value={settings.categoriesSection.subtitle}
                    onChange={(e) => updateSection('categoriesSection', { subtitle: e.target.value })}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Number of Categories to Display</label>
                  <Slider
                    value={settings.categoriesSection.displayCount}
                    onChange={(value) => updateSection('categoriesSection', { displayCount: value })}
                    minValue={3}
                    maxValue={12}
                    step={1}
                    className="w-full max-w-md"
                  />
                  <p className="text-sm text-gray-500 mt-1">{settings.categoriesSection.displayCount} categories</p>
                </div>
              </CardBody>
            </Card>
          </Tab>

          <Tab key="featured" title="Featured Products">
            <Card>
              <CardBody className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold">Featured Products Section</h3>
                  <Switch
                    isSelected={settings.featuredSection.enabled}
                    onValueChange={() => toggleSection('featuredSection')}
                    color="success"
                  />
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Input
                    label="Section Title"
                    value={settings.featuredSection.title}
                    onChange={(e) => updateSection('featuredSection', { title: e.target.value })}
                  />
                  <Input
                    label="Section Subtitle"
                    value={settings.featuredSection.subtitle}
                    onChange={(e) => updateSection('featuredSection', { subtitle: e.target.value })}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Number of Products to Display</label>
                  <Slider
                    value={settings.featuredSection.displayCount}
                    onChange={(value) => updateSection('featuredSection', { displayCount: value })}
                    minValue={4}
                    maxValue={16}
                    step={2}
                    className="w-full max-w-md"
                  />
                  <p className="text-sm text-gray-500 mt-1">{settings.featuredSection.displayCount} products</p>
                </div>
              </CardBody>
            </Card>
          </Tab>

          <Tab key="elegance" title="Elegance Section">
            <Card>
              <CardBody className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold">Elegance Section</h3>
                  <Switch
                    isSelected={settings.eleganceSection.enabled}
                    onValueChange={() => toggleSection('eleganceSection')}
                    color="success"
                  />
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <Input
                      label="Section Title"
                      value={settings.eleganceSection.title}
                      onChange={(e) => updateSection('eleganceSection', { title: e.target.value })}
                    />
                    
                    <Textarea
                      label="Section Subtitle"
                      value={settings.eleganceSection.subtitle}
                      onChange={(e) => updateSection('eleganceSection', { subtitle: e.target.value })}
                      rows={3}
                    />
                    
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        label="Button Text"
                        value={settings.eleganceSection.primaryButtonText}
                        onChange={(e) => updateSection('eleganceSection', { primaryButtonText: e.target.value })}
                      />
                      <Input
                        label="Button Link"
                        value={settings.eleganceSection.primaryButtonLink}
                        onChange={(e) => updateSection('eleganceSection', { primaryButtonLink: e.target.value })}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <Input
                      label="Featured Image URL"
                      value={settings.eleganceSection.featuredImage}
                      onChange={(e) => updateSection('eleganceSection', { featuredImage: e.target.value })}
                    />
                    
                    {settings.eleganceSection.featuredImage && (
                      <div>
                        <label className="block text-sm font-medium mb-2">Preview</label>
                        <Image
                          src={settings.eleganceSection.featuredImage}
                          alt="Elegance preview"
                          className="w-full h-32 object-cover rounded-lg"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </CardBody>
            </Card>
          </Tab>

          <Tab key="newsletter" title="Newsletter">
            <Card>
              <CardBody className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold">Newsletter Section</h3>
                  <Switch
                    isSelected={settings.newsletterSection.enabled}
                    onValueChange={() => toggleSection('newsletterSection')}
                    color="success"
                  />
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Input
                    label="Section Title"
                    value={settings.newsletterSection.title}
                    onChange={(e) => updateSection('newsletterSection', { title: e.target.value })}
                  />
                  <Input
                    label="Section Subtitle"
                    value={settings.newsletterSection.subtitle}
                    onChange={(e) => updateSection('newsletterSection', { subtitle: e.target.value })}
                  />
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Input
                    label="Button Text"
                    value={settings.newsletterSection.buttonText}
                    onChange={(e) => updateSection('newsletterSection', { buttonText: e.target.value })}
                  />
                  <Input
                    label="Disclaimer Text"
                    value={settings.newsletterSection.disclaimer}
                    onChange={(e) => updateSection('newsletterSection', { disclaimer: e.target.value })}
                  />
                </div>
              </CardBody>
            </Card>
          </Tab>

          <Tab key="features" title="Features">
            <Card>
              <CardBody className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold">Features Section</h3>
                  <Switch
                    isSelected={settings.featuresSection.enabled}
                    onValueChange={() => toggleSection('featuresSection')}
                    color="success"
                  />
                </div>
                
                <div className="space-y-4">
                  {settings.featuresSection.features.map((feature, index) => (
                    <Card key={index} className="border">
                      <CardBody className="p-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <Input
                            label="Title"
                            value={feature.title}
                            onChange={(e) => {
                              const newFeatures = [...settings.featuresSection.features];
                              newFeatures[index].title = e.target.value;
                              updateSection('featuresSection', { features: newFeatures });
                            }}
                          />
                          <Input
                            label="Description"
                            value={feature.description}
                            onChange={(e) => {
                              const newFeatures = [...settings.featuresSection.features];
                              newFeatures[index].description = e.target.value;
                              updateSection('featuresSection', { features: newFeatures });
                            }}
                          />
                          <Select
                            label="Icon"
                            selectedKeys={[feature.icon]}
                            onSelectionChange={(keys) => {
                              const newFeatures = [...settings.featuresSection.features];
                              newFeatures[index].icon = Array.from(keys)[0];
                              updateSection('featuresSection', { features: newFeatures });
                            }}
                          >
                            <SelectItem key="truck">Truck (Shipping)</SelectItem>
                            <SelectItem key="shield">Shield (Security)</SelectItem>
                            <SelectItem key="refresh">Refresh (Returns)</SelectItem>
                            <SelectItem key="credit-card">Credit Card (Payment)</SelectItem>
                            <SelectItem key="star">Star (Quality)</SelectItem>
                            <SelectItem key="heart">Heart (Support)</SelectItem>
                          </Select>
                        </div>
                      </CardBody>
                    </Card>
                  ))}
                </div>
              </CardBody>
            </Card>
          </Tab>
        </Tabs>
      </div>
    </AdminOnly>
  );
}