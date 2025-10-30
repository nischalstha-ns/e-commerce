'use client';

import { useCallback } from 'react';
import { Card, CardBody, CardHeader, CircularProgress, Chip } from '@heroui/react';
import { ShoppingCart, Package, Calendar, Star, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import Header from '../components/Header.jsx';
import RoleDebugger from '../components/RoleDebugger.jsx';

const formatUserDate = (timestamp: string | undefined, format: 'short' | 'long' = 'long') => {
  if (!timestamp) return 'Recently';
  
  try {
    const date = new Date(timestamp);
    return format === 'short' 
      ? date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
      : date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  } catch {
    return 'Recently';
  }
};

function DashboardContent() {
  const { user, isLoading } = useAuth();

  if (isLoading && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <CircularProgress size="lg" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardBody className="text-center p-8">
            <h1 className="text-xl font-bold mb-2">Please Login</h1>
            <p className="text-gray-600">You need to be logged in to view your dashboard.</p>
          </CardBody>
        </Card>
      </div>
    );
  }

  const getAccountStats = useCallback(() => {
    const creationTime = (user as any)?.metadata?.creationTime;
    const lastSignIn = (user as any)?.metadata?.lastSignInTime;
    const emailVerified = (user as any)?.emailVerified;
    
    return {
      memberSince: formatUserDate(creationTime, 'short'),
      lastSignIn: formatUserDate(lastSignIn),
      emailStatus: emailVerified ? 'Verified' : 'Pending',
      emailVerified
    };
  }, [user]);
  
  const stats = getAccountStats();

  return (
    <div>
      <Header />
      <main className="container mx-auto px-4 py-6">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {(user as any)?.displayName || (user as any)?.email}!
          </h1>
          <p className="text-gray-600">Here's your account overview.</p>
        </div>

        {/* No Active Subscription Message */}
        <Card className="shadow-sm mb-8">
          <CardBody className="p-6 text-center">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Welcome to Your Dashboard</h2>
            <p className="text-gray-600 mb-6">Manage your account and explore our products</p>
            <a 
              href="/shop"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Browse Products
            </a>
          </CardBody>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="shadow-sm">
            <CardBody className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Account Status</p>
                  <p className="text-2xl font-bold text-gray-900">Active</p>
                </div>
                <div className="p-3 rounded-full bg-green-100">
                  <User className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardBody>
          </Card>

          <Card className="shadow-sm">
            <CardBody className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Member Since</p>
                  <p className="text-lg font-bold text-gray-900" suppressHydrationWarning>
                    {stats.memberSince}
                  </p>
                </div>
                <div className="p-3 rounded-full bg-blue-100">
                  <Calendar className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardBody>
          </Card>

          <Card className="shadow-sm">
            <CardBody className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Email Status</p>
                  <p className="text-lg font-bold text-gray-900">
                    {stats.emailStatus}
                  </p>
                </div>
                <div className="p-3 rounded-full bg-purple-100">
                  <Star className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardBody>
          </Card>

          <Card className="shadow-sm">
            <CardBody className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Plan Type</p>
                  <p className="text-lg font-bold text-gray-900">Customer</p>
                </div>
                <div className="p-3 rounded-full bg-orange-100">
                  <Package className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <h3 className="text-lg font-semibold">Quick Actions</h3>
            </CardHeader>
            <CardBody className="pt-0">
              <div className="grid grid-cols-1 gap-4">
                <a 
                  href="/shop" 
                  className="block p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Package className="w-6 h-6 text-blue-600" />
                    <div>
                      <p className="font-medium text-blue-900">Browse Products</p>
                      <p className="text-sm text-blue-700">Explore our product catalog</p>
                    </div>
                  </div>
                </a>
                
                <a 
                  href="/profile" 
                  className="block p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <User className="w-6 h-6 text-green-600" />
                    <div>
                      <p className="font-medium text-green-900">Account Settings</p>
                      <p className="text-sm text-green-700">Manage your profile and preferences</p>
                    </div>
                  </div>
                </a>
                
                <a 
                  href="/shop" 
                  className="block p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <ShoppingCart className="w-6 h-6 text-purple-600" />
                    <div>
                      <p className="font-medium text-purple-900">Browse Shop</p>
                      <p className="text-sm text-purple-700">Discover our products</p>
                    </div>
                  </div>
                </a>
              </div>
            </CardBody>
          </Card>

          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <h3 className="text-lg font-semibold">Account Information</h3>
            </CardHeader>
            <CardBody className="pt-0">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-sm">Email Address</p>
                    <p className="text-xs text-gray-600">{(user as any)?.email}</p>
                  </div>
                  <Chip 
                    color={stats.emailVerified ? "success" : "warning"} 
                    size="sm"
                  >
                    {stats.emailStatus}
                  </Chip>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-sm">Account Created</p>
                    <p className="text-xs text-gray-600" suppressHydrationWarning>
                      {formatUserDate((user as any)?.metadata?.creationTime)}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-sm">Last Sign In</p>
                    <p className="text-xs text-gray-600" suppressHydrationWarning>
                      {stats.lastSignIn || 'Never'}
                    </p>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Role Debugger - Development only */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-8">
            <RoleDebugger />
          </div>
        )}
      </main>
    </div>
  );
}

export default function DashboardPage() {
  return <DashboardContent />;
}