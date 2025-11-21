"use client";

import UserManagement from "./components/UserManagement";

export default function Page() {
    return (
        <main className="p-3 md:p-6">
            <div className="mb-4 md:mb-6">
                <h1 className="text-xl md:text-2xl font-bold dark:text-white">Customers</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">Manage users and roles</p>
            </div>
            <UserManagement />
        </main>
    );
}