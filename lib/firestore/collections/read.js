"use client";

import useSWRSubscription from "swr/subscription";
import { db } from "../firebase";
import { collection, onSnapshot, query } from "firebase/firestore";

export function useCollections() {
  const { data, error } = useSWRSubscription(
    "collections",
    (_, { next }) => {
      if (!db) {
        console.warn("Firestore not initialized for collections");
        next(null, []);
        return () => {};
      }

      try {
        const q = query(collection(db, "collections"));

        const unsubscribe = onSnapshot(q, (snapshot) => {
          const collections = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          next(null, collections);
        }, (error) => {
          console.error("Collections fetch error:", error);
          next(null, []);
        });

        return unsubscribe;
      } catch (error) {
        console.error("Collections subscription error:", error);
        next(null, []);
        return () => {};
      }
    },
    { fallbackData: [] }
  );

  return { data: data || [], error: error?.message, isLoading: data === undefined };
}

export function useCollectionStats() {
  const { data } = useCollections();
  return { data: { total: data?.length || 0 }, error: null, isLoading: data === undefined };
}
