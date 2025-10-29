import DashboardStats from "./components/DashboardStats";
import RecentActivity from "./components/RecentActivity";

export default function Page() {
    return (
        <main className="p-6 space-y-6 bg-[#eff3f4] dark:bg-[#121212] min-h-screen theme-transition">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-[#e5e7eb] theme-transition">Dashboard</h1>
                <p className="text-gray-600 dark:text-[#9ca3af] theme-transition">Welcome to your admin dashboard - manage your e-commerce store</p>
            </div>
            
            <DashboardStats />
            
            <RecentActivity />
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-[#1e1e1e] rounded-xl p-6 shadow-sm dark:shadow-[0_0_10px_rgba(0,0,0,0.4)] admin-card theme-transition">
                    <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-[#e5e7eb] theme-transition">Quick Actions</h3>
                    <div className="space-y-3">
                        <a href="/admin/products" className="block p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors theme-transition">
                            <p className="font-medium text-blue-900 dark:text-blue-300 theme-transition">Manage Products</p>
                            <p className="text-sm text-blue-700 dark:text-blue-400 theme-transition">Add, edit, or remove products from your catalog</p>
                        </a>
                        <a href="/admin/orders" className="block p-3 bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors theme-transition">
                            <p className="font-medium text-green-900 dark:text-green-300 theme-transition">Process Orders</p>
                            <p className="text-sm text-green-700 dark:text-green-400 theme-transition">View and update order status and tracking</p>
                        </a>
                        <a href="/admin/reviews" className="block p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors theme-transition">
                            <p className="font-medium text-purple-900 dark:text-purple-300 theme-transition">Moderate Reviews</p>
                            <p className="text-sm text-purple-700 dark:text-purple-400 theme-transition">Approve or reject customer reviews</p>
                        </a>
                        <a href="/admin/collections" className="block p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors theme-transition">
                            <p className="font-medium text-orange-900 dark:text-orange-300 theme-transition">Manage Collections</p>
                            <p className="text-sm text-orange-700 dark:text-orange-400 theme-transition">Create and organize product collections</p>
                        </a>
                    </div>
                </div>

                <div className="bg-white dark:bg-[#1e1e1e] rounded-xl p-6 shadow-sm dark:shadow-[0_0_10px_rgba(0,0,0,0.4)] admin-card theme-transition">
                    <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-[#e5e7eb] theme-transition">System Health</h3>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg theme-transition">
                            <div>
                                <p className="font-medium text-green-900 dark:text-green-300 theme-transition">Database</p>
                                <p className="text-sm text-green-700 dark:text-green-400 theme-transition">All systems operational</p>
                            </div>
                            <div className="w-3 h-3 bg-green-500 dark:bg-green-400 rounded-full theme-transition"></div>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg theme-transition">
                            <div>
                                <p className="font-medium text-green-900 dark:text-green-300 theme-transition">Image Storage</p>
                                <p className="text-sm text-green-700 dark:text-green-400 theme-transition">Cloudinary connected</p>
                            </div>
                            <div className="w-3 h-3 bg-green-500 dark:bg-green-400 rounded-full theme-transition"></div>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg theme-transition">
                            <div>
                                <p className="font-medium text-green-900 dark:text-green-300 theme-transition">Authentication</p>
                                <p className="text-sm text-green-700 dark:text-green-400 theme-transition">Firebase Auth active</p>
                            </div>
                            <div className="w-3 h-3 bg-green-500 dark:bg-green-400 rounded-full theme-transition"></div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}