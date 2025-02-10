'use client'
import { auth } from "@/lib/firestore/firebse";
import { Button } from "@heroui/react";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { useState } from "react";
import { toast } from "react-hot-toast"; // Ensure you import toast

export default function Page() {
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
                        <button className="bg-blue-600 text-white font-bold px-3 py-2 rounded-xl border focus:outline-none w-full hover:bg-blue-700 hover:shadow-lg hover:scale-105 transition-transform duration-200">
                            Login
                        </button>
                        <hr />
                    </form>
                    <div className="flex justify-between text-blue-700">
                        <a href="/sign-up">Don't-You-Have-Account??</a>
                        <a href="/forget-password">Forget-Password</a>
                    </div>
                    <SignInWithGoogleComponent />
                </div>
            </section>
        </main>
    );
}

function SignInWithGoogleComponent() {
    const [isLoading, setIsLoading]=useState(false);

    const handleLogin = async () => {
        setIsLoading(true);
        try {
            await signInWithPopup(auth,new GoogleAuthProvider())
          
        } catch (error) {
            toast.error(error?.message);
        }
        setIsLoading(false);
    };

    return (
        <button
        isLoading={isLoading} isDisabled={isLoading}
            onClick={handleLogin}
            className="flex justify-center px-3 py-2 rounded-xl items-center bg-gray-300 w-full hover:bg-brown-300 hover:shadow-lg"
        >
            Sign in with Google
        </button>
    );
}
