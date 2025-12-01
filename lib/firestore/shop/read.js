"use client";

import useSWRSubscription from "swr/subscription";
import { db } from "../firebase";
import { doc, onSnapshot } from "firebase/firestore";

export function useShopProfile() {
  const { data, error } = useSWRSubscription(
    "shop-profile",
    (_, { next }) => {
      if (!db) {
        next(null, null);
        return () => {};
      }

      try {
        const shopRef = doc(db, "settings", "shop");
        
        const unsubscribe = onSnapshot(shopRef, (snapshot) => {
          if (snapshot.exists()) {
            next(null, { id: snapshot.id, ...snapshot.data() });
          } else {
            next(null, null);
          }
        }, (error) => {
          next(null, null);
        });

        return unsubscribe;
      } catch (error) {
        next(null, null);
        return () => {};
      }
    },
    {
      revalidateOnFocus: false
    }
  );

  return { data, error: error?.message, isLoading: data === undefined };
}
