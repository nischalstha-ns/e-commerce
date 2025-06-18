"use client";

import { Card, CardBody, CardHeader, Button, Input, Textarea, Switch } from "@heroui/react";
import { Settings, Save, Database, Image, Mail, Shield } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

export default function SettingsPage() {
    const [settings, setSettings] = useState({
        storeName: "Your E-Commerce Store",
        storeDescription: "Quality products at affordable prices",
        storeEmail: "admin@store.com",
        currency: "Rs.",
        taxRate: "10",
        shippingFee: "50",
        freeShippingThreshold: "500",
        enableReviews: true,
        autoApproveReviews: false,
        enableNotifications: true,
        maintenanceMode: false,
    });

    const [isLoading, setIsLoading] = useState(false);

    const handleSettingChange = (key, value) => {
        setSettings(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const handleSave = async () => {
        setIsLoading(true);
        try {
            // In a real app, you would save these to your database
            await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
            toast.success("Settings saved successfully!");
        } catch (error) {
            toast.error("Failed to save settings");
        }
        setIsLoading(false);
    };

    return (
        <main className="p-6 space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Settings</h1>
                <p className="text-gray-600">Configure your store settings and preferences</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Store Information */}
                <Card className="shadow-sm">
                    <CardHeader className="pb-3">
                        <div className="flex items-center gap-2">
                            <Settings className="w-5 h-5 text-gray-600" />
                            <h3 className="text-lg font-semibold">Store Information</h3>
                        </div>
                    </CardHeader>
                    <CardBody className="pt-0 space-y-4">
                        <Input
                            label="Store Name"
                            value={settings.storeName}
                            onChange={(e) => handleSettingChange("storeName", e.target.value)}
                            variant="bordered"
                        />
                        <Textarea
                            label="Store Description"
                            value={settings.storeDescription}
                            onChange={(e) => handleSettingChange("storeDescription", e.target.value)}
                            variant="bordered"
                        />
                        <Input
                            label="Store Email"
                            type="email"
                            value={settings.storeEmail}
                            onChange={(e) => handleSettingChange("storeEmail", e.target.value)}
                            variant="bordered"
                            startContent={<Mail size={16} />}
                        />
                    </CardBody>
                </Card>

                {/* Financial Settings */}
                <Card className="shadow-sm">
                    <CardHeader className="pb-3">
                        <div className="flex items-center gap-2">
                            <Database className="w-5 h-5 text-gray-600" />
                            <h3 className="text-lg font-semibold">Financial Settings</h3>
                        </div>
                    </CardHeader>
                    <CardBody className="pt-0 space-y-4">
                        <Input
                            label="Currency Symbol"
                            value={settings.currency}
                            onChange={(e) => handleSettingChange("currency", e.target.value)}
                            variant="bordered"
                        />
                        <Input
                            label="Tax Rate (%)"
                            type="number"
                            value={settings.taxRate}
                            onChange={(e) => handleSettingChange("taxRate", e.target.value)}
                            variant="bordered"
                        />
                        <Input
                            label="Shipping Fee"
                            type="number"
                            value={settings.shippingFee}
                            onChange={(e) => handleSettingChange("shippingFee", e.target.value)}
                            variant="bordered"
                        />
                        <Input
                            label="Free Shipping Threshold"
                            type="number"
                            value={settings.freeShippingThreshold}
                            onChange={(e) => handleSettingChange("freeShippingThreshold", e.target.value)}
                            variant="bordered"
                        />
                    </CardBody>
                </Card>

                {/* Review Settings */}
                <Card className="shadow-sm">
                    <CardHeader className="pb-3">
                        <div className="flex items-center gap-2">
                            <Shield className="w-5 h-5 text-gray-600" />
                            <h3 className="text-lg font-semibold">Review Settings</h3>
                        </div>
                    </CardHeader>
                    <CardBody className="pt-0 space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium">Enable Reviews</p>
                                <p className="text-sm text-gray-600">Allow customers to leave reviews</p>
                            </div>
                            <Switch
                                isSelected={settings.enableReviews}
                                onValueChange={(checked) => handleSettingChange("enableReviews", checked)}
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium">Auto-approve Reviews</p>
                                <p className="text-sm text-gray-600">Automatically approve new reviews</p>
                            </div>
                            <Switch
                                isSelected={settings.autoApproveReviews}
                                onValueChange={(checked) => handleSettingChange("autoApproveReviews", checked)}
                                isDisabled={!settings.enableReviews}
                            />
                        </div>
                    </CardBody>
                </Card>

                {/* System Settings */}
                <Card className="shadow-sm">
                    <CardHeader className="pb-3">
                        <div className="flex items-center gap-2">
                            <Image className="w-5 h-5 text-gray-600" />
                            <h3 className="text-lg font-semibold">System Settings</h3>
                        </div>
                    </CardHeader>
                    <CardBody className="pt-0 space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium">Email Notifications</p>
                                <p className="text-sm text-gray-600">Send email notifications for orders</p>
                            </div>
                            <Switch
                                isSelected={settings.enableNotifications}
                                onValueChange={(checked) => handleSettingChange("enableNotifications", checked)}
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium">Maintenance Mode</p>
                                <p className="text-sm text-gray-600">Put store in maintenance mode</p>
                            </div>
                            <Switch
                                isSelected={settings.maintenanceMode}
                                onValueChange={(checked) => handleSettingChange("maintenanceMode", checked)}
                                color="warning"
                            />
                        </div>
                    </CardBody>
                </Card>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
                <Button
                    color="primary"
                    size="lg"
                    startContent={<Save size={16} />}
                    onClick={handleSave}
                    isLoading={isLoading}
                >
                    Save Settings
                </Button>
            </div>

            {/* Environment Info */}
            <Card className="shadow-sm">
                <CardHeader className="pb-3">
                    <h3 className="text-lg font-semibold">Environment Information</h3>
                </CardHeader>
                <CardBody className="pt-0">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div className="p-3 bg-gray-50 rounded-lg">
                            <p className="font-medium text-gray-700">Firebase Project</p>
                            <p className="text-gray-600">{process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "Not configured"}</p>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-lg">
                            <p className="font-medium text-gray-700">Cloudinary Cloud</p>
                            <p className="text-gray-600">{process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "Not configured"}</p>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-lg">
                            <p className="font-medium text-gray-700">Environment</p>
                            <p className="text-gray-600">{process.env.NODE_ENV || "development"}</p>
                        </div>
                    </div>
                </CardBody>
            </Card>
        </main>
    );
}