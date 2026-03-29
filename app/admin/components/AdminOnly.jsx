"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import LoadingSpinner from "@/app/components/LoadingSpinner";

export default function AdminOnly({ children }) {
  const { user, userRole, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      router.replace("/login?redirect=/admin");
      return;
    }

    if (userRole === "shop") {
      router.replace("/admin/products");
      return;
    }

    if (userRole !== "admin" && userRole !== "shop") {
      router.replace("/");
    }
  }, [user, userRole, isLoading, router]);

  if (isLoading) {
    return <LoadingSpinner size="lg" label="Checking permissions..." />;
  }

  if (!user) {
    return <LoadingSpinner size="lg" label="Redirecting to login..." />;
  }

  if (userRole === "shop") {
    return <LoadingSpinner size="lg" label="Redirecting..." />;
  }

  if (userRole !== "admin") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Access Denied</h1>
          <p className="text-gray-600 dark:text-gray-400">You do not have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return children;
}
