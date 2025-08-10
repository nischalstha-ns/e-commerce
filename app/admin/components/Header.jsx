"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Menu, Bell, Settings, User, X } from "lucide-react";
import { Button, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Avatar, Badge, Modal, ModalContent, ModalHeader, ModalBody, Popover, PopoverTrigger, PopoverContent } from "@heroui/react";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firestore/firebase";
import toast from "react-hot-toast";
import NotificationCenter from "./NotificationCenter";
import { useNotifications } from "@/lib/hooks/useNotifications";

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
        <section className="flex items-center justify-between gap-3 bg-white border-b px-4 py-4">
            <div className="flex items-center gap-3">
                <div className="flex justify-center block md:hidden">
                    <button onClick={toggleSiderbar}>
                        <Menu />
                    </button>
                </div>
                <h1 className="text-xl font-semibold">Admin Dashboard</h1>
            </div>

            <div className="flex items-center gap-3">
                {/* Notifications */}
                <Popover 
                    isOpen={isNotificationOpen} 
                    onOpenChange={setIsNotificationOpen}
                    placement="bottom-end"
                >
                    <PopoverTrigger>
                        <Button variant="light" isIconOnly size="sm">
                            <Badge content={unreadCount > 0 ? unreadCount : ""} color="danger" size="sm">
                                <Bell size={18} />
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
                >
                    <Settings size={18} />
                </Button>

                {/* User Menu */}
                <Dropdown placement="bottom-end">
                    <DropdownTrigger>
                        <Button variant="light" className="p-0 min-w-0">
                            <div className="flex items-center gap-2">
                                <Avatar
                                    size="sm"
                                    src={user?.photoURL}
                                    name={user?.displayName || user?.email}
                                    className="bg-gray-200"
                                />
                                <div className="hidden md:block text-left">
                                    <p className="text-sm font-medium">{user?.displayName || "Admin"}</p>
                                    <p className="text-xs text-gray-500">{user?.email}</p>
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
                                        <h3 className="text-lg font-semibold text-gray-900">General Settings</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <Button 
                                                variant="flat" 
                                                className="justify-start h-auto p-4"
                                                onClick={() => window.location.href = '/admin/settings'}
                                            >
                                                <div className="text-left">
                                                    <p className="font-medium">Store Settings</p>
                                                    <p className="text-sm text-gray-600">Configure store information</p>
                                                </div>
                                            </Button>
                                            <Button 
                                                variant="flat" 
                                                className="justify-start h-auto p-4"
                                                onClick={() => window.location.href = '/admin/homepage'}
                                            >
                                                <div className="text-left">
                                                    <p className="font-medium">Homepage</p>
                                                    <p className="text-sm text-gray-600">Manage homepage content</p>
                                                </div>
                                            </Button>
                                        </div>
                                    </div>

                                    {/* User Management */}
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-semibold text-gray-900">User Management</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <Button 
                                                variant="flat" 
                                                className="justify-start h-auto p-4"
                                                onClick={() => window.location.href = '/admin/customers'}
                                            >
                                                <div className="text-left">
                                                    <p className="font-medium">Customers</p>
                                                    <p className="text-sm text-gray-600">Manage customer accounts</p>
                                                </div>
                                            </Button>
                                            <Button 
                                                variant="flat" 
                                                className="justify-start h-auto p-4"
                                                onClick={() => window.location.href = '/admin/roles'}
                                            >
                                                <div className="text-left">
                                                    <p className="font-medium">Roles & Permissions</p>
                                                    <p className="text-sm text-gray-600">Configure user roles</p>
                                                </div>
                                            </Button>
                                        </div>
                                    </div>

                                    {/* System */}
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-semibold text-gray-900">System</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <Button 
                                                variant="flat" 
                                                className="justify-start h-auto p-4"
                                                onClick={() => window.location.href = '/admin/analytics'}
                                            >
                                                <div className="text-left">
                                                    <p className="font-medium">Analytics</p>
                                                    <p className="text-sm text-gray-600">View system analytics</p>
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
                                                    <p className="text-sm text-gray-600">Log out of admin panel</p>
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