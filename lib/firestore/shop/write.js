"use client";

import { db } from "../firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

export async function updateShopProfile({ userId, data }) {
  if (!db) throw new Error("Database unavailable");
  if (!userId) throw new Error("User ID is required");
  if (!data || typeof data !== "object") throw new Error("Invalid profile data");

  const allowed = [
    "shopName",
    "description",
    "phone",
    "address",
    "city",
    "logoURL",
    "bannerURL",
  ];
  const clean = {};
  for (const key of allowed) {
    if (data[key] !== undefined) clean[key] = data[key];
  }

  await setDoc(
    doc(db, "shops", userId),
    { ...clean, updatedAt: serverTimestamp() },
    { merge: true }
  );
  return { success: true };
}
