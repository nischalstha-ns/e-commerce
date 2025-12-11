# 🔧 Configuration Guide

## ✅ All Hardcoded Values Removed

All configurations are now dynamic and controlled through `.env.local` file.

---

## 📝 Environment Variables

### **Site Configuration**

| Variable | Description | Default | Example |
|----------|-------------|---------|---------|
| `NEXT_PUBLIC_SITE_NAME` | Your store name | `E-Commerce Store` | `"Nischal Fancy Store (NFS)"` |
| `NEXT_PUBLIC_SITE_DESCRIPTION` | Store description for SEO | `Your trusted online store` | `"Quality products with fast delivery"` |
| `NEXT_PUBLIC_SEO_KEYWORDS` | SEO keywords | `ecommerce, online store` | `"fashion, clothing, accessories"` |
| `NEXT_PUBLIC_LOGO_URL` | Logo image URL | `/logo.png` | `"https://cdn.example.com/logo.png"` |
| `NEXT_PUBLIC_FAVICON_URL` | Favicon URL | `/favicon.ico` | `"/favicon.ico"` |
| `NEXT_PUBLIC_THEME_COLOR` | Browser theme color | `#000000` | `"#3B82F6"` |

### **Currency**

| Variable | Description | Default | Example |
|----------|-------------|---------|---------|
| `NEXT_PUBLIC_CURRENCY` | Currency name | `Rs.` | `"USD"` |
| `NEXT_PUBLIC_CURRENCY_SYMBOL` | Currency symbol | `Rs.` | `"$"` |

### **Contact Information**

| Variable | Description | Default | Example |
|----------|-------------|---------|---------|
| `NEXT_PUBLIC_SUPPORT_EMAIL` | Support email | `support@store.com` | `"help@yourstore.com"` |
| `NEXT_PUBLIC_SUPPORT_PHONE` | Support phone | - | `"+1-234-567-8900"` |

### **Social Media**

| Variable | Description | Default | Example |
|----------|-------------|---------|---------|
| `NEXT_PUBLIC_FACEBOOK_URL` | Facebook page URL | - | `"https://facebook.com/yourstore"` |
| `NEXT_PUBLIC_INSTAGRAM_URL` | Instagram profile URL | - | `"https://instagram.com/yourstore"` |
| `NEXT_PUBLIC_TWITTER_URL` | Twitter profile URL | - | `"https://twitter.com/yourstore"` |
| `NEXT_PUBLIC_TWITTER_HANDLE` | Twitter handle | - | `"@yourstore"` |

### **Features (Enable/Disable)**

| Variable | Description | Default | Values |
|----------|-------------|---------|--------|
| `NEXT_PUBLIC_ENABLE_CART` | Enable shopping cart | `true` | `true` / `false` |
| `NEXT_PUBLIC_ENABLE_WISHLIST` | Enable wishlist | `true` | `true` / `false` |
| `NEXT_PUBLIC_ENABLE_REVIEWS` | Enable product reviews | `true` | `true` / `false` |

### **Pagination**

| Variable | Description | Default | Example |
|----------|-------------|---------|---------|
| `PRODUCTS_PER_PAGE` | Products per page | `12` | `"24"` |
| `ORDERS_PER_PAGE` | Orders per page | `20` | `"50"` |

### **Rate Limiting**

| Variable | Description | Default | Example |
|----------|-------------|---------|---------|
| `RATE_LIMIT_REQUESTS` | Max requests | `100` | `"200"` |
| `RATE_LIMIT_WINDOW` | Time window (ms) | `60000` | `"120000"` |

### **Firebase (Required)**

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase API key |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase auth domain |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firebase project ID |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Firebase storage bucket |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging sender ID |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Firebase app ID |
| `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` | Firebase measurement ID |

### **Cloudinary (Required)**

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET` | Cloudinary upload preset |
| `NEXT_PUBLIC_CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret (server-side) |

### **Redis (Optional)**

| Variable | Description |
|----------|-------------|
| `REDIS_URL` | Redis connection URL |
| `REDIS_PASSWORD` | Redis password |

### **Admin**

| Variable | Description |
|----------|-------------|
| `ADMIN_EMAIL` | Admin email for notifications |

### **SEO**

| Variable | Description |
|----------|-------------|
| `GOOGLE_SITE_VERIFICATION` | Google site verification code |

### **Email (Optional)**

| Variable | Description | Default |
|----------|-------------|---------|
| `EMAIL_HOST` | SMTP host | `smtp.gmail.com` |
| `EMAIL_PORT` | SMTP port | `587` |
| `EMAIL_USER` | SMTP username | - |
| `EMAIL_PASSWORD` | SMTP password | - |
| `EMAIL_FROM` | From email address | - |

### **Application**

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_APP_URL` | Application URL | `http://localhost:3000` |
| `NODE_ENV` | Environment | `development` |

---

## 🎯 What Changed

### **Before (Hardcoded):**
```javascript
// ❌ Hardcoded in code
const siteName = "Nischal Fancy Store (NFS)";
const logoUrl = "https://res.cloudinary.com/...";
const themeColor = "#000000";
```

### **After (Dynamic):**
```javascript
// ✅ From environment variables
const siteName = process.env.NEXT_PUBLIC_SITE_NAME || 'E-Commerce Store';
const logoUrl = process.env.NEXT_PUBLIC_LOGO_URL || '/logo.png';
const themeColor = process.env.NEXT_PUBLIC_THEME_COLOR || '#000000';
```

---

## 📁 Files Updated

1. ✅ `app/layout.tsx` - Site metadata
2. ✅ `app/components/Header.jsx` - Logo & branding
3. ✅ `app/admin/components/Header.jsx` - Admin header
4. ✅ `app/admin/components/sidebar.jsx` - Admin sidebar
5. ✅ `lib/config/app.config.ts` - Centralized config (NEW)
6. ✅ `.env.local` - Main configuration
7. ✅ `.env.example` - Configuration template

---

## 🚀 Quick Setup

### Step 1: Copy Environment File
```bash
cp .env.example .env.local
```

### Step 2: Customize Your Store
Edit `.env.local`:

```env
# Your Store Information
NEXT_PUBLIC_SITE_NAME="My Awesome Store"
NEXT_PUBLIC_SITE_DESCRIPTION="Best products at great prices"
NEXT_PUBLIC_LOGO_URL="https://yourcdn.com/logo.png"
NEXT_PUBLIC_THEME_COLOR="#3B82F6"

# Your Currency
NEXT_PUBLIC_CURRENCY="USD"
NEXT_PUBLIC_CURRENCY_SYMBOL="$"

# Your Contact
NEXT_PUBLIC_SUPPORT_EMAIL="support@mystore.com"
NEXT_PUBLIC_SUPPORT_PHONE="+1-234-567-8900"

# Your Social Media
NEXT_PUBLIC_FACEBOOK_URL="https://facebook.com/mystore"
NEXT_PUBLIC_INSTAGRAM_URL="https://instagram.com/mystore"
```

### Step 3: Add Firebase Credentials
```env
NEXT_PUBLIC_FIREBASE_API_KEY="your_actual_key"
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your_domain"
# ... etc
```

### Step 4: Run Development Server
```bash
npm run dev
```

---

## 🎨 Branding Customization

### Change Logo
```env
NEXT_PUBLIC_LOGO_URL="https://yourcdn.com/your-logo.png"
```

### Change Store Name
```env
NEXT_PUBLIC_SITE_NAME="Your Store Name"
```

### Change Theme Color
```env
NEXT_PUBLIC_THEME_COLOR="#FF5733"
```

### Change Currency
```env
NEXT_PUBLIC_CURRENCY="EUR"
NEXT_PUBLIC_CURRENCY_SYMBOL="€"
```

---

## 🔧 Feature Toggles

### Disable Cart
```env
NEXT_PUBLIC_ENABLE_CART="false"
```

### Disable Wishlist
```env
NEXT_PUBLIC_ENABLE_WISHLIST="false"
```

### Disable Reviews
```env
NEXT_PUBLIC_ENABLE_REVIEWS="false"
```

---

## 📊 Performance Tuning

### Increase Products Per Page
```env
PRODUCTS_PER_PAGE="24"
```

### Adjust Rate Limiting
```env
RATE_LIMIT_REQUESTS="200"
RATE_LIMIT_WINDOW="120000"
```

---

## 🌍 Multi-Store Setup

You can run multiple stores with different configurations:

### Store 1 (.env.local)
```env
NEXT_PUBLIC_SITE_NAME="Fashion Store"
NEXT_PUBLIC_LOGO_URL="/fashion-logo.png"
NEXT_PUBLIC_THEME_COLOR="#FF1493"
```

### Store 2 (.env.production)
```env
NEXT_PUBLIC_SITE_NAME="Electronics Store"
NEXT_PUBLIC_LOGO_URL="/electronics-logo.png"
NEXT_PUBLIC_THEME_COLOR="#0000FF"
```

---

## ✅ Verification

Check if configuration is loaded:

```bash
# Start dev server
npm run dev

# Check browser console
# Should see your custom site name in title
# Should see your custom logo
# Should see your custom theme color
```

---

## 🎉 Benefits

✅ **No Hardcoded Values** - Everything configurable  
✅ **Easy Branding** - Change logo, name, colors instantly  
✅ **Multi-Store Ready** - Different configs per environment  
✅ **Feature Flags** - Enable/disable features easily  
✅ **SEO Friendly** - Dynamic metadata  
✅ **Production Ready** - Environment-specific configs  

---

**Last Updated:** December 2024  
**Status:** ✅ Fully Dynamic Configuration
