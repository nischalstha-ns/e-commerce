"use client";

import useSWRSubscription from "swr/subscription";
import { db } from "../firebase";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";

export function useBrands() {
  const { data, error } = useSWRSubscription(
    "brands",
    (_, { next }) => {
      if (!db) {
        next(null, []);
        return () => {};
      }

      try {
        const q = query(collection(db, "brands"), orderBy("name", "asc"));

        const unsubscribe = onSnapshot(q, (snapshot) => {
          const brands = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          next(null, brands);
        }, (error) => {
          next(null, []);
        });

        return unsubscribe;
      } catch (error) {
        next(null, []);
        return () => {};
      }
    },
    { fallbackData: [] }
  );

  return { data: data || [], error: error?.message, isLoading: data === undefined };
}
