"use client";

import { db } from "../firebase";
import { doc, setDoc, updateDoc, serverTimestamp } from "firebase/firestore";

export async function updateHomepageSettings(settingsData) {
  if (!db) {
    throw new Error("Firebase not initialized");
  }

  try {
    const settingsRef = doc(db, "settings", "homepage");
    await setDoc(settingsRef, {
      ...settingsData,
      timestampUpdate: serverTimestamp()
    }, { merge: true });
  } catch (error) {
    throw new Error(error.message || "Failed to update homepage settings");
  }
}

export async function updateSectionSettings(sectionKey, sectionData) {
  if (!db) {
    throw new Error("Firebase not initialized");
  }

  try {
    const settingsRef = doc(db, "settings", "homepage");
    await updateDoc(settingsRef, {
      [sectionKey]: sectionData,
      timestampUpdate: serverTimestamp()
    });
  } catch (error) {
    throw new Error(error.message || "Failed to update section settings");
  }
}

export async function saveHomepageSettings(settingsData) {
  if (!db) {
    throw new Error("Firebase not initialized");
  }

  try {
    const settingsRef = doc(db, "settings", "homepage");
    await setDoc(settingsRef, {
      ...settingsData,
      timestampUpdate: serverTimestamp()
    }, { merge: true });
  } catch (error) {
    throw new Error(error.message || "Failed to save homepage settings");
  }
}
