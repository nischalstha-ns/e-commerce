"use client";

import { useAuth } from "@/contexts/AuthContext";
import { Menu, Bell, Settings, User } from "lucide-react";
import { Button, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Avatar, Badge } from "@heroui/react";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firestore/firebase";
import toast from "react-hot-toast";

export default function Header({ toggleSiderbar }) {
    const { user } = useAuth();

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
                <Button variant="light" isIconOnly size="sm">
                    <Badge content="3" color="danger" size="sm">
                        <Bell size={18} />
                    </Badge>
                </Button>

                {/* Settings */}
                <Button variant="light" isIconOnly size="sm">
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
        </section>
    );
}