"use client";

import useSWRSubscription from "swr/subscription";
import { db } from "../firebase";
import { collection, onSnapshot, query, doc } from "firebase/firestore";

export function useUsers() {
  const { data, error } = useSWRSubscription(
    "users",
    (_, { next }) => {
      if (!db) {
        console.warn("Firestore not initialized for users");
        next(null, []);
        return () => {};
      }

      try {
        const q = query(collection(db, "users"));

        const unsubscribe = onSnapshot(q, (snapshot) => {
          const users = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          next(null, users);
        }, (error) => {
          console.error("Users fetch error:", error);
          next(null, []);
        });

        return unsubscribe;
      } catch (error) {
        console.error("Users subscription error:", error);
        next(null, []);
        return () => {};
      }
    },
    { fallbackData: [] }
  );

  return { data: data || [], error: error?.message, isLoading: data === undefined };
}

export function useUserProfile(userId) {
  const { data, error } = useSWRSubscription(
    userId ? ["userProfile", userId] : null,
    (_, { next }) => {
      if (!db || !userId) {
        next(null, null);
        return () => {};
      }

      try {
        const unsubscribe = onSnapshot(doc(db, "users", userId), (snapshot) => {
          if (snapshot.exists()) {
            next(null, { id: snapshot.id, ...snapshot.data() });
          } else {
            next(null, null);
          }
        }, (error) => {
          console.error("User profile fetch error:", error);
          next(null, null);
        });

        return unsubscribe;
      } catch (error) {
        console.error("User profile subscription error:", error);
        next(null, null);
        return () => {};
      }
    },
    { fallbackData: null }
  );

  return { data, error: error?.message, isLoading: data === undefined };
}
