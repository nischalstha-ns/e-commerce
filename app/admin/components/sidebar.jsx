"use client";

import Link from "next/link";
import Image from "next/image";
import { LayoutDashboard, Package, Tag, Layers, ShoppingCart, Users, Star, Folder, LogOut, BarChart3, Settings, Monitor, Home, FileText } from "lucide-react";
import { usePathname } from "next/navigation";
import toast from "react-hot-toast";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firestore/firebase";
import { Badge } from "@heroui/react";

export default function Sidebar() {
  const menuSections = [
    {
      title: "Main Menu",
      items: [
        { name: "Dashboard", link: "/admin", icon: LayoutDashboard },
      ]
    },
    {
      title: "Pages",
      items: [
        { name: "Homepage", link: "/admin/homepage", icon: Home },
      ]
    },
    {
      title: "Store Management",
      items: [
        { name: "Products", link: "/admin/products", icon: Package },
        { name: "Categories", link: "/admin/categories", icon: Tag },
        { name: "Brands", link: "/admin/brands", icon: Layers },
        { name: "Collections", link: "/admin/collections", icon: Folder },
        { name: "Orders", link: "/admin/orders", icon: ShoppingCart, badge: "new" },
        { name: "Customers", link: "/admin/customers", icon: Users },
        { name: "Reviews", link: "/admin/reviews", icon: Star, badge: "3" },
      ]
    },
    {
      title: "System",
      items: [
        { name: "Analytics", link: "/admin/analytics", icon: BarChart3 },
        { name: "Settings", link: "/admin/settings", icon: Settings },
      ]
    }
  ];

  return (
    <section className="flex flex-col gap-3 bg-white dark:bg-[#1a1a1a] border-r border-gray-200 dark:border-[#2e2e2e] px-5 py-3 h-screen overflow-hidden w-[260px] admin-sidebar theme-transition">
      <div className="flex justify-center py-2">
        <Image className="h-10 rounded-xl" src="/logo.jpg" alt="logo" width={40} height={40} />
      </div>
      
      <div className="flex-1 h-full overflow-y-auto flex flex-col gap-4">
        {menuSections.map((section, sectionIndex) => (
          <div key={sectionIndex}>
            <div className="border-b border-gray-200 dark:border-[#2e2e2e] pb-2 mb-3 theme-transition">
              <p className="text-xs text-gray-500 dark:text-[#9ca3af] uppercase tracking-wide font-medium theme-transition">{section.title}</p>
            </div>
            <ul className="flex flex-col gap-2">
              {section.items.map((item, index) => (
                <Tab item={item} key={index} />
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-gray-200 dark:border-[#2e2e2e] pt-3 theme-transition">
        <button
          onClick={async () => {
            try {
              await toast.promise(signOut(auth), {
                loading: "Signing out...",
                success: "Successfully logged out",
                error: "Failed to sign out"
              });
            } catch (error) {
              toast.error(error?.message);
            }
          }} 
          className="flex gap-3 items-center px-3 py-2 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 rounded-xl w-full ease-soft-spring duration-200 transition-all text-gray-600 dark:text-[#9ca3af] theme-transition"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </section>
  );
}

function Tab({ item }) {
  const pathname = usePathname();
  const isSelected = pathname === item?.link;
  const Icon = item.icon;

  return (
    <li className="list-none">
      <Link 
        href={item.link} 
        className={`flex items-center justify-between gap-2 px-4 py-2 rounded-xl font-medium ease-soft-spring transition-all duration-200 ${
          isSelected 
            ? "bg-blue-600 text-white shadow-md dark:shadow-[0_0_10px_rgba(59,130,246,0.3)]" 
            : "bg-white dark:bg-[#242424] text-gray-700 dark:text-[#e5e7eb] hover:bg-gray-50 dark:hover:bg-[#2a2a2a] hover:text-blue-600 dark:hover:text-blue-400 theme-transition"
        }`}
      >
        <div className="flex items-center gap-2">
          <Icon className="w-5 h-5" />
          <span>{item.name}</span>
        </div>
        {item.badge && (
          <Badge 
            content={item.badge} 
            color={item.badge === "new" ? "success" : "danger"} 
            size="sm"
          />
        )}
      </Link>
    </li>
  );
}