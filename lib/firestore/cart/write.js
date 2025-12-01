"use client";

import { db } from "../firebase";
import { doc, setDoc, updateDoc, deleteDoc, getDoc, serverTimestamp } from "firebase/firestore";

export async function updateCart(userId, cartData) {
  if (!db || !userId) {
    throw new Error("Invalid parameters");
  }

  try {
    const cartRef = doc(db, "carts", userId);
    const items = Array.isArray(cartData) ? cartData : [cartData];
    
    await setDoc(cartRef, {
      items: items,
      timestampUpdate: serverTimestamp()
    }, { merge: true });
  } catch (error) {
    throw new Error(error.message || "Failed to update cart");
  }
}

export async function addToCart(userId, productId, quantity = 1, options = {}) {
  if (!db || !userId) {
    throw new Error("Invalid parameters");
  }

  try {
    const cartRef = doc(db, "carts", userId);
    const cartDoc = await getDoc(cartRef);
    
    let items = [];
    if (cartDoc.exists()) {
      items = cartDoc.data().items || [];
    }
    
    const existingIndex = items.findIndex(item => 
      item.productId === productId && 
      item.selectedSize === options.selectedSize && 
      item.selectedColor === options.selectedColor
    );
    
    if (existingIndex >= 0) {
      items[existingIndex].quantity += quantity;
    } else {
      items.push({
        productId,
        quantity,
        selectedSize: options.selectedSize || null,
        selectedColor: options.selectedColor || null,
        addedAt: new Date().toISOString()
      });
    }
    
    await setDoc(cartRef, {
      items,
      timestampUpdate: serverTimestamp()
    });
  } catch (error) {
    throw new Error(error.message || "Failed to add to cart");
  }
}

export async function updateCartItem(userId, itemId, quantity) {
  if (!db || !userId) {
    throw new Error("Invalid parameters");
  }

  try {
    const cartRef = doc(db, "carts", userId);
    await updateDoc(cartRef, {
      [`items.${itemId}.quantity`]: quantity,
      timestampUpdate: serverTimestamp()
    });
  } catch (error) {
    throw new Error(error.message || "Failed to update cart item");
  }
}

export async function removeFromCart(userId, itemId) {
  if (!db || !userId) {
    throw new Error("Invalid parameters");
  }

  try {
    const cartRef = doc(db, "carts", userId);
    await updateDoc(cartRef, {
      [`items.${itemId}`]: null,
      timestampUpdate: serverTimestamp()
    });
  } catch (error) {
    throw new Error(error.message || "Failed to remove from cart");
  }
}

export async function clearCart(userId) {
  if (!db || !userId) {
    throw new Error("Invalid parameters");
  }

  try {
    const cartRef = doc(db, "carts", userId);
    await deleteDoc(cartRef);
  } catch (error) {
    throw new Error(error.message || "Failed to clear cart");
  }
}
