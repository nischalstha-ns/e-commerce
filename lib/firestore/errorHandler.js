"use client";

export function handleFirestoreError(error, fallbackData = null) {
  console.error('Firestore error:', {
    code: error.code,
    message: error.message,
    timestamp: new Date().toISOString()
  });

  // Handle specific error codes
  switch (error.code) {
    case 'permission-denied':
      console.warn('Permission denied - user may not be authenticated or lacks required role');
      return fallbackData;
    
    case 'unavailable':
      console.warn('Firestore temporarily unavailable');
      return fallbackData;
    
    case 'unauthenticated':
      console.warn('User not authenticated');
      return fallbackData;
    
    case 'failed-precondition':
      console.warn('Firestore operation failed precondition');
      return fallbackData;
    
    default:
      console.error('Unhandled Firestore error:', error.code);
      return fallbackData;
  }
}

export function createSafeSnapshot(query, onSuccess, onError = null, fallbackData = null) {
  return (snapshot) => {
    try {
      onSuccess(snapshot);
    } catch (error) {
      const safeData = handleFirestoreError(error, fallbackData);
      if (onError) {
        onError(safeData);
      }
    }
  };
}

export function createSafeErrorHandler(onError, fallbackData = null) {
  return (error) => {
    const safeData = handleFirestoreError(error, fallbackData);
    onError(safeData);
  };
}