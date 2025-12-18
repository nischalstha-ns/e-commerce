'use client';

import { Button, Badge, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Avatar } from '@heroui/react';
import { ShoppingCart, User, LogOut, Menu, Search, Heart, Shield, Package } from 'lucide-react';
import { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigation } from '@/lib/firestore/navigation/read';
import { useCart } from '@/lib/firestore/cart/read';
import ThemeToggle from './ThemeToggle';
import toast from 'react-hot-toast';

function UserAvatar({ user }) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
        {user.photoURL ? (
          <img src={user.photoURL} alt={user.displayName || 'User'} className="w-full h-full object-cover" />
        ) : (
          <User size={16} className="text-gray-500 dark:text-gray-400" />
        )}
      </div>
      <div className="hidden md:block text-left">
        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{user.displayName || 'User'}</p>
      </div>
    </div>
  );
}

export default function Header() {
  const { user, userRole, signOut, isLoading } = useAuth();
  const { data: navData } = useNavigation();
  const { data: cart } = useCart(user?.uid);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();

  const cartItemCount = cart?.items?.reduce((total, item) => total + (item.quantity || 0), 0) || 0;

  if (!isLoading && userRole === 'shop') {
    return null;
  }
  
  const menulist = navData.menuItems.filter(item => item.enabled).sort((a, b) => a.order - b.order);

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success('Logged out successfully');
      router.push('/');
    } catch (error) {
      toast.error('Error logging out');
    }
  };

  const handleLogoClick = useCallback(() => {
    router.push('/');
    setIsMobileMenuOpen(false);
  }, [router]);

  return (
    <nav className="sticky top-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 shadow-sm theme-transition">
      {/* Main Header */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link 
            href={navData.logo.link}
            className="flex items-center cursor-pointer hover:opacity-80 transition-opacity"
            aria-label="Go to homepage"
          >
            <img className="w-20 h-14 object-contain dark:bg-white dark:rounded-lg dark:p-2 hover:scale-105 transition-transform duration-200" src={navData.logo.url} alt={navData.logo.alt} />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            {menulist.map((item) => (
              <Link 
                key={item.id} 
                href={item.link} 
                className="text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors font-medium"
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Search Bar */}
          <div className="hidden md:flex items-center flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" size={18} />
              <input
                type="text"
                placeholder="Search products..."
                className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent theme-transition"
              />
            </div>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Search Icon (Mobile) */}
            <button className="md:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
              <Search size={20} className="text-gray-700 dark:text-gray-300" />
            </button>

            {/* Wishlist */}
            <button className="hidden md:block p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
              <Heart size={20} className="text-gray-700 dark:text-gray-300" />
            </button>

            {/* Cart */}
            <Button
              as={Link}
              href="/cart"
              variant="light"
              isIconOnly
              className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
            >
              <Badge 
                content={cartItemCount} 
                color="danger" 
                size="sm"
                isInvisible={cartItemCount === 0}
                className="border-2 border-white dark:border-gray-900"
              >
                <ShoppingCart size={20} className="text-gray-700 dark:text-gray-300" />
              </Badge>
            </Button>

            {/* User Menu */}
            {user ? (
              <Dropdown placement="bottom-end">
                <DropdownTrigger>
                  <Button variant="light" className="p-0 min-w-0" aria-label="User menu">
                    <UserAvatar user={user} />
                  </Button>
                </DropdownTrigger>
                <DropdownMenu aria-label="User menu">
                  <DropdownItem key="dashboard" as={Link} href="/dashboard">
                    Dashboard
                  </DropdownItem>
                  <DropdownItem key="orders" as={Link} href="/orders">
                    My Orders
                  </DropdownItem>
                  <DropdownItem key="profile" as={Link} href="/profile">
                    Profile
                  </DropdownItem>
                  {userRole === 'admin' && (
                    <DropdownItem 
                      key="admin" 
                      as={Link} 
                      href="/admin"
                      startContent={<Shield size={16} />}
                      className="text-blue-600 dark:text-blue-400"
                    >
                      Admin Panel
                    </DropdownItem>
                  )}
                  {userRole === 'shop' && (
                    <DropdownItem 
                      key="shop" 
                      as={Link} 
                      href="/admin/products"
                      startContent={<Package size={16} />}
                      className="text-green-600 dark:text-green-400"
                    >
                      Shop Manager
                    </DropdownItem>
                  )}
                  <DropdownItem 
                    key="logout" 
                    color="danger" 
                    onClick={handleLogout}
                    startContent={<LogOut size={16} />}
                  >
                    Sign Out
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
            ) : (
              <div className="hidden md:flex items-center space-x-2">
                <Button
                  as={Link}
                  href="/login"
                  variant="light"
                  size="sm"
                  className="text-gray-700 dark:text-gray-300"
                >
                  Sign In
                </Button>
                <Button
                  as={Link}
                  href="/sign-up"
                  color="primary"
                  size="sm"
                  className="bg-black dark:bg-blue-600 text-white hover:bg-gray-800 dark:hover:bg-blue-700"
                >
                  Sign Up
                </Button>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <Menu size={20} className="text-gray-700 dark:text-gray-300" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 theme-transition">
          <div className="container mx-auto px-4 py-4 space-y-4">
            {/* Mobile Search */}
            <div className="md:hidden">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" size={18} />
                <input
                  type="text"
                  placeholder="Search products..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent theme-transition"
                />
              </div>
            </div>

            {/* Mobile Navigation */}
            <div className="space-y-2">
              {menulist.map((item) => (
                <Link 
                  key={item.id} 
                  href={item.link} 
                  className="block py-2 text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors font-medium"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </div>

            {/* Mobile Auth Links */}
            {!user && (
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-2">
                <Link 
                  href="/login" 
                  className="block py-2 text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Sign In
                </Link>
                <Link 
                  href="/sign-up" 
                  className="block py-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors font-medium"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile User Menu */}
            {user && (
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-2">
                <Link 
                  href="/dashboard" 
                  className="block py-2 text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <Link 
                  href="/orders" 
                  className="block py-2 text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  My Orders
                </Link>
                <Link 
                  href="/profile" 
                  className="block py-2 text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Profile
                </Link>
                {userRole === 'admin' && (
                  <Link 
                    href="/admin" 
                    className="block py-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors font-medium"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Admin Panel
                  </Link>
                )}
                {userRole === 'shop' && (
                  <Link 
                    href="/admin/products" 
                    className="block py-2 text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 transition-colors font-medium"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Shop Manager
                  </Link>
                )}
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="block w-full text-left py-2 text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 transition-colors"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}