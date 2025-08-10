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
    if (!firebaseUser) return null;
    
    try {
      const userRef = doc(db, 'users', firebaseUser.uid);
      const userDoc = await Promise.race([
        getDoc(userRef),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5000))
      ]);
      
      if (!userDoc.exists()) {
        // Create user document in background, don't wait
        setDoc(userRef, {
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
          role: 'customer',
          timestampCreate: serverTimestamp(),
          timestampUpdate: serverTimestamp()
        }).catch(console.error);
        return 'customer';
      }
      
      return userDoc.data()?.role || 'customer';
    } catch (error) {
      console.error('Error handling user document:', error);
      return 'customer';
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      
      if (firebaseUser) {
        // Set loading to false immediately for better UX
        setIsLoading(false);
        // Get role in background
        const role = await handleUserRole(firebaseUser);
        setUserRole(role);
      } else {
        setUserRole(null);
        setIsLoading(false);
      }
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