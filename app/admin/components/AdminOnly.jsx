"use client";

import { useAuth } from "@/contexts/AuthContext";

export default function AdminOnly({ children }) {
  const { userRole } = useAuth();

  if (userRole !== 'admin') {
    return null;
  }

  return children;
}
