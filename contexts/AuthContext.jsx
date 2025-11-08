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
    if (!firebaseUser) {
      return 'customer';
    }

    if (!db) {
      return 'customer';
    }
    
    try {
      // First, verify with server-side validation for admin roles
      const token = await firebaseUser.getIdToken();
      
      // Check server-side role validation for admin users
      try {
        const roleResponse = await fetch('/api/auth/validate-role', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ uid: firebaseUser.uid })
        });
        
        if (roleResponse.ok) {
          const { role } = await roleResponse.json();
          if (role === 'admin') {
            return 'admin';
          }
        }
      } catch (serverError) {
        // Fall back to client-side validation if server is unavailable
      }
      
      // Client-side validation as fallback
      const userRef = doc(db, 'users', firebaseUser.uid);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        const newUserData = {
          email: firebaseUser.email || '',
          displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
          photoURL: firebaseUser.photoURL || null,
          role: 'customer',
          isVerified: false,
          timestampCreate: serverTimestamp(),
          timestampUpdate: serverTimestamp(),
          lastLoginAt: serverTimestamp()
        };
        
        await setDoc(userRef, newUserData);
        return 'customer';
      }
      
      const userData = userDoc.data();
      const role = userData?.role || 'customer';
      
      // Update last login timestamp
      await updateDoc(userRef, {
        lastLoginAt: serverTimestamp(),
        timestampUpdate: serverTimestamp()
      });
      
      return role;
    } catch (error) {
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