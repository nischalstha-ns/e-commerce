"use client";

import { useState } from "react";
import BrandForm from "./components/BrandForm";
import BrandList from "./components/BrandList";
import { Button } from "@heroui/react";
import { Plus } from "lucide-react";

export default function Page() {
    const [showForm, setShowForm] = useState(false);
    const [editingBrand, setEditingBrand] = useState(null);

    const handleEdit = (brand) => {
        setEditingBrand(brand);
        setShowForm(true);
    };

    const handleSuccess = () => {
        setShowForm(false);
        setEditingBrand(null);
    };

    const handleCancel = () => {
        setShowForm(false);
        setEditingBrand(null);
    };

    return (
        <main className="p-5 space-y-5">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Brands Management</h1>
                <Button
                    onClick={() => setShowForm(true)}
                    color="primary"
                    startContent={<Plus size={16} />}
                >
                    Add Brand
                </Button>
            </div>

            {showForm ? (
                <div className="space-y-4">
                    <div className="flex gap-2">
                        <Button onClick={handleCancel} variant="light">
                            ← Back to List
                        </Button>
                    </div>
                    <BrandForm 
                        brandToEdit={editingBrand}
                        onSuccess={handleSuccess}
                    />
                </div>
            ) : (
                <BrandList onEdit={handleEdit} />
            )}
        </main>
    );
}