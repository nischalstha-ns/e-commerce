"use client";

import useSWRSubscription from "swr/subscription";
import { db } from "../firebase";
import { collection, onSnapshot, doc, getDoc, query, where } from "firebase/firestore";

export function useUsers() {
  const { data, error } = useSWRSubscription(
    "users", 
    (_, { next }) => {
      if (!db) {
        next(new Error("Firebase is not initialized"), null);
        return () => {}; // Return no-op function
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
        const unsub = onSnapshot(
          userRef,
          (snapshot) => {
            if (snapshot.exists()) {
              next(null, { id: snapshot.id, ...snapshot.data() });
            } else {
              next(null, null);
            }
          },
          (err) => {
            console.error("User profile subscription error:", err);
            next(err, null);
          }
        );
        return () => unsub();
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
        const ordersRef = collection(db, "orders");
        const q = query(ordersRef, where("userId", "==", userId));
        
        const unsub = onSnapshot(
          q,
          (snapshot) => {
            next(
              null,
              snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
            );
          },
          (err) => {
            console.error("User orders subscription error:", err);
            next(err, null);
          }
        );
        return () => unsub();
      } catch (error) {
        console.error("Error setting up user orders subscription:", error);
        next(error, null);
        return () => {};
      }
    }
  );

  return { data, error: error?.message, isLoading: data === undefined };
}

export function useUserReviews(userId) {
  const { data, error } = useSWRSubscription(
    userId ? ["user-reviews", userId] : null,
    (_, { next }) => {
      if (!db || !userId) {
        next(new Error("Firebase is not initialized or user ID missing"), null);
        return () => {};
      }

      try {
        const reviewsRef = collection(db, "reviews");
        const q = query(reviewsRef, where("userId", "==", userId));
        
        const unsub = onSnapshot(
          q,
          (snapshot) => {
            next(
              null,
              snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
            );
          },
          (err) => {
            console.error("User reviews subscription error:", err);
            next(err, null);
          }
        );
        return () => unsub();
      } catch (error) {
        console.error("Error setting up user reviews subscription:", error);
        next(error, null);
        return () => {};
      }
    }
  );

  return { data, error: error?.message, isLoading: data === undefined };
}

export function useUserCart(userId) {
  const { data, error } = useSWRSubscription(
    userId ? ["user-cart", userId] : null,
    (_, { next }) => {
      if (!db || !userId) {
        next(new Error("Firebase is not initialized or user ID missing"), null);
        return () => {};
      }

      try {
        const cartRef = doc(db, "carts", userId);
        const unsub = onSnapshot(
          cartRef,
          (snapshot) => {
            if (snapshot.exists()) {
              next(null, { id: snapshot.id, ...snapshot.data() });
            } else {
              next(null, { items: [] });
            }
          },
          (err) => {
            console.error("User cart subscription error:", err);
            next(err, null);
          }
        );
        return () => unsub();
      } catch (error) {
        console.error("Error setting up user cart subscription:", error);
        next(error, null);
        return () => {};
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