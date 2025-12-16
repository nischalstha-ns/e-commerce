"use client";

import { useState, useMemo } from "react";
import { useHistoryStore } from "@/lib/store/historyStore";
import { useUndoRedoStore } from "@/lib/store/undoRedoStore";
import { Card, CardBody, Button, Chip, Input } from "@heroui/react";
import { History, Undo2, Trash2, Search, Calendar, User, Package, Tag, ShoppingCart, Star } from "lucide-react";
import { createNewProduct } from "@/lib/firestore/products/write";
import { createNewCategory } from "@/lib/firestore/categories/write";
import { createNewBrand } from "@/lib/firestore/brands/write";
import toast from "react-hot-toast";

export default function HistoryPage() {
    const { history, clearHistory } = useHistoryStore();
    const { undo, canUndo } = useUndoRedoStore();
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedDate, setSelectedDate] = useState("");

    const groupedHistory = useMemo(() => {
        const filtered = history.filter(item => {
            const matchesSearch = item.description?.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesDate = !selectedDate || item.timestamp?.startsWith(selectedDate);
            return matchesSearch && matchesDate;
        });

        const grouped = {};
        filtered.forEach(item => {
            const date = new Date(item.timestamp).toLocaleDateString();
            if (!grouped[date]) grouped[date] = [];
            grouped[date].push(item);
        });
        return grouped;
    }, [history, searchTerm, selectedDate]);

    const handleUndo = async (item) => {
        try {
            if (item.action === 'delete') {
                if (item.data.categoryId) {
                    await createNewProduct({ data: item.data, images: [], tenantId: item.data.tenantId || 'default' });
                } else if (item.data.slug) {
                    await createNewCategory({ data: item.data, image: null });
                } else {
                    await createNewBrand({ data: item.data, image: null });
                }
                toast.success("Action undone successfully");
            } else {
                toast.info("Undo not available for this action");
            }
        } catch (error) {
            toast.error(error.message || "Failed to undo action");
        }
    };

    const getActionIcon = (action) => {
        switch (action) {
            case 'create': return <Package className="w-4 h-4" />;
            case 'update': return <Tag className="w-4 h-4" />;
            case 'delete': return <Trash2 className="w-4 h-4" />;
            case 'archive': return <Star className="w-4 h-4" />;
            default: return <History className="w-4 h-4" />;
        }
    };

    const getActionColor = (action) => {
        switch (action) {
            case 'create': return 'success';
            case 'update': return 'primary';
            case 'delete': return 'danger';
            case 'archive': return 'warning';
            default: return 'default';
        }
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                        <History className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">Activity History</h1>
                        <p className="text-sm text-gray-500">Track all changes and actions</p>
                    </div>
                </div>
                <Button
                    color="danger"
                    variant="flat"
                    onClick={() => {
                        if (confirm("Clear all history?")) {
                            clearHistory();
                            toast.success("History cleared");
                        }
                    }}
                    startContent={<Trash2 className="w-4 h-4" />}
                >
                    Clear History
                </Button>
            </div>

            <Card>
                <CardBody className="p-4">
                    <div className="flex gap-3">
                        <Input
                            placeholder="Search activities..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            startContent={<Search className="w-4 h-4 text-gray-400" />}
                            variant="bordered"
                            className="flex-1"
                        />
                        <Input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            startContent={<Calendar className="w-4 h-4 text-gray-400" />}
                            variant="bordered"
                            className="w-48"
                        />
                    </div>
                </CardBody>
            </Card>

            {Object.keys(groupedHistory).length === 0 ? (
                <Card>
                    <CardBody className="p-12 text-center">
                        <History className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">No History Found</h3>
                        <p className="text-gray-500">Your activity history will appear here</p>
                    </CardBody>
                </Card>
            ) : (
                <div className="space-y-6">
                    {Object.entries(groupedHistory).map(([date, items]) => (
                        <div key={date}>
                            <div className="flex items-center gap-2 mb-3">
                                <Calendar className="w-4 h-4 text-gray-500" />
                                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">{date}</h3>
                                <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700"></div>
                            </div>
                            <div className="space-y-2">
                                {items.map((item) => (
                                    <Card key={item.id} className="hover:shadow-md transition-shadow">
                                        <CardBody className="p-4">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3 flex-1">
                                                    <Chip
                                                        color={getActionColor(item.action)}
                                                        variant="flat"
                                                        startContent={getActionIcon(item.action)}
                                                        size="sm"
                                                    >
                                                        {item.action}
                                                    </Chip>
                                                    <div className="flex-1">
                                                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                            {item.description}
                                                        </p>
                                                        <p className="text-xs text-gray-500">
                                                            {new Date(item.timestamp).toLocaleTimeString()}
                                                        </p>
                                                    </div>
                                                </div>
                                                {item.action === 'delete' && (
                                                    <Button
                                                        size="sm"
                                                        color="primary"
                                                        variant="flat"
                                                        onClick={() => handleUndo(item)}
                                                        startContent={<Undo2 className="w-4 h-4" />}
                                                    >
                                                        Undo
                                                    </Button>
                                                )}
                                            </div>
                                        </CardBody>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
