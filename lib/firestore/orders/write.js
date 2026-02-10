import { db } from "../firebase";
import { doc, updateDoc } from "firebase/firestore";

export async function updateOrderStatus(orderId, status) {
  try {
    if (!db) {
      throw new Error("Firebase not initialized");
    }
    
    await updateDoc(doc(db, "orders", orderId), {
      status: status,
      updatedAt: new Date().toISOString()
    });
    
    return { success: true };
  } catch (error) {
    console.error("Update order status error:", error);
    throw error;
  }
}
