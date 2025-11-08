"use client";

import { db, auth } from "../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

export async function testFirebaseConnection() {
  console.log("Testing Firebase connection...");
  
  // Test 1: Check if Firebase is initialized
  if (!db) {
    console.error("❌ Firebase not initialized");
    return { success: false, error: "Firebase not initialized" };
  }
  console.log("✅ Firebase initialized");
  
  // Test 2: Check authentication
  const user = auth.currentUser;
  if (!user) {
    console.error("❌ User not authenticated");
    return { success: false, error: "User not authenticated" };
  }
  console.log("✅ User authenticated:", user.email);
  
  // Test 3: Try to read from settings
  try {
    const settingsRef = doc(db, "settings", "homepage");
    const docSnap = await getDoc(settingsRef);
    console.log("✅ Read access works, doc exists:", docSnap.exists());
  } catch (error) {
    console.error("❌ Read failed:", error);
    return { success: false, error: `Read failed: ${error.message}` };
  }
  
  // Test 4: Try to write to settings
  try {
    const settingsRef = doc(db, "settings", "test");
    await setDoc(settingsRef, { 
      test: true, 
      timestamp: new Date().toISOString(),
      user: user.uid 
    });
    console.log("✅ Write access works");
    return { success: true };
  } catch (error) {
    console.error("❌ Write failed:", error);
    return { success: false, error: `Write failed: ${error.message || String(error)}` };
  }
}