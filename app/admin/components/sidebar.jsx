"use client";

import Link from "next/link";
import { LayoutDashboard, Package, Tag, Layers, ShoppingCart, Users, Star, Folder, LogOut } from "lucide-react";
import { usePathname } from "next/navigation";

export default function Slider() {
  const menuList = [
    { name: "Dashboard", link: "/admin", icon: LayoutDashboard },
    { name: "Products", link: "/admin/products", icon: Package },
    { name: "Categories", link: "/admin/categories", icon: Tag },
    { name: "Brands", link: "/admin/brands", icon: Layers },
    { name: "Order", link: "/admin/orders", icon: ShoppingCart },
    { name: "Customers", link: "/admin/customers", icon: Users },
    { name: "Reviews", link: "/admin/reviews", icon: Star },
    { name: "Collections", link: "/admin/collections", icon: Folder },
  ];

  return (
    <section className="flex flex-col gap-3 bg-white border-r px-5 py-3 h-screen">
      <div>
        <img className="h-9" src="/logo.jpg" alt="logo" />
      </div>
      <ul className="flex-1 flex flex-col gap-5">
        {menuList.map((item, index) => (
          <Tab item={item} key={index} />
        ))}
      </ul>

      <div className="flex justify-center">
        <button className="flex gap-3 item-center">
        <LogOut className="w-5 h-5"/>Logout

      </button></div>
    </section>
  );
}

function Tab({ item }) {
  const pathname = usePathname();
  const isSelected = pathname === item?.link;
  const Icon = item.icon; // Get the icon from item

  return (
    <li
      className={`list-none flex items-center gap-2 px-4 py-2 rounded-xl font-semibold ease-soft-spring transition-all duration-100     ${isSelected ? "bg-blue-700 text-white" : "bg-white text-black"}`}
    >
      <Link href={item.link} className="flex items-center gap-2 hover:text-blue-500 rounded-xl">
        <Icon className="w-5 h-5" />
        <span>{item.name}</span>
      </Link>
    </li>
  );
}
