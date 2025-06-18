"use client";

import { useState } from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Input, Progress } from "@heroui/react";
import { Eye, EyeOff, Lock, Shield, Check, X, AlertTriangle } from "lucide-react";
import { changeUserPassword } from "@/lib/firestore/users/write";
import toast from "react-hot-toast";

export default function PasswordChangeModal({ isOpen, onClose }) {
    const [formData, setFormData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
    });
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false
    });
    const [isLoading, setIsLoading] = useState(false);

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const togglePasswordVisibility = (field) => {
        setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
    };

    const getPasswordStrength = (password) => {
        if (!password) return { score: 0, label: "", color: "default" };
        
        let score = 0;
        if (password.length >= 8) score += 25;
        if (/[a-z]/.test(password)) score += 25;
        if (/[A-Z]/.test(password)) score += 25;
        if (/[0-9]/.test(password)) score += 25;
        if (/[^A-Za-z0-9]/.test(password)) score += 25;
        
        if (score <= 25) return { score, label: "Weak", color: "danger" };
        if (score <= 50) return { score, label: "Fair", color: "warning" };
        if (score <= 75) return { score, label: "Good", color: "primary" };
        return { score, label: "Strong", color: "success" };
    };

    const passwordStrength = getPasswordStrength(formData.newPassword);

    const validateForm = () => {
        if (!formData.currentPassword) {
            toast.error("Please enter your current password");
            return false;
        }
        if (formData.newPassword.length < 6) {
            toast.error("New password must be at least 6 characters");
            return false;
        }
        if (formData.newPassword !== formData.confirmPassword) {
            toast.error("New passwords do not match");
            return false;
        }
        if (formData.currentPassword === formData.newPassword) {
            toast.error("New password must be different from current password");
            return false;
        }
        return true;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        setIsLoading(true);
        try {
            await changeUserPassword({
                currentPassword: formData.currentPassword,
                newPassword: formData.newPassword
            });
            
            toast.success("Password changed successfully!");
            setFormData({
                currentPassword: "",
                newPassword: "",
                confirmPassword: ""
            });
            onClose();
        } catch (error) {
            toast.error(error.message || "Failed to change password");
        }
        setIsLoading(false);
    };

    const handleClose = () => {
        setFormData({
            currentPassword: "",
            newPassword: "",
            confirmPassword: ""
        });
        setShowPasswords({
            current: false,
            new: false,
            confirm: false
        });
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} size="md">
            <ModalContent>
                <ModalHeader className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-blue-100 rounded-full">
                            <Lock className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <span className="text-lg font-semibold">Change Password</span>
                            <p className="text-sm text-gray-600 font-normal">Update your account password</p>
                        </div>
                    </div>
                </ModalHeader>
                <ModalBody>
                    <div className="space-y-4">
                        {/* Current Password */}
                        <Input
                            label="Current Password"
                            type={showPasswords.current ? "text" : "password"}
                            value={formData.currentPassword}
                            onChange={(e) => handleInputChange("currentPassword", e.target.value)}
                            startContent={<Lock className="w-4 h-4 text-gray-400" />}
                            endContent={
                                <button
                                    type="button"
                                    onClick={() => togglePasswordVisibility("current")}
                                    className="text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    {showPasswords.current ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            }
                            variant="bordered"
                            isRequired
                            placeholder="Enter your current password"
                        />

                        {/* New Password */}
                        <div className="space-y-2">
                            <Input
                                label="New Password"
                                type={showPasswords.new ? "text" : "password"}
                                value={formData.newPassword}
                                onChange={(e) => handleInputChange("newPassword", e.target.value)}
                                startContent={<Shield className="w-4 h-4 text-gray-400" />}
                                endContent={
                                    <button
                                        type="button"
                                        onClick={() => togglePasswordVisibility("new")}
                                        className="text-gray-400 hover:text-gray-600 transition-colors"
                                    >
                                        {showPasswords.new ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                }
                                variant="bordered"
                                isRequired
                                placeholder="Enter your new password"
                            />
                            
                            {/* Password Strength Indicator */}
                            {formData.newPassword && (
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-gray-600">Password Strength:</span>
                                        <span className={`text-xs font-medium ${
                                            passwordStrength.color === "danger" ? "text-red-600" :
                                            passwordStrength.color === "warning" ? "text-yellow-600" :
                                            passwordStrength.color === "primary" ? "text-blue-600" :
                                            "text-green-600"
                                        }`}>
                                            {passwordStrength.label}
                                        </span>
                                    </div>
                                    <Progress 
                                        value={passwordStrength.score} 
                                        color={passwordStrength.color}
                                        size="sm"
                                        className="w-full"
                                    />
                                </div>
                            )}
                        </div>

                        {/* Confirm Password */}
                        <Input
                            label="Confirm New Password"
                            type={showPasswords.confirm ? "text" : "password"}
                            value={formData.confirmPassword}
                            onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                            startContent={<Check className="w-4 h-4 text-gray-400" />}
                            endContent={
                                <button
                                    type="button"
                                    onClick={() => togglePasswordVisibility("confirm")}
                                    className="text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    {showPasswords.confirm ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            }
                            variant="bordered"
                            isRequired
                            placeholder="Confirm your new password"
                            color={
                                formData.confirmPassword && formData.newPassword !== formData.confirmPassword 
                                    ? "danger" 
                                    : formData.confirmPassword && formData.newPassword === formData.confirmPassword
                                    ? "success"
                                    : "default"
                            }
                        />

                        {/* Password Requirements */}
                        <div className="bg-blue-50 p-4 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                                <AlertTriangle className="w-4 h-4 text-blue-600" />
                                <p className="text-sm font-medium text-blue-800">Password Requirements:</p>
                            </div>
                            <ul className="text-xs text-blue-700 space-y-1">
                                <li className="flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full ${formData.newPassword.length >= 6 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                                    At least 6 characters long
                                </li>
                                <li className="flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full ${formData.currentPassword !== formData.newPassword && formData.newPassword ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                                    Different from your current password
                                </li>
                                <li className="flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full ${/[A-Za-z]/.test(formData.newPassword) && /[0-9]/.test(formData.newPassword) ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                                    Mix of letters and numbers (recommended)
                                </li>
                            </ul>
                        </div>
                    </div>
                </ModalBody>
                <ModalFooter>
                    <Button 
                        variant="light" 
                        onPress={handleClose}
                        startContent={<X size={16} />}
                    >
                        Cancel
                    </Button>
                    <Button 
                        color="primary" 
                        onPress={handleSubmit}
                        isLoading={isLoading}
                        isDisabled={isLoading}
                        startContent={<Shield size={16} />}
                    >
                        {isLoading ? "Changing..." : "Change Password"}
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}