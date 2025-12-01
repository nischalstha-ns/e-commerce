"use client";

import { db } from "../firebase";
import { doc, updateDoc, addDoc, deleteDoc, collection, serverTimestamp } from "firebase/firestore";

export async function createReview(reviewData) {
  if (!db) {
    throw new Error("Firebase not initialized");
  }

  try {
    const docRef = await addDoc(collection(db, "reviews"), {
      ...reviewData,
      timestampCreate: serverTimestamp(),
      timestampUpdate: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    throw new Error(error.message || "Failed to create review");
  }
}

export async function updateReview(reviewId, reviewData) {
  if (!db || !reviewId) {
    throw new Error("Invalid parameters");
  }

  try {
    const reviewRef = doc(db, "reviews", reviewId);
    await updateDoc(reviewRef, {
      ...reviewData,
      timestampUpdate: serverTimestamp()
    });
  } catch (error) {
    throw new Error(error.message || "Failed to update review");
  }
}

export async function updateReviewStatus(reviewId, status) {
  if (!db || !reviewId) {
    throw new Error("Invalid parameters");
  }

  try {
    const reviewRef = doc(db, "reviews", reviewId);
    await updateDoc(reviewRef, {
      status,
      timestampUpdate: serverTimestamp()
    });
  } catch (error) {
    throw new Error(error.message || "Failed to update review status");
  }
}

export async function deleteReview(reviewId) {
  if (!db || !reviewId) {
    throw new Error("Invalid parameters");
  }

  try {
    const reviewRef = doc(db, "reviews", reviewId);
    await deleteDoc(reviewRef);
  } catch (error) {
    throw new Error(error.message || "Failed to delete review");
  }
}
