'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { auth, db } from '@/lib/firestore/firebase';
import { onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

const AuthContext = createContext({
  user: null,
  userRole: null,
  isLoading: true,
  signOut: async () => {},
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const handleUserRole = useCallback(async (firebaseUser) => {
    if (!firebaseUser || !db) {
      return 'customer';
    }
    
    try {
      const userRef = doc(db, 'users', firebaseUser.uid);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        const newUserData = {
          email: firebaseUser.email,
          displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0],
          photoURL: firebaseUser.photoURL,
          role: 'customer',
          timestampCreate: serverTimestamp(),
          timestampUpdate: serverTimestamp()
        };
        await setDoc(userRef, newUserData);
        return 'customer';
      }
      
      const userData = userDoc.data();
      const role = userData?.role || 'customer';
      
      // Structured logging for monitoring
      if (process.env.NODE_ENV === 'development') {
        console.info('User role resolved', { uid: firebaseUser.uid, role });
      }
      
      return role;
    } catch (error) {
      // Structured error logging
      const errorInfo = {
        uid: firebaseUser.uid,
        error: error.message,
        timestamp: new Date().toISOString()
      };
      
      if (process.env.NODE_ENV === 'development') {
        console.error('User role handling failed:', errorInfo);
      }
      
      return 'customer';
    }
  }, []);

  useEffect(() => {
    if (!auth) {
      setIsLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      
      if (firebaseUser) {
        try {
          const role = await handleUserRole(firebaseUser);
          setUserRole(role);
        } catch (error) {
          if (process.env.NODE_ENV === 'development') {
            console.error('Failed to get user role:', error);
          }
          setUserRole('customer');
        }
      } else {
        setUserRole(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [handleUserRole]);

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, userRole, isLoading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthProvider;