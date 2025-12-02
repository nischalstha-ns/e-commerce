"use client";

import { db } from "../firebase";
import { doc, updateDoc, addDoc, deleteDoc, collection, serverTimestamp } from "firebase/firestore";

export async function createNewProduct({ data, images = [] }) {
  if (!db) {
    throw new Error("Firebase not initialized");
  }

  try {
    const docRef = await addDoc(collection(db, "products"), {
      ...data,
      timestampCreate: serverTimestamp(),
      timestampUpdate: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    throw new Error(error.message || "Failed to create product");
  }
}

export async function updateProduct({ id, data }) {
  if (!db || !id) {
    throw new Error("Invalid parameters");
  }

  try {
    const productRef = doc(db, "products", id);
    await updateDoc(productRef, {
      ...data,
      timestampUpdate: serverTimestamp()
    });
  } catch (error) {
    throw new Error(error.message || "Failed to update product");
  }
}

export async function deleteProduct({ id }) {
  if (!db || !id) {
    throw new Error("Invalid parameters");
  }

  try {
    const productRef = doc(db, "products", id);
    await deleteDoc(productRef);
  } catch (error) {
    throw new Error(error.message || "Failed to delete product");
  }
}
