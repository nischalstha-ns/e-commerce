"use client";

import { useState } from "react";
import ProductForm from "./components/ProductForm";
import ProductList from "./components/ProductList";
import { Button } from "@heroui/react";
import { Plus } from "lucide-react";

export default function Page() {
    const [showForm, setShowForm] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);

    const handleEdit = (product) => {
        setEditingProduct(product);
        setShowForm(true);
    };

    const handleSuccess = () => {
        setShowForm(false);
        setEditingProduct(null);
    };

    const handleCancel = () => {
        setShowForm(false);
        setEditingProduct(null);
    };

    return (
        <main className="p-3 sm:p-5 space-y-4 sm:space-y-5">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold dark:text-white">Products Management</h1>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Manage your product inventory</p>
                    </div>
                    <Button
                        onClick={() => setShowForm(true)}
                        color="primary"
                        startContent={<Plus size={16} />}
                        className="w-full sm:w-auto"
                    >
                        Add Product
                    </Button>
                </div>

                {showForm ? (
                    <div className="space-y-4">
                        <div className="flex gap-2">
                            <Button onClick={handleCancel} variant="light">
                                ← Back to List
                            </Button>
                        </div>
                        <ProductForm 
                            productToEdit={editingProduct}
                            onSuccess={handleSuccess}
                        />
                    </div>
                ) : (
                    <ProductList onEdit={handleEdit} />
                )}
        </main>
    );
}
