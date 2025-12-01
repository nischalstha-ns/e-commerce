"use client";

import { db } from "../firebase";
import { doc, updateDoc, addDoc, deleteDoc, collection, serverTimestamp } from "firebase/firestore";

export async function createNewCategory(categoryData) {
  if (!db) {
    throw new Error("Firebase not initialized");
  }

  try {
    const docRef = await addDoc(collection(db, "categories"), {
      ...categoryData,
      timestampCreate: serverTimestamp(),
      timestampUpdate: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    throw new Error(error.message || "Failed to create category");
  }
}

export async function updateCategory(categoryId, categoryData) {
  if (!db || !categoryId) {
    throw new Error("Invalid parameters");
  }

  try {
    const categoryRef = doc(db, "categories", categoryId);
    await updateDoc(categoryRef, {
      ...categoryData,
      timestampUpdate: serverTimestamp()
    });
  } catch (error) {
    throw new Error(error.message || "Failed to update category");
  }
}

export async function deleteCategory(categoryId) {
  if (!db || !categoryId) {
    throw new Error("Invalid parameters");
  }

  try {
    const categoryRef = doc(db, "categories", categoryId);
    await deleteDoc(categoryRef);
  } catch (error) {
    throw new Error(error.message || "Failed to delete category");
  }
}
