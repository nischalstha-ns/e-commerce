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

/**
 * Create an order from explicit cart items (used by the card checkout flow).
 * Prices are validated by the caller; for Stripe payments the charge itself
 * is created server-side in /api/checkout.
 */
/**
 * @param {{ userId: string, items: any[], shippingAddress?: any, paymentMethod?: string, tenantId?: string | null }} params
 */
export async function createOrderFromCart({ userId, items, shippingAddress, paymentMethod = "card", tenantId = null }) {
  if (!db) throw new Error("Firebase not initialized");
  if (!userId) throw new Error("User ID is required");
  if (!items || items.length === 0) throw new Error("Cart is empty");

  return createOrder({
    userId,
    items: items.map((item) => ({
      productId: item.productId || item.id,
      name: item.name,
      price: Number(item.price) || 0,
      salePrice: item.salePrice ? Number(item.salePrice) : null,
      quantity: Math.floor(Number(item.quantity)) || 1,
      imageURL: item.imageURL || null,
    })),
    total: items.reduce(
      (s, i) => s + (Number(i.price) || 0) * (Math.floor(Number(i.quantity)) || 0),
      0
    ),
    customerInfo: {
      name: `${shippingAddress?.firstName || ""} ${shippingAddress?.lastName || ""}`.trim(),
      email: shippingAddress?.email || "",
      phone: shippingAddress?.phone || "",
      address: [
        shippingAddress?.address,
        shippingAddress?.city,
        shippingAddress?.state,
        shippingAddress?.zip,
        shippingAddress?.country,
      ]
        .filter(Boolean)
        .join(", "),
    },
    paymentMethod,
  }).then((res) => ({ ...res, tenantId }));
}
