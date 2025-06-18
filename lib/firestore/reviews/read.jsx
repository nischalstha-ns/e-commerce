"use client";

import useSWRSubscription from "swr/subscription";
import { db } from "../firebase";
import { collection, onSnapshot, query, orderBy, where } from "firebase/firestore";

export function useReviews(filters = {}) {
  const { data, error } = useSWRSubscription(
    ["reviews", JSON.stringify(filters)], 
    (_, { next }) => {
      if (!db) {
        next(new Error("Firebase is not initialized"), null);
        return () => {}; // Return no-op function
      }

      try {
        let q = collection(db, "reviews");
        
        // Apply filters
        if (filters.productId) {
          q = query(q, where("productId", "==", filters.productId));
        }
        if (filters.status) {
          q = query(q, where("status", "==", filters.status));
        }
        if (filters.rating) {
          q = query(q, where("rating", "==", parseInt(filters.rating)));
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
          (err) => {
            console.error("Reviews subscription error:", err);
            next(err, null);
          }
        );
        return () => unsub();
      } catch (error) {
        console.error("Error setting up reviews subscription:", error);
        next(error, null);
        return () => {}; // Return no-op function
      }
    }
  );

  return { data, error: error?.message, isLoading: data === undefined };
}

export function useReviewStats() {
  const { data, error } = useSWRSubscription(
    "review-stats", 
    (_, { next }) => {
      if (!db) {
        next(new Error("Firebase is not initialized"), null);
        return () => {}; // Return no-op function
      }

      try {
        const ref = collection(db, "reviews");
        const unsub = onSnapshot(
          ref,
          (snapshot) => {
            const reviews = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
            
            const stats = {
              total: reviews.length,
              approved: reviews.filter(r => r.status === "approved").length,
              pending: reviews.filter(r => r.status === "pending").length,
              rejected: reviews.filter(r => r.status === "rejected").length,
              averageRating: reviews.length > 0 
                ? (reviews.reduce((sum, review) => sum + (review.rating || 0), 0) / reviews.length).toFixed(1)
                : 0,
              ratingDistribution: {
                5: reviews.filter(r => r.rating === 5).length,
                4: reviews.filter(r => r.rating === 4).length,
                3: reviews.filter(r => r.rating === 3).length,
                2: reviews.filter(r => r.rating === 2).length,
                1: reviews.filter(r => r.rating === 1).length,
              }
            };
            
            next(null, stats);
          },
          (err) => {
            console.error("Review stats subscription error:", err);
            next(err, null);
          }
        );
        return () => unsub();
      } catch (error) {
        console.error("Error setting up review stats subscription:", error);
        next(error, null);
        return () => {}; // Return no-op function
      }
    }
  );

  return { data, error: error?.message, isLoading: data === undefined };
}