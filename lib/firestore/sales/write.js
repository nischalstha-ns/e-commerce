import { db } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export const createSale = async ({ items, total, paymentMethod = "cash", customerId = null }) => {
  if (!db) throw new Error("Firebase not initialized");
  if (!items || items.length === 0) throw new Error("Items required");
  if (!total || total <= 0) throw new Error("Invalid total");

  try {
    const saleData = {
      items: items.map(item => ({
        productId: item.id || "",
        name: item.name || "Unknown",
        price: item.price || 0,
        quantity: item.quantity || 1,
        imageURL: item.imageURLs?.[0] || item.imageURL || "",
        subtotal: (item.price || 0) * (item.quantity || 1)
      })),
      total: Number(total),
      paymentMethod: paymentMethod || "cash",
      status: "completed",
      type: "pos",
      timestampCreate: serverTimestamp(),
      timestampUpdate: serverTimestamp()
    };

    if (customerId) {
      saleData.customerId = customerId;
    }

    const docRef = await addDoc(collection(db, "orders"), saleData);
    return { id: docRef.id, ...saleData };
  } catch (error) {
    throw error;
  }
};
