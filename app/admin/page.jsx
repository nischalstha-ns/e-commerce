import DashboardStats from "./components/DashboardStats";
import RecentOrders from "./components/RecentOrders";

export default function Page() {
    return (
        <main className="p-6 space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-600">Welcome to your admin dashboard</p>
            </div>
            
            <DashboardStats />
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <RecentOrders />
                <div className="bg-white rounded-xl p-6 shadow-sm">
                    <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
                    <div className="space-y-3">
                        <a href="/admin/products" className="block p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                            <p className="font-medium text-blue-900">Manage Products</p>
                            <p className="text-sm text-blue-700">Add, edit, or remove products</p>
                        </a>
                        <a href="/admin/orders" className="block p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
                            <p className="font-medium text-green-900">Process Orders</p>
                            <p className="text-sm text-green-700">View and update order status</p>
                        </a>
                        <a href="/admin/categories" className="block p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
                            <p className="font-medium text-purple-900">Manage Categories</p>
                            <p className="text-sm text-purple-700">Organize your product catalog</p>
                        </a>
                    </div>
                </div>
            </div>
        </main>
    );
}