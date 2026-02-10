"use client";

import useSWRSubscription from "swr/subscription";
import { db } from "../firebase";
import { collection, onSnapshot, query } from "firebase/firestore";

export function useReviews() {
  const { data, error } = useSWRSubscription(
    "reviews",
    (_, { next }) => {
      if (!db) {
        console.warn("Firestore not initialized for reviews");
        next(null, []);
        return () => {};
      }

      try {
        const q = query(collection(db, "reviews"));

        const unsubscribe = onSnapshot(q, (snapshot) => {
          const reviews = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          next(null, reviews);
        }, (error) => {
          console.error("Reviews fetch error:", error);
          next(null, []);
        });

        return unsubscribe;
      } catch (error) {
        console.error("Reviews subscription error:", error);
        next(null, []);
        return () => {};
      }
    },
    { fallbackData: [] }
  );

  return { data: data || [], error: error?.message, isLoading: data === undefined };
}

export function useReviewStats() {
  const { data } = useReviews();
  return { data: { total: data?.length || 0 }, error: null, isLoading: data === undefined };
}
