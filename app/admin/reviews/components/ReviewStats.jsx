"use client";

import { useReviewStats } from "@/lib/firestore/reviews/read";
import { Card, CardBody, CircularProgress } from "@heroui/react";
import { Star, MessageSquare, CheckCircle, Clock, XCircle } from "lucide-react";

export default function ReviewStats() {
    const { data: stats, isLoading } = useReviewStats();

    if (isLoading) {
        return (
            <div className="flex justify-center p-8">
                <CircularProgress />
            </div>
        );
    }

    const statCards = [
        {
            title: "Total Reviews",
            value: stats?.total || 0,
            icon: MessageSquare,
            color: "text-blue-600",
            bgColor: "bg-blue-100",
        },
        {
            title: "Approved",
            value: stats?.approved || 0,
            icon: CheckCircle,
            color: "text-green-600",
            bgColor: "bg-green-100",
        },
        {
            title: "Pending",
            value: stats?.pending || 0,
            icon: Clock,
            color: "text-yellow-600",
            bgColor: "bg-yellow-100",
        },
        {
            title: "Rejected",
            value: stats?.rejected || 0,
            icon: XCircle,
            color: "text-red-600",
            bgColor: "bg-red-100",
        },
        {
            title: "Average Rating",
            value: stats?.averageRating || "0.0",
            icon: Star,
            color: "text-purple-600",
            bgColor: "bg-purple-100",
        }
    ];

    return (
        <div className="space-y-6">
            {/* Stats Cards */}
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

            {/* Rating Distribution */}
            <Card className="shadow-sm">
                <CardBody className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Rating Distribution</h3>
                    <div className="space-y-3">
                        {[5, 4, 3, 2, 1].map((rating) => {
                            const count = stats?.ratingDistribution?.[rating] || 0;
                            const total = stats?.total || 1;
                            const percentage = (count / total) * 100;
                            
                            return (
                                <div key={rating} className="flex items-center gap-3">
                                    <div className="flex items-center gap-1 w-12">
                                        <span className="text-sm font-medium">{rating}</span>
                                        <Star className="w-3 h-3 text-yellow-500 fill-current" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div 
                                                className="bg-yellow-500 h-2 rounded-full transition-all duration-300"
                                                style={{ width: `${percentage}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                    <div className="w-12 text-right text-sm text-gray-600">
                                        {count}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </CardBody>
            </Card>
        </div>
    );
}