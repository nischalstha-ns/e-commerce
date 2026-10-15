"use client";

import { db } from "../firebase";
import {
  collection,
  addDoc,
  serverTimestamp,
  doc,
  runTransaction,
} from "firebase/firestore";

/**
 * Record a POS sale and decrement stock atomically.
 * Uses a Firestore transaction so concurrent sales can't oversell.
 */
export async function createSale({ items, total, subtotal = null, discount = 0, tax = 0, paymentMethod = "cash", userId = null }) {
  if (!db) throw new Error("Database unavailable");
  if (!items || items.length === 0) throw new Error("Sale has no items");

  const saleRef = await runTransaction(db, async (tx) => {
    let computedTotal = 0;

    for (const item of items) {
      const productId = item.productId || item.id;
      if (!productId) throw new Error("Sale item is missing a product id");
      const qty = Math.floor(Number(item.quantity));
      if (!Number.isFinite(qty) || qty < 1) {
        throw new Error(`Invalid quantity for ${item.name || productId}`);
      }

      const pRef = doc(db, "products", productId);
      const pSnap = await tx.get(pRef);
      if (!pSnap.exists()) {
        throw new Error(`Product "${item.name || productId}" no longer exists`);
      }
      const p = pSnap.data();
      const stock = Number(p.stock ?? 0);
      if (stock < qty) {
        throw new Error(`Not enough stock for "${p.name || productId}" (have ${stock})`);
      }
      const unit =
        Number(p.salePrice) > 0 && Number(p.salePrice) < Number(p.price)
          ? Number(p.salePrice)
          : Number(p.price) || 0;
      computedTotal += unit * qty;
      tx.update(pRef, { stock: stock - qty, updatedAt: serverTimestamp() });
    }

    const ref = doc(collection(db, "sales"));
    tx.set(ref, {
      items: items.map((item) => ({
        productId: item.productId || item.id,
        name: item.name || "",
        price: Number(item.price) || 0,
        quantity: Math.floor(Number(item.quantity)) || 0,
      })),
      subtotal: subtotal ?? computedTotal,
      discount: Number(discount) || 0,
      tax: Number(tax) || 0,
      total: computedTotal,
      paymentMethod,
      userId,
      timestampCreate: serverTimestamp(),
    });
    return ref;
  });

  return { id: saleRef.id, success: true };
}
