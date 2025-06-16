import { db } from "@/lib/firestore/firebase";
import { doc, setDoc, updateDoc, getDoc, Timestamp } from "firebase/firestore";

export const createOrUpdateUser = async ({ uid, email, displayName, photoURL, role = "user" }) => {
    if (!uid) {
        throw new Error("User ID is required");
    }

    const userRef = doc(db, `users/${uid}`);
    const userSnapshot = await getDoc(userRef);

    const userData = {
        email,
        displayName,
        photoURL,
        timestampUpdate: Timestamp.now(),
    };

    if (userSnapshot.exists()) {
        // Update existing user - PRESERVE existing role if it exists
        const existingData = userSnapshot.data();
        if (!existingData.role) {
            // Only set role to "user" if no role exists
            userData.role = role;
        }
        // Don't overwrite existing role - this preserves admin status
        await updateDoc(userRef, userData);
    } else {
        // Create new user - set default role
        userData.role = role;
        userData.timestampCreate = Timestamp.now();
        await setDoc(userRef, userData);
    }

    return { uid };
};

export const updateUserRole = async ({ uid, role }) => {
    if (!uid) {
        throw new Error("User ID is required");
    }
    if (!role) {
        throw new Error("Role is required");
    }

    const userRef = doc(db, `users/${uid}`);
    const userSnapshot = await getDoc(userRef);

    if (!userSnapshot.exists()) {
        throw new Error("User not found");
    }

    await updateDoc(userRef, {
        role,
        timestampUpdate: Timestamp.now(),
    });

    return { uid, role };
};