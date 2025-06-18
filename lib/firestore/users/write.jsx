import { db, auth } from "@/lib/firestore/firebase";
import { doc, setDoc, updateDoc, getDoc, Timestamp } from "firebase/firestore";
import { updateProfile, updatePassword, updateEmail, reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth";

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

export const updateUserProfile = async ({ uid, displayName, phone, address, bio }) => {
    if (!db) {
        throw new Error("Firebase is not initialized. Please check your configuration.");
    }
    
    if (!uid) {
        throw new Error("User ID is required");
    }

    try {
        const userRef = doc(db, `users/${uid}`);
        const updateData = {
            timestampUpdate: Timestamp.now(),
        };

        if (displayName !== undefined) updateData.displayName = displayName;
        if (phone !== undefined) updateData.phone = phone;
        if (address !== undefined) updateData.address = address;
        if (bio !== undefined) updateData.bio = bio;

        await updateDoc(userRef, updateData);

        // Also update Firebase Auth profile if displayName is provided
        if (displayName !== undefined && auth.currentUser) {
            await updateProfile(auth.currentUser, { displayName });
        }

        return { success: true };
    } catch (error) {
        console.error("Error updating user profile:", error);
        throw error;
    }
};

export const updateUserPhoto = async ({ uid, photoFile }) => {
    if (!db) {
        throw new Error("Firebase is not initialized. Please check your configuration.");
    }
    
    if (!uid) {
        throw new Error("User ID is required");
    }
    if (!photoFile) {
        throw new Error("Photo file is required");
    }

    try {
        // Upload image to Cloudinary
        const formData = new FormData();
        formData.append("file", photoFile);
        formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET);
        formData.append("folder", "user-profiles");

        const cloudinaryResponse = await fetch(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`, {
            method: "POST",
            body: formData,
        });

        if (!cloudinaryResponse.ok) {
            const errorText = await cloudinaryResponse.text();
            throw new Error(`Failed to upload image to Cloudinary: ${errorText}`);
        }

        const cloudinaryData = await cloudinaryResponse.json();
        const photoURL = cloudinaryData.secure_url;

        // Update Firestore
        const userRef = doc(db, `users/${uid}`);
        await updateDoc(userRef, {
            photoURL,
            timestampUpdate: Timestamp.now(),
        });

        // Update Firebase Auth profile
        if (auth.currentUser) {
            await updateProfile(auth.currentUser, { photoURL });
        }

        return { photoURL };
    } catch (error) {
        console.error("Error updating user photo:", error);
        throw error;
    }
};

export const changeUserPassword = async ({ currentPassword, newPassword }) => {
    if (!auth.currentUser) {
        throw new Error("User not authenticated");
    }

    if (!currentPassword) {
        throw new Error("Current password is required");
    }
    if (!newPassword) {
        throw new Error("New password is required");
    }
    if (newPassword.length < 6) {
        throw new Error("New password must be at least 6 characters");
    }

    try {
        // Re-authenticate user with current password
        const credential = EmailAuthProvider.credential(
            auth.currentUser.email,
            currentPassword
        );
        await reauthenticateWithCredential(auth.currentUser, credential);

        // Update password
        await updatePassword(auth.currentUser, newPassword);

        return { success: true };
    } catch (error) {
        console.error("Error changing password:", error);
        if (error.code === "auth/wrong-password") {
            throw new Error("Current password is incorrect");
        }
        throw error;
    }
};

export const updateUserEmail = async ({ currentPassword, newEmail }) => {
    if (!auth.currentUser) {
        throw new Error("User not authenticated");
    }

    if (!currentPassword) {
        throw new Error("Current password is required");
    }
    if (!newEmail) {
        throw new Error("New email is required");
    }

    try {
        // Re-authenticate user with current password
        const credential = EmailAuthProvider.credential(
            auth.currentUser.email,
            currentPassword
        );
        await reauthenticateWithCredential(auth.currentUser, credential);

        // Update email
        await updateEmail(auth.currentUser, newEmail);

        // Update Firestore
        const userRef = doc(db, `users/${auth.currentUser.uid}`);
        await updateDoc(userRef, {
            email: newEmail,
            timestampUpdate: Timestamp.now(),
        });

        return { success: true };
    } catch (error) {
        console.error("Error updating email:", error);
        if (error.code === "auth/email-already-in-use") {
            throw new Error("This email is already in use");
        }
        if (error.code === "auth/wrong-password") {
            throw new Error("Current password is incorrect");
        }
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
        const userRef = doc(db, `users/${uid}`);
        await updateDoc(userRef, {
            preferences: {
                emailNotifications: preferences.emailNotifications || false,
                marketingEmails: preferences.marketingEmails || false,
                smsNotifications: preferences.smsNotifications || false,
                ...preferences
            },
            timestampUpdate: Timestamp.now(),
        });

        return { success: true };
    } catch (error) {
        console.error("Error updating user preferences:", error);
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
        throw new Error("Phone number is required for 2FA");
    }

    try {
        const userRef = doc(db, `users/${uid}`);
        await updateDoc(userRef, {
            twoFactorAuth: {
                enabled: true,
                phoneNumber,
                enabledAt: Timestamp.now(),
            },
            timestampUpdate: Timestamp.now(),
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
        const userRef = doc(db, `users/${uid}`);
        await updateDoc(userRef, {
            twoFactorAuth: {
                enabled: false,
                disabledAt: Timestamp.now(),
            },
            timestampUpdate: Timestamp.now(),
        });

        return { success: true };
    } catch (error) {
        console.error("Error disabling 2FA:", error);
        throw error;
    }
};