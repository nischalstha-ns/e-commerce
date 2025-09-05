"use client";

import useSWRSubscription from "swr/subscription";
import { db } from "../firebase";
import { doc, onSnapshot } from "firebase/firestore";

export function useHomepageSettings() {
  const { data, error } = useSWRSubscription(
    "homepage-settings",
    (_, { next }) => {
      if (!db) {
        next(null, {});
        return () => {};
      }

      try {
        const settingsRef = doc(db, "settings", "homepage");

        const unsubscribe = onSnapshot(settingsRef, (doc) => {
          if (doc.exists()) {
            next(null, doc.data());
          } else {
            // Return default settings if document doesn't exist
            next(null, {
              heroSection: { enabled: true },
              featuresSection: { enabled: true },
              categoriesSection: { enabled: true },
              featuredSection: { enabled: true },
              newsletterSection: { enabled: true }
            });
          }
        }, (error) => {
          console.warn('Homepage settings fetch error:', error);
          next(null, {});
        });

        return unsubscribe;
      } catch (error) {
        next(null, {});
        return () => {};
      }
    },
    { 
      revalidateOnFocus: false, 
      dedupingInterval: 10000,
      fallbackData: {}
    }
  );

  return { data: data || {}, error: error?.message, isLoading: data === undefined };
}