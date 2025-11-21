"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import LoadingSpinner from "@/app/components/LoadingSpinner";

export default function AdminOnly({ children }) {
  const { userRole } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (userRole === 'shop') {
      router.replace('/admin/products');
    }
  }, [userRole, router]);

  if (userRole === 'shop') {
    return <LoadingSpinner size="lg" label="Redirecting..." />;
  }

  return children;
}
