"use client";

import { memo } from 'react';
import AuthContextProvider from "@/contexts/AuthContext";
import RoleGuard from "@/lib/auth/roleGuard";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout = memo(function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <AuthContextProvider>
      <RoleGuard allowedRoles={['customer', 'admin']} fallbackPath="/login">
        {children}
      </RoleGuard>
    </AuthContextProvider>
  );
});

export default DashboardLayout;