# E-Commerce Homepage - Features & Documentation

## Overview
Professional, mobile-first e-commerce homepage with full admin control, real-time updates, and dynamic content management.

## Key Features

### 1. Mobile-First Responsive Design
- Fully responsive across mobile, tablet, and desktop
- Touch-friendly interactions on mobile devices
- Optimized layouts for all screen sizes
- Smooth animations and transitions

### 2. Dynamic Sections
- **Hero Section**: Large banner with title, subtitle, CTA buttons, and featured image
- **Features Section**: Trust badges (Free Shipping, Secure Payment, Easy Returns, Best Prices)
- **Categories Section**: Grid of product categories with images
- **Featured Products**: Curated product showcase
- **Elegance Section**: Secondary promotional banner
- **New Arrivals**: Latest products automatically displayed
- **Special Offers**: Discounted products section
- **Newsletter**: Email subscription form

### 3. Admin Control Panel
Location: `/admin/homepage`

#### Section Manager
- Drag-and-drop section reordering
- Enable/disable sections
- Real-time preview
- Section visibility control

#### Banner Manager
- Add/edit/delete hero banners
- Drag-and-drop banner reordering
- Enable/disable individual banners
- Configure banner content (title, subtitle, image, CTA)

#### Settings Control
- Hero section customization
- Category display count
- Featured products count
- Newsletter settings
- Section order management

### 4. Product Cards
- Product image with hover effects
- Product name, price, discount badge
- Star ratings and review count
- Stock availability indicator
- Quick add to cart (desktop hover)
- Mobile-optimized add to cart button
- Wishlist functionality
- Quick view option

### 5. Real-Time Updates
- All changes in admin panel reflect immediately
- Firestore real-time sync
- No page refresh required
- Live preview capability

### 6. Performance Optimizations
- Lazy loading images
- Optimized animations
- Efficient data fetching
- Memoized computations
- Minimal re-renders

### 7. SEO & Accessibility
- Semantic HTML structure
- Proper heading hierarchy
- Alt text for images
- Keyboard navigation support
- ARIA labels
- Meta tags and Open Graph

## Admin Panel Usage

### Managing Homepage Sections

1. Navigate to `/admin/homepage`
2. Use "Section Manager" tab to:
   - Drag sections to reorder
   - Toggle section visibility
   - Click settings to edit section details

### Managing Hero Banners

1. Go to "Hero Banners" tab
2. Click "Add Banner" to create new banner
3. Fill in:
   - Title
   - Subtitle
   - Image URL
   - Button text and link
4. Drag to reorder banners
5. Toggle to enable/disable
6. Click edit to modify existing banners

### Customizing Sections

Each section can be customized through Firestore:
- `settings/homepage` document
- Section-specific fields (e.g., `heroSection`, `featuredSection`)
- Control display counts, titles, subtitles, and more

## Technical Stack

- **Framework**: Next.js 16 with Turbopack
- **UI Library**: HeroUI (NextUI)
- **Database**: Firebase Firestore
- **State Management**: SWR for real-time data
- **Animations**: Framer Motion
- **Styling**: Tailwind CSS
- **Icons**: Lucide React

## File Structure

```
app/
├── page.tsx                          # Homepage entry
├── components/
│   ├── HomeContent.jsx              # Main homepage component
│   ├── ProductCard.jsx              # Product card component
│   └── Header.jsx                   # Navigation header
├── admin/
│   └── homepage/
│       ├── page.jsx                 # Admin control panel
│       └── components/
│           ├── BannerManager.jsx    # Banner management
│           ├── SectionManager.jsx   # Section ordering
│           └── NavbarControl.jsx    # Navbar settings
lib/
└── firestore/
    └── homepage/
        ├── read.js                  # Fetch homepage settings
        └── write.js                 # Update homepage settings
```

## Firestore Structure

```
settings/
└── homepage/
    ├── heroSection: { enabled, title, subtitle, ... }
    ├── featuredSection: { enabled, title, displayCount, ... }
    ├── categoriesSection: { enabled, title, displayCount, ... }
    ├── featuresSection: { enabled }
    ├── eleganceSection: { enabled, title, subtitle, ... }
    ├── newsletterSection: { enabled, title, buttonText, ... }
    ├── sectionOrder: ["hero", "features", "categories", ...]
    ├── banners: [{ id, title, subtitle, image, ... }]
    └── lastUpdated: timestamp
```

## Customization Guide

### Adding New Section

1. Update `HomeContent.jsx` - add new case in `renderSection()`
2. Add section to default settings in `lib/firestore/homepage/read.js`
3. Create admin UI in homepage control panel
4. Update Firestore structure

### Modifying Product Display

Edit in `HomeContent.jsx`:
- `featuredProducts` - change filter/sort logic
- `newArrivals` - modify sorting by timestamp
- `bestSellers` - adjust rating threshold
- `discountedProducts` - change discount criteria

### Styling Customization

All styles use Tailwind CSS classes:
- Modify color schemes in component classes
- Adjust spacing with padding/margin utilities
- Change typography with text utilities
- Update dark mode styles with `dark:` prefix

## Best Practices

1. **Images**: Use optimized images (WebP format recommended)
2. **Performance**: Keep product display counts reasonable (8-12 items)
3. **Content**: Update hero banners regularly for engagement
4. **Mobile**: Always test on mobile devices
5. **Accessibility**: Maintain proper contrast ratios
6. **SEO**: Update meta tags in `page.tsx`

## Troubleshooting

### Sections Not Showing
- Check section `enabled` status in Firestore
- Verify `sectionOrder` array includes section ID
- Ensure data exists (products, categories)

### Admin Changes Not Reflecting
- Check Firestore security rules
- Verify user has admin role
- Check browser console for errors
- Refresh page if real-time sync fails

### Performance Issues
- Reduce product display counts
- Optimize images (compress, resize)
- Check for console errors
- Clear browser cache

## Future Enhancements

- [ ] Banner slider/carousel
- [ ] Video backgrounds for hero
- [ ] Product quick view modal
- [ ] Advanced filtering
- [ ] Personalized recommendations
- [ ] A/B testing for banners
- [ ] Analytics integration
- [ ] Wishlist persistence
