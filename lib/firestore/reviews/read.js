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
        let q = query(collection(db, "reviews"), orderBy("timestampCreate", "desc"));
        
        // Apply filters
        if (filters.status) {
          q = query(q, where("status", "==", filters.status));
        }
        if (filters.rating) {
          q = query(q, where("rating", "==", parseInt(filters.rating)));
        }

        const unsubscribe = onSnapshot(q, (snapshot) => {
          const reviews = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          next(null, reviews);
        }, (error) => {
          next(error, null);
        });

        return unsubscribe;
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
        const q = query(collection(db, "reviews"));

        const unsubscribe = onSnapshot(q, (snapshot) => {
          const reviews = snapshot.docs.map(doc => doc.data());
          
          const stats = {
            total: reviews.length,
            approved: reviews.filter(review => review.status === "approved").length,
            pending: reviews.filter(review => review.status === "pending").length,
            rejected: reviews.filter(review => review.status === "rejected").length,
            averageRating: reviews.length > 0 
              ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
              : "0.0",
            ratingDistribution: {
              5: reviews.filter(review => review.rating === 5).length,
              4: reviews.filter(review => review.rating === 4).length,
              3: reviews.filter(review => review.rating === 3).length,
              2: reviews.filter(review => review.rating === 2).length,
              1: reviews.filter(review => review.rating === 1).length,
            }
          };
          
          next(null, stats);
        }, (error) => {
          next(error, null);
        });

        return unsubscribe;
      } catch (error) {
        console.error("Error setting up review stats subscription:", error);
        next(error, null);
        return () => {}; // Return no-op function
      }
    }
  );

  return { data, error: error?.message, isLoading: data === undefined };
}