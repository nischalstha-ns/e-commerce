"use client";

import { useState, useEffect } from 'react';
import { doc, setDoc, getDoc, collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firestore/firebase';

export const useThemeVersioning = (themeId) => {
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(false);

  const saveVersion = async (theme, versionNote = '') => {
    setLoading(true);
    try {
      const versionId = `${themeId}-v${Date.now()}`;
      await setDoc(doc(db, 'themeVersions', versionId), {
        themeId,
        version: theme.version || '1.0.0',
        data: theme,
        note: versionNote,
        createdAt: new Date().toISOString()
      });
      
      await loadVersions();
      return { success: true };
    } catch (error) {
      console.error('Error saving version:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const loadVersions = async () => {
    try {
      const versionsRef = collection(db, 'themeVersions');
      const q = query(versionsRef, orderBy('createdAt', 'desc'), limit(10));
      const snapshot = await getDocs(q);
      
      const versionList = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        if (data.themeId === themeId) {
          versionList.push({ id: doc.id, ...data });
        }
      });
      
      setVersions(versionList);
    } catch (error) {
      console.error('Error loading versions:', error);
    }
  };

  const rollbackToVersion = async (versionId) => {
    try {
      const versionDoc = await getDoc(doc(db, 'themeVersions', versionId));
      if (versionDoc.exists()) {
        return { success: true, theme: versionDoc.data().data };
      }
      return { success: false, error: 'Version not found' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  useEffect(() => {
    if (themeId) {
      loadVersions();
    }
  }, [themeId]);

  return {
    versions,
    loading,
    saveVersion,
    rollbackToVersion,
    loadVersions
  };
};