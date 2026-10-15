"use client";

import AdminOnly from "./components/AdminOnly";
import DashboardStats from "./components/DashboardStats";
import RecentActivity from "./components/RecentActivity";
import ErrorBoundary from "../components/ErrorBoundary";

// Static class maps — Tailwind can't generate dynamic `bg-${color}-50` classes.
const COLOR_STYLES = {
  blue: {
    bg: "bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30",
    title: "text-blue-900 dark:text-blue-300",
    desc: "text-blue-700 dark:text-blue-400",
    dot: "bg-blue-500 dark:bg-blue-400",
  },
  green: {
    bg: "bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30",
    title: "text-green-900 dark:text-green-300",
    desc: "text-green-700 dark:text-green-400",
    dot: "bg-green-500 dark:bg-green-400",
  },
  purple: {
    bg: "bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/30",
    title: "text-purple-900 dark:text-purple-300",
    desc: "text-purple-700 dark:text-purple-400",
    dot: "bg-purple-500 dark:bg-purple-400",
  },
  orange: {
    bg: "bg-orange-50 dark:bg-orange-900/20 hover:bg-orange-100 dark:hover:bg-orange-900/30",
    title: "text-orange-900 dark:text-orange-300",
    desc: "text-orange-700 dark:text-orange-400",
    dot: "bg-orange-500 dark:bg-orange-400",
  },
};

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
                            <a key={action.href} href={action.href} className={`block p-3 rounded-lg transition-colors theme-transition ${COLOR_STYLES[action.color]?.bg || ""}`}>
                                <p className={`font-medium theme-transition ${COLOR_STYLES[action.color]?.title || ""}`}>{action.title}</p>
                                <p className={`text-sm theme-transition ${COLOR_STYLES[action.color]?.desc || ""}`}>{action.desc}</p>
                            </a>
                        ))}
                    </div>
                </section>

                <section className="bg-white dark:bg-[#1e1e1e] rounded-xl p-6 shadow-sm dark:shadow-[0_0_10px_rgba(0,0,0,0.4)] admin-card theme-transition">
                    <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-[#e5e7eb] theme-transition">System Health</h3>
                    <div className="space-y-3">
                        {systemStatus.map((system) => (
                            <div key={system.name} className={`flex items-center justify-between p-3 rounded-lg theme-transition ${COLOR_STYLES[system.color]?.bg || ""}`}>
                                <div>
                                    <p className={`font-medium theme-transition ${COLOR_STYLES[system.color]?.title || ""}`}>{system.name}</p>
                                    <p className={`text-sm theme-transition ${COLOR_STYLES[system.color]?.desc || ""}`}>{system.status}</p>
                                </div>
                                <div className={`w-3 h-3 rounded-full theme-transition ${COLOR_STYLES[system.color]?.dot || ""}`}></div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </main>
        </AdminOnly>
    );
}