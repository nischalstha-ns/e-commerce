export async function clearAllCaches() {
  if (typeof window === 'undefined') return;

  try {
    // Clear service worker caches
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      );
    }

    // Clear localStorage
    localStorage.clear();

    // Clear sessionStorage
    sessionStorage.clear();

    // Force page reload
    window.location.reload(true);
  } catch (error) {
    console.error('Error clearing caches:', error);
  }
}

export function addCacheBuster(url) {
  if (!url) return url;
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}t=${Date.now()}`;
}

export function disableBrowserCache() {
  if (typeof window === 'undefined') return;

  // Prevent caching
  const meta = document.createElement('meta');
  meta.httpEquiv = 'Cache-Control';
  meta.content = 'no-cache, no-store, must-revalidate';
  document.head.appendChild(meta);

  const meta2 = document.createElement('meta');
  meta2.httpEquiv = 'Pragma';
  meta2.content = 'no-cache';
  document.head.appendChild(meta2);

  const meta3 = document.createElement('meta');
  meta3.httpEquiv = 'Expires';
  meta3.content = '0';
  document.head.appendChild(meta3);
}
