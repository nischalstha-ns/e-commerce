"use client";

import { useEffect, useState } from "react";

export default function HydrationBoundary({ children, fallback = null }) {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  if (!isHydrated) {
    return fallback;
  }

  return <div suppressHydrationWarning>{children}</div>;
}