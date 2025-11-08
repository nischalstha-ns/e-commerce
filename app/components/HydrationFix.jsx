'use client';

import { useEffect, useState } from 'react';

export default function HydrationFix({ children }) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // Clean up browser extension attributes
    const cleanupExtensionAttributes = () => {
      document.querySelectorAll('[bis_skin_checked]').forEach(el => {
        el.removeAttribute('bis_skin_checked');
      });
    };
    
    cleanupExtensionAttributes();
    setIsClient(true);
    
    // Continue cleanup after hydration
    const observer = new MutationObserver(cleanupExtensionAttributes);
    observer.observe(document.body, { 
      attributes: true, 
      subtree: true, 
      attributeFilter: ['bis_skin_checked'] 
    });
    
    return () => observer.disconnect();
  }, []);

  if (!isClient) {
    return (
      <div suppressHydrationWarning style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        Loading...
      </div>
    );
  }

  return (
    <>
      {children}
    </>
  );
}