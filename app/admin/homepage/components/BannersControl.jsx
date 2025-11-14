"use client";

import { useState } from "react";
import { Card, CardBody, CardHeader, Button, Switch, Input } from "@heroui/react";
import { Image, Save } from "lucide-react";
import toast from "react-hot-toast";

export default function BannersControl({ autoSave }) {
  const [bannersData, setBannersData] = useState({
    enabled: false,
    banners: []
  });

  const handleSave = async () => {
    toast.success('Banners section updated successfully!');
  };

  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Image size={20} />
          Banners Section (Coming Soon)
        </h3>
      </CardHeader>
      <CardBody>
        <p className="text-gray-600">Banner management will be available in future updates.</p>
      </CardBody>
    </Card>
  );
}