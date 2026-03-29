"use client";

import useSWRSubscription from "swr/subscription";
import { db } from "../firebase";
import { collection, onSnapshot, query, orderBy, where, limit, getDocs } from "firebase/firestore";
import useSWR from "swr";

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

export function useProductSearch(searchTerm) {
  const { data, error, isLoading } = useSWR(
    searchTerm && searchTerm.trim().length >= 2 ? ["product-search", searchTerm.trim()] : null,
    async () => {
      if (!db) return [];
      const term = searchTerm.trim().toLowerCase();
      const q = query(
        collection(db, "products"),
        orderBy("name"),
        limit(50)
      );
      const snapshot = await getDocs(q);
      const all = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      return all.filter(
        (p) =>
          p.name?.toLowerCase().includes(term) ||
          p.description?.toLowerCase().includes(term) ||
          p.sku?.toLowerCase().includes(term)
      );
    },
    { revalidateOnFocus: false, dedupingInterval: 500 }
  );

  return { data: data || [], error: error?.message, isLoading };
}
