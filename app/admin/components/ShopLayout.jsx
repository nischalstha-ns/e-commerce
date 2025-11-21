"use client";

import { useAuth } from "@/contexts/AuthContext";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firestore/firebase";
import toast from "react-hot-toast";
import { MoonIcon, SunIcon, LogOut } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

export default function ShopLayout({ children }) {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast.success("Logged out successfully");
    } catch (error) {
      toast.error("Error logging out");
    }
  };

  return (
    <div className="min-h-screen bg-[#eff3f4] dark:bg-[#121212] theme-transition">
      {/* Minimal Header */}
      <header className="bg-white dark:bg-[#1a1a1a] border-b border-gray-200 dark:border-[#2e2e2e] px-6 py-4 theme-transition">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img 
              src="https://res.cloudinary.com/dwwypumxh/image/upload/v1762531629/NFS_Logo_PNG_z5qisi.png" 
              alt="Shop Management" 
              className="w-10 h-10 object-contain dark:bg-white dark:rounded-lg dark:p-1"
            />
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white theme-transition">
              Shop Management
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <button 
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#242424] transition-colors"
            >
              {theme === 'light' ? (
                <MoonIcon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              ) : (
                <SunIcon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              )}
            </button>

            {/* User Info & Logout */}
            <div className="flex items-center gap-3 pl-3 border-l border-gray-200 dark:border-[#2e2e2e]">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-gray-900 dark:text-white">{user?.displayName || "Shop Manager"}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Shop Role</p>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">
        {children}
      </main>
    </div>
  );
}
