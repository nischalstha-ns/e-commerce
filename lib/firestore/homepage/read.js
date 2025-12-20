"use client";

import useSWRSubscription from "swr/subscription";
import { db } from "../firebase";
import { doc, onSnapshot } from "firebase/firestore";

export function useHomepageSettings(isAuthenticated = false) {
  const { data, error, mutate } = useSWRSubscription(
    'homepage-settings',
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
          console.error('Homepage settings permission error:', error.code, error.message);
          if (error.code === 'permission-denied') {
            next(null, getDefaultSettings());
          } else {
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
      fallbackData: getDefaultSettings(),
      revalidateOnFocus: false,
      revalidateOnReconnect: true
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
      title: "Welcome to Nischal Fancy Store",
      subtitle: "Discover our curated collection of premium products",
      primaryButtonText: "Shop Now",
      primaryButtonLink: "/shop",
      secondaryButtonText: "",
      secondaryButtonLink: "",
      featuredImage: "https://images.pexels.com/photos/1926769/pexels-photo-1926769.jpeg",
      backgroundImage: "",
      overlayOpacity: 5
    },
    eleganceSection: { 
      enabled: true,
      title: "Elegance & Style",
      subtitle: "Experience timeless elegance with our carefully curated collection of premium products designed to elevate your lifestyle.",
      primaryButtonText: "Explore Collection",
      primaryButtonLink: "/shop",
      featuredImage: "https://images.pexels.com/photos/1926769/pexels-photo-1926769.jpeg"
    },
    featuresSection: { 
      enabled: true
    },
    categoriesSection: { 
      enabled: true, 
      title: "Shop by Category", 
      subtitle: "Explore our collections",
      displayCount: 6
    },
    featuredSection: { 
      enabled: true, 
      title: "Featured Products", 
      subtitle: "Our handpicked selection",
      displayCount: 8
    },
    newsletterSection: { 
      enabled: true, 
      title: "Stay Updated", 
      subtitle: "Subscribe to our newsletter", 
      buttonText: "Subscribe",
      disclaimer: "No spam, unsubscribe anytime"
    },
    sectionOrder: ["hero", "features", "categories", "featured", "elegance", "newsletter"]
  };
}
