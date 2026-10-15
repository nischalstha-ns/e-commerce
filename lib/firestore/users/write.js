import { auth, db } from "../firebase";
import { updatePassword, reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";

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
      twoFactorEnabledAt: serverTimestamp()
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

    // Never store the uid inside the document.
    const { uid, ...profile } = data || {};

    // Keep Firebase Auth's displayName in sync — that's what the UI renders.
    if (profile.displayName && profile.displayName !== user.displayName) {
      const { updateProfile } = await import("firebase/auth");
      await updateProfile(user, { displayName: profile.displayName });
    }

    await updateDoc(doc(db, "users", user.uid), {
      ...profile,
      updatedAt: serverTimestamp(),
    });

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

const VALID_ROLES = ["admin", "shop", "customer"];

/** Change a user's role. Only callable by admins (enforced by Firestore rules). */
export async function updateUserRole(userId, role) {
  if (!db) throw new Error("Database unavailable");
  if (!userId) throw new Error("User ID is required");
  if (!VALID_ROLES.includes(role)) {
    throw new Error(`Invalid role. Must be one of: ${VALID_ROLES.join(", ")}`);
  }
  await updateDoc(doc(db, "users", userId), {
    role,
    updatedAt: serverTimestamp(),
  });
  return { success: true };
}

/** Delete a user's Firestore profile document. Only callable by admins. */
export async function deleteUser(userId) {
  if (!db) throw new Error("Database unavailable");
  if (!userId) throw new Error("User ID is required");
  const { deleteDoc } = await import("firebase/firestore");
  await deleteDoc(doc(db, "users", userId));
  return { success: true };
}
