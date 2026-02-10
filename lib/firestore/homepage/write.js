import { db } from "../firebase";
import { doc, setDoc, updateDoc } from "firebase/firestore";

export async function updateSectionSettings(sectionName, settings) {
  try {
    if (!db) {
      throw new Error("Firebase not initialized");
    }
    
    await updateDoc(doc(db, "homepage", "settings"), {
      [sectionName]: settings
    });
    
    return { success: true };
  } catch (error) {
    console.error("Update section settings error:", error);
    throw error;
  }
}

export async function saveHomepageSettings(settings) {
  try {
    if (!db) {
      throw new Error("Firebase not initialized");
    }
    
    await setDoc(doc(db, "homepage", "settings"), settings, { merge: true });
    
    return { success: true };
  } catch (error) {
    console.error("Save homepage settings error:", error);
    throw error;
  }
}
