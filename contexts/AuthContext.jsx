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

// Cache for user roles to avoid repeated Firestore calls
const roleCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [tenantId, setTenantId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!auth) {
      setIsLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        setUser(firebaseUser);
        
        if (firebaseUser && db) {
          try {
            // Check cache first
            const cached = roleCache.get(firebaseUser.uid);
            if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
              setUserRole(cached.role);
              setTenantId(cached.tenantId);
              setIsLoading(false);
              return;
            }

            const userRef = doc(db, 'users', firebaseUser.uid);
            const userDoc = await getDoc(userRef);
            
            if (userDoc.exists()) {
              const userData = userDoc.data();
              const role = userData?.role || 'customer';
              const validRoles = ['admin', 'shop', 'customer'];
              const finalRole = validRoles.includes(role) ? role : 'customer';
              const finalTenantId = userData?.tenantId || null;
              
              // Cache the result
              roleCache.set(firebaseUser.uid, {
                role: finalRole,
                tenantId: finalTenantId,
                timestamp: Date.now()
              });
              
              setUserRole(finalRole);
              setTenantId(finalTenantId);
            } else {
              setUserRole('customer');
              setTenantId(null);
            }
          } catch (error) {
            console.error('Role fetch error:', error);
            setUserRole('customer');
            setTenantId(null);
          }
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
  }, []);

  const signOut = async () => {
    try {
      if (user?.uid) {
        roleCache.delete(user.uid);
      }
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