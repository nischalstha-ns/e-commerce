"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useUserProfile } from "@/lib/firestore/users/read";
import { Card, CardBody, CardHeader, CircularProgress, Input, Button, Avatar } from "@heroui/react";
import { User, Mail, Calendar, Shield, Edit } from "lucide-react";
import { useState } from "react";
import Header from "../components/Header";
import { Providers } from "../providers";

function ProfileContent() {
    const { user, isLoading: authLoading } = useAuth();
    const { data: userProfile, isLoading: profileLoading } = useUserProfile(user?.uid);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        displayName: "",
        email: "",
        phone: "",
        address: ""
    });

    if (authLoading || profileLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <CircularProgress size="lg" />
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Card className="max-w-md">
                    <CardBody className="text-center p-8">
                        <h1 className="text-xl font-bold mb-2">Please Login</h1>
                        <p className="text-gray-600">You need to be logged in to view your profile.</p>
                    </CardBody>
                </Card>
            </div>
        );
    }

    const formatDate = (timestamp) => {
        if (!timestamp) return "N/A";
        return new Date(timestamp.seconds * 1000).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const handleEdit = () => {
        setFormData({
            displayName: user.displayName || "",
            email: user.email || "",
            phone: userProfile?.phone || "",
            address: userProfile?.address || ""
        });
        setIsEditing(true);
    };

    const handleSave = async () => {
        // Here you would implement the save functionality
        // For now, we'll just close the edit mode
        setIsEditing(false);
    };

    const handleCancel = () => {
        setIsEditing(false);
        setFormData({
            displayName: "",
            email: "",
            phone: "",
            address: ""
        });
    };

    return (
        <div>
            <Header />
            <main className="container mx-auto px-4 py-6">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold mb-2">My Profile</h1>
                    <p className="text-gray-600">Manage your account information</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Profile Overview */}
                    <div className="lg:col-span-1">
                        <Card className="shadow-sm">
                            <CardBody className="p-6 text-center">
                                <Avatar
                                    src={user.photoURL}
                                    name={user.displayName || user.email}
                                    className="w-24 h-24 mx-auto mb-4"
                                    fallback={<User size={32} />}
                                />
                                
                                <h2 className="text-xl font-semibold mb-1">
                                    {user.displayName || "User"}
                                </h2>
                                <p className="text-gray-600 mb-2">{user.email}</p>
                                
                                <div className="flex items-center justify-center gap-2 mb-4">
                                    <Shield className="w-4 h-4 text-blue-600" />
                                    <span className="text-sm text-blue-600 capitalize">
                                        {userProfile?.role || "Customer"}
                                    </span>
                                </div>

                                <div className="text-sm text-gray-500">
                                    <div className="flex items-center justify-center gap-2">
                                        <Calendar className="w-4 h-4" />
                                        <span>Joined {formatDate(userProfile?.timestampCreate)}</span>
                                    </div>
                                </div>
                            </CardBody>
                        </Card>

                        {/* Quick Stats */}
                        <Card className="shadow-sm mt-6">
                            <CardHeader className="pb-3">
                                <h3 className="text-lg font-semibold">Account Stats</h3>
                            </CardHeader>
                            <CardBody className="pt-0">
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Account Type:</span>
                                        <span className="font-medium capitalize">{userProfile?.role || "Customer"}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Email Verified:</span>
                                        <span className={`font-medium ${user.emailVerified ? "text-green-600" : "text-red-600"}`}>
                                            {user.emailVerified ? "Yes" : "No"}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Last Updated:</span>
                                        <span className="font-medium">{formatDate(userProfile?.timestampUpdate)}</span>
                                    </div>
                                </div>
                            </CardBody>
                        </Card>
                    </div>

                    {/* Profile Details */}
                    <div className="lg:col-span-2">
                        <Card className="shadow-sm">
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between w-full">
                                    <h3 className="text-lg font-semibold">Profile Information</h3>
                                    {!isEditing && (
                                        <Button
                                            size="sm"
                                            variant="light"
                                            startContent={<Edit size={16} />}
                                            onClick={handleEdit}
                                        >
                                            Edit
                                        </Button>
                                    )}
                                </div>
                            </CardHeader>
                            <CardBody className="pt-0">
                                {isEditing ? (
                                    <div className="space-y-4">
                                        <Input
                                            label="Display Name"
                                            value={formData.displayName}
                                            onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
                                            variant="bordered"
                                        />
                                        <Input
                                            label="Email"
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                                            variant="bordered"
                                            isDisabled
                                        />
                                        <Input
                                            label="Phone Number"
                                            value={formData.phone}
                                            onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                                            variant="bordered"
                                        />
                                        <Input
                                            label="Address"
                                            value={formData.address}
                                            onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                                            variant="bordered"
                                        />
                                        
                                        <div className="flex gap-2 pt-4">
                                            <Button
                                                color="primary"
                                                onClick={handleSave}
                                            >
                                                Save Changes
                                            </Button>
                                            <Button
                                                variant="light"
                                                onClick={handleCancel}
                                            >
                                                Cancel
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="text-sm font-medium text-gray-700 mb-1 block">
                                                    Display Name
                                                </label>
                                                <p className="text-gray-900">{user.displayName || "Not set"}</p>
                                            </div>
                                            
                                            <div>
                                                <label className="text-sm font-medium text-gray-700 mb-1 block">
                                                    Email Address
                                                </label>
                                                <p className="text-gray-900">{user.email}</p>
                                            </div>
                                            
                                            <div>
                                                <label className="text-sm font-medium text-gray-700 mb-1 block">
                                                    Phone Number
                                                </label>
                                                <p className="text-gray-900">{userProfile?.phone || "Not set"}</p>
                                            </div>
                                            
                                            <div>
                                                <label className="text-sm font-medium text-gray-700 mb-1 block">
                                                    Address
                                                </label>
                                                <p className="text-gray-900">{userProfile?.address || "Not set"}</p>
                                            </div>
                                        </div>

                                        <div className="border-t pt-6">
                                            <h4 className="font-medium mb-4">Account Security</h4>
                                            <div className="space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="font-medium">Password</p>
                                                        <p className="text-sm text-gray-600">Last updated recently</p>
                                                    </div>
                                                    <Button size="sm" variant="light">
                                                        Change Password
                                                    </Button>
                                                </div>
                                                
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="font-medium">Two-Factor Authentication</p>
                                                        <p className="text-sm text-gray-600">Add an extra layer of security</p>
                                                    </div>
                                                    <Button size="sm" variant="light">
                                                        Enable 2FA
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </CardBody>
                        </Card>

                        {/* Preferences */}
                        <Card className="shadow-sm mt-6">
                            <CardHeader className="pb-3">
                                <h3 className="text-lg font-semibold">Preferences</h3>
                            </CardHeader>
                            <CardBody className="pt-0">
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-medium">Email Notifications</p>
                                            <p className="text-sm text-gray-600">Receive updates about your orders</p>
                                        </div>
                                        <input type="checkbox" className="toggle" defaultChecked />
                                    </div>
                                    
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-medium">Marketing Emails</p>
                                            <p className="text-sm text-gray-600">Receive promotional offers and updates</p>
                                        </div>
                                        <input type="checkbox" className="toggle" />
                                    </div>
                                    
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-medium">SMS Notifications</p>
                                            <p className="text-sm text-gray-600">Get order updates via SMS</p>
                                        </div>
                                        <input type="checkbox" className="toggle" />
                                    </div>
                                </div>
                            </CardBody>
                        </Card>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default function ProfilePage() {
    return (
        <Providers>
            <ProfileContent />
        </Providers>
    );
}