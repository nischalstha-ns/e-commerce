"use client";

import { db } from "../firebase";
import { doc, updateDoc, addDoc, deleteDoc, collection, serverTimestamp } from "firebase/firestore";

export async function createNewProduct(productData) {
  if (!db) {
    throw new Error("Firebase not initialized");
  }

  try {
    const docRef = await addDoc(collection(db, "products"), {
      ...productData,
      timestampCreate: serverTimestamp(),
      timestampUpdate: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    throw new Error(error.message || "Failed to create product");
  }
}

export async function updateProduct(productId, productData) {
  if (!db || !productId) {
    throw new Error("Invalid parameters");
  }

  try {
    const productRef = doc(db, "products", productId);
    await updateDoc(productRef, {
      ...productData,
      timestampUpdate: serverTimestamp()
    });
  } catch (error) {
    throw new Error(error.message || "Failed to update product");
  }
}

export async function deleteProduct(productId) {
  if (!db || !productId) {
    throw new Error("Invalid parameters");
  }

  try {
    const productRef = doc(db, "products", productId);
    await deleteDoc(productRef);
  } catch (error) {
    throw new Error(error.message || "Failed to delete product");
  }
}
