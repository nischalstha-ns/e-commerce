"use client";

import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firestore/firebase';

export const useUserActivity = () => {
  const { user } = useAuth();

  const logActivity = async (type, description, metadata = {}) => {
    if (!user || !db) return;

    try {
      await addDoc(collection(db, 'userActivities'), {
        userId: user.uid,
        type,
        description,
        metadata,
        timestamp: serverTimestamp(),
        ipAddress: await getClientIP(),
        userAgent: navigator.userAgent,
        url: window.location.href
      });
    } catch (error) {
      console.error('Failed to log activity:', error);
    }
  };

  const getClientIP = async () => {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch {
      return 'Unknown';
    }
  };

  useEffect(() => {
    if (user) {
      logActivity('page_visit', `Visited ${window.location.pathname}`);
    }
  }, [user]);

  return { logActivity };
};