"use client";

import { useState } from "react";
import { Input, Textarea, Button, Card, Switch } from "@heroui/react";
import { Upload, Plus, Trash2, Calendar } from "lucide-react";
import toast from "react-hot-toast";

export default function BannerManager({ banners, onSave }) {
  const [items, setItems] = useState(banners || []);

  const addBanner = () => {
    setItems([...items, {
      id: Date.now(),
      image: "",
      title: "",
      subtitle: "",
      ctaText: "Shop Now",
      ctaLink: "/shop",
      startDate: "",
      endDate: "",
      enabled: true,
      order: items.length
    }]);
  };

  const removeBanner = (id) => {
    setItems(items.filter(b => b.id !== id));
    toast.success("Banner removed");
  };

  const updateBanner = (id, field, value) => {
    setItems(items.map(b => b.id === id ? { ...b, [field]: value } : b));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Hero Banners</h2>
        <Button
          color="primary"
          startContent={<Plus className="w-4 h-4" />}
          onPress={addBanner}
        >
          Add Banner
        </Button>
      </div>

      {items.map((banner) => (
        <Card key={banner.id} className="p-6">
          <div className="flex items-start justify-between mb-4">
            <h3 className="text-lg font-semibold">Banner #{banner.order + 1}</h3>
            <div className="flex items-center gap-3">
              <Switch
                isSelected={banner.enabled}
                onValueChange={(val) => updateBanner(banner.id, 'enabled', val)}
              />
              <Button
                size="sm"
                color="danger"
                variant="light"
                isIconOnly
                onPress={() => removeBanner(banner.id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Banner Image</label>
              <div className="flex items-center gap-4">
                {banner.image && (
                  <img src={banner.image} alt="Banner" className="h-24 w-auto rounded" />
                )}
                <Button
                  startContent={<Upload className="w-4 h-4" />}
                  size="sm"
                >
                  Upload Image
                </Button>
              </div>
            </div>

            <Input
              label="Title"
              value={banner.title}
              onChange={(e) => updateBanner(banner.id, 'title', e.target.value)}
            />

            <Textarea
              label="Subtitle"
              value={banner.subtitle}
              onChange={(e) => updateBanner(banner.id, 'subtitle', e.target.value)}
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="CTA Text"
                value={banner.ctaText}
                onChange={(e) => updateBanner(banner.id, 'ctaText', e.target.value)}
              />
              <Input
                label="CTA Link"
                value={banner.ctaLink}
                onChange={(e) => updateBanner(banner.id, 'ctaLink', e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                type="date"
                label="Start Date"
                value={banner.startDate}
                onChange={(e) => updateBanner(banner.id, 'startDate', e.target.value)}
                startContent={<Calendar className="w-4 h-4" />}
              />
              <Input
                type="date"
                label="End Date"
                value={banner.endDate}
                onChange={(e) => updateBanner(banner.id, 'endDate', e.target.value)}
                startContent={<Calendar className="w-4 h-4" />}
              />
            </div>
          </div>
        </Card>
      ))}

      <Button
        color="primary"
        size="lg"
        className="w-full"
        onPress={() => onSave(items)}
      >
        Save All Banners
      </Button>
    </div>
  );
}
