import { db } from "../firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

export async function syncCartToFirestore(userId, items) {
  if (!db || !userId) return;
  try {
    await setDoc(
      doc(db, "carts", userId),
      {
        items: items.map((item) => ({
          productId: item.id,
          name: item.name,
          price: item.price,
          salePrice: item.salePrice || null,
          quantity: item.quantity,
          imageURL: item.imageURL || null,
        })),
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.warn("Cart sync failed:", error.message);
    }
  }
}

export async function clearCartInFirestore(userId) {
  if (!db || !userId) return;
  try {
    await setDoc(
      doc(db, "carts", userId),
      { items: [], updatedAt: serverTimestamp() },
      { merge: true }
    );
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.warn("Cart clear failed:", error.message);
    }
  }
}
