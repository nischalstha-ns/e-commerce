"use client";

import useSWRSubscription from "swr/subscription";
import { db } from "../firebase";
import { doc, onSnapshot } from "firebase/firestore";

export function useCart(userId) {
  const { data, error } = useSWRSubscription(
    userId ? ["cart", userId] : null,
    (_, { next }) => {
      if (!db || !userId) {
        next(null, { items: [] });
        return () => {};
      }

      try {
        const cartRef = doc(db, "carts", userId);

        const unsubscribe = onSnapshot(cartRef, (doc) => {
          if (doc.exists()) {
            next(null, { id: doc.id, ...doc.data() });
          } else {
            next(null, { items: [] });
          }
        }, (error) => {
          next(null, { items: [] });
        });

        return unsubscribe;
      } catch (error) {
        next(null, { items: [] });
        return () => {};
      }
    },
    { fallbackData: { items: [] } }
  );

  return { data: data || { items: [] }, error: error?.message, isLoading: data === undefined };
}
