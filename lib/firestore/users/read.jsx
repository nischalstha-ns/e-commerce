"use client";

import useSWRSubscription from "swr/subscription";
import { db } from "../firebase";
import { collection, onSnapshot, doc, getDoc } from "firebase/firestore";

export function useUsers() {
  const { data, error } = useSWRSubscription(
    "users", 
    (_, { next }) => {
      if (!db) {
        next(new Error("Firebase is not initialized"), null);
        return;
      }

      try {
        const ref = collection(db, "users");
        const unsub = onSnapshot(
          ref,
          (snapshot) => {
            next(
              null,
              snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
            );
          },
          (err) => {
            console.error("Users subscription error:", err);
            next(err, null);
          }
        );
        return () => unsub();
      } catch (error) {
        console.error("Error setting up users subscription:", error);
        next(error, null);
      }
    }
  );

  return { data, error: error?.message, isLoading: data === undefined };
}

export async function getUserRole(userId) {
  if (!userId || !db) return null;
  
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