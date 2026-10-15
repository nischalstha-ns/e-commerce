"use client";

import useSWRSubscription from "swr/subscription";
import { db } from "../firebase";
import { doc, onSnapshot } from "firebase/firestore";

export function useShopProfile(userId) {
  const { data, error } = useSWRSubscription(
    userId ? ["shopProfile", userId] : null,
    (_, { next }) => {
      if (!db || !userId) {
        next(null, null);
        return () => {};
      }
      try {
        const ref = doc(db, "shops", userId);
        const unsubscribe = onSnapshot(
          ref,
          (snap) => {
            next(null, snap.exists() ? { id: snap.id, ...snap.data() } : null);
          },
          (err) => next(err, null)
        );
        return unsubscribe;
      } catch (err) {
        next(err, null);
        return () => {};
      }
    },
    { fallbackData: null }
  );

  return {
    data: data || null,
    error: error?.message,
    isLoading: data === undefined,
  };
}
