"use client";

import useSWRSubscription from "swr/subscription";
import { db } from "../firebase";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";

export function useCategories() {
  const { data, error } = useSWRSubscription(
    "categories", 
    (_, { next }) => {
      if (!db) {
        console.warn('Firestore not initialized for categories');
        next(null, []);
        return () => {};
      }

      try {
        const q = query(collection(db, "categories"), orderBy("timestampCreate", "desc"));

        const unsubscribe = onSnapshot(q, { includeMetadataChanges: false }, (snapshot) => {
          const categories = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          next(null, categories);
        }, (error) => {
          if (error.code !== 'unavailable') {
            console.warn('Categories fetch error:', error);
          }
          next(null, []);
        });

        return unsubscribe;
      } catch (error) {
        next(null, []);
        return () => {};
      }
    },
    { 
      revalidateOnFocus: false,
      fallbackData: []
    }
  );

  return { data: data || [], error: error?.message, isLoading: data === undefined };
}