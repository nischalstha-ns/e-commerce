"use client";

import { useState } from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Input, Chip } from "@heroui/react";
import { Shield, Phone, Check, X, AlertTriangle, Smartphone, Lock, Key, Calendar } from "lucide-react";
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
                        <div className={`p-2 rounded-full ${is2FAEnabled ? 'bg-green-100' : 'bg-blue-100'}`}>
                            <Shield className={`w-5 h-5 ${is2FAEnabled ? 'text-green-600' : 'text-blue-600'}`} />
                        </div>
                        <div>
                            <span className="text-lg font-semibold">Two-Factor Authentication</span>
                            <p className="text-sm text-gray-600 font-normal">
                                {is2FAEnabled ? "Manage your 2FA settings" : "Secure your account with 2FA"}
                            </p>
                        </div>
                    </div>
                </ModalHeader>
                <ModalBody>
                    {is2FAEnabled ? (
                        <div className="space-y-4">
                            {/* 2FA Enabled Status */}
                            <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
                                <div className="p-2 bg-green-100 rounded-full">
                                    <Check className="w-6 h-6 text-green-600" />
                                </div>
                                <div>
                                    <p className="font-medium text-green-900">2FA is Active</p>
                                    <p className="text-sm text-green-700">
                                        Your account is protected with two-factor authentication
                                    </p>
                                </div>
                            </div>

                            {/* Phone Number Info */}
                            <div className="space-y-3">
                                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                    <Phone className="w-5 h-5 text-gray-500" />
                                    <div>
                                        <p className="text-sm font-medium">Registered Phone:</p>
                                        <p className="text-sm text-gray-600">
                                            {userProfile.twoFactorAuth.phoneNumber || "Not set"}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                    <Calendar className="w-5 h-5 text-gray-500" />
                                    <div>
                                        <p className="text-sm font-medium">Enabled On:</p>
                                        <p className="text-sm text-gray-600">
                                            {userProfile.twoFactorAuth.enabledAt 
                                                ? new Date(userProfile.twoFactorAuth.enabledAt.seconds * 1000).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric'
                                                })
                                                : "Unknown"
                                            }
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Security Benefits */}
                            <div className="bg-blue-50 p-4 rounded-lg">
                                <div className="flex items-center gap-2 mb-2">
                                    <Lock className="w-4 h-4 text-blue-600" />
                                    <p className="text-sm font-medium text-blue-800">Security Benefits:</p>
                                </div>
                                <ul className="text-xs text-blue-700 space-y-1">
                                    <li className="flex items-center gap-2">
                                        <Check className="w-3 h-3" />
                                        Protection against unauthorized access
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <Check className="w-3 h-3" />
                                        SMS verification for login attempts
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <Check className="w-3 h-3" />
                                        Enhanced account security
                                    </li>
                                </ul>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {step === 1 && (
                                <>
                                    <div className="text-center">
                                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Smartphone className="w-8 h-8 text-blue-600" />
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
                                        startContent={<Phone size={16} className="text-gray-400" />}
                                        variant="bordered"
                                        description="We'll send a verification code to this number"
                                    />

                                    <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                                        <div className="flex items-center gap-2 mb-2">
                                            <AlertTriangle className="w-4 h-4 text-yellow-600" />
                                            <p className="text-sm font-medium text-yellow-800">Demo Mode:</p>
                                        </div>
                                        <p className="text-sm text-yellow-700">
                                            This is a demo. Use any phone number format and 
                                            enter <strong>"123456"</strong> as the verification code.
                                        </p>
                                    </div>
                                </>
                            )}

                            {step === 2 && (
                                <>
                                    <div className="text-center">
                                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Key className="w-8 h-8 text-green-600" />
                                        </div>
                                        <h3 className="text-lg font-semibold mb-2">Enter Verification Code</h3>
                                        <p className="text-gray-600 text-sm">
                                            We sent a 6-digit code to <strong>{phoneNumber}</strong>
                                        </p>
                                    </div>

                                    <Input
                                        label="Verification Code"
                                        placeholder="123456"
                                        value={verificationCode}
                                        onChange={(e) => setVerificationCode(e.target.value)}
                                        startContent={<Key size={16} className="text-gray-400" />}
                                        variant="bordered"
                                        maxLength={6}
                                        className="text-center"
                                        description="Enter the 6-digit code sent to your phone"
                                    />

                                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                                        <div className="flex items-center gap-2 mb-1">
                                            <AlertTriangle className="w-4 h-4 text-blue-600" />
                                            <p className="text-sm font-medium text-blue-800">Demo Code:</p>
                                        </div>
                                        <p className="text-sm text-blue-700">
                                            Enter <strong>"123456"</strong> to complete the setup.
                                        </p>
                                    </div>

                                    <Button
                                        variant="light"
                                        size="sm"
                                        onClick={() => setStep(1)}
                                        startContent={<Phone size={14} />}
                                        className="w-full"
                                    >
                                        Change Phone Number
                                    </Button>
                                </>
                            )}

                            {step === 3 && (
                                <div className="text-center">
                                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Check className="w-8 h-8 text-green-600" />
                                    </div>
                                    <h3 className="text-lg font-semibold mb-2">2FA Enabled Successfully!</h3>
                                    <p className="text-gray-600 text-sm mb-4">
                                        Your account is now protected with two-factor authentication.
                                    </p>
                                    
                                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Shield className="w-4 h-4 text-green-600" />
                                            <p className="text-sm font-medium text-green-800">What's Next:</p>
                                        </div>
                                        <ul className="text-xs text-green-700 space-y-1 text-left">
                                            <li>• You'll receive SMS codes for future logins</li>
                                            <li>• Keep your phone number updated</li>
                                            <li>• You can disable 2FA anytime from settings</li>
                                        </ul>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </ModalBody>
                <ModalFooter>
                    {is2FAEnabled ? (
                        <>
                            <Button 
                                variant="light" 
                                onPress={handleClose}
                                startContent={<X size={16} />}
                            >
                                Close
                            </Button>
                            <Button 
                                color="danger" 
                                onPress={handleDisable2FA}
                                isLoading={isLoading}
                                startContent={<X size={16} />}
                            >
                                {isLoading ? "Disabling..." : "Disable 2FA"}
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button 
                                variant="light" 
                                onPress={handleClose}
                                startContent={<X size={16} />}
                            >
                                Cancel
                            </Button>
                            {step === 1 && (
                                <Button 
                                    color="primary" 
                                    onPress={handlePhoneSubmit}
                                    isLoading={isLoading}
                                    startContent={<Phone size={16} />}
                                >
                                    {isLoading ? "Sending..." : "Send Code"}
                                </Button>
                            )}
                            {step === 2 && (
                                <Button 
                                    color="primary" 
                                    onPress={handleVerificationSubmit}
                                    isLoading={isLoading}
                                    startContent={<Shield size={16} />}
                                >
                                    {isLoading ? "Verifying..." : "Verify & Enable"}
                                </Button>
                            )}
                            {step === 3 && (
                                <Button 
                                    color="success" 
                                    onPress={handleClose}
                                    startContent={<Check size={16} />}
                                >
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