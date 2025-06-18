"use client";

import { useState } from "react";
import ReviewStats from "./components/ReviewStats";
import ReviewList from "./components/ReviewList";
import { Button } from "@heroui/react";
import { BarChart3, List } from "lucide-react";

export default function Page() {
    const [activeTab, setActiveTab] = useState("list");

    return (
        <main className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold">Reviews Management</h1>
                    <p className="text-gray-600">Manage customer reviews and ratings</p>
                </div>
                
                <div className="flex gap-2">
                    <Button
                        onClick={() => setActiveTab("stats")}
                        variant={activeTab === "stats" ? "solid" : "bordered"}
                        color="primary"
                        startContent={<BarChart3 size={16} />}
                        size="sm"
                    >
                        Statistics
                    </Button>
                    <Button
                        onClick={() => setActiveTab("list")}
                        variant={activeTab === "list" ? "solid" : "bordered"}
                        color="primary"
                        startContent={<List size={16} />}
                        size="sm"
                    >
                        Reviews
                    </Button>
                </div>
            </div>

            {activeTab === "stats" ? <ReviewStats /> : <ReviewList />}
        </main>
    );
}