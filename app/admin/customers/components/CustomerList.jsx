"use client";

import { useUsers } from "@/lib/firestore/users/read";
import { updateUserRole } from "@/lib/firestore/users/write";
import { Button, CircularProgress, Select, SelectItem, Chip } from "@heroui/react";
import { Shield, User } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

export default function CustomerList() {
    const { data: users, error, isLoading } = useUsers();

    if (isLoading) {
        return (
            <div className="flex justify-center p-8">
                <CircularProgress />
            </div>
        );
    }

    if (error) {
        return <div className="text-red-500 p-4">Error: {error}</div>;
    }

    return (
        <div className="flex flex-col gap-4 bg-white rounded-xl p-6">
            <h1 className="text-xl font-semibold">Customers</h1>

            <div className="overflow-x-auto">
                <table className="w-full border-separate border-spacing-y-2">
                    <thead>
                        <tr className="bg-gray-50">
                            <th className="px-4 py-3 text-left rounded-l-lg">Avatar</th>
                            <th className="px-4 py-3 text-left">Name</th>
                            <th className="px-4 py-3 text-left">Email</th>
                            <th className="px-4 py-3 text-left">Role</th>
                            <th className="px-4 py-3 text-left">Joined</th>
                            <th className="px-4 py-3 text-left rounded-r-lg">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users?.map((user) => (
                            <CustomerRow key={user.id} user={user} />
                        ))}
                    </tbody>
                </table>
            </div>

            {users?.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                    No customers found
                </div>
            )}
        </div>
    );
}

function CustomerRow({ user }) {
    const [isUpdating, setIsUpdating] = useState(false);

    const handleRoleUpdate = async (newRole) => {
        setIsUpdating(true);
        try {
            await updateUserRole({ uid: user.id, role: newRole });
            toast.success("User role updated successfully");
        } catch (error) {
            toast.error(error?.message || "Error updating user role");
        }
        setIsUpdating(false);
    };

    const formatDate = (timestamp) => {
        if (!timestamp) return "N/A";
        return new Date(timestamp.seconds * 1000).toLocaleDateString();
    };

    return (
        <tr className="bg-white shadow-sm">
            <td className="px-4 py-3 rounded-l-lg">
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                    {user.photoURL ? (
                        <img src={user.photoURL} alt={user.displayName} className="w-full h-full object-cover" />
                    ) : (
                        <User size={20} className="text-gray-500" />
                    )}
                </div>
            </td>
            <td className="px-4 py-3">
                <span className="font-medium">{user.displayName || "N/A"}</span>
            </td>
            <td className="px-4 py-3">
                <span className="text-sm">{user.email}</span>
            </td>
            <td className="px-4 py-3">
                <Chip 
                    color={user.role === "admin" ? "primary" : "default"} 
                    size="sm" 
                    className="capitalize"
                    startContent={user.role === "admin" ? <Shield size={12} /> : <User size={12} />}
                >
                    {user.role || "user"}
                </Chip>
            </td>
            <td className="px-4 py-3">
                <span className="text-sm">{formatDate(user.timestampCreate)}</span>
            </td>
            <td className="px-4 py-3 rounded-r-lg">
                <Select
                    placeholder="Change Role"
                    className="w-32"
                    size="sm"
                    selectedKeys={user.role ? [user.role] : ["user"]}
                    onSelectionChange={(keys) => {
                        const selectedKey = Array.from(keys)[0];
                        if (selectedKey && selectedKey !== user.role) {
                            handleRoleUpdate(selectedKey);
                        }
                    }}
                    isDisabled={isUpdating}
                >
                    <SelectItem key="user" value="user">User</SelectItem>
                    <SelectItem key="admin" value="admin">Admin</SelectItem>
                </Select>
            </td>
        </tr>
    );
}