"use client";

import { db, auth } from "../firebase";
import { doc, updateDoc, deleteDoc, serverTimestamp } from "firebase/firestore";
import { updatePassword, reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth";

export async function updateUserProfile({ uid, displayName, phone, address, bio }) {
  if (!db || !uid) {
    throw new Error("Invalid parameters");
  }

  try {
    const userRef = doc(db, "users", uid);
    await updateDoc(userRef, {
      displayName,
      phone,
      address,
      bio,
      timestampUpdate: serverTimestamp()
    });
  } catch (error) {
    throw new Error(error.message || "Failed to update profile");
  }
}

export async function updateUserPreferences({ uid, preferences }) {
  if (!db || !uid) {
    throw new Error("Invalid parameters");
  }

  try {
    const userRef = doc(db, "users", uid);
    await updateDoc(userRef, {
      preferences,
      timestampUpdate: serverTimestamp()
    });
  } catch (error) {
    throw new Error(error.message || "Failed to update preferences");
  }
}

export async function updateUserRole(uid, role) {
  if (!db || !uid) {
    throw new Error("Invalid parameters");
  }

  try {
    const userRef = doc(db, "users", uid);
    await updateDoc(userRef, {
      role,
      timestampUpdate: serverTimestamp()
    });
  } catch (error) {
    throw new Error(error.message || "Failed to update user role");
  }
}

export async function deleteUser(uid) {
  if (!db || !uid) {
    throw new Error("Invalid parameters");
  }

  try {
    const userRef = doc(db, "users", uid);
    await deleteDoc(userRef);
  } catch (error) {
    throw new Error(error.message || "Failed to delete user");
  }
}

export async function changeUserPassword({ currentPassword, newPassword }) {
  const user = auth.currentUser;
  if (!user || !user.email) {
    throw new Error("No authenticated user");
  }

  try {
    const credential = EmailAuthProvider.credential(user.email, currentPassword);
    await reauthenticateWithCredential(user, credential);
    await updatePassword(user, newPassword);
  } catch (error) {
    if (error.code === "auth/wrong-password") {
      throw new Error("Current password is incorrect");
    }
    throw new Error(error.message || "Failed to change password");
  }
}

export async function enableTwoFactorAuth({ uid, phoneNumber }) {
  if (!db || !uid) {
    throw new Error("Invalid parameters");
  }

  try {
    const userRef = doc(db, "users", uid);
    await updateDoc(userRef, {
      twoFactorEnabled: true,
      twoFactorPhone: phoneNumber,
      twoFactorEnabledAt: serverTimestamp(),
      timestampUpdate: serverTimestamp()
    });
  } catch (error) {
    throw new Error(error.message || "Failed to enable two-factor authentication");
  }
}

export async function disableTwoFactorAuth({ uid }) {
  if (!db || !uid) {
    throw new Error("Invalid parameters");
  }

  try {
    const userRef = doc(db, "users", uid);
    await updateDoc(userRef, {
      twoFactorEnabled: false,
      twoFactorPhone: null,
      twoFactorDisabledAt: serverTimestamp(),
      timestampUpdate: serverTimestamp()
    });
  } catch (error) {
    throw new Error(error.message || "Failed to disable two-factor authentication");
  }
}

export async function updateUserPhoto({ uid, photoURL }) {
  if (!db || !uid) {
    throw new Error("Invalid parameters");
  }

  try {
    const userRef = doc(db, "users", uid);
    await updateDoc(userRef, {
      photoURL,
      timestampUpdate: serverTimestamp()
    });
  } catch (error) {
    throw new Error(error.message || "Failed to update profile photo");
  }
}
