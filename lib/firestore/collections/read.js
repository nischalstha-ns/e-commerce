"use client";

import useSWRSubscription from "swr/subscription";
import { db } from "../firebase";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";

export function useCollections() {
  const { data, error } = useSWRSubscription(
    "collections",
    (_, { next }) => {
      if (!db) {
        next(null, []);
        return () => {};
      }

      try {
        const q = query(collection(db, "collections"), orderBy("timestampCreate", "desc"));

        const unsubscribe = onSnapshot(q, (snapshot) => {
          const collections = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          next(null, collections);
        }, (error) => {
          next(null, []);
        });

        return unsubscribe;
      } catch (error) {
        next(null, []);
        return () => {};
      }
    },
    {
      revalidateOnFocus: false
    }
  );

  return { data, error: error?.message, isLoading: data === undefined };
}

export function useCollectionStats() {
  const { data, error } = useSWRSubscription(
    "collection-stats",
    (_, { next }) => {
      if (!db) {
        next(null, { total: 0 });
        return () => {};
      }

      try {
        const q = query(collection(db, "collections"));

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
