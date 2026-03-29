import { db } from "../firebase";
import {
  collection,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";

export async function createOrder({ userId, items, total, customerInfo, paymentMethod = "cash" }) {
  if (!db) throw new Error("Firebase not initialized");
  if (!userId) throw new Error("User ID is required");
  if (!items || items.length === 0) throw new Error("Order must have at least one item");
  if (!customerInfo?.name) throw new Error("Customer name is required");
  if (!customerInfo?.phone) throw new Error("Customer phone is required");
  if (!customerInfo?.address) throw new Error("Delivery address is required");

  const orderData = {
    userId,
    items: items.map((item) => ({
      productId: item.productId || item.id,
      name: item.name,
      price: Number(item.price),
      salePrice: item.salePrice ? Number(item.salePrice) : null,
      quantity: Number(item.quantity),
      imageURL: item.imageURL || null,
    })),
    total: Number(total),
    totalAmount: Number(total),
    customerInfo: {
      name: customerInfo.name,
      email: customerInfo.email || "",
      phone: customerInfo.phone,
      address: customerInfo.address,
    },
    customerEmail: customerInfo.email || "",
    paymentMethod,
    paymentStatus: "pending",
    status: "pending",
    notes: customerInfo.notes || "",
    timestampCreate: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const docRef = await addDoc(collection(db, "orders"), orderData);
  return { success: true, id: docRef.id };
}
