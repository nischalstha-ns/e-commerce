import { useState, useEffect } from 'react';

export function useOfflineSync() {
  const [isOnline, setIsOnline] = useState(true);
  const [pendingActions, setPendingActions] = useState([]);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Sync pending actions
      if (pendingActions.length > 0) {
        syncPendingActions();
      }
    };

    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [pendingActions]);

  const addPendingAction = (action) => {
    setPendingActions(prev => [...prev, { ...action, timestamp: Date.now() }]);
  };

  const syncPendingActions = async () => {
    for (const action of pendingActions) {
      try {
        await action.execute();
      } catch (error) {
        console.error('Failed to sync action:', error);
      }
    }
    setPendingActions([]);
  };

  return { isOnline, addPendingAction, pendingActions: pendingActions.length };
}