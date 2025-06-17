"use client";

import { useAuth } from "@/contexts/AuthContext";
import { Card, CardBody, CardHeader, CircularProgress, Chip } from "@heroui/react";
import { DollarSign, ShoppingCart, TrendingUp, Package, Calendar, CreditCard } from "lucide-react";
import Header from "../components/Header";
import { Providers } from "../providers";

// Mock user transaction data - in a real app, this would come from your database
const mockUserData = {
    totalSpent: 2847.50,
    totalOrders: 12,
    averageOrderValue: 237.29,
    conversionRate: 85.7,
    recentTransactions: [
        {
            id: "TXN001",
            date: "2025-01-15",
            amount: 299.99,
            status: "completed",
            items: 3,
            description: "Electronics Purchase"
        },
        {
            id: "TXN002", 
            date: "2025-01-12",
            amount: 149.50,
            status: "completed",
            items: 2,
            description: "Clothing & Accessories"
        },
        {
            id: "TXN003",
            date: "2025-01-08",
            amount: 89.99,
            status: "pending",
            items: 1,
            description: "Home & Garden"
        },
        {
            id: "TXN004",
            date: "2025-01-05",
            amount: 199.99,
            status: "completed",
            items: 2,
            description: "Sports Equipment"
        },
        {
            id: "TXN005",
            date: "2025-01-02",
            amount: 75.00,
            status: "completed",
            items: 1,
            description: "Books & Media"
        }
    ],
    monthlySpending: [
        { month: "Jan", amount: 814.47 },
        { month: "Dec", amount: 692.30 },
        { month: "Nov", amount: 458.90 },
        { month: "Oct", amount: 523.15 },
        { month: "Sep", amount: 358.68 }
    ]
};

function DashboardContent() {
    const { user, isLoading } = useAuth();

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <CircularProgress size="lg" />
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Card className="max-w-md">
                    <CardBody className="text-center p-8">
                        <h1 className="text-xl font-bold mb-2">Please Login</h1>
                        <p className="text-gray-600">You need to be logged in to view your dashboard.</p>
                    </CardBody>
                </Card>
            </div>
        );
    }

    const getStatusColor = (status) => {
        switch (status) {
            case "completed": return "success";
            case "pending": return "warning";
            case "cancelled": return "danger";
            default: return "default";
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    return (
        <div>
            <Header />
            <main className="container mx-auto px-4 py-6">
                {/* Welcome Section */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Welcome back, {user.displayName || user.email}!
                    </h1>
                    <p className="text-gray-600">Here's your personal transaction overview and account activity.</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <Card className="shadow-sm">
                        <CardBody className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Total Spent</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        ${mockUserData.totalSpent.toLocaleString()}
                                    </p>
                                </div>
                                <div className="p-3 rounded-full bg-green-100">
                                    <DollarSign className="w-6 h-6 text-green-600" />
                                </div>
                            </div>
                        </CardBody>
                    </Card>

                    <Card className="shadow-sm">
                        <CardBody className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Total Orders</p>
                                    <p className="text-2xl font-bold text-gray-900">{mockUserData.totalOrders}</p>
                                </div>
                                <div className="p-3 rounded-full bg-blue-100">
                                    <ShoppingCart className="w-6 h-6 text-blue-600" />
                                </div>
                            </div>
                        </CardBody>
                    </Card>

                    <Card className="shadow-sm">
                        <CardBody className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Average Order Value</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        ${mockUserData.averageOrderValue.toFixed(2)}
                                    </p>
                                </div>
                                <div className="p-3 rounded-full bg-purple-100">
                                    <TrendingUp className="w-6 h-6 text-purple-600" />
                                </div>
                            </div>
                        </CardBody>
                    </Card>

                    <Card className="shadow-sm">
                        <CardBody className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Conversion Rate</p>
                                    <p className="text-2xl font-bold text-gray-900">{mockUserData.conversionRate}%</p>
                                </div>
                                <div className="p-3 rounded-full bg-orange-100">
                                    <Package className="w-6 h-6 text-orange-600" />
                                </div>
                            </div>
                        </CardBody>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Recent Transactions */}
                    <Card className="shadow-sm">
                        <CardHeader className="pb-3">
                            <div className="flex items-center gap-2">
                                <CreditCard className="w-5 h-5 text-gray-600" />
                                <h3 className="text-lg font-semibold">Recent Transactions</h3>
                            </div>
                        </CardHeader>
                        <CardBody className="pt-0">
                            <div className="space-y-4">
                                {mockUserData.recentTransactions.map((transaction) => (
                                    <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <p className="font-medium text-sm">{transaction.description}</p>
                                                <Chip 
                                                    color={getStatusColor(transaction.status)} 
                                                    size="sm" 
                                                    className="capitalize"
                                                >
                                                    {transaction.status}
                                                </Chip>
                                            </div>
                                            <div className="flex items-center gap-4 text-xs text-gray-600">
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="w-3 h-3" />
                                                    {formatDate(transaction.date)}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Package className="w-3 h-3" />
                                                    {transaction.items} items
                                                </span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-sm">${transaction.amount}</p>
                                            <p className="text-xs text-gray-500">#{transaction.id}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardBody>
                    </Card>

                    {/* Monthly Spending Chart */}
                    <Card className="shadow-sm">
                        <CardHeader className="pb-3">
                            <div className="flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-gray-600" />
                                <h3 className="text-lg font-semibold">Monthly Spending</h3>
                            </div>
                        </CardHeader>
                        <CardBody className="pt-0">
                            <div className="space-y-4">
                                {mockUserData.monthlySpending.map((month, index) => {
                                    const maxAmount = Math.max(...mockUserData.monthlySpending.map(m => m.amount));
                                    const percentage = (month.amount / maxAmount) * 100;
                                    
                                    return (
                                        <div key={month.month} className="flex items-center gap-4">
                                            <div className="w-12 text-sm font-medium text-gray-600">
                                                {month.month}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between mb-1">
                                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                                        <div 
                                                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                                            style={{ width: `${percentage}%` }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="w-20 text-right text-sm font-medium">
                                                ${month.amount.toFixed(2)}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </CardBody>
                    </Card>
                </div>

                {/* Quick Actions */}
                <div className="mt-8">
                    <Card className="shadow-sm">
                        <CardHeader className="pb-3">
                            <h3 className="text-lg font-semibold">Quick Actions</h3>
                        </CardHeader>
                        <CardBody className="pt-0">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <a 
                                    href="/shop" 
                                    className="block p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <ShoppingCart className="w-6 h-6 text-blue-600" />
                                        <div>
                                            <p className="font-medium text-blue-900">Continue Shopping</p>
                                            <p className="text-sm text-blue-700">Browse our latest products</p>
                                        </div>
                                    </div>
                                </a>
                                
                                <a 
                                    href="/orders" 
                                    className="block p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <Package className="w-6 h-6 text-green-600" />
                                        <div>
                                            <p className="font-medium text-green-900">View Orders</p>
                                            <p className="text-sm text-green-700">Track your order status</p>
                                        </div>
                                    </div>
                                </a>
                                
                                <a 
                                    href="/profile" 
                                    className="block p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <CreditCard className="w-6 h-6 text-purple-600" />
                                        <div>
                                            <p className="font-medium text-purple-900">Account Settings</p>
                                            <p className="text-sm text-purple-700">Manage your profile</p>
                                        </div>
                                    </div>
                                </a>
                            </div>
                        </CardBody>
                    </Card>
                </div>
            </main>
        </div>
    );
}

export default function DashboardPage() {
    return (
        <Providers>
            <DashboardContent />
        </Providers>
    );
}