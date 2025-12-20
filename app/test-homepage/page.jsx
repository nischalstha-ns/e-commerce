"use client";

import { Button } from "@heroui/react";
import { updateHomepage } from "@/lib/firestore/homepage/write";
import toast from "react-hot-toast";

export default function TestHomepage() {
  const initializeHomepage = async () => {
    const defaultSections = [
      {
        id: "hero_1",
        name: "Hero Section",
        type: "hero",
        enabled: true,
        height: 600,
        padding: { top: 60, bottom: 60, left: 20, right: 20 },
        background: { type: "gradient", gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" },
        content: {
          title: "Welcome to Nischal Fancy Store",
          subtitle: "Discover amazing products at unbeatable prices",
          primaryButton: { text: "Shop Now", link: "/shop" }
        },
        layout: { alignment: "center" }
      },
      {
        id: "features_1",
        name: "Features Section",
        type: "features",
        enabled: true,
        height: 300,
        padding: { top: 80, bottom: 80, left: 20, right: 20 },
        background: { type: "color", color: "#FFFFFF" }
      }
    ];

    try {
      await updateHomepage({ sections: defaultSections });
      toast.success("Homepage initialized!");
    } catch (error) {
      toast.error("Failed to initialize homepage");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Test Homepage</h1>
      <Button color="primary" onPress={initializeHomepage}>
        Initialize Homepage Data
      </Button>
    </div>
  );
}