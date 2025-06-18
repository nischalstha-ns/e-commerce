'use client';

import { useEffect, useState } from 'react';
import { Card, CardBody, CircularProgress } from '@heroui/react';
import { CheckCircle, Package, CreditCard } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import Header from '../components/Header';
import { Providers } from '../providers';

interface SubscriptionData {
  subscription_status: string;
  price_id: string;
  current_period_start: number;
  current_period_end: number;
  cancel_at_period_end: boolean;
}

function SuccessContent() {
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        const { data, error } = await supabase
          .from('stripe_user_subscriptions')
          .select('*')
          .maybeSingle();

        if (error) {
          console.error('Error fetching subscription:', error);
        } else if (data) {
          setSubscription(data);
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscription();
  }, [supabase]);

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div>
      <Header />
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <Card className="shadow-lg">
            <CardBody className="p-8 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Payment Successful!
              </h1>
              
              <p className="text-lg text-gray-600 mb-8">
                Thank you for your purchase. Your payment has been processed successfully.
              </p>

              {loading ? (
                <div className="flex justify-center">
                  <CircularProgress size="sm" />
                </div>
              ) : subscription ? (
                <div className="bg-gray-50 rounded-lg p-6 mb-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Package className="w-5 h-5 text-blue-600" />
                    <h3 className="text-lg font-semibold">Subscription Details</h3>
                  </div>
                  
                  <div className="space-y-3 text-left">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span className="font-medium capitalize">{subscription.subscription_status}</span>
                    </div>
                    
                    {subscription.current_period_start && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Current Period:</span>
                        <span className="font-medium">
                          {formatDate(subscription.current_period_start)} - {formatDate(subscription.current_period_end)}
                        </span>
                      </div>
                    )}
                    
                    <div className="flex justify-between">
                      <span className="text-gray-600">Auto-renewal:</span>
                      <span className="font-medium">
                        {subscription.cancel_at_period_end ? 'Disabled' : 'Enabled'}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-blue-50 rounded-lg p-6 mb-6">
                  <div className="flex items-center gap-3 mb-2">
                    <CreditCard className="w-5 h-5 text-blue-600" />
                    <h3 className="text-lg font-semibold">One-time Purchase</h3>
                  </div>
                  <p className="text-gray-600">
                    Your one-time payment has been processed successfully.
                  </p>
                </div>
              )}

              <div className="space-y-4">
                <a
                  href="/dashboard"
                  className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Go to Dashboard
                </a>
                
                <div className="text-sm text-gray-500">
                  <p>
                    You will receive a confirmation email shortly. If you have any questions, 
                    please <a href="/contact" className="text-blue-600 hover:underline">contact our support team</a>.
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </main>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Providers>
      <SuccessContent />
    </Providers>
  );
}