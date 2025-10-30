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
        <main className="p-6 space-y-6 bg-[#eff3f4] dark:bg-[#121212] min-h-screen theme-transition">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-[#e5e7eb] theme-transition">Products Management</h1>
                    <p className="text-gray-600 dark:text-[#9ca3af] theme-transition">Manage your product catalog</p>
                </div>
                <Button
                    onClick={() => setShowForm(true)}
                    color="primary"
                    className="bg-blue-600 dark:bg-blue-600 hover:bg-blue-700 dark:hover:bg-blue-500 text-white font-medium glow-hover theme-transition"
                    startContent={<Plus size={16} />}
                >
                    Add Product
                </Button>
            </div>

            {showForm ? (
                <div className="space-y-4">
                    <div className="flex gap-2">
                        <Button 
                            onClick={handleCancel} 
                            variant="light"
                            className="text-gray-700 dark:text-[#e5e7eb] hover:bg-gray-100 dark:hover:bg-[#242424] theme-transition"
                        >
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