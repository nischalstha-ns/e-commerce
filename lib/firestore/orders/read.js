"use client";

import useSWRSubscription from "swr/subscription";
import { db } from "../firebase";
import { collection, onSnapshot, query, orderBy, where } from "firebase/firestore";

export function useOrders(filters = {}) {
  const { data, error } = useSWRSubscription(
    ["orders", JSON.stringify(filters)], 
    (_, { next }) => {
      if (!db) {
        next(new Error("Firebase is not initialized"), null);
        return () => {}; // Return no-op function
      }

      try {
        let q = query(collection(db, "orders"), orderBy("timestampCreate", "desc"));
        
        // Apply filters
        if (filters.status) {
          q = query(q, where("status", "==", filters.status));
        }

        const unsubscribe = onSnapshot(q, (snapshot) => {
          const orders = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          next(null, orders);
        }, (error) => {
          next(error, null);
        });

        return unsubscribe;
      } catch (error) {
        console.error("Error setting up orders subscription:", error);
        next(error, null);
        return () => {}; // Return no-op function
      }
    }
  );

  return { data, error: error?.message, isLoading: data === undefined };
}

export function useOrderStats() {
  const { data, error } = useSWRSubscription(
    "order-stats", 
    (_, { next }) => {
      if (!db) {
        next(new Error("Firebase is not initialized"), null);
        return () => {}; // Return no-op function
      }

      try {
        const q = query(collection(db, "orders"));

        const unsubscribe = onSnapshot(q, (snapshot) => {
          const orders = snapshot.docs.map(doc => doc.data());
          
          const stats = {
            total: orders.length,
            pending: orders.filter(order => order.status === "pending").length,
            processing: orders.filter(order => order.status === "processing").length,
            shipped: orders.filter(order => order.status === "shipped").length,
            delivered: orders.filter(order => order.status === "delivered").length,
            cancelled: orders.filter(order => order.status === "cancelled").length,
            totalRevenue: orders.reduce((sum, order) => sum + (order.total || 0), 0)
          };
          
          next(null, stats);
        }, (error) => {
          next(error, null);
        });

        return unsubscribe;
      } catch (error) {
        console.error("Error setting up order stats subscription:", error);
        next(error, null);
        return () => {}; // Return no-op function
      }
    }
  );

  return { data, error: error?.message, isLoading: data === undefined };
}