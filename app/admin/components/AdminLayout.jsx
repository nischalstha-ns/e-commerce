"use client";

import { useEffect, useRef, useState } from "react";
import Header from "./Header.jsx";
import  Sidebar  from "./sidebar.jsx";
import { usePathname } from "next/navigation";


export default function Layout({ children }) {

  const[isOpen, setIsOpen] =useState(false);
  const[isMounted, setIsMounted] = useState(false);
  const pathname=usePathname();
  const sidebarRef = useRef(null);
  
  const toggleSiderbar=()=>{
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted) {
      toggleSiderbar();
    }
  },[pathname, isMounted]);

  useEffect(() =>{
    if (!isMounted) return;
    
    function handleClickOutsideEvent(event){
      if(sidebarRef.current && !sidebarRef.current.contains(event.target)){
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown",handleClickOutsideEvent);
    return() =>{
      document.removeEventListener("mousedown",handleClickOutsideEvent);
    };

  },[isMounted])
 


  return (
    <main className="relative flex">
      <div className="hidden md:block">
        <Sidebar />
      </div>
        <div
        ref={sidebarRef}
    className={`fixed md:hidden ease-in-out transition-all dutation-400 z-50
       ${isMounted && isOpen ? "translate-x-0" : "-translate-x-[260px] "
    }`}
  >
    <Sidebar />
  </div>
        

     
      <section className="flex-1 flex-col md:min-h-screen">
      <Header toggleSiderbar={toggleSiderbar} />

      
      <section className="flex-1 bg-[#eff3f4] w-full p-full">
  {children}
</section>


  
      </section>
    </main>
  );
}