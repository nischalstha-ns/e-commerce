import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firestore/firebase';

export async function setUserAsAdmin(userId) {
  try {
    if (!userId || typeof userId !== 'string') {
      throw new Error('Invalid user ID provided');
    }
    
    if (!db) {
      throw new Error('Firebase not initialized');
    }

    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      throw new Error('User document not found');
    }

    await updateDoc(userRef, {
      role: 'admin',
      timestampUpdate: new Date()
    });

    if (process.env.NODE_ENV === 'development') {
      console.info('User role updated to admin', { userId });
    }

    return true;
  } catch (error) {
    const errorInfo = {
      userId,
      error: error.message,
      timestamp: new Date().toISOString()
    };
    
    if (process.env.NODE_ENV === 'development') {
      console.error('Failed to set admin role:', errorInfo);
    }
    
    throw new Error(`Failed to update user role: ${error.message}`);
  }
}

export async function setUserAsCustomer(userId) {
  if (!db) {
    throw new Error('Firebase not initialized');
  }

  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      role: 'customer',
      timestampUpdate: new Date()
    });

    return true;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error setting customer role:', error);
    }
    throw new Error('Failed to update user role');
  }
}

// Helper function to check current user role
export async function getCurrentUserRole(userId) {
  try {
    if (!userId || typeof userId !== 'string') {
      throw new Error('Invalid user ID provided');
    }
    
    if (!db) {
      throw new Error('Firebase not initialized');
    }

    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      return null;
    }

    const role = userDoc.data()?.role || 'customer';
    
    if (process.env.NODE_ENV === 'development') {
      console.info('User role retrieved', { userId, role });
    }
    
    return role;
  } catch (error) {
    const errorInfo = {
      userId,
      error: error.message,
      timestamp: new Date().toISOString()
    };
    
    if (process.env.NODE_ENV === 'development') {
      console.error('Failed to get user role:', errorInfo);
    }
    
    throw new Error(`Failed to get user role: ${error.message}`);
  }
}