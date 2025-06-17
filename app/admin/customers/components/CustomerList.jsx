"use client";

import { useUsers } from "@/lib/firestore/users/read";
import { Button, CircularProgress, Chip } from "@heroui/react";
import { User } from "lucide-react";

export default function CustomerList() {
    const { data: users, error, isLoading } = useUsers();

    // Filter out admin users - only show regular customers
    const customers = users?.filter(user => user.role !== "admin") || [];

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
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-xl font-semibold">Customers</h1>
                    <p className="text-gray-600 text-sm">View customer information (read-only)</p>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full border-separate border-spacing-y-2">
                    <thead>
                        <tr className="bg-gray-50">
                            <th className="px-4 py-3 text-left rounded-l-lg">Avatar</th>
                            <th className="px-4 py-3 text-left">Name</th>
                            <th className="px-4 py-3 text-left">Email</th>
                            <th className="px-4 py-3 text-left">Status</th>
                            <th className="px-4 py-3 text-left rounded-r-lg">Joined</th>
                        </tr>
                    </thead>
                    <tbody>
                        {customers?.map((user) => (
                            <CustomerRow key={user.id} user={user} />
                        ))}
                    </tbody>
                </table>
            </div>

            {customers?.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                    No customers found
                </div>
            )}
        </div>
    );
}

function CustomerRow({ user }) {
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
                    color="default" 
                    size="sm" 
                    className="capitalize"
                    startContent={<User size={12} />}
                >
                    Customer
                </Chip>
            </td>
            <td className="px-4 py-3 rounded-r-lg">
                <span className="text-sm">{formatDate(user.timestampCreate)}</span>
            </td>
        </tr>
    );
}