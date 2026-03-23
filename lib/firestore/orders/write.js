import { db } from "../firebase";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";

export async function updateOrderStatus(orderIdOrInput, maybeStatus) {
  try {
    if (!db) {
      throw new Error("Firebase not initialized");
    }

    const orderId = typeof orderIdOrInput === 'string' ? orderIdOrInput : orderIdOrInput?.id;
    const status = maybeStatus || orderIdOrInput?.status;

    if (!orderId || !status) {
      throw new Error('Order id and status are required');
    }

    await updateDoc(doc(db, "orders", orderId), {
      status,
      updatedAt: serverTimestamp()
    });

    return { success: true };
  } catch (error) {
    console.error("Update order status error:", error);
    throw error;
  }
}

export async function updateShippingInfo({ id, trackingNumber, carrier, estimatedDelivery }) {
  if (!db) {
    throw new Error('Firebase not initialized');
  }

  if (!id || !trackingNumber) {
    throw new Error('Order id and tracking number are required');
  }

  await updateDoc(doc(db, 'orders', id), {
    trackingNumber,
    carrier: carrier || 'USPS',
    estimatedDelivery: estimatedDelivery || null,
    shippingStatus: 'shipped',
    status: 'shipped',
    updatedAt: serverTimestamp(),
  });

  return { success: true };
}
