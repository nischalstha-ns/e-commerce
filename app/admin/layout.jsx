"use client";

import RoleGuard from "@/lib/auth/roleGuard";
import AdminLayout from "./components/AdminLayout";

export default function Layout({ children }) {
  return (
    <RoleGuard allowedRoles={['admin']} fallbackPath="/dashboard">
      <AdminLayout>{children}</AdminLayout>
    </RoleGuard>
  );
}