"use client";

import useSWRSubscription from "swr/subscription";
import { db } from "../firebase";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";

export function useCollections() {
  const { data, error } = useSWRSubscription(
    "collections", 
    (_, { next }) => {
      if (!db) {
        next(new Error("Firebase is not initialized"), null);
        return () => {}; // Return no-op function
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
          next(error, null);
        });

        return unsubscribe;
      } catch (error) {
        console.error("Error setting up collections subscription:", error);
        next(error, null);
        return () => {}; // Return no-op function
      }
    }
  );

  return { data, error: error?.message, isLoading: data === undefined };
}

export function useCollectionStats() {
  const { data, error } = useSWRSubscription(
    "collection-stats", 
    (_, { next }) => {
      if (!db) {
        next(new Error("Firebase is not initialized"), null);
        return () => {}; // Return no-op function
      }

      try {
        const q = query(collection(db, "collections"));

        const unsubscribe = onSnapshot(q, (snapshot) => {
          const collections = snapshot.docs.map(doc => doc.data());
          
          const stats = {
            total: collections.length,
            active: collections.filter(collection => collection.status === "active").length,
            featured: collections.filter(collection => collection.featured === true).length,
            totalProducts: collections.reduce((sum, collection) => sum + (collection.productIds?.length || 0), 0)
          };
          
          next(null, stats);
        }, (error) => {
          next(error, null);
        });

        return unsubscribe;
      } catch (error) {
        console.error("Error setting up collection stats subscription:", error);
        next(error, null);
        return () => {}; // Return no-op function
      }
    }
  );

  return { data, error: error?.message, isLoading: data === undefined };
}