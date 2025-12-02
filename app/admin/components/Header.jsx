"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Menu, Bell, Settings, User, X, ExternalLink } from "lucide-react";
import { Button, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Avatar, Badge, Modal, ModalContent, ModalHeader, ModalBody, Popover, PopoverTrigger, PopoverContent } from "@heroui/react";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firestore/firebase";
import toast from "react-hot-toast";
import NotificationCenter from "./NotificationCenter";
import { useNotifications } from "@/lib/hooks/useNotifications";
import ThemeToggle from "../../components/ThemeToggle";

export default function Header({ toggleSidebar }) {
    const { user, userRole } = useAuth();
    const { unreadCount } = useNotifications();
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isNotificationOpen, setIsNotificationOpen] = useState(false);

    const handleLogout = async () => {
        try {
            await signOut(auth);
            toast.success("Logged out successfully");
        } catch (error) {
            toast.error("Error logging out");
        }
    };

    return (
        <section className="flex items-center justify-between gap-2 sm:gap-3 bg-white dark:bg-[#1a1a1a] border-b border-gray-200 dark:border-[#2e2e2e] px-3 sm:px-4 py-3 sm:py-4 theme-transition shadow-sm dark:shadow-[0_1px_3px_rgba(0,0,0,0.3)]">
            <div className="flex items-center gap-2 sm:gap-3">
                <button
                    onClick={toggleSidebar}
                    className="md:hidden p-2 hover:bg-gray-100 dark:hover:bg-[#242424] rounded-lg transition-colors"
                >
                    <Menu size={20} className="text-gray-700 dark:text-gray-300" />
                </button>
                <img 
                    src="https://res.cloudinary.com/dwwypumxh/image/upload/v1762531629/NFS_Logo_PNG_z5qisi.png" 
                    alt="Nischal Fancy Store" 
                    className="w-10 h-8 sm:w-12 sm:h-10 object-contain dark:bg-white dark:rounded-lg dark:p-1 sm:dark:p-2"
                />
                <h1 className="text-base sm:text-xl font-semibold text-gray-900 dark:text-gray-100 theme-transition hidden xs:block">
                    {userRole === 'shop' ? 'Shop' : 'NFS Admin'}
                </h1>
            </div>

            <div className="flex items-center gap-1 sm:gap-3">
                {/* Theme Toggle */}
                <div className="hidden sm:block">
                    <ThemeToggle />
                </div>
                
                {/* View Store Button - Hidden on mobile and for shop users */}
                {userRole !== 'shop' && (
                    <a
                        href="/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hidden md:inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-[#e5e7eb] bg-white dark:bg-[#242424] border border-gray-300 dark:border-[#3a3a3a] rounded-lg hover:bg-gray-50 dark:hover:bg-[#2a2a2a] transition-colors theme-transition shadow-sm dark:shadow-none"
                    >
                        <ExternalLink size={16} />
                        View Store
                    </a>
                )}
                
                {/* Notifications - Hidden for shop users */}
                {userRole !== 'shop' && (
                    <Popover 
                        isOpen={isNotificationOpen} 
                        onOpenChange={setIsNotificationOpen}
                        placement="bottom-end"
                    >
                        <PopoverTrigger>
                            <Button variant="light" isIconOnly size="sm" className="hover:bg-gray-100 dark:hover:bg-[#242424] theme-transition">
                                <Badge content={unreadCount > 0 ? unreadCount : ""} color="danger" size="sm">
                                    <Bell size={16} className="text-gray-700 dark:text-gray-300" />
                                </Badge>
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="p-0 w-80 sm:w-96">
                            <NotificationCenter />
                        </PopoverContent>
                    </Popover>
                )}

                {/* Settings - Hidden on mobile and for shop users */}
                {userRole !== 'shop' && (
                    <Button 
                        variant="light" 
                        isIconOnly 
                        size="sm"
                        onClick={() => setIsSettingsOpen(true)}
                        className="hidden sm:flex hover:bg-gray-100 dark:hover:bg-[#242424] theme-transition"
                    >
                        <Settings size={18} className="text-gray-700 dark:text-gray-300" />
                    </Button>
                )}

                {/* User Menu */}
                <Dropdown placement="bottom-end">
                    <DropdownTrigger>
                        <Button variant="light" className="p-0 min-w-0 hover:bg-gray-100 dark:hover:bg-[#242424] theme-transition">
                            <div className="flex items-center gap-2">
                                <Avatar
                                    size="sm"
                                    src={user?.photoURL}
                                    name={user?.displayName || user?.email}
                                    className="bg-gray-200 dark:bg-[#2e2e2e]"
                                />
                                <div className="hidden md:block text-left">
                                    <p className="text-sm font-medium text-gray-900 dark:text-[#e5e7eb] theme-transition">{user?.displayName || "Admin"}</p>
                                    <p className="text-xs text-gray-500 dark:text-[#9ca3af] theme-transition">{user?.email}</p>
                                </div>
                            </div>
                        </Button>
                    </DropdownTrigger>
                    <DropdownMenu aria-label="User menu">
                        <DropdownItem key="profile" startContent={<User size={16} />}>
                            Profile Settings
                        </DropdownItem>
                        <DropdownItem key="settings" startContent={<Settings size={16} />}>
                            Admin Settings
                        </DropdownItem>
                        <DropdownItem 
                            key="logout" 
                            color="danger" 
                            onClick={handleLogout}
                            className="text-danger"
                        >
                            Sign Out
                        </DropdownItem>
                    </DropdownMenu>
                </Dropdown>
            </div>

            {/* Settings Modal */}
            <Modal 
                isOpen={isSettingsOpen} 
                onOpenChange={setIsSettingsOpen}
                size="2xl"
                scrollBehavior="inside"
            >
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Settings size={20} />
                                    <span>Admin Settings</span>
                                </div>
                                <Button 
                                    isIconOnly 
                                    variant="light" 
                                    size="sm" 
                                    onClick={onClose}
                                >
                                    <X size={16} />
                                </Button>
                            </ModalHeader>
                            <ModalBody className="pb-6">
                                <div className="space-y-6">
                                    {/* General Settings */}
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 theme-transition">General Settings</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <Button 
                                                variant="flat" 
                                                className="justify-start h-auto p-4"
                                                onClick={() => window.location.href = '/admin/settings'}
                                            >
                                                <div className="text-left">
                                                    <p className="font-medium">Store Settings</p>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400 theme-transition">Configure store information</p>
                                                </div>
                                            </Button>
                                            <Button 
                                                variant="flat" 
                                                className="justify-start h-auto p-4"
                                                onClick={() => window.location.href = '/admin/homepage'}
                                            >
                                                <div className="text-left">
                                                    <p className="font-medium">Homepage</p>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400 theme-transition">Manage homepage content</p>
                                                </div>
                                            </Button>
                                        </div>
                                    </div>

                                    {/* User Management */}
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 theme-transition">User Management</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <Button 
                                                variant="flat" 
                                                className="justify-start h-auto p-4"
                                                onClick={() => window.location.href = '/admin/customers'}
                                            >
                                                <div className="text-left">
                                                    <p className="font-medium">Customers</p>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400 theme-transition">Manage customer accounts</p>
                                                </div>
                                            </Button>
                                            <Button 
                                                variant="flat" 
                                                className="justify-start h-auto p-4"
                                                onClick={() => window.location.href = '/admin/roles'}
                                            >
                                                <div className="text-left">
                                                    <p className="font-medium">Roles & Permissions</p>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400 theme-transition">Configure user roles</p>
                                                </div>
                                            </Button>
                                        </div>
                                    </div>

                                    {/* System */}
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 theme-transition">System</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <Button 
                                                variant="flat" 
                                                className="justify-start h-auto p-4"
                                                onClick={() => window.location.href = '/admin/analytics'}
                                            >
                                                <div className="text-left">
                                                    <p className="font-medium">Analytics</p>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400 theme-transition">View system analytics</p>
                                                </div>
                                            </Button>
                                            <Button 
                                                variant="flat" 
                                                color="danger"
                                                className="justify-start h-auto p-4"
                                                onClick={handleLogout}
                                            >
                                                <div className="text-left">
                                                    <p className="font-medium">Sign Out</p>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400 theme-transition">Log out of admin panel</p>
                                                </div>
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </ModalBody>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </section>
    );
}