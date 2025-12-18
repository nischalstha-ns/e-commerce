"use client";

import useSWRSubscription from "swr/subscription";
import { db } from "../firebase";
import { doc, onSnapshot } from "firebase/firestore";

export function useNavigation() {
  const { data, error } = useSWRSubscription(
    'navigation-settings',
    (_, { next }) => {
      if (!db) {
        next(null, getDefaultNavigation());
        return () => {};
      }

      const navRef = doc(db, "settings", "navigation");
      const unsubscribe = onSnapshot(navRef, (doc) => {
        const nav = doc.exists() ? doc.data() : getDefaultNavigation();
        next(null, nav);
      }, () => {
        next(null, getDefaultNavigation());
      });

      return unsubscribe;
    },
    { fallbackData: getDefaultNavigation() }
  );

  return { data: data || getDefaultNavigation(), error, isLoading: !data };
}

function getDefaultNavigation() {
  return {
    logo: {
      url: "https://res.cloudinary.com/dwwypumxh/image/upload/v1762531629/NFS_Logo_PNG_z5qisi.png",
      alt: "Nischal Fancy Store",
      link: "/"
    },
    menuItems: [
      { id: "shop", label: "Shop", link: "/shop", enabled: true, order: 1 },
      { id: "categories", label: "Categories", link: "/categories", enabled: true, order: 2 },
      { id: "new-arrivals", label: "New Arrivals", link: "/new-arrivals", enabled: true, order: 3 },
      { id: "sale", label: "Sale", link: "/sale", enabled: true, order: 4 }
    ]
  };
}
