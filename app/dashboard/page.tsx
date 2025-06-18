'use client';

import { useEffect, useState } from 'react';
import { Card, CardBody, CardHeader, CircularProgress, Chip } from '@heroui/react';
import { DollarSign, ShoppingCart, TrendingUp, Package, Calendar, CreditCard, Star, User } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { getProductByPriceId } from '@/src/stripe-config';
import Header from '../components/Header';
import { Providers } from '../providers';

interface SubscriptionData {
  subscription_status: string;
  price_id: string;
  current_period_start: number;
  current_period_end: number;
  cancel_at_period_end: boolean;
  payment_method_brand: string;
  payment_method_last4: string;
}

function DashboardContent() {
  const { user, isLoading } = useAuth();
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [subscriptionLoading, setSubscriptionLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    if (user) {
      fetchSubscription();
    }
  }, [user]);

  const fetchSubscription = async () => {
    try {
      const { data, error } = await supabase
        .from('stripe_user_subscriptions')
        .select('*')
        .maybeSingle();

      if (error) {
        console.error('Error fetching subscription:', error);
      } else {
        setSubscription(data);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setSubscriptionLoading(false);
    }
  };

  if (isLoading) {
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

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getSubscriptionProduct = () => {
    if (!subscription?.price_id) return null;
    return getProductByPriceId(subscription.price_id);
  };

  const subscriptionProduct = getSubscriptionProduct();

  return (
    <div>
      <Header />
      <main className="container mx-auto px-4 py-6">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user.user_metadata?.full_name || user.email}!
          </h1>
          <p className="text-gray-600">Here's your account overview and subscription status.</p>
        </div>

        {/* Subscription Status */}
        {subscriptionLoading ? (
          <Card className="shadow-sm mb-8">
            <CardBody className="p-6 text-center">
              <CircularProgress size="sm" />
              <p className="mt-2 text-gray-600">Loading subscription...</p>
            </CardBody>
          </Card>
        ) : subscription ? (
          <Card className="shadow-sm mb-8">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-gray-600" />
                <h3 className="text-lg font-semibold">Active Subscription</h3>
              </div>
            </CardHeader>
            <CardBody className="pt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600 mb-1">
                    {subscriptionProduct?.name || 'Unknown Plan'}
                  </div>
                  <div className="text-sm text-blue-800">Current Plan</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600 mb-1 capitalize">
                    {subscription.subscription_status}
                  </div>
                  <div className="text-sm text-green-800">Status</div>
                </div>
                {subscription.current_period_end && (
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-lg font-bold text-purple-600 mb-1">
                      {formatDate(subscription.current_period_end)}
                    </div>
                    <div className="text-sm text-purple-800">Next Billing</div>
                  </div>
                )}
                {subscription.payment_method_last4 && (
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <div className="text-lg font-bold text-orange-600 mb-1">
                      •••• {subscription.payment_method_last4}
                    </div>
                    <div className="text-sm text-orange-800 capitalize">
                      {subscription.payment_method_brand} Card
                    </div>
                  </div>
                )}
              </div>
              
              {subscription.cancel_at_period_end && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-yellow-800 text-sm">
                    ⚠️ Your subscription will cancel at the end of the current period.
                  </p>
                </div>
              )}
            </CardBody>
          </Card>
        ) : (
          <Card className="shadow-sm mb-8">
            <CardBody className="p-6 text-center">
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">No Active Subscription</h2>
              <p className="text-gray-600 mb-6">Start your journey with one of our plans</p>
              <a 
                href="/pricing"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                View Plans
              </a>
            </CardBody>
          </Card>
        )}

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
                  <p className="text-lg font-bold text-gray-900">
                    {new Date(user.created_at).toLocaleDateString('en-US', { 
                      month: 'short', 
                      year: 'numeric' 
                    })}
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
                    {user.email_confirmed_at ? 'Verified' : 'Pending'}
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
                  <p className="text-lg font-bold text-gray-900">
                    {subscriptionProduct?.name || 'Free'}
                  </p>
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
                  href="/pricing" 
                  className="block p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Package className="w-6 h-6 text-blue-600" />
                    <div>
                      <p className="font-medium text-blue-900">View Plans</p>
                      <p className="text-sm text-blue-700">Explore our subscription options</p>
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
                    <p className="text-xs text-gray-600">{user.email}</p>
                  </div>
                  <Chip 
                    color={user.email_confirmed_at ? "success" : "warning"} 
                    size="sm"
                  >
                    {user.email_confirmed_at ? "Verified" : "Pending"}
                  </Chip>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-sm">Account Created</p>
                    <p className="text-xs text-gray-600">
                      {new Date(user.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-sm">Last Sign In</p>
                    <p className="text-xs text-gray-600">
                      {user.last_sign_in_at 
                        ? new Date(user.last_sign_in_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })
                        : 'Never'
                      }
                    </p>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </main>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Providers>
      <DashboardContent />
    </Providers>
  );
}