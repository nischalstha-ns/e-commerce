"use client";

import useSWRSubscription from "swr/subscription";
import { db } from "../firebase";
import { collection, onSnapshot, query, orderBy, where, doc } from "firebase/firestore";

export function useUsers() {
  const { data, error } = useSWRSubscription(
    "users", 
    (_, { next }) => {
      if (!db) {
        next(new Error("Firebase is not initialized"), null);
        return () => {}; // Return no-op function
      }

      try {
        const q = query(collection(db, "users"), orderBy("timestampCreate", "desc"));

        const unsubscribe = onSnapshot(q, (snapshot) => {
          const users = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          next(null, users);
        }, (error) => {
          next(error, null);
        });

        return unsubscribe;
      } catch (error) {
        console.error("Error setting up users subscription:", error);
        next(error, null);
        return () => {}; // Return no-op function
      }
    }
  );

  return { data, error: error?.message, isLoading: data === undefined };
}

export function useUserProfile(userId) {
  const { data, error } = useSWRSubscription(
    userId ? ["user-profile", userId] : null,
    (_, { next }) => {
      if (!db || !userId) {
        next(new Error("Firebase is not initialized or user ID missing"), null);
        return () => {};
      }

      try {
        const userRef = doc(db, "users", userId);

        const unsubscribe = onSnapshot(userRef, (doc) => {
          if (doc.exists()) {
            next(null, {
              id: doc.id,
              ...doc.data()
            });
          } else {
            next(null, null);
          }
        }, (error) => {
          next(error, null);
        });

        return unsubscribe;
      } catch (error) {
        console.error("Error setting up user profile subscription:", error);
        next(error, null);
        return () => {};
      }
    }
  );

  return { data, error: error?.message, isLoading: data === undefined };
}

export function useUserOrders(userId) {
  const { data, error } = useSWRSubscription(
    userId ? ["user-orders", userId] : null,
    (_, { next }) => {
      if (!db || !userId) {
        next(new Error("Firebase is not initialized or user ID missing"), null);
        return () => {};
      }

      try {
        const q = query(
          collection(db, "orders"), 
          where("userId", "==", userId),
          orderBy("timestampCreate", "desc")
        );

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
        console.error("Error setting up user orders subscription:", error);
        next(error, null);
        return () => {};
      }
    }
  );

  return { data, error: error?.message, isLoading: data === undefined };
}