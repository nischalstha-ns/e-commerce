"use client";

import { useProducts } from "@/lib/firestore/products/read";
import { useCategories } from "@/lib/firestore/categories/read";
import { useBrands } from "@/lib/firestore/brands/read";
import { useOrderStats } from "@/lib/firestore/orders/read";
import { useUsers } from "@/lib/firestore/users/read";
import { useReviewStats } from "@/lib/firestore/reviews/read";
import { useCollectionStats } from "@/lib/firestore/collections/read";
import { Card, CardBody, CircularProgress } from "@heroui/react";
import { Package, Tag, Layers, ShoppingCart, Users, DollarSign, TrendingUp, Star, Folder, AlertTriangle } from "lucide-react";

export default function DashboardStats() {
    const { data: products, isLoading: productsLoading } = useProducts();
    const { data: categories, isLoading: categoriesLoading } = useCategories();
    const { data: brands, isLoading: brandsLoading } = useBrands();
    const { data: orderStats, isLoading: ordersLoading } = useOrderStats();
    const { data: users, isLoading: usersLoading } = useUsers();
    const { data: reviewStats, isLoading: reviewsLoading } = useReviewStats();
    const { data: collectionStats, isLoading: collectionsLoading } = useCollectionStats();

    // Calculate low stock products
    const lowStockProducts = products?.filter(product => product.stock <= 5).length || 0;

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
            title: "Brands",
            value: brands?.length || 0,
            icon: Layers,
            color: "text-purple-600",
            bgColor: "bg-purple-100",
            loading: brandsLoading
        },
        {
            title: "Total Orders",
            value: orderStats?.total || 0,
            icon: ShoppingCart,
            color: "text-indigo-600",
            bgColor: "bg-indigo-100",
            loading: ordersLoading
        },
        {
            title: "Customers",
            value: users?.filter(user => user.role !== "admin").length || 0,
            icon: Users,
            color: "text-orange-600",
            bgColor: "bg-orange-100",
            loading: usersLoading
        },
        {
            title: "Revenue",
            value: `Rs. ${orderStats?.totalRevenue?.toFixed(2) || "0.00"}`,
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
        },
        {
            title: "Total Reviews",
            value: reviewStats?.total || 0,
            icon: Star,
            color: "text-pink-600",
            bgColor: "bg-pink-100",
            loading: reviewsLoading
        },
        {
            title: "Collections",
            value: collectionStats?.total || 0,
            icon: Folder,
            color: "text-cyan-600",
            bgColor: "bg-cyan-100",
            loading: collectionsLoading
        },
        {
            title: "Low Stock Items",
            value: lowStockProducts,
            icon: AlertTriangle,
            color: "text-red-600",
            bgColor: "bg-red-100",
            loading: productsLoading
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {stats.map((stat, index) => (
                <Card key={index} className="shadow-sm hover:shadow-md transition-shadow">
                    <CardBody className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-gray-600 mb-1">{stat.title}</p>
                                {stat.loading ? (
                                    <CircularProgress size="sm" />
                                ) : (
                                    <p className="text-lg font-bold text-gray-900">{stat.value}</p>
                                )}
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