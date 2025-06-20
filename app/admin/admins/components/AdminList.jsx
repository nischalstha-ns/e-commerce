"use client";

import { useAdmins } from "@/lib/supabase/admins/read";
import { deleteAdmin } from "@/lib/supabase/admins/write";
import { Button, CircularProgress, Chip } from "@heroui/react";
import { Trash2, Shield, User } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

export default function AdminList() {
    const { data: admins, error, isLoading } = useAdmins();

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
            <h1 className="text-xl font-semibold">Admin Users</h1>

            <div className="overflow-x-auto">
                <table className="w-full border-separate border-spacing-y-2">
                    <thead>
                        <tr className="bg-gray-50">
                            <th className="px-4 py-3 text-left rounded-l-lg">Avatar</th>
                            <th className="px-4 py-3 text-left">Name</th>
                            <th className="px-4 py-3 text-left">Email</th>
                            <th className="px-4 py-3 text-left">Status</th>
                            <th className="px-4 py-3 text-left">Added Date</th>
                            <th className="px-4 py-3 text-left rounded-r-lg">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {admins?.map((admin) => (
                            <AdminRow key={admin.id} admin={admin} />
                        ))}
                    </tbody>
                </table>
            </div>

            {admins?.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                    No admin users found
                </div>
            )}
        </div>
    );
}

function AdminRow({ admin }) {
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to remove this admin? This action cannot be undone.")) return;
        
        setIsDeleting(true);
        try {
            await deleteAdmin({ id: admin.id });
            toast.success("Admin removed successfully");
        } catch (error) {
            toast.error(error?.message || "Error removing admin");
        }
        setIsDeleting(false);
    };

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleDateString();
    };

    return (
        <tr className="bg-white shadow-sm">
            <td className="px-4 py-3 rounded-l-lg">
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                    <User size={20} className="text-gray-500" />
                </div>
            </td>
            <td className="px-4 py-3">
                <span className="font-medium">{admin.name || "N/A"}</span>
            </td>
            <td className="px-4 py-3">
                <span className="text-sm">{admin.email}</span>
            </td>
            <td className="px-4 py-3">
                <Chip 
                    color="primary" 
                    size="sm" 
                    className="capitalize"
                    startContent={<Shield size={12} />}
                >
                    Admin
                </Chip>
            </td>
            <td className="px-4 py-3">
                <span className="text-sm">{formatDate(admin.created_at)}</span>
            </td>
            <td className="px-4 py-3 rounded-r-lg">
                <Button
                    onClick={handleDelete}
                    isLoading={isDeleting}
                    isDisabled={isDeleting}
                    size="sm"
                    color="danger"
                    variant="light"
                    startContent={<Trash2 size={14} />}
                >
                    Remove
                </Button>
            </td>
        </tr>
    );
}