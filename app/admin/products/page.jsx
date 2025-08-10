"use client";

import { useState } from "react";
import ProductForm from "./components/ProductForm";
import ProductList from "./components/ProductList";
import { Button } from "@heroui/react";
import { Plus } from "lucide-react";

export default function Page() {
    const [showForm, setShowForm] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [refreshKey, setRefreshKey] = useState(0);

    const handleEdit = (product) => {
        setEditingProduct(product);
        setShowForm(true);
    };

    const handleSuccess = () => {
        setShowForm(false);
        setEditingProduct(null);
        setRefreshKey(prev => prev + 1); // Force refresh
    };

    const handleCancel = () => {
        setShowForm(false);
        setEditingProduct(null);
    };

    return (
        <main className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Products Management</h1>
                <Button
                    onClick={() => setShowForm(true)}
                    color="primary"
                    startContent={<Plus size={16} />}
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
                <ProductList key={refreshKey} onEdit={handleEdit} />
            )}
        </main>
    );
}