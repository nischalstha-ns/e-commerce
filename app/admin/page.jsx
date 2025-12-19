"use client";

import AdminOnly from "./components/AdminOnly";
import DashboardStats from "./components/DashboardStats";
import RecentActivity from "./components/RecentActivity";
import SystemOverview from "./components/SystemOverview";
import QuickActionsPanel from "./components/QuickActionsPanel";
import ErrorBoundary from "../components/ErrorBoundary";
import { Package, ShoppingCart, Users, Star, Tag, Layers, Folder, BarChart3, Settings, FileText, Image as ImageIcon, History, Monitor, UserCheck, Palette, Home, CreditCard, MapPin } from "lucide-react";

const allSystemPages = [
  // Core Management
  { href: '/admin/products', title: 'Products', desc: 'Manage product catalog, inventory, and pricing', icon: Package, category: 'Store', status: 'active', count: '1,234' },
  { href: '/admin/orders', title: 'Orders', desc: 'Process orders, track shipments, and manage fulfillment', icon: ShoppingCart, category: 'Store', status: 'active', count: '89', badge: 'new' },
  { href: '/admin/customers', title: 'Customers', desc: 'Manage customer accounts, profiles, and communication', icon: Users, category: 'Store', status: 'active', count: '567' },
  { href: '/admin/reviews', title: 'Reviews', desc: 'Moderate customer reviews and ratings', icon: Star, category: 'Store', status: 'active', count: '23', badge: 'pending' },
  
  // Catalog Organization
  { href: '/admin/categories', title: 'Categories', desc: 'Organize products into categories and subcategories', icon: Tag, category: 'Catalog', status: 'active', count: '45' },
  { href: '/admin/brands', title: 'Brands', desc: 'Manage product brands and manufacturers', icon: Layers, category: 'Catalog', status: 'active', count: '78' },
  { href: '/admin/collections', title: 'Collections', desc: 'Create curated product collections and featured sets', icon: Folder, category: 'Catalog', status: 'active', count: '12' },
  
  // Content Management
  { href: '/admin/pages', title: 'Pages', desc: 'Create and edit website pages and content', icon: FileText, category: 'Content', status: 'active', count: '8' },
  { href: '/admin/media', title: 'Media Library', desc: 'Manage images, videos, and digital assets', icon: ImageIcon, category: 'Content', status: 'active', count: '2.1k' },
  { href: '/admin/homepage', title: 'Homepage', desc: 'Customize homepage layout, banners, and featured content', icon: Home, category: 'Content', status: 'active' },
  { href: '/admin/theme', title: 'Theme Settings', desc: 'Customize site appearance, colors, and branding', icon: Palette, category: 'Content', status: 'active' },
  
  // Analytics & Reports
  { href: '/admin/analytics', title: 'Analytics', desc: 'View sales reports, traffic analytics, and performance metrics', icon: BarChart3, category: 'Analytics', status: 'active' },
  { href: '/admin/history', title: 'Activity History', desc: 'Track system changes and user activity logs', icon: History, category: 'Analytics', status: 'active' },
  
  // System Management
  { href: '/admin/settings', title: 'System Settings', desc: 'Configure store settings, payment methods, and integrations', icon: Settings, category: 'System', status: 'active' },
  { href: '/admin/roles', title: 'User Roles', desc: 'Manage user permissions and access control', icon: UserCheck, category: 'System', status: 'active', count: '5' },
  { href: '/admin/pos', title: 'Point of Sale', desc: 'In-store sales terminal and inventory management', icon: Monitor, category: 'System', status: 'active' },
  
  // Additional Features
  { href: '/admin/shop-dashboard', title: 'Shop Dashboard', desc: 'Vendor-specific dashboard for multi-vendor setup', icon: Monitor, category: 'Multi-vendor', status: 'active' },
  { href: '/billing', title: 'Billing', desc: 'Manage subscription, invoices, and payment history', icon: CreditCard, category: 'Account', status: 'active' },
  { href: '/checkout', title: 'Checkout Flow', desc: 'Monitor and optimize checkout process', icon: MapPin, category: 'Store', status: 'active' }
];

const systemStatus = [
  { name: 'Database', status: 'All systems operational', color: 'green', uptime: '99.9%' },
  { name: 'Image Storage', status: 'Cloudinary connected', color: 'green', uptime: '100%' },
  { name: 'Authentication', status: 'Firebase Auth active', color: 'green', uptime: '99.8%' },
  { name: 'Payment Gateway', status: 'Stripe connected', color: 'green', uptime: '99.7%' },
  { name: 'Email Service', status: 'SendGrid active', color: 'yellow', uptime: '98.5%' },
  { name: 'CDN', status: 'Vercel Edge Network', color: 'green', uptime: '100%' }
];

const categoryColors = {
  'Store': 'blue',
  'Catalog': 'purple',
  'Content': 'green',
  'Analytics': 'orange',
  'System': 'red',
  'Multi-vendor': 'indigo',
  'Account': 'pink'
};

export default function Page() {
    const groupedPages = allSystemPages.reduce((acc, page) => {
        if (!acc[page.category]) acc[page.category] = [];
        acc[page.category].push(page);
        return acc;
    }, {});

    return (
        <AdminOnly>
        <main className="p-6 space-y-6 bg-[#eff3f4] dark:bg-[#121212] min-h-screen theme-transition">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-[#e5e7eb] theme-transition mb-2">Admin Control Center</h1>
                <p className="text-gray-600 dark:text-[#9ca3af] theme-transition text-lg">Complete system overview and management dashboard</p>
            </header>
            
            <ErrorBoundary fallback={<div>Error loading dashboard stats</div>}>
              <DashboardStats />
            </ErrorBoundary>
            
            {/* System Health Overview */}
            <section className="bg-white dark:bg-[#1e1e1e] rounded-xl p-6 shadow-sm dark:shadow-[0_0_10px_rgba(0,0,0,0.4)] admin-card theme-transition">
                <h3 className="text-xl font-semibold mb-6 text-gray-900 dark:text-[#e5e7eb] theme-transition flex items-center gap-2">
                    <Monitor className="w-6 h-6" />
                    System Health & Status
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {systemStatus.map((system) => {
                        const statusClasses = {
                            green: 'p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800 theme-transition',
                            yellow: 'p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800 theme-transition',
                            red: 'p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800 theme-transition'
                        };
                        const textClasses = {
                            green: 'font-semibold text-green-900 dark:text-green-300 theme-transition',
                            yellow: 'font-semibold text-yellow-900 dark:text-yellow-300 theme-transition',
                            red: 'font-semibold text-red-900 dark:text-red-300 theme-transition'
                        };
                        const dotClasses = {
                            green: 'w-3 h-3 bg-green-500 dark:bg-green-400 rounded-full theme-transition',
                            yellow: 'w-3 h-3 bg-yellow-500 dark:bg-yellow-400 rounded-full theme-transition',
                            red: 'w-3 h-3 bg-red-500 dark:bg-red-400 rounded-full theme-transition'
                        };
                        return (
                        <div key={system.name} className={statusClasses[system.color]}>
                            <div className="flex items-center justify-between mb-2">
                                <p className={textClasses[system.color]}>{system.name}</p>
                                <div className={dotClasses[system.color]}></div>
                            </div>
                            <p className="text-sm text-gray-700 dark:text-gray-400 theme-transition mb-1">{system.status}</p>
                            <p className="text-xs text-gray-600 dark:text-gray-500 theme-transition">Uptime: {system.uptime}</p>
                        </div>
                        );
                    })}
                </div>
            </section>

            {/* All System Pages by Category */}
            <section className="space-y-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-[#e5e7eb] theme-transition">All System Pages & Features</h2>
                
                {Object.entries(groupedPages).map(([category, pages]) => {
                    const categoryColor = categoryColors[category] || 'gray';
                    return (
                        <div key={category} className="bg-white dark:bg-[#1e1e1e] rounded-xl p-6 shadow-sm dark:shadow-[0_0_10px_rgba(0,0,0,0.4)] admin-card theme-transition">
                            <h3 className="text-xl font-semibold mb-6 text-gray-900 dark:text-gray-300 theme-transition flex items-center gap-2">
                                <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                                {category} Management
                                <span className="text-sm font-normal text-gray-500 dark:text-gray-400">({pages.length} pages)</span>
                            </h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {pages.map((page) => {
                                    const Icon = page.icon;
                                    return (
                                        <a key={page.href} href={page.href} 
                                           className="group block p-4 bg-gray-50 dark:bg-[#242424] rounded-lg hover:bg-gray-100 dark:hover:bg-[#2a2a2a] transition-all duration-200 border border-gray-200 dark:border-[#2e2e2e] hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-md theme-transition">
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="flex items-center gap-3">
                                                    <div className={`p-2 bg-${categoryColor}-100 dark:bg-${categoryColor}-900/30 rounded-lg group-hover:bg-${categoryColor}-200 dark:group-hover:bg-${categoryColor}-900/50 transition-colors`}>
                                                        <Icon className={`w-5 h-5 text-${categoryColor}-600 dark:text-${categoryColor}-400`} />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-semibold text-gray-900 dark:text-[#e5e7eb] group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{page.title}</h4>
                                                        {page.count && (
                                                            <span className="text-sm text-gray-500 dark:text-gray-400">{page.count} items</span>
                                                        )}
                                                    </div>
                                                </div>
                                                
                                                <div className="flex flex-col items-end gap-1">
                                                    <div className={`w-2 h-2 bg-${page.status === 'active' ? 'green' : 'red'}-500 rounded-full`}></div>
                                                    {page.badge && (
                                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                                            page.badge === 'new' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                                                            page.badge === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                                                            'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                                                        }`}>
                                                            {page.badge}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            
                                            <p className="text-sm text-gray-600 dark:text-[#9ca3af] group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors leading-relaxed">{page.desc}</p>
                                        </a>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </section>

            {/* Quick Actions Panel */}
            <ErrorBoundary fallback={<div>Error loading quick actions</div>}>
              <QuickActionsPanel />
            </ErrorBoundary>
            
            {/* Comprehensive System Overview */}
            <ErrorBoundary fallback={<div>Error loading system overview</div>}>
              <SystemOverview />
            </ErrorBoundary>
            
            <ErrorBoundary fallback={<div>Error loading recent activity</div>}>
              <RecentActivity />
            </ErrorBoundary>
        </main>
        </AdminOnly>
    );
}