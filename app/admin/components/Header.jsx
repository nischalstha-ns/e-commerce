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

export default function Header({ toggleSiderbar }) {
    const { user } = useAuth();
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
        <section className="flex items-center justify-between gap-3 bg-white dark:bg-[#1a1a1a] border-b border-gray-200 dark:border-[#2e2e2e] px-4 py-4 theme-transition shadow-sm dark:shadow-none">
            <div className="flex items-center gap-3">
                <div className="flex justify-center block md:hidden">
                    <button onClick={toggleSiderbar} className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 theme-transition">
                        <Menu />
                    </button>
                </div>
                <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100 theme-transition">Admin Dashboard</h1>
            </div>

            <div className="flex items-center gap-3">
                {/* Theme Toggle */}
                <ThemeToggle />
                
                {/* View Store Button */}
                <a
                    href="/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors theme-transition"
                >
                    <ExternalLink size={16} />
                    View Store
                </a>
                
                {/* Notifications */}
                <Popover 
                    isOpen={isNotificationOpen} 
                    onOpenChange={setIsNotificationOpen}
                    placement="bottom-end"
                >
                    <PopoverTrigger>
                        <Button variant="light" isIconOnly size="sm" className="hover:bg-gray-100 dark:hover:bg-[#242424] theme-transition">
                            <Badge content={unreadCount > 0 ? unreadCount : ""} color="danger" size="sm">
                                <Bell size={18} className="text-gray-700 dark:text-gray-300" />
                            </Badge>
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="p-0 w-96">
                        <NotificationCenter />
                    </PopoverContent>
                </Popover>

                {/* Settings */}
                <Button 
                    variant="light" 
                    isIconOnly 
                    size="sm"
                    onClick={() => setIsSettingsOpen(true)}
                    className="hover:bg-gray-100 dark:hover:bg-[#242424] theme-transition"
                >
                    <Settings size={18} className="text-gray-700 dark:text-gray-300" />
                </Button>

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