"use client";

import { useState, useEffect } from "react";
import { Card, CardBody, Button } from "@heroui/react";
import { Monitor, Smartphone, Tablet, RefreshCw, ExternalLink } from "lucide-react";

export default function LivePreview({ isEnabled, previewMode, onModeChange }) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("/");

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const getPreviewStyles = () => {
    switch (previewMode) {
      case "mobile":
        return "max-w-sm mx-auto";
      case "tablet":
        return "max-w-2xl mx-auto";
      default:
        return "w-full";
    }
  };

  if (!isEnabled) {
    return (
      <Card className="shadow-sm">
        <CardBody className="text-center py-8">
          <p className="text-gray-500">Live preview is disabled</p>
          <p className="text-sm text-gray-400 mt-2">Enable live preview to see changes in real-time</p>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm">
      <CardBody className="p-0">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
              <Button
                size="sm"
                variant={previewMode === "desktop" ? "solid" : "light"}
                onClick={() => onModeChange("desktop")}
                isIconOnly
              >
                <Monitor size={14} />
              </Button>
              <Button
                size="sm"
                variant={previewMode === "tablet" ? "solid" : "light"}
                onClick={() => onModeChange("tablet")}
                isIconOnly
              >
                <Tablet size={14} />
              </Button>
              <Button
                size="sm"
                variant={previewMode === "mobile" ? "solid" : "light"}
                onClick={() => onModeChange("mobile")}
                isIconOnly
              >
                <Smartphone size={14} />
              </Button>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="light"
              onClick={handleRefresh}
              isLoading={isRefreshing}
              isIconOnly
            >
              <RefreshCw size={14} />
            </Button>
            <Button
              size="sm"
              variant="light"
              as="a"
              href={previewUrl}
              target="_blank"
              isIconOnly
            >
              <ExternalLink size={14} />
            </Button>
          </div>
        </div>
        
        <div className={`p-4 ${getPreviewStyles()}`}>
          <div className="border rounded-lg overflow-hidden bg-white shadow-sm">
            <iframe
              src={previewUrl}
              className="w-full h-96 border-0"
              title="Homepage Preview"
              key={isRefreshing ? Date.now() : "preview"}
            />
          </div>
        </div>
      </CardBody>
    </Card>
  );
}