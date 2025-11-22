"use client";

import useSWRSubscription from "swr/subscription";
import { db } from "../firebase";
import { collection, onSnapshot, query, orderBy, where, limit } from "firebase/firestore";

export function useTodaySales() {
  const result = useSWRSubscription("today-sales", (_, { next }) => {
    if (!db) {
      next(null, { sales: [], total: 0, count: 0 });
      return () => {};
    }

    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const q = query(
        collection(db, "orders"),
        where("type", "==", "pos"),
        where("timestampCreate", ">=", today),
        orderBy("timestampCreate", "desc")
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const sales = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const total = sales.reduce((sum, sale) => sum + (sale.total || 0), 0);
        next(null, { sales, total, count: sales.length });
      }, () => next(null, { sales: [], total: 0, count: 0 }));

      return unsubscribe;
    } catch {
      next(null, { sales: [], total: 0, count: 0 });
      return () => {};
    }
  }, { fallbackData: { sales: [], total: 0, count: 0 } });

  return { data: result.data, isLoading: result.data === undefined };
}

export function useRecentSales(limitCount = 10) {
  const result = useSWRSubscription(["recent-sales", limitCount], (_, { next }) => {
    if (!db) {
      next(null, []);
      return () => {};
    }

    try {
      const q = query(
        collection(db, "orders"),
        where("type", "==", "pos"),
        orderBy("timestampCreate", "desc"),
        limit(limitCount)
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const sales = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        next(null, sales);
      }, () => next(null, []));

      return unsubscribe;
    } catch {
      next(null, []);
      return () => {};
    }
  }, { fallbackData: [] });

  return { data: result.data || [], isLoading: result.data === undefined };
}
