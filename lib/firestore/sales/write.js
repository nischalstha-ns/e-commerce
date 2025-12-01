"use client";

import { db } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export async function createSale({ items, total, paymentMethod, cashReceived, change, userId }) {
  if (!db) {
    throw new Error("Database not initialized");
  }

  try {
    const saleRef = collection(db, "sales");
    const saleData = {
      items,
      total,
      paymentMethod,
      cashReceived: cashReceived || null,
      change: change || null,
      status: "completed",
      timestamp: serverTimestamp()
    };

    if (userId) {
      saleData.userId = userId;
    }

    const docRef = await addDoc(saleRef, saleData);
    return docRef.id;
  } catch (error) {
    throw new Error(error.message || "Failed to create sale");
  }
}
