'use client';

import { useEffect, useState } from 'react';
import { Card, CardBody, CircularProgress } from '@heroui/react';
import { CheckCircle, Package, CreditCard } from 'lucide-react';
import Header from '../components/Header';
import { Providers } from '../providers';

function SuccessContent() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading for UI consistency
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

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