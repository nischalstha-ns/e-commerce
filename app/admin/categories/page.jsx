"use client";

import { useState } from "react";
import Form from "./components/Form";
import ListView from "./components/ListView";
import { Button } from "@heroui/react";
import { Plus } from "lucide-react";

export default function Page() {
    const [showForm, setShowForm] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);

    const handleEdit = (category) => {
        setEditingCategory(category);
        setShowForm(true);
    };

    const handleSuccess = () => {
        setShowForm(false);
        setEditingCategory(null);
    };

    const handleCancel = () => {
        setShowForm(false);
        setEditingCategory(null);
    };

    return (
        <main className="p-5 space-y-5">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Categories Management</h1>
                <Button
                    onClick={() => setShowForm(true)}
                    color="primary"
                    startContent={<Plus size={16} />}
                >
                    Add Category
                </Button>
            </div>

            {showForm ? (
                <div className="space-y-4">
                    <div className="flex gap-2">
                        <Button onClick={handleCancel} variant="light">
                            ← Back to List
                        </Button>
                    </div>
                    <Form 
                        categoryToEdit={editingCategory}
                        onSuccess={handleSuccess}
                    />
                </div>
            ) : (
                <ListView onEdit={handleEdit} />
            )}
        </main>
    );
}