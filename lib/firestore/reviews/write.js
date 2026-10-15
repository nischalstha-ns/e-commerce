"use client";

import { db } from "../firebase";
import { doc, updateDoc, deleteDoc, serverTimestamp } from "firebase/firestore";

const VALID_STATUSES = ["pending", "approved", "rejected"];

export async function updateReviewStatus({ id, status, adminNote = null }) {
  if (!db) throw new Error("Database unavailable");
  if (!id) throw new Error("Review ID is required");
  if (!VALID_STATUSES.includes(status)) {
    throw new Error(`Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}`);
  }

  await updateDoc(doc(db, "reviews", id), {
    status,
    ...(adminNote !== null ? { adminNote } : {}),
    updatedAt: serverTimestamp(),
  });
  return { success: true };
}

export async function deleteReview({ id }) {
  if (!db) throw new Error("Database unavailable");
  if (!id) throw new Error("Review ID is required");

  await deleteDoc(doc(db, "reviews", id));
  return { success: true };
}
