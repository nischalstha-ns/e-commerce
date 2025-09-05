"use client";

import { db } from "../firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

export async function saveHomepageSettings(settings) {
  try {
    const settingsRef = doc(db, "settings", "homepage");
    
    await setDoc(settingsRef, {
      ...settings,
      timestampUpdate: serverTimestamp()
    }, { merge: true });
    
    return { success: true };
  } catch (error) {
    console.error("Error saving homepage settings:", error);
    throw error;
  }
}