"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/lib/firestore/cart/read";
import { Button, Badge, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@heroui/react";
import { ShoppingCart, User, LogOut, Menu, Shield, Search, Heart } from "lucide-react";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firestore/firebase";
import toast from "react-hot-toast";
import { useState } from "react";
import Link from "next/link";

export default function Header() {
    const { user, isAdmin } = useAuth();
    const { data: cart } = useCart(user?.uid);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    
    const menulist = [
        { name: "Shop", link: "/shop" },
        { name: "Categories", link: "/categories" },
        { name: "New Arrivals", link: "/new-arrivals" },
        { name: "Sale", link: "/sale" },
    ];

    const cartItemCount = cart?.items?.reduce((total, item) => total + item.quantity, 0) || 0;

    const handleLogout = async () => {
        try {
            await signOut(auth);
            toast.success("Logged out successfully");
        } catch (error) {
            toast.error("Error logging out");
        }
    };

    return (
        <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
            {/* Main Header */}
            <div className="container mx-auto px-4 py-4">
                <div className="flex items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="flex items-center">
                        <img className="h-8" src="/logo.jpg" alt="Logo" />
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden lg:flex items-center space-x-8">
                        {menulist.map((item) => (
                            <Link 
                                key={item.link} 
                                href={item.link} 
                                className="text-gray-700 hover:text-black transition-colors font-medium"
                            >
                                {item.name}
                            </Link>
                        ))}
                    </div>

                    {/* Search Bar */}
                    <div className="hidden md:flex items-center flex-1 max-w-md mx-8">
                        <div className="relative w-full">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search products..."
                                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-gray-200 focus:border-transparent"
                            />
                        </div>
                    </div>

                    {/* Right Side Actions */}
                    <div className="flex items-center space-x-4">
                        {/* Search Icon (Mobile) */}
                        <button className="md:hidden p-2 hover:bg-gray-100 rounded-full transition-colors">
                            <Search size={20} />
                        </button>

                        {/* Wishlist */}
                        <button className="hidden md:block p-2 hover:bg-gray-100 rounded-full transition-colors">
                            <Heart size={20} />
                        </button>

                        {/* Cart */}
                        <Button
                            as={Link}
                            href="/cart"
                            variant="light"
                            isIconOnly
                            className="relative p-2 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <Badge 
                                content={cartItemCount} 
                                color="danger" 
                                size="sm"
                                isInvisible={cartItemCount === 0}
                                className="border-2 border-white"
                            >
                                <ShoppingCart size={20} />
                            </Badge>
                        </Button>

                        {/* User Menu */}
                        {user ? (
                            <Dropdown placement="bottom-end">
                                <DropdownTrigger>
                                    <Button variant="light" className="p-0 min-w-0">
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
                                            <div className="hidden md:block text-left">
                                                <p className="text-sm font-medium">{user.displayName || "User"}</p>
                                            </div>
                                        </div>
                                    </Button>
                                </DropdownTrigger>
                                <DropdownMenu aria-label="User menu">
                                    <DropdownItem key="dashboard" as={Link} href="/dashboard">
                                        Dashboard
                                    </DropdownItem>
                                    <DropdownItem key="orders" as={Link} href="/orders">
                                        My Orders
                                    </DropdownItem>
                                    <DropdownItem key="profile" as={Link} href="/profile">
                                        Profile
                                    </DropdownItem>
                                    {isAdmin && (
                                        <DropdownItem key="admin" as={Link} href="/admin" startContent={<Shield size={16} />}>
                                            Admin Panel
                                        </DropdownItem>
                                    )}
                                    <DropdownItem 
                                        key="logout" 
                                        color="danger" 
                                        onClick={handleLogout}
                                        startContent={<LogOut size={16} />}
                                    >
                                        Sign Out
                                    </DropdownItem>
                                </DropdownMenu>
                            </Dropdown>
                        ) : (
                            <div className="hidden md:flex items-center space-x-2">
                                <Button
                                    as={Link}
                                    href="/login"
                                    variant="light"
                                    size="sm"
                                >
                                    Sign In
                                </Button>
                                <Button
                                    as={Link}
                                    href="/sign-up"
                                    color="primary"
                                    size="sm"
                                    className="bg-black text-white hover:bg-gray-800"
                                >
                                    Sign Up
                                </Button>
                            </div>
                        )}

                        {/* Mobile Menu Button */}
                        <button
                            className="lg:hidden p-2 hover:bg-gray-100 rounded-full transition-colors"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        >
                            <Menu size={20} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <div className="lg:hidden border-t border-gray-100 bg-white">
                    <div className="container mx-auto px-4 py-4 space-y-4">
                        {/* Mobile Search */}
                        <div className="md:hidden">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="text"
                                    placeholder="Search products..."
                                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-gray-200 focus:border-transparent"
                                />
                            </div>
                        </div>

                        {/* Mobile Navigation */}
                        <div className="space-y-2">
                            {menulist.map((item) => (
                                <Link 
                                    key={item.link} 
                                    href={item.link} 
                                    className="block py-2 text-gray-700 hover:text-black transition-colors font-medium"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    {item.name}
                                </Link>
                            ))}
                        </div>

                        {/* Mobile Auth Links */}
                        {!user && (
                            <div className="border-t pt-4 space-y-2">
                                <Link 
                                    href="/login" 
                                    className="block py-2 text-gray-700 hover:text-black transition-colors"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    Sign In
                                </Link>
                                <Link 
                                    href="/sign-up" 
                                    className="block py-2 text-blue-600 hover:text-blue-800 transition-colors font-medium"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    Sign Up
                                </Link>
                            </div>
                        )}

                        {/* Mobile User Menu */}
                        {user && (
                            <div className="border-t pt-4 space-y-2">
                                <Link 
                                    href="/dashboard" 
                                    className="block py-2 text-gray-700 hover:text-black transition-colors"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    Dashboard
                                </Link>
                                <Link 
                                    href="/orders" 
                                    className="block py-2 text-gray-700 hover:text-black transition-colors"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    My Orders
                                </Link>
                                <Link 
                                    href="/profile" 
                                    className="block py-2 text-gray-700 hover:text-black transition-colors"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    Profile
                                </Link>
                                {isAdmin && (
                                    <Link 
                                        href="/admin" 
                                        className="block py-2 text-blue-600 hover:text-blue-800 transition-colors"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        Admin Panel
                                    </Link>
                                )}
                                <button
                                    onClick={() => {
                                        handleLogout();
                                        setIsMobileMenuOpen(false);
                                    }}
                                    className="block w-full text-left py-2 text-red-600 hover:text-red-800 transition-colors"
                                >
                                    Sign Out
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
}