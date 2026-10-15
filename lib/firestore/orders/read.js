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
        return () => {};
      }

      try {
        let q = query(collection(db, "orders"), orderBy("timestampCreate", "desc"));
        
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
        return () => {};
      }
    }
  );

  return { data, error: error?.message, isLoading: data === undefined };
}

export function useOrderStats() {
  const { data, error } = useSWRSubscription(
    "orderStats",
    (_, { next }) => {
      if (!db) {
        console.warn("Firestore not initialized for order stats");
        next(null, { total: 0, pending: 0, totalRevenue: 0 });
        return () => {};
      }

      try {
        const q = query(collection(db, "orders"));

        const unsubscribe = onSnapshot(q, (snapshot) => {
          const orders = snapshot.docs.map(doc => doc.data());
          const total = orders.length;
          const byStatus = {
            pending: 0, accepted: 0, shipped: 0,
            delivered: 0, rejected: 0, cancelled: 0,
          };
          let totalRevenue = 0;
          for (const order of orders) {
            const s = order.status || "pending";
            if (s in byStatus) byStatus[s]++;
            // Orders may store `total` or the legacy `totalAmount`.
            totalRevenue += Number(order.total ?? order.totalAmount) || 0;
          }
          next(null, { total, ...byStatus, totalRevenue });
        }, (error) => {
          console.error("Order stats fetch error:", error);
          next(null, { total: 0, pending: 0, totalRevenue: 0 });
        });

        return unsubscribe;
      } catch (error) {
        console.error("Order stats subscription error:", error);
        next(null, { total: 0, pending: 0, totalRevenue: 0 });
        return () => {};
      }
    },
    { fallbackData: { total: 0, pending: 0, totalRevenue: 0 } }
  );

  return { data: data || { total: 0, pending: 0, totalRevenue: 0 }, error: error?.message, isLoading: data === undefined };
}

export function useUserOrders(userId) {
  const { data, error } = useSWRSubscription(
    userId ? ["userOrders", userId] : null,
    (_, { next }) => {
      if (!db || !userId) {
        next(null, []);
        return () => {};
      }

      try {
        const q = query(
          collection(db, "orders"),
          where("userId", "==", userId),
          orderBy("timestampCreate", "desc")
        );

        const unsubscribe = onSnapshot(
          q,
          (snapshot) => {
            const orders = snapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));
            next(null, orders);
          },
          (error) => {
            // Missing composite index or permission issue — surface it
            // instead of silently rendering an empty list.
            next(error, null);
          }
        );

        return unsubscribe;
      } catch (error) {
        next(error, null);
        return () => {};
      }
    },
    { fallbackData: [] }
  );

  return { data: data || [], error: error?.message, isLoading: data === undefined };
}
