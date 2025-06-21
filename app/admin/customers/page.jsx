"use client";

import UserManagement from "./components/UserManagement";

export default function Page() {
    return (
        <main className="p-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold">User Management</h1>
                <p className="text-gray-600">Manage all users, roles, and permissions</p>
            </div>
            <UserManagement />
        </main>
    );
}