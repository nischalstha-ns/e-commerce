import DashboardStats from "./components/DashboardStats";
import RecentActivity from "./components/RecentActivity";

export default function Page() {
    return (
        <main className="p-6 space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-600">Welcome to your admin dashboard - manage your e-commerce store</p>
            </div>
            
            <DashboardStats />
            
            <RecentActivity />
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl p-6 shadow-sm">
                    <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
                    <div className="space-y-3">
                        <a href="/admin/products" className="block p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                            <p className="font-medium text-blue-900">Manage Products</p>
                            <p className="text-sm text-blue-700">Add, edit, or remove products from your catalog</p>
                        </a>
                        <a href="/admin/orders" className="block p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
                            <p className="font-medium text-green-900">Process Orders</p>
                            <p className="text-sm text-green-700">View and update order status and tracking</p>
                        </a>
                        <a href="/admin/reviews" className="block p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
                            <p className="font-medium text-purple-900">Moderate Reviews</p>
                            <p className="text-sm text-purple-700">Approve or reject customer reviews</p>
                        </a>
                        <a href="/admin/collections" className="block p-3 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors">
                            <p className="font-medium text-orange-900">Manage Collections</p>
                            <p className="text-sm text-orange-700">Create and organize product collections</p>
                        </a>
                    </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm">
                    <h3 className="text-lg font-semibold mb-4">System Health</h3>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                            <div>
                                <p className="font-medium text-green-900">Database</p>
                                <p className="text-sm text-green-700">All systems operational</p>
                            </div>
                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                            <div>
                                <p className="font-medium text-green-900">Image Storage</p>
                                <p className="text-sm text-green-700">Cloudinary connected</p>
                            </div>
                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                            <div>
                                <p className="font-medium text-green-900">Authentication</p>
                                <p className="text-sm text-green-700">Firebase Auth active</p>
                            </div>
                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}