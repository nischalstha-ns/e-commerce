import { db, auth, storage } from "../firebase";
import { doc, setDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { updateProfile, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export const updateUserProfile = async ({ uid, displayName, phone, address, bio }) => {
    if (!db || !auth) {
        throw new Error("Firebase is not initialized. Please check your configuration.");
    }
    
    if (!uid) {
        throw new Error("User ID is required");
    }

    try {
        const userRef = doc(db, "users", uid);
        
        // Update Firestore document
        await updateDoc(userRef, {
            displayName,
            phone,
            address,
            bio,
            timestampUpdate: serverTimestamp()
        });

        // Update Firebase Auth profile if displayName changed
        if (displayName && auth.currentUser) {
            await updateProfile(auth.currentUser, {
                displayName
            });
        }

        return { success: true };
    } catch (error) {
        console.error("Error updating user profile:", error);
        throw error;
    }
};

export const updateUserPreferences = async ({ uid, preferences }) => {
    if (!db) {
        throw new Error("Firebase is not initialized. Please check your configuration.");
    }
    
    if (!uid) {
        throw new Error("User ID is required");
    }

    try {
        const userRef = doc(db, "users", uid);
        
        await updateDoc(userRef, {
            preferences,
            timestampUpdate: serverTimestamp()
        });

        return { success: true };
    } catch (error) {
        console.error("Error updating user preferences:", error);
        throw error;
    }
};

export const updateUserPhoto = async ({ uid, photoFile }) => {
    if (!db || !auth || !storage) {
        throw new Error("Firebase is not initialized. Please check your configuration.");
    }
    
    if (!uid) {
        throw new Error("User ID is required");
    }
    if (!photoFile) {
        throw new Error("Photo file is required");
    }

    try {
        // Upload photo to Firebase Storage
        const photoRef = ref(storage, `users/${uid}/profile-photo`);
        const snapshot = await uploadBytes(photoRef, photoFile);
        const photoURL = await getDownloadURL(snapshot.ref);

        // Update Firestore document
        const userRef = doc(db, "users", uid);
        await updateDoc(userRef, {
            photoURL,
            timestampUpdate: serverTimestamp()
        });

        // Update Firebase Auth profile
        if (auth.currentUser) {
            await updateProfile(auth.currentUser, {
                photoURL
            });
        }

        return { photoURL };
    } catch (error) {
        console.error("Error updating user photo:", error);
        throw error;
    }
};

export const changeUserPassword = async ({ currentPassword, newPassword }) => {
    if (!auth) {
        throw new Error("Firebase is not initialized. Please check your configuration.");
    }
    
    if (!currentPassword) {
        throw new Error("Current password is required");
    }
    if (!newPassword) {
        throw new Error("New password is required");
    }

    try {
        const user = auth.currentUser;
        if (!user || !user.email) {
            throw new Error("No authenticated user found");
        }

        // Re-authenticate user with current password
        const credential = EmailAuthProvider.credential(user.email, currentPassword);
        await reauthenticateWithCredential(user, credential);

        // Update password
        await updatePassword(user, newPassword);

        return { success: true };
    } catch (error) {
        console.error("Error changing password:", error);
        if (error.code === "auth/wrong-password") {
            throw new Error("Current password is incorrect");
        }
        throw error;
    }
};

export const enableTwoFactorAuth = async ({ uid, phoneNumber }) => {
    if (!db) {
        throw new Error("Firebase is not initialized. Please check your configuration.");
    }
    
    if (!uid) {
        throw new Error("User ID is required");
    }
    if (!phoneNumber) {
        throw new Error("Phone number is required");
    }

    try {
        const userRef = doc(db, "users", uid);
        
        await updateDoc(userRef, {
            twoFactorAuth: {
                enabled: true,
                phoneNumber,
                enabledAt: serverTimestamp()
            },
            timestampUpdate: serverTimestamp()
        });

        return { success: true };
    } catch (error) {
        console.error("Error enabling 2FA:", error);
        throw error;
    }
};

export const disableTwoFactorAuth = async ({ uid }) => {
    if (!db) {
        throw new Error("Firebase is not initialized. Please check your configuration.");
    }
    
    if (!uid) {
        throw new Error("User ID is required");
    }

    try {
        const userRef = doc(db, "users", uid);
        
        await updateDoc(userRef, {
            twoFactorAuth: {
                enabled: false,
                phoneNumber: null,
                enabledAt: null,
                disabledAt: serverTimestamp()
            },
            timestampUpdate: serverTimestamp()
        });

        return { success: true };
    } catch (error) {
        console.error("Error disabling 2FA:", error);
        throw error;
    }
};