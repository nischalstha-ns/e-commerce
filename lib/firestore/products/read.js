"use client";

import useSWRSubscription from "swr/subscription";
import { db } from "../firebase";
import { collection, onSnapshot, query, orderBy, where, limit, startAfter } from "firebase/firestore";

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
          limit(50)
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

        const unsubscribe = onSnapshot(q, { includeMetadataChanges: false }, (snapshot) => {
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
      revalidateOnReconnect: false,
      fallbackData: []
    }
  );

  return { 
    data: result.data || [], 
    error: result.error?.message, 
    isLoading: result.data === undefined,
    refresh: result.mutate ? () => result.mutate() : undefined
  };
}

// Optimized search using server-side API for better performance
export function useProductSearch(searchTerm) {
  const { data, error } = useSWRSubscription(
    searchTerm && searchTerm.length > 2 ? ["products-search", searchTerm] : null, 
    async (_, { next }) => {
      if (!searchTerm || searchTerm.length < 3) {
        next(null, []);
        return () => {};
      }

      try {
        // Use API endpoint for search to avoid client-side filtering
        const response = await fetch(`/api/products/search?q=${encodeURIComponent(searchTerm)}&limit=20`);
        
        if (!response.ok) {
          throw new Error('Search failed');
        }
        
        const products = await response.json();
        next(null, products);
        
        return () => {}; // No cleanup needed for API calls
      } catch (error) {
        next(null, []);
        return () => {};
      }
    },
    { 
      revalidateOnFocus: false, 
      dedupingInterval: 5000,
      fallbackData: []
    }
  );

  return { data: data || [], error: error?.message, isLoading: data === undefined };
}

// Single product hook
export { useProduct } from './readSingle';

// Paginated products hook for better performance
export function useProductsPaginated(pageSize = 20, filters = {}) {
  const { data, error } = useSWRSubscription(
    ["products-paginated", pageSize, JSON.stringify(filters)], 
    (_, { next }) => {
      if (!db) {
        next(null, { products: [], hasMore: false });
        return () => {};
      }

      try {
        let q = query(
          collection(db, "products"), 
          orderBy("timestampCreate", "desc"),
          limit(pageSize)
        );
        
        if (filters.status && filters.status !== 'all') {
          q = query(q, where("status", "==", filters.status));
        }

        const unsubscribe = onSnapshot(q, (snapshot) => {
          if (!snapshot.metadata.hasPendingWrites) {
            const products = snapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            }));
            
            const hasMore = snapshot.docs.length === pageSize;
            next(null, { products, hasMore, lastDoc: snapshot.docs[snapshot.docs.length - 1] });
          }
        }, (error) => {
          next(null, { products: [], hasMore: false });
        });

        return unsubscribe;
      } catch (error) {
        next(null, { products: [], hasMore: false });
        return () => {};
      }
    },
    { 
      revalidateOnFocus: false, 
      dedupingInterval: 10000,
      fallbackData: { products: [], hasMore: false }
    }
  );

  return { 
    data: data?.products || [], 
    hasMore: data?.hasMore || false,
    lastDoc: data?.lastDoc,
    error: error?.message, 
    isLoading: data === undefined 
  };
}