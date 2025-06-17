import { db } from "@/lib/firestore/firebase";
import { doc, setDoc, updateDoc, getDoc, Timestamp } from "firebase/firestore";

export const createOrUpdateUser = async ({ uid, email, displayName, photoURL, role = "user" }) => {
    if (!db) {
        throw new Error("Firebase is not initialized. Please check your configuration.");
    }
    
    if (!uid) {
        throw new Error("User ID is required");
    }

    try {
        const userRef = doc(db, `users/${uid}`);
        const userSnapshot = await getDoc(userRef);

        const userData = {
            email,
            displayName,
            photoURL,
            timestampUpdate: Timestamp.now(),
        };

        if (userSnapshot.exists()) {
            // Update existing user - only update role if explicitly provided
            if (role) {
                userData.role = role;
            }
            await updateDoc(userRef, userData);
        } else {
            // Create new user - set provided role or default to "user"
            userData.role = role;
            userData.timestampCreate = Timestamp.now();
            await setDoc(userRef, userData);
        }

        return { uid };
    } catch (error) {
        console.error("Error creating/updating user:", error);
        throw error;
    }
};

// Remove the updateUserRole function as it's no longer needed for security