"use client";
import { auth } from "@/lib/firestore/firebase";
import { sendPasswordResetEmail } from "firebase/auth";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { Button, Input, Card, CardBody } from "@heroui/react";
import { Mail, ArrowLeft } from "lucide-react";
import Link from "next/link";
import AnimatedRing from "../../components/AnimatedRing";
import ThemeToggle from "../../components/ThemeToggle";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [emailSent, setEmailSent] = useState(false);

    const handleResetPassword = async (e) => {
        e.preventDefault();
        
        if (!email) {
            toast.error("Please enter your email address");
            return;
        }

        setIsLoading(true);
        try {
            await sendPasswordResetEmail(auth, email);
            setEmailSent(true);
            toast.success("Password reset email sent!");
        } catch (error) {
            let errorMessage = "Failed to send reset email";
            
            switch (error.code) {
                case "auth/user-not-found":
                    errorMessage = "No account found with this email address";
                    break;
                case "auth/invalid-email":
                    errorMessage = "Invalid email address";
                    break;
                case "auth/too-many-requests":
                    errorMessage = "Too many requests. Please try again later";
                    break;
                default:
                    errorMessage = error.message;
            }
            
            toast.error(errorMessage);
        }
        setIsLoading(false);
    };

    if (emailSent) {
        return (
            <main className="h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-100 dark:from-[#121212] dark:to-[#1a1a1a] p-4 theme-transition relative overflow-hidden">
                <AnimatedRing />
                <div className="fixed top-4 right-4 z-50">
                  <div className="bg-white/90 dark:bg-[#1e1e1e]/90 backdrop-blur-sm rounded-lg p-1 shadow-lg border border-gray-200 dark:border-[#2e2e2e] theme-transition">
                    <ThemeToggle />
                  </div>
                </div>
                <div className="w-full max-w-md auth-container relative z-10">
                    <Card className="shadow-xl dark:shadow-[0_4px_16px_rgba(0,0,0,0.4)] bg-white dark:bg-[#1e1e1e] border-0 dark:border dark:border-[#2e2e2e] theme-transition">
                        <CardBody className="p-3 text-center">
                            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6 theme-transition">
                                <Mail className="w-8 h-8 text-green-600 dark:text-green-400 theme-transition" />
                            </div>
                            
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-[#e5e7eb] mb-4 theme-transition">Check Your Email</h1>
                            
                            <p className="text-gray-600 dark:text-[#9ca3af] mb-6 theme-transition">
                                We've sent a password reset link to <strong>{email}</strong>
                            </p>
                            
                            <p className="text-sm text-gray-500 dark:text-[#9ca3af] mb-8 theme-transition">
                                Didn't receive the email? Check your spam folder or try again.
                            </p>
                            
                            <div className="space-y-4">
                                <Button
                                    onClick={() => {
                                        setEmailSent(false);
                                        setEmail("");
                                    }}
                                    variant="bordered"
                                    className="w-full"
                                >
                                    Try Different Email
                                </Button>
                                
                                <Link href="/login">
                                    <Button
                                        color="primary"
                                        className="w-full"
                                        startContent={<ArrowLeft className="w-4 h-4" />}
                                    >
                                        Back to Sign In
                                    </Button>
                                </Link>
                            </div>
                        </CardBody>
                    </Card>
                </div>
            </main>
        );
    }

    return (
        <main className="h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-100 dark:from-[#121212] dark:to-[#1a1a1a] p-4 theme-transition relative overflow-hidden">
            <AnimatedRing />
            <div className="fixed top-4 right-4 z-50">
              <div className="bg-white/90 dark:bg-[#1e1e1e]/90 backdrop-blur-sm rounded-lg p-1 shadow-lg border border-gray-200 dark:border-[#2e2e2e] theme-transition">
                <ThemeToggle />
              </div>
            </div>
            <div className="w-full max-w-md auth-container relative z-10">
                <div className="text-center mb-8">
                    <img className="h-16 mx-auto mb-4" src="/logo.jpg" alt="logo" />
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-[#e5e7eb] theme-transition">Reset Password</h1>
                    <p className="text-gray-600 dark:text-[#9ca3af] mt-2 theme-transition">Enter your email to receive a reset link</p>
                </div>

                <Card className="shadow-xl dark:shadow-[0_4px_16px_rgba(0,0,0,0.4)] bg-white dark:bg-[#1e1e1e] border-0 dark:border dark:border-[#2e2e2e] theme-transition">
                    <CardBody className="p-3">
                        <form onSubmit={handleResetPassword} className="space-y-6">
                            <Input
                                type="email"
                                label="Email Address"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                startContent={<Mail className="w-4 h-4 text-gray-400 dark:text-[#9ca3af]" />}
                                variant="bordered"
                                classNames={{
                                  input: "bg-transparent dark:text-[#f3f4f6]",
                                  inputWrapper: "bg-white dark:bg-[#2a2a2a] border-gray-300 dark:border-[#3a3a3a] hover:border-blue-500 dark:hover:border-blue-400 theme-transition",
                                  label: "text-gray-700 dark:text-[#e5e7eb]"
                                }}
                                isRequired
                            />

                            <Button
                                type="submit"
                                color="primary"
                                className="w-full bg-blue-600 dark:bg-blue-600 hover:bg-blue-700 dark:hover:bg-blue-500 text-white font-medium glow-hover theme-transition"
                                size="lg"
                                isLoading={isLoading}
                                isDisabled={isLoading}
                            >
                                Send Reset Email
                            </Button>
                        </form>

                        <div className="mt-8 text-center">
                            <Link 
                                href="/login" 
                                className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium hover:underline inline-flex items-center gap-2 theme-transition"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Back to Sign In
                            </Link>
                        </div>
                    </CardBody>
                </Card>
            </div>
        </main>
    );
}