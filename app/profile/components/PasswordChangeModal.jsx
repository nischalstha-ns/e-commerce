"use client";

import { useState } from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Input } from "@heroui/react";
import { Eye, EyeOff, Lock } from "lucide-react";
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
                        <Lock className="w-5 h-5" />
                        <span>Change Password</span>
                    </div>
                </ModalHeader>
                <ModalBody>
                    <div className="space-y-4">
                        <Input
                            label="Current Password"
                            type={showPasswords.current ? "text" : "password"}
                            value={formData.currentPassword}
                            onChange={(e) => handleInputChange("currentPassword", e.target.value)}
                            endContent={
                                <button
                                    type="button"
                                    onClick={() => togglePasswordVisibility("current")}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    {showPasswords.current ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            }
                            variant="bordered"
                            isRequired
                        />

                        <Input
                            label="New Password"
                            type={showPasswords.new ? "text" : "password"}
                            value={formData.newPassword}
                            onChange={(e) => handleInputChange("newPassword", e.target.value)}
                            endContent={
                                <button
                                    type="button"
                                    onClick={() => togglePasswordVisibility("new")}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    {showPasswords.new ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            }
                            variant="bordered"
                            isRequired
                        />

                        <Input
                            label="Confirm New Password"
                            type={showPasswords.confirm ? "text" : "password"}
                            value={formData.confirmPassword}
                            onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                            endContent={
                                <button
                                    type="button"
                                    onClick={() => togglePasswordVisibility("confirm")}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    {showPasswords.confirm ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            }
                            variant="bordered"
                            isRequired
                        />

                        <div className="bg-blue-50 p-3 rounded-lg">
                            <p className="text-sm text-blue-800">
                                <strong>Password Requirements:</strong>
                            </p>
                            <ul className="text-xs text-blue-700 mt-1 space-y-1">
                                <li>• At least 6 characters long</li>
                                <li>• Different from your current password</li>
                                <li>• Use a combination of letters, numbers, and symbols for better security</li>
                            </ul>
                        </div>
                    </div>
                </ModalBody>
                <ModalFooter>
                    <Button variant="light" onPress={handleClose}>
                        Cancel
                    </Button>
                    <Button 
                        color="primary" 
                        onPress={handleSubmit}
                        isLoading={isLoading}
                        isDisabled={isLoading}
                    >
                        Change Password
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}