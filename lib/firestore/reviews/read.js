"use client";

import { useMemo } from "react";
import useSWRSubscription from "swr/subscription";
import { db } from "../firebase";
import { collection, onSnapshot, query } from "firebase/firestore";

export function useReviews(filters = {}) {
  const { data, error } = useSWRSubscription(
    ["reviews", JSON.stringify(filters)],
    (_, { next }) => {
      if (!db) {
        console.warn("Firestore not initialized for reviews");
        next(null, []);
        return () => {};
      }

      try {
        const q = query(collection(db, "reviews"));

        const unsubscribe = onSnapshot(q, (snapshot) => {
          let reviews = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          // Filter client-side (avoids composite-index requirements).
          if (filters.status && filters.status !== "all") {
            reviews = reviews.filter(r => r.status === filters.status);
          }
          if (filters.rating && filters.rating !== "all") {
            reviews = reviews.filter(r => Number(r.rating) === Number(filters.rating));
          }
          if (filters.productId) {
            reviews = reviews.filter(r => r.productId === filters.productId);
          }
          next(null, reviews);
        }, (error) => {
          console.error("Reviews fetch error:", error);
          next(null, []);
        });

        return unsubscribe;
      } catch (error) {
        console.error("Reviews subscription error:", error);
        next(null, []);
        return () => {};
      }
    },
    { fallbackData: [] }
  );

  return { data: data || [], error: error?.message, isLoading: data === undefined };
}

export function useReviewStats() {
  const { data, error, isLoading } = useReviews();

  const stats = useMemo(() => {
    const list = data || [];
    const byStatus = { approved: 0, pending: 0, rejected: 0 };
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let ratingSum = 0;
    let ratedCount = 0;

    for (const r of list) {
      const s = r.status || "pending";
      if (s in byStatus) byStatus[s]++;
      const rating = Math.round(Number(r.rating));
      if (rating >= 1 && rating <= 5) {
        distribution[rating]++;
        ratingSum += rating;
        ratedCount++;
      }
    }

    return {
      total: list.length,
      approved: byStatus.approved,
      pending: byStatus.pending,
      rejected: byStatus.rejected,
      averageRating: ratedCount > 0 ? ratingSum / ratedCount : 0,
      ratingDistribution: distribution,
    };
  }, [data]);

  return { data: stats, error, isLoading };
}
