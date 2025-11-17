# Cache Clearing Fix - Homepage Data Updates

## Problem
Previous data was showing on the homepage even after admin panel changes were saved.

## Root Cause
Browser and Next.js caching was preventing fresh data from loading.

## Solution Implemented

### 1. Disabled Homepage Caching (`next.config.js`)
Added cache control headers to prevent browser caching:
```javascript
headers: async () => {
  return [
    {
      source: '/',
      headers: [
        { key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate, max-age=0' },
        { key: 'Pragma', value: 'no-cache' },
        { key: 'Expires', value: '0' }
      ]
    }
  ]
}
```

### 2. Added Cache-Busting to Data Fetching (`lib/firestore/homepage/read.js`)
- Added timestamp to SWR key: `homepage-settings-${Date.now()}`
- Enabled `revalidateOnFocus: true` - refreshes when window regains focus
- Set `refreshInterval: 5000` - auto-refresh every 5 seconds
- Set `dedupingInterval: 0` - no deduplication

### 3. Added Cache-Busting to Image URLs (`app/components/HomeContent.jsx`)
All image URLs now include timestamp query parameter:
```javascript
<img src={`${imageUrl}?t=${Date.now()}`} />
```

### 4. Added Auto-Refresh on Component Mount
```javascript
useEffect(() => {
  if (mutate) {
    mutate(); // Force refresh on mount
  }
}, [mutate]);

// Refresh every 5 seconds
useEffect(() => {
  const interval = setInterval(() => {
    if (mutate) mutate();
  }, 5000);
  return () => clearInterval(interval);
}, [mutate]);
```

### 5. Added Cache Clearing Utility (`lib/utils/clearCache.js`)
Functions to manually clear all caches:
- `clearAllCaches()` - Clears service worker caches, localStorage, sessionStorage
- `addCacheBuster(url)` - Adds timestamp to any URL
- `disableBrowserCache()` - Adds meta tags to prevent caching

### 6. Added "Clear Cache" Button in Admin Panel
New button in `/admin/homepage` that:
- Clears all service worker caches
- Clears localStorage
- Clears sessionStorage
- Reloads the page with fresh data

## How It Works Now

### When Admin Makes Changes:
1. Admin edits section in `/admin/homepage`
2. Changes saved to Firestore
3. Admin clicks "Save All Changes"
4. Homepage automatically refreshes every 5 seconds
5. Fresh data loads with cache-busting timestamps

### When User Visits Homepage:
1. Browser receives `no-cache` headers
2. SWR hook fetches fresh data from Firestore
3. Images load with timestamp query parameters
4. Data auto-refreshes every 5 seconds
5. No stale data is displayed

### Manual Cache Clear:
1. Admin clicks "Clear Cache" button in homepage control
2. All browser caches cleared
3. Page reloads with fresh data
4. Users see latest changes immediately

## Testing

### To verify the fix:

1. **Edit Homepage in Admin**
   - Go to `/admin/homepage`
   - Change Hero title to "Test Title"
   - Click "Save All Changes"

2. **Check Homepage**
   - Go to `/`
   - Should see new title within 5 seconds
   - If not, click "Clear Cache" in admin panel

3. **Verify Cache Busting**
   - Open browser DevTools (F12)
   - Go to Network tab
   - Refresh homepage
   - Images should have `?t=timestamp` in URL
   - No 304 Not Modified responses

4. **Test Manual Clear**
   - Make a change in admin
   - Click "Clear Cache" button
   - Homepage should reload with fresh data

## Files Modified

1. `next.config.js` - Added cache control headers
2. `lib/firestore/homepage/read.js` - Added cache-busting and auto-refresh
3. `app/components/HomeContent.jsx` - Added timestamp to image URLs and auto-refresh
4. `lib/utils/clearCache.js` - Created cache clearing utilities
5. `app/admin/homepage/page.jsx` - Added "Clear Cache" button

## Cache Control Strategy

| Layer | Method | Interval |
|-------|--------|----------|
| HTTP Headers | no-cache, no-store | Always |
| SWR Key | Timestamp | Every request |
| Image URLs | Query parameter | Every render |
| Auto-refresh | Interval | 5 seconds |
| Manual | Button click | On demand |

## Performance Impact

- **Minimal**: Cache-busting only affects homepage
- **5-second refresh**: Negligible performance impact
- **Timestamp queries**: Prevents CDN caching but ensures freshness
- **Manual clear**: Only when needed

## Browser Compatibility

Works on all modern browsers:
- Chrome/Edge (Chromium)
- Firefox
- Safari
- Mobile browsers

## Troubleshooting

### Changes still not showing:
1. Click "Clear Cache" button in admin panel
2. Hard refresh browser (Ctrl+Shift+R)
3. Check Firestore console for data

### Images not updating:
1. Verify image URL changed in admin panel
2. Check browser Network tab for timestamp in URL
3. Clear browser cache manually

### Auto-refresh not working:
1. Check browser console for errors
2. Verify Firestore connection
3. Check if user is logged in as admin

## Future Improvements

- Add webhook to clear cache on Firestore updates
- Implement Redis caching layer
- Add CDN cache invalidation
- Implement stale-while-revalidate strategy
