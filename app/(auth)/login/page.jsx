"use client";
import { useAuth } from "@/contexts/AuthContext";
import { auth } from "@/lib/firestore/firebase";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { useRouter } from "next/navigation"; // ✅ FIXED IMPORT
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

// ✅ Define SignInWithGoogleComponent BEFORE using it
function SignInWithGoogleComponent() {
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async () => {
        setIsLoading(true);
        try {
            const provider = new GoogleAuthProvider();
            await signInWithPopup(auth, provider);
            toast.success("Successfully signed in!");
        } catch (error) {
            toast.error(error?.message || "Failed to sign in with Google");
        }
        setIsLoading(false);
    };

    return (
        <button
            disabled={isLoading}
            onClick={handleLogin}
            className={`flex justify-center px-3 py-2 rounded-xl items-center w-full transition-transform duration-200 
                ${isLoading ? "bg-gray-400 cursor-not-allowed" : "bg-gray-300 hover:bg-gray-400 hover:shadow-lg"}
            `}
        >
            {isLoading ? "Signing in..." : "Sign in with Google"}
        </button>
    );
}

export default function Page() {
    const { user } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (user) {
            router.push("/dashboard");
        }
    }, [user, router]);

    return (
        <main className="w-full flex justify-center items-center bg-gray-300 md:p-24 p-10 min-h-screen">
            <section className="flex flex-col gap-3">
                <div className="flex justify-center">
                    <img className="h-24" src="/logo.jpg" alt="logo" />
                </div>
                <div className="bg-white md:p-10 p-5 rounded-xl md:min-w-[540px] w-full">
                    <h1 className="font-bold text-xl">Login with Email</h1>
                    <form className="flex flex-col gap-3">
                        <input 
                            placeholder="Enter your Email" 
                            type="email" 
                            name="user-email" 
                            id="user-email" 
                            className="px-3 py-2 rounded-xl border focus:outline-none w-full"
                        />
                        <input 
                            placeholder="Enter your Password" 
                            type="password" 
                            name="user-password" 
                            id="user-password" 
                            className="px-3 py-2 rounded-xl border focus:outline-none w-full"
                        />
                        <button 
                            type="submit"
                            className="bg-blue-600 text-white font-bold px-3 py-2 rounded-xl border focus:outline-none w-full hover:bg-blue-700 hover:shadow-lg hover:scale-105 transition-transform duration-200"
                        >
                            Login
                        </button>
                        <hr />
                    </form>
                    <div className="flex justify-between text-blue-700">
                        <a href="/sign-up">Don't have an account?</a>
                        <a href="/forget-password">Forgot password?</a>
                    </div>
                    <SignInWithGoogleComponent /> {/* ✅ Now correctly defined */}
                </div>
            </section>
        </main>
    );
}
