"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useUserProfile } from "@/lib/firestore/users/read";
import { updateUserProfile, updateUserPreferences } from "@/lib/firestore/users/write";
import { Card, CardBody, CardHeader, CircularProgress, Input, Button, Switch, useDisclosure, Chip } from "@heroui/react";
import { User, Mail, Calendar, Shield, Edit, Lock, Phone, MapPin, FileText, Settings, Bell, MessageSquare, Smartphone, CheckCircle, XCircle, AlertCircle, Save, X, Eye, EyeOff } from "lucide-react";
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
                <div className="text-center">
                    <CircularProgress size="lg" />
                    <p className="mt-4 text-gray-600">Loading your profile...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Card className="max-w-md">
                    <CardBody className="text-center p-8">
                        <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h1 className="text-xl font-bold mb-2">Please Login</h1>
                        <p className="text-gray-600 mb-4">You need to be logged in to view your profile.</p>
                        <Button
                            as="a"
                            href="/login"
                            color="primary"
                            startContent={<User size={16} />}
                        >
                            Go to Login
                        </Button>
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

    const getVerificationStatus = () => {
        if (user.emailVerified) {
            return {
                icon: CheckCircle,
                color: "text-green-600",
                bgColor: "bg-green-100",
                text: "Verified"
            };
        }
        return {
            icon: XCircle,
            color: "text-red-600",
            bgColor: "bg-red-100",
            text: "Not Verified"
        };
    };

    const get2FAStatus = () => {
        if (userProfile?.twoFactorAuth?.enabled) {
            return {
                icon: Shield,
                color: "text-green-600",
                bgColor: "bg-green-100",
                text: "Enabled"
            };
        }
        return {
            icon: AlertCircle,
            color: "text-orange-600",
            bgColor: "bg-orange-100",
            text: "Disabled"
        };
    };

    const verificationStatus = getVerificationStatus();
    const twoFAStatus = get2FAStatus();

    return (
        <div>
            <Header />
            <main className="container mx-auto px-4 py-6">
                {/* Header Section */}
                <div className="mb-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-blue-100 rounded-full">
                            <User className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold">My Profile</h1>
                            <p className="text-gray-600">Manage your account information and preferences</p>
                        </div>
                    </div>
                    <Button
                        variant="bordered"
                        startContent={<Settings size={16} />}
                        className="hidden md:flex"
                    >
                        Account Settings
                    </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Profile Overview */}
                    <div className="lg:col-span-1 space-y-6">
                        <Card className="shadow-sm">
                            <CardBody className="p-6 text-center">
                                <ProfilePhotoUpload 
                                    user={user} 
                                    onPhotoUpdate={handlePhotoUpdate}
                                />
                                
                                <h2 className="text-xl font-semibold mb-1 mt-4">
                                    {user.displayName || "User"}
                                </h2>
                                <div className="flex items-center justify-center gap-2 mb-2">
                                    <Mail className="w-4 h-4 text-gray-500" />
                                    <p className="text-gray-600 text-sm">{user.email}</p>
                                </div>
                                
                                <div className="flex items-center justify-center gap-2 mb-4">
                                    <Shield className="w-4 h-4 text-blue-600" />
                                    <Chip 
                                        color="primary" 
                                        size="sm" 
                                        className="capitalize"
                                    >
                                        {userProfile?.role || "Customer"}
                                    </Chip>
                                </div>

                                <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                                    <Calendar className="w-4 h-4" />
                                    <span>Joined {formatDate(userProfile?.timestampCreate)}</span>
                                </div>

                                {/* Quick Actions */}
                                <div className="mt-6 space-y-2">
                                    <Button
                                        size="sm"
                                        variant="light"
                                        startContent={<Edit size={14} />}
                                        onClick={handleEdit}
                                        className="w-full"
                                        isDisabled={isEditing}
                                    >
                                        Edit Profile
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="light"
                                        startContent={<Lock size={14} />}
                                        onClick={onPasswordModalOpen}
                                        className="w-full"
                                    >
                                        Change Password
                                    </Button>
                                </div>
                            </CardBody>
                        </Card>

                        {/* Account Status */}
                        <Card className="shadow-sm">
                            <CardHeader className="pb-3">
                                <div className="flex items-center gap-2">
                                    <Shield className="w-5 h-5 text-gray-600" />
                                    <h3 className="text-lg font-semibold">Security Status</h3>
                                </div>
                            </CardHeader>
                            <CardBody className="pt-0">
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-full ${verificationStatus.bgColor}`}>
                                                <verificationStatus.icon className={`w-4 h-4 ${verificationStatus.color}`} />
                                            </div>
                                            <div>
                                                <p className="font-medium text-sm">Email Verification</p>
                                                <p className="text-xs text-gray-600">Account email status</p>
                                            </div>
                                        </div>
                                        <Chip 
                                            color={user.emailVerified ? "success" : "danger"} 
                                            size="sm"
                                        >
                                            {verificationStatus.text}
                                        </Chip>
                                    </div>

                                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-full ${twoFAStatus.bgColor}`}>
                                                <twoFAStatus.icon className={`w-4 h-4 ${twoFAStatus.color}`} />
                                            </div>
                                            <div>
                                                <p className="font-medium text-sm">Two-Factor Auth</p>
                                                <p className="text-xs text-gray-600">Extra security layer</p>
                                            </div>
                                        </div>
                                        <Button
                                            size="sm"
                                            variant="light"
                                            color={userProfile?.twoFactorAuth?.enabled ? "success" : "warning"}
                                            onClick={on2FAModalOpen}
                                            startContent={<Shield size={12} />}
                                        >
                                            {userProfile?.twoFactorAuth?.enabled ? "Manage" : "Enable"}
                                        </Button>
                                    </div>

                                    <div className="text-center pt-2">
                                        <p className="text-xs text-gray-500">
                                            Last updated: {formatDate(userProfile?.timestampUpdate)}
                                        </p>
                                    </div>
                                </div>
                            </CardBody>
                        </Card>
                    </div>

                    {/* Profile Details */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card className="shadow-sm">
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between w-full">
                                    <div className="flex items-center gap-2">
                                        <User className="w-5 h-5 text-gray-600" />
                                        <h3 className="text-lg font-semibold">Profile Information</h3>
                                    </div>
                                    {!isEditing && (
                                        <Button
                                            size="sm"
                                            variant="light"
                                            startContent={<Edit size={16} />}
                                            onClick={handleEdit}
                                            color="primary"
                                        >
                                            Edit Profile
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
                                            startContent={<User size={16} className="text-gray-400" />}
                                            variant="bordered"
                                            placeholder="Enter your display name"
                                        />
                                        <Input
                                            label="Email"
                                            type="email"
                                            value={user.email}
                                            startContent={<Mail size={16} className="text-gray-400" />}
                                            variant="bordered"
                                            isDisabled
                                            description="Email cannot be changed here. Contact support if needed."
                                        />
                                        <Input
                                            label="Phone Number"
                                            value={formData.phone}
                                            onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                                            startContent={<Phone size={16} className="text-gray-400" />}
                                            variant="bordered"
                                            placeholder="+1 (555) 123-4567"
                                        />
                                        <Input
                                            label="Address"
                                            value={formData.address}
                                            onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                                            startContent={<MapPin size={16} className="text-gray-400" />}
                                            variant="bordered"
                                            placeholder="Your address"
                                        />
                                        <Input
                                            label="Bio"
                                            value={formData.bio}
                                            onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                                            startContent={<FileText size={16} className="text-gray-400" />}
                                            variant="bordered"
                                            placeholder="Tell us about yourself"
                                        />
                                        
                                        <div className="flex gap-2 pt-4">
                                            <Button
                                                color="primary"
                                                onClick={handleSave}
                                                isLoading={isSaving}
                                                isDisabled={isSaving}
                                                startContent={<Save size={16} />}
                                            >
                                                Save Changes
                                            </Button>
                                            <Button
                                                variant="light"
                                                onClick={handleCancel}
                                                isDisabled={isSaving}
                                                startContent={<X size={16} />}
                                            >
                                                Cancel
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                                                <User className="w-5 h-5 text-gray-500 mt-1" />
                                                <div>
                                                    <label className="text-sm font-medium text-gray-700 mb-1 block">
                                                        Display Name
                                                    </label>
                                                    <p className="text-gray-900">{user.displayName || "Not set"}</p>
                                                </div>
                                            </div>
                                            
                                            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                                                <Mail className="w-5 h-5 text-gray-500 mt-1" />
                                                <div>
                                                    <label className="text-sm font-medium text-gray-700 mb-1 block">
                                                        Email Address
                                                    </label>
                                                    <p className="text-gray-900">{user.email}</p>
                                                </div>
                                            </div>
                                            
                                            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                                                <Phone className="w-5 h-5 text-gray-500 mt-1" />
                                                <div>
                                                    <label className="text-sm font-medium text-gray-700 mb-1 block">
                                                        Phone Number
                                                    </label>
                                                    <p className="text-gray-900">{userProfile?.phone || "Not set"}</p>
                                                </div>
                                            </div>
                                            
                                            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                                                <MapPin className="w-5 h-5 text-gray-500 mt-1" />
                                                <div>
                                                    <label className="text-sm font-medium text-gray-700 mb-1 block">
                                                        Address
                                                    </label>
                                                    <p className="text-gray-900">{userProfile?.address || "Not set"}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {userProfile?.bio && (
                                            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                                                <FileText className="w-5 h-5 text-gray-500 mt-1" />
                                                <div>
                                                    <label className="text-sm font-medium text-gray-700 mb-1 block">
                                                        Bio
                                                    </label>
                                                    <p className="text-gray-900">{userProfile.bio}</p>
                                                </div>
                                            </div>
                                        )}

                                        <div className="border-t pt-6">
                                            <div className="flex items-center gap-2 mb-4">
                                                <Lock className="w-5 h-5 text-gray-600" />
                                                <h4 className="font-medium">Account Security</h4>
                                            </div>
                                            <div className="space-y-3">
                                                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                                    <div className="flex items-center gap-3">
                                                        <Lock className="w-5 h-5 text-gray-500" />
                                                        <div>
                                                            <p className="font-medium">Password</p>
                                                            <p className="text-sm text-gray-600">Change your account password</p>
                                                        </div>
                                                    </div>
                                                    <Button 
                                                        size="sm" 
                                                        variant="light"
                                                        startContent={<Lock size={16} />}
                                                        onClick={onPasswordModalOpen}
                                                        color="primary"
                                                    >
                                                        Change
                                                    </Button>
                                                </div>
                                                
                                                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                                    <div className="flex items-center gap-3">
                                                        <Shield className="w-5 h-5 text-gray-500" />
                                                        <div>
                                                            <p className="font-medium">Two-Factor Authentication</p>
                                                            <p className="text-sm text-gray-600">
                                                                {userProfile?.twoFactorAuth?.enabled 
                                                                    ? "Your account is protected with 2FA" 
                                                                    : "Add an extra layer of security"
                                                                }
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <Button 
                                                        size="sm" 
                                                        variant="light"
                                                        startContent={<Shield size={16} />}
                                                        onClick={on2FAModalOpen}
                                                        color={userProfile?.twoFactorAuth?.enabled ? "success" : "warning"}
                                                    >
                                                        {userProfile?.twoFactorAuth?.enabled ? "Manage" : "Enable"}
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </CardBody>
                        </Card>

                        {/* Notification Preferences */}
                        <Card className="shadow-sm">
                            <CardHeader className="pb-3">
                                <div className="flex items-center gap-2">
                                    <Bell className="w-5 h-5 text-gray-600" />
                                    <h3 className="text-lg font-semibold">Notification Preferences</h3>
                                </div>
                            </CardHeader>
                            <CardBody className="pt-0">
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <Mail className="w-5 h-5 text-gray-500" />
                                            <div>
                                                <p className="font-medium">Email Notifications</p>
                                                <p className="text-sm text-gray-600">Receive updates about your orders and account</p>
                                            </div>
                                        </div>
                                        <Switch
                                            isSelected={preferences.emailNotifications}
                                            onValueChange={(checked) => handlePreferenceChange("emailNotifications", checked)}
                                            color="primary"
                                        />
                                    </div>
                                    
                                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <MessageSquare className="w-5 h-5 text-gray-500" />
                                            <div>
                                                <p className="font-medium">Marketing Emails</p>
                                                <p className="text-sm text-gray-600">Receive promotional offers and product updates</p>
                                            </div>
                                        </div>
                                        <Switch
                                            isSelected={preferences.marketingEmails}
                                            onValueChange={(checked) => handlePreferenceChange("marketingEmails", checked)}
                                            color="primary"
                                        />
                                    </div>
                                    
                                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <Smartphone className="w-5 h-5 text-gray-500" />
                                            <div>
                                                <p className="font-medium">SMS Notifications</p>
                                                <p className="text-sm text-gray-600">Get order updates and alerts via SMS</p>
                                            </div>
                                        </div>
                                        <Switch
                                            isSelected={preferences.smsNotifications}
                                            onValueChange={(checked) => handlePreferenceChange("smsNotifications", checked)}
                                            color="primary"
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