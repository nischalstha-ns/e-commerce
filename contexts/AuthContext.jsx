'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { auth, db } from '@/lib/firestore/firebase';
import { onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';

const AuthContext = createContext({
  user: null,
  userRole: null,
  tenantId: null,
  isLoading: true,
  signOut: async () => {},
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [tenantId, setTenantId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const handleUserRole = useCallback(async (firebaseUser) => {
    if (!firebaseUser || !db) return { role: 'customer', tenantId: null };
    
    try {
      const userRef = doc(db, 'users', firebaseUser.uid);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) return { role: 'customer', tenantId: null };
      
      const userData = userDoc.data();
      const role = userData?.role || 'customer';
      const validRoles = ['admin', 'shop', 'customer'];
      return {
        role: validRoles.includes(role) ? role : 'customer',
        tenantId: userData?.tenantId || null
      };
    } catch (error) {
      console.error('Role fetch error:', error);
      return { role: 'customer', tenantId: null };
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
          const { role, tenantId: userTenantId } = await handleUserRole(firebaseUser);
          setUserRole(role);
          setTenantId(userTenantId);
        } else {
          setUserRole(null);
          setTenantId(null);
        }
      } catch (error) {
        setUserRole('customer');
        setTenantId(null);
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
    <AuthContext.Provider value={{ user, userRole, tenantId, isLoading, signOut }}>
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