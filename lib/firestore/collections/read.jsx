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
        const ref = collection(db, "collections");
        const q = query(ref, orderBy("timestampCreate", "desc"));
        
        const unsub = onSnapshot(
          q,
          (snapshot) => {
            next(
              null,
              snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
            );
          },
          (err) => {
            console.error("Collections subscription error:", err);
            next(err, null);
          }
        );
        return () => unsub();
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
        const ref = collection(db, "collections");
        const unsub = onSnapshot(
          ref,
          (snapshot) => {
            const collections = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
            
            const stats = {
              total: collections.length,
              active: collections.filter(c => c.status === "active").length,
              inactive: collections.filter(c => c.status === "inactive").length,
              featured: collections.filter(c => c.featured === true).length,
              totalProducts: collections.reduce((sum, collection) => sum + (collection.productIds?.length || 0), 0)
            };
            
            next(null, stats);
          },
          (err) => {
            console.error("Collection stats subscription error:", err);
            next(err, null);
          }
        );
        return () => unsub();
      } catch (error) {
        console.error("Error setting up collection stats subscription:", error);
        next(error, null);
        return () => {}; // Return no-op function
      }
    }
  );

  return { data, error: error?.message, isLoading: data === undefined };
}