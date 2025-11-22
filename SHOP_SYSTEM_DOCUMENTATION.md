# Complete Shop Role System Documentation

## System Overview
Production-ready e-commerce shop management system with full CRUD operations, undo/redo functionality, order management, sales analytics, and comprehensive settings.

## Architecture

### Database Structure (Firestore)

```javascript
// Collections
shops/{userId}
  - shopName: string
  - description: string
  - email: string
  - phone: string
  - address: string
  - paymentDetails: string
  - deliveryFee: number
  - freeDeliveryThreshold: number
  - timestampUpdate: timestamp

products/{productId}
  - name: string
  - sku: string
  - price: number
  - salePrice: number
  - stock: number
  - status: "active" | "inactive" | "archived"
  - categoryId: string
  - brandId: string
  - imageURLs: array
  - imageURL: string
  - description: string
  - timestampCreate: timestamp
  - timestampUpdate: timestamp

orders/{orderId}
  - items: array
  - total: number
  - status: "pending" | "accepted" | "rejected" | "shipped" | "delivered"
  - type: "pos" | "online"
  - paymentMethod: "cash" | "card" | "upi"
  - customerId: string (optional)
  - timestampCreate: timestamp
  - timestampUpdate: timestamp
```

### State Management (Zustand)

```javascript
// Undo/Redo Store
undoStack: [] // Last 50 actions
redoStack: [] // Redoable actions
addAction(action) // Add to undo stack
undo() // Undo last action
redo() // Redo last undone action

// History Store
history: [] // Last 50 activities
addHistory(item) // Track activity
getRecentHistory(count) // Get recent items

// Language Store
language: "en" | "ne"
setLanguage(lang) // Switch language
```

## Features Implementation

### 1. Dashboard (`/admin/shop-dashboard`)

**Stats Cards:**
- Total Products
- Active Products
- Pending Orders
- Today's Sales (count)
- Total Revenue (today)
- Low Stock Alert (≤10 items)

**Components:**
- Undo/Redo buttons (top right)
- Low stock products list (top 5)
- Recent sales list (last 5)
- Activity log (last 10 actions)

**Functions:**
```javascript
handleUndo() // Restore deleted/updated products
handleRedo() // Reapply undone actions
```

### 2. POS System (`/admin/pos`)

**Features:**
- Product grid with search
- Barcode/SKU scanner
- Shopping cart with quantity controls
- Payment method selection (Cash/Card/UPI)
- Receipt generation with print
- Automatic stock updates

**Workflow:**
1. Search/scan product
2. Add to cart
3. Adjust quantities
4. Select payment method
5. Complete sale
6. Print receipt
7. Stock auto-updated

**Functions:**
```javascript
addToCart(product) // Add product to cart
updateQuantity(id, qty) // Update item quantity
handleBarcodeSearch() // Search by barcode/SKU
handleCheckout() // Process sale, update stock, create order
```

### 3. Product Management (`/admin/products`)

**Features:**
- Grid view with cards
- Search & filter
- Add/Edit/Delete products
- Stock adjustment modal
- Bulk actions (delete, archive)
- CSV export
- Archive view toggle
- Undo/Redo tracking

**Product Card:**
- Image with fallback
- Name, category, price
- Stock status badge (In Stock/Low Stock/Out of Stock)
- View/Edit/Delete buttons

**Stock Adjustment:**
- Current vs New stock
- Reason selection (Recount/Damaged/Returned/Other)
- Notes field
- History tracking

**Functions:**
```javascript
handleAddProduct() // Open add modal
handleEditProduct(product) // Open edit modal
handleDeleteProduct(id) // Delete with undo tracking
handleArchiveProduct(id) // Archive product
handleBulkDelete() // Delete selected products
handleExportCSV() // Export products to CSV
handleStockAdjustment() // Manual stock correction
```

### 4. Order Management (`/admin/orders`)

**Features:**
- Order list with status badges
- Search by order ID or customer email
- Filter by status
- Accept/Reject pending orders
- Mark as shipped
- Order detail modal

**Order Statuses:**
- Pending (yellow) → Accept/Reject
- Accepted (blue) → Mark Shipped
- Shipped (purple)
- Delivered (green)
- Rejected (red)

**Functions:**
```javascript
handleUpdateStatus(id, status) // Update order status
// Statuses: pending → accepted → shipped → delivered
```

### 5. Shop Settings (`/admin/settings`)

**Sections:**

**Shop Profile:**
- Shop name
- Description
- Contact email
- Contact phone
- Address

**Payment Details:**
- Bank account info
- Payment methods

**Delivery Settings:**
- Delivery fee
- Free delivery threshold

**Functions:**
```javascript
handleSubmit() // Save all settings to Firestore
```

### 6. History & Undo/Redo System

**Tracked Actions:**
- Product create/update/delete
- Stock adjustments
- Price changes
- Image updates
- Category changes
- Order status updates
- Sales transactions

**Implementation:**
```javascript
// Add action to undo stack
addUndoAction({
  type: 'delete',
  data: product,
  previousData: null,
  timestamp: Date.now()
});

// Undo logic
const action = undo();
if (action.type === 'delete') {
  await createNewProduct({ data: action.data });
}

// Redo logic
const action = redo();
if (action.type === 'create') {
  await createNewProduct({ data: action.data });
}
```

## Security

### Firestore Rules
```javascript
// Shop role can read/write products
match /products/{productId} {
  allow read: if true;
  allow write: if request.auth != null && 
    (get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == "admin" ||
     get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == "shop");
}

// Shop role can read/write orders
match /orders/{orderId} {
  allow read, write: if request.auth != null && 
    (get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == "admin" ||
     get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == "shop");
}

// Shop profile - own data only
match /shops/{userId} {
  allow read, write: if request.auth != null && request.auth.uid == userId;
}
```

### Input Validation
- Product data validation (name, price, stock)
- Rate limiting on write operations
- Sanitized inputs
- File upload validation

## Performance Optimizations

1. **React Optimizations:**
   - React.memo for product cards
   - useCallback for event handlers
   - useTransition for search
   - useMemo for filtered data

2. **Firestore Optimizations:**
   - Real-time subscriptions with SWR
   - Query limits (100 products)
   - keepPreviousData for smooth UX
   - Indexed queries

3. **Image Optimizations:**
   - Lazy loading
   - Error fallbacks
   - Placeholder images

4. **Code Splitting:**
   - Lazy loaded modals
   - Dynamic imports

## Responsive Design

**Breakpoints:**
- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

**Mobile Features:**
- Collapsible sidebar
- Touch-friendly buttons
- Stacked layouts
- Simplified navigation

## Internationalization

**Supported Languages:**
- English (en)
- Nepali (ne)

**Translation Coverage:**
- All UI text
- Form labels
- Button text
- Toast messages
- Status labels

**Usage:**
```javascript
const t = useTranslation();
<button>{t.addProduct}</button>
```

## API Routes (Future Enhancement)

```javascript
// Product search
GET /api/products/search?q=term&limit=20

// Bulk operations
POST /api/products/bulk-delete
POST /api/products/bulk-archive

// CSV import
POST /api/products/import-csv

// Analytics
GET /api/analytics/sales?period=today|week|month
```

## Best Practices

1. **Error Handling:**
   - Try-catch blocks
   - User-friendly error messages
   - Fallback UI

2. **Loading States:**
   - Skeleton screens
   - Loading spinners
   - Disabled buttons during operations

3. **User Feedback:**
   - Toast notifications
   - Success/error messages
   - Confirmation dialogs

4. **Data Persistence:**
   - LocalStorage for preferences
   - Firestore for data
   - Optimistic updates

5. **Code Organization:**
   - Modular components
   - Reusable hooks
   - Centralized state management

## Testing Checklist

- [ ] Add product with all fields
- [ ] Edit product and verify changes
- [ ] Delete product and undo
- [ ] Adjust stock with reason
- [ ] Complete POS sale
- [ ] Accept/reject order
- [ ] Mark order as shipped
- [ ] Export products to CSV
- [ ] Update shop settings
- [ ] Test barcode scanner
- [ ] Print receipt
- [ ] Switch language
- [ ] Test on mobile device
- [ ] Test dark mode
- [ ] Verify undo/redo functionality

## Deployment

1. **Environment Variables:**
```env
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

2. **Build:**
```bash
npm run build
```

3. **Deploy:**
```bash
vercel deploy --prod
```

## Future Enhancements

1. Staff access control with permissions
2. Bulk CSV import
3. Advanced analytics dashboard
4. Inventory forecasting
5. Multi-location support
6. Barcode printing
7. Email notifications
8. SMS alerts
9. Mobile app (React Native)
10. API for third-party integrations

## Support

For issues or questions:
- Check Firestore rules
- Verify user role is "shop"
- Check browser console for errors
- Review activity log for actions
- Test with sample data first
