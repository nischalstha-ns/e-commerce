"use client";

import { useState } from "react";
import CollectionForm from "./components/CollectionForm";
import CollectionList from "./components/CollectionList";
import CollectionStats from "./components/CollectionStats";
import { Button } from "@heroui/react";
import { Plus, BarChart3, Grid3X3 } from "lucide-react";

export default function Page() {
    const [showForm, setShowForm] = useState(false);
    const [editingCollection, setEditingCollection] = useState(null);
    const [activeTab, setActiveTab] = useState("list");

    const handleEdit = (collection) => {
        setEditingCollection(collection);
        setShowForm(true);
    };

    const handleSuccess = () => {
        setShowForm(false);
        setEditingCollection(null);
    };

    const handleCancel = () => {
        setShowForm(false);
        setEditingCollection(null);
    };

    return (
        <main className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold">Collections Management</h1>
                    <p className="text-gray-600">Create and manage product collections for marketing and organization</p>
                </div>
                
                <div className="flex gap-2">
                    {!showForm && (
                        <>
                            <Button
                                onClick={() => setActiveTab("stats")}
                                variant={activeTab === "stats" ? "solid" : "bordered"}
                                color="primary"
                                startContent={<BarChart3 size={16} />}
                                size="sm"
                            >
                                Statistics
                            </Button>
                            <Button
                                onClick={() => setActiveTab("list")}
                                variant={activeTab === "list" ? "solid" : "bordered"}
                                color="primary"
                                startContent={<Grid3X3 size={16} />}
                                size="sm"
                            >
                                Collections
                            </Button>
                        </>
                    )}
                    
                    <Button
                        onClick={() => setShowForm(true)}
                        color="primary"
                        startContent={<Plus size={16} />}
                    >
                        Add Collection
                    </Button>
                </div>
            </div>

            {showForm ? (
                <div className="space-y-4">
                    <div className="flex gap-2">
                        <Button onClick={handleCancel} variant="light">
                            ← Back to Collections
                        </Button>
                    </div>
                    <CollectionForm 
                        collectionToEdit={editingCollection}
                        onSuccess={handleSuccess}
                    />
                </div>
            ) : (
                <>
                    {activeTab === "stats" && <CollectionStats />}
                    {activeTab === "list" && <CollectionList onEdit={handleEdit} />}
                </>
            )}
        </main>
    );
}