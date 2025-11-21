'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { auth, db } from '@/lib/firestore/firebase';
import { onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';

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
    if (!firebaseUser || !db) return 'customer';
    
    try {
      const userRef = doc(db, 'users', firebaseUser.uid);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) return 'customer';
      
      const role = userDoc.data()?.role || 'customer';
      const validRoles = ['admin', 'shop', 'customer'];
      return validRoles.includes(role) ? role : 'customer';
    } catch (error) {
      console.error('Role fetch error:', error);
      return 'customer';
    }
  }, []);

  useEffect(() => {
    if (!auth) {
      setIsLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        setUser(firebaseUser);
        
        if (firebaseUser) {
          const role = await handleUserRole(firebaseUser);
          setUserRole(role);
        } else {
          setUserRole(null);
        }
      } catch (error) {
        setUserRole('customer');
      } finally {
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, [handleUserRole]);

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (error) {
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