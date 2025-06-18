"use client";

import { useCollectionStats } from "@/lib/firestore/collections/read";
import { Card, CardBody, CircularProgress } from "@heroui/react";
import { Folder, FolderOpen, Star, Package, TrendingUp } from "lucide-react";

export default function CollectionStats() {
    const { data: stats, isLoading } = useCollectionStats();

    if (isLoading) {
        return (
            <div className="flex justify-center p-8">
                <CircularProgress />
            </div>
        );
    }

    const statCards = [
        {
            title: "Total Collections",
            value: stats?.total || 0,
            icon: Folder,
            color: "text-blue-600",
            bgColor: "bg-blue-100",
        },
        {
            title: "Active Collections",
            value: stats?.active || 0,
            icon: FolderOpen,
            color: "text-green-600",
            bgColor: "bg-green-100",
        },
        {
            title: "Featured Collections",
            value: stats?.featured || 0,
            icon: Star,
            color: "text-yellow-600",
            bgColor: "bg-yellow-100",
        },
        {
            title: "Total Products",
            value: stats?.totalProducts || 0,
            icon: Package,
            color: "text-purple-600",
            bgColor: "bg-purple-100",
        },
        {
            title: "Avg Products/Collection",
            value: stats?.total > 0 ? Math.round((stats?.totalProducts || 0) / stats.total) : 0,
            icon: TrendingUp,
            color: "text-orange-600",
            bgColor: "bg-orange-100",
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {statCards.map((stat, index) => (
                <Card key={index} className="shadow-sm">
                    <CardBody className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-gray-600 mb-1">{stat.title}</p>
                                <p className="text-lg font-bold text-gray-900">{stat.value}</p>
                            </div>
                            <div className={`p-2 rounded-full ${stat.bgColor}`}>
                                <stat.icon className={`w-4 h-4 ${stat.color}`} />
                            </div>
                        </div>
                    </CardBody>
                </Card>
            ))}
        </div>
    );
}