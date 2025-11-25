'use client';

import { useFeatureAccess } from '@/lib/saas/hooks';
import { useRouter } from 'next/navigation';

interface UpgradePromptProps {
  feature: 'products' | 'orders' | 'users';
  children: React.ReactNode;
}

export default function UpgradePrompt({ feature, children }: UpgradePromptProps) {
  const { canAccess, limitReached, usage, limit } = useFeatureAccess(feature);
  const router = useRouter();

  if (canAccess) {
    return <>{children}</>;
  }

  if (limitReached) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
        <h3 className="text-xl font-bold text-yellow-800 mb-2">
          {feature.charAt(0).toUpperCase() + feature.slice(1)} Limit Reached
        </h3>
        <p className="text-yellow-700 mb-4">
          You've reached your plan limit of {limit} {feature}. 
          Current usage: {usage}/{limit}
        </p>
        <button
          onClick={() => router.push('/billing')}
          className="bg-yellow-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-yellow-700"
        >
          Upgrade Plan
        </button>
      </div>
    );
  }

  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
      <h3 className="text-xl font-bold text-red-800 mb-2">Account Suspended</h3>
      <p className="text-red-700 mb-4">
        Your account is currently suspended. Please contact support or update your billing.
      </p>
      <button
        onClick={() => router.push('/billing')}
        className="bg-red-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-red-700"
      >
        Manage Billing
      </button>
    </div>
  );
}
