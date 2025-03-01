"use client";

import { Menu } from "lucide-react";

export default function Header({toggleSiderbar}){
    return <section className="flex item-center gap-3 bg-white border-b px-4 py-4 ">
        <div className=" flex justify-center block md:hidden">
        <button onClick={toggleSiderbar}>
        <Menu />
        </button>
        </div>
    <h1 className="text-xl font-semibold">Dashboard</h1>
    </section>
}