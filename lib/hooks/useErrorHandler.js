import { useCallback } from 'react';
import toast from 'react-hot-toast';

export function useErrorHandler() {
  const handleError = useCallback((error, context = '') => {
    if (process.env.NODE_ENV === 'development') {
      console.error(`Error in ${context}:`, error);
    }

    let message = 'Something went wrong';
    
    if (error?.code) {
      switch (error.code) {
        case 'auth/network-request-failed':
          message = 'Network error. Please check your connection.';
          break;
        case 'permission-denied':
          message = 'You don\'t have permission to perform this action.';
          break;
        case 'not-found':
          message = 'The requested resource was not found.';
          break;
        default:
          message = error.message || message;
      }
    } else if (error?.message) {
      message = error.message;
    }

    toast.error(message);
    return message;
  }, []);

  return { handleError };
}