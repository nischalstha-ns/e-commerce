"use client";

import Link from "next/link";
import { LayoutDashboard, Package, ShoppingCart, Users, BarChart3, Tag, Star, Folder, Menu } from "lucide-react";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Badge } from "@heroui/react";

export default function MobileBottomNav() {
  const pathname = usePathname();
  const [showMore, setShowMore] = useState(false);

  const mainNavItems = [
    { name: "Home", link: "/admin", icon: LayoutDashboard },
    { name: "Products", link: "/admin/products", icon: Package },
    { name: "Orders", link: "/admin/orders", icon: ShoppingCart, badge: "3" },
    { name: "Analytics", link: "/admin/analytics", icon: BarChart3 },
  ];

  const moreItems = [
    { name: "Customers", link: "/admin/customers", icon: Users },
    { name: "Categories", link: "/admin/categories", icon: Tag },
    { name: "Reviews", link: "/admin/reviews", icon: Star },
    { name: "Collections", link: "/admin/collections", icon: Folder },
  ];

  return (
    <>
      {/* More Menu Overlay */}
      {showMore && (
        <div 
          className="md:hidden fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
          onClick={() => setShowMore(false)}
        >
          <div 
            className="absolute bottom-16 left-0 right-0 bg-white dark:bg-[#1a1a1a] border-t border-gray-200 dark:border-[#2e2e2e] theme-transition animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="grid grid-cols-4 gap-2 p-4">
              {moreItems.map((item, index) => {
                const Icon = item.icon;
                const isActive = pathname === item.link;
                
                return (
                  <Link
                    key={index}
                    href={item.link}
                    onClick={() => setShowMore(false)}
                    className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl transition-all duration-200 ${
                      isActive
                        ? "bg-blue-600 text-white shadow-lg"
                        : "bg-gray-50 dark:bg-[#242424] text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#2a2a2a]"
                    }`}
                  >
                    <Icon className="w-6 h-6" />
                    <span className="text-xs font-medium">{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-[#1a1a1a] border-t border-gray-200 dark:border-[#2e2e2e] z-50 theme-transition shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] dark:shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.3)]">
        <div className="flex justify-around items-center h-16 px-1">
          {mainNavItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = pathname === item.link;
            
            return (
              <Link
                key={index}
                href={item.link}
                className="relative flex flex-col items-center justify-center gap-1 px-2 py-2 rounded-xl transition-all duration-300 min-w-[70px] group"
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
                    className={`w-6 h-6 transition-all duration-300 ${
                      isActive 
                        ? "text-blue-600 dark:text-blue-400 scale-110" 
                        : "text-gray-600 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:scale-105"
                    }`} 
                  />
                </div>
                <span 
                  className={`text-[10px] font-medium transition-all duration-300 ${
                    isActive 
                      ? "text-blue-600 dark:text-blue-400" 
                      : "text-gray-600 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400"
                  }`}
                >
                  {item.name}
                </span>
              </Link>
            );
          })}
          
          {/* More Button */}
          <button
            onClick={() => setShowMore(!showMore)}
            className="relative flex flex-col items-center justify-center gap-1 px-2 py-2 rounded-xl transition-all duration-300 min-w-[70px] group"
          >
            {showMore && (
              <div className="absolute inset-0 bg-blue-50 dark:bg-blue-900/20 rounded-xl scale-100 transition-transform" />
            )}
            <Menu 
              className={`w-6 h-6 transition-all duration-300 ${
                showMore 
                  ? "text-blue-600 dark:text-blue-400 scale-110 rotate-90" 
                  : "text-gray-600 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:scale-105"
              }`} 
            />
            <span 
              className={`text-[10px] font-medium transition-all duration-300 ${
                showMore 
                  ? "text-blue-600 dark:text-blue-400" 
                  : "text-gray-600 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400"
              }`}
            >
              More
            </span>
          </button>
        </div>
      </nav>
    </>
  );
}
