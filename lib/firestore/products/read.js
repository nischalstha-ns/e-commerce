"use client";

import useSWRSubscription from "swr/subscription";
import { db } from "../firebase";
import { collection, onSnapshot, query, orderBy, where } from "firebase/firestore";

export function useProducts(filters = {}) {
  const { data, error } = useSWRSubscription(
    ["products", JSON.stringify(filters)], 
    (_, { next }) => {
      if (!db) {
        next(null, []); // Return empty array instead of error
        return () => {};
      }

      try {
        let q = query(
          collection(db, "products"), 
          orderBy("timestampCreate", "desc")
        );
        
        // Only filter by active status if not in admin mode
        if (!filters.adminMode) {
          q = query(q, where("status", "==", "active"));
        }
        
        // Apply status filter if specified
        if (filters.status) {
          q = query(q, where("status", "==", filters.status));
        }
        
        if (filters.category) {
          q = query(q, where("categoryId", "==", filters.category));
        }
        if (filters.brand) {
          q = query(q, where("brandId", "==", filters.brand));
        }

        const unsubscribe = onSnapshot(q, (snapshot) => {
          const products = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          next(null, products);
        }, (error) => {
          console.warn('Products fetch error:', error);
          next(null, []); // Return empty array on error
        });

        return unsubscribe;
      } catch (error) {
        next(null, []);
        return () => {};
      }
    },
    { 
      revalidateOnFocus: false, 
      dedupingInterval: 10000,
      fallbackData: [] // Provide immediate fallback
    }
  );

  return { data: data || [], error: error?.message, isLoading: data === undefined };
}

export function useProductSearch(searchTerm) {
  const { data, error } = useSWRSubscription(
    searchTerm && searchTerm.length > 2 ? ["products-search", searchTerm] : null, 
    (_, { next }) => {
      if (!db || !searchTerm || searchTerm.length < 3) {
        next(null, []);
        return () => {};
      }

      try {
        const q = query(
          collection(db, "products"),
          where("status", "==", "active"),
          orderBy("name")
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
          if (!snapshot.metadata.hasPendingWrites) {
            const searchLower = searchTerm.toLowerCase();
            const products = snapshot.docs
              .map(doc => ({ id: doc.id, ...doc.data() }))
              .filter(product => 
                product.name?.toLowerCase().includes(searchLower) ||
                product.description?.toLowerCase().includes(searchLower)
              )
              .slice(0, 20); // Limit results
            next(null, products);
          }
        }, (error) => {
          next(error, null);
        });

        return unsubscribe;
      } catch (error) {
        next(error, null);
        return () => {};
      }
    },
    { revalidateOnFocus: false, dedupingInterval: 10000 }
  );

  return { data: data || [], error: error?.message, isLoading: data === undefined };
}