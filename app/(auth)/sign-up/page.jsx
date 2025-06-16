"use client";
import { useAuth } from "@/contexts/AuthContext";
import { auth } from "@/lib/firestore/firebase";
import { GoogleAuthProvider, signInWithPopup, createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { Button, Input, Card, CardBody, Divider } from "@heroui/react";
import { Eye, EyeOff, Mail, Lock, User } from "lucide-react";
import Link from "next/link";

function SignUpWithGoogleComponent() {
    const [isLoading, setIsLoading] = useState(false);

    const handleSignUp = async () => {
        setIsLoading(true);
        try {
            const provider = new GoogleAuthProvider();
            await signInWithPopup(auth, provider);
            toast.success("Account created successfully!");
        } catch (error) {
            toast.error(error?.message || "Failed to sign up with Google");
        }
        setIsLoading(false);
    };

    return (
        <Button
            disabled={isLoading}
            onClick={handleSignUp}
            variant="bordered"
            className="w-full"
            startContent={
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
            }
        >
            {isLoading ? "Creating account..." : "Continue with Google"}
        </Button>
    );
}

export default function SignUpPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: ""
    });
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    useEffect(() => {
        if (user) {
            router.push("/dashboard");
        }
    }, [user, router]);

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const validateForm = () => {
        if (!formData.name.trim()) {
            toast.error("Please enter your name");
            return false;
        }
        if (!formData.email) {
            toast.error("Please enter your email");
            return false;
        }
        if (formData.password.length < 6) {
            toast.error("Password must be at least 6 characters");
            return false;
        }
        if (formData.password !== formData.confirmPassword) {
            toast.error("Passwords do not match");
            return false;
        }
        return true;
    };

    const handleEmailSignUp = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) return;

        setIsLoading(true);
        try {
            const userCredential = await createUserWithEmailAndPassword(
                auth, 
                formData.email, 
                formData.password
            );
            
            // Update user profile with display name
            await updateProfile(userCredential.user, {
                displayName: formData.name
            });

            toast.success("Account created successfully!");
        } catch (error) {
            let errorMessage = "Failed to create account";
            
            switch (error.code) {
                case "auth/email-already-in-use":
                    errorMessage = "An account with this email already exists";
                    break;
                case "auth/invalid-email":
                    errorMessage = "Invalid email address";
                    break;
                case "auth/weak-password":
                    errorMessage = "Password is too weak";
                    break;
                default:
                    errorMessage = error.message;
            }
            
            toast.error(errorMessage);
        }
        setIsLoading(false);
    };

    return (
        <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <img className="h-16 mx-auto mb-4" src="/logo.jpg" alt="logo" />
                    <h1 className="text-3xl font-bold text-gray-900">Create Account</h1>
                    <p className="text-gray-600 mt-2">Join us today</p>
                </div>

                <Card className="shadow-xl">
                    <CardBody className="p-8">
                        <form onSubmit={handleEmailSignUp} className="space-y-6">
                            <Input
                                type="text"
                                label="Full Name"
                                placeholder="Enter your full name"
                                value={formData.name}
                                onChange={(e) => handleInputChange("name", e.target.value)}
                                startContent={<User className="w-4 h-4 text-gray-400" />}
                                variant="bordered"
                                isRequired
                            />

                            <Input
                                type="email"
                                label="Email Address"
                                placeholder="Enter your email"
                                value={formData.email}
                                onChange={(e) => handleInputChange("email", e.target.value)}
                                startContent={<Mail className="w-4 h-4 text-gray-400" />}
                                variant="bordered"
                                isRequired
                            />

                            <Input
                                type={showPassword ? "text" : "password"}
                                label="Password"
                                placeholder="Create a password"
                                value={formData.password}
                                onChange={(e) => handleInputChange("password", e.target.value)}
                                startContent={<Lock className="w-4 h-4 text-gray-400" />}
                                endContent={
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="text-gray-400 hover:text-gray-600"
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                }
                                variant="bordered"
                                isRequired
                            />

                            <Input
                                type={showConfirmPassword ? "text" : "password"}
                                label="Confirm Password"
                                placeholder="Confirm your password"
                                value={formData.confirmPassword}
                                onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                                startContent={<Lock className="w-4 h-4 text-gray-400" />}
                                endContent={
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="text-gray-400 hover:text-gray-600"
                                    >
                                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                }
                                variant="bordered"
                                isRequired
                            />

                            <Button
                                type="submit"
                                color="primary"
                                className="w-full"
                                size="lg"
                                isLoading={isLoading}
                                isDisabled={isLoading}
                            >
                                Create Account
                            </Button>
                        </form>

                        <div className="mt-6">
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <Divider />
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-2 bg-white text-gray-500">Or continue with</span>
                                </div>
                            </div>

                            <div className="mt-6">
                                <SignUpWithGoogleComponent />
                            </div>
                        </div>

                        <div className="mt-8 text-center">
                            <p className="text-gray-600">
                                Already have an account?{" "}
                                <Link 
                                    href="/login" 
                                    className="text-blue-600 hover:text-blue-800 font-medium hover:underline"
                                >
                                    Sign in
                                </Link>
                            </p>
                        </div>
                    </CardBody>
                </Card>
            </div>
        </main>
    );
}