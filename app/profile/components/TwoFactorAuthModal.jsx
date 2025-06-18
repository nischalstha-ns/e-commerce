"use client";

import { useState } from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Input, Chip } from "@heroui/react";
import { Shield, Phone, Check, X } from "lucide-react";
import { enableTwoFactorAuth, disableTwoFactorAuth } from "@/lib/firestore/users/write";
import toast from "react-hot-toast";

export default function TwoFactorAuthModal({ isOpen, onClose, user, userProfile }) {
    const [phoneNumber, setPhoneNumber] = useState("");
    const [verificationCode, setVerificationCode] = useState("");
    const [step, setStep] = useState(1); // 1: phone input, 2: verification, 3: success
    const [isLoading, setIsLoading] = useState(false);

    const is2FAEnabled = userProfile?.twoFactorAuth?.enabled;

    const handlePhoneSubmit = async () => {
        if (!phoneNumber) {
            toast.error("Please enter your phone number");
            return;
        }

        // Basic phone number validation
        const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
        if (!phoneRegex.test(phoneNumber)) {
            toast.error("Please enter a valid phone number");
            return;
        }

        setIsLoading(true);
        try {
            // In a real implementation, you would send SMS verification code here
            // For demo purposes, we'll simulate this
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            toast.success("Verification code sent to your phone");
            setStep(2);
        } catch (error) {
            toast.error("Failed to send verification code");
        }
        setIsLoading(false);
    };

    const handleVerificationSubmit = async () => {
        if (!verificationCode || verificationCode.length !== 6) {
            toast.error("Please enter the 6-digit verification code");
            return;
        }

        setIsLoading(true);
        try {
            // In a real implementation, you would verify the code here
            // For demo purposes, we'll accept "123456" as valid
            if (verificationCode !== "123456") {
                throw new Error("Invalid verification code. Use 123456 for demo.");
            }

            await enableTwoFactorAuth({
                uid: user.uid,
                phoneNumber
            });

            toast.success("Two-factor authentication enabled successfully!");
            setStep(3);
        } catch (error) {
            toast.error(error.message || "Failed to verify code");
        }
        setIsLoading(false);
    };

    const handleDisable2FA = async () => {
        if (!confirm("Are you sure you want to disable two-factor authentication? This will make your account less secure.")) {
            return;
        }

        setIsLoading(true);
        try {
            await disableTwoFactorAuth({ uid: user.uid });
            toast.success("Two-factor authentication disabled");
            onClose();
        } catch (error) {
            toast.error("Failed to disable 2FA");
        }
        setIsLoading(false);
    };

    const handleClose = () => {
        setPhoneNumber("");
        setVerificationCode("");
        setStep(1);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} size="md">
            <ModalContent>
                <ModalHeader className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                        <Shield className="w-5 h-5" />
                        <span>Two-Factor Authentication</span>
                    </div>
                </ModalHeader>
                <ModalBody>
                    {is2FAEnabled ? (
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
                                <Check className="w-6 h-6 text-green-600" />
                                <div>
                                    <p className="font-medium text-green-900">2FA is enabled</p>
                                    <p className="text-sm text-green-700">
                                        Your account is protected with two-factor authentication
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <p className="text-sm font-medium">Phone Number:</p>
                                <p className="text-sm text-gray-600">
                                    {userProfile.twoFactorAuth.phoneNumber || "Not set"}
                                </p>
                            </div>

                            <div className="space-y-2">
                                <p className="text-sm font-medium">Enabled On:</p>
                                <p className="text-sm text-gray-600">
                                    {userProfile.twoFactorAuth.enabledAt 
                                        ? new Date(userProfile.twoFactorAuth.enabledAt.seconds * 1000).toLocaleDateString()
                                        : "Unknown"
                                    }
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {step === 1 && (
                                <>
                                    <div className="text-center">
                                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Phone className="w-8 h-8 text-blue-600" />
                                        </div>
                                        <h3 className="text-lg font-semibold mb-2">Secure Your Account</h3>
                                        <p className="text-gray-600 text-sm">
                                            Add an extra layer of security to your account with two-factor authentication.
                                        </p>
                                    </div>

                                    <Input
                                        label="Phone Number"
                                        placeholder="+1 (555) 123-4567"
                                        value={phoneNumber}
                                        onChange={(e) => setPhoneNumber(e.target.value)}
                                        startContent={<Phone size={16} />}
                                        variant="bordered"
                                        description="We'll send a verification code to this number"
                                    />

                                    <div className="bg-yellow-50 p-3 rounded-lg">
                                        <p className="text-sm text-yellow-800">
                                            <strong>Note:</strong> This is a demo. Use any phone number format and 
                                            enter "123456" as the verification code.
                                        </p>
                                    </div>
                                </>
                            )}

                            {step === 2 && (
                                <>
                                    <div className="text-center">
                                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Shield className="w-8 h-8 text-green-600" />
                                        </div>
                                        <h3 className="text-lg font-semibold mb-2">Enter Verification Code</h3>
                                        <p className="text-gray-600 text-sm">
                                            We sent a 6-digit code to {phoneNumber}
                                        </p>
                                    </div>

                                    <Input
                                        label="Verification Code"
                                        placeholder="123456"
                                        value={verificationCode}
                                        onChange={(e) => setVerificationCode(e.target.value)}
                                        variant="bordered"
                                        maxLength={6}
                                        className="text-center"
                                    />

                                    <div className="bg-blue-50 p-3 rounded-lg">
                                        <p className="text-sm text-blue-800">
                                            <strong>Demo:</strong> Enter "123456" to complete the setup.
                                        </p>
                                    </div>
                                </>
                            )}

                            {step === 3 && (
                                <div className="text-center">
                                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Check className="w-8 h-8 text-green-600" />
                                    </div>
                                    <h3 className="text-lg font-semibold mb-2">2FA Enabled Successfully!</h3>
                                    <p className="text-gray-600 text-sm">
                                        Your account is now protected with two-factor authentication.
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </ModalBody>
                <ModalFooter>
                    {is2FAEnabled ? (
                        <>
                            <Button variant="light" onPress={handleClose}>
                                Close
                            </Button>
                            <Button 
                                color="danger" 
                                onPress={handleDisable2FA}
                                isLoading={isLoading}
                                startContent={<X size={16} />}
                            >
                                Disable 2FA
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button variant="light" onPress={handleClose}>
                                Cancel
                            </Button>
                            {step === 1 && (
                                <Button 
                                    color="primary" 
                                    onPress={handlePhoneSubmit}
                                    isLoading={isLoading}
                                >
                                    Send Code
                                </Button>
                            )}
                            {step === 2 && (
                                <Button 
                                    color="primary" 
                                    onPress={handleVerificationSubmit}
                                    isLoading={isLoading}
                                >
                                    Verify & Enable
                                </Button>
                            )}
                            {step === 3 && (
                                <Button color="primary" onPress={handleClose}>
                                    Done
                                </Button>
                            )}
                        </>
                    )}
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}