"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { LogOut, Package, Menu, X, ShoppingBag, Clock, History, Languages, Settings } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { useHistoryStore } from "@/lib/store/historyStore";
import { useLanguageStore } from "@/lib/store/languageStore";
import { translations } from "@/lib/i18n/shopTranslations";
import toast from "react-hot-toast";
import Link from "next/link";

export default function ShopLayout({ children }) {
  const { signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const language = useLanguageStore((state) => state.language);
  const setLanguage = useLanguageStore((state) => state.setLanguage);
  const t = translations[language];
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success('Logged out successfully');
      router.push('/login');
    } catch (error) {
      toast.error('Error logging out');
    }
  };

  const history = useHistoryStore((state) => state.getRecentHistory(5));
  const [showHistory, setShowHistory] = useState(false);

  const menuItems = [
    { href: '/admin/shop-dashboard', label: t.dashboard, icon: Package },
    { href: '/admin/pos', label: t.pos, icon: ShoppingBag },
    { href: '/admin/products', label: t.products, icon: Package },
    { href: '/admin/orders', label: t.orders, icon: ShoppingBag },
    { href: '/admin/settings', label: t.shopSettings, icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-[#eff3f4] dark:bg-[#121212]">
      {/* Overlay */}
      <div 
        className={`fixed inset-0 z-20 bg-black/50 lg:hidden transition-opacity ${isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar */}
      <aside className={`fixed lg:relative inset-y-0 left-0 z-30 w-64 bg-white dark:bg-[#1e1e1e] border-r border-gray-200 dark:border-gray-800 transform transition-transform duration-300 lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-3">
              <Package className="w-6 h-6 text-green-600 dark:text-green-400" />
              <span className="text-lg font-bold text-gray-900 dark:text-gray-100">{t.shopManager}</span>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-gray-500 hover:text-gray-600 dark:hover:text-gray-300">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Menu */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                    isActive
                      ? 'bg-green-600 text-white'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}

            {/* History Section */}
            <div className="mt-6">
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="flex items-center justify-between w-full px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <div className="flex items-center gap-2">
                  <History className="w-4 h-4" />
                  <span>{t.recentActivity}</span>
                </div>
                <span className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded-full">{history.length}</span>
              </button>
              
              {showHistory && (
                <div className="mt-2 space-y-1 max-h-64 overflow-y-auto">
                  {history.length === 0 ? (
                    <p className="px-4 py-2 text-xs text-gray-500 dark:text-gray-400">{t.noRecentActivity}</p>
                  ) : (
                    history.map((item) => (
                      <div key={item.id} className="px-4 py-2 text-xs bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 dark:text-white truncate">{item.description}</p>
                            <p className="text-gray-500 dark:text-gray-400 mt-1">
                              {new Date(item.timestamp).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-800 space-y-2">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-4 py-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors font-medium"
            >
              <LogOut className="w-5 h-5" />
              <span>{t.logout}</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white dark:bg-[#1e1e1e] border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-4 lg:px-6">
          <div className="flex items-center">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 mr-4"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {menuItems.find(item => item.href === pathname)?.label || 'Shop Manager'}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setLanguage(language === 'en' ? 'ne' : 'en')}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <Languages className="w-4 h-4" />
              <span>{language === 'en' ? 'नेपाली' : 'English'}</span>
            </button>
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <Clock className="w-4 h-4" />
              <time className="font-medium">
                {currentTime.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                {' '}
                {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </time>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
