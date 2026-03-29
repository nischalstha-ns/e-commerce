import { db } from "../firebase";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";

export async function updateOrderStatus(orderIdOrObj, statusArg) {
  try {
    if (!db) {
      throw new Error("Firebase not initialized");
    }

    let orderId, status;
    if (typeof orderIdOrObj === "object" && orderIdOrObj !== null) {
      orderId = orderIdOrObj.id;
      status = orderIdOrObj.status;
    } else {
      orderId = orderIdOrObj;
      status = statusArg;
    }

    if (!orderId) throw new Error("Order ID is required");
    if (!status) throw new Error("Status is required");

    const validStatuses = ["pending", "accepted", "shipped", "delivered", "rejected", "cancelled"];
    if (!validStatuses.includes(status)) {
      throw new Error(`Invalid status: ${status}`);
    }

    await updateDoc(doc(db, "orders", orderId), {
      status,
      updatedAt: serverTimestamp(),
    });

    return { success: true };
  } catch (error) {
    console.error("Update order status error:", error);
    throw error;
  }
}
