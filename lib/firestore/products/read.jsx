"use client";

import useSWRSubscription from "swr/subscription";
import { db } from "../firebase";
import { collection, onSnapshot, query, where, orderBy, limit, startAfter, getDocs } from "firebase/firestore";

export function useProducts(filters = {}) {
  const { data, error } = useSWRSubscription(
    ["products", JSON.stringify(filters)], 
    (_, { next }) => {
      let q = collection(db, "products");
      
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
      
      // Apply sorting
      q = query(q, orderBy("timestampCreate", "desc"));
      
      const unsub = onSnapshot(
        q,
        (snapshot) => {
          next(
            null,
            snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
          );
        },
        (err) => next(err, null)
      );
      return () => unsub();
    }
  );

  return { data, error: error?.message, isLoading: data === undefined };
}

export function useProductSearch(searchTerm) {
  const { data, error } = useSWRSubscription(
    ["products-search", searchTerm], 
    (_, { next }) => {
      if (!searchTerm) {
        next(null, []);
        return;
      }

      const q = query(
        collection(db, "products"),
        orderBy("name"),
        limit(20)
      );
      
      const unsub = onSnapshot(
        q,
        (snapshot) => {
          const products = snapshot.docs
            .map((doc) => ({ id: doc.id, ...doc.data() }))
            .filter(product => 
              product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
              product.description?.toLowerCase().includes(searchTerm.toLowerCase())
            );
          next(null, products);
        },
        (err) => next(err, null)
      );
      return () => unsub();
    }
  );

  return { data, error: error?.message, isLoading: data === undefined };
}