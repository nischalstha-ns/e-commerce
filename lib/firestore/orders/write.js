"use client";

import { db } from "../firebase";
import { doc, updateDoc, addDoc, deleteDoc, collection, serverTimestamp } from "firebase/firestore";

export async function updateOrderStatus(orderId, status) {
  if (!db || !orderId) {
    throw new Error("Invalid parameters");
  }

  try {
    const orderRef = doc(db, "orders", orderId);
    await updateDoc(orderRef, {
      status,
      timestampUpdate: serverTimestamp()
    });
  } catch (error) {
    throw new Error(error.message || "Failed to update order status");
  }
}

export async function createOrder(orderData) {
  if (!db) {
    throw new Error("Firebase not initialized");
  }

  try {
    const docRef = await addDoc(collection(db, "orders"), {
      ...orderData,
      timestampCreate: serverTimestamp(),
      timestampUpdate: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    throw new Error(error.message || "Failed to create order");
  }
}

export async function updateOrder(orderId, orderData) {
  if (!db || !orderId) {
    throw new Error("Invalid parameters");
  }

  try {
    const orderRef = doc(db, "orders", orderId);
    await updateDoc(orderRef, {
      ...orderData,
      timestampUpdate: serverTimestamp()
    });
  } catch (error) {
    throw new Error(error.message || "Failed to update order");
  }
}

export async function deleteOrder(orderId) {
  if (!db || !orderId) {
    throw new Error("Invalid parameters");
  }

  try {
    const orderRef = doc(db, "orders", orderId);
    await deleteDoc(orderRef);
  } catch (error) {
    throw new Error(error.message || "Failed to delete order");
  }
}
