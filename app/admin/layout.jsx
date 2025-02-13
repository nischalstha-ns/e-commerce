"use client"

import { Slider } from "@heroui/react"
import { Children } from "react"

export default function Layout({ clildren }){
    return (
        <main className="flex">
        <Slider/>
        <section className="flex-1">
            {Children}

        </section>
        
    </main>
    );
}