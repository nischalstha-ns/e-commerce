"use client";

import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@heroui/react";
import { ShoppingCart, User, LogOut, Menu } from "lucide-react";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firestore/firebase";
import toast from "react-hot-toast";
import { useState } from "react";
import Link from "next/link";

export default function Header() {
    const { user, isAdmin } = useAuth();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    
    const menulist = [
        { name: "Home", link: "/" },
        { name: "Shop", link: "/shop" },
        { name: "About", link: "/about-us" },
        { name: "Contact", link: "/contact-us" },
    ];

    const handleLogout = async () => {
        try {
            await signOut(auth);
            toast.success("Logged out successfully");
        } catch (error) {
            toast.error("Error logging out");
        }
    };

    return (
        <nav className="py-3 px-4 border-b flex items-center justify-between bg-white shadow-sm relative">
            <Link href="/">
                <img className="h-8" src="/logo.jpg" alt="Logo" />
            </Link>

            {/* Desktop Menu */}
            <div className="hidden md:flex gap-4 items-center font-medium">
                {menulist.map((item) => (
                    <Link 
                        key={item.link} 
                        href={item.link} 
                        className="hover:text-blue-600 transition-colors text-sm"
                    >
                        {item.name}
                    </Link>
                ))}
            </div>

            {/* Mobile Menu Button */}
            <button
                className="md:hidden"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
                <Menu size={20} />
            </button>

            {/* Desktop Auth Section */}
            <div className="hidden md:flex items-center gap-2">
                {user ? (
                    <>
                        <Button
                            as={Link}
                            href="/cart"
                            variant="light"
                            isIconOnly
                            size="sm"
                        >
                            <ShoppingCart size={18} />
                        </Button>
                        
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                                {user.photoURL ? (
                                    <img 
                                        src={user.photoURL} 
                                        alt={user.displayName} 
                                        className="w-full h-full object-cover" 
                                    />
                                ) : (
                                    <User size={12} className="text-gray-500" />
                                )}
                            </div>
                            
                            <div className="flex items-center gap-2">
                                <Link 
                                    href="/dashboard" 
                                    className="text-xs hover:text-blue-600 transition-colors"
                                >
                                    Dashboard
                                </Link>
                                
                                {isAdmin && (
                                    <Link 
                                        href="/admin" 
                                        className="text-xs text-blue-600 hover:text-blue-800 transition-colors"
                                    >
                                        Admin
                                    </Link>
                                )}
                                
                                <Button
                                    onClick={handleLogout}
                                    variant="light"
                                    size="sm"
                                    startContent={<LogOut size={12} />}
                                    className="text-xs"
                                >
                                    Logout
                                </Button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex gap-2">
                        <Button
                            as={Link}
                            href="/login"
                            variant="bordered"
                            size="sm"
                        >
                            Login
                        </Button>
                        <Button
                            as={Link}
                            href="/sign-up"
                            color="primary"
                            size="sm"
                        >
                            Sign Up
                        </Button>
                    </div>
                )}
            </div>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <div className="absolute top-full left-0 right-0 bg-white border-b shadow-lg md:hidden z-50">
                    <div className="p-4 space-y-3">
                        {menulist.map((item) => (
                            <Link 
                                key={item.link} 
                                href={item.link} 
                                className="block py-1 hover:text-blue-600 transition-colors text-sm"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                {item.name}
                            </Link>
                        ))}
                        
                        <div className="border-t pt-3">
                            {user ? (
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                                            {user.photoURL ? (
                                                <img 
                                                    src={user.photoURL} 
                                                    alt={user.displayName} 
                                                    className="w-full h-full object-cover" 
                                                />
                                            ) : (
                                                <User size={12} className="text-gray-500" />
                                            )}
                                        </div>
                                        <span className="text-xs font-medium">{user.displayName || user.email}</span>
                                    </div>
                                    
                                    <Link 
                                        href="/cart" 
                                        className="flex items-center gap-2 py-1 hover:text-blue-600 transition-colors text-sm"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        <ShoppingCart size={14} />
                                        Cart
                                    </Link>
                                    
                                    <Link 
                                        href="/dashboard" 
                                        className="block py-1 hover:text-blue-600 transition-colors text-sm"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        Dashboard
                                    </Link>
                                    
                                    {isAdmin && (
                                        <Link 
                                            href="/admin" 
                                            className="block py-1 text-blue-600 hover:text-blue-800 transition-colors text-sm"
                                            onClick={() => setIsMobileMenuOpen(false)}
                                        >
                                            Admin
                                        </Link>
                                    )}
                                    
                                    <button
                                        onClick={() => {
                                            handleLogout();
                                            setIsMobileMenuOpen(false);
                                        }}
                                        className="flex items-center gap-2 py-1 text-red-600 hover:text-red-800 transition-colors text-sm"
                                    >
                                        <LogOut size={14} />
                                        Logout
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <Link 
                                        href="/login"
                                        className="block w-full"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        <Button variant="bordered" className="w-full" size="sm">
                                            Login
                                        </Button>
                                    </Link>
                                    <Link 
                                        href="/sign-up"
                                        className="block w-full"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        <Button color="primary" className="w-full" size="sm">
                                            Sign Up
                                        </Button>
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
}