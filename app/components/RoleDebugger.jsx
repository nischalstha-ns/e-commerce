'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Card, CardBody, Button, Input } from '@heroui/react';
import { useState } from 'react';
import { setUserAsAdmin, setUserAsCustomer, getCurrentUserRole } from '@/lib/auth/setAdminRole';
import toast from 'react-hot-toast';

export default function RoleDebugger() {
  const { user, userRole, isLoading } = useAuth();
  const [targetUserId, setTargetUserId] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const handleSetAdmin = async () => {
    if (!targetUserId.trim()) {
      toast.error('Please enter a user ID');
      return;
    }

    setIsUpdating(true);
    try {
      await setUserAsAdmin(targetUserId.trim());
      toast.success('User role updated to admin');
    } catch (error) {
      toast.error('Failed to update role: ' + error.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSetCustomer = async () => {
    if (!targetUserId.trim()) {
      toast.error('Please enter a user ID');
      return;
    }

    setIsUpdating(true);
    try {
      await setUserAsCustomer(targetUserId.trim());
      toast.success('User role updated to customer');
    } catch (error) {
      toast.error('Failed to update role: ' + error.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCheckRole = async () => {
    if (!targetUserId.trim()) {
      toast.error('Please enter a user ID');
      return;
    }

    try {
      const role = await getCurrentUserRole(targetUserId.trim());
      toast.success(`User role: ${role || 'Not found'}`);
    } catch (error) {
      toast.error('Failed to check role: ' + error.message);
    }
  };

  const handleSetCurrentUserAsAdmin = async () => {
    if (!user?.uid) {
      toast.error('No user logged in');
      return;
    }

    setIsUpdating(true);
    try {
      await setUserAsAdmin(user.uid);
      toast.success('Your role updated to admin. Please refresh the page.');
    } catch (error) {
      toast.error('Failed to update role: ' + error.message);
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Card className="max-w-md mx-auto mt-8">
      <CardBody className="space-y-4">
        <h3 className="text-lg font-semibold">Role Debugger</h3>
        
        <div className="space-y-2">
          <p><strong>Current User:</strong> {user?.email || 'Not logged in'}</p>
          <p><strong>User ID:</strong> {user?.uid || 'N/A'}</p>
          <p><strong>Current Role:</strong> {userRole || 'Loading...'}</p>
        </div>

        <div className="space-y-3">
          <Button 
            color="primary" 
            onClick={handleSetCurrentUserAsAdmin}
            isLoading={isUpdating}
            isDisabled={!user}
            className="w-full"
          >
            Set Current User as Admin
          </Button>

          <Input
            label="Target User ID"
            placeholder="Enter user ID to modify"
            value={targetUserId}
            onChange={(e) => setTargetUserId(e.target.value)}
          />

          <div className="flex gap-2">
            <Button 
              color="success" 
              onClick={handleSetAdmin}
              isLoading={isUpdating}
              size="sm"
            >
              Set Admin
            </Button>
            <Button 
              color="warning" 
              onClick={handleSetCustomer}
              isLoading={isUpdating}
              size="sm"
            >
              Set Customer
            </Button>
            <Button 
              color="default" 
              onClick={handleCheckRole}
              size="sm"
            >
              Check Role
            </Button>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}