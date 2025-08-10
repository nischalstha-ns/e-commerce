"use client";

import AuthContextProvider, { useAuth } from "@/contexts/AuthContext";
import { CircularProgress } from "@heroui/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import AdminLayout from "./components/AdminLayout";

export default function Layout({ children }) {
  return (
    <AuthContextProvider>
      <AdminChecking>{children}</AdminChecking>
    </AuthContextProvider>
  );
}

function AdminChecking({ children }) {
  const { user, userRole, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user && !isLoading) {
      router.replace("/login");
      return;
    }
    
    if (user && userRole === "customer") {
      router.replace("/dashboard");
      return;
    }
  }, [user, userRole, isLoading, router]);

  // Show loading only for initial auth check
  if (isLoading && !user) {
    return (
      <div className="h-screen w-screen flex justify-center items-center">
        <CircularProgress />
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to login
  }

  // Allow access if user exists, even if role is still loading
  if (user && (userRole === "admin" || userRole === null)) {
    return <AdminLayout>{children}</AdminLayout>;
  }

  // Only show access denied if we know the role is customer
  if (userRole === "customer") {
    return (
      <div className="h-screen w-screen flex justify-center items-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
          <p className="text-gray-600 mt-2">You need admin privileges to access this area.</p>
          <a href="/dashboard" className="text-blue-600 hover:underline mt-4 inline-block">
            Go to Dashboard
          </a>
        </div>
      </div>
    );
  }

  return <AdminLayout>{children}</AdminLayout>;
}