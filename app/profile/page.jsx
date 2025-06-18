"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useUserProfile } from "@/lib/firestore/users/read";
import { updateUserProfile, updateUserPreferences } from "@/lib/firestore/users/write";
import { Card, CardBody, CardHeader, CircularProgress, Input, Button, Switch, useDisclosure } from "@heroui/react";
import { User, Mail, Calendar, Shield, Edit, Lock, Phone, MapPin, FileText } from "lucide-react";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import Header from "../components/Header";
import { Providers } from "../providers";
import ProfilePhotoUpload from "./components/ProfilePhotoUpload";
import PasswordChangeModal from "./components/PasswordChangeModal";
import TwoFactorAuthModal from "./components/TwoFactorAuthModal";

function ProfileContent() {
    const { user, isLoading: authLoading } = useAuth();
    const { data: userProfile, isLoading: profileLoading } = useUserProfile(user?.uid);
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [formData, setFormData] = useState({
        displayName: "",
        phone: "",
        address: "",
        bio: ""
    });
    const [preferences, setPreferences] = useState({
        emailNotifications: true,
        marketingEmails: false,
        smsNotifications: false
    });

    const { isOpen: isPasswordModalOpen, onOpen: onPasswordModalOpen, onClose: onPasswordModalClose } = useDisclosure();
    const { isOpen: is2FAModalOpen, onOpen: on2FAModalOpen, onClose: on2FAModalClose } = useDisclosure();

    useEffect(() => {
        if (user && userProfile) {
            setFormData({
                displayName: user.displayName || "",
                phone: userProfile.phone || "",
                address: userProfile.address || "",
                bio: userProfile.bio || ""
            });
            setPreferences({
                emailNotifications: userProfile.preferences?.emailNotifications ?? true,
                marketingEmails: userProfile.preferences?.marketingEmails ?? false,
                smsNotifications: userProfile.preferences?.smsNotifications ?? false
            });
        }
    }, [user, userProfile]);

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
        setIsEditing(true);
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await updateUserProfile({
                uid: user.uid,
                displayName: formData.displayName,
                phone: formData.phone,
                address: formData.address,
                bio: formData.bio
            });
            
            toast.success("Profile updated successfully!");
            setIsEditing(false);
        } catch (error) {
            toast.error(error.message || "Failed to update profile");
        }
        setIsSaving(false);
    };

    const handleCancel = () => {
        setIsEditing(false);
        // Reset form data
        setFormData({
            displayName: user.displayName || "",
            phone: userProfile?.phone || "",
            address: userProfile?.address || "",
            bio: userProfile?.bio || ""
        });
    };

    const handlePreferenceChange = async (key, value) => {
        const newPreferences = { ...preferences, [key]: value };
        setPreferences(newPreferences);
        
        try {
            await updateUserPreferences({
                uid: user.uid,
                preferences: newPreferences
            });
            toast.success("Preferences updated");
        } catch (error) {
            toast.error("Failed to update preferences");
            // Revert the change
            setPreferences(preferences);
        }
    };

    const handlePhotoUpdate = (newPhotoURL) => {
        // The photo update is handled in the component itself
        // This callback can be used for additional actions if needed
    };

    return (
        <div>
            <Header />
            <main className="container mx-auto px-4 py-6">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold mb-2">My Profile</h1>
                    <p className="text-gray-600">Manage your account information and preferences</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Profile Overview */}
                    <div className="lg:col-span-1">
                        <Card className="shadow-sm">
                            <CardBody className="p-6 text-center">
                                <ProfilePhotoUpload 
                                    user={user} 
                                    onPhotoUpdate={handlePhotoUpdate}
                                />
                                
                                <h2 className="text-xl font-semibold mb-1 mt-4">
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
                                <h3 className="text-lg font-semibold">Account Status</h3>
                            </CardHeader>
                            <CardBody className="pt-0">
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600">Email Verified:</span>
                                        <span className={`font-medium ${user.emailVerified ? "text-green-600" : "text-red-600"}`}>
                                            {user.emailVerified ? "Yes" : "No"}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600">Two-Factor Auth:</span>
                                        <span className={`font-medium ${userProfile?.twoFactorAuth?.enabled ? "text-green-600" : "text-gray-600"}`}>
                                            {userProfile?.twoFactorAuth?.enabled ? "Enabled" : "Disabled"}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600">Last Updated:</span>
                                        <span className="font-medium text-sm">{formatDate(userProfile?.timestampUpdate)}</span>
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
                                            startContent={<User size={16} />}
                                            variant="bordered"
                                        />
                                        <Input
                                            label="Email"
                                            type="email"
                                            value={user.email}
                                            startContent={<Mail size={16} />}
                                            variant="bordered"
                                            isDisabled
                                            description="Email cannot be changed here. Contact support if needed."
                                        />
                                        <Input
                                            label="Phone Number"
                                            value={formData.phone}
                                            onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                                            startContent={<Phone size={16} />}
                                            variant="bordered"
                                            placeholder="+1 (555) 123-4567"
                                        />
                                        <Input
                                            label="Address"
                                            value={formData.address}
                                            onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                                            startContent={<MapPin size={16} />}
                                            variant="bordered"
                                            placeholder="Your address"
                                        />
                                        <Input
                                            label="Bio"
                                            value={formData.bio}
                                            onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                                            startContent={<FileText size={16} />}
                                            variant="bordered"
                                            placeholder="Tell us about yourself"
                                        />
                                        
                                        <div className="flex gap-2 pt-4">
                                            <Button
                                                color="primary"
                                                onClick={handleSave}
                                                isLoading={isSaving}
                                                isDisabled={isSaving}
                                            >
                                                Save Changes
                                            </Button>
                                            <Button
                                                variant="light"
                                                onClick={handleCancel}
                                                isDisabled={isSaving}
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

                                        {userProfile?.bio && (
                                            <div>
                                                <label className="text-sm font-medium text-gray-700 mb-1 block">
                                                    Bio
                                                </label>
                                                <p className="text-gray-900">{userProfile.bio}</p>
                                            </div>
                                        )}

                                        <div className="border-t pt-6">
                                            <h4 className="font-medium mb-4">Account Security</h4>
                                            <div className="space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="font-medium">Password</p>
                                                        <p className="text-sm text-gray-600">Change your account password</p>
                                                    </div>
                                                    <Button 
                                                        size="sm" 
                                                        variant="light"
                                                        startContent={<Lock size={16} />}
                                                        onClick={onPasswordModalOpen}
                                                    >
                                                        Change Password
                                                    </Button>
                                                </div>
                                                
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="font-medium">Two-Factor Authentication</p>
                                                        <p className="text-sm text-gray-600">
                                                            {userProfile?.twoFactorAuth?.enabled 
                                                                ? "Your account is protected with 2FA" 
                                                                : "Add an extra layer of security"
                                                            }
                                                        </p>
                                                    </div>
                                                    <Button 
                                                        size="sm" 
                                                        variant="light"
                                                        startContent={<Shield size={16} />}
                                                        onClick={on2FAModalOpen}
                                                        color={userProfile?.twoFactorAuth?.enabled ? "success" : "primary"}
                                                    >
                                                        {userProfile?.twoFactorAuth?.enabled ? "Manage 2FA" : "Enable 2FA"}
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
                                <h3 className="text-lg font-semibold">Notification Preferences</h3>
                            </CardHeader>
                            <CardBody className="pt-0">
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-medium">Email Notifications</p>
                                            <p className="text-sm text-gray-600">Receive updates about your orders and account</p>
                                        </div>
                                        <Switch
                                            isSelected={preferences.emailNotifications}
                                            onValueChange={(checked) => handlePreferenceChange("emailNotifications", checked)}
                                        />
                                    </div>
                                    
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-medium">Marketing Emails</p>
                                            <p className="text-sm text-gray-600">Receive promotional offers and product updates</p>
                                        </div>
                                        <Switch
                                            isSelected={preferences.marketingEmails}
                                            onValueChange={(checked) => handlePreferenceChange("marketingEmails", checked)}
                                        />
                                    </div>
                                    
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-medium">SMS Notifications</p>
                                            <p className="text-sm text-gray-600">Get order updates and alerts via SMS</p>
                                        </div>
                                        <Switch
                                            isSelected={preferences.smsNotifications}
                                            onValueChange={(checked) => handlePreferenceChange("smsNotifications", checked)}
                                        />
                                    </div>
                                </div>
                            </CardBody>
                        </Card>
                    </div>
                </div>

                {/* Modals */}
                <PasswordChangeModal 
                    isOpen={isPasswordModalOpen} 
                    onClose={onPasswordModalClose} 
                />
                
                <TwoFactorAuthModal 
                    isOpen={is2FAModalOpen} 
                    onClose={on2FAModalClose}
                    user={user}
                    userProfile={userProfile}
                />
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