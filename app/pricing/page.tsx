'use client';

import { useState } from 'react';
import { Button, Card, CardBody, CardHeader, Chip } from '@heroui/react';
import { Check, Loader2 } from 'lucide-react';
import { stripeProducts } from '@/src/stripe-config';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import Header from '../components/Header';
import { Providers } from '../providers';

function PricingContent() {
  const [loadingPriceId, setLoadingPriceId] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const handleCheckout = async (priceId: string, mode: 'payment' | 'subscription') => {
    setLoadingPriceId(priceId);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error('Please sign in to continue');
        router.push('/login');
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error('Please sign in to continue');
        router.push('/login');
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/stripe-checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          price_id: priceId,
          success_url: `${window.location.origin}/success`,
          cancel_url: `${window.location.origin}/pricing`,
          mode,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error: any) {
      console.error('Checkout error:', error);
      toast.error(error.message || 'Failed to start checkout process');
    } finally {
      setLoadingPriceId(null);
    }
  };

  return (
    <div>
      <Header />
      <main className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Choose Your Plan</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Select the perfect plan for your needs. All plans include our core features with different levels of access.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {stripeProducts.map((product) => (
            <Card key={product.priceId} className="shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="pb-3">
                <div className="text-center">
                  <h3 className="text-2xl font-bold mb-2">{product.name}</h3>
                  <p className="text-gray-600">{product.description}</p>
                  {product.mode === 'subscription' && (
                    <Chip color="primary" size="sm" className="mt-2">
                      Subscription
                    </Chip>
                  )}
                </div>
              </CardHeader>
              <CardBody className="pt-0">
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold">
                      NPR 0.00
                      {product.mode === 'subscription' && (
                        <span className="text-lg font-normal text-gray-600">/month</span>
                      )}
                    </div>
                  </div>

                  <ul className="space-y-3">
                    <li className="flex items-center gap-2">
                      <Check className="w-5 h-5 text-green-500" />
                      <span>Premium access</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-5 h-5 text-green-500" />
                      <span>24/7 support</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-5 h-5 text-green-500" />
                      <span>Advanced features</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-5 h-5 text-green-500" />
                      <span>Priority updates</span>
                    </li>
                  </ul>

                  <Button
                    color="primary"
                    size="lg"
                    className="w-full"
                    onClick={() => handleCheckout(product.priceId, product.mode)}
                    isLoading={loadingPriceId === product.priceId}
                    isDisabled={loadingPriceId !== null}
                  >
                    {loadingPriceId === product.priceId ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Processing...
                      </>
                    ) : (
                      `Get ${product.name}`
                    )}
                  </Button>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-600">
            All plans come with a 30-day money-back guarantee. 
            <br />
            Need help choosing? <a href="/contact" className="text-blue-600 hover:underline">Contact our team</a>
          </p>
        </div>
      </main>
    </div>
  );
}

export default function PricingPage() {
  return (
    <Providers>
      <PricingContent />
    </Providers>
  );
}