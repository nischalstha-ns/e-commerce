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
          const settings = doc.exists() ? { ...getDefaultSettings(), ...doc.data() } : getDefaultSettings();
          next(null, settings);
        }, (error) => {
          if (error.code === 'permission-denied') {
            console.warn('Using default settings due to permissions');
            next(null, getDefaultSettings());
          } else {
            console.error('Homepage settings fetch error:', error);
            next(null, getDefaultSettings());
          }
        });

        return unsubscribe;
      } catch (error) {
        console.error('Homepage settings subscription error:', error);
        next(null, getDefaultSettings());
        return () => {};
      }
    },
    { 
      revalidateOnFocus: false,
      refreshInterval: 0,
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
    lastUpdated: new Date().toISOString(),
    version: "1.0.0",
    heroSection: { 
      enabled: true,
      title: "Nischal Fancy Store",
      subtitle: "Discover our curated collection of premium products at NFS.",
      primaryButtonText: "Shop Collection",
      primaryButtonLink: "/shop",
      featuredImage: "https://images.pexels.com/photos/1926769/pexels-photo-1926769.jpeg",
      backgroundImage: "https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg",
      overlayOpacity: 5
    },
    featuresSection: { 
      enabled: true,
      title: "Why Choose Us",
      features: [
        { icon: "truck", title: "Free Shipping", description: "On orders over Rs. 500" },
        { icon: "shield", title: "Secure Payment", description: "100% secure checkout" },
        { icon: "star", title: "Premium Quality", description: "Carefully curated items" },
        { icon: "headphones", title: "24/7 Support", description: "Always here to help" }
      ]
    },
    categoriesSection: { 
      enabled: true, 
      title: "Shop by Category", 
      subtitle: "Explore our carefully curated collections",
      displayCount: 6
    },
    featuredSection: { 
      enabled: true, 
      title: "Featured Products", 
      subtitle: "Handpicked favorites",
      displayCount: 8
    },
    newsletterSection: { 
      enabled: true, 
      title: "Stay in the Loop", 
      subtitle: "Be the first to know about new arrivals", 
      buttonText: "Subscribe",
      disclaimer: "No spam, unsubscribe at any time"
    },
    sectionOrder: ["hero", "features", "categories", "featured", "newsletter"]
  };
}