"use client";

import useSWRSubscription from "swr/subscription";
import { db } from "../firebase";
import { doc, onSnapshot, collection, query } from "firebase/firestore";

export function useUserProfile(userId) {
  const { data, error } = useSWRSubscription(
    userId ? ["user-profile", userId] : null,
    (_, { next }) => {
      if (!db || !userId) {
        next(null, null);
        return () => {};
      }

      try {
        const userRef = doc(db, "users", userId);
        
        const unsubscribe = onSnapshot(userRef, (snapshot) => {
          if (snapshot.exists()) {
            next(null, { id: snapshot.id, ...snapshot.data() });
          } else {
            next(null, null);
          }
        }, (error) => {
          next(error, null);
        });

        return unsubscribe;
      } catch (error) {
        next(error, null);
        return () => {};
      }
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false
    }
  );

  return { data, error: error?.message, isLoading: data === undefined };
}

export function useUsers() {
  const { data, error } = useSWRSubscription(
    "users",
    (_, { next }) => {
      if (!db) {
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
          next(null, []);
        });

        return unsubscribe;
      } catch (error) {
        next(null, []);
        return () => {};
      }
    },
    {
      revalidateOnFocus: false
    }
  );

  return { data, error: error?.message, isLoading: data === undefined };
}
