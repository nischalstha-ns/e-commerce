"use client";

import AdminOnly from "./components/AdminOnly";
import DashboardStats from "./components/DashboardStats";
import RecentActivity from "./components/RecentActivity";
import ErrorBoundary from "../components/ErrorBoundary";

const quickActions = [
  { href: '/admin/products', title: 'Manage Products', desc: 'Add, edit, or remove products from your catalog', color: 'blue' },
  { href: '/admin/orders', title: 'Process Orders', desc: 'View and update order status and tracking', color: 'green' },
  { href: '/admin/reviews', title: 'Moderate Reviews', desc: 'Approve or reject customer reviews', color: 'purple' },
  { href: '/admin/collections', title: 'Manage Collections', desc: 'Create and organize product collections', color: 'orange' }
];

const systemStatus = [
  { name: 'Database', status: 'All systems operational', color: 'green' },
  { name: 'Image Storage', status: 'Cloudinary connected', color: 'green' },
  { name: 'Authentication', status: 'Firebase Auth active', color: 'green' }
];

export default function Page() {
    return (
        <AdminOnly>
        <main className="p-6 space-y-6 bg-[#eff3f4] dark:bg-[#121212] min-h-screen theme-transition">
            <header>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-[#e5e7eb] theme-transition">Dashboard</h1>
                <p className="text-gray-600 dark:text-[#9ca3af] theme-transition">Welcome to your admin dashboard - manage your e-commerce store</p>
            </header>
            
            <ErrorBoundary fallback={<div>Error loading dashboard stats</div>}>
              <DashboardStats />
            </ErrorBoundary>
            <ErrorBoundary fallback={<div>Error loading recent activity</div>}>
              <RecentActivity />
            </ErrorBoundary>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <section className="bg-white dark:bg-[#1e1e1e] rounded-xl p-6 shadow-sm dark:shadow-[0_0_10px_rgba(0,0,0,0.4)] admin-card theme-transition">
                    <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-[#e5e7eb] theme-transition">Quick Actions</h3>
                    <div className="space-y-3">
                        {quickActions.map((action) => (
                            <a key={action.href} href={action.href} className={`block p-3 bg-${action.color}-50 dark:bg-${action.color}-900/20 rounded-lg hover:bg-${action.color}-100 dark:hover:bg-${action.color}-900/30 transition-colors theme-transition`}>
                                <p className={`font-medium text-${action.color}-900 dark:text-${action.color}-300 theme-transition`}>{action.title}</p>
                                <p className={`text-sm text-${action.color}-700 dark:text-${action.color}-400 theme-transition`}>{action.desc}</p>
                            </a>
                        ))}
                    </div>
                </section>

                <section className="bg-white dark:bg-[#1e1e1e] rounded-xl p-6 shadow-sm dark:shadow-[0_0_10px_rgba(0,0,0,0.4)] admin-card theme-transition">
                    <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-[#e5e7eb] theme-transition">System Health</h3>
                    <div className="space-y-3">
                        {systemStatus.map((system) => (
                            <div key={system.name} className={`flex items-center justify-between p-3 bg-${system.color}-50 dark:bg-${system.color}-900/20 rounded-lg theme-transition`}>
                                <div>
                                    <p className={`font-medium text-${system.color}-900 dark:text-${system.color}-300 theme-transition`}>{system.name}</p>
                                    <p className={`text-sm text-${system.color}-700 dark:text-${system.color}-400 theme-transition`}>{system.status}</p>
                                </div>
                                <div className={`w-3 h-3 bg-${system.color}-500 dark:bg-${system.color}-400 rounded-full theme-transition`}></div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </main>
        </AdminOnly>
    );
}