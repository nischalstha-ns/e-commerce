"use client";

import useSWRSubscription from "swr/subscription";
import { db } from "../firebase";
import { collection, onSnapshot, doc, getDoc } from "firebase/firestore";

export function useUsers() {
  const { data, error } = useSWRSubscription(
    "users", 
    (_, { next }) => {
      const ref = collection(db, "users");
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

export async function getUserRole(userId) {
  if (!userId) return null;
  
  try {
    const userDoc = await getDoc(doc(db, "users", userId));
    if (userDoc.exists()) {
      return userDoc.data().role || "user";
    }
    return "user";
  } catch (error) {
    console.error("Error fetching user role:", error);
    return "user";
  }
}