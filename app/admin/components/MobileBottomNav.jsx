"use client";

import Link from "next/link";
import { LayoutDashboard, Package, ShoppingCart, Users, BarChart3, Tag, Star, Folder, Menu } from "lucide-react";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Badge } from "@heroui/react";
import { useAuth } from "@/contexts/AuthContext";

export default function MobileBottomNav() {
  const pathname = usePathname();
  const [showMore, setShowMore] = useState(false);
  const { userRole } = useAuth();

  const shopNavItems = [
    { name: "Products", link: "/admin/products", icon: Package },
  ];

  const adminMainNavItems = [
    { name: "Home", link: "/admin", icon: LayoutDashboard },
    { name: "Products", link: "/admin/products", icon: Package },
    { name: "Orders", link: "/admin/orders", icon: ShoppingCart },
    { name: "Analytics", link: "/admin/analytics", icon: BarChart3 },
  ];

  const adminMoreItems = [
    { name: "Categories", link: "/admin/categories", icon: Tag },
    { name: "Brands", link: "/admin/brands", icon: Layers },
    { name: "Customers", link: "/admin/customers", icon: Users },
    { name: "Reviews", link: "/admin/reviews", icon: Star },
    { name: "Collections", link: "/admin/collections", icon: Folder },
    { name: "Settings", link: "/admin/settings", icon: Settings },
  ];
  
  const mainNavItems = userRole === 'shop' ? shopNavItems : adminMainNavItems;
  const moreItems = userRole === 'shop' ? [] : adminMoreItems;

  return (
    <>
      {/* More Menu Overlay */}
      {showMore && (
        <div 
          className="md:hidden fixed inset-0 bg-black/60 z-40 backdrop-blur-sm animate-fadeIn"
          onClick={() => setShowMore(false)}
        >
          <div 
            className="absolute bottom-16 left-0 right-0 bg-white dark:bg-[#1a1a1a] border-t-2 border-gray-200 dark:border-[#2e2e2e] theme-transition animate-slide-up rounded-t-2xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">More Options</h3>
                <button
                  onClick={() => setShowMore(false)}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-[#242424] rounded-lg transition-colors"
                >
                  <X size={18} className="text-gray-500 dark:text-gray-400" />
                </button>
              </div>
              <div className="grid grid-cols-3 gap-3 max-h-[60vh] overflow-y-auto">
                {moreItems.map((item, index) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.link;
                  
                  return (
                    <Link
                      key={index}
                      href={item.link}
                      onClick={() => setShowMore(false)}
                      className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl transition-all duration-200 active:scale-95 ${
                        isActive
                          ? "bg-blue-600 text-white shadow-lg"
                          : "bg-gray-50 dark:bg-[#242424] text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#2a2a2a]"
                      }`}
                    >
                      <Icon className="w-6 h-6" />
                      <span className="text-xs font-medium text-center">{item.name}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-[#1a1a1a] border-t-2 border-gray-200 dark:border-[#2e2e2e] z-50 theme-transition shadow-[0_-4px_12px_-2px_rgba(0,0,0,0.15)] dark:shadow-[0_-4px_12px_-2px_rgba(0,0,0,0.4)] safe-area-bottom">
        <div className="flex justify-around items-center h-16 px-2">
          {mainNavItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = pathname === item.link;
            
            return (
              <Link
                key={index}
                href={item.link}
                className="relative flex flex-col items-center justify-center gap-1 px-2 py-2 rounded-xl transition-all duration-200 min-w-[60px] active:scale-95 group"
              >
                {isActive && (
                  <div className="absolute inset-0 bg-blue-50 dark:bg-blue-900/20 rounded-xl scale-100 transition-transform" />
                )}
                <div className="relative">
                  {item.badge && (
                    <Badge 
                      content={item.badge} 
                      color="danger" 
                      size="sm"
                      className="absolute -top-1 -right-1"
                    />
                  )}
                  <Icon 
                    className={`w-5 h-5 transition-all duration-200 ${
                      isActive 
                        ? "text-blue-600 dark:text-blue-400 scale-110" 
                        : "text-gray-600 dark:text-gray-400 group-active:text-blue-600 dark:group-active:text-blue-400"
                    }`} 
                  />
                </div>
                <span 
                  className={`text-[10px] font-medium transition-all duration-200 truncate max-w-full ${
                    isActive 
                      ? "text-blue-600 dark:text-blue-400" 
                      : "text-gray-600 dark:text-gray-400 group-active:text-blue-600 dark:group-active:text-blue-400"
                  }`}
                >
                  {item.name}
                </span>
              </Link>
            );
          })}
          
          {/* More Button - Only for admin */}
          {userRole !== 'shop' && (
            <button
              onClick={() => setShowMore(!showMore)}
              className="relative flex flex-col items-center justify-center gap-1 px-2 py-2 rounded-xl transition-all duration-200 min-w-[60px] active:scale-95 group"
            >
              {showMore && (
                <div className="absolute inset-0 bg-blue-50 dark:bg-blue-900/20 rounded-xl scale-100 transition-transform" />
              )}
              <Menu 
                className={`w-5 h-5 transition-all duration-200 ${
                  showMore 
                    ? "text-blue-600 dark:text-blue-400 scale-110 rotate-90" 
                    : "text-gray-600 dark:text-gray-400 group-active:text-blue-600 dark:group-active:text-blue-400"
                }`} 
              />
              <span 
                className={`text-[10px] font-medium transition-all duration-200 ${
                  showMore 
                    ? "text-blue-600 dark:text-blue-400" 
                    : "text-gray-600 dark:text-gray-400 group-active:text-blue-600 dark:group-active:text-blue-400"
                }`}
              >
                More
              </span>
            </button>
          )}
        </div>
      </nav>
    </>
  );
}
