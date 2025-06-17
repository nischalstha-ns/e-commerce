"use client";

import useSWRSubscription from "swr/subscription";
import { db } from "../firebase";
import { collection, onSnapshot, query, where, orderBy } from "firebase/firestore";

export function useOrders(filters = {}) {
  const { data, error } = useSWRSubscription(
    ["orders", JSON.stringify(filters)], 
    (_, { next }) => {
      if (!db) {
        next(new Error("Firebase is not initialized"), null);
        return;
      }

      try {
        let q = collection(db, "orders");
        
        if (filters.status) {
          q = query(q, where("status", "==", filters.status));
        }
        if (filters.userId) {
          q = query(q, where("userId", "==", filters.userId));
        }
        
        q = query(q, orderBy("timestampCreate", "desc"));
        
        const unsub = onSnapshot(
          q,
          (snapshot) => {
            next(
              null,
              snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
            );
          },
          (err) => {
            console.error("Orders subscription error:", err);
            next(err, null);
          }
        );
        return () => unsub();
      } catch (error) {
        console.error("Error setting up orders subscription:", error);
        next(error, null);
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
        return;
      }

      try {
        const ref = collection(db, "orders");
        const unsub = onSnapshot(
          ref,
          (snapshot) => {
            const orders = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
            
            const stats = {
              total: orders.length,
              pending: orders.filter(o => o.status === "pending").length,
              processing: orders.filter(o => o.status === "processing").length,
              shipped: orders.filter(o => o.status === "shipped").length,
              delivered: orders.filter(o => o.status === "delivered").length,
              cancelled: orders.filter(o => o.status === "cancelled").length,
              totalRevenue: orders
                .filter(o => o.status !== "cancelled")
                .reduce((sum, order) => sum + (order.total || 0), 0)
            };
            
            next(null, stats);
          },
          (err) => {
            console.error("Order stats subscription error:", err);
            next(err, null);
          }
        );
        return () => unsub();
      } catch (error) {
        console.error("Error setting up order stats subscription:", error);
        next(error, null);
      }
    }
  );

  return { data, error: error?.message, isLoading: data === undefined };
}