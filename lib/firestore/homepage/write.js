import { db } from "../firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

export const saveHomepageSettings = async (settings) => {
    if (!db) {
        throw new Error("Firebase is not initialized");
    }

    try {
        const homepageRef = doc(db, "settings", "homepage");
        
        await setDoc(homepageRef, {
            ...settings,
            lastUpdated: serverTimestamp()
        }, { merge: true });

        return { success: true };
    } catch (error) {
        console.error("Error saving homepage settings:", error);
        throw error;
    }
};