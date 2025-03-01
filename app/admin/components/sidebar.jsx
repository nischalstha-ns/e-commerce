"use client";

import Link from "next/link";
import { LayoutDashboard, Package, Tag, Layers, ShoppingCart, Users, Star, Folder, LogOut, ShieldCheck } from "lucide-react";
import { usePathname } from "next/navigation";
import toast from "react-hot-toast";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firestore/firebase";

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
    { name: "Admin", link: "/admin/admins", icon: ShieldCheck },
  ];

  return (
    <section className="flex flex-col gap-3 bg-white border-r px-5 py-3 h-screen overflow-hidden w-[260px]">
      <div className="flex justify-center">
        <img className="h-9 rounded-xl" src="/logo.jpg" alt="logo" />
      </div>
      <ul className="flex-1 h-full overflow-y-auto flex flex-col gap-5">
        {menuList.map((item, index) => (
          <Tab item={item} key={index} />
        ))}
      </ul>

      <div className="flex justify-center w-full ">
        <button
        onClick={ async()=>{
          try{
            await toast.promise(signOut(auth),{
              loading:"loading",
              success:"successfully loged out"

            });

          }catch(error){
            toast.error(error?.message)
          }

        }} 
        className="flex gap-3 item-center px-3 py-1 hover:bg-indigo-100 rounded-xl w-full ease-soft-spring dutation-400 ">
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
// 25