"use client";

import useSWRSubscription from "swr/subscription";
import { db } from "../firebase";
import { collection, onSnapshot, query, orderBy, where, limit } from "firebase/firestore";

export function useProducts(filters = {}) {
  const result = useSWRSubscription(
    ["products", JSON.stringify(filters)], 
    (_, { next }) => {
      if (!db) {
        next(null, []);
        return () => {};
      }

      try {
        let q = query(
          collection(db, "products"), 
          orderBy("timestampCreate", "desc"),
          limit(100)
        );
        
        if (filters.tenantId) {
          q = query(q, where("tenantId", "==", filters.tenantId));
        }
        
        if (filters.status && filters.status !== 'all') {
          q = query(q, where("status", "==", filters.status));
        }
        
        if (filters.categoryId) {
          q = query(q, where("categoryId", "==", filters.categoryId));
        }

        const unsubscribe = onSnapshot(q, (snapshot) => {
          if (snapshot.metadata.fromCache && snapshot.metadata.hasPendingWrites) {
            return;
          }
          const products = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          next(null, products);
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
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 2000,
      fallbackData: [],
      keepPreviousData: true
    }
  );

  return { 
    data: result.data || [], 
    error: result.error?.message, 
    isLoading: result.data === undefined,
    refresh: result.mutate ? () => result.mutate() : undefined
  };
}
