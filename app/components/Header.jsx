"use client";

import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@heroui/react";
import { ShoppingCart, User, LogOut } from "lucide-react";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firestore/firebase";
import toast from "react-hot-toast";

export default function Header() {
    const { user, isAdmin } = useAuth();
    
    const menulist = [
        {
            name: "Home",
            link: "/",
        },
        {
            name: "Shop",
            link: "/shop",
        },
        {
            name: "About Us",
            link: "/about-us",
        },
        {
            name: "Contact Us",
            link: "/contact-us",
        },
    ];

    const handleLogout = async () => {
        try {
            await signOut(auth);
            toast.success("Successfully logged out");
        } catch (error) {
            toast.error(error?.message || "Error logging out");
        }
    };

    return (
        <nav className="py-4 px-6 border-b flex items-center justify-between bg-white shadow-sm">
            <a href="/">
                <img className="h-10" src="/logo.jpg" alt="Logo" />
            </a>

            <div className="flex gap-6 items-center font-medium">
                {menulist?.map((item) => (
                    <a 
                        key={item?.link} 
                        href={item?.link} 
                        className="hover:text-blue-600 transition-colors"
                    >
                        {item?.name}
                    </a>
                ))}
            </div>

            <div className="flex items-center gap-3">
                {user ? (
                    <>
                        <Button
                            as="a"
                            href="/cart"
                            variant="light"
                            isIconOnly
                        >
                            <ShoppingCart size={20} />
                        </Button>
                        
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                                {user.photoURL ? (
                                    <img 
                                        src={user.photoURL} 
                                        alt={user.displayName} 
                                        className="w-full h-full object-cover" 
                                    />
                                ) : (
                                    <User size={16} className="text-gray-500" />
                                )}
                            </div>
                            
                            <div className="flex items-center gap-2">
                                <a 
                                    href="/dashboard" 
                                    className="text-sm hover:text-blue-600 transition-colors"
                                >
                                    Dashboard
                                </a>
                                
                                {isAdmin && (
                                    <a 
                                        href="/admin" 
                                        className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
                                    >
                                        Admin
                                    </a>
                                )}
                                
                                <Button
                                    onClick={handleLogout}
                                    variant="light"
                                    size="sm"
                                    startContent={<LogOut size={14} />}
                                >
                                    Logout
                                </Button>
                            </div>
                        </div>
                    </>
                ) : (
                    <Button
                        as="a"
                        href="/login"
                        color="primary"
                    >
                        Login
                    </Button>
                )}
            </div>
        </nav>
    );
}