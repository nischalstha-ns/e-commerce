"use client";

import { db } from "../firebase";
import { doc, updateDoc, addDoc, deleteDoc, collection, serverTimestamp } from "firebase/firestore";

export async function createNewCollection(collectionData) {
  if (!db) {
    throw new Error("Firebase not initialized");
  }

  try {
    const docRef = await addDoc(collection(db, "collections"), {
      ...collectionData,
      timestampCreate: serverTimestamp(),
      timestampUpdate: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    throw new Error(error.message || "Failed to create collection");
  }
}

export async function updateCollection(collectionId, collectionData) {
  if (!db || !collectionId) {
    throw new Error("Invalid parameters");
  }

  try {
    const collectionRef = doc(db, "collections", collectionId);
    await updateDoc(collectionRef, {
      ...collectionData,
      timestampUpdate: serverTimestamp()
    });
  } catch (error) {
    throw new Error(error.message || "Failed to update collection");
  }
}

export async function deleteCollection(collectionId) {
  if (!db || !collectionId) {
    throw new Error("Invalid parameters");
  }

  try {
    const collectionRef = doc(db, "collections", collectionId);
    await deleteDoc(collectionRef);
  } catch (error) {
    throw new Error(error.message || "Failed to delete collection");
  }
}
