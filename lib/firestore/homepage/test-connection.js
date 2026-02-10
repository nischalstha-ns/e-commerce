import { db } from "../firebase";
import { collection, getDocs, limit, query } from "firebase/firestore";

export async function testFirebaseConnection() {
  try {
    if (!db) {
      throw new Error("Firebase not initialized");
    }
    const q = query(collection(db, "homepage"), limit(1));
    await getDocs(q);
    return { success: true, message: "Firebase connection successful" };
  } catch (error) {
    console.error("Firebase connection test failed:", error);
    return { success: false, message: error.message };
  }
}
