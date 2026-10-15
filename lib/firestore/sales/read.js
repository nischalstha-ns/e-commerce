"use client";

import useSWRSubscription from "swr/subscription";
import { db } from "../firebase";
import { collection, onSnapshot, query, orderBy, limit, where } from "firebase/firestore";

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

export function useTodaySales() {
  const { data, error } = useSWRSubscription(
    "todaySales",
    (_, { next }) => {
      if (!db) {
        next(null, { count: 0, total: 0 });
        return () => {};
      }
      try {
        const q = query(
          collection(db, "sales"),
          where("timestampCreate", ">=", startOfToday()),
          orderBy("timestampCreate", "desc")
        );
        const unsubscribe = onSnapshot(
          q,
          (snapshot) => {
            const sales = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
            next(null, {
              count: sales.length,
              total: sales.reduce((s, x) => s + (Number(x.total) || 0), 0),
              sales,
            });
          },
          (err) => next(err, { count: 0, total: 0 })
        );
        return unsubscribe;
      } catch (err) {
        next(err, { count: 0, total: 0 });
        return () => {};
      }
    },
    { fallbackData: { count: 0, total: 0 } }
  );

  return {
    data: data || { count: 0, total: 0 },
    error: error?.message,
    isLoading: data === undefined,
  };
}

export function useRecentSales(count = 5) {
  const { data, error } = useSWRSubscription(
    ["recentSales", count],
    (_, { next }) => {
      if (!db) {
        next(null, []);
        return () => {};
      }
      try {
        const q = query(
          collection(db, "sales"),
          orderBy("timestampCreate", "desc"),
          limit(count)
        );
        const unsubscribe = onSnapshot(
          q,
          (snapshot) => {
            next(
              null,
              snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))
            );
          },
          (err) => next(err, [])
        );
        return unsubscribe;
      } catch (err) {
        next(err, []);
        return () => {};
      }
    },
    { fallbackData: [] }
  );

  return {
    data: data || [],
    error: error?.message,
    isLoading: data === undefined,
  };
}
