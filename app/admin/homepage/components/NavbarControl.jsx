"use client";

import { useState } from "react";
import { Input, Button, Switch, Card } from "@heroui/react";
import { Upload, Plus, Trash2, GripVertical } from "lucide-react";
import toast from "react-hot-toast";

export default function NavbarControl({ settings, onSave }) {
  const [config, setConfig] = useState(settings || {
    logo: "",
    brandName: "NFS Store",
    slogan: "",
    menuItems: [],
    showSearch: true,
    showWishlist: true,
    showCart: true,
    showLogin: true
  });

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Upload logic here
    toast.success("Logo uploaded");
  };

  const addMenuItem = () => {
    setConfig({
      ...config,
      menuItems: [...config.menuItems, { name: "", link: "", order: config.menuItems.length }]
    });
  };

  const removeMenuItem = (index) => {
    setConfig({
      ...config,
      menuItems: config.menuItems.filter((_, i) => i !== index)
    });
  };

  const updateMenuItem = (index, field, value) => {
    const updated = [...config.menuItems];
    updated[index][field] = value;
    setConfig({ ...config, menuItems: updated });
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Brand Identity</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Logo</label>
            <div className="flex items-center gap-4">
              {config.logo && (
                <img src={config.logo} alt="Logo" className="h-12 w-auto" />
              )}
              <Button
                startContent={<Upload className="w-4 h-4" />}
                onPress={() => document.getElementById('logo-upload').click()}
              >
                Upload Logo
              </Button>
              <input
                id="logo-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleLogoUpload}
              />
            </div>
          </div>

          <Input
            label="Brand Name"
            value={config.brandName}
            onChange={(e) => setConfig({ ...config, brandName: e.target.value })}
          />

          <Input
            label="Slogan"
            value={config.slogan}
            onChange={(e) => setConfig({ ...config, slogan: e.target.value })}
          />
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Menu Items</h3>
          <Button
            size="sm"
            color="primary"
            startContent={<Plus className="w-4 h-4" />}
            onPress={addMenuItem}
          >
            Add Item
          </Button>
        </div>

        <div className="space-y-3">
          {config.menuItems.map((item, index) => (
            <div key={index} className="flex items-center gap-3">
              <GripVertical className="w-5 h-5 text-gray-400" />
              <Input
                placeholder="Menu Name"
                value={item.name}
                onChange={(e) => updateMenuItem(index, 'name', e.target.value)}
              />
              <Input
                placeholder="Link"
                value={item.link}
                onChange={(e) => updateMenuItem(index, 'link', e.target.value)}
              />
              <Button
                size="sm"
                color="danger"
                variant="light"
                isIconOnly
                onPress={() => removeMenuItem(index)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Navbar Features</h3>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span>Show Search Bar</span>
            <Switch
              isSelected={config.showSearch}
              onValueChange={(val) => setConfig({ ...config, showSearch: val })}
            />
          </div>
          <div className="flex items-center justify-between">
            <span>Show Wishlist</span>
            <Switch
              isSelected={config.showWishlist}
              onValueChange={(val) => setConfig({ ...config, showWishlist: val })}
            />
          </div>
          <div className="flex items-center justify-between">
            <span>Show Cart</span>
            <Switch
              isSelected={config.showCart}
              onValueChange={(val) => setConfig({ ...config, showCart: val })}
            />
          </div>
          <div className="flex items-center justify-between">
            <span>Show Login/Register</span>
            <Switch
              isSelected={config.showLogin}
              onValueChange={(val) => setConfig({ ...config, showLogin: val })}
            />
          </div>
        </div>
      </Card>

      <Button
        color="primary"
        size="lg"
        className="w-full"
        onPress={() => onSave(config)}
      >
        Save Navbar Settings
      </Button>
    </div>
  );
}
