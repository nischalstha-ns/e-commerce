"use client";

import { useProducts } from "@/lib/firestore/products/read";
import { useCategories } from "@/lib/firestore/categories/read";
import { useOrderStats } from "@/lib/firestore/orders/read";
import { useUsers } from "@/lib/firestore/users/read";
import { Card, CardBody, CircularProgress } from "@heroui/react";
import { Package, Tag, ShoppingCart, Users, DollarSign, TrendingUp } from "lucide-react";

export default function DashboardStats() {
    const { data: products, isLoading: productsLoading } = useProducts();
    const { data: categories, isLoading: categoriesLoading } = useCategories();
    const { data: orderStats, isLoading: ordersLoading } = useOrderStats();
    const { data: users, isLoading: usersLoading } = useUsers();

    const stats = [
        {
            title: "Total Products",
            value: products?.length || 0,
            icon: Package,
            color: "text-blue-600",
            bgColor: "bg-blue-100",
            loading: productsLoading
        },
        {
            title: "Categories",
            value: categories?.length || 0,
            icon: Tag,
            color: "text-green-600",
            bgColor: "bg-green-100",
            loading: categoriesLoading
        },
        {
            title: "Total Orders",
            value: orderStats?.total || 0,
            icon: ShoppingCart,
            color: "text-purple-600",
            bgColor: "bg-purple-100",
            loading: ordersLoading
        },
        {
            title: "Customers",
            value: users?.length || 0,
            icon: Users,
            color: "text-orange-600",
            bgColor: "bg-orange-100",
            loading: usersLoading
        },
        {
            title: "Revenue",
            value: `$${orderStats?.totalRevenue?.toFixed(2) || "0.00"}`,
            icon: DollarSign,
            color: "text-emerald-600",
            bgColor: "bg-emerald-100",
            loading: ordersLoading
        },
        {
            title: "Pending Orders",
            value: orderStats?.pending || 0,
            icon: TrendingUp,
            color: "text-yellow-600",
            bgColor: "bg-yellow-100",
            loading: ordersLoading
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stats.map((stat, index) => (
                <Card key={index} className="shadow-sm">
                    <CardBody className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                                {stat.loading ? (
                                    <CircularProgress size="sm" />
                                ) : (
                                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                                )}
                            </div>
                            <div className={`p-3 rounded-full ${stat.bgColor}`}>
                                <stat.icon className={`w-6 h-6 ${stat.color}`} />
                            </div>
                        </div>
                    </CardBody>
                </Card>
            ))}
        </div>
    );
}