"use client";

import useSWRSubscription from "swr/subscription";
import { db } from "../firebase";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";

export function useReviews() {
  const { data, error } = useSWRSubscription(
    "reviews",
    (_, { next }) => {
      if (!db) {
        next(null, []);
        return () => {};
      }

      try {
        const q = query(collection(db, "reviews"), orderBy("timestampCreate", "desc"));

        const unsubscribe = onSnapshot(q, (snapshot) => {
          const reviews = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          next(null, reviews);
        }, (error) => {
          next(null, []);
        });

        return unsubscribe;
      } catch (error) {
        next(null, []);
        return () => {};
      }
    }
  );

  return { data, error: error?.message, isLoading: data === undefined };
}

export function useReviewStats() {
  const { data, error } = useSWRSubscription(
    "review-stats",
    (_, { next }) => {
      if (!db) {
        next(null, { total: 0 });
        return () => {};
      }

      try {
        const q = query(collection(db, "reviews"));

        const unsubscribe = onSnapshot(q, (snapshot) => {
          const stats = { total: snapshot.docs.length };
          next(null, stats);
        }, (error) => {
          next(null, { total: 0 });
        });

        return unsubscribe;
      } catch (error) {
        next(null, { total: 0 });
        return () => {};
      }
    }
  );

  return { data, error: error?.message, isLoading: data === undefined };
}
