"use client";

import { useState } from "react";
import AdminForm from "./components/AdminForm";
import AdminList from "./components/AdminList";
import { Button } from "@heroui/react";
import { Plus } from "lucide-react";

export default function Page() {
    const [showForm, setShowForm] = useState(false);

    return (
        <main className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold">Admin Management</h1>
                    <p className="text-gray-600">Manage admin users who can access the admin panel</p>
                </div>
                <Button
                    onClick={() => setShowForm(!showForm)}
                    color="primary"
                    startContent={<Plus size={16} />}
                >
                    {showForm ? "View Admins" : "Add Admin"}
                </Button>
            </div>

            {showForm ? <AdminForm /> : <AdminList />}
        </main>
    );
}