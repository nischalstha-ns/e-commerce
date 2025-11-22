import { db } from "../firebase";
import { doc, updateDoc, setDoc, serverTimestamp } from "firebase/firestore";

export const updateShopProfile = async ({ userId, data }) => {
  if (!db) throw new Error("Firebase not initialized");
  if (!userId) throw new Error("User ID required");

  try {
    const shopRef = doc(db, "shops", userId);
    await setDoc(shopRef, {
      ...data,
      timestampUpdate: serverTimestamp()
    }, { merge: true });
    return { success: true };
  } catch (error) {
    throw error;
  }
};

export const updateShopSettings = async ({ userId, settings }) => {
  if (!db) throw new Error("Firebase not initialized");
  
  try {
    const shopRef = doc(db, "shops", userId);
    await updateDoc(shopRef, {
      settings,
      timestampUpdate: serverTimestamp()
    });
    return { success: true };
  } catch (error) {
    throw error;
  }
};
