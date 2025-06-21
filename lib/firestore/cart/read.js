"use client";

import useSWRSubscription from "swr/subscription";
import { db } from "../firebase";
import { doc, onSnapshot } from "firebase/firestore";

export function useCart(userId) {
  const { data, error } = useSWRSubscription(
    userId ? ["cart", userId] : null,
    (_, { next }) => {
      if (!db || !userId) {
        next(new Error("Firebase is not initialized or user ID missing"), null);
        return () => {};
      }

      try {
        const cartRef = doc(db, "carts", userId);

        const unsubscribe = onSnapshot(cartRef, (doc) => {
          if (doc.exists()) {
            const cartData = doc.data();
            next(null, {
              id: doc.id,
              ...cartData
            });
          } else {
            // Return empty cart if document doesn't exist
            next(null, {
              id: userId,
              items: [],
              total: 0,
              itemCount: 0
            });
          }
        }, (error) => {
          next(error, null);
        });

        return unsubscribe;
      } catch (error) {
        console.error("Error setting up cart subscription:", error);
        next(error, null);
        return () => {};
      }
    }
  );

  return { data, error: error?.message, isLoading: data === undefined };
}