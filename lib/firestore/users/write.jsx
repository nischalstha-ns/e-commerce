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
        role,
        timestampUpdate: Timestamp.now(),
    };

    if (userSnapshot.exists()) {
        // Update existing user
        await updateDoc(userRef, userData);
    } else {
        // Create new user
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