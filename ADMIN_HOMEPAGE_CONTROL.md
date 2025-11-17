# Admin Homepage Control - Complete Management Guide

## Overview
The homepage is now **100% controlled by the admin panel**. Every section, text, image, button, and styling is managed from `/admin/homepage`.

## How It Works

### Architecture
```
Admin Panel (/admin/homepage)
    ↓
Edit Sections (Hero, Elegance, Features, Categories, Featured, Newsletter)
    ↓
Save to Firestore (settings/homepage)
    ↓
Homepage fetches real-time data
    ↓
Renders only enabled sections in configured order
```

## Admin Panel Features

### 1. Hero Section Control
**Location**: `/admin/homepage` → Hero Section

**Editable Fields**:
- ✅ Title
- ✅ Subtitle
- ✅ Primary Button Text & Link
- ✅ Secondary Button Text & Link
- ✅ Featured Image URL
- ✅ Background Image URL
- ✅ Overlay Opacity (0-100%)
- ✅ Text Alignment (Left/Center/Right)
- ✅ Background Color (Color Picker)
- ✅ Text Color (Color Picker)
- ✅ Enable/Disable Toggle

**Live Preview**: Real-time preview of all changes

### 2. Elegance Section Control
**Location**: `/admin/homepage` → Elegance

**Editable Fields**:
- ✅ Title
- ✅ Subtitle
- ✅ Primary Button Text & Link
- ✅ Secondary Button Text & Link
- ✅ Featured Image URL
- ✅ Background Image URL
- ✅ Overlay Opacity
- ✅ Text Alignment
- ✅ Background Color
- ✅ Text Color
- ✅ Enable/Disable Toggle

### 3. Features Section Control
**Location**: `/admin/homepage` → Features

**Editable Fields**:
- ✅ Section Title
- ✅ Section Subtitle
- ✅ Add/Edit/Delete Features
- ✅ Feature Icon (Emoji or Icon)
- ✅ Feature Title
- ✅ Feature Description
- ✅ Enable/Disable Toggle

### 4. Categories Section Control
**Location**: `/admin/homepage` → Categories

**Editable Fields**:
- ✅ Section Title
- ✅ Section Subtitle
- ✅ Display Count (how many categories to show)
- ✅ Enable/Disable Toggle

**Note**: Categories are pulled from your products database

### 5. Featured Products Section Control
**Location**: `/admin/homepage` → Featured Products

**Editable Fields**:
- ✅ Section Title
- ✅ Section Subtitle
- ✅ Display Count (how many products to show)
- ✅ Enable/Disable Toggle

**Note**: Products are pulled from your products database

### 6. Newsletter Section Control
**Location**: `/admin/homepage` → Newsletter

**Editable Fields**:
- ✅ Section Title
- ✅ Section Subtitle
- ✅ Button Text
- ✅ Disclaimer Text
- ✅ Enable/Disable Toggle

## Global Controls

### Section Management
- **Enable/Disable**: Toggle any section on/off
- **Reorder Sections**: Drag to reorder section display order
- **Section Summary**: View all enabled sections

### Performance Settings
- **Enable Caching**: Toggle caching on/off
- **Optimize Images**: Auto-optimize images
- **Lazy Loading**: Enable lazy loading
- **Minify Assets**: Minify CSS/JS

### Theme Settings
- **Dark Mode Toggle**: Show/hide dark mode button
- **Custom Fonts**: Use custom fonts
- **Page Title**: Set page title
- **Meta Description**: Set SEO meta description

## How to Use

### Edit a Section

1. **Go to Admin Panel**
   ```
   Navigate to /admin/homepage
   ```

2. **Select Section**
   ```
   Click on section name in left sidebar
   (Hero, Elegance, Features, Categories, Featured, Newsletter)
   ```

3. **Edit Fields**
   ```
   Update any field (title, subtitle, images, buttons, etc.)
   ```

4. **Live Preview**
   ```
   See changes in real-time preview
   ```

5. **Save Changes**
   ```
   Click "Save All Changes" button
   OR enable "Auto Save" for automatic saving
   ```

6. **View on Homepage**
   ```
   Click "Preview Homepage" to see live changes
   OR visit / to see updated homepage
   ```

### Enable/Disable Sections

1. **In Admin Panel**
   ```
   Find section in left sidebar
   ```

2. **Toggle Switch**
   ```
   Click the toggle switch next to section name
   ```

3. **Automatic Save**
   ```
   Changes save immediately
   ```

4. **Homepage Updates**
   ```
   Section appears/disappears on homepage within 5 seconds
   ```

### Reorder Sections

1. **Go to Section Order**
   ```
   In left sidebar, find "Section Order"
   ```

2. **Use Arrow Buttons**
   ```
   Click ↑ to move section up
   Click ↓ to move section down
   ```

3. **Changes Apply**
   ```
   Homepage sections reorder automatically
   ```

### Clear Cache

1. **Click "Clear Cache" Button**
   ```
   In top right of admin panel
   ```

2. **Page Reloads**
   ```
   Browser cache cleared
   All data refreshed
   ```

## Data Flow

### When Admin Makes Changes:
```
1. Admin edits field in admin panel
2. Changes saved to Firestore (settings/homepage)
3. Homepage hook detects change (real-time subscription)
4. Homepage re-renders with new data
5. User sees changes within 5 seconds
```

### When User Visits Homepage:
```
1. Homepage loads
2. Fetches settings from Firestore
3. Renders only enabled sections
4. Displays in configured order
5. Shows all admin-configured content
```

## What's Controlled by Admin

### ✅ Fully Admin Controlled
- All section titles and subtitles
- All button text and links
- All images and backgrounds
- All colors and styling
- Section visibility (enable/disable)
- Section order
- Display counts
- Feature icons and descriptions
- Newsletter text

### ❌ NOT Admin Controlled (System)
- Product data (managed in Products section)
- Category data (managed in Categories section)
- Footer links (static)
- Header navigation (static)

## Real-Time Updates

### Auto-Refresh
- Homepage refreshes every 5 seconds
- Detects changes automatically
- No manual refresh needed

### Manual Refresh
- Click "Preview Homepage" button
- Hard refresh browser (Ctrl+Shift+R)
- Click "Clear Cache" button

## Best Practices

### 1. Image URLs
- Use HTTPS URLs only
- Recommended: Cloudinary URLs
- Format: `https://res.cloudinary.com/...`

### 2. Button Links
- Use relative paths: `/shop`, `/about`
- Or full URLs: `https://example.com`

### 3. Text Content
- Keep titles concise (under 50 chars)
- Subtitles can be longer (under 200 chars)
- Use clear, compelling language

### 4. Colors
- Use hex format: `#ffffff`
- Test contrast for accessibility
- Ensure readability on both light/dark modes

### 5. Display Counts
- Categories: 3-6 recommended
- Products: 4-12 recommended
- Too many = slower loading

## Troubleshooting

### Changes Not Appearing
1. Click "Clear Cache" button
2. Hard refresh browser (Ctrl+Shift+R)
3. Wait 5 seconds for auto-refresh
4. Check Firestore console for data

### Images Not Loading
1. Verify image URL is correct
2. Check URL is HTTPS
3. Verify image still exists at URL
4. Try different image URL

### Section Not Showing
1. Check if section is enabled
2. Verify section has content
3. Check section order
4. Clear cache and refresh

### Auto-Save Not Working
1. Check "Auto Save" toggle is ON
2. Verify user is logged in as admin
3. Check browser console for errors
4. Try manual save instead

## Admin Panel Buttons

| Button | Function |
|--------|----------|
| Preview Homepage | Opens homepage in new tab |
| Clear Cache | Clears all browser caches |
| Test Connection | Tests Firebase connection |
| Save All Changes | Saves all changes to Firestore |
| Auto Save | Enables automatic saving |

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| Ctrl+S | Save changes (if implemented) |
| Ctrl+Shift+R | Hard refresh browser |
| F12 | Open developer tools |

## API Endpoints Used

- `GET /api/homepage-settings` - Fetch settings
- `POST /api/homepage-settings` - Save settings
- `PUT /api/homepage-settings/{section}` - Update section

## Security

- Only admins can edit homepage
- Changes require admin authentication
- All data validated before saving
- Real-time updates via Firestore

## Performance

- Real-time updates (5-second refresh)
- Cache-busting for fresh data
- Optimized image loading
- Lazy loading support

## Future Enhancements

- [ ] Drag-and-drop section reordering
- [ ] Template library
- [ ] A/B testing
- [ ] Analytics integration
- [ ] Scheduled publishing
- [ ] Version history
- [ ] Undo/Redo functionality
