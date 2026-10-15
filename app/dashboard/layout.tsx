"use client";

import { memo } from 'react';
import { AuthProvider } from "@/contexts/AuthContext";
import RoleGuard from "@/lib/auth/roleGuard";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout = memo(function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <AuthProvider>
      <RoleGuard allowedRoles={['customer', 'admin']} fallbackPath="/login">
        {children}
      </RoleGuard>
    </AuthProvider>
  );
});

export default DashboardLayout;