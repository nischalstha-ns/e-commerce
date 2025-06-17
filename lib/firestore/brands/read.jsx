"use client";

import useSWRSubscription from "swr/subscription";
import { db } from "../firebase";
import { collection, onSnapshot } from "firebase/firestore";

export function useBrands() {
  const { data, error } = useSWRSubscription(
    "brands", 
    (_, { next }) => {
      if (!db) {
        next(new Error("Firebase is not initialized"), null);
        return;
      }

      try {
        const ref = collection(db, "brands");
        const unsub = onSnapshot(
          ref,
          (snapshot) => {
            next(
              null,
              snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
            );
          },
          (err) => {
            console.error("Brands subscription error:", err);
            next(err, null);
          }
        );
        return () => unsub();
      } catch (error) {
        console.error("Error setting up brands subscription:", error);
        next(error, null);
      }
    }
  );

  return { data, error: error?.message, isLoading: data === undefined };
}