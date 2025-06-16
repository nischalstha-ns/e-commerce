"use client";

import useSWRSubscription from "swr/subscription";
import { db } from "../firebase";
import { collection, onSnapshot } from "firebase/firestore";

export function useBrands() {
  const { data, error } = useSWRSubscription(
    "brands", 
    (_, { next }) => {
      const ref = collection(db, "brands");
      const unsub = onSnapshot(
        ref,
        (snapshot) => {
          next(
            null,
            snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
          );
        },
        (err) => next(err, null)
      );
      return () => unsub();
    }
  );

  return { data, error: error?.message, isLoading: data === undefined };
}