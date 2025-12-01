"use client";

import { db } from "../firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

export async function updateShopProfile(shopData) {
  if (!db) {
    throw new Error("Firebase not initialized");
  }

  try {
    const shopRef = doc(db, "settings", "shop");
    await setDoc(shopRef, {
      ...shopData,
      timestampUpdate: serverTimestamp()
    }, { merge: true });
  } catch (error) {
    throw new Error(error.message || "Failed to update shop profile");
  }
}
