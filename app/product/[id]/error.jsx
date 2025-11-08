"use client";

import { Button } from "@heroui/react";
import { ArrowLeft, RefreshCw } from "lucide-react";
import Link from "next/link";
import Header from "../../components/Header";

export default function Error({ error, reset }) {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-16">
          <div className="text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Something went wrong
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {error?.message || "Failed to load product"}
          </p>
          <div className="flex gap-4 justify-center">
            <Button 
              onClick={reset}
              color="primary"
              startContent={<RefreshCw className="w-4 h-4" />}
            >
              Try Again
            </Button>
            <Button 
              as={Link} 
              href="/shop" 
              variant="bordered"
              startContent={<ArrowLeft className="w-4 h-4" />}
            >
              Back to Shop
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}