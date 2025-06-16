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
    if (!isLoading) {
      if (!user) {
        router.replace("/login");
      } else if (userRole && userRole !== "admin") {
        router.replace("/dashboard");
      }
    }
  }, [user, userRole, isLoading, router]);

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex justify-center items-center">
        <CircularProgress />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="h-screen w-screen flex justify-center items-center">
        <h1>Please login first!!</h1>
      </div>
    );
  }

  if (userRole && userRole !== "admin") {
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

  return (
    <AdminLayout>{children}</AdminLayout>
  );
}