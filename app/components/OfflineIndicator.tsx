'use client';

import { useState, useEffect } from 'react';
import { Chip } from '@heroui/react';
import { WifiOff, Wifi } from 'lucide-react';

export default function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(true);
  const [showIndicator, setShowIndicator] = useState(false);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    const handleOnline = () => {
      setIsOnline(true);
      setShowIndicator(true);
      timeoutId = setTimeout(() => setShowIndicator(false), 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowIndicator(true);
      if (timeoutId) clearTimeout(timeoutId);
    };

    try {
      setIsOnline(navigator?.onLine ?? true);
    } catch (error) {
      setIsOnline(true);
    }

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  if (!showIndicator && isOnline) return null;

  return (
    <div className="fixed top-20 right-4 z-50">
      <Chip
        startContent={isOnline ? <Wifi size={16} /> : <WifiOff size={16} />}
        color={isOnline ? 'success' : 'warning'}
        variant="flat"
      >
        {isOnline ? 'Back online' : 'Offline mode'}
      </Chip>
    </div>
  );
}