"use client";

import useSWRSubscription from "swr/subscription";
import { db } from "../firebase";
import { collection, onSnapshot } from "firebase/firestore";

export function useCategories() {
  const { data, error } = useSWRSubscription(
    "categories", 
    (_, { next }) => {
      const ref = collection(db, "categories"); // Ensure correct reference
      const unsub = onSnapshot(
        ref,
        (snapshot) => {
          next(
            null,
            snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) // Include ID for reference
          );
        },
        (err) => next(err, null)
      );
      return () => unsub(); // Cleanup
    }
  );

  return { data, error: error?.message, isLoading: data === undefined };
}
