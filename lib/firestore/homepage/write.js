"use client";

import { db, auth } from "../firebase";
import { doc, setDoc, serverTimestamp, collection, addDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

export async function saveHomepageSettings(settings) {
  if (!db) {
    throw new Error("Firebase not initialized");
  }

  return new Promise((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      unsubscribe();
      
      if (!user) {
        reject(new Error("User not authenticated"));
        return;
      }

      try {
        const settingsRef = doc(db, "settings", "homepage");
        
        const updateData = {
          ...settings,
          lastUpdated: new Date().toISOString(),
          timestampUpdate: serverTimestamp(),
          version: settings.version || "1.0.0",
          updatedBy: user.uid
        };
        
        await setDoc(settingsRef, updateData, { merge: true });
        
        resolve({ success: true, timestamp: updateData.lastUpdated });
      } catch (error) {
        console.error("Error saving settings:", error);
        const errorMessage = error?.message || String(error) || 'Unknown error';
        reject(new Error(`Failed to save settings: ${errorMessage}`));
      }
    });
  });
}

export async function updateSectionSettings(sectionName, sectionData) {
  if (!db) {
    throw new Error("Firebase not initialized");
  }

  // Wait for auth state to be ready
  return new Promise((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      unsubscribe();
      
      console.log("Auth state:", user ? { uid: user.uid, email: user.email } : "Not authenticated");
      
      if (!user) {
        reject(new Error("User not authenticated. Please log in first."));
        return;
      }

      try {
        const settingsRef = doc(db, "settings", "homepage");
        
        const updateData = {
          [sectionName]: sectionData,
          lastUpdated: new Date().toISOString(),
          timestampUpdate: serverTimestamp(),
          updatedBy: user.uid
        };
        
        console.log(`Updating ${sectionName}:`, updateData);
        await setDoc(settingsRef, updateData, { merge: true });
        
        resolve({ success: true, section: sectionName, timestamp: updateData.lastUpdated });
      } catch (error) {
        console.error(`Error updating ${sectionName}:`, error);
        console.error('Error type:', typeof error);
        console.error('Error string:', String(error));
        
        const errorMessage = error?.message || error?.code || String(error) || 'Unknown error';
        
        if (errorMessage.includes('permission') || errorMessage.includes('denied')) {
          reject(new Error(`Permission denied. Deploy Firestore rules from firestore-temp-rules.txt`));
        } else {
          reject(new Error(`Failed to update ${sectionName}: ${errorMessage}`));
        }
      }
    });
  });
}

export async function updateSectionOrder(newOrder) {
  return updateSectionSettings("sectionOrder", newOrder);
}

export async function toggleSection(sectionName, enabled) {
  const sectionKey = `${sectionName}Section`;
  return updateSectionSettings(sectionKey, { enabled });
}