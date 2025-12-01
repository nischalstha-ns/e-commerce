"use client";

import useSWRSubscription from "swr/subscription";
import { db } from "../firebase";
import { doc, onSnapshot } from "firebase/firestore";

export function useProduct(productId) {
  const { data, error } = useSWRSubscription(
    productId ? ["product", productId] : null,
    (_, { next }) => {
      if (!db || !productId) {
        next(null, null);
        return () => {};
      }

      try {
        const productRef = doc(db, "products", productId);
        
        const unsubscribe = onSnapshot(productRef, (snapshot) => {
          if (snapshot.exists()) {
            next(null, { id: snapshot.id, ...snapshot.data() });
          } else {
            next(null, null);
          }
        }, (error) => {
          next(error, null);
        });

        return unsubscribe;
      } catch (error) {
        next(error, null);
        return () => {};
      }
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false
    }
  );

  return { data, error: error?.message, isLoading: data === undefined };
}
