import { db, auth } from "../firebase";
import { doc, setDoc, updateDoc, deleteDoc, serverTimestamp } from "firebase/firestore";
import { updateProfile, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth";

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

export const updateUserRole = async ({ uid, role }) => {
    if (!db) {
        throw new Error("Firebase is not initialized. Please check your configuration.");
    }
    
    if (!uid) {
        throw new Error("User ID is required");
    }
    
    if (!role) {
        throw new Error("Role is required");
    }

    // Validate role
    const validRoles = ["admin", "customer"];
    if (!validRoles.includes(role)) {
        throw new Error("Invalid role. Must be 'admin' or 'customer'");
    }

    try {
        const userRef = doc(db, "users", uid);
        
        await updateDoc(userRef, {
            role,
            timestampUpdate: serverTimestamp()
        });

        return { success: true };
    } catch (error) {
        console.error("Error updating user role:", error);
        throw error;
    }
};

export const deleteUser = async ({ uid }) => {
    if (!db) {
        throw new Error("Firebase is not initialized. Please check your configuration.");
    }
    
    if (!uid) {
        throw new Error("User ID is required");
    }

    try {
        // Delete user document from Firestore
        await deleteDoc(doc(db, "users", uid));
        
        // Note: Firebase Auth user deletion requires admin SDK or the user to be currently signed in
        // For security reasons, we only delete the Firestore document here
        // The Firebase Auth user will remain but won't have access without the Firestore document
        
        return { success: true };
    } catch (error) {
        console.error("Error deleting user:", error);
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
    if (!db || !auth) {
        throw new Error("Firebase is not initialized. Please check your configuration.");
    }
    
    if (!uid) {
        throw new Error("User ID is required");
    }
    if (!photoFile) {
        throw new Error("Photo file is required");
    }

    // Check environment variables
    if (!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME) {
        throw new Error("Cloudinary cloud name not configured");
    }
    if (!process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET) {
        throw new Error("Cloudinary upload preset not configured");
    }

    try {
        console.log('Starting Cloudinary upload for user:', uid);
        
        // Upload to Cloudinary
        const formData = new FormData();
        formData.append('file', photoFile);
        formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET);
        formData.append('folder', `users/${uid}`);
        
        const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`;
        console.log('Uploading to:', cloudinaryUrl);
        
        const response = await fetch(cloudinaryUrl, {
            method: 'POST',
            body: formData
        });
        
        console.log('Response status:', response.status);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Cloudinary error:', errorText);
            throw new Error(`Upload failed: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Upload successful:', data.secure_url);
        
        const photoURL = data.secure_url;

        // Update Firebase Auth profile
        if (auth.currentUser) {
            await updateProfile(auth.currentUser, { photoURL });
        }

        // Update Firestore document
        const userRef = doc(db, "users", uid);
        updateDoc(userRef, {
            photoURL,
            timestampUpdate: serverTimestamp()
        }).catch(console.error);

        return { photoURL };
    } catch (error) {
        console.error("Error updating user photo:", error);
        throw new Error(error.message || 'Failed to upload photo. Please try again.');
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