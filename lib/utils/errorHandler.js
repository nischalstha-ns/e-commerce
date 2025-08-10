import toast from 'react-hot-toast';

export const handleFirebaseError = (error) => {
  console.error('Firebase Error:', error);
  
  const errorMessages = {
    'permission-denied': 'You do not have permission to perform this action',
    'not-found': 'The requested resource was not found',
    'already-exists': 'This resource already exists',
    'unauthenticated': 'Please log in to continue',
    'unavailable': 'Service is temporarily unavailable',
    'deadline-exceeded': 'Request timed out, please try again',
  };

  const message = errorMessages[error.code] || error.message || 'An unexpected error occurred';
  toast.error(message);
  return message;
};

export const withErrorHandling = (asyncFn) => {
  return async (...args) => {
    try {
      return await asyncFn(...args);
    } catch (error) {
      handleFirebaseError(error);
      throw error;
    }
  };
};