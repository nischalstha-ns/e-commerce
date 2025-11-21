"use client";

import RoleGuard from "@/lib/auth/roleGuard";
import AdminLayout from "./components/AdminLayout";
import { useAuth } from "@/contexts/AuthContext";

export default function Layout({ children }) {
  return (
    <RoleGuard allowedRoles={['admin', 'shop']} fallbackPath="/dashboard">
      <AdminLayout>{children}</AdminLayout>
    </RoleGuard>
  );
}