"use client";

import { db } from "../firebase";
import { doc, updateDoc, deleteDoc, serverTimestamp } from "firebase/firestore";

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
