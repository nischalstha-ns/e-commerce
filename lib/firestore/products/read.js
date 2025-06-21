"use client";

import useSWRSubscription from "swr/subscription";
import { db } from "../firebase";
import { collection, onSnapshot, query, orderBy, where } from "firebase/firestore";

export function useProducts(filters = {}) {
  const { data, error } = useSWRSubscription(
    ["products", JSON.stringify(filters)], 
    (_, { next }) => {
      if (!db) {
        next(new Error("Firebase is not initialized"), null);
        return () => {}; // Return no-op function
      }

      try {
        let q = query(collection(db, "products"), orderBy("timestampCreate", "desc"));
        
        // Apply filters
        if (filters.category) {
          q = query(q, where("categoryId", "==", filters.category));
        }
        if (filters.brand) {
          q = query(q, where("brandId", "==", filters.brand));
        }
        if (filters.status) {
          q = query(q, where("status", "==", filters.status));
        }

        const unsubscribe = onSnapshot(q, (snapshot) => {
          const products = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          next(null, products);
        }, (error) => {
          next(error, null);
        });

        return unsubscribe;
      } catch (error) {
        console.error("Error setting up products subscription:", error);
        next(error, null);
        return () => {}; // Return no-op function
      }
    }
  );

  return { data, error: error?.message, isLoading: data === undefined };
}

export function useProductSearch(searchTerm) {
  const { data, error } = useSWRSubscription(
    ["products-search", searchTerm], 
    (_, { next }) => {
      if (!db) {
        next(new Error("Firebase is not initialized"), null);
        return () => {}; // Return no-op function
      }

      if (!searchTerm) {
        next(null, []);
        return () => {}; // Return no-op function for empty search
      }

      try {
        // Firebase doesn't support full-text search, so we'll use a simple approach
        // For better search, consider using Algolia or similar service
        const q = query(collection(db, "products"), orderBy("name"));

        const unsubscribe = onSnapshot(q, (snapshot) => {
          const products = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })).filter(product => 
            product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.description?.toLowerCase().includes(searchTerm.toLowerCase())
          );
          next(null, products);
        }, (error) => {
          next(error, null);
        });

        return unsubscribe;
      } catch (error) {
        console.error("Error setting up product search subscription:", error);
        next(error, null);
        return () => {}; // Return no-op function
      }
    }
  );

  return { data, error: error?.message, isLoading: data === undefined };
}