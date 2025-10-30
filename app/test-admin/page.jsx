'use client';

import { useAuth } from '@/contexts/AuthContext';
import { usePermissions } from '@/lib/auth/usePermissions';
import { Card, CardBody, Button } from '@heroui/react';
import { useRouter } from 'next/navigation';
import Header from '../components/Header';

export default function TestAdminPage() {
  const { user, userRole, isLoading } = useAuth();
  const { canAccessAdminPanel, isAdmin } = usePermissions();
  const router = useRouter();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <Header />
      <main className="container mx-auto px-4 py-6">
        <Card className="max-w-2xl mx-auto">
          <CardBody className="space-y-4">
            <h1 className="text-2xl font-bold">Admin Access Test</h1>
            
            <div className="space-y-2">
              <p><strong>User:</strong> {user?.email || 'Not logged in'}</p>
              <p><strong>User ID:</strong> {user?.uid || 'N/A'}</p>
              <p><strong>Role:</strong> {userRole || 'Loading...'}</p>
              <p><strong>Can Access Admin:</strong> {canAccessAdminPanel() ? 'Yes' : 'No'}</p>
              <p><strong>Is Admin:</strong> {isAdmin() ? 'Yes' : 'No'}</p>
            </div>

            <div className="flex gap-4">
              <Button 
                color="primary"
                onClick={() => router.push('/admin')}
                isDisabled={!canAccessAdminPanel()}
              >
                Go to Admin Panel
              </Button>
              
              <Button 
                color="default"
                onClick={() => router.push('/dashboard')}
              >
                Go to Dashboard
              </Button>
            </div>

            {!canAccessAdminPanel() && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800">
                  You don't have admin access. Your role is: {userRole || 'unknown'}
                </p>
                <p className="text-red-600 text-sm mt-1">
                  Use the Role Debugger on the dashboard to set yourself as admin.
                </p>
              </div>
            )}
          </CardBody>
        </Card>
      </main>
    </div>
  );
}