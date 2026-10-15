import { db } from "../firebase";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";

/** Mark a cash-on-delivery order as paid after collecting the amount. */
export async function markCODPaid({ id, paidAmount, collectedBy }) {
  if (!db) throw new Error("Firebase not initialized");
  if (!id) throw new Error("Order ID is required");

  await updateDoc(doc(db, "orders", id), {
    paymentStatus: "paid",
    paidAmount: Number(paidAmount) || 0,
    collectedBy: collectedBy || null,
    status: "delivered",
    updatedAt: serverTimestamp(),
  });
  return { success: true };
}

/** Mark a cash-on-delivery order as failed (e.g. customer refused / unreachable). */
export async function markCODFailed({ id, reason }) {
  if (!db) throw new Error("Firebase not initialized");
  if (!id) throw new Error("Order ID is required");

  await updateDoc(doc(db, "orders", id), {
    paymentStatus: "failed",
    codFailureReason: reason || null,
    status: "cancelled",
    updatedAt: serverTimestamp(),
  });
  return { success: true };
}
