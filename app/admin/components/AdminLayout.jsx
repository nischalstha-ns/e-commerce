"use client";

import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Header from "./Header.jsx";
import  Sidebar  from "./sidebar.jsx";
import MobileBottomNav from "./MobileBottomNav.jsx";
import { usePathname } from "next/navigation";


export default function Layout({ children }) {
  const { userRole } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const pathname = usePathname();
  const sidebarRef = useRef(null);
  
  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted) {
      setIsOpen(false);
    }
  },[pathname, isMounted]);

  useEffect(() =>{
    if (!isMounted) return;
    
    function handleClickOutsideEvent(event) {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutsideEvent);
    return () => {
      document.removeEventListener("mousedown", handleClickOutsideEvent);
    };

  },[isMounted])
 


  // Minimal layout for shop users - use ShopLayout
  if (userRole === 'shop') {
    return null; // ShopLayout will be used directly in products page
  }

  return (
    <main className="relative flex bg-white dark:bg-[#121212] theme-transition min-h-screen">
      <div className="hidden md:block sticky top-0 h-screen">
        <Sidebar />
      </div>
        <div
          ref={sidebarRef}
          className={`fixed md:hidden ease-in-out transition-all duration-400 z-50 ${
            isMounted && isOpen ? "translate-x-0" : "-translate-x-[260px]"
          }`}
        >
    <Sidebar />
  </div>
        

     
      <section className="flex-1 flex-col md:min-h-screen">
        <div className="sticky top-0 z-40">
          <Header toggleSidebar={toggleSidebar} />
        </div>
        <section className="flex-1 bg-[#eff3f4] dark:bg-[#121212] w-full theme-transition min-h-screen pb-20 md:pb-0">
          {children}
        </section>
        <MobileBottomNav />
      </section>
    </main>
  );
}