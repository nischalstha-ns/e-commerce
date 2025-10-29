"use client";

import useSWRSubscription from "swr/subscription";
import { db } from "../firebase";
import { doc, onSnapshot } from "firebase/firestore";

export function useHomepageSettings() {
  const { data, error, mutate } = useSWRSubscription(
    "homepage-settings",
    (_, { next }) => {
      if (!db) {
        next(null, getDefaultSettings());
        return () => {};
      }

      try {
        const settingsRef = doc(db, "settings", "homepage");

        const unsubscribe = onSnapshot(settingsRef, (doc) => {
          const settings = doc.exists() ? doc.data() : getDefaultSettings();
          next(null, settings);
        }, (error) => {
          console.warn('Homepage settings fetch error:', error);
          next(null, getDefaultSettings());
        });

        return unsubscribe;
      } catch (error) {
        next(null, getDefaultSettings());
        return () => {};
      }
    },
    { 
      revalidateOnFocus: true,
      refreshInterval: 1000,
      fallbackData: getDefaultSettings()
    }
  );

  return { 
    data: data || getDefaultSettings(), 
    error: error?.message, 
    isLoading: data === undefined,
    mutate
  };
}

function getDefaultSettings() {
  return {
    theme: {
      name: "default",
      colors: {
        primary: "#000000",
        secondary: "#6B7280",
        accent: "#3B82F6",
        background: "#FFFFFF",
        text: "#111827"
      }
    },
    heroSection: { 
      enabled: true,
      title: "Timeless",
      subtitle: "Discover our curated collection of premium products.",
      primaryButtonText: "Shop Collection",
      primaryButtonLink: "/shop",
      featuredImage: "https://images.pexels.com/photos/1926769/pexels-photo-1926769.jpeg"
    },
    featuresSection: { enabled: true },
    categoriesSection: { enabled: true, title: "Shop by Category", subtitle: "Explore our carefully curated collections" },
    featuredSection: { enabled: true, title: "Featured Products", subtitle: "Handpicked favorites" },
    newsletterSection: { enabled: true, title: "Stay in the Loop", subtitle: "Be the first to know about new arrivals", buttonText: "Subscribe" }
  };
}