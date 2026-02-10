import { auth, db } from "../firebase";
import { updatePassword, reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth";
import { doc, updateDoc } from "firebase/firestore";

export async function changeUserPassword(currentPassword, newPassword) {
  try {
    const user = auth.currentUser;
    if (!user || !user.email) {
      throw new Error("No authenticated user found");
    }

    const credential = EmailAuthProvider.credential(user.email, currentPassword);
    await reauthenticateWithCredential(user, credential);
    await updatePassword(user, newPassword);
    
    return { success: true };
  } catch (error) {
    console.error("Password change error:", error);
    throw error;
  }
}

export async function enableTwoFactorAuth(phoneNumber) {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error("No authenticated user found");
    }

    await updateDoc(doc(db, "users", user.uid), {
      twoFactorEnabled: true,
      twoFactorPhone: phoneNumber,
      twoFactorEnabledAt: new Date().toISOString()
    });
    
    return { success: true };
  } catch (error) {
    console.error("Enable 2FA error:", error);
    throw error;
  }
}

export async function disableTwoFactorAuth() {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error("No authenticated user found");
    }

    await updateDoc(doc(db, "users", user.uid), {
      twoFactorEnabled: false,
      twoFactorPhone: null
    });
    
    return { success: true };
  } catch (error) {
    console.error("Disable 2FA error:", error);
    throw error;
  }
}

export async function updateUserPhoto(photoURL) {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error("No authenticated user found");
    }

    await updateDoc(doc(db, "users", user.uid), {
      photoURL: photoURL
    });
    
    return { success: true };
  } catch (error) {
    console.error("Update photo error:", error);
    throw error;
  }
}

export async function updateUserProfile(data) {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error("No authenticated user found");
    }

    await updateDoc(doc(db, "users", user.uid), data);
    
    return { success: true };
  } catch (error) {
    console.error("Update profile error:", error);
    throw error;
  }
}

export async function updateUserPreferences(preferences) {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error("No authenticated user found");
    }

    await updateDoc(doc(db, "users", user.uid), {
      preferences: preferences
    });
    
    return { success: true };
  } catch (error) {
    console.error("Update preferences error:", error);
    throw error;
  }
}
