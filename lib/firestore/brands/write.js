"use client";

import { db } from "../firebase";
import { doc, updateDoc, addDoc, deleteDoc, collection, serverTimestamp } from "firebase/firestore";

export async function createNewBrand(brandData) {
  if (!db) {
    throw new Error("Firebase not initialized");
  }

  try {
    const docRef = await addDoc(collection(db, "brands"), {
      ...brandData,
      timestampCreate: serverTimestamp(),
      timestampUpdate: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    throw new Error(error.message || "Failed to create brand");
  }
}

export async function updateBrand(brandId, brandData) {
  if (!db || !brandId) {
    throw new Error("Invalid parameters");
  }

  try {
    const brandRef = doc(db, "brands", brandId);
    await updateDoc(brandRef, {
      ...brandData,
      timestampUpdate: serverTimestamp()
    });
  } catch (error) {
    throw new Error(error.message || "Failed to update brand");
  }
}

export async function deleteBrand(brandId) {
  if (!db || !brandId) {
    throw new Error("Invalid parameters");
  }

  try {
    const brandRef = doc(db, "brands", brandId);
    await deleteDoc(brandRef);
  } catch (error) {
    throw new Error(error.message || "Failed to delete brand");
  }
}
