"use client";

import useSWRSubscription from "swr/subscription";
import { db } from "../firebase";
import { collection, onSnapshot } from "firebase/firestore";

export function useAdmins() {
  const { data, error } = useSWRSubscription(
    "admins", 
    (_, { next }) => {
      if (!db) {
        next(new Error("Firebase is not initialized"), null);
        return () => {}; // Return no-op function
      }

      try {
        const ref = collection(db, "admins");
        const unsub = onSnapshot(
          ref,
          (snapshot) => {
            next(
              null,
              snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
            );
          },
          (err) => {
            console.error("Admins subscription error:", err);
            next(err, null);
          }
        );
        return () => unsub();
      } catch (error) {
        console.error("Error setting up admins subscription:", error);
        next(error, null);
        return () => {}; // Return no-op function
      }
    }
  );

  return { data, error: error?.message, isLoading: data === undefined };
}

export async function checkAdminStatus(email) {
  if (!email || !db) return false;
  
  try {
    const { collection, query, where, getDocs } = await import("firebase/firestore");
    const adminsRef = collection(db, "admins");
    const q = query(adminsRef, where("email", "==", email));
    const querySnapshot = await getDocs(q);
    
    return !querySnapshot.empty;
  } catch (error) {
    console.error("Error checking admin status:", error);
    return false;
  }
}