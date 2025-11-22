import { db } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export const createSale = async ({ items, total, paymentMethod = "cash", customerId = null }) => {
  if (!db) throw new Error("Firebase not initialized");
  if (!items || items.length === 0) throw new Error("Items required");
  if (!total || total <= 0) throw new Error("Invalid total");

  try {
    const saleData = {
      items: items.map(item => ({
        productId: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        imageURL: item.imageURLs?.[0] || item.imageURL,
        subtotal: item.price * item.quantity
      })),
      total,
      paymentMethod,
      customerId,
      status: "completed",
      type: "pos",
      timestampCreate: serverTimestamp(),
      timestampUpdate: serverTimestamp()
    };

    const docRef = await addDoc(collection(db, "orders"), saleData);
    return { id: docRef.id, ...saleData };
  } catch (error) {
    throw error;
  }
};
