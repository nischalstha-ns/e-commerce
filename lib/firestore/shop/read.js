"use client";

import useSWRSubscription from "swr/subscription";
import { db } from "../firebase";
import { doc, onSnapshot } from "firebase/firestore";

export function useShopProfile(userId) {
  const result = useSWRSubscription(
    userId ? ["shop-profile", userId] : null,
    (_, { next }) => {
      if (!db || !userId) {
        next(null, null);
        return () => {};
      }

      try {
        const shopRef = doc(db, "shops", userId);
        const unsubscribe = onSnapshot(shopRef, (snapshot) => {
          if (snapshot.exists()) {
            next(null, { id: snapshot.id, ...snapshot.data() });
          } else {
            next(null, null);
          }
        }, () => next(null, null));

        return unsubscribe;
      } catch {
        next(null, null);
        return () => {};
      }
    },
    { fallbackData: null }
  );

  return { data: result.data, isLoading: result.data === undefined };
}
