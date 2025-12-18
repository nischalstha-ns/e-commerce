"use client";

import { useState, useEffect } from "react";
import { Tabs, Tab, Button, Card } from "@heroui/react";
import { Save, Eye, RotateCcw } from "lucide-react";
import AdminOnly from "../components/AdminOnly";
import SectionManager from "./components/SectionManager";
import NavbarControl from "./components/NavbarControl";
import BannerManager from "./components/BannerManager";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firestore/firebase";
import toast from "react-hot-toast";

export default function HomePageControl() {
  const [activeTab, setActiveTab] = useState("sections");
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  const sections = [
    { id: "hero", name: "Hero Section", description: "Main banner with CTA", enabled: true },
    { id: "categories", name: "Categories", description: "Product categories grid", enabled: true },
    { id: "featured", name: "Featured Products", description: "Highlighted products", enabled: true },
    { id: "features", name: "Features", description: "Trust badges & benefits", enabled: true },
    { id: "newsletter", name: "Newsletter", description: "Email subscription", enabled: false }
  ];

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const docRef = doc(db, "settings", "homepage");
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setSettings(docSnap.data());
      }
    } catch (error) {
      console.error("Error loading settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async (data) => {
    try {
      await setDoc(doc(db, "settings", "homepage"), {
        ...data,
        lastUpdated: new Date().toISOString()
      }, { merge: true });
      toast.success("Settings saved successfully!");
    } catch (error) {
      toast.error("Failed to save settings");
      console.error(error);
    }
  };

  const handleSectionReorder = (reordered) => {
    const order = reordered.map(s => s.id);
    saveSettings({ sectionOrder: order });
  };

  const handleSectionToggle = (id) => {
    const section = `${id}Section`;
    saveSettings({
      [section]: {
        ...settings?.[section],
        enabled: !settings?.[section]?.enabled
      }
    });
  };

  const handlePreview = () => {
    window.open("/", "_blank");
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <AdminOnly>
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Home Page Control</h1>
            <p className="text-gray-600 dark:text-gray-400">Manage all homepage sections and content</p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="bordered"
              startContent={<RotateCcw className="w-4 h-4" />}
              onPress={loadSettings}
            >
              Refresh
            </Button>
            <Button
              color="primary"
              variant="bordered"
              startContent={<Eye className="w-4 h-4" />}
              onPress={handlePreview}
            >
              Preview
            </Button>
          </div>
        </div>

        <Tabs
          selectedKey={activeTab}
          onSelectionChange={setActiveTab}
          size="lg"
          className="mb-6"
        >
          <Tab key="sections" title="Section Manager">
            <Card className="p-6">
              <SectionManager
                sections={sections}
                onReorder={handleSectionReorder}
                onToggle={handleSectionToggle}
                onEdit={(id) => setActiveTab(id)}
              />
            </Card>
          </Tab>

          <Tab key="navbar" title="Navbar">
            <NavbarControl
              settings={settings?.navbar}
              onSave={(data) => saveSettings({ navbar: data })}
            />
          </Tab>

          <Tab key="hero" title="Hero Banners">
            <BannerManager
              banners={settings?.banners}
              onSave={(data) => saveSettings({ banners: data })}
            />
          </Tab>

          <Tab key="categories" title="Categories">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Category Section Settings</h3>
              <p className="text-gray-600">Configure which categories appear on homepage</p>
            </Card>
          </Tab>

          <Tab key="featured" title="Featured Products">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Featured Products Settings</h3>
              <p className="text-gray-600">Select products to feature on homepage</p>
            </Card>
          </Tab>

          <Tab key="seo" title="SEO">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">SEO Settings</h3>
              <p className="text-gray-600">Manage meta tags and SEO optimization</p>
            </Card>
          </Tab>
        </Tabs>
      </div>
    </AdminOnly>
  );
}
